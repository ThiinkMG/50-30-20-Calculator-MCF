import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, ArrowRight } from "lucide-react";

export function BudgetEducation() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <GraduationCap className="h-5 w-5 text-accent dark:text-accent-light mr-2" />
          Financial Education
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">What is the 50/30/20 Rule?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The 50/30/20 budget rule is a simple way to manage your money. It suggests allocating 50% of your after-tax income to needs, 30% to wants, and 20% to savings and debt repayment.
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Needs vs. Wants</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Needs are essential expenses required for basic living (housing, food, utilities). Wants are non-essential expenses that improve your quality of life (dining out, entertainment, hobbies).
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Savings & Debt</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This category includes emergency funds, retirement savings, investments, and extra payments toward debt beyond the minimum required payments.
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Why This Method Works</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The 50/30/20 rule provides a simple framework that ensures you're covering necessities, enjoying life, and building financial security. It's flexible enough to adapt to your specific situation while providing clear guidelines.
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <a 
            href="https://www.mycollegefinance.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary dark:text-primary-light hover:underline"
          >
            Learn more about budgeting
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
