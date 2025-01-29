import { useState, useEffect } from 'react';

interface Settings {
  state?: string;
  currency?: string;
  // Add other settings as needed
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    // Try to load settings from localStorage on initial render
    const savedSettings = localStorage.getItem('user_settings');
    return savedSettings ? JSON.parse(savedSettings) : {};
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return { settings, updateSettings };
}
