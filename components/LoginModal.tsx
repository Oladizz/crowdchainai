import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Modal from './Modal';
import Button from './Button';
import Spinner from './Spinner';

const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-16 w-16 text-green-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
   </svg>
);

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-brand-blue-light transition-transform duration-300 hover:scale-110 p-3 bg-brand-surface rounded-full">
        {children}
    </a>
);

const TwitterIcon: React.FC = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>;
const DiscordIcon: React.FC = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-2.148-.72-3.048-1.224-3.816-1.5-1.032-.384-2.16-.48-3.264-.48-1.38 0-2.6.156-3.72.504-1.224.372-2.316.996-3.144 1.68-1.02.84-1.764 1.992-1.92 3.3-1.404-1.632-1.404-1.632-3.216-1.44-1.62.168-2.796 1.236-2.796 1.236-1.116 1.656-1.248 3.6-1.248 3.6s.768 1.944 3.564 2.412c-2.4.48-3.324 1.464-3.324 1.464-1.152 2.136.216 4.344.216 4.344 1.644 1.2 3.06 1.2 3.06 1.2l.168-.18s-1.824-.54-2.904-1.38c.18.06.372.12.564.18 1.152.324 2.376.504 3.66.504 3.204 0 5.8-1.5 5.8-1.5s-.624.576-1.644 1.128c1.392.48 2.808.48 2.808.48l.144.144s1.284.144 2.724-1.032c1.44-1.176 1.596-3.036 1.596-3.036s-1.044-1.056-3.036-1.536z" /></svg>;
const TelegramIcon: React.FC = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-1.002 6.52-1.45 8.615-.17.8-.502 1.002-1.012.998-.424-.002-1.05-.24-1.582-.56-1.84-1.104-2.884-1.8-4.088-2.868-.534-.48-.994-.894-1.022-1.034-.02-.1-.01-.22.05-.33.204-.336 4.454-4.09 4.454-4.09.2-.18.02-.33-.13-.24-1.12.624-3.83 2.37-4.38 2.72-.52.33-.94.49-1.34.48-.49-.01-1.22-.16-1.8-.32-.75-.2-1.35-.31-1.28-.78.03-.28.3-.53.89-.74 2.47-1.03 6.9-2.83 8.3-3.32.36-.12.67-.18.84-.18z"/></svg>;
const GithubIcon: React.FC = () => <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;


const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, login, setUserAsCreator } = useAppContext();
    const [step, setStep] = useState(1);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsVerifying(false);
            setIsVerified(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (user && step === 1 && isOpen) {
            setStep(2);
        }
    }, [user, step, isOpen]);

    useEffect(() => {
        if (step === 2 && !isVerifying && !isVerified) {
            setIsVerifying(true);
            const verificationTimer = setTimeout(() => {
                setIsVerifying(false);
                setIsVerified(true);
                const nextStepTimer = setTimeout(() => {
                    setStep(3);
                }, 2000);
                return () => clearTimeout(nextStepTimer);
            }, 5000);

            return () => clearTimeout(verificationTimer);
        }
    }, [step, isVerifying, isVerified]);

    const handleConnect = () => {
        login();
    };

    const handleFinish = () => {
        setUserAsCreator();
        onClose();
        navigate('/dashboard');
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center">
                        <h3 className="text-xl font-bold">Step 1: Connect Wallet</h3>
                        <p className="mt-2 text-brand-muted">Connect your wallet to create your secure creator identity on CrowdChain.</p>
                        <Button onClick={handleConnect} variant="primary" className="mt-6 w-full">Connect on Base</Button>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center flex flex-col items-center justify-center min-h-[150px]">
                        {isVerifying && (
                            <>
                                <Spinner className="w-12 h-12" />
                                <p className="mt-4 text-brand-muted animate-pulse">Verifying by TAG ID...</p>
                            </>
                        )}
                        {isVerified && (
                             <div className="animate-fade-in">
                                <CheckCircleIcon />
                                <p className="mt-4 text-lg font-semibold text-green-400">Verification Successful!</p>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="text-center animate-fade-in">
                         <h3 className="text-xl font-bold">You're All Set!</h3>
                         <p className="mt-2 text-brand-muted">Follow our socials to stay up to date with the community and platform news.</p>
                         <div className="mt-6 flex justify-center space-x-4">
                            <SocialIcon href="https://twitter.com"><TwitterIcon /></SocialIcon>
                            <SocialIcon href="https://discord.com"><DiscordIcon /></SocialIcon>
                            <SocialIcon href="https://telegram.org"><TelegramIcon /></SocialIcon>
                            <SocialIcon href="https://github.com"><GithubIcon /></SocialIcon>
                         </div>
                         <Button onClick={handleFinish} variant="primary" className="mt-8 w-full">Go to Dashboard</Button>
                    </div>
                );
            default:
                return null;
        }
    };

    const modalTitle = step === 1 ? "Creator Onboarding" : step === 2 ? "Identity Verification" : "Setup Complete";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            {renderStepContent()}
        </Modal>
    );
};

export default LoginModal;
