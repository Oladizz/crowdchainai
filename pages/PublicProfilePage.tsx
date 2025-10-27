import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProjectCard from '../components/ProjectCard';
import { Project, User } from '../context/types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { GoogleGenAI, Type } from '@google/genai';
import StatCard from '../components/StatCard';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';
import { SocialIcon } from 'react-social-icons';

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

const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const PublicProfilePage: React.FC = () => {
    const { walletAddress } = useParams<{ walletAddress: string }>();
    const { projects, user: loggedInUser, truncateAddress, addToast, getUserProfileByWallet, isLoading } = useAppContext();
    const [profileData, setProfileData] = useState<User | null>(null);

    useEffect(() => {
        if (walletAddress) {
            setProfileData(getUserProfileByWallet(walletAddress));
        }
    }, [walletAddress, getUserProfileByWallet]);

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
    
    const username = profileData?.username || (walletAddress ? truncateAddress(walletAddress) : '');
    const avatar = profileData?.avatar;
    const bio = profileData?.bio;
    const twitter = profileData?.twitter;
    const website = profileData?.website;

    const isOwnProfile = loggedInUser && walletAddress && loggedInUser.walletAddress.toLowerCase() === walletAddress.toLowerCase();

    return (
        <div className="space-y-8 sm:space-y-12 animate-fade-in">
            {/* Profile Header */}
            <div className="p-6 bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl">
                <div className="flex flex-col sm:flex-row items-center gap-6">
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
                        <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                            {twitter && <SocialIcon url={twitter} style={{ height: 24, width: 24 }} bgColor="transparent" fgColor="#888888" />}
                            {website && <a href={website} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-6 h-6 text-brand-muted hover:text-white" /></a>}
                        </div>
                        {isOwnProfile && (
                            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
                                <Link to="/dashboard"><Button variant="secondary" className="text-xs">Edit Profile</Button></Link>
                                <Button variant="secondary" className="text-xs" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    addToast('Profile link copied to clipboard!', 'success');
                                }}>Copy Link</Button>
                            </div>
                        )}
                    </div>
                </div>
                {bio && <p className="mt-6 text-brand-muted text-center sm:text-left">{bio}</p>}
            </div>
            
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Created Projects ({createdProjects.length})</h2>
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
        </div>
    );
};

export default PublicProfilePage;
