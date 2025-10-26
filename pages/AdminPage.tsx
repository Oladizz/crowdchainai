import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import AdminStatsTab from '../components/AdminStatsTab';
import AdminProjectsTab from '../components/AdminProjectsTab';
import AdminUsersTab from '../components/AdminUsersTab';
import AdminProposalsTab from '../components/AdminProposalsTab';
import AdminWaitlistTab from '../components/AdminWaitlistTab';
import AdminContactsTab from '../components/AdminContactsTab';

type AdminTab = 'overview' | 'projects' | 'users' | 'proposals' | 'waitlist' | 'contacts';

const AdminPage: React.FC = () => {
    const { user } = useAppContext();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    if (user?.role !== 'admin') {
        return (
            <div className="text-center py-20 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-red-500">Access Denied</h1>
                <p className="mt-4 text-brand-muted">You do not have permission to view this page.</p>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminStatsTab />;
            case 'projects':
                return <AdminProjectsTab />;
            case 'users':
                return <AdminUsersTab />;
            case 'proposals':
                return <AdminProposalsTab />;
            case 'waitlist':
                return <AdminWaitlistTab />;
            case 'contacts':
                return <AdminContactsTab />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{tabName: AdminTab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap border ${activeTab === tabName ? 'bg-brand-button text-white border-brand-button-hover' : 'text-brand-muted hover:bg-brand-surface hover:text-white border-transparent'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-brand-muted mt-1">Platform management and overview.</p>
            </div>

            <div>
                <div className="border-b border-gray-200 dark:border-brand-surface mb-6">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                        <TabButton tabName="overview" label="Overview" />
                        <TabButton tabName="projects" label="Projects" />
                        <TabButton tabName="users" label="Users" />
                        <TabButton tabName="proposals" label="Proposals" />
                        <TabButton tabName="waitlist" label="Waitlist" />
                        <TabButton tabName="contacts" label="Contacts" />
                    </nav>
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;