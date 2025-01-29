import React, { useMemo, useState } from 'react';
import { useReceipts } from '../receipts/ReceiptContext';
import { Calculator, Filter, Download, FileSpreadsheet, FileText, File, Info } from 'lucide-react';
import { Receipt } from '../receipts/ReceiptContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BUSINESS_EXPENSE_CATEGORIES, BusinessExpenseCategoryId } from '../../../constants/us-tax';
import { useCurrency } from '../../../contexts/CurrencyContext';

type TaxCategory = 'business' | 'personal' | 'medical' | 'charity' | 'education';
type ExportFormat = 'pdf' | 'excel' | 'csv';

interface TaxSummary {
  totalDeductible: number;
  byCategory: Record<BusinessExpenseCategoryId, number>;
  deductibleByCategory: Record<BusinessExpenseCategoryId, number>;
  taxesPaid: Record<BusinessExpenseCategoryId, number>;
  totalTax: number;
  totalSpent: number;
}

export function TaxCalculator() {
  const { receipts } = useReceipts();
  const { formatAmount } = useCurrency();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategories, setSelectedCategories] = useState<BusinessExpenseCategoryId[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const years = useMemo(() => {
    const uniqueYears = new Set(
      receipts.map(receipt => new Date(receipt.date).getFullYear())
    );
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const receiptYear = new Date(receipt.date).getFullYear();
      return receiptYear === selectedYear &&
        (selectedCategories.length === 0 || 
         (receipt.businessCategory && selectedCategories.includes(receipt.businessCategory)));
    });
  }, [receipts, selectedYear, selectedCategories]);

  const calculateDeductibleAmount = (receipt: Receipt): number => {
    if (!receipt.businessCategory || !receipt.taxDeductible) return 0;
    
    const category = BUSINESS_EXPENSE_CATEGORIES[receipt.businessCategory];
    if (!category?.deductible) return 0;

    // Special handling for meals
    if (receipt.businessCategory === 'meals') {
      const receiptDate = new Date(receipt.date);
      // COVID relief period (100% deductible)
      if (receiptDate >= new Date('2021-01-01') && receiptDate <= new Date('2022-12-31')) {
        return receipt.total;
      }
      // Regular business meals (50% deductible)
      return receipt.total * 0.5;
    }

    // Use category's deductible percentage
    return receipt.total * ((category.deductiblePercentage || 100) / 100);
  };

  const taxSummary = useMemo((): TaxSummary => {
    const initialSummary = {
      totalDeductible: 0,
      byCategory: {} as Record<BusinessExpenseCategoryId, number>,
      deductibleByCategory: {} as Record<BusinessExpenseCategoryId, number>,
      taxesPaid: {} as Record<BusinessExpenseCategoryId, number>,
      totalTax: 0,
      totalSpent: 0
    };

    // Initialize all categories with 0
    Object.keys(BUSINESS_EXPENSE_CATEGORIES).forEach(category => {
      initialSummary.byCategory[category as BusinessExpenseCategoryId] = 0;
      initialSummary.deductibleByCategory[category as BusinessExpenseCategoryId] = 0;
      initialSummary.taxesPaid[category as BusinessExpenseCategoryId] = 0;
    });

    return filteredReceipts.reduce((summary, receipt) => {
      const amount = receipt.total || 0;
      const taxAmount = receipt.tax?.total || 0;
      const deductibleAmount = calculateDeductibleAmount(receipt);

      summary.totalSpent += amount;
      summary.totalTax += taxAmount;

      if (receipt.businessCategory) {
        summary.byCategory[receipt.businessCategory] += amount;
        summary.taxesPaid[receipt.businessCategory] += taxAmount;
        summary.deductibleByCategory[receipt.businessCategory] += deductibleAmount;
        
        if (receipt.taxDeductible) {
          summary.totalDeductible += deductibleAmount;
        }
      }

      return summary;
    }, initialSummary);
  }, [filteredReceipts]);

  const handleCategoryToggle = (category: BusinessExpenseCategoryId) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateReportData = () => {
    const summaryData = [
      ['Tax Year', selectedYear],
      ['Total Spent', formatAmount(taxSummary.totalSpent)],
      ['Total Tax', formatAmount(taxSummary.totalTax)],
      ['Total Deductible', formatAmount(taxSummary.totalDeductible)],
      [''],
      ['Category Breakdown'],
    ];

    Object.entries(taxSummary.byCategory).forEach(([category, amount]) => {
      const categoryData = BUSINESS_EXPENSE_CATEGORIES[category as BusinessExpenseCategoryId];
      summaryData.push([
        categoryData.name,
        formatAmount(amount)
      ]);
    });

    const receiptData = filteredReceipts.map(receipt => ({
      Date: new Date(receipt.date).toLocaleDateString(),
      Merchant: receipt.merchant,
      Category: receipt.category || 'Uncategorized',
      BusinessCategory: receipt.businessCategory 
        ? BUSINESS_EXPENSE_CATEGORIES[receipt.businessCategory].name
        : 'Uncategorized',
      Amount: formatAmount(receipt.total),
      Tax: formatAmount(receipt.tax?.total || 0),
      DeductibleAmount: receipt.taxDeductible ? formatAmount(calculateDeductibleAmount(receipt)) : '-'
    }));

    return { summaryData, receiptData };
  };

  const downloadPDF = () => {
    const { summaryData, receiptData } = generateReportData();
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`Tax Report ${selectedYear}`, 14, 15);
    
    // Summary Section
    doc.setFontSize(16);
    doc.text('Summary', 14, 30);
    
    autoTable(doc, {
      startY: 35,
      head: [],
      body: summaryData,
      theme: 'striped',
      styles: { fontSize: 10 },
      margin: { left: 14 }
    });
    
    // Receipts Section
    doc.setFontSize(16);
    doc.text('Receipts', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Merchant', 'Category', 'Business Category', 'Amount', 'Tax', 'Deductible Amount']],
      body: receiptData.map(Object.values),
      theme: 'striped',
      styles: { fontSize: 10 },
      margin: { left: 14 }
    });
    
    doc.save(`tax_report_${selectedYear}.pdf`);
  };

  const downloadExcel = () => {
    const { summaryData, receiptData } = generateReportData();
    
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // Receipts Sheet
    const receiptWS = XLSX.utils.json_to_sheet(receiptData);
    XLSX.utils.book_append_sheet(wb, receiptWS, 'Receipts');
    
    XLSX.writeFile(wb, `tax_report_${selectedYear}.xlsx`);
  };

  const downloadCSV = () => {
    const { receiptData } = generateReportData();
    const headers = Object.keys(receiptData[0]);
    const csvContent = [
      headers.join(','),
      ...receiptData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tax_report_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = (format: ExportFormat) => {
    setShowExportOptions(false);
    switch (format) {
      case 'pdf':
        downloadPDF();
        break;
      case 'excel':
        downloadExcel();
        break;
      case 'csv':
        downloadCSV();
        break;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Tax Calculator
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <File className="h-4 w-4" />
                PDF Format
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel Format
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileText className="h-4 w-4" />
                CSV Format
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tax Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Business Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BUSINESS_EXPENSE_CATEGORIES).map(([id, category]) => (
                  <button
                    key={id}
                    onClick={() => handleCategoryToggle(id as BusinessExpenseCategoryId)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedCategories.includes(id as BusinessExpenseCategoryId)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tax Summary</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70">Total Spent</p>
                <p className="text-2xl font-bold text-white">
                  {formatAmount(taxSummary.totalSpent)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70">Total Tax</p>
                <p className="text-2xl font-bold text-white">
                  {formatAmount(taxSummary.totalTax)}
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/70">Total Deductible</p>
              <p className="text-2xl font-bold text-white mb-4">
                {formatAmount(taxSummary.totalDeductible)}
              </p>
              
              <div className="mt-2">
                <p className="text-sm text-white/70 mb-2">Deductible By Category</p>
                <div className="space-y-2">
                  {Object.entries(taxSummary.deductibleByCategory)
                    .filter(([_, amount]) => amount > 0)
                    .map(([categoryId, amount]) => {
                      const category = BUSINESS_EXPENSE_CATEGORIES[categoryId as BusinessExpenseCategoryId];
                      return (
                        <div key={categoryId} className="flex justify-between items-center text-sm group">
                          <div className="flex items-center gap-1">
                            <span className="text-white/80">{category.name}</span>
                            <div className="relative group">
                              <Info className="h-4 w-4 text-white/40 hover:text-white/60 cursor-help" />
                              <div className="hidden group-hover:block absolute left-full ml-2 p-2 bg-gray-800 rounded-lg text-xs text-white w-48 z-10">
                                {category.description}
                                {category.limitations && (
                                  <p className="mt-1 text-white/70">{category.limitations}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-white/80">
                            {formatAmount(amount)}
                          </span>
                        </div>
                      );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Receipts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-white/70 text-sm">
                <th className="text-left py-2 px-4">Date</th>
                <th className="text-left py-2 px-4">Merchant</th>
                <th className="text-left py-2 px-4">Business Category</th>
                <th className="text-right py-2 px-4">Amount</th>
                <th className="text-right py-2 px-4">Tax</th>
                <th className="text-right py-2 px-4">Deductible Amount</th>
                <th className="text-center py-2 px-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => {
                const deductibleAmount = calculateDeductibleAmount(receipt);
                const category = receipt.businessCategory ? 
                  BUSINESS_EXPENSE_CATEGORIES[receipt.businessCategory] : undefined;
                
                return (
                  <tr key={receipt.id} className="text-white border-t border-white/5">
                    <td className="py-2 px-4">
                      {new Date(receipt.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">{receipt.merchant}</td>
                    <td className="py-2 px-4">
                      {category?.name || 'Uncategorized'}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {formatAmount(receipt.total)}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {formatAmount(receipt.tax?.total || 0)}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {receipt.taxDeductible ? formatAmount(deductibleAmount) : '-'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {receipt.businessCategory === 'meals' && (
                        <div className="group relative">
                          <Info className="h-4 w-4 text-white/40 hover:text-white/60 cursor-help inline" />
                          <div className="hidden group-hover:block absolute right-0 mt-1 p-2 bg-gray-800 rounded-lg text-xs text-white w-48 z-10">
                            {new Date(receipt.date) >= new Date('2021-01-01') && 
                             new Date(receipt.date) <= new Date('2022-12-31')
                              ? '100% deductible (COVID relief period)'
                              : '50% deductible (standard business meal)'}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
