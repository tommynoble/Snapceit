import { useState } from 'react';
import Features from '../components/Features';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
        {/* Features Section */}
        <Features />
        <Footer />
      </main>
    </div>
  );
};

export default Home;
