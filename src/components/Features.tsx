import { LogIn, ScanLine, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }
    },
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const features = [
    {
      icon: (
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="w-12 h-12 bg-purple-100/10 rounded-xl p-2 backdrop-blur-sm"
        >
          <LogIn className="w-8 h-8 text-purple-500/90" />
        </motion.div>
      ),
      title: "Quick Setup",
      description: "Get started in seconds with a free account. No credit card required - just sign up and start transforming your receipts into insights."
    },
    {
      icon: (
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="w-12 h-12 bg-purple-100/10 rounded-xl p-2 backdrop-blur-sm"
        >
          <ScanLine className="w-8 h-8 text-purple-500/90" />
        </motion.div>
      ),
      title: "Instant Scanning",
      description: "Simply snap a photo of your receipt and watch as our AI instantly extracts all important details. No more manual data entry!"
    },
    {
      icon: (
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="w-12 h-12 bg-purple-100/10 rounded-xl p-2 backdrop-blur-sm"
        >
          <UserCog className="w-8 h-8 text-purple-500/90" />
        </motion.div>
      ),
      title: "Smart Insights",
      description: "Track spending patterns, set budgets, and get personalized insights to help you make smarter financial decisions."
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 tracking-normal leading-[1.15] sm:leading-[1.2]">
            Save your receipt in<br className="block sm:hidden" /> the Cloud
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Scan your receipt in three easy steps, we take care of the rest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-5 sm:p-6 rounded-3xl transition-all duration-300 border border-purple-100 bg-gradient-to-br from-fuchsia-50/80 to-purple-50/80 hover:shadow-lg hover:shadow-purple-100/20 flex flex-col items-center text-center md:text-left md:items-start"
            >
              <div className="mb-3 sm:mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
