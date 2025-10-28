
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { Milestone } from '../context/types';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/Modal';
import AiInsightsCard from '../components/AiInsightsCard';
import Spinner from '../components/Spinner';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../utils/audio';

const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LockClosedIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const UserCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-12 w-12 text-brand-muted"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SpeakerIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const StopIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="currentColor" viewBox="0 0 16 16">
        <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
    </svg>
);

const MilestoneStatusIcon: React.FC<{ status: Milestone['status'] }> = ({ status }) => {
    switch (status) {
        case 'Complete': return <CheckCircleIcon />;
        case 'In Review': return <ClockIcon />;
        case 'Pending': return <LockClosedIcon />;
        default: return null;
    }
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, user, fundProject, addToast, truncateAddress } = useAppContext();
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
        audioSourceRef.current?.stop();
        audioContextRef.current?.close();
    };
  }, []);

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(fundAmount);
    if (project && !isNaN(numericAmount) && numericAmount > 0) {
      fundProject(project.id, numericAmount);
      setIsFundingModalOpen(false);
      setFundAmount('');
    } else {
      addToast('Please enter a valid amount.', 'error');
    }
  };

  const handleGenerateSummary = async () => {
      if (!project) return;
      setIsSummarizing(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const prompt = `Summarize the following project description into 3-4 key bullet points for a potential investor. Be concise and impactful. Description: "${project.description}"`;
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
          });
          setSummary(response.text);
      } catch (err) {
          console.error("Summary generation failed:", err);
          setSummary("Could not generate summary at this time.");
      } finally {
          setIsSummarizing(false);
      }
  };

  const handleReadAloud = async () => {
    if (!project) return;

    if (audioState === 'playing') {
        audioSourceRef.current?.stop();
        setAudioState('idle');
        return;
    }

    setAudioState('loading');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: project.description }] }],
            config: {
                responseModalities: [Modality.AUDIO],
            },
        });

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data received.");

        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setAudioState('idle');
            audioSourceRef.current = null;
        };
        source.start();
        
        audioSourceRef.current = source;
        setAudioState('playing');

    } catch (err) {
        console.error("TTS failed:", err);
        addToast("Failed to generate audio.", 'error');
        setAudioState('idle');
    }
  };

  if (!project) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Project Not Found</h1>
        <p className="mt-4 text-brand-muted">The project you're looking for doesn't exist.</p>
        <Link to="/explore">
            <Button variant="primary" className="mt-8">Back to Explore</Button>
        </Link>
      </div>
    );
  }

  const percentage = Math.round((project.amountRaised / project.fundingGoal) * 100);
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <div className="lg:grid lg:grid-cols-3 lg:gap-12">
        {/* Left Column (Image & Funding) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-300 mb-2">
                {project.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight sm:text-3xl lg:text-4xl break-words">{project.name}</h1>
          </div>
          <img src={project.image} alt={project.name} className="w-full h-auto object-cover rounded-xl shadow-2xl border border-white/10" />
          
          <div className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Project Story</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={handleReadAloud} disabled={audioState === 'loading'} className="w-10 h-9 sm:w-11 sm:h-10 p-0">
                        {audioState === 'loading' && <Spinner className="w-4 h-4" />}
                        {audioState === 'idle' && <SpeakerIcon className="w-4 h-4" />}
                        {audioState === 'playing' && <StopIcon className="w-4 h-4" />}
                    </Button>
                    <Button variant="secondary" onClick={handleGenerateSummary} disabled={isSummarizing}>
                        {isSummarizing ? <Spinner className="w-4 h-4" /> : 'AI Summary'}
                    </Button>
                </div>
              </div>
              
              {isSummarizing && !summary && <div className="flex justify-center p-4"><Spinner /></div>}
              
              {summary && (
                <div className="prose prose-sm prose-invert max-w-none bg-brand-bg/50 p-3 rounded-md mb-4 animate-fade-in" dangerouslySetInnerHTML={{ __html: summary.replace(/\*/g, '&#8226;').replace(/\n/g, '<br />') }} />
              )}
              <p className="text-sm sm:text-base text-brand-muted leading-relaxed break-words">{project.description}</p>
          </div>

          <div className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl p-4 sm:p-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Updates</h2>
              {project.updates.length > 0 ? (
                <div className="space-y-4">
                    {project.updates.map((update, index) => (
                        <div key={index} className="border-l-4 border-brand-blue pl-4">
                            <p className="text-xs sm:text-sm text-brand-muted">{new Date(update.date).toLocaleDateString()}</p>
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{update.message}</p>
                        </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-brand-muted">No updates yet. Stay tuned!</p>
              )}
          </div>
        </div>

        {/* Right Column (Stats & Milestones) */}
        <div className="mt-8 lg:mt-0 space-y-4 sm:space-y-6">
          <div data-guide="project-funding" className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl p-4 sm:p-5 sticky top-24">
            <ProgressBar value={project.amountRaised} max={project.fundingGoal} />
            <div className="mt-4">
              <p className="text-xl sm:text-2xl font-bold text-brand-blue-light break-words">${project.amountRaised.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-brand-muted">raised of ${project.fundingGoal.toLocaleString()} goal</p>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-between text-sm sm:text-base">
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">{percentage}%</p>
                    <p className="text-xs sm:text-sm text-brand-muted">Funded</p>
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">{daysLeft}</p>
                    <p className="text-xs sm:text-sm text-brand-muted">Days Left</p>
                </div>
            </div>
            {project.daoStatus === 'Pending' && <p className="mt-4 text-center text-xs sm:text-sm bg-yellow-900 text-yellow-300 p-2 rounded-md">Project is under DAO review.</p>}
            <Button 
              data-guide="fund-button"
              variant="primary" 
              className="w-full mt-6 text-sm sm:text-base"
              onClick={() => setIsFundingModalOpen(true)}
              disabled={!user || project.daoStatus !== 'Approved' || daysLeft <= 0}
            >
              {daysLeft > 0 ? 'Fund this Project' : 'Funding Ended'}
            </Button>
          </div>
          
          <AiInsightsCard project={project} />

          <div className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">About the Creator</h3>
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <UserCircleIcon />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white break-words truncate">{project.creator.startsWith('0x') ? truncateAddress(project.creator) : project.creator}</p>
                    <Link to={`/profile/${project.creatorWallet}`} className="text-xs text-brand-blue-light hover:underline mt-1 inline-block">
                        View Profile
                    </Link>
                </div>
            </div>
          </div>

          <div data-guide="milestones" className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">Milestones</h3>
            <ul className="space-y-4">
              {project.milestones.map(milestone => (
                <li key={milestone.id} className="flex items-start space-x-3 sm:space-x-4">
                    <div><MilestoneStatusIcon status={milestone.status}/></div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-words">{milestone.title} - <span className="text-brand-blue-light">${milestone.fundsRequired.toLocaleString()}</span></p>
                        <p className="text-xs sm:text-sm text-brand-muted break-words">{milestone.description}</p>
                        {milestone.proof && (
                            <a href={milestone.proof} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue-light hover:underline mt-1 inline-block">
                                View Proof
                            </a>
                        )}
                    </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <Modal isOpen={isFundingModalOpen} onClose={() => setIsFundingModalOpen(false)} title={`Fund "${project.name}"`}>
        <form onSubmit={handleFundSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="fundAmount" className="block text-sm font-medium text-brand-muted">Amount (in USD)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-brand-muted sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            name="fundAmount"
                            id="fundAmount"
                            className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md py-2 pl-7 pr-4 text-white"
                            placeholder="0.00"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            min="1"
                            required
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={() => setIsFundingModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="primary">Confirm Funding</Button>
                </div>
            </div>
        </form>
      </Modal>
    </>
  );
};

export default ProjectDetailPage;
