import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import StatCard from './StatCard';

const AdminStatsTab: React.FC = () => {
    const { projects, allUsers, proposals, waitlist } = useAppContext();

    const totalFundsRaised = Math.round(projects.reduce((sum, p) => sum + p.amountRaised, 0));
    const activeProjects = projects.filter(p => p.daoStatus === 'Approved').length;
    const pendingProjects = projects.filter(p => p.daoStatus === 'Pending').length;
    const totalUsers = allUsers.length;
    const activeProposals = proposals.filter(p => new Date(p.deadline) > new Date()).length;
    const waitlistSignups = waitlist.length;

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                <StatCard label="Total Funds Raised" value={totalFundsRaised} prefix="$" />
                <StatCard label="Active Projects" value={activeProjects} />
                <StatCard label="Pending Projects" value={pendingProjects} />
                <StatCard label="Total Users" value={totalUsers} />
                <StatCard label="Active Proposals" value={activeProposals} />
                <StatCard label="Waitlist Signups" value={waitlistSignups} />
            </div>
        </div>
    );
};

export default AdminStatsTab;
