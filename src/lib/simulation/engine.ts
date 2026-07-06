import { BusinessInputs, BusinessOutputs, DepartmentScore, SimulationDelta, SimulationResult } from "./types";
import { DEFAULT_INPUTS, MARKET_CONSTANTS } from "./constants";
import { clamp } from "@/lib/utils";

/**
 * Nexus Business Simulation Engine
 * ----------------------------------
 * A deterministic, explainable system-dynamics model. Every lever influences
 * multiple downstream metrics, mirroring how real SMB operations behave:
 *
 *   price ↑ → demand ↓ → margin ↑ but satisfaction ↓ → future demand ↓
 *   marketing ↑ → demand ↑ (diminishing returns) → inventory pressure ↑
 *   employees/service budget ↑ → satisfaction ↑, churn ↓, opex ↑
 *   delivery speed ↓ (slower) → satisfaction ↓, churn ↑
 *
 * This is intentionally a transparent formula model (not a black box) so the
 * AI agents can cite *why* a number moved.
 */
export class SimulationEngine {
  /** Compute demand (units/month) as a function of price, marketing, discount, and service quality. */
  private static computeDemand(inputs: BusinessInputs): number {
    const { baseMarketSize, priceElasticity, marketingSaturation, referenceMarketingBudget, discountDemandBoost } =
      MARKET_CONSTANTS;

    const referencePrice = DEFAULT_INPUTS.price;
    const priceRatio = inputs.price / referencePrice;
    // Constant-elasticity demand curve relative to baseline price.
    const priceEffect = Math.pow(priceRatio, priceElasticity);

    // Diminishing-returns marketing curve (logarithmic saturation).
    const marketingRatio = Math.max(inputs.marketingBudget, 1) / referenceMarketingBudget;
    const marketingEffect = 1 + 0.55 * Math.log(1 + marketingRatio) - 0.55 * Math.log(2);
    const marketingSaturationPenalty = inputs.marketingBudget > marketingSaturation ? 0.85 : 1;

    // Discounts pull demand up but with diminishing marginal effect.
    const discountEffect = 1 + (inputs.discountPercent / 100) * discountDemandBoost;

    const rawDemand =
      baseMarketSize * priceEffect * marketingEffect * discountEffect * marketingSaturationPenalty;

    return Math.max(0, rawDemand);
  }

  /** Fulfillment capacity is capped by employees and current inventory/production. */
  private static computeFulfillableDemand(demandUnits: number, inputs: BusinessInputs): number {
    const employeeCapacity = inputs.employees * MARKET_CONSTANTS.employeeCapacityUnits;
    const supplyCapacity = inputs.inventoryUnits + inputs.productionRate;
    return Math.min(demandUnits, employeeCapacity, supplyCapacity);
  }

  private static computeCustomerSatisfaction(inputs: BusinessInputs, demandUnits: number, fulfilled: number): number {
    const { serviceQualityWeight, deliverySatisfactionWeight } = MARKET_CONSTANTS;

    // Service budget per demanded unit — proxy for support quality.
    const serviceRatio = clamp((inputs.customerServiceBudget / Math.max(demandUnits, 1)) / 0.3, 0, 1.6);
    const serviceScore = clamp(serviceRatio * 100, 0, 100);

    // Faster delivery = higher satisfaction. 2 days is excellent, 14+ is poor.
    const deliveryScore = clamp(100 - (inputs.deliverySpeedDays - 2) * 7, 0, 100);

    // Price fairness: big gap between price and supplier cost hurts perceived value,
    // heavy discounting helps it.
    const value = inputs.price - inputs.supplierCostPerUnit;
    const referenceValue = DEFAULT_INPUTS.price - DEFAULT_INPUTS.supplierCostPerUnit;
    const valueScore = clamp(100 - ((value - referenceValue) / referenceValue) * 40 + inputs.discountPercent * 0.8, 0, 100);

    // Fulfillment rate: can we actually deliver what was demanded?
    const fulfillmentRate = demandUnits > 0 ? fulfilled / demandUnits : 1;
    const fulfillmentScore = clamp(fulfillmentRate * 100, 0, 100);

    const composite =
      serviceScore * serviceQualityWeight +
      deliveryScore * deliverySatisfactionWeight +
      valueScore * 0.15 +
      fulfillmentScore * 0.1;

    return clamp(composite, 0, 100);
  }

