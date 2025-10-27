import React from 'react';
import { Link } from 'react-router-dom';
import { Proposal } from '../context/types';
import Button from './Button';
import { useAppContext } from '../context/AppContext';
import Spinner from './Spinner';

interface ProposalCardProps {
  proposal: Proposal;
  onVoteClick: () => void;
  onSummaryClick: () => void;
  isSummaryLoading: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVoteClick, onSummaryClick, isSummaryLoading }) => {
  const { user } = useAppContext();
  const isFunder = user?.fundedProjects.some(p => p.projectId === proposal.projectId);
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const daysLeft = Math.ceil((new Date(proposal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));


  return (
    <div className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-brand-purple/30 transition-shadow duration-300 dark:border dark:border-white/10">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proposal.type === 'New Project' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
            {proposal.type}
          </span>
          <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">{proposal.projectName}</h3>
          <p className="mt-1 text-sm text-brand-muted break-words">{proposal.description}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
             <p className="text-xs sm:text-sm text-brand-muted">Voting ends in</p>
             <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{daysLeft > 0 ? `${daysLeft} days` : 'Ended'}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-brand-muted mb-2">Voting Progress</p>
        <div className="flex w-full h-3 sm:h-4 bg-red-900/50 rounded-full overflow-hidden border border-white/10">
            <div className="bg-green-500 h-full" style={{width: `${forPercentage}%`}}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
            <span className="font-bold text-green-400">{forPercentage.toFixed(1)}% Yes ({proposal.votesFor.toLocaleString()})</span>
            <span className="font-bold text-red-400">{againstPercentage.toFixed(1)}% No ({proposal.votesAgainst.toLocaleString()})</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="secondary" className="w-full" onClick={onSummaryClick} disabled={isSummaryLoading}>
          {isSummaryLoading ? <Spinner className="w-4 h-4" /> : 'AI Summary'}
        </Button>
        <Link to={`/project/${proposal.projectId}`} className="flex-1 col-span-1">
            <Button variant="secondary" className="w-full">Details</Button>
        </Link>
        <Button data-guide="vote-button" variant="primary" className="flex-1" onClick={onVoteClick} disabled={!user || daysLeft <= 0 || !isFunder}>
          {daysLeft > 0 ? (!user ? 'Connect to Vote' : !isFunder ? 'Must be a backer' : 'Vote Now') : 'Voting Ended'}
        </Button>
      </div>
    </div>
  );
};

export default ProposalCard;
