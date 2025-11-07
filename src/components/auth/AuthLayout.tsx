import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
