import { useTheme } from "@/hooks/use-theme";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Download, DownloadCloud, Mail, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGeneratePdf } from "@/lib/share-utils";
import { useToast } from "@/hooks/use-toast";
import { useBudgetContext } from "@/context/budget-context";
import { uploadBudgetToDrive } from "@/lib/google-drive";
import { useState } from "react";
import { EmailModal } from "@/components/ui/email-modal-simple";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { generatePdf } = useGeneratePdf();
  const { toast } = useToast();
  const { budget, isCalculated } = useBudgetContext();
  const [showGoogleDriveDialog, setShowGoogleDriveDialog] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const handleExportPDF = async () => {
    if (!isCalculated) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before downloading a report.",
        variant: "destructive",
      });
      return;
    }
    
    // Instead of generating PDF directly, direct users to the email form
    setShowEmailModal(true);
  };
  
  const initiateGoogleDriveUpload = () => {
    if (!isCalculated || !budget) {
      toast({
        title: "No budget calculated",
        description: "Please calculate a budget first before sending to Google Drive.",
        variant: "destructive",
      });
      return;
    }
    
    // Show dialog to explain what we're doing
    setShowGoogleDriveDialog(true);
  };
  
  const handleSendToDrive = async () => {
    // Close the dialog
    setShowGoogleDriveDialog(false);
    
    try {
      toast({
        title: "Processing",
        description: "Connecting to Google Drive...",
      });
      
      const result = await uploadBudgetToDrive(budget!);
      
      if (result.needsAuth) {
        toast({
          title: "Google Authentication",
          description: "You'll be redirected to Google to authorize access to your Drive.",
        });
        // User is being redirected to Google OAuth flow
        return;
      }
      
      toast({
        title: "Success",
        description: "Your budget has been saved to Google Drive.",
      });
      
      // If we have a web view link, open it
      if (result.file?.webViewLink) {
        window.open(result.file.webViewLink, '_blank');
      }
    } catch (error) {
      console.error("Failed to upload to Google Drive:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="w-full bg-white dark:bg-gray-900 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <a 
            href="https://www.mycollegefinance.com/" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-90 transition-opacity"
          >
            <Logo size="lg" />
          </a>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-500" />
              )}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            
            {/* Desktop Download Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="hidden md:flex" size="default">
                  <Download className="mr-2 h-5 w-5" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleExportPDF}
                  className="text-base py-3"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={initiateGoogleDriveUpload} className="text-base py-3">
                  <DownloadCloud className="mr-2 h-5 w-5" />
                  Save to Drive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Download Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="md:hidden"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleExportPDF}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={initiateGoogleDriveUpload} 
                  className="cursor-pointer"
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Save to Drive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Google Drive Dialog */}
        <Dialog open={showGoogleDriveDialog} onOpenChange={setShowGoogleDriveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save to Google Drive</DialogTitle>
              <DialogDescription>
                We need your permission to save your budget to Google Drive
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Why we need access to your Google Drive:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>To save your budget report directly to your Google Drive</li>
                    <li>We only request access to files created by our app</li>
                    <li>We never access your existing files or folders</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Benefits of connecting to Google Drive:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Safely store your budget reports in the cloud</li>
                    <li>Access your reports from any device</li>
                    <li>Easily share reports with financial advisors or family</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex space-x-2 sm:justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowGoogleDriveDialog(false)}
                className="text-base py-5"
              >
                Cancel
              </Button>
              <Button onClick={handleSendToDrive} className="px-6 text-base py-5">
                <DownloadCloud className="mr-2 h-5 w-5" />
                Connect to Google Drive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      
      {/* Email Modal */}
      <EmailModal 
        open={showEmailModal} 
        onOpenChange={setShowEmailModal} 
        budget={budget} 
        isCalculated={isCalculated} 
      />
    </>
  );
}