import { apiRequest } from './queryClient';
import { Budget } from '@shared/schema';

// Get the Google Auth URL
export async function getGoogleAuthUrl() {
  try {
    const response = await apiRequest('GET', '/api/google/auth');
    
    if (!response.ok) {
      throw new Error('Failed to get Google Auth URL');
    }
    
    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('Error getting Google Auth URL:', error);
    throw error;
  }
}

// Upload a budget to Google Drive
export async function uploadBudgetToDrive(budget: Budget & { calculations?: any }) {
  try {
    const response = await apiRequest('POST', '/api/google/upload', {
      budget
    });
    
    // If authentication is required
    if (response.status === 401) {
      const data = await response.json();
      
      // If the server sent an auth URL, redirect to it
      if (data.authUrl) {
        window.location.href = data.authUrl;
        return { needsAuth: true };
      }
      
      throw new Error('Google Drive authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to upload to Google Drive');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}