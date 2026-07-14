import { BusinessInputs, BusinessOutputs } from "@/lib/simulation/types";
import { SimulationEngine } from "@/lib/simulation/engine";

export interface MetricSpec {
  key: keyof BusinessOutputs;
  label: string;
  higherIsBetter: boolean;
  format: (v: number) => string;
  keywords: string[];
}

export const METRICS: MetricSpec[] = [
  { key: "profitMargin", label: "profit margin", higherIsBetter: true, format: (v) => `${v.toFixed(1)}%`, keywords: ["profit margin", "margin"] },
  { key: "netProfit", label: "profit", higherIsBetter: true, format: (v) => `$${Math.round(v).toLocaleString()}/mo`, keywords: ["profit", "profitability", "earn more", "make more money"] },
  { key: "revenue", label: "revenue", higherIsBetter: true, format: (v) => `$${Math.round(v).toLocaleString()}/mo`, keywords: ["revenue", "sales"] },
  { key: "churnRate", label: "churn", higherIsBetter: false, format: (v) => `${v.toFixed(1)}%`, keywords: ["churn", "retention", "customers leaving", "customer loss"] },
  { key: "customerSatisfaction", label: "customer satisfaction", higherIsBetter: true, format: (v) => `${Math.round(v)}/100`, keywords: ["satisfaction", "happier customers", "customer experience"] },
  { key: "growthRate", label: "growth", higherIsBetter: true, format: (v) => `${v.toFixed(1)}%/mo`, keywords: ["growth", "grow faster", "scale"] },
  { key: "riskScore", label: "risk", higherIsBetter: false, format: (v) => `${Math.round(v)}/100`, keywords: ["risk", "safer", "stability"] },
  { key: "cashFlow", label: "cash flow", higherIsBetter: true, format: (v) => `$${Math.round(v).toLocaleString()}/mo`, keywords: ["cash flow", "cash position", "liquidity"] },
  { key: "inventoryHealth", label: "inventory health", higherIsBetter: true, format: (v) => `${Math.round(v)}/100`, keywords: ["inventory", "stock levels", "stockouts"] },
];

const QUESTION_PATTERNS = [
  /how (can|do|could|might) i/i,
  /how to/i,
  /what should i/i,
  /what can i do/i,
  /ways? to/i,
  /how (can|do) we/i,
  /\?$/,
];

export interface GoalAdvice {
  metricLabel: string;
  currentValue: string;
  recommendations: {
    move: string;
    resultValue: string;
    deltaDescription: string;
    tradeoff?: string;
  }[];
  summary: string;
}

export function getMetricSpec(key: string): MetricSpec | undefined {
  return METRICS.find((m) => m.key === key);
}

export function detectGoalMetric(text: string): MetricSpec | null {
  const t = text.toLowerCase();
  const looksLikeQuestion = QUESTION_PATTERNS.some((p) => p.test(t)) || /increase|improve|boost|raise|reduce|lower|grow|fix|help/i.test(t);
  if (!looksLikeQuestion) return null;

  for (const metric of METRICS) {
    if (metric.keywords.some((kw) => t.includes(kw))) {
      return metric;
    }
  }
  return null;
}

function buildCandidates(base: BusinessInputs) {
  return [
    { label: "Increase price by 8%", inputs: { ...base, price: Math.round(base.price * 1.08 * 100) / 100 } },
    { label: "Decrease price by 8%", inputs: { ...base, price: Math.round(base.price * 0.92 * 100) / 100 } },
    { label: "Increase marketing budget by 25%", inputs: { ...base, marketingBudget: Math.round(base.marketingBudget * 1.25) } },
    { label: "Decrease marketing budget by 20%", inputs: { ...base, marketingBudget: Math.round(base.marketingBudget * 0.8) } },
    { label: "Improve delivery speed by 1 day", inputs: { ...base, deliverySpeedDays: Math.max(1, base.deliverySpeedDays - 1) } },
    { label: "Increase customer service budget by 20%", inputs: { ...base, customerServiceBudget: Math.round(base.customerServiceBudget * 1.2) } },
    { label: "Add 5 employees", inputs: { ...base, employees: base.employees + 5 } },
    { label: "Reduce headcount by 3", inputs: { ...base, employees: Math.max(1, base.employees - 3) } },
    { label: "Reduce discount by 5 points", inputs: { ...base, discountPercent: Math.max(0, base.discountPercent - 5) } },
    { label: "Increase discount by 5 points", inputs: { ...base, discountPercent: Math.min(70, base.discountPercent + 5) } },
    { label: "Increase production rate by 20%", inputs: { ...base, productionRate: Math.round(base.productionRate * 1.2) } },
    { label: "Reduce supplier cost by 10%", inputs: { ...base, supplierCostPerUnit: Math.round(base.supplierCostPerUnit * 0.9 * 100) / 100 } },
  ];
}

export function generateGoalAdvice(metric: MetricSpec, currentInputs: BusinessInputs): GoalAdvice {
  const currentResult = SimulationEngine.run(currentInputs);
  const currentValue = currentResult.outputs[metric.key];

  const candidates = buildCandidates(currentInputs);
  const tested = candidates.map((c) => {
    const result = SimulationEngine.run(c.inputs);
    const newValue = result.outputs[metric.key];
    const delta = newValue - currentValue;
    const isImprovement = metric.higherIsBetter ? delta > 0 : delta < 0;
    return { label: c.label, result, newValue, delta, isImprovement };
  });

  const ranked = tested
    .filter((t) => t.isImprovement)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  const recommendations = ranked.map((r) => {
    let tradeoff: string | undefined;
    if (metric.key !== "customerSatisfaction" && r.result.outputs.customerSatisfaction < currentResult.outputs.customerSatisfaction - 3) {
      tradeoff = `customer satisfaction would drop to ${Math.round(r.result.outputs.customerSatisfaction)}/100`;
    } else if (metric.key !== "netProfit" && metric.key !== "profitMargin" && r.result.outputs.netProfit < currentResult.outputs.netProfit - 500) {
      tradeoff = `profit would fall to $${Math.round(r.result.outputs.netProfit).toLocaleString()}/mo`;
    }

    return {
      move: r.label,
      resultValue: metric.format(r.newValue),
      deltaDescription: `${metric.label} ${metric.higherIsBetter ? "improves" : "drops"} from ${metric.format(currentValue)} to ${metric.format(r.newValue)}`,
      tradeoff,
    };
  });

  const summary =
    recommendations.length > 0
      ? `Tested ${candidates.length} possible moves — here's what actually improves ${metric.label} the most, based on your current numbers.`
      : `None of the standard moves meaningfully improve ${metric.label} from its current level — it may already be near-optimal given your other settings.`;

  return {
    metricLabel: metric.label,
    currentValue: metric.format(currentValue),
    recommendations,
    summary,
  };
}