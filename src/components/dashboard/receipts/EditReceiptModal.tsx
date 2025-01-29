import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,   // Used for date input
  Store,      // Used for merchant input
  Receipt,    // Used for logo and upload
  DollarSign, // Used for amount input
  X,          // Used for close button
  Upload,     // Used for upload icon
  Percent,    // Used for tax rate
  MapPin,     // Used for location
  AlertTriangle, // Used for warnings
  Camera      // Used for image upload
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../../utils/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { taxApi } from '../../../utils/tax-api';
import toast from 'react-hot-toast';
import { 
  BUSINESS_EXPENSE_CATEGORIES, 
  US_STATES,
  BusinessExpenseCategoryId 
} from '../../../constants/us-tax';

interface EditReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    id: string;
    date: string;
    merchant: string;
    total: number;
    category: string;
    imageUrl?: string;
    preview?: string;
    tax?: {
      total: number;
      rate?: number;
    };
    items?: Array<{
      name: string;
      price: number;
    }>;
    taxDeductible?: boolean;
    businessCategory?: BusinessExpenseCategoryId;
    taxDetails?: {
      businessPurpose?: string;
      deductiblePercentage?: number;
      notes?: string;
    };
    state?: string;
  };
  onSave: (formData: any) => void;
  readOnly?: boolean;
}

