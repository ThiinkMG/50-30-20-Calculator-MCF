import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  PieChart 
} from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useBudgetContext } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useGeneratePdf } from "@/lib/share-utils";
import { EmailModal } from "@/components/ui/email-modal";

export function BudgetSummary() {
  const { budget, isCalculated } = useBudgetContext();
  const { toast } = useToast();
  const { generatePdf } = useGeneratePdf();
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Social media sharing functions
  const shareOnTwitter = () => {
    if (!isCalculated) return;
    const text = `Check out my 50/30/20 budget breakdown with My College Finance's Budget Calculator!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    if (!isCalculated) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    if (!isCalculated) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  // Download PDF report
  const handleDownloadReport = async () => {
    if (!isCalculated) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before downloading a report.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await generatePdf();
      toast({
        title: "Report downloaded",
        description: "Your budget report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Failed to download report:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Email report - opens the modal instead of using prompt
  const handleEmailReport = () => {
    if (!isCalculated) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before sending an email report.",
        variant: "destructive",
      });
      return;
    }
    
    // Open the email modal dialog
    setEmailModalOpen(true);
  };
  
  // Calculate budget values for display
  const calculatedValues = useMemo(() => {
    if (!budget?.calculations) {
      return {
        totalIncome: 0,
        needsTotal: 0,
        wantsTotal: 0,
        savingsTotal: 0,
        totalExpenses: 0,
        remaining: 0,
        needsPercentage: 0,
        wantsPercentage: 0,
        savingsPercentage: 0,
        idealNeeds: 0,
        idealWants: 0,
        idealSavings: 0,
        needsAdjustment: 0,
        wantsAdjustment: 0,
        savingsAdjustment: 0,
        needsBarWidth: "0%",
        wantsBarWidth: "0%",
        savingsBarWidth: "0%",
        remainingBarWidth: "0%"
      };
    }
    
    const {
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
      savingsAdjustment
    } = budget.calculations;
    
    // Calculate bar widths for the progress bar
    const needsBarWidth = `${needsPercentage}%`;
    const wantsBarWidth = `${wantsPercentage}%`;
    const savingsBarWidth = `${savingsPercentage}%`;
    
    // Calculate the remaining percentage for the progress bar
    const remainingPercentage = 100 - needsPercentage - wantsPercentage - savingsPercentage;
    const remainingBarWidth = `${remainingPercentage > 0 ? remainingPercentage : 0}%`;
    
    return {
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
      needsBarWidth,
      wantsBarWidth,
      savingsBarWidth,
      remainingBarWidth
    };
  }, [budget]);

  if (!isCalculated) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <PieChart className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
            Budget Summary
          </h2>
          <div className="text-center py-10 text-muted-foreground">
            <p>Calculate your budget to see the summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8" id="budgetSummary">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <PieChart className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Budget Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Needs (50%)</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {formatCurrency(calculatedValues.needsTotal)}
            </p>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
              {formatPercentage(calculatedValues.needsPercentage)}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Wants (30%)</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              {formatCurrency(calculatedValues.wantsTotal)}
            </p>
            <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
              {formatPercentage(calculatedValues.wantsPercentage)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Savings & Debt (20%)</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
              {formatCurrency(calculatedValues.savingsTotal)}
            </p>
            <p className="text-sm text-green-600/70 dark:text-green-400/70">
              {formatPercentage(calculatedValues.savingsPercentage)}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Income</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(calculatedValues.totalIncome)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(calculatedValues.totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Remaining</span>
            <span className={`text-sm font-bold ${calculatedValues.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(calculatedValues.remaining)}
            </span>
          </div>
        </div>
        
        <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mb-6">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 dark:bg-blue-600" 
            style={{ width: calculatedValues.needsBarWidth }}
          ></div>
          <div 
            className="absolute top-0 h-full bg-purple-500 dark:bg-purple-600" 
            style={{ 
              width: calculatedValues.wantsBarWidth, 
              left: calculatedValues.needsBarWidth 
            }}
          ></div>
          <div 
            className="absolute top-0 h-full bg-green-500 dark:bg-green-600" 
            style={{ 
              width: calculatedValues.savingsBarWidth, 
              left: `calc(${calculatedValues.needsBarWidth} + ${calculatedValues.wantsBarWidth})` 
            }}
          ></div>
          <div 
            className="absolute top-0 h-full bg-gray-300 dark:bg-gray-600" 
            style={{ 
              width: calculatedValues.remainingBarWidth, 
              left: `calc(${calculatedValues.needsBarWidth} + ${calculatedValues.wantsBarWidth} + ${calculatedValues.savingsBarWidth})` 
            }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ideal Budget</h3>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Needs: 50%</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(calculatedValues.idealNeeds)}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Wants: 30%</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(calculatedValues.idealWants)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Savings & Debt: 20%</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(calculatedValues.idealSavings)}
              </span>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
              <span>Over/Under Budget</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 cursor-help" title="This shows how far each category is from your ideal 50/30/20 budget split.">
                ℹ️ What's this?
              </span>
            </h3>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Needs:</span>
              <span className="flex items-center">
                <span className={`text-xs font-medium ${calculatedValues.needsAdjustment > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {calculatedValues.needsAdjustment > 0 
                    ? <span className="mr-1 text-red-600 dark:text-red-400">🔼 Over by {formatCurrency(Math.abs(calculatedValues.needsAdjustment))}</span>
                    : <span className="mr-1 text-green-600 dark:text-green-400">🔽 Under by {formatCurrency(Math.abs(calculatedValues.needsAdjustment))}</span>
                  }
                </span>
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Wants:</span>
              <span className="flex items-center">
                <span className={`text-xs font-medium ${calculatedValues.wantsAdjustment > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {calculatedValues.wantsAdjustment > 0 
                    ? <span className="mr-1 text-red-600 dark:text-red-400">🔼 Over by {formatCurrency(Math.abs(calculatedValues.wantsAdjustment))}</span>
                    : <span className="mr-1 text-green-600 dark:text-green-400">🔽 Under by {formatCurrency(Math.abs(calculatedValues.wantsAdjustment))}</span>
                  }
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Savings & Debt:</span>
              <span className="flex items-center">
                <span className={`text-xs font-medium ${calculatedValues.savingsAdjustment > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {calculatedValues.savingsAdjustment > 0 
                    ? <span className="mr-1 text-red-600 dark:text-red-400">🔼 Over by {formatCurrency(Math.abs(calculatedValues.savingsAdjustment))}</span>
                    : <span className="mr-1 text-green-600 dark:text-green-400">🔽 Under by {formatCurrency(Math.abs(calculatedValues.savingsAdjustment))}</span>
                  }
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={handleDownloadReport} className="inline-flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={handleEmailReport} variant="secondary" className="inline-flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Email Report
          </Button>
          <div className="inline-flex rounded-md shadow-sm">
            <Button 
              onClick={shareOnTwitter}
              variant="outline"
              className="inline-flex items-center px-3 py-2 rounded-l-md text-gray-700 dark:text-gray-200"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button 
              onClick={shareOnFacebook}
              variant="outline"
              className="inline-flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 rounded-none border-l-0 border-r-0"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button 
              onClick={shareOnLinkedIn}
              variant="outline"
              className="inline-flex items-center px-3 py-2 rounded-r-md text-gray-700 dark:text-gray-200"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* Email Modal */}
    <EmailModal 
      open={emailModalOpen}
      onOpenChange={setEmailModalOpen}
      budget={budget}
      isCalculated={isCalculated}
    />
  );
}
