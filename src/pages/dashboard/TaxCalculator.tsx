import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Calculator, FileText, ChevronRight } from 'lucide-react';

export const TaxCalculator = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const taxYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader userName="Thomas" onProfileClick={() => {}} />
      
      {/* Year Selection */}
      <div className="flex gap-4 mb-6">
        {taxYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedYear === year
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Summary */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Tax Summary</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/80">Total Income</span>
              <span className="text-white font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/80">Total Deductions</span>
              <span className="text-white font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
              <span className="text-white/80">Estimated Tax</span>
              <span className="text-white font-semibold">$0.00</span>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-[#00E5FF]" />
            <h2 className="text-2xl font-bold text-white">Recent Documents</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white/60" />
                <div className="text-left">
                  <p className="text-white">W-2 Form</p>
                  <p className="text-white/60 text-sm">Added Dec 15, 2023</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white/60" />
                <div className="text-left">
                  <p className="text-white">1099-MISC</p>
                  <p className="text-white/60 text-sm">Added Dec 10, 2023</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
