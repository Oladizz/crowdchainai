import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Proposal } from '../context/types';

const ProposalStatusBadge: React.FC<{ deadline: string }> = ({ deadline }) => {
    const isActive = new Date(deadline) > new Date();
    const classes = isActive ? 'bg-green-800 text-green-200' : 'bg-gray-700 text-gray-300';
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}>{isActive ? 'Active' : 'Ended'}</span>;
};

const AdminProposalsTab: React.FC = () => {
    const { proposals } = useAppContext();

    return (
        <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">All Proposals</h2>
            <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-surface">
                        <thead className="bg-brand-surface/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Proposal / Project</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Votes (For/Against)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Ends On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-surface">
                            {proposals.map((proposal) => (
                                <tr key={proposal.id} className="hover:bg-brand-surface/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={`/project/${proposal.projectId}`} className="text-sm font-medium text-white hover:text-brand-blue-light truncate">{proposal.projectName}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted">{proposal.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProposalStatusBadge deadline={proposal.deadline} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="text-green-400">{proposal.votesFor}</span> / <span className="text-red-400">{proposal.votesAgainst}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted">
                                        {new Date(proposal.deadline).toLocaleDateString()}
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

export default AdminProposalsTab;
