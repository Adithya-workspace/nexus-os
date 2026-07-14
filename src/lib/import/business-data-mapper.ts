import { BusinessInputs } from "@/lib/simulation/types";
import { DEFAULT_INPUTS } from "@/lib/simulation/constants";

interface FieldSpec {
  key: keyof BusinessInputs;
  label: string;
  aliases: string[];
}

// Aliases are matched case-insensitively as substrings against whatever
// column headers / labels were found in the uploaded file. Ordered roughly
// by how commonly each phrasing shows up in real business spreadsheets.
const FIELD_SPECS: FieldSpec[] = [
  { key: "price", label: "Product Price", aliases: ["unit price", "selling price", "sale price", "average price", "price"] },
  { key: "marketingBudget", label: "Marketing Budget", aliases: ["marketing budget", "ad spend", "advertising spend", "marketing spend", "advertising", "marketing"] },
  { key: "employees", label: "Employees", aliases: ["headcount", "employee count", "staff count", "number of employees", "team size", "employees", "staff"] },
  { key: "avgSalary", label: "Avg. Salary", aliases: ["average salary", "avg salary", "monthly salary", "salary"] },
  { key: "discountPercent", label: "Discount", aliases: ["discount percent", "discount %", "discount rate", "discount"] },
  { key: "inventoryUnits", label: "Inventory", aliases: ["inventory units", "units in stock", "stock level", "inventory", "stock"] },
  { key: "productionRate", label: "Production Rate", aliases: ["production rate", "units produced", "monthly production", "production", "output"] },
  { key: "deliverySpeedDays", label: "Delivery Speed", aliases: ["delivery days", "delivery speed", "shipping time", "lead time", "delivery time", "delivery"] },
  { key: "customerServiceBudget", label: "Customer Service Budget", aliases: ["customer service budget", "support budget", "service budget", "customer service"] },
  { key: "supplierCostPerUnit", label: "Supplier Cost / Unit", aliases: ["cost per unit", "supplier cost", "unit cost", "cogs", "cost of goods"] },
];

export interface MatchedField {
  key: keyof BusinessInputs;
  label: string;
  sourceLabel: string;
  value: number;
}

export interface MappingResult {
  patch: Partial<BusinessInputs>;
  matched: MatchedField[];
  unmatchedFieldCount: number;
}

/** Strips currency symbols, commas, percent signs etc. and parses a number. */
function parseNumeric(raw: string): number | null {
  const cleaned = raw.replace(/[$,%]/g, "").replace(/,/g, "").trim();
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

/**
 * Maps a flat set of label→value pairs (one spreadsheet row, or lines
 * extracted from a PDF) onto our BusinessInputs shape via fuzzy alias
 * matching. Fields that aren't found are simply left out of the patch —
 * the simulation falls back to its existing baseline for those.
 */
export function mapRowToBusinessInputs(row: Record<string, string>): MappingResult {
  const patch: Partial<BusinessInputs> = {};
  const matched: MatchedField[] = [];
  const rowEntries = Object.entries(row).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");

  for (const spec of FIELD_SPECS) {
    let found: { sourceLabel: string; value: number } | null = null;

    for (const [sourceLabel, rawValue] of rowEntries) {
      const normalizedLabel = sourceLabel.toLowerCase().trim();
      const isAliasMatch = spec.aliases.some((alias) => normalizedLabel.includes(alias) || alias.includes(normalizedLabel));
      if (isAliasMatch) {
        const numeric = parseNumeric(String(rawValue));
        if (numeric !== null) {
          found = { sourceLabel, value: numeric };
          break;
        }
      }
    }

    if (found) {
      patch[spec.key] = found.value as never;
      matched.push({ key: spec.key, label: spec.label, sourceLabel: found.sourceLabel, value: found.value });
    }
  }

  return {
    patch,
    matched,
    unmatchedFieldCount: FIELD_SPECS.length - matched.length,
  };
}

/** Merges a detected patch on top of the current baseline (not a hard reset — unmatched fields keep their existing value). */
export function applyPatchToBaseline(current: BusinessInputs, patch: Partial<BusinessInputs>): BusinessInputs {
  return { ...current, ...patch };
}

export { DEFAULT_INPUTS };