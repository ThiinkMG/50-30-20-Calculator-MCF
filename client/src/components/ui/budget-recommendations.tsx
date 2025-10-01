import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Lightbulb } from "lucide-react";
import { useBudgetContext } from "@/context/budget-context";
import { formatCurrency } from "@/lib/utils";

export function BudgetRecommendations() {
  const { budget, isCalculated } = useBudgetContext();

  const recommendations = useMemo(() => {
    // Default empty state
    const defaultRecommendations = {
      needsRecommendation: { title: "Essential Expenses", description: "", status: "neutral" },
      wantsRecommendation: { title: "Lifestyle & Discretionary", description: "", status: "neutral" },
      savingsRecommendation: { title: "Financial Security", description: "", status: "neutral" },
      overallRecommendation: { title: "Budget Balance", description: "", status: "neutral" },
      tips: []
    };
    
    // Return default if no budget or calculations
    if (!budget?.calculations) {
      return defaultRecommendations;
    }

    // Safely destructure with default values to handle possible null/undefined
    const {
      needsPercentage = 0,
      wantsPercentage = 0,
      savingsPercentage = 0,
      remaining = 0
    } = budget.calculations || {};

    // Format percentages safely (handling null, undefined, or NaN values)
    const formatPercent = (value: number | null | undefined) => {
      if (typeof value !== 'number' || isNaN(value)) return '0';
      return value.toFixed(0);
    };

    // Create recommendation objects with safe formatting
    const needsRecommendation = {
      title: "Essential Expenses",
      description: "",
      status: "neutral" as "success" | "warning" | "danger" | "neutral"
    };
    
    const formattedNeedsPercentage = formatPercent(needsPercentage);
    
    if (needsPercentage <= 50 && needsPercentage >= 45) {
      needsRecommendation.description = `Your essential expenses are ${formattedNeedsPercentage}% of your income, aligning well with the 50/30/20 guideline.`;
      needsRecommendation.status = "success";
    } else if (needsPercentage < 45) {
      needsRecommendation.description = `Your essential expenses are ${formattedNeedsPercentage}% of your income. You're managing your necessities efficiently, which gives you flexibility in other areas.`;
      needsRecommendation.status = "success";
    } else {
      needsRecommendation.description = `Your essential expenses are ${formattedNeedsPercentage}% of your income. If your goal is to follow the 50/30/20 guideline, you may want to review your necessary expenses.`;
      needsRecommendation.status = "warning";
    }

    // Wants recommendation
    const wantsRecommendation = {
      title: "Lifestyle & Discretionary",
      description: "",
      status: "neutral" as "success" | "warning" | "danger" | "neutral"
    };
    
    const formattedWantsPercentage = formatPercent(wantsPercentage);
    
    if (wantsPercentage <= 30 && wantsPercentage >= 25) {
      wantsRecommendation.description = `Your discretionary spending is ${formattedWantsPercentage}% of your income, balancing enjoyment with financial responsibility.`;
      wantsRecommendation.status = "success";
    } else if (wantsPercentage < 25) {
      wantsRecommendation.description = `Your discretionary spending is ${formattedWantsPercentage}% of your income. While this is below the 30% guideline, this may be a conscious choice to prioritize other financial goals.`;
      wantsRecommendation.status = "success";
    } else {
      wantsRecommendation.description = `Your discretionary spending is ${formattedWantsPercentage}% of your income. Depending on your priorities, you might consider reviewing your non-essential expenses.`;
      wantsRecommendation.status = "warning";
    }

    // Savings recommendation
    const savingsRecommendation = {
      title: "Financial Security",
      description: "",
      status: "neutral" as "success" | "warning" | "danger" | "neutral"
    };
    
    const formattedSavingsPercentage = formatPercent(savingsPercentage);
    
    if (savingsPercentage >= 20) {
      savingsRecommendation.description = `You're allocating ${formattedSavingsPercentage}% of your income to savings and debt repayment, which is excellent for building long-term financial security.`;
      savingsRecommendation.status = "success";
    } else if (savingsPercentage >= 15) {
      savingsRecommendation.description = `You're allocating ${formattedSavingsPercentage}% of your income to savings and debt repayment. If building savings is a priority, you're on a positive path.`;
      savingsRecommendation.status = "success";
    } else {
      savingsRecommendation.description = `You're currently allocating ${formattedSavingsPercentage}% of your income to savings and debt repayment. If possible, increasing this percentage can help strengthen your financial future.`;
      savingsRecommendation.status = "neutral";
    }

    // Overall budget recommendation
    const overallRecommendation = {
      title: "Budget Balance",
      description: "",
      status: "neutral" as "success" | "warning" | "danger" | "neutral"
    };

    // Format remaining value safely
    const formattedRemaining = formatCurrency(typeof remaining === 'number' ? remaining : 0);
    const formattedRemainingAbs = formatCurrency(typeof remaining === 'number' ? Math.abs(remaining) : 0);

    if (remaining > 0) {
      overallRecommendation.description = `You have ${formattedRemaining} unallocated in your budget. This provides flexibility to strengthen your savings or enhance your quality of life.`;
      overallRecommendation.status = "success";
    } else if (remaining === 0) {
      overallRecommendation.description = `Your budget is perfectly balanced. Every dollar has a purpose, which is excellent for financial clarity.`;
      overallRecommendation.status = "success";
    } else {
      overallRecommendation.description = `Your budget shows ${formattedRemainingAbs} more in expenses than income. Finding ways to address this gap will help improve your financial stability.`;
      overallRecommendation.status = "warning";
    }

    // Budget improvement tips - with safety checks
    const tips = [];

    // Only add category-specific tips if the values are actually numbers
    if (typeof needsPercentage === 'number' && needsPercentage > 50) {
      tips.push("If you'd like to align with the 50/30/20 guideline, you might explore options such as meal planning, comparing service providers, or refinancing debt to lower your essential expenses");
    }

    if (typeof wantsPercentage === 'number' && wantsPercentage > 30) {
      tips.push("Consider keeping a spending journal for a few weeks to identify patterns in your discretionary spending - this awareness often naturally helps in making more intentional choices");
    }

    if (typeof savingsPercentage === 'number' && savingsPercentage < 20) {
      tips.push("Depending on your financial goals, you may benefit from automatic transfers to your savings account to help build your financial cushion over time");
    }

    // Always add this general tip
    tips.push("An emergency fund covering 3-6 months of expenses provides peace of mind and financial stability during unexpected situations");

    // Add remaining-specific tips with safety checks
    if (typeof remaining === 'number') {
      if (remaining > 0) {
        tips.push(`Your unallocated ${formattedRemaining} could be directed toward your highest priority financial goal, whether that's debt reduction, saving for something special, or investing for the future`);
      }

      if (remaining < 0) {
        tips.push("Consider exploring ways to bring your budget into balance, whether through adjusting expenses or finding opportunities to increase your income through skills you enjoy using");
      }
    }

    return {
      needsRecommendation,
      wantsRecommendation,
      savingsRecommendation,
      overallRecommendation,
      tips
    };
  }, [budget]);

  if (!isCalculated) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 text-accent dark:text-accent-light mr-2" />
            Budget Recommendations
          </h2>
          <div className="text-center py-10 text-muted-foreground">
            <p>Calculate your budget to see recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "danger":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const getTextClass = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      case "danger":
        return "text-red-800 dark:text-red-200";
      default:
        return "text-blue-800 dark:text-blue-200";
    }
  };

  const getDescriptionClass = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-700 dark:text-green-300";
      case "warning":
        return "text-yellow-700 dark:text-yellow-300";
      case "danger":
        return "text-red-700 dark:text-red-300";
      default:
        return "text-blue-700 dark:text-blue-300";
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 text-accent dark:text-accent-light mr-2" />
          Budget Recommendations
        </h2>
        
        <div className="space-y-4">
          <div className={`p-4 ${getStatusClass(recommendations.needsRecommendation.status)} rounded-lg`}>
            <h3 className={`text-sm font-medium ${getTextClass(recommendations.needsRecommendation.status)} mb-1`}>
              {recommendations.needsRecommendation.title}
            </h3>
            <p className={`text-xs ${getDescriptionClass(recommendations.needsRecommendation.status)}`}>
              {recommendations.needsRecommendation.description}
            </p>
          </div>
          
          <div className={`p-4 ${getStatusClass(recommendations.wantsRecommendation.status)} rounded-lg`}>
            <h3 className={`text-sm font-medium ${getTextClass(recommendations.wantsRecommendation.status)} mb-1`}>
              {recommendations.wantsRecommendation.title}
            </h3>
            <p className={`text-xs ${getDescriptionClass(recommendations.wantsRecommendation.status)}`}>
              {recommendations.wantsRecommendation.description}
            </p>
          </div>
          
          <div className={`p-4 ${getStatusClass(recommendations.savingsRecommendation.status)} rounded-lg`}>
            <h3 className={`text-sm font-medium ${getTextClass(recommendations.savingsRecommendation.status)} mb-1`}>
              {recommendations.savingsRecommendation.title}
            </h3>
            <p className={`text-xs ${getDescriptionClass(recommendations.savingsRecommendation.status)}`}>
              {recommendations.savingsRecommendation.description}
            </p>
          </div>
          
          <div className={`p-4 ${getStatusClass(recommendations.overallRecommendation.status)} rounded-lg`}>
            <h3 className={`text-sm font-medium ${getTextClass(recommendations.overallRecommendation.status)} mb-1`}>
              {recommendations.overallRecommendation.title}
            </h3>
            <p className={`text-xs ${getDescriptionClass(recommendations.overallRecommendation.status)}`}>
              {recommendations.overallRecommendation.description}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
        
        <h3 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200">Helpful Financial Ideas</h3>
        
        <ul className="space-y-2">
          {recommendations.tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="text-green-500 dark:text-green-400 mt-1 mr-2 h-4 w-4" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
