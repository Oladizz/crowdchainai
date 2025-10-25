

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Button from './Button';
import { useAppContext } from '../context/AppContext';

const BlockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 0v10l8 4m0-14L4 7" />
  </svg>
);

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const Header: React.FC = () => {
  const { user, login, truncateAddress } = useAppContext();

  return (
    <header className="bg-white/60 dark:bg-brand-surface/60 backdrop-blur-lg sticky top-0 z-30 border-b border-gray-200 dark:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center space-x-2 md:hidden">
            <BlockIcon />
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-wider">CrowdChain</span>
          </NavLink>
          <div className="w-full flex justify-end">
            {user ? (
               <div className="flex items-center space-x-2">
                 <Link to={`/profile/${user.walletAddress}`} className="flex items-center space-x-2 text-xs sm:text-sm font-medium bg-brand-surface text-brand-muted px-2 py-1.5 rounded-full hover:text-white transition-colors border border-brand-surface hover:border-brand-muted">
                    {user.avatar ? (
                        <img src={user.avatar} alt="user avatar" className="w-6 h-6 rounded-full object-cover border border-brand-surface"/>
                    ) : (
                        <UserIcon className="w-5 h-5 text-brand-muted" />
                    )}
                    <span className="font-mono hidden sm:inline truncate">{user.username || truncateAddress(user.walletAddress)}</span>
                 </Link>
               </div>
            ) : (
              <div data-guide="connect-wallet">
                <Button onClick={login} variant="secondary">Connect on Base</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;