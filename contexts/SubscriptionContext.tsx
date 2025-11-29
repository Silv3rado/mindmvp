import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { purchaseService, PurchasePackage, CustomerInfo } from '@/services/purchaseService';

const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

function getStorageKeys(uid: string) {
  return {
    TRIAL_START: `mindmvp_trial_start_${uid}`,
  };
}

export type SubscriptionStatus = 'none' | 'trial' | 'trial_expired' | 'premium';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  isPremium: boolean;
  canAccessAllContent: boolean;
  canAccessBreathing: boolean;
  packages: PurchasePackage[];
  loading: boolean;
  isDemoMode: boolean;
  startTrial: () => Promise<void>;
  purchasePackage: (packageId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  clearDemoPurchase: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('none');
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const calculateTrialRemaining = useCallback(() => {
    if (!trialStartTime) return { days: 0, hours: 0 };
    const elapsed = Date.now() - trialStartTime;
    const remaining = Math.max(0, TRIAL_DURATION_MS - elapsed);
    const hours = Math.ceil(remaining / (60 * 60 * 1000));
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    return { days, hours };
  }, [trialStartTime]);

  const updateStatus = useCallback(() => {
    if (isPremium) {
      setStatus('premium');
      return;
    }

    if (!trialStartTime) {
      setStatus('none');
      return;
    }

    const elapsed = Date.now() - trialStartTime;
    if (elapsed < TRIAL_DURATION_MS) {
      setStatus('trial');
    } else {
      setStatus('trial_expired');
    }
  }, [trialStartTime, isPremium]);

  useEffect(() => {
    const initPurchases = async () => {
      if (!firebaseUser) {
        await purchaseService.logout();
        setIsPremium(false);
        setTrialStartTime(null);
        setPackages([]);
        setLoading(false);
        return;
      }

      try {
        await purchaseService.initialize(firebaseUser.uid);
        setIsDemoMode(purchaseService.isUsingDemoMode());

        const [customerInfo, offerings] = await Promise.all([
          purchaseService.getCustomerInfo(),
          purchaseService.getOfferings(),
        ]);

        setIsPremium(customerInfo.isPremium);
        setPackages(offerings);

        const keys = getStorageKeys(firebaseUser.uid);
        const trialStart = await AsyncStorage.getItem(keys.TRIAL_START);

        if (trialStart) {
          setTrialStartTime(parseInt(trialStart, 10));
        } else {
          const now = Date.now();
          await AsyncStorage.setItem(keys.TRIAL_START, now.toString());
          setTrialStartTime(now);
        }
      } catch (error) {
        console.log('Failed to init purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = purchaseService.addListener((info: CustomerInfo) => {
      setIsPremium(info.isPremium);
    });

    setLoading(true);
    initPurchases();

    return () => {
      unsubscribe();
    };
  }, [firebaseUser?.uid]);

  useEffect(() => {
    updateStatus();

    if (status === 'trial') {
      const interval = setInterval(updateStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [updateStatus, status]);

  const startTrial = async () => {
    if (!firebaseUser) return;
    
    const keys = getStorageKeys(firebaseUser.uid);
    const now = Date.now();
    await AsyncStorage.setItem(keys.TRIAL_START, now.toString());
    setTrialStartTime(now);
  };

  const purchasePackageHandler = async (packageId: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    
    try {
      setLoading(true);
      const customerInfo = await purchaseService.purchasePackage(packageId);
      setIsPremium(customerInfo.isPremium);
      return customerInfo.isPremium;
    } catch (error: any) {
      if (error.message === 'CANCELLED') {
        return false;
      }
      console.error('Purchase error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    setLoading(true);
    try {
      const customerInfo = await purchaseService.restorePurchases();
      setIsPremium(customerInfo.isPremium);
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearDemoPurchase = async () => {
    await purchaseService.clearDemoPurchase();
    setIsPremium(false);
  };

  const { days: trialDaysRemaining, hours: trialHoursRemaining } = calculateTrialRemaining();
  
  const canAccessAllContent = status === 'trial' || status === 'premium';
  const canAccessBreathing = true;

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        trialDaysRemaining,
        trialHoursRemaining,
        isPremium,
        canAccessAllContent,
        canAccessBreathing,
        packages,
        loading,
        isDemoMode,
        startTrial,
        purchasePackage: purchasePackageHandler,
        restorePurchases,
        clearDemoPurchase,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
