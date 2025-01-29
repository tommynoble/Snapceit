import React from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Eye } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface ScheduleCPreviewProps {
  businessName: string;
  businessCode: string;
  ein: string;
  expenses: {
    advertising: number;
    carAndTruck: number;
    commissions: number;
    contractLabor: number;
    depletion: number;
    depreciation: number;
    insurance: number;
    interest: number;
    legal: number;
    office: number;
    pension: number;
    rentLease: number;
    repairs: number;
    supplies: number;
    taxes: number;
    travel: number;
    meals: number;
    utilities: number;
    wages: number;
    other: number;
  };
  grossReceipts: number;
  onDownload: () => void;
  onPrint: () => void;
}

export function ScheduleCPreview({
  businessName,
  businessCode,
  ein,
  expenses,
  grossReceipts,
  onDownload,
  onPrint
}: ScheduleCPreviewProps) {
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const netProfit = grossReceipts - totalExpenses;

  const FormLine = ({ lineNumber, label, amount, indent = false, bold = false }) => (
    <div className={`flex items-center gap-4 py-1 border-b border-gray-200 ${indent ? 'ml-8' : ''}`}>
      <span className="w-12 text-gray-500 text-sm">{lineNumber}</span>
      <span className={`flex-1 text-sm ${bold ? 'font-semibold' : ''}`}>{label}</span>
      <span className="w-32 text-right font-mono">{amount ? formatCurrency(amount) : ''}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Form Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">SCHEDULE C</h2>
          <p className="text-gray-600">(Form 1040)</p>
          <p className="text-lg font-semibold mt-2">Profit or Loss From Business</p>
          <p className="text-gray-500">(Sole Proprietorship)</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Part I */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Part I: Information About Your Business</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600">A. Business name</label>
              <p className="font-medium border-b border-gray-300 py-1">{businessName}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">B. Business code</label>
              <p className="font-medium border-b border-gray-300 py-1">{businessCode}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">D. Employer ID number (EIN)</label>
              <p className="font-medium border-b border-gray-300 py-1">{ein}</p>
            </div>
          </div>
        </div>

        {/* Part II */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Part II: Income</h3>
          <FormLine lineNumber="1" label="Gross receipts or sales" amount={grossReceipts} bold />
          <FormLine lineNumber="2" label="Returns and allowances" amount={0} />
          <FormLine lineNumber="3" label="Subtract line 2 from line 1" amount={grossReceipts} bold />
          <FormLine lineNumber="4" label="Cost of goods sold" amount={0} />
          <FormLine lineNumber="5" label="Gross profit. Subtract line 4 from line 3" amount={grossReceipts} bold />
          <FormLine lineNumber="6" label="Other income" amount={0} />
          <FormLine lineNumber="7" label="Gross income. Add lines 5 and 6" amount={grossReceipts} bold />
        </div>

        {/* Part III */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Part III: Expenses</h3>
          <FormLine lineNumber="8" label="Advertising" amount={expenses.advertising} />
          <FormLine lineNumber="9" label="Car and truck expenses" amount={expenses.carAndTruck} />
          <FormLine lineNumber="10" label="Commissions and fees" amount={expenses.commissions} />
          <FormLine lineNumber="11" label="Contract labor" amount={expenses.contractLabor} />
          <FormLine lineNumber="12" label="Depletion" amount={expenses.depletion} />
          <FormLine lineNumber="13" label="Depreciation" amount={expenses.depreciation} />
          <FormLine lineNumber="14" label="Employee benefit programs" amount={0} />
          <FormLine lineNumber="15" label="Insurance (other than health)" amount={expenses.insurance} />
          <FormLine lineNumber="16a" label="Mortgage interest" amount={0} indent />
          <FormLine lineNumber="16b" label="Other interest" amount={expenses.interest} indent />
          <FormLine lineNumber="17" label="Legal and professional services" amount={expenses.legal} />
          <FormLine lineNumber="18" label="Office expense" amount={expenses.office} />
          <FormLine lineNumber="19" label="Pension and profit-sharing plans" amount={expenses.pension} />
          <FormLine lineNumber="20a" label="Vehicles and equipment rent" amount={expenses.rentLease} indent />
          <FormLine lineNumber="20b" label="Other business property rent" amount={0} indent />
          <FormLine lineNumber="21" label="Repairs and maintenance" amount={expenses.repairs} />
          <FormLine lineNumber="22" label="Supplies" amount={expenses.supplies} />
          <FormLine lineNumber="23" label="Taxes and licenses" amount={expenses.taxes} />
          <FormLine lineNumber="24a" label="Travel" amount={expenses.travel} />
          <FormLine lineNumber="24b" label="Meals" amount={expenses.meals} />
          <FormLine lineNumber="25" label="Utilities" amount={expenses.utilities} />
          <FormLine lineNumber="26" label="Wages" amount={expenses.wages} />
          <FormLine lineNumber="27a" label="Other expenses" amount={expenses.other} />
        </div>

        {/* Total Expenses and Net Profit */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300">
          <FormLine 
            lineNumber="28" 
            label="Total expenses. Add lines 8 through 27a" 
            amount={totalExpenses} 
            bold 
          />
          <FormLine 
            lineNumber="29" 
            label="Tentative profit or (loss). Subtract line 28 from line 7" 
            amount={netProfit} 
            bold 
          />
          <FormLine 
            lineNumber="30" 
            label="Expenses for business use of your home" 
            amount={0} 
          />
          <FormLine 
            lineNumber="31" 
            label="Net profit or (loss). Subtract line 30 from line 29" 
            amount={netProfit} 
            bold 
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onPrint}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Form
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
