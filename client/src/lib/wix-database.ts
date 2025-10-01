/**
 * Client-side utility for submitting user data to the Wix External Database
 */

import { apiRequest } from "@/lib/queryClient";
import type { Budget } from "@shared/schema";

/**
 * Submit user data to the Wix External Database
 * 
 * @param name User's name
 * @param email User's email address
 * @param budget Budget data
 * @param consent Whether the user has consented to data storage
 * @returns Promise with the submission result
 */
export async function submitUserToWixDatabase(
  name: string,
  email: string,
  budget: Budget,
  consent: boolean = true
): Promise<{ success: boolean; message: string; isNewUser?: boolean }> {
  try {
    console.log(`Submitting user data to Wix database: ${name}, ${email}`);
    
    // Call our server API endpoint
    const response = await apiRequest(
      "POST",
      "/api/submit-user",
      {
        name,
        email,
        budget,
        consent
      }
    );
    
    // Parse the JSON response
    const data = await response.json();
    
    console.log("Wix database submission response:", data);
    
    return {
      success: data.success,
      message: data.message,
      isNewUser: data.isNewUser
    };
  } catch (error) {
    console.error("Error submitting to Wix database:", error);
    
    let errorMessage = "Failed to save your data. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}