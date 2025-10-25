
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

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

interface NavItemProps {
    to: string;
    label: string;
    icon: React.ElementType;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon: Icon }) => {
    const navLinkClasses = "flex flex-col items-center justify-center space-y-1 w-full transition-colors duration-200";
    const inactiveClasses = "text-brand-muted hover:text-brand-blue-light";
    const activeClasses = "text-brand-blue-light";

    return (
        <NavLink
            to={to}
            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}
            end={to === "/"}
        >
            <Icon className="h-6 w-6" />
            <span className="text-xs font-medium">{label}</span>
        </NavLink>
    );
};

const BottomNavBar: React.FC = () => {
  const { user } = useAppContext();
  return (
    <nav data-guide="nav-bar" className="fixed bottom-0 left-0 right-0 h-14 bg-white/60 dark:bg-brand-surface/60 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 z-50 md:hidden">
      <div className="container mx-auto h-full flex justify-around items-center">
        <NavItem to="/explore" label="Explore" icon={CompassIcon} />
        {user && <NavItem to="/dashboard" label="Dashboard" icon={UserIcon} />}
        <NavItem to="/dao" label="DAO" icon={DaoIcon} />
      </div>
    </nav>
  );
};

export default BottomNavBar;
