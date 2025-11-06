import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, doc, updateDoc, deleteDoc, QueryDocumentSnapshot, where, getCountFromServer, setDoc, onSnapshot } from 'firebase/firestore';
import { Project, Proposal, User } from '../context/types';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { useAppContext } from '../context/AppContext';

type Tab = 'overview' | 'projects' | 'users' | 'proposals' | 'waitlist' | 'contacts' | 'reports';

interface WaitlistEntry {
    id: string;
    email: string;
    createdAt: any;
}

interface ContactEntry {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: any;
}

const PAGE_SIZE = 10;

const AdminPage: React.FC = () => {
    const { addToast, user, projects, proposals, allUsers, waitlist } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    
    const [data, setData] = useState<Record<string, any[]>>({
        projects: [], proposals: [], users: [], waitlist: [], contacts: [], reports: []
    });
    const [lastDocs, setLastDocs] = useState<Record<string, QueryDocumentSnapshot | null>>({});
    const [hasMore, setHasMore] = useState<Record<string, boolean>>({});
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
    const [admins, setAdmins] = useState<Set<string>>(new Set());
    const [superAdmins, setSuperAdmins] = useState<Set<string>>(new Set());
    const [overviewStats, setOverviewStats] = useState({
        totalFunds: 0,
        activeProjects: 0,
        pendingProjects: 0,
        totalUsers: 0,
        activeProposals: 0,
        waitlistSignups: 0,
    });

    useEffect(() => {
        const totalFunds = Math.round(projects.reduce((sum, p) => sum + p.amountRaised, 0));
        const activeProjects = projects.filter(p => p.daoStatus === 'Approved').length;
        const pendingProjects = projects.filter(p => p.daoStatus === 'Pending').length;
        const usersCount = allUsers.length;
        const proposalsCount = proposals.length;
        const waitlistCount = waitlist.length;

        setOverviewStats({
            totalFunds,
            activeProjects,
            pendingProjects,
            totalUsers: usersCount,
            activeProposals: proposalsCount,
            waitlistSignups: waitlistCount,
        });

        let isMounted = true;
        const unsubAdmins = onSnapshot(collection(db, "admins"), (snap) => {
            const adminSet = new Set(snap.docs.map(doc => doc.id));
            if (isMounted) setAdmins(adminSet);
        });
        const unsubSuperAdmins = onSnapshot(collection(db, "superAdmins"), (snap) => {
            const superAdminSet = new Set(snap.docs.map(doc => doc.id));
            if (isMounted) setSuperAdmins(superAdminSet);
        });

        return () => {
            isMounted = false;
            unsubAdmins();
            unsubSuperAdmins();
        };
    }, [projects, allUsers, proposals, waitlist]);

    const handleSearchChange = (tab: Tab, value: string) => {
        setSearchTerms(prev => ({ ...prev, [tab]: value }));
    };

    const fetchData = useCallback(async (dataType: Tab, loadMore = false, signal: AbortSignal) => {
        if (dataType === 'overview') return;
        if (!loadMore) {
            setHasMore(prev => ({ ...prev, [dataType]: true }));
        }

        const collectionRef = collection(db, dataType);
        const lastDoc = loadMore ? lastDocs[dataType] : null;
        const searchTerm = searchTerms[dataType] || '';
        
        let q;
        let orderField = 'name';
        let searchField = 'name_lowercase';
        if (dataType === 'waitlist' || dataType === 'contacts') {
            orderField = 'createdAt';
            searchField = 'email';
        }
        if (dataType === 'proposals') {
            orderField = 'projectName';
            searchField = 'projectName'; // Proposals don't have a lowercase field yet
        }
        if (dataType === 'users') {
            orderField = 'walletAddress';
            searchField = 'username_lowercase';
        }

        const orderDirection = (orderField === 'createdAt') ? 'desc' : 'asc';

        let baseQuery = query(collectionRef, orderBy(orderField, orderDirection));

        if (searchTerm) {
            baseQuery = query(baseQuery, where(searchField, '>=', searchTerm.toLowerCase()), where(searchField, '<', searchTerm.toLowerCase() + '\uf8ff'));
        }

        if (loadMore && lastDoc) {
            q = query(baseQuery, startAfter(lastDoc), limit(PAGE_SIZE));
        } else {
            q = query(baseQuery, limit(PAGE_SIZE));
        }

        try {
            const snap = await getDocs(q);
            if (signal.aborted) return;

            const newData = snap.docs.map(d => ({ ...d.data(), id: d.id, walletAddress: d.id }));

            if (loadMore) {
                setData(prev => ({ ...prev, [dataType]: [...prev[dataType], ...newData] }));
            } else {
                setData(prev => ({ ...prev, [dataType]: newData }));
            }

            if (snap.docs.length < PAGE_SIZE) {
                setHasMore(prev => ({ ...prev, [dataType]: false }));
            }
            setLastDocs(prev => ({ ...prev, [dataType]: snap.docs[snap.docs.length - 1] }));
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(`Failed to fetch ${dataType}:`, error);
                addToast(`Failed to fetch ${dataType}. Check console for indexing errors.`, 'error');
            }
        }
    }, [lastDocs, addToast, searchTerms]);

    useEffect(() => {
        let isMounted = true;
        if (activeTab !== 'overview') {
            const controller = new AbortController();
            fetchData(activeTab, false, controller.signal);
            return () => {
                isMounted = false;
                controller.abort();
            };
        }
    }, [activeTab, fetchData]);

    const handleApproveProject = async (projectId: string, newStatus: 'Approved' | 'Rejected') => {
        await updateDoc(doc(db, "projects", projectId), { daoStatus: newStatus });
    };

    const handleFeatureProject = async (projectId: string, isFeatured: boolean) => {
        await updateDoc(doc(db, "projects", projectId), { isFeatured: !isFeatured });
    };

    const handleSuspendUser = async (walletAddress: string, currentStatus: 'active' | 'suspended' | undefined) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        await updateDoc(doc(db, "users", walletAddress), { status: newStatus });
    };

    const handleCancelProposal = async (proposalId: string) => {
        if (window.confirm('Are you sure you want to cancel this proposal?')) {
            await deleteDoc(doc(db, "proposals", proposalId));
        }
    };

    const handleToggleAdmin = async (walletAddress: string) => {
        const address = walletAddress.toLowerCase();
        if (superAdmins.has(address)) {
            addToast("This admin cannot be removed.", 'error');
            return;
        }
        if (admins.has(address)) {
            await deleteDoc(doc(db, "admins", address));
            addToast("Admin role revoked.", 'info');
        } else {
            await setDoc(doc(db, "admins", address), { role: "admin" });
            addToast("Admin role granted.", 'success');
        }
    };

    const handleDeleteUser = async (walletAddress: string) => {
        if (user?.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
            addToast("You cannot delete your own account.", 'error');
            return;
        }
        if (window.confirm("Are you sure you want to delete this user? This action is irreversible and will orphan their projects and comments.")) {
            await deleteDoc(doc(db, "users", walletAddress));
            addToast("User deleted successfully.", 'success');
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project? This action is irreversible.')) {
            await deleteDoc(doc(db, "projects", projectId));
            // also delete reports for this project
            const reportsQuery = query(collection(db, "reports"), where("reportedId", "==", projectId));
            const reportsSnap = await getDocs(reportsQuery);
            const batch = writeBatch(db);
            reportsSnap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            addToast("Project and associated reports deleted.", 'success');
        }
    };
    
    const SearchBar: React.FC<{tab: Tab, field: string}> = ({ tab, field }) => (
        <div className="flex mb-4">
            <input type="text" placeholder={`Search by ${field}...`} value={searchTerms[tab] || ''} onChange={(e) => handleSearchChange(tab, e.target.value)} className="w-full bg-brand-bg border border-brand-surface rounded-l-lg p-2 text-white" />
            <Button onClick={() => fetchData(tab)}>Search</Button>
            <Button onClick={() => {setSearchTerms(prev => ({...prev, [tab]: ''})); fetchData(tab);}} variant="secondary">Clear</Button>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard label="Total Funds Raised" value={overviewStats.totalFunds} prefix="$" />
                        <StatCard label="Active Projects" value={overviewStats.activeProjects} />
                        <StatCard label="Pending Projects" value={overviewStats.pendingProjects} />
                        <StatCard label="Total Users" value={overviewStats.totalUsers} />
                        <StatCard label="Active Proposals" value={overviewStats.activeProposals} />
                        <StatCard label="Waitlist Signups" value={overviewStats.waitlistSignups} />
                    </div>
                );
            case 'projects':
                return (
                    <div>
                        <SearchBar tab="projects" field="name" />
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm align-middle">
                                <thead className="text-left"><tr className="border-b-2 border-brand-surface"><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2">Featured</th><th className="p-2">Actions</th></tr></thead>
                                <tbody>
                                    {data.projects.map((p: Project) => (
                                        <tr key={p.id} className="border-b border-brand-surface"><td className="p-2 font-semibold">{p.name}</td><td className="p-2">{p.daoStatus}</td><td className="p-2">{p.isFeatured ? 'Yes' : 'No'}</td><td className="p-2"><div className="flex gap-2 items-center">{p.daoStatus === 'Pending' && (<><Button onClick={() => handleApproveProject(p.id, 'Approved')} variant="primary" className="text-xs !px-2 !py-1 bg-green-600 hover:bg-green-700">Approve</Button><Button onClick={() => handleApproveProject(p.id, 'Rejected')} variant="secondary" className="text-xs !px-2 !py-1">Reject</Button></>)}<Button onClick={() => handleFeatureProject(p.id, !!p.isFeatured)} variant="ghost" className="text-xs">{p.isFeatured ? 'Unfeature' : 'Feature'}</Button></div></td></tr>
                                    ))}
                                </tbody>
                            </table>
                            {hasMore.projects && <div className="mt-4 text-center"><Button onClick={() => fetchData('projects', true)}>Load More</Button></div>}
                        </div>
                    </div>
                );
            case 'users':
                const filteredUsers = data.users.filter(u => !superAdmins.has(u.walletAddress.toLowerCase()));
                return (
                    <div>
                        <SearchBar tab="users" field="wallet address" />
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm align-middle">
                                <thead className="text-left"><tr className="border-b-2 border-brand-surface"><th className="p-2">Wallet Address</th><th className="p-2">Username</th><th className="p-2">Status</th><th className="p-2">Admin</th><th className="p-2">Actions</th></tr></thead>
                                <tbody>
                                    {filteredUsers.map((u: User) => {
                                        const isAdmin = admins.has(u.walletAddress.toLowerCase());
                                        const isCurrentUser = user?.walletAddress.toLowerCase() === u.walletAddress.toLowerCase();
                                        return (
                                            <tr key={u.walletAddress} className="border-b border-brand-surface"><td className="p-2 font-mono">{u.walletAddress}</td><td className="p-2">{u.username || 'N/A'}</td><td className="p-2">{u.status === 'suspended' ? <span className="text-red-400">Suspended</span> : 'Active'}</td><td className="p-2">{isAdmin ? 'Yes' : 'No'}</td><td className="p-2"><div className="flex gap-2 items-center"><Button onClick={() => handleSuspendUser(u.walletAddress, u.status)} variant="secondary" className={`text-xs !px-2 !py-1 ${u.status === 'suspended' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>{u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}</Button><Button onClick={() => handleToggleAdmin(u.walletAddress)} variant="ghost" className="text-xs" disabled={isCurrentUser}>{isAdmin ? 'Remove Admin' : 'Make Admin'}</Button><Button onClick={() => handleDeleteUser(u.walletAddress)} variant="secondary" className="text-xs !px-2 !py-1 border-red-500 text-red-500">Delete</Button><Button variant="ghost" className="text-xs" onClick={() => {const profileUrl = `${window.location.origin}/#/profile/${u.walletAddress}`; navigator.clipboard.writeText(profileUrl); addToast('Profile link copied!', 'success');}}>Copy Link</Button></div></td></tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {hasMore.users && <div className="mt-4 text-center"><Button onClick={() => fetchData('users', true)}>Load More</Button></div>}
                        </div>
                    </div>
                );
            case 'proposals':
                return (
                    <div>
                        <SearchBar tab="proposals" field="project name" />
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm align-middle">
                                <thead className="text-left"><tr className="border-b-2 border-brand-surface"><th className="p-2">Project Name</th><th className="p-2">Type</th><th className="p-2">Votes</th><th className="p-2">Actions</th></tr></thead>
                                <tbody>
                                    {data.proposals.map((p: Proposal) => (
                                        <tr key={p.id} className="border-b border-brand-surface"><td className="p-2 font-semibold">{p.projectName}</td><td className="p-2">{p.type}</td><td className="p-2">{p.votesFor} For / {p.votesAgainst} Against</td><td className="p-2"><Button onClick={() => handleCancelProposal(p.id)} variant="secondary" className="text-xs !px-2 !py-1 border-red-500 text-red-500">Cancel</Button></td></tr>
                                    ))}
                                </tbody>
                            </table>
                            {hasMore.proposals && <div className="mt-4 text-center"><Button onClick={() => fetchData('proposals', true)}>Load More</Button></div>}
                        </div>
                    </div>
                );
            case 'waitlist':
                return (
                    <div>
                        <SearchBar tab="waitlist" field="email" />
                        <div className="overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4">Waitlist Signups</h3>
                            <table className="min-w-full text-sm">
                                <thead className="text-left"><tr className="border-b border-brand-surface"><th className="p-2">Email</th><th className="p-2">Date</th></tr></thead>
                                <tbody>
                                    {data.waitlist.map((entry: WaitlistEntry) => (
                                        <tr key={entry.id} className="border-b border-brand-surface"><td className="p-2">{entry.email}</td><td className="p-2">{entry.createdAt ? new Date(entry.createdAt.toDate()).toLocaleString() : 'N/A'}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            {hasMore.waitlist && <div className="mt-4 text-center"><Button onClick={() => fetchData('waitlist', true)}>Load More</Button></div>}
                        </div>
                    </div>
                );
            case 'contacts':
                 return (
                    <div>
                        <SearchBar tab="contacts" field="email" />
                        <h3 className="text-lg font-semibold mb-4">Contact Messages</h3>
                        <div className="space-y-4">
                            {data.contacts.map((entry: ContactEntry) => (
                                <div key={entry.id} className="p-4 bg-brand-surface rounded-lg">
                                    <div className="flex justify-between items-baseline"><p className="font-semibold">{entry.name} <span className="font-mono text-sm text-brand-muted">({entry.email})</span></p><p className="text-xs text-brand-muted">{entry.createdAt ? new Date(entry.createdAt.toDate()).toLocaleString() : 'N/A'}</p></div>
                                    <p className="mt-2 text-brand-muted">{entry.message}</p>
                                </div>
                            ))}
                        </div>
                        {hasMore.contacts && <div className="mt-4 text-center"><Button onClick={() => fetchData('contacts', true)}>Load More</Button></div>}
                    </div>
                );
            case 'reports':
                return (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm align-middle">
                                <thead className="text-left"><tr className="border-b-2 border-brand-surface"><th className="p-2">Type</th><th className="p-2">Reported ID</th><th className="p-2">Reason</th><th className="p-2">Reporter</th><th className="p-2">Actions</th></tr></thead>
                                <tbody>
                                    {data.reports.map((r: any) => (
                                        <tr key={r.id} className="border-b border-brand-surface">
                                            <td className="p-2">{r.type}</td>
                                            <td className="p-2 font-mono">{r.reportedId}</td>
                                            <td className="p-2">{r.reason}</td>
                                            <td className="p-2 font-mono">{r.reporterId}</td>
                                            <td className="p-2">
                                                {r.type === 'project' && <Button onClick={() => handleDeleteProject(r.reportedId)} variant="secondary" className="text-xs !px-2 !py-1 border-red-500 text-red-500">Delete Project</Button>}
                                                {r.type === 'user' && <Button onClick={() => handleSuspendUser(r.reportedId, 'active')} variant="secondary" className="text-xs !px-2 !py-1 border-yellow-500 text-yellow-500">Suspend User</Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {hasMore.reports && <div className="mt-4 text-center"><Button onClick={() => fetchData('reports', true)}>Load More</Button></div>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const TabButton: React.FC<{tabName: Tab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none whitespace-nowrap ${
                activeTab === tabName
                    ? 'bg-brand-surface text-white border-b-2 border-brand-blue'
                    : 'text-brand-muted hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
            <div className="flex space-x-1 border-b border-brand-surface mb-8 overflow-x-auto">
                <TabButton tabName="overview" label="Overview" />
                <TabButton tabName="projects" label="Projects" />
                <TabButton tabName="users" label="Users" />
                <TabButton tabName="proposals" label="Proposals" />
                <TabButton tabName="waitlist" label="Waitlist" />
                <TabButton tabName="contacts" label="Contacts" />
                <TabButton tabName="reports" label="Reports" />
            </div>
            <div className="p-4 bg-brand-surface/60 rounded-xl min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminPage;
