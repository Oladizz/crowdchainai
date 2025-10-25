import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Button from './Button';
import { Project } from '../context/types';

const StatusBadge: React.FC<{ status: Project['daoStatus'] }> = ({ status }) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    const statusClasses = {
        'Pending': 'bg-yellow-800 text-yellow-200',
        'Approved': 'bg-green-800 text-green-200',
        'Rejected': 'bg-red-800 text-red-200',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
}

const AdminProjectsTab: React.FC = () => {
    const { projects, updateProjectDaoStatus } = useAppContext();

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">Manage Projects</h2>
            <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-surface">
                        <thead className="bg-brand-surface/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Project Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Creator</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-surface">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-brand-surface/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/project/${project.id}`} className="text-sm font-medium text-white hover:text-brand-blue-light truncate">{project.name}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted font-mono">{project.creatorWallet.slice(0, 10)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={project.daoStatus} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {project.daoStatus === 'Pending' && (
                                            <>
                                                <Button onClick={() => updateProjectDaoStatus(project.id, 'Approved')} variant="primary" className="text-xs bg-green-600 hover:bg-green-700">Approve</Button>
                                                <Button onClick={() => updateProjectDaoStatus(project.id, 'Rejected')} variant="primary" className="text-xs bg-red-600 hover:bg-red-700">Reject</Button>
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

export default AdminProjectsTab;