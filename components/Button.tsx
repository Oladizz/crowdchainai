import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  Icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', Icon, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 border text-xs sm:text-sm font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg transition-all duration-300 transform hover:scale-105';

  const variantStyles = {
    primary: 'bg-brand-button text-white hover:bg-brand-button-hover disabled:bg-gray-500 border-brand-button-hover',
    secondary: 'bg-transparent border-2 border-brand-muted text-brand-muted hover:bg-brand-button-hover hover:text-white hover:border-brand-button-hover',
    ghost: 'bg-transparent text-brand-blue-light hover:bg-brand-surface border-transparent hover:border-brand-blue-light'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 -ml-1" />}
      {children}
    </button>
  );
};

export default Button;