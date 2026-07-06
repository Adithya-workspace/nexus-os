import { BusinessInputs } from "@/lib/simulation/types";

export interface ParsedCommand {
  intent: string;
  patch: Partial<BusinessInputs>;
  explanation: string;
}

/**
 * Lightweight rule-based NLU for the AI Command Center. Parses free-text
 * owner commands into concrete simulation input patches. This runs entirely
 * client/server-side with no external API dependency, and is structured so
 * a real LLM call (see lib/ai/client.ts) can be swapped in as the parser
 * for more open-ended phrasing.
 */
export function parseCommand(text: string, current: BusinessInputs): ParsedCommand {
  const t = text.toLowerCase().trim();

  const percentMatch = t.match(/(\d+(\.\d+)?)\s*%/);
  const percent = percentMatch ? parseFloat(percentMatch[1]) : null;

  const numberMatch = t.match(/(\d+(\.\d+)?)/);
  const number = numberMatch ? parseFloat(numberMatch[1]) : null;

  // Price commands
  if (/(increase|raise|up).*price|price.*(increase|raise|up)/.test(t)) {
    const pct = percent ?? 10;
    return {
      intent: "increase_price",
      patch: { price: Math.round(current.price * (1 + pct / 100) * 100) / 100 },
      explanation: `Increasing price by ${pct}%.`,
    };
  }
  if (/(decrease|lower|reduce|cut|drop).*price|price.*(decrease|lower|reduce|cut|drop)/.test(t)) {
    const pct = percent ?? 10;
    return {
      intent: "decrease_price",
      patch: { price: Math.round(current.price * (1 - pct / 100) * 100) / 100 },
      explanation: `Decreasing price by ${pct}%.`,
    };
  }

  // Inventory commands
  if (/(reduce|decrease|lower|cut).*inventory/.test(t)) {
    const pct = percent ?? 20;
    return {
      intent: "reduce_inventory",
      patch: { inventoryUnits: Math.round(current.inventoryUnits * (1 - pct / 100)) },
      explanation: `Reducing inventory by ${pct}%.`,
    };
  }
  if (/(increase|raise|build up|add).*inventory/.test(t)) {
    const pct = percent ?? 20;
    return {
      intent: "increase_inventory",
      patch: { inventoryUnits: Math.round(current.inventoryUnits * (1 + pct / 100)) },
      explanation: `Increasing inventory by ${pct}%.`,
    };
  }

  // Hiring commands
  if (/hire|add.*(employee|staff|people)/.test(t)) {
    const count = number ?? 5;
    return {
      intent: "hire_employees",
      patch: { employees: current.employees + Math.round(count) },
      explanation: `Hiring ${Math.round(count)} additional employee(s).`,
    };
  }
  if (/(lay off|fire|reduce|cut).*(employee|staff|headcount)/.test(t)) {
    const count = number ?? 5;
    return {
      intent: "reduce_employees",
      patch: { employees: Math.max(1, current.employees - Math.round(count)) },
      explanation: `Reducing headcount by ${Math.round(count)}.`,
    };
  }

  // Marketing commands
  if (/(increase|raise|boost|scale up).*(marketing|ad|advertising)/.test(t)) {
    const pct = percent ?? 25;
    return {
      intent: "increase_marketing",
      patch: { marketingBudget: Math.round(current.marketingBudget * (1 + pct / 100)) },
      explanation: `Increasing marketing budget by ${pct}%.`,
    };
  }
  if (/(decrease|reduce|cut|lower).*(marketing|ad|advertising)/.test(t)) {
    const pct = percent ?? 25;
    return {
      intent: "decrease_marketing",
      patch: { marketingBudget: Math.round(current.marketingBudget * (1 - pct / 100)) },
      explanation: `Decreasing marketing budget by ${pct}%.`,
    };
  }

  // Discount commands
  if (/discount|promo|sale/.test(t)) {
    const pct = percent ?? 10;
    return {
      intent: "set_discount",
      patch: { discountPercent: pct },
      explanation: `Setting discount to ${pct}%.`,
    };
  }

  // Delivery / logistics commands
  if (/(faster|improve|speed up).*(deliver|shipping|fulfillment)/.test(t)) {
    return {
      intent: "improve_delivery",
      patch: { deliverySpeedDays: Math.max(1, current.deliverySpeedDays - 1) },
      explanation: "Improving delivery speed by 1 day.",
    };
  }

  // Customer service
  if (/(increase|raise|boost).*(service|support)/.test(t)) {
    const pct = percent ?? 20;
    return {
      intent: "increase_service",
      patch: { customerServiceBudget: Math.round(current.customerServiceBudget * (1 + pct / 100)) },
      explanation: `Increasing customer service budget by ${pct}%.`,
    };
  }

  // Fallback — no confident match.
  return {
    intent: "unrecognized",
    patch: {},
    explanation:
      "I couldn't confidently map that to a specific lever. Try phrases like \"increase price by 10%\", \"hire 5 employees\", or \"cut marketing budget 15%\".",
  };
}
