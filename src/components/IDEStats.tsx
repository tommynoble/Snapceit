import { motion } from 'framer-motion';

const BusinessReviewStats = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 items-center">
      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full" style={{ boxShadow: 'inset 0 0 0 1px rgba(199,103,255,0.6), 0 0 15px rgba(199,103,255,0.2)' }}>
        <img src="/google.svg" alt="Google Reviews" className="w-6 h-6" />
        <div className="w-px h-4 bg-white/20"></div>
        <span className="text-yellow-400 text-base">★</span>
        <span className="text-white text-xl">2.06M</span>
      </div>

      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full" style={{ boxShadow: 'inset 0 0 0 1px rgba(199,103,255,0.6), 0 0 15px rgba(199,103,255,0.2)' }}>
        <img src="/yelp.svg" alt="Yelp" className="w-6 h-6" />
        <div className="w-px h-4 bg-white/20"></div>
        <span className="text-yellow-400 text-base">★</span>
        <span className="text-white text-xl">1.03M</span>
      </div>

      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full" style={{ boxShadow: 'inset 0 0 0 1px rgba(199,103,255,0.6), 0 0 15px rgba(199,103,255,0.2)' }}>
        <img src="/trustpilot.svg" alt="Trustpilot" className="w-6 h-6" />
        <div className="w-px h-4 bg-white/20"></div>
        <span className="text-yellow-400 text-base">★</span>
        <span className="text-white text-xl">40.0K</span>
      </div>

      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-6 py-3 rounded-full" style={{ boxShadow: 'inset 0 0 0 1px rgba(199,103,255,0.6), 0 0 15px rgba(199,103,255,0.2)' }}>
        <img src="/bbb.svg" alt="Better Business Bureau" className="w-6 h-6" />
        <div className="w-px h-4 bg-white/20"></div>
        <span className="text-yellow-400 text-base">★</span>
        <span className="text-white text-xl">4.5K</span>
      </div>
    </div>
  );
};

export default BusinessReviewStats;
