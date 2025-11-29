import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

interface NotificationContextType {
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
  loading: boolean;
  isSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notificationsEnabled: false,
  toggleNotifications: async () => {},
  loading: true,
  isSupported: true,
});

const NOTIFICATION_STORAGE_KEY = '@mindmvp_notifications';

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

function isPushNotificationsSupported(): boolean {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android' && isExpoGo()) return false;
  return true;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const isSupported = isPushNotificationsSupported();

  useEffect(() => {
    loadNotificationState();
  }, []);

  const loadNotificationState = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored !== null) {
        setNotificationsEnabled(stored === 'true');
      }
    } catch (error) {
      console.log('Error loading notification state:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      if (!notificationsEnabled) {
        if (!isSupported) {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
          return;
        }
        
        const Notifications = await import('expo-notifications');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus === 'granted') {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
        }
      } else {
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
      }
    } catch (error) {
      console.log('Notifications not available');
      setNotificationsEnabled(!notificationsEnabled);
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, (!notificationsEnabled).toString());
    }
  };

  return (
    <NotificationContext.Provider value={{ notificationsEnabled, toggleNotifications, loading, isSupported }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