export function EditReceiptModal({ isOpen, onClose, receipt, onSave, readOnly = false }: EditReceiptModalProps) {
  const { currency, formatAmount, state } = useCurrency();

  const userState = state || receipt.state;

  // Format number helper function
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '';
    return value.toString();
  };

  const formatDateForInput = (date: string) => {
    return date.split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: formatDateForInput(receipt.date),
    merchant: receipt.merchant,
    total: receipt.total,
    category: receipt.category,
    tax: receipt.tax?.total || 0,
    taxRate: receipt.tax?.rate || 0,
    items: receipt.items || [],
    imageUrl: receipt.imageUrl || receipt.preview || '',
    taxDeductible: receipt.taxDeductible || false,
    businessCategory: receipt.businessCategory || '',
    currency: currency,
    businessPurpose: receipt.taxDetails?.businessPurpose || '',
    deductiblePercentage: receipt.taxDetails?.deductiblePercentage || 100,
    taxNotes: receipt.taxDetails?.notes || ''
  });

  // Enhanced merchant category detection with machine learning-like scoring
  const getSuggestedBusinessCategory = (
    items: Array<{ name: string; price: number }>,
    merchant: string,
    total: number
  ): { category: BusinessExpenseCategoryId; confidence: number } | undefined => {
    const itemKeywords = {
      meals: {
        keywords: ['food', 'meal', 'restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'bistro', 'diner'],
        merchants: ['restaurant', 'cafe', 'bistro', 'diner', 'bar & grill', 'steakhouse'],
        priceRanges: { min: 10, max: 500 },
        timeRanges: [
          { start: '11:00', end: '15:00', label: 'lunch' },
          { start: '17:00', end: '23:00', label: 'dinner' }
        ]
      },
      office: {
        keywords: ['paper', 'ink', 'printer', 'office', 'desk', 'chair', 'supplies', 'staples'],
        merchants: ['office depot', 'staples', 'office max', 'amazon'],
        priceRanges: { min: 5, max: 2000 }
      },
      travel: {
        keywords: ['hotel', 'flight', 'taxi', 'uber', 'lyft', 'car rental', 'train', 'airline'],
        merchants: ['marriott', 'hilton', 'uber', 'lyft', 'delta', 'united', 'enterprise'],
        priceRanges: { min: 20, max: 10000 }
      },
      utilities: {
        keywords: ['phone', 'internet', 'electricity', 'water', 'gas', 'service'],
        merchants: ['at&t', 'verizon', 'comcast', 'pg&e', 'utility'],
        priceRanges: { min: 30, max: 1000 },
        recurring: true
      }
    };

    // Score each category based on multiple factors
    const scores = Object.entries(itemKeywords).map(([category, rules]) => {
      let score = 0;
      const maxScore = 100;

      // Check merchant name (30% weight)
      const merchantLower = merchant.toLowerCase();
      const merchantScore = rules.merchants.some(m => merchantLower.includes(m)) ? 30 : 0;
      score += merchantScore;

      // Check items (40% weight)
      const itemScore = items.reduce((sum, item) => {
        const itemLower = item.name.toLowerCase();
        return sum + (rules.keywords.some(k => itemLower.includes(k)) ? 40 / items.length : 0);
      }, 0);
      score += itemScore;

      // Check price range (20% weight)
      const priceScore = total >= rules.priceRanges.min && total <= rules.priceRanges.max ? 20 : 0;
      score += priceScore;

      // Check time for meals (10% weight)
      if (category === 'meals' && rules.timeRanges) {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes()}`;
        const timeScore = rules.timeRanges.some(range => 
          currentTime >= range.start && currentTime <= range.end
        ) ? 10 : 0;
        score += timeScore;
      }

      return { category, score: score / maxScore };
    });

    // Get the highest scoring category with at least 40% confidence
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestMatch.score >= 0.4 ? 
      { category: bestMatch.category as BusinessExpenseCategoryId, confidence: bestMatch.score } : 
      undefined;
  };

  // Smart deduction calculation with enhanced rules
  const calculateDeductibleAmount = (
    category: BusinessExpenseCategoryId, 
    amount: number, 
    date: string,
    items?: Array<{ name: string; price: number }>
  ) => {
    const businessCategory = BUSINESS_EXPENSE_CATEGORIES[category];
    if (!businessCategory?.deductible) return 0;

    // Special handling for meals
    if (category === 'meals') {
      const receiptDate = new Date(date);
      
      // COVID relief period (100% deductible)
      if (receiptDate >= new Date('2021-01-01') && receiptDate <= new Date('2022-12-31')) {
        return amount;
      }
      
      // Regular business meals (50% deductible)
      return amount * 0.5;
    }

    // Special handling for vehicle expenses
    if (category === 'car_and_truck') {
      const standardRate = businessCategory.standardRate || 65.5; // 2023 rate
      // If items include mileage, calculate based on that
      const mileageItem = items?.find(item => 
        item.name.toLowerCase().includes('mile') || 
        item.name.toLowerCase().includes('mileage')
      );
      if (mileageItem?.quantity) {
        return (mileageItem.quantity * standardRate) / 100;
      }
      // Otherwise use the full amount
      return amount;
    }

    // Check for temporary full deduction periods
    if (businessCategory.temporaryFullDeduction) {
      const { startDate, endDate, percentage } = businessCategory.temporaryFullDeduction;
      const receiptDate = new Date(date);
      if (receiptDate >= new Date(startDate) && receiptDate <= new Date(endDate)) {
        return amount * (percentage / 100);
      }
    }

    // Default to category's deductible percentage
    return amount * ((businessCategory.deductiblePercentage || 100) / 100);
  };

  // Effect to auto-detect category and calculate deductions
  useEffect(() => {
    if (formData.items?.length && formData.merchant && formData.total) {
      const suggestion = getSuggestedBusinessCategory(
        formData.items,
        formData.merchant,
        formData.total
      );

      if (suggestion && suggestion.confidence >= 0.4) {
        const deductibleAmount = calculateDeductibleAmount(
          suggestion.category,
          formData.total,
          formData.date,
          formData.items
        );

        const category = BUSINESS_EXPENSE_CATEGORIES[suggestion.category];
        
        setFormData(prev => ({
          ...prev,
          businessCategory: suggestion.category,
          taxDeductible: true,
          deductiblePercentage: category.deductiblePercentage || 100,
          businessPurpose: category.description,
          taxDetails: {
            ...prev.taxDetails,
            deductibleAmount,
            limitations: category.limitations,
            confidence: suggestion.confidence
          }
        }));
      }
    }
  }, [formData.items, formData.merchant, formData.total]);

  const [previewImage, setPreviewImage] = useState<string>(receipt.imageUrl || receipt.preview || '');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      try {
        // Upload to S3
        const { key } = await api.uploadImage(file);
        const imageUrl = `${import.meta.env.VITE_S3_URL}/${key}`;
        
        // Update form data with new image URL
        setFormData(prev => ({
          ...prev,
          imageUrl
        }));
        
        // Set preview
        setPreviewImage(URL.createObjectURL(file));
      } catch (error) {
        console.error('Error uploading image:', error);
        // You might want to show an error toast here
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    disabled: readOnly,
    maxFiles: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'total' || name === 'tax' || name === 'taxRate') {
      const newValue = parseFloat(value) || 0;
      
      // Keep tax amount and rate in sync
      if (name === 'total' && formData.tax > 0) {
        // Update tax rate when total changes
        const newTaxRate = Number(((formData.tax / newValue) * 100).toFixed(2));
        setFormData(prev => ({
          ...prev,
          total: newValue,
          taxRate: newTaxRate
        }));
        return;
      } else if (name === 'tax') {
        // Update tax rate when tax amount changes
        const newTaxRate = Number(((newValue / formData.total) * 100).toFixed(2));
        setFormData(prev => ({
          ...prev,
          tax: newValue,
          taxRate: newTaxRate
        }));
        return;
      } else if (name === 'taxRate') {
        // Update tax amount when tax rate changes
        const newTax = Number(((formData.total * newValue) / 100).toFixed(2));
        setFormData(prev => ({
          ...prev,
          tax: newTax,
          taxRate: newValue
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'deductiblePercentage' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the receipt update data
    const receiptUpdate = {
      id: receipt.id,
      date: formData.date,
      merchant: formData.merchant,
      total: formData.total,
      category: formData.category,
      tax: {
        total: formData.tax,
        rate: formData.taxRate,
      },
      items: formData.items,
      imageUrl: formData.imageUrl,
      taxDeductible: formData.taxDeductible,
      businessCategory: formData.businessCategory,
      taxDetails: {
        businessPurpose: formData.businessPurpose,
        deductiblePercentage: formData.deductiblePercentage,
        notes: formData.taxNotes
      },
      state: userState
    };

    onSave(receiptUpdate);
  };

  const getDeductionSummary = () => {
    if (!formData.businessCategory || !formData.total) return null;

    const category = BUSINESS_EXPENSE_CATEGORIES[formData.businessCategory as BusinessExpenseCategoryId];
    const deductibleAmount = calculateDeductibleAmount(
      formData.businessCategory as BusinessExpenseCategoryId,
      formData.total,
      formData.date,
      formData.items
    );

    return {
      amount: deductibleAmount,
      percentage: category.deductiblePercentage || 100,
      limitations: category.limitations,
      examples: category.examples
    };
  };

  // Add state-specific tax rules and disclaimers
  const getStateSpecificRules = (stateCode: string) => {
    const stateData = US_STATES.find(s => s.code === stateCode);
    if (!stateData) return null;

    return {
      name: stateData.name,
      baseTaxRate: stateData.salesTax,
      warning: `Tax calculations for ${stateData.name} are estimates only. Local municipalities may add additional taxes. Please consult with a tax professional for accurate rates.`
    };
  };

  const calculateTaxSavings = useCallback(() => {
    if (!formData.taxDeductible || !formData.businessCategory) return 0;
    
    // First get the base deductible amount based on category rules
    const baseDeductibleAmount = calculateDeductibleAmount(
      formData.businessCategory as BusinessExpenseCategoryId,
      formData.total,
      formData.date,
      formData.items
    );

    // Apply state-specific adjustments if needed
    const stateRules = getStateSpecificRules(userState);
    const stateAdjustedAmount = baseDeductibleAmount;  // Placeholder for state-specific adjustments

    // Then apply the user's custom deductible percentage
    return stateAdjustedAmount * (formData.deductiblePercentage / 100);
  }, [formData.taxDeductible, formData.businessCategory, formData.total, formData.date, formData.deductiblePercentage, userState]);

  useEffect(() => {
    if (receipt.items && receipt.items.length > 0) {
      // Try to determine business category from items
      const suggestedCategory = getSuggestedBusinessCategory(receipt.items, receipt.merchant, receipt.total);
      if (suggestedCategory) {
        const category = BUSINESS_EXPENSE_CATEGORIES[suggestedCategory.category];
        setFormData(prev => ({
          ...prev,
          businessCategory: suggestedCategory.category,
          businessPurpose: category.description,
          deductiblePercentage: category.deductiblePercentage || 100
        }));
      }
    }
  }, [receipt.items]);

  useEffect(() => {
    if (formData.total && state && currency === 'USD') {
      const stateData = US_STATES.find(s => s.code === state);
      if (stateData) {
        const calculatedTax = formData.total * (stateData.salesTax / 100);
        const actualTax = receipt.tax?.total || 0;
        
        // Calculate tax rate with 2 decimal places for display
        const actualTaxRate = actualTax ? Number(((actualTax / formData.total) * 100).toFixed(2)) : stateData.salesTax;
        
        setFormData(prev => ({
          ...prev,
          tax: actualTax || Number(calculatedTax.toFixed(2)),
          taxRate: actualTaxRate
        }));
      }
    }
  }, [formData.total, state, currency]);

  // New state for tax rates and categories
  const [taxRates, setTaxRates] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch tax rates and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTaxData = async () => {
        try {
          const year = new Date().getFullYear();
          const [ratesRes, categoriesRes] = await Promise.all([
            taxApi.getTaxRates(year),
            taxApi.getTaxCategories(year)
          ]);
          setTaxRates(ratesRes);
          setCategories(categoriesRes);
        } catch (error) {
          console.error('Error fetching tax data:', error);
        }
      };
      fetchTaxData();
    }
  }, [isOpen]);

  // Calculate deductible amount using API
  const calculateDeduction = async (category, amount, date) => {
    try {
      const { deductibleAmount, rules, warnings } = await taxApi.calculateDeduction({
        category,
        amount,
        date,
        items: receipt.items
      });
      
      // Update form with calculated amount and show any warnings
      setFormData(prev => ({
        ...prev,
        taxDetails: {
          ...prev.taxDetails,
          deductiblePercentage: (deductibleAmount / amount) * 100
        }
      }));

      if (warnings?.length) {
        // Show warnings to user
        warnings.forEach(warning => toast.warning(warning));
      }

    } catch (error) {
      console.error('Error calculating deduction:', error);
      toast.error('Failed to calculate deduction amount');
    }
  };

  // Update handler for tax deductible toggle
  const handleTaxDeductibleChange = async (e) => {
    const isDeductible = e.target.checked;
    setFormData(prev => ({
      ...prev,
      taxDeductible: isDeductible
    }));

    if (isDeductible && formData.businessCategory) {
      await calculateDeduction(
        formData.businessCategory,
        formData.total,
        formData.date
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative mx-auto my-2 sm:my-8 w-full max-w-6xl p-2 sm:p-4"
      >
        <div className="relative rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-gray-50/80 p-3 sm:p-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Receipt className="text-purple-600" size={20} />
              {readOnly ? 'View Receipt Details' : 'Edit Receipt Details'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6">
            {/* Left side - Image section */}
            <div className="w-full lg:w-1/3 flex-shrink-0">
              <div
                {...getRootProps()}
                className={`relative h-[300px] lg:h-full min-h-[300px] rounded-lg border-2 ${
                  isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'
                } ${!readOnly && 'cursor-pointer hover:border-purple-500 hover:bg-purple-50'}`}
              >
                {!readOnly && <input {...getInputProps()} />}
                
                {previewImage ? (
                  <div className="relative h-full">
                    <img
                      src={previewImage}
                      alt="Receipt"
                      className="h-full w-full rounded-lg object-contain p-2"
                    />
                    {!readOnly && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <div className="text-center text-white p-2">
                          <Camera className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm">Click or drag to replace image</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {!readOnly ? (
                      <div className="text-center text-gray-500">
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm">Click or drag image here</p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Receipt className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm">No receipt image available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Form fields */}
            <div className="flex-1 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed px-4 py-3"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="merchant" className="block text-sm font-medium text-gray-700">
                    Merchant
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Store className="h-5 w-5 text-purple-600" />
                    </div>
                    <input
                      type="text"
                      id="merchant"
                      name="merchant"
                      value={formData.merchant}
                      onChange={handleChange}
                      disabled={readOnly}
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="total" className="block text-sm font-medium text-gray-700">
                    Total Amount ({currency})
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      id="total"
                      name="total"
                      value={formatNumber(formData.total)}
                      onChange={handleChange}
                      disabled={readOnly}
                      placeholder="0"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed px-4 py-3"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tax" className="block text-sm font-medium text-gray-700">
                    Tax Amount ({currency})
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Percent className="h-5 w-5 text-purple-600" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      id="tax"
                      name="tax"
                      value={formatNumber(formData.tax)}
                      onChange={handleChange}
                      disabled={readOnly}
                      placeholder="0"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business Category
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessCategory: e.target.value }))}
                  disabled={readOnly}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  {Object.entries(BUSINESS_EXPENSE_CATEGORIES).map(([id, category]) => (
                    <option key={id} value={id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto rounded-md border border-gray-200 p-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-medium">{formatAmount(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Details Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.taxDeductible}
                        onChange={handleTaxDeductibleChange}
                        disabled={readOnly}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Tax Deductible</span>
                    </label>
                    {state && currency === 'USD' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-purple-600" />
                        <span>{US_STATES.find(s => s.code === state)?.name || state}</span>
                      </div>
                    )}
                  </div>
                </div>

                {formData.taxDeductible && (
                  <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                    {/* Tax Category and Type Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                          Tax Rate (%)
                        </label>
                        <div className="mt-1.5 relative">
                          <input
                            type="number"
                            step="0.01"
                            id="taxRate"
                            name="taxRate"
                            value={formatNumber(formData.taxRate)}
                            onChange={handleChange}
                            disabled={readOnly}
                            placeholder="0"
                            className="block w-full rounded-lg border-gray-300 bg-white/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm transition-colors pr-12 pl-4 py-3"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="deductiblePercentage" className="block text-sm font-medium text-gray-700">
                          Deductible Percentage
                        </label>
                        <div className="mt-1.5 relative">
                          <input
                            type="number"
                            id="deductiblePercentage"
                            name="deductiblePercentage"
                            value={formatNumber(formData.deductiblePercentage)}
                            onChange={handleChange}
                            disabled={readOnly}
                            min="0"
                            max="100"
                            placeholder="100"
                            className="block w-full rounded-lg border-gray-300 bg-white/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm transition-colors pr-12 pl-4 py-3"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Business Purpose */}
                    <div>
                      <label htmlFor="businessPurpose" className="block text-sm font-medium text-gray-700">
                        Business Purpose
                      </label>
                      <div className="mt-1.5">
                        <input
                          type="text"
                          id="businessPurpose"
                          name="businessPurpose"
                          value={formData.businessPurpose}
                          onChange={handleChange}
                          disabled={readOnly}
                          placeholder="Enter business purpose"
                          className="block w-full rounded-lg border-gray-300 bg-white/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm transition-colors px-4 py-3"
                        />
                      </div>
                    </div>

                    {/* Tax Notes */}
                    <div>
                      <label htmlFor="taxNotes" className="block text-sm font-medium text-gray-700">
                        Tax Notes
                      </label>
                      <div className="mt-1.5">
                        <textarea
                          id="taxNotes"
                          name="taxNotes"
                          value={formData.taxNotes}
                          onChange={handleChange}
                          disabled={readOnly}
                          rows={3}
                          placeholder="Add any relevant tax notes"
                          className="block w-full rounded-lg border-gray-300 bg-white/50 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm transition-colors resize-none px-4 py-3"
                        />
                      </div>
                    </div>

                    {/* Deduction Summary */}
                    <div className="p-4 rounded-lg bg-white border border-purple-100 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-purple-50 rounded-full">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Deduction Summary</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            Based on {formData.businessCategory ? BUSINESS_EXPENSE_CATEGORIES[formData.businessCategory as BusinessExpenseCategoryId]?.name : 'selected category'}
                          </p>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-medium">{formatAmount(formData.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tax Amount:</span>
                              <span className="font-medium">{formatAmount(formData.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Deductible Percentage:</span>
                              <span className="font-medium">{formData.deductiblePercentage}%</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-purple-600">
                              <span>Estimated Tax Savings:</span>
                              <span>{formatAmount(calculateTaxSavings())}</span>
                            </div>
                          </div>
                          {formData.businessCategory === 'meals' && (
                            <p className="mt-3 text-xs text-amber-600">
                              Note: Business meals are typically 50% deductible. 
                              {new Date(formData.date) >= new Date('2021-01-01') && 
                               new Date(formData.date) <= new Date('2022-12-31') && 
                               ' However, this receipt falls under the COVID relief period (100% deductible).'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* State-Specific Tax Warning */}
                    {state && currency === 'USD' && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-yellow-100 rounded-full">
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">
                              Important Tax Information for {US_STATES.find(s => s.code === state)?.name}
                            </h4>
                            <div className="mt-2 text-sm text-yellow-700 space-y-1">
                              <p>{US_STATES.find(s => s.code === state)?.disclaimer}</p>
                              <p className="font-medium mt-2">Please Note:</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Tax laws and rates vary by jurisdiction and change frequently</li>
                                <li>Local and municipal taxes may apply in addition to state rates</li>
                                <li>Special tax districts may have different rates</li>
                                <li>Some items may be exempt or have different rates</li>
                                <li>This is not tax advice - consult a professional for your specific situation</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Deduction Summary Section */}
              {formData.taxDeductible && formData.businessCategory && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900">Deduction Summary</h4>
                  {(() => {
                    const summary = getDeductionSummary();
                    if (!summary) return null;

                    return (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-purple-700">
                            Deductible Amount: {formatAmount(summary.amount)}
                            {summary.percentage !== 100 && ` (${summary.percentage}% of total)`}
                          </p>
                          {formData.taxDetails?.confidence && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                              {Math.round(formData.taxDetails.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-600">{summary.limitations}</p>
                        <div className="text-xs text-purple-600">
                          <p className="font-medium">Common Examples:</p>
                          <ul className="list-disc list-inside">
                            {summary.examples.map((example, index) => (
                              <li key={index}>{example}</li>
                            ))}
                          </ul>
                        </div>
                        {formData.businessCategory === 'meals' && (
                          <p className="text-xs text-amber-600">
                            Note: Business meals are generally 50% deductible. 
                            {new Date(formData.date) >= new Date('2021-01-01') && 
                             new Date(formData.date) <= new Date('2022-12-31') && 
                             ' However, this receipt falls under the COVID relief period (100% deductible).'}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {!readOnly && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}