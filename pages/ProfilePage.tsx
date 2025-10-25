import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProjectCard from '../components/ProjectCard';
import { Project } from '../context/types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { GoogleGenAI, Type } from '@google/genai';
import StatCard from '../components/StatCard';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';

const UserCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-24 w-24 text-brand-muted"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

type ProfileTab = 'overview' | 'created' | 'funded';

const ProfilePage: React.FC = () => {
    const { walletAddress } = useParams<{ walletAddress: string }>();
    const { projects, user: loggedInUser, truncateAddress, addToast, getUserProfileByWallet, isLoading } = useAppContext();
    const [profileData, setProfileData] = useState<{ username?: string; avatar?: string; role?: 'creator' | 'investor' | 'admin' } | null>(null);
    const [walletAnalysis, setWalletAnalysis] = useState<{ trustScore: number; summary: string } | null>(null);
    const [isAnalyzingWallet, setIsAnalyzingWallet] = useState(true);
    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

    useEffect(() => {
        if (walletAddress) {
            setProfileData(getUserProfileByWallet(walletAddress));

            const analyzeWallet = async () => {
                setIsAnalyzingWallet(true);
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                    const schema = {
                        type: Type.OBJECT,
                        properties: {
                            trustScore: { type: Type.INTEGER, description: 'A trust score from 0-100 for the wallet.' },
                            summary: { type: Type.STRING, description: 'A brief, one-sentence summary of the wallet\'s simulated on-chain behavior.' }
                        },
                        required: ['trustScore', 'summary']
                    };
                    const prompt = `Simulate a simple on-chain analysis for the wallet address ${walletAddress}. Provide a trust score and a brief summary of its simulated activity (e.g., 'This wallet has a history of supporting successful projects' or 'This wallet has interactions with high-risk contracts'). Respond ONLY with the JSON object.`;
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: { responseMimeType: 'application/json', responseSchema: schema }
                    });
                    setWalletAnalysis(JSON.parse(response.text));
                } catch (err) {
                    console.error("Wallet analysis failed:", err);
                    setWalletAnalysis({ trustScore: 0, summary: "Could not analyze wallet." });
                } finally {
                    setIsAnalyzingWallet(false);
                }
            };
            analyzeWallet();
        }
    }, [walletAddress]);

    const handleCopyAddress = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            addToast('Wallet address copied to clipboard!', 'success');
        }
    };

    const createdProjects = useMemo(() => 
        walletAddress ? projects.filter(p => p.creatorWallet.toLowerCase() === walletAddress.toLowerCase()) : [],
        [projects, walletAddress]
    );

    const isOwnProfile = loggedInUser?.walletAddress.toLowerCase() === walletAddress?.toLowerCase();

    const fundedProjects = useMemo(() => 
        (isOwnProfile && loggedInUser)
        ? loggedInUser.fundedProjects.map(funding => {
            return projects.find(p => p.id === funding.projectId);
          }).filter((p): p is Project => !!p)
        : [],
        [projects, loggedInUser, isOwnProfile]
    );

    const totalInvested = useMemo(() =>
        (isOwnProfile && loggedInUser) ? loggedInUser.fundedProjects.reduce((sum, p) => sum + p.amount, 0) : 0,
        [loggedInUser, isOwnProfile]
    );

    const totalRaised = useMemo(() =>
        createdProjects.reduce((sum, p) => sum + p.amountRaised, 0),
        [createdProjects]
    );
    

    if (!walletAddress) {
        return (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-white">User Not Found</h1>
            <p className="mt-4 text-brand-muted">The profile you're looking for doesn't exist.</p>
            <Link to="/explore">
                <Button variant="primary" className="mt-8">Back to Explore</Button>
            </Link>
          </div>
        );
    }
    
    const username = profileData?.username || truncateAddress(walletAddress);
    const avatar = profileData?.avatar;
    const trustScoreColor = walletAnalysis ? (walletAnalysis.trustScore > 75 ? 'text-green-400' : walletAnalysis.trustScore > 40 ? 'text-yellow-400' : 'text-red-400') : 'text-brand-muted';

    const TabButton: React.FC<{tabName: ProfileTab, label: string}> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap border ${activeTab === tabName ? 'bg-brand-button text-white border-brand-button-hover' : 'text-brand-muted hover:bg-brand-surface hover:text-white border-transparent'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8 sm:space-y-12 animate-fade-in">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl">
                {avatar ? (
                    <img src={avatar} alt="User Avatar" className="w-24 h-24 rounded-full object-cover bg-brand-surface flex-shrink-0 border-2 border-brand-surface" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-brand-surface flex items-center justify-center flex-shrink-0 border-2 border-brand-surface">
                        <UserCircleIcon className="w-20 h-20 text-brand-muted" />
                    </div>
                )}
                <div className="text-center sm:text-left min-w-0 flex-1 overflow-hidden">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{username}</h1>
                    <button 
                        onClick={handleCopyAddress} 
                        className="group inline-flex items-center justify-center sm:justify-start gap-2 mt-1 text-brand-muted hover:text-white transition-colors focus:outline-none" 
                        title="Copy address"
                    >
                        <span className="font-mono text-sm">{truncateAddress(walletAddress)}</span>
                        <CopyIcon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </button>
                     {isOwnProfile && <Link to="/dashboard"><Button variant="secondary" className="mt-4 text-xs">Edit Profile</Button></Link>}
                </div>
            </div>
            
             <div className="border-b border-gray-200 dark:border-brand-surface">
                <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabName="overview" label="Overview" />
                    <TabButton tabName="created" label={`Created (${createdProjects.length})`} />
                    {isOwnProfile && <TabButton tabName="funded" label={`Funded (${fundedProjects.length})`} />}
                </nav>
            </div>

            <div>
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                         <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Statistics</h2>
                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {profileData?.role === 'creator' && <StatCard label="Total Raised" value={totalRaised} prefix="$" />}
                                {isOwnProfile && <StatCard label="Total Invested" value={totalInvested} prefix="$" />}
                                <StatCard label="Projects Created" value={createdProjects.length} />
                                {isOwnProfile && <StatCard label="Projects Funded" value={fundedProjects.length} />}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">AI Wallet Analysis</h2>
                            <div className="p-6 bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl">
                                {isAnalyzingWallet ? (
                                    <div className="flex justify-center items-center"><Spinner /></div>
                                ) : walletAnalysis ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                        <div>
                                            <p className="text-sm text-brand-muted">Trust Score</p>
                                            <p className={`text-5xl font-bold ${trustScoreColor}`}>{walletAnalysis.trustScore}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Summary</p>
                                            <p className="text-sm text-brand-muted">{walletAnalysis.summary}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-brand-muted text-center">Could not load analysis.</p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
                
                {activeTab === 'created' && (
                     <section>
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                            </div>
                        ) : createdProjects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {createdProjects.map(project => (
                                    <ProjectCard 
                                        key={project.id} 
                                        project={project} 
                                        creatorUsername={username}
                                        creatorAvatar={avatar}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl">
                                <p className="text-brand-muted">This user hasn't created any projects yet.</p>
                            </div>
                        )}
                    </section>
                )}
                
                {activeTab === 'funded' && isOwnProfile && (
                     <section>
                        {isLoading ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
                            </div>
                        ) : fundedProjects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {fundedProjects.map(project => (
                                    <ProjectCard 
                                        key={project.id} 
                                        project={project}
                                        creatorUsername={project.creator}
                                        creatorAvatar={getUserProfileByWallet(project.creatorWallet)?.avatar}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl">
                                <p className="text-brand-muted">You haven't funded any projects yet.</p>
                                 <Link to="/explore" className="text-brand-blue-light hover:underline mt-2 inline-block">Explore projects to support</Link>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;