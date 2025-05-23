import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent h-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block bg-blue-50 text-[#094AB9] text-sm font-medium px-3 py-1 rounded-full">
                  Revolutionizing Event Management
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-[#232560]">
                  <span className="block">Transform How You</span>
                  <span className="block mt-2 text-[#094AB9]">Manage Events</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-lg">
                  Our event management system revolutionizes how organizations plan, manage, and execute events. 
                  From seamless registration to real-time analytics, we provide all the tools you need.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;