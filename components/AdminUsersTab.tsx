import React from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../context/types';
import Button from './Button';

const StatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
    const statusClasses = {
        'Active': 'bg-green-800 text-green-200',
        'Suspended': 'bg-red-800 text-red-200',
    };
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize';
    return <span className={`${baseClasses} ${status ? statusClasses[status] : ''}`}>{status}</span>;
}

const AdminUsersTab: React.FC = () => {
    const { allUsers, suspendUser, reinstateUser, deleteUser, truncateAddress } = useAppContext();

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">Manage Users</h2>
            <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-surface">
                        <thead className="bg-brand-surface/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Wallet Address</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Admin</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-surface">
                            {allUsers.map((user) => (
                                <tr key={user.walletAddress} className="hover:bg-brand-surface/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted font-mono">{truncateAddress(user.walletAddress)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={user.status} />
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {user.role === 'admin' ? 'Yes' : 'No'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {user.role !== 'admin' && (
                                            <>
                                                {user.status === 'Active' ? (
                                                    <Button onClick={() => suspendUser(user.walletAddress)} className="text-xs bg-yellow-600 hover:bg-yellow-700">Suspend</Button>
                                                ) : (
                                                    <Button onClick={() => reinstateUser(user.walletAddress)} className="text-xs bg-green-600 hover:bg-green-700">Reinstate</Button>
                                                )}
                                                <Button onClick={() => deleteUser(user.walletAddress)} className="text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersTab;