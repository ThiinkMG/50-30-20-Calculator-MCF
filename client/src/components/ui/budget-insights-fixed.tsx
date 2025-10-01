import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LightbulbIcon, HelpCircleIcon, TrendingUpIcon, TrendingDownIcon, 
  CheckCircleIcon, AlertTriangleIcon
} from "lucide-react";
import { useBudgetContext } from "@/context/budget-context";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function BudgetInsights() {
  const { budget, isCalculated } = useBudgetContext();
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
  
  // Ensure the useEffect hook is always declared regardless of conditions
  useEffect(() => {
    if (isCalculated && budget) {
      // Calculate totals for each category
      const totalIncome = budget.income + (budget.additionalIncome || 0);
      
      let needsTotal = 0;
      let wantsTotal = 0;
      let savingsTotal = 0;
      
      (budget.needs || []).forEach(item => {
        needsTotal += item.amount || 0;
      });
      
      (budget.wants || []).forEach(item => {
        wantsTotal += item.amount || 0;
      });
      
      (budget.savings || []).forEach(item => {
        savingsTotal += item.amount || 0;
      });
      
      // Calculate percentages
      const needsPercentage = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
      const wantsPercentage = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;
      const savingsPercentage = totalIncome > 0 ? (savingsTotal / totalIncome) * 100 : 0;
      
      // Auto-expand section with largest deviation
      if (Math.abs(needsPercentage - 50) > 10) {
        setActiveSection("needs");
      } else if (Math.abs(wantsPercentage - 30) > 10) {
        setActiveSection("wants");
      } else if (Math.abs(savingsPercentage - 20) > 10) {
        setActiveSection("savings");
      }
    }
  }, [isCalculated, budget]);
  
  if (!isCalculated || !budget) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <LightbulbIcon className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
            Budget Insights
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your income and expenses to see personalized budget insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for each category
  const totalIncome = budget.income + (budget.additionalIncome || 0);
  
  let needsTotal = 0;
  let wantsTotal = 0;
  let savingsTotal = 0;
  
  (budget.needs || []).forEach(item => {
    needsTotal += item.amount || 0;
  });
  
  (budget.wants || []).forEach(item => {
    wantsTotal += item.amount || 0;
  });
  
  (budget.savings || []).forEach(item => {
    savingsTotal += item.amount || 0;
  });
  
  // Calculate percentages
  const needsPercentage = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
  const wantsPercentage = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;
  const savingsPercentage = totalIncome > 0 ? (savingsTotal / totalIncome) * 100 : 0;
  
  // Determine status for each category
  const getStatus = (percentage: number, target: number) => {
    if (Math.abs(percentage - target) <= 5) return "on-target";
    return percentage > target ? "over" : "under";
  }
  
  const needsStatus = getStatus(needsPercentage, 50);
  const wantsStatus = getStatus(wantsPercentage, 30);
  const savingsStatus = getStatus(savingsPercentage, 20);
  
  // Calculate difference from ideal
  const needsIdeal = totalIncome * 0.5;
  const wantsIdeal = totalIncome * 0.3;
  const savingsIdeal = totalIncome * 0.2;
  
  const needsDiff = needsTotal - needsIdeal;
  const wantsDiff = wantsTotal - wantsIdeal;
  const savingsDiff = savingsTotal - savingsIdeal;
  
  // Generate tips based on status
  const generateTips = (category: string, status: string) => {
    if (category === "needs") {
      if (status === "over") {
        return [
          "Look for ways to reduce housing costs, such as refinancing your mortgage or finding a roommate.",
          "Shop around for better deals on insurance and utilities.",
          "Use meal planning to reduce grocery expenses."
        ];
      } else if (status === "under") {
        return [
          "Make sure you're not sacrificing essential needs to save money.",
          "Check if your necessary expenses are properly categorized.",
          "Consider if you need to allocate more for healthcare or other essentials."
        ];
      } else {
        return ["You're right on target with your essential spending. Keep it up!"];
      }
    } else if (category === "wants") {
      if (status === "over") {
        return [
          "Track subscriptions and consider which ones you can live without.",
          "Try implementing a 24-hour rule before making non-essential purchases.",
          "Look for free or low-cost alternatives for entertainment."
        ];
      } else if (status === "under") {
        return [
          "You're being very disciplined with your discretionary spending.",
          "Make sure you're allowing yourself some quality-of-life expenses.",
          "Consider if you can reallocate some of these savings to debt repayment."
        ];
      } else {
        return ["Your discretionary spending is well-balanced. Great job!"];
      }
    } else {
      if (status === "over") {
        return [
          "Excellent job prioritizing savings and debt repayment!",
          "Make sure you have a balanced approach to short and long-term goals.",
          "Consider if you're paying down debt efficiently (focus on highest interest first)."
        ];
      } else if (status === "under") {
        return [
          "Try automating your savings to ensure you meet your targets.",
          "Look for ways to reduce expenses in other areas to boost savings.",
          "Consider setting specific savings goals to stay motivated."
        ];
      } else {
        return ["You're right on track with your savings goals. Excellent work!"];
      }
    }
  };
  
  const needsTips = generateTips("needs", needsStatus);
  const wantsTips = generateTips("wants", wantsStatus);
  const savingsTips = generateTips("savings", savingsStatus);
  
  // Auto-expand logic is now handled in the main useEffect above

  // Helper functions for UI
  const getCategoryIcon = (status: string) => {
    switch (status) {
      case "over":
        return <TrendingUpIcon className="h-5 w-5 text-red-500" />;
      case "under":
        return <TrendingDownIcon className="h-5 w-5 text-blue-500" />;
      case "on-target":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <HelpCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (status: string) => {
    switch (status) {
      case "over":
        return "text-red-500";
      case "under":
        return "text-blue-500";
      case "on-target":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "over":
        return "bg-red-500";
      case "under":
        return "bg-blue-500";
      case "on-target":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (category: string, status: string, diff: number) => {
    const formattedDiff = formatCurrency(Math.abs(diff));
    
    if (status === "on-target") {
      return `Your ${category} spending is right on target!`;
    }
    
    if (status === "over") {
      return `You're over budget in ${category} by ${formattedDiff}`;
    }
    
    return `You're under budget in ${category} by ${formattedDiff}`;
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <LightbulbIcon className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Budget Insights
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          See how your spending aligns with the 50/30/20 rule and get tips to optimize.
        </p>
        
        <Accordion type="single" collapsible defaultValue={activeSection}>
          {/* Needs Section */}
          <AccordionItem value="needs" className="border-b border-gray-200 dark:border-gray-700">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                {getCategoryIcon(needsStatus)}
                <span className="ml-2 font-medium">Needs Allocation (50%)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Needs are essential expenses: housing, utilities, groceries, transportation, 
                        insurance, and minimum debt payments. Target: 50% of income.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                <div className={`mb-3 font-medium ${getCategoryColor(needsStatus)}`}>
                  {getStatusText("needs", needsStatus, needsDiff)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: {formatPercentage(needsPercentage)}</span>
                    <span>Target: 50%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className={`h-2 rounded ${getProgressColor(needsStatus)}`}
                        style={{ width: `${Math.max(5, Math.min(100, needsPercentage))}%` }}
                      ></div>
                    </div>
                    <div className="absolute h-2 left-1/2 top-1 border-l border-gray-400 dark:border-gray-500" style={{transform: 'translateX(-1px)'}}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatCurrency(needsTotal)} of {formatCurrency(totalIncome)}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                    Tips for optimization:
                  </h4>
                  <ul className="ml-5 list-disc space-y-1">
                    {needsTips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Wants Section */}
          <AccordionItem value="wants" className="border-b border-gray-200 dark:border-gray-700">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                {getCategoryIcon(wantsStatus)}
                <span className="ml-2 font-medium">Wants Allocation (30%)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Wants are non-essential expenses that enhance your life: dining out, 
                        entertainment, subscriptions, shopping, and vacations. Target: 30% of income.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                <div className={`mb-3 font-medium ${getCategoryColor(wantsStatus)}`}>
                  {getStatusText("wants", wantsStatus, wantsDiff)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: {formatPercentage(wantsPercentage)}</span>
                    <span>Target: 30%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className={`h-2 rounded ${getProgressColor(wantsStatus)}`}
                        style={{ width: `${Math.max(5, Math.min(100, wantsPercentage))}%` }}
                      ></div>
                    </div>
                    <div className="absolute h-2 left-[30%] top-1 border-l border-gray-400 dark:border-gray-500" style={{transform: 'translateX(-1px)'}}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatCurrency(wantsTotal)} of {formatCurrency(totalIncome)}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                    Tips for optimization:
                  </h4>
                  <ul className="ml-5 list-disc space-y-1">
                    {wantsTips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Savings Section */}
          <AccordionItem value="savings" className="border-b-0">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                {getCategoryIcon(savingsStatus)}
                <span className="ml-2 font-medium">Savings & Debt (20%)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        Savings & debt include emergency funds, retirement contributions, investments, 
                        and payments toward debt beyond the minimum. Target: 20% of income.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                <div className={`mb-3 font-medium ${getCategoryColor(savingsStatus)}`}>
                  {getStatusText("savings", savingsStatus, savingsDiff)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: {formatPercentage(savingsPercentage)}</span>
                    <span>Target: 20%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className={`h-2 rounded ${getProgressColor(savingsStatus)}`}
                        style={{ width: `${Math.max(5, Math.min(100, savingsPercentage))}%` }}
                      ></div>
                    </div>
                    <div className="absolute h-2 left-[20%] top-1 border-l border-gray-400 dark:border-gray-500" style={{transform: 'translateX(-1px)'}}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatCurrency(savingsTotal)} of {formatCurrency(totalIncome)}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                    Tips for optimization:
                  </h4>
                  <ul className="ml-5 list-disc space-y-1">
                    {savingsTips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}