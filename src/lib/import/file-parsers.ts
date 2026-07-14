/**
 * All parsing libraries here are loaded via dynamic `import()` INSIDE these
 * functions — never at the top of the file. This is deliberate: both `xlsx`
 * and especially `pdfjs-dist` are known to cause build/SSR crashes in
 * Next.js when statically imported, because Next.js tries to evaluate
 * "use client" modules on the server too. Loading them only at the moment
 * they're actually called (inside a file-upload event handler, which only
 * ever runs in the browser) sidesteps that entirely — the same pattern this
 * project already uses successfully for the 3D digital twin.
 */

export type ParsedRow = Record<string, string>;

/** Parses .csv, .xlsx, and .xls files into an array of row objects keyed by column header. */
export async function parseSpreadsheetFile(file: File): Promise<ParsedRow[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as ParsedRow[];
  return rows;
}

/**
 * Extracts text from a PDF and scans it for "Label: Value" style lines
 * (e.g. "Marketing Budget: $18,000" or "Employees - 24"). This is
 * best-effort — PDF layout varies a lot, so results should always be shown
 * to the person for review rather than trusted blindly.
 */
export async function parsePdfFile(file: File): Promise<ParsedRow> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    fullText += pageText + "\n";
  }

  const row: ParsedRow = {};
  const lines = fullText
    .split(/\n|\r/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Matches lines like "Marketing Budget: $18,000", "Employees - 24", "Discount   5%"
  const labelValuePattern = /^([A-Za-z][A-Za-z\s%/]{2,45}?)[\s:–—-]+\$?\s*([\d,]+\.?\d*)\s*%?\s*$/;

  for (const line of lines) {
    const match = line.match(labelValuePattern);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (label.length >= 3 && value.length > 0) {
        row[label] = value;
      }
    }
  }

  return row;
}

export function getFileKind(file: File): "spreadsheet" | "pdf" | "unsupported" {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) return "spreadsheet";
  if (name.endsWith(".pdf")) return "pdf";
  return "unsupported";
}