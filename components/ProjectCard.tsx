import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../context/types';
import { useAppContext } from '../context/AppContext';

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

interface ProjectCardProps {
  project: Project;
  creatorUsername?: string;
  creatorAvatar?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, creatorUsername, creatorAvatar }) => {
  const { truncateAddress } = useAppContext();
  const percentage = Math.round((project.amountRaised / project.fundingGoal) * 100);
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // This is a bit of a hack for HashRouter. In a Browser router, useNavigate would be cleaner.
    window.location.hash = `/profile/${project.creatorWallet}`;
  };

  return (
    <Link to={`/project/${project.id}`} className="flex flex-col bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-brand-blue/30 transition-shadow duration-300 transform hover:-translate-y-1 h-full group">
      {/* Image */}
      <div className="h-48 flex-shrink-0 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={project.image} alt={project.name} loading="lazy" />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Top section */}
        <div className="flex-grow">
          <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide">{project.category}</p>
          <h3 className="mt-1 text-base font-semibold text-white line-clamp-2 group-hover:text-brand-blue-light transition-colors">{project.name}</h3>
          <p className="mt-2 text-xs text-brand-muted line-clamp-3">{project.description}</p>
        </div>
        
        {/* Creator Info */}
        <div className="mt-3">
            <a href={`#/profile/${project.creatorWallet}`} onClick={handleCreatorClick} className="flex items-center space-x-2 group/creator">
                {creatorAvatar ? (
                    <img src={creatorAvatar} alt={creatorUsername} className="w-6 h-6 rounded-full object-cover border border-brand-bg" />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-bg flex items-center justify-center border border-brand-surface">
                        <UserIcon className="w-4 h-4 text-brand-muted" />
                    </div>
                )}
                <span className="text-xs text-brand-muted group-hover/creator:text-white truncate transition-colors">
                    by {creatorUsername || truncateAddress(project.creator)}
                </span>
            </a>
        </div>

        {/* Bottom section */}
        <div className="mt-3 pt-2">
          <ProgressBar value={project.amountRaised} max={project.fundingGoal} />
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-white font-bold">{percentage}% funded</span>
            <span className="text-brand-muted">{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;