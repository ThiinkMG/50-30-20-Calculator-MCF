import { useCallback } from "react";
import { useBudgetContext } from "@/context/budget-context";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { apiRequest } from "@/lib/queryClient";
import type { Budget } from "@shared/schema";

// Function to generate a PDF on the server and get the download URL
export async function generateServerPdf(budget: Budget, userName?: string): Promise<string | null> {
  try {
    console.log("Generating PDF/HTML report for budget:", { 
      income: budget.income,
      additionalIncome: budget.additionalIncome,
      hasNeeds: !!budget.needs?.length,
      hasWants: !!budget.wants?.length,
      hasSavings: !!budget.savings?.length
    });
    
    // Create a request payload that includes the userName
    const payload = {
      ...budget,
      userName // Include userName in the request
    };
    
    const response = await apiRequest(
      "POST", // Method
      "/api/budget/generate-pdf", // URL
      payload // Data with userName
    );
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check if the response contains the download URL
    if (data && data.success && data.downloadUrl) {
      // Validate the URL format to ensure it's accessible
      try {
        const url = new URL(data.downloadUrl);
        console.log("Valid PDF/HTML report URL generated:", url.toString());
        return url.toString(); // Return the validated URL
      } catch (urlError) {
        console.error("Invalid URL format returned from server:", data.downloadUrl);
        return null;
      }
    }
    
    console.error("No valid download URL returned from server");
    return null;
  } catch (error) {
    console.error("Error generating server-side PDF:", error);
    return null;
  }
}

export function useGeneratePdf() {
  const { budget, isCalculated } = useBudgetContext();

  // Added userName parameter with default value
  const generatePdf = useCallback(async (userName?: string, openInNewTab: boolean = true) => {
    if (!isCalculated || !budget) {
      throw new Error("No budget available to generate PDF");
    }
    
    try {
      console.log("Generating PDF with userName:", userName || "not provided");
      
      // Use the server-side generated PDF for consistency
      // Pass userName to personalize the PDF if available
      const downloadUrl = await generateServerPdf(budget, userName);
      
      if (!downloadUrl) {
        throw new Error("Could not generate PDF report");
      }
      
      console.log("PDF generation successful, URL:", downloadUrl);
      
      // Only open in a new tab if specifically requested
      if (openInNewTab) {
        console.log("Opening PDF in new tab");
        window.open(downloadUrl, '_blank');
      } else {
        console.log("Not opening PDF in new tab (will be handled by caller)");
      }
      
      // Return the URL so it can be used by other components
      return downloadUrl;
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      throw error;
    }
  }, [budget, isCalculated]);

  return { generatePdf };
}
