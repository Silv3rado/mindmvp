import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function getStorageKeys(uid: string) {
  return {
    IS_PREMIUM: `mindmvp_demo_premium_${uid}`,
    PURCHASE_DATE: `mindmvp_demo_purchase_date_${uid}`,
  };
}

export interface PurchasePackage {
  identifier: string;
  productId: string;
  priceString: string;
  price: number;
  title: string;
  description: string;
  subscriptionPeriod?: string;
}

export interface CustomerInfo {
  isPremium: boolean;
  activeSubscriptions: string[];
  expirationDate?: string;
}

type PurchaseListener = (customerInfo: CustomerInfo) => void;

class PurchaseService {
  private isRevenueCatAvailable = false;
  private listeners: PurchaseListener[] = [];
  private revenueCat: any = null;
  private currentUserId: string | null = null;

  async initialize(userId: string): Promise<void> {
    if (this.currentUserId === userId && this.revenueCat) {
      return;
    }

    if (this.currentUserId && this.currentUserId !== userId) {
      await this.logout();
    }

    this.currentUserId = userId;

    try {
      const Purchases = await import('react-native-purchases').catch(() => null);
      
      if (Purchases?.default) {
        this.revenueCat = Purchases.default;
        const apiKey = Platform.OS === 'ios' 
          ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY 
          : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

        if (apiKey) {
          await this.revenueCat.configure({ apiKey });
          await this.revenueCat.logIn(userId);
          
          this.isRevenueCatAvailable = true;
          console.log('RevenueCat initialized for user:', userId);
        } else {
          console.log('RevenueCat API key not configured, using demo mode');
          this.isRevenueCatAvailable = false;
        }
      }
    } catch (error) {
      console.log('RevenueCat not available (Expo Go), using demo mode');
      this.isRevenueCatAvailable = false;
    }
  }

  isUsingDemoMode(): boolean {
    return !this.isRevenueCatAvailable;
  }

  async getOfferings(): Promise<PurchasePackage[]> {
    if (this.isRevenueCatAvailable && this.revenueCat) {
      try {
        const offerings = await this.revenueCat.getOfferings();
        const current = offerings.current;
        
        if (current?.availablePackages) {
          return current.availablePackages.map((pkg: any) => ({
            identifier: pkg.identifier,
            productId: pkg.product.identifier,
            priceString: pkg.product.priceString,
            price: pkg.product.price,
            title: pkg.product.title,
            description: pkg.product.description,
            subscriptionPeriod: pkg.packageType,
          }));
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
      }
    }

    return this.getDemoOfferings();
  }

  private getDemoOfferings(): PurchasePackage[] {
    return [
      {
        identifier: '$rc_monthly',
        productId: 'mindmvp_premium_monthly',
        priceString: '$9.99',
        price: 9.99,
        title: 'MindMVP Premium',
        description: 'Monthly subscription with unlimited access',
        subscriptionPeriod: 'MONTHLY',
      },
      {
        identifier: '$rc_annual',
        productId: 'mindmvp_premium_annual',
        priceString: '$59.99',
        price: 59.99,
        title: 'MindMVP Premium (Annual)',
        description: 'Annual subscription - save 50%',
        subscriptionPeriod: 'ANNUAL',
      },
    ];
  }

  async purchasePackage(packageId: string): Promise<CustomerInfo> {
    if (this.isRevenueCatAvailable && this.revenueCat) {
      try {
        const offerings = await this.revenueCat.getOfferings();
        const pkg = offerings.current?.availablePackages?.find(
          (p: any) => p.identifier === packageId
        );
        
        if (pkg) {
          const { customerInfo } = await this.revenueCat.purchasePackage(pkg);
          return this.parseCustomerInfo(customerInfo);
        }
      } catch (error: any) {
        if (error.userCancelled) {
          throw new Error('CANCELLED');
        }
        throw error;
      }
    }

    if (!this.currentUserId) {
      throw new Error('No user initialized');
    }

    return this.demoPurchase(packageId);
  }

  private async demoPurchase(packageId: string): Promise<CustomerInfo> {
    if (!this.currentUserId) {
      throw new Error('No user initialized');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const expirationDate = new Date();
    if (packageId === '$rc_annual') {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    } else {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    }

    const keys = getStorageKeys(this.currentUserId);
    await AsyncStorage.setItem(keys.IS_PREMIUM, 'true');
    await AsyncStorage.setItem(keys.PURCHASE_DATE, Date.now().toString());

    const customerInfo: CustomerInfo = {
      isPremium: true,
      activeSubscriptions: [packageId],
      expirationDate: expirationDate.toISOString(),
    };

    this.notifyListeners(customerInfo);
    return customerInfo;
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (this.isRevenueCatAvailable && this.revenueCat) {
      try {
        const customerInfo = await this.revenueCat.getCustomerInfo();
        return this.parseCustomerInfo(customerInfo);
      } catch (error) {
        console.error('Error getting customer info:', error);
      }
    }

    return this.getDemoCustomerInfo();
  }

  private async getDemoCustomerInfo(): Promise<CustomerInfo> {
    if (!this.currentUserId) {
      return {
        isPremium: false,
        activeSubscriptions: [],
      };
    }

    const keys = getStorageKeys(this.currentUserId);
    const isPremium = await AsyncStorage.getItem(keys.IS_PREMIUM);
    
    return {
      isPremium: isPremium === 'true',
      activeSubscriptions: isPremium === 'true' ? ['demo_subscription'] : [],
    };
  }

  private parseCustomerInfo(customerInfo: any): CustomerInfo {
    const entitlements = customerInfo.entitlements?.active || {};
    const premiumEntitlement = entitlements['premium'] || entitlements['pro'];
    
    return {
      isPremium: !!premiumEntitlement,
      activeSubscriptions: Object.keys(entitlements),
      expirationDate: premiumEntitlement?.expirationDate,
    };
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (this.isRevenueCatAvailable && this.revenueCat) {
      try {
        const customerInfo = await this.revenueCat.restorePurchases();
        const parsed = this.parseCustomerInfo(customerInfo);
        this.notifyListeners(parsed);
        return parsed;
      } catch (error) {
        console.error('Error restoring purchases:', error);
        throw error;
      }
    }

    const info = await this.getDemoCustomerInfo();
    this.notifyListeners(info);
    return info;
  }

  async logout(): Promise<void> {
    if (this.isRevenueCatAvailable && this.revenueCat) {
      try {
        await this.revenueCat.logOut();
      } catch (error) {
        console.log('RevenueCat logout error:', error);
      }
    }
    
    this.currentUserId = null;
    this.isRevenueCatAvailable = false;
  }

  async clearDemoPurchase(): Promise<void> {
    if (!this.currentUserId) {
      return;
    }

    const keys = getStorageKeys(this.currentUserId);
    await AsyncStorage.multiRemove([keys.IS_PREMIUM, keys.PURCHASE_DATE]);
    
    this.notifyListeners({
      isPremium: false,
      activeSubscriptions: [],
    });
  }

  addListener(listener: PurchaseListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(customerInfo: CustomerInfo): void {
    this.listeners.forEach(listener => listener(customerInfo));
  }
}

export const purchaseService = new PurchaseService();