  private static computeChurn(satisfaction: number, priceRatio: number): number {
    // Baseline churn 5%, rising sharply below 50 satisfaction, falling above 80.
    const satisfactionEffect = clamp((70 - satisfaction) * 0.35, -8, 30);
    const priceShockEffect = clamp((priceRatio - 1) * 6, -3, 20);
    const churn = clamp(5 + satisfactionEffect + priceShockEffect, 0.5, 65);
    return churn;
  }

  private static computeInventoryHealth(inputs: BusinessInputs, fulfilled: number): number {
    const monthsOfCover = inputs.inventoryUnits / Math.max(fulfilled / 1, 1) * 1; // crude months-of-cover
    // Ideal cover ~1.5-3 months. Too little = stockout risk, too much = capital tied up.
    let score: number;
    if (monthsOfCover < 0.5) score = 35 + monthsOfCover * 60;
    else if (monthsOfCover <= 3) score = 90;
    else score = clamp(90 - (monthsOfCover - 3) * 8, 20, 90);
    return clamp(score, 0, 100);
  }

  private static computeRisk(outputs: {
    profitMargin: number;
    churnRate: number;
    inventoryHealth: number;
    cashFlow: number;
    customerSatisfaction: number;
  }): number {
    const marginRisk = clamp((10 - outputs.profitMargin) * 2.2, 0, 40);
    const churnRisk = clamp(outputs.churnRate * 0.8, 0, 30);
    const inventoryRisk = clamp((100 - outputs.inventoryHealth) * 0.25, 0, 20);
    const cashRisk = outputs.cashFlow < 0 ? 25 : 0;
    const satisfactionRisk = clamp((60 - outputs.customerSatisfaction) * 0.2, 0, 15);
    return clamp(marginRisk + churnRisk + inventoryRisk + cashRisk + satisfactionRisk, 0, 100);
  }

  private static computeGrowth(outputs: {
    customerSatisfaction: number;
    churnRate: number;
    profitMargin: number;
  }): number {
    const retentionFactor = (100 - outputs.churnRate) / 100;
    const satisfactionFactor = (outputs.customerSatisfaction - 50) / 100;
    const marginFactor = outputs.profitMargin / 100;
    const growth = (retentionFactor - 0.85) * 40 + satisfactionFactor * 18 + marginFactor * 12;
    return clamp(growth, -25, 40);
  }

  /** Main entry point: run the full simulation for a given input state. */
  static run(inputs: BusinessInputs): SimulationResult {
    const demandUnits = this.computeDemand(inputs);
    const fulfilled = this.computeFulfillableDemand(demandUnits, inputs);

    const revenue = fulfilled * inputs.price * (1 - inputs.discountPercent / 100);
    const cogs = fulfilled * inputs.supplierCostPerUnit;
    const grossProfit = revenue - cogs;

    const payroll = inputs.employees * inputs.avgSalary;
    const operatingExpenses = payroll + inputs.marketingBudget + inputs.customerServiceBudget;
    const netProfit = grossProfit - operatingExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : -100;

    const cashFlow = netProfit - fulfilled * inputs.supplierCostPerUnit * 0.1; // working-capital drag

    const customerSatisfaction = this.computeCustomerSatisfaction(inputs, demandUnits, fulfilled);
    const priceRatio = inputs.price / DEFAULT_INPUTS.price;
    const churnRate = this.computeChurn(customerSatisfaction, priceRatio);
    const inventoryHealth = this.computeInventoryHealth(inputs, fulfilled);

    const riskScore = this.computeRisk({ profitMargin, churnRate, inventoryHealth, cashFlow, customerSatisfaction });
    const growthRate = this.computeGrowth({ customerSatisfaction, churnRate, profitMargin });

    const businessHealthScore = clamp(
      profitMargin * 0.9 +
        customerSatisfaction * 0.3 +
        inventoryHealth * 0.2 +
        (100 - churnRate) * 0.25 +
        (100 - riskScore) * 0.25,
      0,
      100
    );

    const outputs: BusinessOutputs = {
      demandUnits,
      revenue,
      cogs,
      grossProfit,
      operatingExpenses,
      netProfit,
      profitMargin,
      cashFlow,
      customerSatisfaction,
      churnRate,
      inventoryHealth,
      growthRate,
      riskScore,
      businessHealthScore,
    };

    const departments = this.computeDepartmentScores(inputs, outputs);

    return {
      inputs,
      outputs,
      departments,
      timestamp: Date.now(),
    };
  }

