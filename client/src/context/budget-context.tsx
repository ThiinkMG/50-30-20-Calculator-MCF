import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Budget, BudgetItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BudgetContextType {
  budget: Budget & { calculations?: any } | null;
  isCalculated: boolean;
  updateBudget: (budget: Budget) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budget, setBudget] = useState<Budget & { calculations?: any } | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const { toast } = useToast();

  const updateBudget = useCallback(async (newBudget: Budget) => {
    try {
      // Check if this is a reset operation (all values are 0 or empty arrays)
      const isReset = 
        newBudget.income === 0 && 
        newBudget.additionalIncome === 0 && 
        (!newBudget.needs || newBudget.needs.length === 0) && 
        (!newBudget.wants || newBudget.wants.length === 0) && 
        (!newBudget.savings || newBudget.savings.length === 0);
      
      if (isReset) {
        // Handle reset specially - clear state completely
        setBudget(null);
        setIsCalculated(false);
        return null;
      }
      
      // Normal calculation path
      const response = await apiRequest("POST", "/api/budget/calculate", newBudget);
      
      if (!response.ok) {
        throw new Error("Failed to calculate budget");
      }
      
      const calculatedBudget = await response.json();
      setBudget(calculatedBudget);
      setIsCalculated(true);
      
      toast({
        title: "Budget calculated",
        description: "Your budget has been calculated successfully."
      });
      
      return calculatedBudget;
    } catch (error) {
      console.error("Error calculating budget:", error);
      toast({
        title: "Calculation failed",
        description: "There was an error calculating your budget. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return (
    <BudgetContext.Provider value={{ budget, isCalculated, updateBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useBudgetContext() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudgetContext must be used within a BudgetProvider");
  }
  return context;
}
