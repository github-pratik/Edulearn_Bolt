const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;

let isConfigured = false;
let isAvailable = false;

declare global {
  interface Window {
    Purchases: any;
  }
}

const waitForPurchases = (maxRetries = 10, delay = 500): Promise<void> => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkPurchases = () => {
      if (typeof window !== 'undefined' && window.Purchases) {
        isAvailable = true;
        resolve();
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(checkPurchases, delay);
      } else {
        isAvailable = false;
        reject(new Error('RevenueCat SDK not available'));
      }
    };
    
    checkPurchases();
  });
};

export const initializeRevenueCat = async (userId: string) => {
  if (!REVENUECAT_API_KEY) {
    console.warn('RevenueCat API key not configured - subscription features disabled');
    return false;
  }

  try {
    await waitForPurchases();
    
    if (!isConfigured && isAvailable) {
      await window.Purchases.configure(REVENUECAT_API_KEY);
      isConfigured = true;
    }
    
    if (isConfigured) {
      await window.Purchases.logIn(userId);
      console.log('RevenueCat initialized successfully');
      return true;
    }
  } catch (error) {
    console.warn('RevenueCat initialization failed - subscription features disabled:', error);
    isAvailable = false;
    isConfigured = false;
  }
  
  return false;
};

export const showPaywall = async (productId: string): Promise<boolean> => {
  if (!isConfigured || !isAvailable) {
    console.warn('RevenueCat not available - cannot show paywall');
    // Return false to indicate purchase failed, but don't throw error
    return false;
  }

  try {
    const offerings = await window.Purchases.getOfferings();
    const currentOffering = offerings.current;
    
    if (!currentOffering) {
      console.warn('No offerings available');
      return false;
    }

    const product = currentOffering.availablePackages.find((pkg: any) => pkg.identifier === productId);
    
    if (product) {
      const purchaseResult = await window.Purchases.purchasePackage(product);
      return purchaseResult.customerInfo.entitlements.active[productId] !== undefined;
    }
    
    return false;
  } catch (error) {
    console.warn('Paywall error:', error);
    return false;
  }
};

export const checkSubscriptionStatus = async (): Promise<'free' | 'premium' | 'creator'> => {
  if (!isConfigured || !isAvailable) {
    console.debug('RevenueCat not available - returning free status');
    return 'free';
  }

  try {
    const customerInfo = await window.Purchases.getCustomerInfo();
    
    if (customerInfo.entitlements.active['creator']) {
      return 'creator';
    } else if (customerInfo.entitlements.active['premium']) {
      return 'premium';
    }
    
    return 'free';
  } catch (error) {
    console.warn('Failed to check subscription status:', error);
    return 'free';
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  if (!isConfigured || !isAvailable) {
    console.warn('RevenueCat not available - cannot restore purchases');
    return false;
  }

  try {
    await window.Purchases.restorePurchases();
    return true;
  } catch (error) {
    console.warn('Failed to restore purchases:', error);
    return false;
  }
};

// Helper function to check if RevenueCat is available
export const isRevenueCatAvailable = (): boolean => {
  return isConfigured && isAvailable;
};

// Mock subscription status for demo purposes when RevenueCat is not available
export const getMockSubscriptionStatus = (userId?: string): 'free' | 'premium' | 'creator' => {
  // You can customize this logic for demo purposes
  if (!userId) return 'free';
  
  // For demo, you could return different statuses based on user ID or other criteria
  return 'free';
};