

import React, { useState, useLayoutEffect } from 'react';
import { GuideStep } from '../guideConfig';

interface UserGuideProps {
  steps: GuideStep[];
  guideKey: string;
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ steps, guideKey, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];

  useLayoutEffect(() => {
    if (!step) return;

    const element = document.querySelector(step.elementSelector);
    if (element) {
        const handleScroll = () => {
            setTargetRect(element.getBoundingClientRect());
        }
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        // Timeout to allow for scroll animation
        const timeoutId = setTimeout(() => {
            setTargetRect(element.getBoundingClientRect());
            window.addEventListener('scroll', handleScroll, true);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', handleScroll, true);
        }
    }
  }, [currentStep, step]);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishGuide();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const finishGuide = () => {
      localStorage.setItem(`guide_${guideKey}_viewed`, 'true');
      onClose();
  }
  
  if (!step || !targetRect) return null;

  const highlightStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${targetRect.top - 5}px`,
    left: `${targetRect.left - 5}px`,
    width: `${targetRect.width + 10}px`,
    height: `${targetRect.height + 10}px`,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
    borderRadius: '12px',
    transition: 'all 0.3s ease-in-out',
    pointerEvents: 'none',
  };
  
  let infoBoxStyle: React.CSSProperties = {
      position: 'fixed',
      top: `${targetRect.bottom + 15}px`,
      left: `${targetRect.left}px`,
      maxWidth: '320px',
      zIndex: 101,
  }
  
  const { innerWidth, innerHeight } = window;
  if (targetRect.bottom + 180 > innerHeight) { 
    infoBoxStyle.top = `${targetRect.top - 15}px`;
    infoBoxStyle.transform = 'translateY(-100%)';
  }
  if (targetRect.left + 320 > innerWidth) { 
    infoBoxStyle.left = `${targetRect.right}px`;
    infoBoxStyle.transform = infoBoxStyle.transform ? `${infoBoxStyle.transform} translateX(-100%)` : 'translateX(-100%)';
  }
  if (targetRect.left < 0) {
      infoBoxStyle.left = '10px';
  }
  
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-live="polite" aria-modal="true" role="dialog">
      <div style={highlightStyle}></div>
      <div style={infoBoxStyle} className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 rounded-xl shadow-2xl text-white animate-fade-in w-full sm:w-auto pointer-events-auto">
        <h3 className="font-bold text-lg mb-2 text-brand-blue-light">{step.title}</h3>
        <p className="text-sm">{step.content}</p>
        <div className="flex justify-between items-center mt-4">
            <button onClick={finishGuide} className="text-xs text-brand-muted hover:text-white transition-colors">Skip</button>
            <div className="flex items-center space-x-2">
                 <span className="text-xs text-brand-muted">{currentStep + 1} / {steps.length}</span>
                 {currentStep > 0 && (
                    <button onClick={handlePrev} className="text-xs px-3 py-1 rounded-full bg-brand-button hover:bg-brand-button-hover transition-colors border border-brand-button-hover">Prev</button>
                 )}
                 <button onClick={handleNext} className="text-xs px-3 py-1 rounded-full bg-brand-blue hover:bg-opacity-80 text-white font-semibold transition-colors border border-brand-blue-light">
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;