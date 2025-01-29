import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { User, Bell, Database, FileText, Trash2, Download, DollarSign, MapPin } from 'lucide-react';
import { useAuth } from '../../auth/CognitoAuthContext';
import { useCurrency, currencySymbols } from '../../contexts/CurrencyContext';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import defaultAvatar from '../../assets/default-avatar.svg';
import { US_STATES } from '../../constants/us-tax';

const getCurrencyName = (code: string): string => {
  const names: Record<string, string> = {
    USD: 'United States Dollar',
    EUR: 'Euro',
    GBP: 'British Pound Sterling',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    HKD: 'Hong Kong Dollar',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    NOK: 'Norwegian Krone',
    MXN: 'Mexican Peso',
    INR: 'Indian Rupee',
    GHS: 'Ghanaian Cedi',
    NGN: 'Nigerian Naira',
    // Add more as needed
  };
  return names[code] || code;
};

const getCurrencyCountry = (code: string): string => {
  const countries: Record<string, string> = {
    USD: 'United States',
    EUR: 'European Union',
    GBP: 'United Kingdom',
    JPY: 'Japan',
    AUD: 'Australia',
    CAD: 'Canada',
    CHF: 'Switzerland',
    CNY: 'China',
    HKD: 'Hong Kong',
    NZD: 'New Zealand',
    SEK: 'Sweden',
    KRW: 'South Korea',
    SGD: 'Singapore',
    NOK: 'Norway',
    MXN: 'Mexico',
    INR: 'India',
    GHS: 'Ghana',
    NGN: 'Nigeria',
    // Add more as needed
  };
  return countries[code] || 'International';
};

export function SettingsPage() {
  const { currentUser } = useAuth();
  const { currency, setCurrency, loading, state, setState } = useCurrency();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoCategories: true
  });
  const [uploading, setUploading] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showStateSelection, setShowStateSelection] = useState(!!state);

  useEffect(() => {
    setShowStateSelection(currency === 'USD' && !!state);
  }, [currency, state]);

  const handleSettingChange = (setting: string) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleCurrencySearch = async (searchTerm: string) => {
    setCurrencySearch(searchTerm);
    
    // If search is empty, don't auto-select
    if (!searchTerm) return;

    // Find matching currency
    const matchingCurrency = Object.entries(currencySymbols)
      .find(([code]) => {
        const search = searchTerm.toLowerCase();
        return (
          code.toLowerCase() === search ||
          getCurrencyName(code).toLowerCase() === search ||
          code.toLowerCase().includes(search) ||
          getCurrencyName(code).toLowerCase().includes(search)
        );
      });

    // If we found an exact match or a single partial match, update the currency
    if (matchingCurrency) {
      const [code] = matchingCurrency;
      if (code !== currency) { // Only update if it's different from current
        await handleCurrencyChange(code);
      }
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await setCurrency(newCurrency);
      // Reset state selection when changing currency
      if (newCurrency !== 'USD') {
        setShowStateSelection(false);
        await setState('');
      } else {
        setShowStateSelection(true);
      }
      toast.success(`Currency updated to ${getCurrencyName(newCurrency)} (${newCurrency})`);
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error('Failed to update currency');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      if (!currentUser?.idToken) throw new Error('No auth token');

      // Get upload URL
      const { uploadUrl, url } = await api.profile.getUploadUrl(
        file.name,
        file.type,
        currentUser.idToken
      );

      // Upload to S3
      await api.upload.uploadToS3(uploadUrl, file);

      // Update profile with new photo URL
      await api.profile.updateProfile(url, currentUser.idToken);

      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to update profile photo');
    } finally {
      setUploading(false);
    }
  };

  const handleStateToggle = async () => {
    try {
      if (!showStateSelection) {
        setShowStateSelection(true);
      } else {
        setShowStateSelection(false);
        await setState('');
      }
    } catch (error) {
      console.error('Error toggling state selection:', error);
      toast.error('Failed to update state preferences');
    }
  };

  const handleStateChange = async (newState: string) => {
    try {
      await setState(newState);
      toast.success(`State updated to ${US_STATES.find(s => s.code === newState)?.name}`);
    } catch (error) {
      console.error('Error updating state:', error);
      toast.error('Failed to update state');
    }
  };

  const filteredCurrencies = Object.entries(currencySymbols)
    .filter(([code, symbol]) => {
      const searchTerm = currencySearch.toLowerCase();
      return (
        code.toLowerCase().includes(searchTerm) ||
        getCurrencyName(code).toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      // Sort by currency code
      return a[0].localeCompare(b[0]);
    });

  return (
    <div className="space-y-6">
      <DashboardHeader userName="Thomas" onProfileClick={() => {}} />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center p-6 bg-white/5 rounded-lg">
              <div className="relative group">
                <img
                  src={currentUser?.photoURL || defaultAvatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover bg-gray-700"
                />
                <label
                  className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full 
                           opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity
                           ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                  />
                  <div className="text-white text-sm">
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </div>
                </label>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white">{currentUser?.email}</p>
                <p className="text-white/60 text-sm">
                  Member since {new Date(currentUser?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Email Notifications</h3>
                <p className="text-white/60 text-sm">Receive email updates about your account</p>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  settings.emailNotifications ? 'bg-[#00E5FF]' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">Automatic Categories</h3>
                <p className="text-white/60 text-sm">Automatically categorize new receipts</p>
              </div>
              <button
                onClick={() => handleSettingChange('autoCategories')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  settings.autoCategories ? 'bg-[#00E5FF]' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    settings.autoCategories ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg mb-4">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Currency Settings
                  </h3>
                  <p className="text-white/60 text-sm">Select your preferred currency for displaying amounts</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4">
                {/* Search Input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    id="currency-search"
                    value={currencySearch}
                    onChange={(e) => handleCurrencySearch(e.target.value)}
                    placeholder="Search by currency code or name (e.g., Ghana, GHS)..."
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="relative mb-4">
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
                    disabled={loading}
                  >
                    {filteredCurrencies.map(([code, symbol]) => (
                      <option key={code} value={code} className="bg-gray-800 text-white">
                        {code} ({symbol}) - {getCurrencyName(code)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Country Display */}
                <div className="flex items-center space-x-2 mb-4 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{getCurrencyCountry(currency)}</span>
                </div>

                {/* State Selection for US */}
                {currency === 'USD' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Enable State Tax Rules</h3>
                        <p className="text-white/60 text-sm">
                          Turn this on to apply state-specific tax rates and rules
                        </p>
                      </div>
                      <button
                        onClick={handleStateToggle}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          showStateSelection ? 'bg-[#00E5FF]' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            showStateSelection ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {showStateSelection && (
                      <div className="mt-4">
                        <select
                          value={state || ''}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
                        >
                          <option value="">Select a state</option>
                          {US_STATES.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.name} ({s.salesTax}% tax)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00E5FF]"></div>
                    <span className="ml-2 text-sm text-gray-400">Loading...</span>
                  </div>
                )}

                {/* Helper Text */}
                <p className="mt-2 text-sm text-gray-400">
                  Your selected currency will be used to display all amounts across the app
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Data Management</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-white/60" />
                <div className="text-left">
                  <p className="text-white">Export Data</p>
                  <p className="text-white/60 text-sm">Download your receipt data</p>
                </div>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white/60" />
                <div className="text-left">
                  <p className="text-white">Generate Report</p>
                  <p className="text-white/60 text-sm">Create a detailed spending report</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <p className="text-white">Delete Account</p>
                  <p className="text-white/60 text-sm">Permanently delete your account and data</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
