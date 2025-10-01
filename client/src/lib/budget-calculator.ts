import { Budget, BudgetItem } from "@shared/schema";

// Calculate the total amount for an array of budget items
export function calculateTotal(items: BudgetItem[] | undefined): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.amount, 0);
}

// Calculate the percentage of total for a given amount
export function calculatePercentage(amount: number, total: number): number {
  if (total === 0) return 0;
  return (amount / total) * 100;
}

// Calculate ideal 50/30/20 amounts based on total income
export function calculateIdealAmounts(totalIncome: number): {
  idealNeeds: number;
  idealWants: number;
  idealSavings: number;
} {
  return {
    idealNeeds: totalIncome * 0.5,
    idealWants: totalIncome * 0.3,
    idealSavings: totalIncome * 0.2,
  };
}

// Calculate adjustments needed for each category
export function calculateAdjustments(
  actual: number,
  ideal: number
): number {
  return ideal - actual;
}

// Analyze the budget and provide recommendations
export function analyzeAdjustments(
  needsPercentage: number,
  wantsPercentage: number,
  savingsPercentage: number
): {
  needsStatus: "under" | "ideal" | "over";
  wantsStatus: "under" | "ideal" | "over";
  savingsStatus: "under" | "ideal" | "over";
} {
  return {
    needsStatus:
      needsPercentage < 45
        ? "under"
        : needsPercentage > 55
        ? "over"
        : "ideal",
    wantsStatus:
      wantsPercentage < 25
        ? "under"
        : wantsPercentage > 35
        ? "over"
        : "ideal",
    savingsStatus:
      savingsPercentage < 15
        ? "under"
        : savingsPercentage > 25
        ? "over"
        : "ideal",
  };
}

// Calculate the complete budget breakdown
export function calculateBudget(budget: Budget): Budget & {
  calculations: {
    totalIncome: number;
    needsTotal: number;
    wantsTotal: number;
    savingsTotal: number;
    totalExpenses: number;
    remaining: number;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
    idealNeeds: number;
    idealWants: number;
    idealSavings: number;
    needsAdjustment: number;
    wantsAdjustment: number;
    savingsAdjustment: number;
  };
} {
  // Calculate total income
  const totalIncome = budget.income + (budget.additionalIncome || 0);
  
  // Calculate totals for each category
  const needsTotal = calculateTotal(budget.needs);
  const wantsTotal = calculateTotal(budget.wants);
  const savingsTotal = calculateTotal(budget.savings);
  
  // Calculate total expenses
  const totalExpenses = needsTotal + wantsTotal + savingsTotal;
  
  // Calculate remaining budget
  const remaining = totalIncome - totalExpenses;
  
  // Calculate percentages
  const needsPercentage = calculatePercentage(needsTotal, totalIncome);
  const wantsPercentage = calculatePercentage(wantsTotal, totalIncome);
  const savingsPercentage = calculatePercentage(savingsTotal, totalIncome);
  
  // Calculate ideal amounts
  const { idealNeeds, idealWants, idealSavings } = calculateIdealAmounts(totalIncome);
  
  // Calculate adjustments
  const needsAdjustment = calculateAdjustments(needsTotal, idealNeeds);
  const wantsAdjustment = calculateAdjustments(wantsTotal, idealWants);
  const savingsAdjustment = calculateAdjustments(savingsTotal, idealSavings);
  
  return {
    ...budget,
    calculations: {
      totalIncome,
      needsTotal,
      wantsTotal,
      savingsTotal,
      totalExpenses,
      remaining,
      needsPercentage,
      wantsPercentage,
      savingsPercentage,
      idealNeeds,
      idealWants,
      idealSavings,
      needsAdjustment,
      wantsAdjustment,
      savingsAdjustment,
    },
  };
}
