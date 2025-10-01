import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateServerPdf } from "@/lib/share-utils";
import emailjs from "emailjs-com";
import { initEmailJS, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from "@/lib/emailjs-config";

// Initialize EmailJS with our configuration
initEmailJS(emailjs);

// Define the Budget type inline since there are import issues
interface Budget {
  id?: number;
  income: number;
  additionalIncome: number;
  needs?: Array<{name: string, amount: number, category: string, id?: number}>;
  wants?: Array<{name: string, amount: number, category: string, id?: number}>;
  savings?: Array<{name: string, amount: number, category: string, id?: number}>;
}

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  isCalculated: boolean;
}

export function EmailModal({ open, onOpenChange, budget, isCalculated }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const isValidEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleEmailSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCalculated || !budget) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before sending an email report.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    if (!email || !isValidEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Format the budget data for the email template
      const budgetData = {
        income: budget?.income || 0,
        additionalIncome: budget?.additionalIncome || 0,
        totalIncome: (budget?.income || 0) + (budget?.additionalIncome || 0),
        needs: budget?.needs
          ? budget.needs.map((item: {name: string, amount: number}) => ({
              name: item.name,
              amount: item.amount,
            }))
          : [],
        wants: budget?.wants
          ? budget.wants.map((item: {name: string, amount: number}) => ({
              name: item.name,
              amount: item.amount,
            }))
          : [],
        savings: budget?.savings
          ? budget.savings.map((item: {name: string, amount: number}) => ({
              name: item.name,
              amount: item.amount,
            }))
          : [],
        needsTotal: budget?.needs
          ? budget.needs.reduce((sum: number, item: {amount: number}) => sum + (item.amount || 0), 0)
          : 0,
        wantsTotal: budget?.wants
          ? budget.wants.reduce((sum: number, item: {amount: number}) => sum + (item.amount || 0), 0)
          : 0,
        savingsTotal: budget?.savings
          ? budget.savings.reduce((sum: number, item: {amount: number}) => sum + (item.amount || 0), 0)
          : 0,
      };

      // First try to connect to the server for validation
      try {
        const response = await apiRequest("POST", "/api/email/report", {
          email,
          budget,
        });

        if (!response.ok) {
          throw new Error("Server validation failed");
        }
      } catch (serverError) {
        console.warn(
          "Server validation skipped, continuing with client-side email",
          serverError,
        );
        // Continue with EmailJS even if server validation fails
      }
      
      // Generate a downloadable PDF and get the URL
      let pdfDownloadUrl = "";
      try {
        const downloadUrl = await generateServerPdf(budget);
        if (downloadUrl) {
          pdfDownloadUrl = downloadUrl;
          console.log("PDF generated successfully:", pdfDownloadUrl);
        }
      } catch (pdfError) {
        console.warn("Could not generate PDF for email:", pdfError);
        // Continue sending email even if PDF generation fails
      }

      // Prepare the basic template parameters with consistent names
      const templateParams = {
        user_email: email,
        budget_json: JSON.stringify(budgetData, null, 2), // Formatted JSON
        needs_total: budgetData.needsTotal.toFixed(2),
        wants_total: budgetData.wantsTotal.toFixed(2),
        savings_total: budgetData.savingsTotal.toFixed(2),
        total_income: budgetData.totalIncome.toFixed(2),
        date: new Date().toLocaleDateString(),
        // Only add download_url if it exists and is valid
        ...(pdfDownloadUrl && pdfDownloadUrl.trim() !== '' ? { download_url: pdfDownloadUrl } : {})
      };
      
      // Log what we're sending for debugging
      if (pdfDownloadUrl && pdfDownloadUrl.trim() !== '') {
        console.log("Adding PDF download URL to email:", pdfDownloadUrl);
      } else {
        console.log("No PDF URL available, omitting download button in email");
      }
      
      // Log template parameters for debugging
      console.log("Sending email with the following parameters:", {
        ...templateParams,
        download_url: templateParams.download_url ? "URL exists" : "No URL"
      });
      
      // Use our EmailJS configuration from the config file
      console.log(`Sending email with service: ${EMAILJS_SERVICE_ID} and template: ${EMAILJS_TEMPLATE_ID}`);
      
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log("EmailJS response:", result);

      toast({
        title: "Email sent successfully",
        description: `Your budget report has been sent to ${email}. Please check your spam/junk folder as new emails often go there.`,
      });
      
      // Log detailed debugging info to help troubleshoot
      console.log("Email delivery details:", {
        emailAddress: email,
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        hasPdfUrl: !!pdfDownloadUrl,
        templateParamKeys: Object.keys(templateParams)
      });

      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send email:", error);

      // More specific error messages based on the error type
      let errorMessage =
        "There was an error sending your email report. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Invalid email address")) {
          errorMessage = "Please provide a valid email address.";
        } else if (
          error.message.includes("Network Error") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        }
      }

      toast({
        title: "Email failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Mail className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
            Send Your Budget Report
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>We'll email your budget report to the address you provide below.</p>
            <p className="text-xs text-amber-600 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span>Important: New emails often land in spam/junk folders. Please check there if you don't see it.</span>
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleEmailSend} className="space-y-4 py-4">
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              className="w-full"
              disabled={isSending}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark"
              disabled={isSending || !isValidEmail(email)}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}