import React from 'react';

const QuestionMarkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface GuideButtonProps {
  onClick: () => void;
}

const GuideButton: React.FC<GuideButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 sm:bottom-4 right-4 z-[99]"
      aria-label="Show application guide"
    >
        <div className="bg-brand-purple text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-blue transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-blue border-2 border-white/20">
            <QuestionMarkIcon />
        </div>
    </button>
  );
};

export default GuideButton;