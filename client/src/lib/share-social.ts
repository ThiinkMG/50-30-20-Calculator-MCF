import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type SocialPlatform = 'twitter' | 'facebook' | 'linkedin';

// Central function for handling social sharing with improved UX
export function shareSocial(platform: SocialPlatform, shareUrl: string): void {
  // Store what platform we're trying to share to
  const pendingShareKey = 'pendingShare';
  
  // Try to open the popup window
  const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=500');
  
  // If the popup failed to open or was blocked, store intent in sessionStorage
  if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
    sessionStorage.setItem(pendingShareKey, platform);
    
    // Fallback to regular tab if popup is blocked
    window.open(shareUrl, '_blank');
  }
}

// Hook to check for pending shares when returning to the page
export function usePendingShareCheck() {
  const { toast } = useToast();
  
  useEffect(() => {
    const pendingShareKey = 'pendingShare';
    const pending = sessionStorage.getItem(pendingShareKey) as SocialPlatform | null;
    
    if (pending) {
      // Clear the pending share
      sessionStorage.removeItem(pendingShareKey);
      
      // Show helpful toast message
      const platformNames = {
        twitter: 'Twitter',
        facebook: 'Facebook',
        linkedin: 'LinkedIn'
      };
      
      toast({
        title: `You're signed in!`,
        description: `Click the ${platformNames[pending]} share button again to finish posting.`,
        duration: 5000,
      });
    }
  }, [toast]);
}

// Standard sharing URLs with proper production domain
export const getShareUrls = () => {
  const url = 'https://50-30-20-budget-calculator-mcf.replit.app/';
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this 50/30/20 Budget Calculator by @MyCollegeFinance')}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };
};