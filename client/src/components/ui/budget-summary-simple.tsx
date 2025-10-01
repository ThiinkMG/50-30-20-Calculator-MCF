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
import { useGeneratePdf } from "@/lib/share-utils";
import { EmailModal } from "@/components/ui/email-modal-simple";

export function BudgetSummary() {
  const { budget, isCalculated } = useBudgetContext();
  const { toast } = useToast();
  const { generatePdf } = useGeneratePdf();
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Social media sharing functions with improved URLs for better previews
  const shareOnTwitter = () => {
    if (!isCalculated) return;
    const text = `Check out this 50/30/20 Budget Calculator by @MyCollegeFinance`;
    const url = 'https://50-30-20-budget-calculator-mcf.replit.app/';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    if (!isCalculated) return;
    const url = 'https://50-30-20-budget-calculator-mcf.replit.app/';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    if (!isCalculated) return;
    const url = 'https://50-30-20-budget-calculator-mcf.replit.app/';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
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
    <>
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
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleDownloadReport} className="inline-flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button onClick={handleEmailReport} variant="secondary" className="inline-flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
            <div className="flex space-x-2">
              <Button 
                onClick={shareOnTwitter}
                size="sm"
                variant="outline"
                className="flex items-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 border-[#1DA1F2]/20"
              >
                <Twitter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Twitter</span>
              </Button>
              <Button 
                onClick={shareOnFacebook}
                size="sm"
                variant="outline"
                className="flex items-center rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border-[#1877F2]/20"
              >
                <Facebook className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Facebook</span>
              </Button>
              <Button 
                onClick={shareOnLinkedIn}
                size="sm"
                variant="outline"
                className="flex items-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border-[#0A66C2]/20"
              >
                <Linkedin className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">LinkedIn</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <EmailModal 
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        budget={budget}
        isCalculated={isCalculated}
      />
    </>
  );
}