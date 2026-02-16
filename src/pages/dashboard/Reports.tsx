import { motion } from 'framer-motion';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { SpendingOverviewCard } from '../../components/dashboard/spending/SpendingOverviewCard';
import { MonthlySpendingCard } from '../../components/dashboard/stats/MonthlySpendingCard';
import { CategoriesCard } from '../../components/dashboard/stats/CategoriesCard';
import { TotalReceiptsCard } from '../../components/dashboard/stats/TotalReceiptsCard';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export function Reports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Reports"
        description="View detailed analytics and insights about your spending"
        addDesktopTopPadding={true}
        actionButton={
          <button
            onClick={() => navigate('/dashboard/tax-reports')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/10"
          >
            <FileText size={18} />
            Go to Tax Reports
            <ArrowRight size={16} className="opacity-60" />
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TotalReceiptsCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MonthlySpendingCard />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <CategoriesCard />
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 pl-1">Spending Analysis</h3>
            <SpendingOverviewCard />
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/10 rounded-2xl p-6 h-full"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
            <p className="text-white/60 text-sm mb-6">
              Download your spending data for analysis in other tools or for your records.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/receipts')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">All Receipts</p>
                    <p className="text-xs text-white/50">CSV / Excel Format</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/40 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/dashboard/tax-reports')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Schedule C</p>
                    <p className="text-xs text-white/50">Tax Preparation PDF</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/40 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
