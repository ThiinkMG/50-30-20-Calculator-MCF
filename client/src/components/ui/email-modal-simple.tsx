import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail, Loader2, HelpCircle, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from "emailjs-com";
import {
  initEmailJS,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from "@/lib/emailjs-config";
import { generateServerPdf, useGeneratePdf } from "@/lib/share-utils";
import { submitUserToWixDatabase } from "@/lib/wix-database";
import type { Budget as SharedBudget } from "@shared/schema";

// Initialize EmailJS with our configuration
initEmailJS(emailjs);

interface Budget extends SharedBudget {
  calculations?: any;
}

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  isCalculated: boolean;
}

export function EmailModal({
  open,
  onOpenChange,
  budget,
  isCalculated,
}: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);
  const [storeData, setStoreData] = useState(true); // Flag to store data in Wix database // Pre-checked by default
  const [emailSent, setEmailSent] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { generatePdf } = useGeneratePdf();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };
  
  // Handle direct PDF download
  const handleDownloadPdf = async () => {
    try {
      console.log("Download PDF requested, current pdfUrl:", pdfUrl);
      
      if (pdfUrl) {
        console.log("Opening saved PDF URL in new tab:", pdfUrl);
        window.open(pdfUrl, '_blank');
        
        toast({
          title: "Opening Report",
          description: "Your budget report is opening in a new tab.",
        });
      } else {
        // If PDF URL is not available, generate it on-the-fly
        console.log("No PDF URL available, generating on-the-fly");
        toast({
          title: "Generating PDF",
          description: "Please wait while we prepare your PDF...",
        });
        
        // Generate PDF with user's name for personalization, and open in new tab
        const generatedUrl = await generatePdf(name || undefined, true);
        
        // Save the URL for future use
        setPdfUrl(generatedUrl);
        console.log("PDF generated successfully:", generatedUrl);
        
        toast({
          title: "PDF Generated",
          description: "Your budget report has been opened in a new tab.",
        });
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCalculated || !budget) {
      toast({
        title: "No budget calculated",
        description:
          "Please calculate a budget first before sending an email report.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to personalize your report.",
        variant: "destructive",
      });
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

    if (!consentChecked) {
      toast({
        title: "Consent required",
        description: "Please accept the terms to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // First validate with the server
      try {
        const validationResponse = await fetch("/api/email/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            budget: budget,
          }),
        });

        if (!validationResponse.ok) {
          throw new Error(
            `Server validation failed: ${validationResponse.status}`,
          );
        }

        console.log("Server validation passed, proceeding with email");
      } catch (validationError) {
        console.warn(
          "Server validation skipped, continuing with client-side email:",
          validationError,
        );
        // Continue even if validation fails
      }

      // Format the budget data for the email template
      const budgetData = {
        income: budget.income || 0,
        additionalIncome: budget.additionalIncome || 0,
        totalIncome: budget.income + budget.additionalIncome,
        // Add other formatting as needed
      };

      // Generate a downloadable PDF and get the URL - improved reliable approach
      let pdfDownloadUrl = "";
      try {
        // Only attempt PDF generation if budget is available
        if (budget) {
          console.log("Generating PDF for email attachment with name:", name.trim());

          // Use our improved utility function that handles errors properly
          // Pass both budget and user name to personalize the PDF
          // Set openInNewTab to false so it doesn't automatically open during email send
          pdfDownloadUrl = await generatePdf(name.trim(), false);

          if (pdfDownloadUrl) {
            console.log("PDF generated successfully for email:", pdfDownloadUrl);
          } else {
            console.warn("PDF generation returned no URL");
          }
        }
      } catch (pdfError) {
        console.warn("Could not generate PDF for email:", pdfError);
        // Continue sending email even if PDF generation fails
      }

      // Define template params interface with index signature for EmailJS
      interface EmailTemplateParams extends Record<string, unknown> {
        user_email: string;
        user_name?: string;
        subject?: string;
        budget_json: string;
        needs_total: string;
        wants_total: string;
        savings_total: string;
        total_income: string;
        date: string;
        add_to_contacts_message?: string;
        download_url?: string; // Make this optional
      }

      // Format the budget data for the template
      const templateParams: EmailTemplateParams = {
        user_email: email,
        user_name: name.trim() || "Hi there!", // Use provided name or fallback
        subject: "Your My College Finance Budget Report", // Custom subject line
        budget_json: JSON.stringify(budgetData, null, 2),
        needs_total: (
          budget?.needs?.reduce((sum, item) => sum + item.amount, 0) || 0
        ).toFixed(2),
        wants_total: (
          budget?.wants?.reduce((sum, item) => sum + item.amount, 0) || 0
        ).toFixed(2),
        savings_total: (
          budget?.savings?.reduce((sum, item) => sum + item.amount, 0) || 0
        ).toFixed(2),
        total_income: budgetData.totalIncome.toFixed(2),
        date: new Date().toLocaleDateString(),
        add_to_contacts_message:
          "To ensure you receive future budget updates, please add noreply@emailjs.com to your contacts.",
      };

      // Handle PDF download URL separately to ensure it doesn't cause issues
      // Critical: the property MUST be named exactly "download_url" (not camelCase)
      // We're creating a new templateParams object that includes download_url only if it exists
      const finalTemplateParams = {
        ...templateParams,
        ...(pdfDownloadUrl && pdfDownloadUrl.trim() !== ""
          ? { download_url: pdfDownloadUrl }
          : {}),
      };

      if (pdfDownloadUrl && pdfDownloadUrl.trim() !== "") {
        console.log("Adding download_url to email template:", pdfDownloadUrl);
      } else {
        console.log("No PDF URL available, PDF button will be hidden in email");
      }

      console.log("Sending email with template parameters:", {
        ...finalTemplateParams,
        // Use a type assertion to safely check for the download_url property
        download_url:
          "download_url" in finalTemplateParams ? "URL exists" : "No URL",
      });

      // Send email via EmailJS using imported config
      // Create a plain object for EmailJS to avoid TypeScript issues and use our
      // finalTemplateParams that properly includes the download_url

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        finalTemplateParams,
        EMAILJS_PUBLIC_KEY,
      );

      console.log("EmailJS response:", result);

      // Log delivery details for debugging purposes
      console.log("Email delivery details:", {
        emailAddress: email,
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        hasPdfUrl: !!pdfDownloadUrl,
        templateParamKeys: Object.keys(templateParams),
      });

      // Submit user data to Wix database (implied consent via disclaimer)
      try {
        console.log("Submitting user data to Wix database");
        const wixResult = await submitUserToWixDatabase(
          name,
          email,
          budget as SharedBudget,
          true, // Always true now that we use a disclaimer
        );

        console.log("Wix database submission result:", wixResult);

        if (wixResult.success) {
          console.log("Successfully saved user data to Wix database");
        } else {
          console.warn(
            "Failed to save user data to Wix database:",
            wixResult.message,
          );
          // Continue with the email success flow, this is non-critical
        }
      } catch (wixError) {
        console.error("Error submitting to Wix database:", wixError);
        // Continue with the email success flow, this is non-critical
      }

      toast({
        title: "Email sent successfully",
        description: `Your budget report has been sent to ${email}. Please check your spam folder if you don't see it. Adding noreply@emailjs.com to your contacts can prevent this in the future.`,
        duration: 8000, // Show for longer so user can read instructions
      });

      // Update state to show download button
      console.log("Email sent successfully, setting PDF URL for download:", pdfDownloadUrl);
      setPdfUrl(pdfDownloadUrl);
      setEmailSent(true);
      
      // Clear the form fields but keep the modal open
      setEmail("");
      setName("");
      
      // Log current state for debugging
      setTimeout(() => {
        console.log("State after email sent: ", { 
          emailSent: true, 
          pdfUrl: pdfDownloadUrl,
          modalOpen: open
        });
      }, 100);
    } catch (error) {
      console.error("Failed to send email:", error);

      // Log detailed information for diagnostic purposes
      console.log("EmailJS Configuration:", {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKeyLength: EMAILJS_PUBLIC_KEY ? EMAILJS_PUBLIC_KEY.length : 0,
      });

      // Extract more specific error information
      let errorMessage =
        "There was an error sending your email report. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Invalid email")) {
          errorMessage =
            "The email address provided appears to be invalid. Please check and try again.";
        } else if (
          error.message.includes("Network Error") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (
          error.message.includes("service_id") ||
          error.message.includes("template_id")
        ) {
          errorMessage =
            "Email service configuration error. Please contact support.";
        } else {
          // Include part of the actual error message for debugging
          errorMessage = `Error sending email: ${error.message.substring(0, 50)}...`;
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
      <DialogContent className="sm:max-w-md w-full p-6 bg-white dark:bg-gray-900 shadow-xl rounded-lg">
        {!emailSent ? (
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Unlock Your Full Budget Report
            </DialogTitle>
            <DialogDescription className="mt-2 space-y-3">
              <p className="text-gray-600 dark:text-gray-300">
                Receive a detailed summary and a downloadable PDF with your personalized insights.
              </p>
              <div className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <Mail className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  Important: New emails often land in spam/junk folders. Please
                  check there if you don't see it.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Email Sent Successfully
            </DialogTitle>
            <DialogDescription className="mt-2 space-y-3">
              <p className="text-gray-600 dark:text-gray-300">
                Your budget report has been emailed successfully.
              </p>
              <div className="text-sm text-green-600 dark:text-green-400 flex items-start gap-2 bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                <Download className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  You can now download your budget report directly.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
        )}

        {!emailSent ? (
          <form onSubmit={handleEmailSend} className="space-y-5 py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded shadow-lg">
                  <p className="w-48 text-xs">
                    Enter your full name so we can customize your report just for you.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="name"
              type="text"
              placeholder="Rachel Greene"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-800"
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="focus:outline-none">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded shadow-lg">
                  <p className="w-48 text-xs">
                    Enter your email so we can send you the detailed report and PDF.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-800"
              disabled={isSending}
            />
          </div>

          <div className="flex items-start space-x-3 mt-2">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
              className="mt-1 h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded"
            />
            <label
              htmlFor="consent"
              className="text-sm text-gray-600 dark:text-gray-400 leading-tight"
            >
              You agree to receive emails from My College Finance.{" "}
              <a
                href="https://www.mycollegefinance.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus:outline-none"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://www.mycollegefinance.com/terms-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus:outline-none"
              >
                Terms
              </a>
              .
            </label>
          </div>

          <div className="w-full pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
              By submitting this form, your information may be saved and shared
              with My College Finance for future budgeting resources and
              financial opportunities.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-6 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
              className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white transition-colors px-4 py-2 rounded-md disabled:opacity-70"
              disabled={isSending || !isValidEmail(email)}
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span>Send Report</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
        ) : (
          <div className="py-4">
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg w-full mb-6">
              <Download className="h-16 w-16 text-primary dark:text-primary-light mb-4" />
              <h3 className="text-xl font-medium mb-2">Download Your Budget Report</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                Get a local copy of your budget report as a PDF document. Your report contains all the insights and recommendations based on your budget information.
              </p>
              <Button
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white transition-colors px-6 py-3 rounded-md font-medium"
              >
                <Download className="mr-2 h-5 w-5" />
                Download PDF Report
              </Button>
            </div>
            
            <DialogFooter className="flex justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Reset and close dialog
                  setEmailSent(false);
                  setPdfUrl(null);
                  setName("");
                  setEmail("");
                  onOpenChange(false);
                }}
                className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  // Reset form but stay in dialog
                  setEmailSent(false);
                  setPdfUrl(null);
                }}
                className="text-primary hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Send Another Email
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}