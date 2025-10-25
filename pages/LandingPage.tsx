import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import LoginModal from '../components/LoginModal';

const LandingPage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalModalOpen] = useState(false);

  return (
    <>
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-brand-bg text-white p-4">
        {/* Background Animation */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-brand-bg via-brand-surface to-black animate-gradient-xy" 
          style={{ backgroundSize: '200% 200%' }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_farthest-side_at_50%_50%,rgba(0,191,255,0.25),transparent)]"></div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl mx-auto">
              <div className="animate-fade-in mx-auto mb-6">
                  <img src="https://i.postimg.cc/RVSP1wh3/Crowd-logo.png" alt="CrowdChain Logo" className="h-20 w-20 mx-auto" />
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-text-focus-in" style={{ animationDelay: '0.5s' }}>
                  CrowdChain
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-brand-muted animate-fade-in" style={{ animationDelay: '1s' }}>
                  The Future of Funding, Built by Community.
              </p>
              <div className="mt-10 animate-slide-in-bottom flex flex-col sm:flex-row justify-center items-center gap-4" style={{ animationDelay: '1.5s' }}>
                  <Button 
                      onClick={() => setIsLoginModalOpen(true)}
                      variant="primary" 
                      className="text-base px-8 py-3 rounded-full shadow-lg shadow-brand-blue/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-blue/50 hover:scale-105"
                  >
                      Join as a Creator
                  </Button>
                  <Link to="/home">
                      <Button 
                          variant="secondary" 
                          className="text-base px-8 py-3 rounded-full"
                      >
                          Explore as an Investor
                      </Button>
                  </Link>
              </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default LandingPage;