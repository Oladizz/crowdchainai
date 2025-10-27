

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const HomeIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);


const CompassIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const DaoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ShieldCheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);


interface NavItemProps {
  to: string;
  label: string;
  icon: React.ElementType;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon: Icon }) => {
  const baseClasses = 'flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors duration-200 border border-transparent';
  const inactiveClasses = 'text-brand-muted hover:bg-brand-button-hover hover:text-white';
  const activeClasses = 'bg-brand-button text-white border-brand-button-hover';

  return (
    <NavLink to={to} className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} end>
      <Icon className="h-5 w-5 mr-3" />
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
    const { user, truncateAddress } = useAppContext();
    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-brand-surface/60 backdrop-blur-lg border-r border-white/10 hidden md:flex flex-col p-4">
            <Link to="/" state={{ fromLogo: true }} className="flex items-center space-x-2 mb-8 px-2">
                <img src="https://i.postimg.cc/RVSP1wh3/Crowd-logo.png" alt="CrowdChain Logo" className="h-8 w-8 text-brand-blue" />
                <span className="text-xl font-bold text-white tracking-wider">CrowdChain</span>
            </Link>
            <nav className="flex-1 flex flex-col space-y-2">

                <NavItem to="/explore" label="Explore" icon={CompassIcon} />
                <NavItem to="/dao" label="DAO Governance" icon={DaoIcon} />
                {user && <NavItem to="/dashboard" label="Dashboard" icon={UserIcon} />}
                {user && user.role === 'admin' && <NavItem to="/admin" label="Admin Panel" icon={ShieldCheckIcon} />}
            </nav>
            {user && (
                <div className="mt-auto p-2 bg-brand-bg/80 rounded-lg border border-white/10">
                    <div className="flex items-center">
                        {user.avatar ? (
                            <img src={user.avatar} alt="User avatar" className="w-10 h-10 rounded-full bg-brand-surface object-cover flex-shrink-0 border-2 border-brand-surface" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center flex-shrink-0 border-2 border-brand-surface">
                                <UserIcon className="w-6 h-6 text-brand-muted" />
                            </div>
                        )}
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user.username || 'Connected'}</p>
                            <p className="text-xs text-brand-muted truncate font-mono">{truncateAddress(user.walletAddress)}</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;