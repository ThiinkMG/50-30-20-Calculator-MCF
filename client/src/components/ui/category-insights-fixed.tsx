import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChartIcon, DollarSignIcon, PercentIcon } from "lucide-react";
import { useBudgetContext } from "@/context/budget-context";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function CategoryInsights() {
  const { budget, isCalculated } = useBudgetContext();
  const [expanded, setExpanded] = useState<string>("needs");

  if (!isCalculated || !budget) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <PieChartIcon className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
            Where Your Money Goes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your income and expenses to see a breakdown of your spending by category.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process category data into usable format with percentages
  const processCategory = (items: Array<any> = []) => {
    const processedItems = items.map(item => ({
      name: item.name || "Unnamed",
      amount: typeof item.amount === 'number' ? item.amount : 0
    }));
    
    const total = processedItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate percentages
    const itemsWithPercentage = processedItems.map(item => ({
      ...item,
      percentage: total > 0 ? (item.amount / total) * 100 : 0
    }));
    
    // Sort by amount (highest to lowest)
    return {
      items: itemsWithPercentage.sort((a, b) => b.amount - a.amount),
      total
    };
  };
  
  const needsData = processCategory(budget.needs);
  const wantsData = processCategory(budget.wants);
  const savingsData = processCategory(budget.savings);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "needs":
        return "bg-blue-500";
      case "wants":
        return "bg-purple-500";
      case "savings":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <PieChartIcon className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Where Your Money Goes
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          See how your spending breaks down within each budget category.
        </p>

        <Accordion 
          type="single" 
          collapsible 
          defaultValue={expanded}
          onValueChange={(value) => setExpanded(value || "needs")}
        >
          {/* Needs Section */}
          <AccordionItem value="needs" className="border-b border-gray-200 dark:border-gray-700">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="font-medium">Needs</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({formatCurrency(needsData.total)})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                {needsData.items.length === 0 ? (
                  <p className="text-sm text-gray-500">No expenses in this category.</p>
                ) : (
                  <div className="space-y-4">
                    {needsData.items.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 flex items-center">
                              <PercentIcon className="h-3 w-3 mr-1" />
                              {formatPercentage(item.percentage)}
                            </span>
                            <span className="flex items-center">
                              <DollarSignIcon className="h-3 w-3 mr-1" />
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getCategoryColor("needs")}`}
                            style={{ width: `${Math.max(5, Math.min(100, item.percentage))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Wants Section */}
          <AccordionItem value="wants" className="border-b border-gray-200 dark:border-gray-700">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="font-medium">Wants</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({formatCurrency(wantsData.total)})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                {wantsData.items.length === 0 ? (
                  <p className="text-sm text-gray-500">No expenses in this category.</p>
                ) : (
                  <div className="space-y-4">
                    {wantsData.items.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 flex items-center">
                              <PercentIcon className="h-3 w-3 mr-1" />
                              {formatPercentage(item.percentage)}
                            </span>
                            <span className="flex items-center">
                              <DollarSignIcon className="h-3 w-3 mr-1" />
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getCategoryColor("wants")}`}
                            style={{ width: `${Math.max(5, Math.min(100, item.percentage))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Savings Section */}
          <AccordionItem value="savings" className="border-b-0">
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="font-medium">Savings & Debt</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({formatCurrency(savingsData.total)})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                {savingsData.items.length === 0 ? (
                  <p className="text-sm text-gray-500">No expenses in this category.</p>
                ) : (
                  <div className="space-y-4">
                    {savingsData.items.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 flex items-center">
                              <PercentIcon className="h-3 w-3 mr-1" />
                              {formatPercentage(item.percentage)}
                            </span>
                            <span className="flex items-center">
                              <DollarSignIcon className="h-3 w-3 mr-1" />
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${getCategoryColor("savings")}`}
                            style={{ width: `${Math.max(5, Math.min(100, item.percentage))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}