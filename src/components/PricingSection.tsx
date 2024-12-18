import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Basic',
      price: '9.99',
      description: 'Perfect for individuals and small businesses',
      features: [
        'Scan up to 50 receipts/month',
        'Basic text recognition (OCR)',
        'Export to PDF & CSV',
        'Mobile app access',
        'Email support',
      ],
      popular: false,
      gradient: 'from-blue-500 to-cyan-400',
      buttonGradient: 'from-blue-500 to-cyan-400',
    },
    {
      name: 'Professional',
      price: '24.99',
      description: 'Ideal for growing businesses',
      features: [
        'Unlimited receipt scanning',
        'Advanced OCR with field detection',
        'QuickBooks integration',
        'Custom expense categories',
        'Priority email & chat support',
        'Receipt analytics dashboard',
        'Multi-user access (up to 3)',
      ],
      popular: true,
      gradient: 'from-purple-600 to-pink-500',
      buttonGradient: 'from-purple-600 to-pink-500',
    },
    {
      name: 'Enterprise',
      price: '49.99',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Advanced analytics & reporting',
        'Custom API access',
        'Dedicated account manager',
        'Custom integration support',
        'SLA & premium support',
      ],
      popular: false,
      gradient: 'from-orange-500 to-amber-400',
      buttonGradient: 'from-orange-500 to-amber-400',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Choose the perfect plan for your business needs
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl bg-white p-6 md:p-8 shadow-lg transition-transform duration-300 hover:scale-105 ${
                plan.popular ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-[#FF6B00] to-orange-600 px-3 py-2 text-sm font-medium text-white text-center">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 md:mt-4 flex items-baseline justify-center gap-x-2">
                  <span className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    /month
                  </span>
                </div>
                <p className="mt-4 text-sm md:text-base text-gray-600">{plan.description}</p>
              </div>

              <div className="mt-6 md:mt-8">
                <ul role="list" className="space-y-3 md:space-y-3">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex gap-x-3 text-sm md:text-base"
                    >
                      <Check className={`h-5 w-5 flex-none bg-gradient-to-r ${plan.gradient} text-white rounded-full p-1`} />
                      <span className="text-gray-600">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`mt-6 md:mt-8 block w-full rounded-lg px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#FF6B00] to-orange-600 text-white shadow-sm hover:opacity-90 focus-visible:outline-orange-600'
                    : `bg-gradient-to-r ${plan.buttonGradient} text-white hover:opacity-90 focus-visible:outline-${plan.buttonGradient.split(' ')[1]}`
                }`}
              >
                Get started
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-16 text-gray-600"
        >
          <p className="text-lg">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="mt-2">
            Need a custom plan? <button className="text-purple-600 font-semibold hover:text-purple-700">Contact us</button>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
