"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBusinessStore } from "@/lib/store/business-store";
import { getFileKind, parsePdfFile, parseSpreadsheetFile } from "@/lib/import/file-parsers";
import { mapRowToBusinessInputs, MatchedField } from "@/lib/import/business-data-mapper";
import { getMetricSpec, generateGoalAdvice, GoalAdvice } from "@/lib/agents/goal-advisor";
import { SimulationEngine } from "@/lib/simulation/engine";

type Status = "idle" | "parsing" | "done" | "error";

export default function ImportDataPage() {
  const { inputs, updateInputs } = useBusinessStore();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [matchedFields, setMatchedFields] = useState<MatchedField[]>([]);
  const [unmatchedCount, setUnmatchedCount] = useState(0);
  const [profitAdvice, setProfitAdvice] = useState<GoalAdvice | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("parsing");
    setErrorMessage("");
    setFileName(file.name);

    try {
      const kind = getFileKind(file);
      let row: Record<string, string> = {};

      if (kind === "spreadsheet") {
        const rows = await parseSpreadsheetFile(file);
        if (rows.length === 0) throw new Error("That file doesn't seem to have any rows we could read.");
        row = rows[rows.length - 1];
      } else if (kind === "pdf") {
        row = await parsePdfFile(file);
        if (Object.keys(row).length === 0) {
          throw new Error("Couldn't find any labeled numbers in that PDF. PDF extraction works best on simple reports with lines like \"Marketing Budget: $18,000\" — try a CSV or Excel export instead if this keeps happening.");
        }
      } else {
        throw new Error("Unsupported file type — please upload a .csv, .xlsx, .xls, or .pdf file.");
      }

      const { patch, matched, unmatchedFieldCount } = mapRowToBusinessInputs(row);

      if (matched.length === 0) {
        throw new Error("We couldn't match any recognizable business fields in that file. Try column headers like \"Price\", \"Marketing Budget\", \"Employees\", \"Inventory\", etc.");
      }

      updateInputs(patch);
      setMatchedFields(matched);
      setUnmatchedCount(unmatchedFieldCount);

      const nextInputs = { ...inputs, ...patch };
      const profitMetric = getMetricSpec("profitMargin");
      if (profitMetric) {
        const advice = generateGoalAdvice(profitMetric, nextInputs);
        setProfitAdvice(advice);
      }

      setStatus("done");
    } catch (err) {
      setErrorMessage((err as Error).message || "Something went wrong reading that file.");
      setStatus("error");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const currentResult = SimulationEngine.run(inputs);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Business Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a spreadsheet or report and Nexus OS will map it onto your digital twin, then surface real ways to improve profit.
        </p>
      </div>

      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`p-10 flex flex-col items-center justify-center text-center border-2 border-dashed transition-colors cursor-pointer ${
          isDragging ? "border-violet-400 bg-violet-500/5" : "border-white/10 hover:border-white/20"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 border border-white/10 flex items-center justify-center mb-4">
          <Upload className="h-6 w-6 text-violet-300" />
        </div>
        <p className="text-sm font-medium text-foreground">Drop a file here, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1.5">Supports .csv, .xlsx, .xls, and .pdf</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> Spreadsheets</span>
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> PDF reports</span>
        </div>
      </Card>

      {status === "parsing" && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground animate-pulse">Reading {fileName}…</p>
        </Card>
      )}

      {status === "error" && (
        <Card className="p-6 border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Couldn&apos;t process that file</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {status === "done" && (
        <>
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Detected {matchedFields.length} of {matchedFields.length + unmatchedCount} business levers from {fileName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  These values have been applied to your simulation. Fields we couldn&apos;t find keep their previous values.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {matchedFields.map((f) => (
                <div key={f.key} className="rounded-lg bg-white/[0.02] border border-white/10 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground truncate">{f.label} (from &quot;{f.sourceLabel}&quot;)</p>
                  <p className="text-sm font-semibold text-foreground">{f.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>

          {profitAdvice && (
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Profit Opportunities</CardTitle>
                <CardDescription>Based on the data you just uploaded, current profit margin is {profitAdvice.currentValue}.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {profitAdvice.recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{profitAdvice.summary}</p>
                ) : (
                  profitAdvice.recommendations.map((r, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{i + 1}. {r.move}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{r.deltaDescription}</p>
                      {r.tradeoff && <p className="text-xs text-amber-400 mt-1.5">Tradeoff: {r.tradeoff}</p>}
                    </div>
                  ))
                )}
              </CardContent>
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Button asChild size="sm">
                  <Link href="/simulation">
                    Fine-tune in Simulation <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">
                  Current business health score: {Math.round(currentResult.outputs.businessHealthScore)}/100
                </span>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}