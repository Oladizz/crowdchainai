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
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap border ${activeTab === tabName ? 'bg-brand-button text-white border-brand-button-hover' : 'text-brand-muted hover:bg-brand-surface hover:text-white border-transparent'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div data-guide="dashboard-welcome" className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">Welcome, {user.username || (isCreator ? 'Creator' : 'Investor')}</h1>
                    <p className="text-brand-muted mt-1 font-mono text-sm break-words">{user.walletAddress}</p>
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
                <div data-guide="dashboard-tabs" className="border-b border-gray-200 dark:border-brand-surface mb-6">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                        <TabButton tabName="investments" label="My Investments" />
                        {isCreator && <TabButton tabName="projects" label="My Projects" />}
                        {isCreator && <TabButton tabName="create" label="Create Project" />}
                        <TabButton tabName="settings" label="Settings" />
                    </nav>
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;