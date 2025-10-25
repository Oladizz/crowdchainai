import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ProposalCard from '../components/ProposalCard';
import { Proposal } from '../context/types';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ProposalCardSkeleton from '../components/ProposalCardSkeleton';

const DaoPage: React.FC = () => {
    const { proposals, user, voteOnProposal, projects, isLoading } = useAppContext();
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [summaries, setSummaries] = useState<Record<string, string>>({});
    const [isLoadingSummary, setIsLoadingSummary] = useState<string | null>(null); // Stores proposalId
    const [activeSummary, setActiveSummary] = useState<{ title: string; content: string } | null>(null);
    
    const handleVoteClick = (proposal: Proposal) => {
        if (user) {
            setSelectedProposal(proposal);
        } else {
            alert("Please connect your wallet to vote.");
        }
    };

    const handleSummaryClick = async (proposal: Proposal) => {
        if (summaries[proposal.id]) {
            setActiveSummary({ title: proposal.projectName, content: summaries[proposal.id] });
            return;
        }
        setIsLoadingSummary(proposal.id);
        try {
            const project = projects.find(p => p.id === proposal.projectId);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a neutral DAO analyst. Summarize the following project proposal for a community vote. Explain the core idea and its potential impact in simple terms. Proposal: "${proposal.description}". Project Details: ${JSON.stringify(project)}.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const summaryText = response.text;
            setSummaries(prev => ({ ...prev, [proposal.id]: summaryText }));
            setActiveSummary({ title: proposal.projectName, content: summaryText });
        } catch (err) {
            console.error("Failed to get summary:", err);
            setActiveSummary({ title: proposal.projectName, content: "Could not generate summary at this time." });
        } finally {
            setIsLoadingSummary(null);
        }
    };
    
    const submitVote = (vote: 'for' | 'against') => {
        if(selectedProposal) {
            voteOnProposal(selectedProposal.id, vote);
            setSelectedProposal(null);
        }
    };

  return (
    <>
    <div className="space-y-10 sm:space-y-12">
      <div className="text-center" data-guide="dao-welcome">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">DAO Governance</h1>
        <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base text-brand-muted">
          Your voice matters. Participate in the governance of CrowdChain by voting on project proposals and milestone approvals.
        </p>
      </div>

      <section data-guide="proposal-section">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Active Proposals</h2>
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <ProposalCardSkeleton key={i} />)
          ) : proposals.length > 0 ? (
            proposals.map(proposal => (
              <ProposalCard 
                key={proposal.id} 
                proposal={proposal} 
                onVoteClick={() => handleVoteClick(proposal)}
                onSummaryClick={() => handleSummaryClick(proposal)}
                isSummaryLoading={isLoadingSummary === proposal.id}
              />
            ))
          ) : (
             <div className="text-center py-10 bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl">
                <p className="text-brand-muted">There are no active proposals at this time.</p>
             </div>
          )}
        </div>
      </section>
    </div>
    
    {/* Voting Modal */}
    <Modal isOpen={!!selectedProposal} onClose={() => setSelectedProposal(null)} title={`Vote on "${selectedProposal?.projectName}"`}>
        {selectedProposal && (
            <div className="space-y-4">
                <p className="text-sm text-brand-muted">{selectedProposal.description}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Are you sure you want to cast your vote? This action is irreversible.</p>
                <div className="flex justify-end space-x-4 pt-4">
                    <Button variant="primary" className="bg-green-600 hover:bg-green-700 w-full" onClick={() => submitVote('for')}>Vote Yes</Button>
                    <Button variant="primary" className="bg-red-600 hover:bg-red-700 w-full" onClick={() => submitVote('against')}>Vote No</Button>
                </div>
            </div>
        )}
    </Modal>

    {/* AI Summary Modal */}
    <Modal isOpen={!!activeSummary} onClose={() => setActiveSummary(null)} title={`AI Summary for "${activeSummary?.title}"`}>
        {activeSummary && (
            <div className="prose prose-sm prose-invert max-w-none">
                <p>{activeSummary.content}</p>
            </div>
        )}
    </Modal>
    </>
  );
};

export default DaoPage;