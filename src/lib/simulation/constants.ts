import { BusinessInputs } from "./types";

// Baseline demo business: a mid-size DTC retail/e-commerce operation.
export const DEFAULT_INPUTS: BusinessInputs = {
  price: 49,
  marketingBudget: 18000,
  employees: 24,
  avgSalary: 4200,
  discountPercent: 5,
  inventoryUnits: 12000,
  productionRate: 5000,
  deliverySpeedDays: 4,
  customerServiceBudget: 6000,
  supplierCostPerUnit: 18,
};

export const INPUT_BOUNDS: Record<keyof BusinessInputs, { min: number; max: number; step: number; unit: string; label: string }> = {
  price: { min: 5, max: 500, step: 1, unit: "$", label: "Product Price" },
  marketingBudget: { min: 0, max: 200000, step: 500, unit: "$", label: "Marketing Budget" },
  employees: { min: 1, max: 500, step: 1, unit: "", label: "Employees" },
  avgSalary: { min: 1500, max: 20000, step: 100, unit: "$", label: "Avg. Salary" },
  discountPercent: { min: 0, max: 70, step: 1, unit: "%", label: "Discount" },
  inventoryUnits: { min: 0, max: 100000, step: 100, unit: "units", label: "Inventory" },
  productionRate: { min: 0, max: 50000, step: 100, unit: "units/mo", label: "Production Rate" },
  deliverySpeedDays: { min: 1, max: 21, step: 1, unit: "days", label: "Delivery Speed" },
  customerServiceBudget: { min: 0, max: 100000, step: 500, unit: "$", label: "Customer Service Budget" },
  supplierCostPerUnit: { min: 1, max: 300, step: 1, unit: "$", label: "Supplier Cost / Unit" },
};

// Market elasticity + behavioral constants used by the engine.
export const MARKET_CONSTANTS = {
  baseMarketSize: 40000,      // total addressable buyers per month at baseline
  priceElasticity: -1.35,     // % demand change per % price change
  marketingSaturation: 45000, // diminishing returns point for ad spend
  referenceMarketingBudget: 18000,
  discountDemandBoost: 0.9,   // demand lift multiplier per % discount
  serviceQualityWeight: 0.4,
  deliverySatisfactionWeight: 0.35,
  employeeCapacityUnits: 850, // units of demand each employee can service per month
};
