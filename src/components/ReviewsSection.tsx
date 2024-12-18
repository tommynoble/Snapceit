import { motion } from 'framer-motion';

const ReviewsSection = () => {
  const reviews = [
    {
      title: "Transformed Our Receipt Management",
      text: "This app has completely transformed how we handle receipts. The OCR accuracy is impressive!",
      author: "Sarah Johnson",
      role: "CFO",
      company: "Microsoft",
      logo: "https://cdn.worldvectorlogo.com/logos/microsoft-5.svg",
    },
    {
      title: "Seamless QuickBooks Integration",
      text: "Integration with QuickBooks was seamless. Saved us countless hours of manual data entry.",
      author: "Michael Chen",
      role: "Small Business Owner",
      company: "Salesforce",
      logo: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg",
    },
    {
      title: "Best Receipt Scanner",
      text: "The best receipt scanner we've used. The mobile app is intuitive and fast.",
      author: "Emma Davis",
      role: "Accounting Manager",
      company: "Adobe",
      logo: "https://cdn.worldvectorlogo.com/logos/adobe-2.svg",
    },
    {
      title: "Exceptional Support",
      text: "Customer support is exceptional. They helped us set up custom integrations quickly.",
      author: "James Wilson",
      role: "Operations Director",
      company: "Shopify",
      logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    },
    {
      title: "Great Analytics Insights",
      text: "The analytics dashboard gives us great insights into our expenses.",
      author: "Lisa Thompson",
      role: "Finance Director",
      company: "Stripe",
      logo: "https://cdn.worldvectorlogo.com/logos/stripe-3.svg",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 py-32">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96">
          <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-3xl animate-random-1"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px]">
          <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-3xl animate-random-2"></div>
        </div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-random-3"></div>
        </div>
      </div>

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Businesses love Snapiet
          </motion.h2>
        </div>
      </div>

      {/* Reviews Slider - Full Width */}
      <div className="w-full overflow-hidden">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          className="flex gap-6 pl-8"
        >
          {[...reviews, ...reviews].map((review, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="w-[450px] shrink-0 bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col"
            >
              <h3 className="text-white font-bold text-2xl mb-5 break-words">{review.title}</h3>
              <p className="text-white/90 text-lg mb-8 flex-grow break-words leading-relaxed">{review.text}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex-1">
                  <p className="text-white font-semibold">{review.author}</p>
                  <p className="text-white/70 text-sm">{review.role}</p>
                  <p className="text-white/70 text-sm">{review.company}</p>
                </div>
                <div className="relative h-16 w-16 flex items-center justify-center ml-4">
                  <img
                    src={review.logo}
                    alt={review.company}
                    className={`h-full w-full object-contain ${review.company === 'Stripe' ? 'brightness-0 invert' : ''}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