  private static computeDepartmentScores(inputs: BusinessInputs, outputs: BusinessOutputs): DepartmentScore[] {
    const trend = (score: number): "up" | "down" | "flat" => (score >= 66 ? "up" : score <= 40 ? "down" : "flat");

    const scores: DepartmentScore[] = [
      {
        id: "finance",
        label: "Finance",
        score: clamp(50 + outputs.profitMargin * 1.4, 0, 100),
        trend: trend(clamp(50 + outputs.profitMargin * 1.4, 0, 100)),
        summary: `${outputs.profitMargin >= 0 ? "Profitable" : "Losing money"} at ${outputs.profitMargin.toFixed(1)}% margin.`,
      },
      {
        id: "inventory",
        label: "Inventory",
        score: outputs.inventoryHealth,
        trend: trend(outputs.inventoryHealth),
        summary: `${inputs.inventoryUnits.toLocaleString()} units on hand vs ${Math.round(outputs.demandUnits).toLocaleString()} demanded.`,
      },
      {
        id: "sales",
        label: "Sales",
        score: clamp(60 + outputs.growthRate * 1.5, 0, 100),
        trend: trend(clamp(60 + outputs.growthRate * 1.5, 0, 100)),
        summary: `Growth trending ${outputs.growthRate >= 0 ? "up" : "down"} at ${outputs.growthRate.toFixed(1)}%/mo.`,
      },
      {
        id: "marketing",
        label: "Marketing",
        score: clamp((inputs.marketingBudget / 40000) * 100, 0, 100),
        trend: trend(clamp((inputs.marketingBudget / 40000) * 100, 0, 100)),
        summary: `$${inputs.marketingBudget.toLocaleString()}/mo driving ${Math.round(outputs.demandUnits).toLocaleString()} units demand.`,
      },
      {
        id: "customers",
        label: "Customers",
        score: outputs.customerSatisfaction,
        trend: trend(outputs.customerSatisfaction),
        summary: `Satisfaction ${outputs.customerSatisfaction.toFixed(0)}/100, churn ${outputs.churnRate.toFixed(1)}%.`,
      },
      {
        id: "operations",
        label: "Operations",
        score: clamp(100 - (inputs.deliverySpeedDays - 2) * 8, 0, 100),
        trend: trend(clamp(100 - (inputs.deliverySpeedDays - 2) * 8, 0, 100)),
        summary: `Avg. delivery ${inputs.deliverySpeedDays} days, producing ${inputs.productionRate.toLocaleString()} units/mo.`,
      },
      {
        id: "hr",
        label: "HR",
        score: clamp((inputs.employees * MARKET_CONSTANTS.employeeCapacityUnits / Math.max(outputs.demandUnits, 1)) * 100, 0, 100),
        trend: trend(clamp((inputs.employees * MARKET_CONSTANTS.employeeCapacityUnits / Math.max(outputs.demandUnits, 1)) * 100, 0, 100)),
        summary: `${inputs.employees} employees, ${inputs.employees > 0 ? Math.round(outputs.demandUnits / inputs.employees) : 0} units demand/head.`,
      },
    ];

    return scores;
  }

  /** Compare two simulation runs and produce human-readable deltas for AI explanations. */
  static diff(before: SimulationResult, after: SimulationResult): SimulationDelta[] {
    const metrics: { key: keyof BusinessOutputs; label: string; higherIsBetter: boolean }[] = [
      { key: "revenue", label: "Revenue", higherIsBetter: true },
      { key: "netProfit", label: "Profit", higherIsBetter: true },
      { key: "cashFlow", label: "Cash Flow", higherIsBetter: true },
      { key: "customerSatisfaction", label: "Customer Satisfaction", higherIsBetter: true },
      { key: "churnRate", label: "Churn", higherIsBetter: false },
      { key: "inventoryHealth", label: "Inventory Health", higherIsBetter: true },
      { key: "growthRate", label: "Growth", higherIsBetter: true },
      { key: "riskScore", label: "Risk", higherIsBetter: false },
      { key: "businessHealthScore", label: "Health Score", higherIsBetter: true },
    ];

    return metrics.map(({ key, label, higherIsBetter }) => {
      const beforeVal = before.outputs[key];
      const afterVal = after.outputs[key];
      const changePercent = beforeVal !== 0 ? ((afterVal - beforeVal) / Math.abs(beforeVal)) * 100 : 0;
      const direction = afterVal > beforeVal ? "up" : afterVal < beforeVal ? "down" : "flat";
      const isGood = direction === "flat" ? true : higherIsBetter ? direction === "up" : direction === "down";

      return {
        key,
        label,
        before: beforeVal,
        after: afterVal,
        changePercent,
        direction,
        isGood,
      };
    });
  }
}
