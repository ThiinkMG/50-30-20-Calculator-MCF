import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Share,
  Send,
  Cloud,
  HelpCircle,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Download,
  CheckCircle,
  X,
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBudgetContext } from "@/context/budget-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { shareSocial, usePendingShareCheck, getShareUrls } from "@/lib/share-social";
import { generateServerPdf, useGeneratePdf } from "@/lib/share-utils";
import { submitUserToWixDatabase } from "@/lib/wix-database";
import emailjs from "emailjs-com";
import { initEmailJS, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from "@/lib/emailjs-config";
import type { Budget as SharedBudget } from "@shared/schema";

// Initialize EmailJS with our centralized configuration
initEmailJS(emailjs);

// Email Success Dialog Component
function EmailSentDialog({ 
  open, 
  onOpenChange,
  pdfUrl,
  onSendAnother
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  onSendAnother: () => void;
}) {
  const { generatePdf } = useGeneratePdf();
  
  const handleDownloadPdf = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      // If no PDF URL is available (unlikely at this point)
      await generatePdf();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-950 text-white border-none">
        <button 
          onClick={() => onOpenChange(false)} 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl gap-2 text-green-400">
            <CheckCircle className="h-6 w-6" />
            Email Sent Successfully
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Your budget report has been emailed successfully.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-900/60 p-3 rounded-md border border-green-950 my-3">
          <div className="flex items-center text-green-400 gap-2">
            <Download className="h-5 w-5" />
            <p className="text-sm font-medium">
              You can now download your budget report directly.
            </p>
          </div>
        </div>
        
        <div className="my-6 flex flex-col items-center bg-gray-900 rounded-lg p-6">
          <Download className="h-16 w-16 text-blue-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Download Your Budget Report</h3>
          <p className="text-sm text-center text-gray-400 mb-4">
            Get a local copy of your budget report as a PDF document. Your report contains all the insights and recommendations based on your budget information.
          </p>
          <Button
            onClick={handleDownloadPdf}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF Report
          </Button>
        </div>
        
        <DialogFooter className="flex justify-between gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-gray-900 hover:bg-gray-800 border-gray-800 text-white"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onSendAnother();
              onOpenChange(false);
            }}
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 hover:bg-gray-800"
          >
            Send Another Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShareWidget() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showEmailSuccessModal, setShowEmailSuccessModal] = useState(false);
  const { budget, isCalculated } = useBudgetContext();
  const { toast } = useToast();
  
  // Check for pending social shares when component mounts
  usePendingShareCheck();
  
  // Get the share URLs from our utility
  const shareUrls = getShareUrls();

  const isValidEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };
  
  const resetEmailForm = () => {
    setEmail("");
    setName("");
    setPdfUrl(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCalculated || !budget) {
      toast({
        title: "No budget calculated",
        description:
          "Please calculate a budget first before sending an email report.",
        variant: "destructive",
      });
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

    setIsSending(true);

    try {
      // Format the budget data for the email template
      const budgetData = {
        income: budget?.income || 0,
        additionalIncome: budget?.additionalIncome || 0,
        totalIncome: (budget?.income || 0) + (budget?.additionalIncome || 0),
        needs: budget?.needs
          ? budget.needs.map((item) => ({
              name: item.name,
              amount: item.amount,
            }))
          : [],
        wants: budget?.wants
          ? budget.wants.map((item) => ({
              name: item.name,
              amount: item.amount,
            }))
          : [],
        savings: budget?.savings
          ? budget.savings.map((item) => ({
              name: item.name,
              amount: item.amount,
            }))
          : [],
        needsTotal: budget?.needs
          ? budget.needs.reduce((sum, item) => sum + item.amount, 0)
          : 0,
        wantsTotal: budget?.wants
          ? budget.wants.reduce((sum, item) => sum + item.amount, 0)
          : 0,
        savingsTotal: budget?.savings
          ? budget.savings.reduce((sum, item) => sum + item.amount, 0)
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
        // Only attempt PDF generation if budget is available
        if (budget) {
          // Pass both budget and userName to the PDF generation function
          const downloadUrl = await generateServerPdf(budget, name.trim());
          if (downloadUrl) {
            pdfDownloadUrl = downloadUrl;
            console.log("PDF generated successfully with user name:", pdfDownloadUrl);
          }
        }
      } catch (pdfError) {
        console.warn("Could not generate PDF for email:", pdfError);
        // Continue sending email even if PDF generation fails
      }

      // Prepare template parameters with consistent naming
      const templateParams = {
        user_email: email,
        user_name: name.trim() || 'Hi there!', // Use provided name or fallback
        subject: 'Your My College Finance Budget Report', // Custom subject line
        add_to_contacts_message: 'To ensure you receive future budget updates, please add noreply@emailjs.com to your contacts.',
        budget_json: JSON.stringify(budgetData, null, 2), // Formatted JSON 
        needs_total: budgetData.needsTotal.toFixed(2),
        wants_total: budgetData.wantsTotal.toFixed(2),
        savings_total: budgetData.savingsTotal.toFixed(2),
        total_income: budgetData.totalIncome.toFixed(2),
        date: new Date().toLocaleDateString(),
        // Only add download_url if it exists and is valid
        ...(pdfDownloadUrl && pdfDownloadUrl.trim() !== '' ? { download_url: pdfDownloadUrl } : {})
      };
      
      // Send email via EmailJS using our configuration
      console.log(`Sending email with service: ${EMAILJS_SERVICE_ID} and template: ${EMAILJS_TEMPLATE_ID}`);
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID, 
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log("EmailJS response:", result);

      // Submit user data to Wix database (implied consent via disclaimer)
      try {
        console.log("Submitting user data to Wix database");
        const wixResult = await submitUserToWixDatabase(
          name, 
          email, 
          budget as SharedBudget,
          true // Always true now that we use a disclaimer
        );
        
        console.log("Wix database submission result:", wixResult);
      } catch (wixError) {
        console.error("Error submitting to Wix database:", wixError);
        // Continue with the email success flow, this is non-critical
      }

      // Save the PDF URL for the success dialog
      setPdfUrl(pdfDownloadUrl);
      
      // Show a toast notification
      toast({
        title: "Email sent successfully",
        description: `Your budget report has been sent to ${email}.`,
        duration: 3000, // Shorter duration since we'll show the modal
      });
      
      // Show the email success modal with download option
      setShowEmailSuccessModal(true);
    } catch (error) {
      console.error("Failed to send email:", error);

      // More specific error messages based on the error type
      let errorMessage =
        "There was an error sending your email report. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Invalid email")) {
          errorMessage = "The email address provided appears to be invalid. Please check and try again.";
        } else if (
          error.message.includes("Network Error") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (
          error.message.includes("service_id") ||
          error.message.includes("template_id")
        ) {
          errorMessage = "Email service configuration error. Please contact support.";
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

  const handleGoogleSignIn = async () => {
    if (!isCalculated) {
      toast({
        title: "No budget calculated",
        description:
          "Please calculate a budget first before saving to Google Drive.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import the Google Drive API functions
      const { getGoogleAuthUrl, uploadBudgetToDrive } = await import(
        "@/lib/google-drive"
      );

      try {
        // Try to upload directly first - this will work if already authenticated
        // Make sure budget is not null before uploading
        if (!budget) {
          toast({
            title: "No budget data",
            description:
              "Please calculate a budget first before saving to Google Drive.",
            variant: "destructive",
          });
          return;
        }
        const result = await uploadBudgetToDrive(budget);

        if (result.needsAuth) {
          // User needs to authenticate - the API already handled the redirect
          return;
        }

        // Upload was successful
        toast({
          title: "Saved to Google Drive",
          description:
            "Your budget has been successfully saved to your Google Drive.",
        });
      } catch (error: any) {
        if (error.message?.includes("authentication required")) {
          // Get auth URL and redirect
          const authUrl = await getGoogleAuthUrl();
          window.location.href = authUrl;
          return;
        }

        // Other error
        throw error;
      }
    } catch (error) {
      console.error("Error saving to Google Drive:", error);
      toast({
        title: "Failed to save",
        description:
          "There was an error saving your budget to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Use our centralized social sharing functions with improved UX
  const shareOnTwitter = () => shareSocial('twitter', shareUrls.twitter);
  const shareOnFacebook = () => shareSocial('facebook', shareUrls.facebook);
  const shareOnLinkedIn = () => shareSocial('linkedin', shareUrls.linkedin);

  return (
    <div>
      {/* Email Success Dialog */}
      <EmailSentDialog 
        open={showEmailSuccessModal}
        onOpenChange={setShowEmailSuccessModal}
        pdfUrl={pdfUrl}
        onSendAnother={resetEmailForm}
      />
      
      <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg">
        <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-800 dark:text-gray-200">
          <Share className="h-5 w-5 text-primary dark:text-primary-light mr-2" />
          Save & Share
        </h2>
        
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Please check your spam folder as budget emails may land there
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="share-name" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
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
                type="text"
                id="share-name"
                placeholder="Rachel Greene"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-800"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="share-email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <Mail className="h-4 w-4 text-primary dark:text-primary-light mr-2" />
                  Email Report
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded shadow-lg">
                    <p className="w-48 text-xs">
                      Receive a detailed summary and a downloadable PDF with your personalized insights.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex">
                <Input
                  type="email"
                  id="share-email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-l-md border border-gray-300 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-800"
                  required
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-70"
                  disabled={isSending || !isValidEmail(email)}
                >
                  {isSending ? (
                    <span className="flex items-center gap-1.5">
                      <span className="animate-spin">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      <span>Sending</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="h-4 w-4" />
                      <span>Send</span>
                    </span>
                  )}
                </Button>
              </div>
                
              <div className="w-full pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                  By submitting this form, your information may be saved and shared
                  with My College Finance for future budgeting resources and
                  financial opportunities. See{" "}
                  <a 
                    href="https://www.mycollegefinance.com/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a 
                    href="https://www.mycollegefinance.com/terms-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Terms
                  </a>.
                </p>
              </div>
            </div>
          </form>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Save your budget report
            </p>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center justify-center gap-2"
            >
              <Cloud className="h-4 w-4 text-primary dark:text-primary-light" />
              <span>Save to Google Drive</span>
            </Button>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
                Share this calculator
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded shadow-lg">
                    <p className="w-48 text-xs">
                      Share this calculator with friends and colleagues.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={shareOnTwitter}
                size="sm"
                className="flex items-center justify-center gap-2 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 px-3 py-1.5"
              >
                <Twitter className="h-4 w-4" />
                <span className="text-sm">Twitter</span>
              </Button>
              
              <Button 
                onClick={shareOnFacebook}
                size="sm"
                className="flex items-center justify-center gap-2 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/20 px-3 py-1.5"
              >
                <Facebook className="h-4 w-4" />
                <span className="text-sm">Facebook</span>
              </Button>
              
              <Button 
                onClick={shareOnLinkedIn}
                size="sm"
                className="flex items-center justify-center gap-2 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border border-[#0A66C2]/20 px-3 py-1.5"
              >
                <Linkedin className="h-4 w-4" />
                <span className="text-sm">LinkedIn</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}