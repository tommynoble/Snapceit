import { motion } from 'framer-motion';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export function Reports() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <DashboardHeader
        title="Reports"
        description="View detailed analytics and insights about your spending and taxes"
        addDesktopTopPadding={true}
      />

      {/* Content will go here */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-white/60">Reports page coming soon...</p>
      </div>
    </motion.div>
  );
}
