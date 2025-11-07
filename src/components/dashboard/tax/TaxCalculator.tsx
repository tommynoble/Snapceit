import React, { useMemo, useState } from 'react';
import { useReceipts } from '../receipts/ReceiptContext';
import { Calculator, Filter, Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { Receipt } from '../receipts/ReceiptContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TaxCategory = 'business' | 'personal' | 'medical' | 'charity' | 'education';
type ExportFormat = 'pdf' | 'excel' | 'csv';

interface TaxSummary {
  totalDeductible: number;
  byCategory: Record<TaxCategory, number>;
  taxesPaid: Record<TaxCategory, number>;
  totalTax: number;
  totalSpent: number;
}

export function TaxCalculator() {
  const { receipts } = useReceipts();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategories, setSelectedCategories] = useState<TaxCategory[]>([]);
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
         (receipt.taxCategory && selectedCategories.includes(receipt.taxCategory)));
    });
  }, [receipts, selectedYear, selectedCategories]);

  const taxSummary = useMemo((): TaxSummary => {
    const initialSummary = {
      totalDeductible: 0,
      byCategory: {} as Record<TaxCategory, number>,
      taxesPaid: {} as Record<TaxCategory, number>,
      totalTax: 0,
      totalSpent: 0
    };

    // Initialize all categories with 0
    const categories: TaxCategory[] = ['business', 'personal', 'medical', 'charity', 'education'];
    categories.forEach(category => {
      initialSummary.byCategory[category] = 0;
      initialSummary.taxesPaid[category] = 0;
    });

    return filteredReceipts.reduce((summary, receipt) => {
      const amount = receipt.total || 0;
      const taxAmount = receipt.tax?.total || 0;

      summary.totalSpent += amount;
      summary.totalTax += taxAmount;

      if (receipt.taxCategory) {
        summary.byCategory[receipt.taxCategory] += amount;
        summary.taxesPaid[receipt.taxCategory] += taxAmount;
        
        if (receipt.taxDeductible) {
          summary.totalDeductible += amount;
        }
      }

      return summary;
    }, initialSummary);
  }, [filteredReceipts]);

  const handleCategoryToggle = (category: TaxCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateReportData = () => {
    const summaryData = [
      ['Tax Year', selectedYear],
      ['Total Spent', `$${taxSummary.totalSpent.toFixed(2)}`],
      ['Total Tax', `$${taxSummary.totalTax.toFixed(2)}`],
      ['Total Deductible', `$${taxSummary.totalDeductible.toFixed(2)}`],
      [''],
      ['Category Breakdown'],
    ];

    Object.entries(taxSummary.byCategory).forEach(([category, amount]) => {
      summaryData.push([
        category.charAt(0).toUpperCase() + category.slice(1),
        `$${amount.toFixed(2)}`
      ]);
    });

    const receiptData = filteredReceipts.map(receipt => ({
      Date: new Date(receipt.date).toLocaleDateString(),
      Merchant: receipt.merchant,
      Category: receipt.category || 'Uncategorized',
      TaxCategory: receipt.taxCategory 
        ? receipt.taxCategory.charAt(0).toUpperCase() + receipt.taxCategory.slice(1)
        : 'Uncategorized',
      Amount: `$${receipt.total.toFixed(2)}`,
      Tax: `$${(receipt.tax?.total || 0).toFixed(2)}`,
      Deductible: receipt.taxDeductible ? 'Yes' : 'No'
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
      head: [['Date', 'Merchant', 'Category', 'Tax Category', 'Amount', 'Tax', 'Deductible']],
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
                Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['business', 'personal', 'medical', 'charity', 'education'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category as TaxCategory)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedCategories.includes(category as TaxCategory)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
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
                  ${taxSummary.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70">Total Tax</p>
                <p className="text-2xl font-bold text-white">
                  ${taxSummary.totalTax.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm text-white/70">Total Deductible</p>
              <p className="text-2xl font-bold text-white mb-4">
                ${taxSummary.totalDeductible.toFixed(2)}
              </p>
              
              <div className="mt-2">
                <p className="text-sm text-white/70 mb-2">Taxes Paid</p>
                <div className="space-y-2">
                  {Object.entries(taxSummary.taxesPaid).map(([category, tax]) => (
                    <div key={category} className="flex justify-between items-center text-sm">
                      <span className="text-white/80">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <span className="text-white/80">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {Object.entries(taxSummary.byCategory).length > 0 && (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-2">By Category</p>
                <div className="space-y-2">
                  {Object.entries(taxSummary.byCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-white">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <span className="text-white font-medium">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <th className="text-left py-2 px-4">Category</th>
                <th className="text-left py-2 px-4">Tax Category</th>
                <th className="text-right py-2 px-4">Amount</th>
                <th className="text-right py-2 px-4">Tax</th>
                <th className="text-center py-2 px-4">Deductible</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="text-white border-t border-white/5">
                  <td className="py-2 px-4">
                    {new Date(receipt.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">{receipt.merchant}</td>
                  <td className="py-2 px-4">
                    {receipt.category || 'Uncategorized'}
                  </td>
                  <td className="py-2 px-4">
                    {receipt.taxCategory
                      ? receipt.taxCategory.charAt(0).toUpperCase() + receipt.taxCategory.slice(1)
                      : 'Uncategorized'}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${receipt.total.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ${(receipt.tax?.total || 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {receipt.taxDeductible ? '✓' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
