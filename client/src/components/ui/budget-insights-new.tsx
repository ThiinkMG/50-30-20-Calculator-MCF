import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LightbulbIcon, HelpCircleIcon, TrendingUpIcon, TrendingDownIcon, 
  CheckCircleIcon, AlertTriangleIcon, PieChartIcon
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

// Add Chart.js for pie chart visualization
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

export function BudgetInsights() {
  const { budget, isCalculated } = useBudgetContext();
  const [autoExpandValue, setAutoExpandValue] = useState<string | null>(null);

  // Define a safe number handling helper
  const safeNumber = (value: any, defaultValue = 0): number => {
    return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
  };
  
  // Chart options for all pie charts
  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    maintainAspectRatio: true,
    responsive: true
  };

  // Category chart data
  interface CategoryData {
    data: {
      labels: string[];
      datasets: {
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
      }[];
    } | null;
    total: number;
  }

  interface CategoryCharts {
    needs: CategoryData;
    wants: CategoryData;
    savings: CategoryData;
  }

  // Generate pie charts for each category
  const generateCategoryCharts = (): CategoryCharts => {
    const defaultCharts: CategoryCharts = {
      needs: { data: null, total: 0 },
      wants: { data: null, total: 0 },
      savings: { data: null, total: 0 }
    };
    
    if (!isCalculated || !budget) return defaultCharts;
    
    // Process needs items
    if (budget.needs && budget.needs.length > 0) {
      const needsTotal = budget.needs.reduce((sum, item) => sum + safeNumber(item.amount), 0);
      const needsData = {
        labels: budget.needs.map(item => item.name),
        datasets: [
          {
            data: budget.needs.map(item => (safeNumber(item.amount) / needsTotal) * 100),
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(201, 203, 207, 0.7)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(201, 203, 207, 1)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
            ],
            borderWidth: 1,
          },
        ],
      };
      defaultCharts.needs = { data: needsData, total: needsTotal };
    }
    
    // Process wants items
    if (budget.wants && budget.wants.length > 0) {
      const wantsTotal = budget.wants.reduce((sum, item) => sum + safeNumber(item.amount), 0);
      const wantsData = {
        labels: budget.wants.map(item => item.name),
        datasets: [
          {
            data: budget.wants.map(item => (safeNumber(item.amount) / wantsTotal) * 100),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(201, 203, 207, 0.5)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(201, 203, 207, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
      defaultCharts.wants = { data: wantsData, total: wantsTotal };
    }
    
    // Process savings items
    if (budget.savings && budget.savings.length > 0) {
      const savingsTotal = budget.savings.reduce((sum, item) => sum + safeNumber(item.amount), 0);
      const savingsData = {
        labels: budget.savings.map(item => item.name),
        datasets: [
          {
            data: budget.savings.map(item => (safeNumber(item.amount) / savingsTotal) * 100),
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(201, 203, 207, 0.5)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(201, 203, 207, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
      defaultCharts.savings = { data: savingsData, total: savingsTotal };
    }
    
    return defaultCharts;
  };

  // Calculate percentages and status for each category
  interface CategoryInsight {
    amount: number;
    percentage: number;
    target: number;
    diff: number;
    status: 'on-target' | 'over' | 'under';
    tips: string[];
  }

  interface BudgetInsight {
    needs: CategoryInsight;
    wants: CategoryInsight;
    savings: CategoryInsight;
  }

  const calculateInsights = (): BudgetInsight | null => {
    if (!isCalculated || !budget?.calculations) return null;

    const totalIncome = safeNumber(budget.calculations.totalIncome);
    const idealAmounts = budget.calculations.idealAmounts || {
      needs: totalIncome * 0.5,
      wants: totalIncome * 0.3,
      savings: totalIncome * 0.2
    };

    const needsAmount = safeNumber(budget.calculations.categoryTotals?.needs);
    const wantsAmount = safeNumber(budget.calculations.categoryTotals?.wants);
    const savingsAmount = safeNumber(budget.calculations.categoryTotals?.savings);

    const needsPercentage = totalIncome > 0 ? (needsAmount / totalIncome) * 100 : 0;
    const wantsPercentage = totalIncome > 0 ? (wantsAmount / totalIncome) * 100 : 0;
    const savingsPercentage = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

    const needsDiff = needsAmount - idealAmounts.needs;
    const wantsDiff = wantsAmount - idealAmounts.wants;
    const savingsDiff = savingsAmount - idealAmounts.savings;

    const THRESHOLD = 2; // percentage points difference to be considered on target

    const getStatus = (actual: number, target: number): 'on-target' | 'over' | 'under' => {
      const diff = (actual - target) / target * 100;
      if (Math.abs(diff) <= THRESHOLD) return 'on-target';
      return diff > 0 ? 'over' : 'under';
    };

    const needsStatus = getStatus(needsPercentage, 50);
    const wantsStatus = getStatus(wantsPercentage, 30);
    const savingsStatus = getStatus(savingsPercentage, 20);

    // Generate personalized tips based on status
    const getNeedsTips = (status: string, diff: number): string[] => {
      if (status === 'over') {
        return [
          "Consider reviewing your housing costs. Can you negotiate rent/mortgage or find a more affordable option?",
          "Look for cheaper alternatives for essential utilities like internet and phone plans.",
          "Try meal planning and bulk shopping to reduce grocery expenses."
        ];
      } else if (status === 'under') {
        return [
          "You're spending less than recommended on necessities, which is good if your needs are truly met.",
          "Ensure you're not sacrificing essential healthcare or nutrition to save money.",
          "Consider if there are any delayed maintenance issues that should be addressed."
        ];
      }
      return ["Your essential spending is well-balanced. Keep it up!"];
    };

    const getWantsTips = (status: string, diff: number): string[] => {
      if (status === 'over') {
        return [
          "Track your discretionary spending for a month to identify areas you can cut back.",
          "Try implementing a 24-hour rule before making non-essential purchases.",
          "Consider finding free or low-cost alternatives for entertainment."
        ];
      } else if (status === 'under') {
        return [
          "You're doing great at limiting discretionary spending!",
          "If you're cutting too many enjoyable activities, consider allocating some of this savings to self-care.",
          "Balance is important - make sure you're allowing yourself some quality-of-life expenses."
        ];
      }
      return ["Your discretionary spending is well-balanced. Keep it up!"];
    };

    const getSavingsTips = (status: string, diff: number): string[] => {
      if (status === 'over') {
        return [
          "Great job prioritizing savings and debt repayment!",
          "Make sure you have an emergency fund before focusing too much on other savings goals.",
          "Consider if you're paying down debt efficiently (focusing on highest interest first)."
        ];
      } else if (status === 'under') {
        return [
          "Try automating your savings to ensure you meet your targets.",
          "Look for ways to shift some spending from wants to savings.",
          "Even small increases in savings can make a big difference over time."
        ];
      }
      return ["Your savings rate is right on target. Keep it up!"];
    };

    return {
      needs: {
        amount: needsAmount,
        percentage: needsPercentage,
        target: 50,
        diff: needsDiff,
        status: needsStatus,
        tips: getNeedsTips(needsStatus, needsDiff),
      },
      wants: {
        amount: wantsAmount,
        percentage: wantsPercentage,
        target: 30,
        diff: wantsDiff,
        status: wantsStatus,
        tips: getWantsTips(wantsStatus, wantsDiff),
      },
      savings: {
        amount: savingsAmount,
        percentage: savingsPercentage,
        target: 20,
        diff: savingsDiff,
        status: savingsStatus,
        tips: getSavingsTips(savingsStatus, savingsDiff),
      }
    };
  };

  const insights = calculateInsights();
  const categoryCharts = generateCategoryCharts();

  // Auto-expand sections that are significantly off-target (more than 10%)
  useEffect(() => {
    if (!insights) return;

    const needsDiff = Math.abs(insights.needs.percentage - 50);
    const wantsDiff = Math.abs(insights.wants.percentage - 30);
    const savingsDiff = Math.abs(insights.savings.percentage - 20);

    if (needsDiff > 10) {
      setAutoExpandValue('needs');
    } else if (wantsDiff > 10) {
      setAutoExpandValue('wants');
    } else if (savingsDiff > 10) {
      setAutoExpandValue('savings');
    } else {
      setAutoExpandValue('category-insights'); // Default to category insights
    }
  }, [insights]);

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">Budget Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your income and expenses to see personalized budget insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Helper to get the appropriate icon based on the status
  const getCategoryIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <TrendingUpIcon className="h-5 w-5 text-red-500" />;
      case 'under':
        return <TrendingDownIcon className="h-5 w-5 text-blue-500" />;
      case 'on-target':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <HelpCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper to get the color class based on the status
  const getCategoryColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-500';
      case 'under':
        return 'text-blue-500';
      case 'on-target':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Helper to get the progress bar color class based on the status
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'bg-red-500';
      case 'under':
        return 'bg-blue-500';
      case 'on-target':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to get the status text
  const getStatusText = (category: string, status: string, diff: number) => {
    const formattedDiff = formatCurrency(Math.abs(diff));
    
    if (status === 'on-target') {
      return `Your ${category} spending is right on target!`;
    }
    
    if (status === 'over') {
      return `You're over budget in ${category} by ${formattedDiff}`;
    }
    
    return `You're under budget in ${category} by ${formattedDiff}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <LightbulbIcon className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Budget Insights
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          See how your spending aligns with the 50/30/20 rule and get tips to optimize.
        </p>
        
        <Accordion type="single" collapsible defaultValue={autoExpandValue || undefined}>
          {/* Category Insights Section */}
          <AccordionItem value="category-insights" className="border-b border-gray-200 dark:border-gray-700">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                <PieChartIcon className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
                <span className="ml-2 font-medium">Where Your Money Goes</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="h-4 w-4 ml-2 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">
                        See the breakdown of your spending within each category to identify 
                        what specific expenses are consuming the largest portions of your budget.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4 space-y-6">
                {categoryCharts && (
                  <>
                    {/* Needs breakdown */}
                    {categoryCharts.needs.data && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Needs Breakdown</h4>
                        <div className="flex flex-col md:flex-row items-center">
                          <div className="w-full md:w-2/3 max-w-[300px] mx-auto md:mx-0">
                            <Pie 
                              data={categoryCharts.needs.data} 
                              options={chartOptions}
                            />
                          </div>
                          <div className="w-full md:w-1/3 mt-4 md:mt-0 text-sm">
                            <p>Total Needs: {formatCurrency(categoryCharts.needs.total)}</p>
                            {budget?.needs?.map((item, index) => (
                              <div key={index} className="flex justify-between mt-1">
                                <span>{item.name}:</span>
                                <span>{formatPercentage(safeNumber(item.amount) / categoryCharts.needs.total * 100)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Wants breakdown */}
                    {categoryCharts.wants.data && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Wants Breakdown</h4>
                        <div className="flex flex-col md:flex-row items-center">
                          <div className="w-full md:w-2/3 max-w-[300px] mx-auto md:mx-0">
                            <Pie 
                              data={categoryCharts.wants.data}
                              options={chartOptions}
                            />
                          </div>
                          <div className="w-full md:w-1/3 mt-4 md:mt-0 text-sm">
                            <p>Total Wants: {formatCurrency(categoryCharts.wants.total)}</p>
                            {budget?.wants?.map((item, index) => (
                              <div key={index} className="flex justify-between mt-1">
                                <span>{item.name}:</span>
                                <span>{formatPercentage(safeNumber(item.amount) / categoryCharts.wants.total * 100)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Savings breakdown */}
                    {categoryCharts.savings.data && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Savings & Debt Breakdown</h4>
                        <div className="flex flex-col md:flex-row items-center">
                          <div className="w-full md:w-2/3 max-w-[300px] mx-auto md:mx-0">
                            <Pie 
                              data={categoryCharts.savings.data}
                              options={chartOptions}
                            />
                          </div>
                          <div className="w-full md:w-1/3 mt-4 md:mt-0 text-sm">
                            <p>Total Savings: {formatCurrency(categoryCharts.savings.total)}</p>
                            {budget?.savings?.map((item, index) => (
                              <div key={index} className="flex justify-between mt-1">
                                <span>{item.name}:</span>
                                <span>{formatPercentage(safeNumber(item.amount) / categoryCharts.savings.total * 100)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {(!categoryCharts || (!categoryCharts.needs.data && !categoryCharts.wants.data && !categoryCharts.savings.data)) && (
                  <div className="text-center py-4 text-gray-500">
                    Add budget items to see where your money is going within each category.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Needs Section */}
          <AccordionItem value="needs" className="border-b border-gray-200 dark:border-gray-700">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                {getCategoryIcon(insights.needs.status)}
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
                <div className={`mb-3 font-medium ${getCategoryColor(insights.needs.status)}`}>
                  {getStatusText('needs', insights.needs.status, insights.needs.diff)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: {formatPercentage(insights.needs.percentage)}</span>
                    <span>Target: 50%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className={`h-2 rounded ${getProgressColor(insights.needs.status)}`}
                        style={{ width: `${Math.min(100, insights.needs.percentage)}%` }}
                      ></div>
                    </div>
                    <div className="absolute h-2 left-1/2 top-1 border-l border-gray-400 dark:border-gray-500" style={{transform: 'translateX(-1px)'}}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatCurrency(insights.needs.amount)} of {formatCurrency(safeNumber(budget?.calculations?.totalIncome))}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                    Tips for optimization:
                  </h4>
                  <ul className="ml-5 list-disc space-y-1">
                    {insights.needs.tips.map((tip, index) => (
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
                {getCategoryIcon(insights.wants.status)}
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
                <div className={`mb-3 font-medium ${getCategoryColor(insights.wants.status)}`}>
                  {getStatusText('wants', insights.wants.status, insights.wants.diff)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: {formatPercentage(insights.wants.percentage)}</span>
                    <span>Target: 30%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className={`h-2 rounded ${getProgressColor(insights.wants.status)}`}
                        style={{ width: `${Math.min(100, insights.wants.percentage)}%` }}
                      ></div>
                    </div>
                    <div className="absolute h-2 left-[30%] top-1 border-l border-gray-400 dark:border-gray-500" style={{transform: 'translateX(-1px)'}}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatCurrency(insights.wants.amount)} of {formatCurrency(safeNumber(budget?.calculations?.totalIncome))}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                    Tips for optimization:
                  </h4>
                  <ul className="ml-5 list-disc space-y-1">
                    {insights.wants.tips.map((tip, index) => (
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
                {getCategoryIcon(insights.savings.status)}
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
                <div className={`mb-3 font-medium ${getCategoryColor(insights.savings.status)}`}>
                  {getStatusText('savings', insights.savings.status, insights.savings.diff)}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: {formatPercentage(insights.savings.percentage)}</span>
                    <span>Target: 20%</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className={`h-2 rounded ${getProgressColor(insights.savings.status)}`}
                        style={{ width: `${Math.min(100, insights.savings.percentage)}%` }}
                      ></div>
                    </div>
                    <div className="absolute h-2 left-[20%] top-1 border-l border-gray-400 dark:border-gray-500" style={{transform: 'translateX(-1px)'}}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatCurrency(insights.savings.amount)} of {formatCurrency(safeNumber(budget?.calculations?.totalIncome))}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                    Tips for optimization:
                  </h4>
                  <ul className="ml-5 list-disc space-y-1">
                    {insights.savings.tips.map((tip, index) => (
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