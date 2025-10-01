import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Calculator } from "lucide-react";
import { useBudgetContext } from "@/context/budget-context";

const BudgetFormSchema = z.object({
  income: z.coerce.number().min(0, "Income must be a positive number").default(0),
  additionalIncome: z.coerce.number().min(0, "Additional income must be a positive number").default(0),
  
  // Needs
  rent: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  utilities: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  groceries: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  transport: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  insurance: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  otherNeeds: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  
  // Wants
  dining: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  entertainment: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  shopping: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  subscriptions: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  otherWants: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  
  // Savings and Debt
  savings: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  emergency: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  debtPayment: z.coerce.number().min(0, "Amount must be a positive number").default(0),
  investments: z.coerce.number().min(0, "Amount must be a positive number").default(0),
});

type BudgetFormValues = z.infer<typeof BudgetFormSchema>;

const defaultValues: Partial<BudgetFormValues> = {
  // All fields will use their default values from the schema
};

export function BudgetInputForm() {
  const { updateBudget } = useBudgetContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(BudgetFormSchema),
    defaultValues,
  });
  
  // Handler for the Start Over button
  const handleReset = () => {
    // Reset all form fields to their default values (0)
    form.reset({
      income: 0,
      additionalIncome: 0,
      rent: 0,
      utilities: 0,
      groceries: 0,
      transport: 0,
      insurance: 0,
      otherNeeds: 0,
      dining: 0,
      entertainment: 0,
      shopping: 0,
      subscriptions: 0,
      otherWants: 0,
      savings: 0,
      emergency: 0,
      debtPayment: 0,
      investments: 0
    });
    
    // Also clear the budget context to reset visualizations and recommendations
    updateBudget({
      income: 0,
      additionalIncome: 0,
      needs: [],
      wants: [],
      savings: []
    }).catch(error => console.error("Error resetting budget:", error));
  };

  async function onSubmit(data: BudgetFormValues) {
    setIsSubmitting(true);
    
    try {
      // Transform form data to the budget structure
      const budget = {
        income: data.income,
        additionalIncome: data.additionalIncome,
        needs: [
          { name: "Rent/Mortgage", amount: data.rent, category: "needs" as const },
          { name: "Utilities", amount: data.utilities, category: "needs" as const },
          { name: "Groceries", amount: data.groceries, category: "needs" as const },
          { name: "Transportation", amount: data.transport, category: "needs" as const },
          { name: "Insurance", amount: data.insurance, category: "needs" as const },
          { name: "Other Necessities", amount: data.otherNeeds, category: "needs" as const },
        ],
        wants: [
          { name: "Dining Out", amount: data.dining, category: "wants" as const },
          { name: "Entertainment", amount: data.entertainment, category: "wants" as const },
          { name: "Shopping", amount: data.shopping, category: "wants" as const },
          { name: "Subscriptions", amount: data.subscriptions, category: "wants" as const },
          { name: "Other Wants", amount: data.otherWants, category: "wants" as const },
        ],
        savings: [
          { name: "Savings", amount: data.savings, category: "savings" as const },
          { name: "Emergency Fund", amount: data.emergency, category: "savings" as const },
          { name: "Debt Payments", amount: data.debtPayment, category: "savings" as const },
          { name: "Investments", amount: data.investments, category: "savings" as const },
        ],
      };
      
      // Update the budget context
      await updateBudget(budget);
    } catch (error) {
      console.error("Error calculating budget:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calculator className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Income Details
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Monthly Income After Taxes
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Your take-home pay after all taxes have been deducted
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" placeholder="e.g. 3500" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Additional Monthly Income
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Include part-time work, side gigs, scholarships, etc.
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" placeholder="e.g. 500" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />
            
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calculator className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
              Current Expenses
            </h2>
            
            {/* Needs Section */}
            <div>
              <h3 className="text-md font-medium mb-3 flex items-center text-gray-700 dark:text-gray-300">
                Needs (50%)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Essential expenses that you can't avoid - housing, food, utilities, etc.
                  </TooltipContent>
                </Tooltip>
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent/Mortgage</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 1200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Utilities</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 150" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="groceries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groceries</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 400" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportation</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 150" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Necessities</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 100" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Wants Section */}
            <div>
              <h3 className="text-md font-medium my-3 flex items-center text-gray-700 dark:text-gray-300 pt-4">
                Wants (30%)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Non-essential expenses that improve your life - entertainment, dining out, etc.
                  </TooltipContent>
                </Tooltip>
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dining Out</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 250" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entertainment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entertainment</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 150" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shopping"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shopping</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subscriptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscriptions</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 50" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="otherWants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Wants</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 100" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Savings Section */}
            <div>
              <h3 className="text-md font-medium my-3 flex items-center text-gray-700 dark:text-gray-300 pt-4">
                Savings & Debt (20%)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Money set aside for the future or used to pay down debt
                  </TooltipContent>
                </Tooltip>
              </h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="savings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Savings</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 300" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Fund</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 100" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="debtPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Debt Payments</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 250" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="investments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investments</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" className="pl-7" placeholder="e.g. 150" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button 
                type="submit" 
                className="py-3 px-6" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Calculating..." : "Calculate Budget"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-gray-600 dark:text-gray-300"
                onClick={handleReset}
              >
                Start Over
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}