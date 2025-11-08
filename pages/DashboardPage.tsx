import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from '../components/Button';
import InvestmentsTab from '../components/InvestmentsTab';
import ProjectsTab from '../components/ProjectsTab';
import SettingsTab from '../components/SettingsTab';
import CreateProjectTab from '../components/CreateProjectTab';

type Tab = 'investments' | 'projects' | 'create' | 'settings';

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const VerifiedIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5 text-blue-500"}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);

const DashboardPage: React.FC = () => {
    const { user, login } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>(user?.role === 'creator' ? 'projects' : 'investments');

    if (!user) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Access Your Dashboard</h1>
                <p className="mt-4 text-brand-muted">Please connect your wallet to view your projects and investments.</p>
                <Button onClick={login} variant="primary" className="mt-8">Connect Wallet</Button>
            </div>
        );
    }
    
    const isCreator = user.role === 'creator';

    const renderTabContent = () => {
        switch (activeTab) {
            case 'investments':
                return <InvestmentsTab />;
            case 'projects':
                return isCreator ? <ProjectsTab setActiveTab={setActiveTab} /> : null;
            case 'create':
                return isCreator ? <CreateProjectTab /> : null;
            case 'settings':
                return <SettingsTab />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap border ${activeTab === tabName ? 'bg-brand-blue/20 text-white border-brand-blue' : 'bg-brand-surface/60 text-brand-muted hover:bg-brand-surface hover:text-white border-transparent'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div data-guide="dashboard-welcome" className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words flex items-center gap-2">
                        Welcome, {user.username || (isCreator ? 'Creator' : 'Investor')}
                        {user.isSuperAdmin && <VerifiedIcon className="w-6 h-6 text-blue-400" />}
                        {user.role === 'premium' && (
                            <span className="text-xs bg-yellow-400/80 text-yellow-900 font-bold px-2 py-1 rounded-full">PREMIUM</span>
                        )}
                    </h1>                    <p className="text-brand-muted mt-1 font-mono text-sm break-words">{user.walletAddress}</p>
                </div>
                 {user.avatar ? (
                    <img src={user.avatar} alt="User Avatar" className="w-16 h-16 rounded-full object-cover bg-brand-surface self-start sm:self-center flex-shrink-0 border-2 border-brand-surface" />
                 ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center self-start sm:self-center flex-shrink-0 border-2 border-brand-surface">
                        <UserIcon className="w-10 h-10 text-brand-muted" />
                    </div>
                 )}
            </div>

            <div>
                <div data-guide="dashboard-tabs" className="mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <TabButton tabName="investments" label="My Investments" />
                        {isCreator && <TabButton tabName="projects" label="My Projects" />}
                        {isCreator && <TabButton tabName="create" label="Create Project" />}
                        <TabButton tabName="settings" label="Settings" />
                    </div>
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;