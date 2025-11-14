import { useState } from 'react';
import About from '../components/About';
import Features2 from '../components/Features2';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuickbooksSection from '../components/QuickbooksSection';
import PricingSection from '../components/PricingSection';
import ReviewsSection from '../components/ReviewsSection';

const Home = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <Hero />
        </div>
      </div>
      <main>
        {/* About Section */}
        <About />
        <QuickbooksSection />
        <Features2 />
        <ReviewsSection />
        <PricingSection />
        <Footer />
      </main>
    </div>
  );
};

export default Home;
