import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const defaultSettings = {
  general: {
    siteName: 'Quran Academy',
    siteUrl: 'https://quranacademy.com',
    contactEmail: 'support@quranacademy.com',
    contactPhone: '+923001234567',
    timezone: 'Asia/Karachi',
    defaultLanguage: 'english',
    maintenanceMode: false,
  },
  payment: {
    currency: 'USD',
    paymentMethods: ['card', 'bank', 'easypaisa', 'jazzcash'],
    taxRate: 0,
    lateFee: 10,
    gracePeriod: 7,
    autoRenewal: true,
  },
  classes: {
    defaultDuration: 60,
    maxStudentsPerUlma: 20,
    cancellationWindow: 24,
    rescheduleLimit: 2,
    recordingRetention: 30,
    classBufferTime: 15,
  },
  notifications: {
    classReminder: true,
    paymentReminder: true,
    announcementEmail: true,
    smsNotifications: false,
    pushNotifications: true,
    emailNotifications: true,
  },
};

const currencySymbols = {
  USD: '$',
  PKR: 'Rs.',
  EUR: 'EUR',
  GBP: 'GBP',
};

const SystemSettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  syncFromAdminSave: () => {},
  currencySymbol: '$',
  formatCurrency: (amount) => `$${amount || 0}`,
});

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const normalize = useCallback((incoming) => ({
    general: { ...defaultSettings.general, ...(incoming?.general || {}) },
    payment: { ...defaultSettings.payment, ...(incoming?.payment || {}) },
    classes: { ...defaultSettings.classes, ...(incoming?.classes || {}) },
    notifications: { ...defaultSettings.notifications, ...(incoming?.notifications || {}) },
  }), []);

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/settings/public');
      setSettings(normalize(data));
    } catch (error) {
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [normalize]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshSettings();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [refreshSettings]);

  const syncFromAdminSave = useCallback((adminSettings) => {
    setSettings(normalize(adminSettings));
  }, [normalize]);

  const currency = settings?.payment?.currency || 'USD';
  const currencySymbol = currencySymbols[currency] || currency;

  const formatCurrency = useCallback((amount) => {
    const value = Number(amount || 0);
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      return `${currencySymbol} ${value}`;
    }
  }, [currency, currencySymbol]);

  const value = useMemo(() => ({
    settings,
    loading,
    refreshSettings,
    syncFromAdminSave,
    currencySymbol,
    formatCurrency,
  }), [settings, loading, refreshSettings, syncFromAdminSave, currencySymbol, formatCurrency]);

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => useContext(SystemSettingsContext);
