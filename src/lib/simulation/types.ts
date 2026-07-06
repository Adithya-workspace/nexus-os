// Core input levers the owner can control.
export interface BusinessInputs {
  price: number;                 // $ per unit
  marketingBudget: number;       // $ per month
  employees: number;             // headcount
  avgSalary: number;             // $ per month per employee
  discountPercent: number;       // 0-100
  inventoryUnits: number;        // units on hand
  productionRate: number;        // units produced per month
  deliverySpeedDays: number;     // avg fulfillment time in days
  customerServiceBudget: number; // $ per month
  supplierCostPerUnit: number;   // $ per unit COGS
}

// Derived / predicted outputs recalculated on every change.
export interface BusinessOutputs {
  demandUnits: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
  customerSatisfaction: number; // 0-100
  churnRate: number;            // 0-100 (%)
  inventoryHealth: number;      // 0-100
  growthRate: number;           // % month over month
  riskScore: number;            // 0-100 (higher = riskier)
  businessHealthScore: number;  // 0-100 composite
}

export interface DepartmentScore {
  id: DepartmentId;
  label: string;
  score: number; // 0-100
  trend: "up" | "down" | "flat";
  summary: string;
}

export type DepartmentId =
  | "finance"
  | "inventory"
  | "sales"
  | "marketing"
  | "customers"
  | "operations"
  | "hr";

export interface SimulationResult {
  inputs: BusinessInputs;
  outputs: BusinessOutputs;
  departments: DepartmentScore[];
  timestamp: number;
}

export interface SimulationDelta {
  key: keyof BusinessOutputs;
  label: string;
  before: number;
  after: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  isGood: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  inputs: BusinessInputs;
  result: SimulationResult;
  createdAt: number;
}
