
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProgressBar from './ProgressBar';

const InvestmentsTab: React.FC = () => {
    const { user, projects } = useAppContext();

    if (!user) return null;

    const fundedProjectDetails = user.fundedProjects.map(funding => {
        const project = projects.find(p => p.id === funding.projectId);
        return { ...funding, project };
    }).filter(item => item.project); // Filter out any cases where project not found

    return (
        <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Funded Projects</h2>
            {fundedProjectDetails.length > 0 ? (
                <div className="space-y-4">
                    {fundedProjectDetails.map(({ projectId, amount, project }) => (
                        project && (
                             <Link to={`/project/${projectId}`} key={projectId} className="block bg-gray-100 dark:bg-brand-surface/60 dark:backdrop-blur-lg dark:border dark:border-white/10 p-4 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-900 dark:text-white break-words">{project.name}</p>
                                        <p className="text-sm text-brand-muted">You invested: <span className="font-bold text-brand-blue-light">${amount.toLocaleString()}</span></p>
                                    </div>
                                    <div className="w-full sm:w-1/3">
                                        <ProgressBar value={project.amountRaised} max={project.fundingGoal} />
                                        <div className="flex justify-between text-xs mt-1">
                                            <span className="text-brand-muted">Raised: ${project.amountRaised.toLocaleString()}</span>
                                            <span className="text-brand-muted">Goal: ${project.fundingGoal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-100 dark:bg-brand-surface/60 dark:backdrop-blur-lg dark:border dark:border-white/10 rounded-xl">
                    <p className="text-brand-muted">You haven't funded any projects yet.</p>
                    <Link to="/explore" className="text-brand-blue-light hover:underline mt-2 inline-block">Explore projects to support</Link>
                </div>
            )}
        </div>
    );
};

export default InvestmentsTab;
