import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAppContext } from '../context/AppContext';
import Spinner from '../components/Spinner';

const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-16 w-16 text-green-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
   </svg>
);

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, user, setUserAsCreator } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    console.log('LoginModalOpen effect', isLoginModalOpen);
    if (isLoginModalOpen) {
        setStep(1);
        setIsVerifying(false);
        setIsVerified(false);
    }
  }, [isLoginModalOpen]);

  useEffect(() => {
    console.log('User and step effect', user, step, isLoginModalOpen);
    if (user && step === 1 && isLoginModalOpen) {
        setStep(2);
    }
  }, [user, step, isLoginModalOpen]);

  useEffect(() => {
    console.log('Verification effect', step, isVerifying, isVerified);
    if (step === 2 && !isVerifying && !isVerified) {
        setIsVerifying(true);
        const verificationTimer = setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
            const nextStepTimer = setTimeout(() => {
                handleFinish();
            }, 1000);
            return () => clearTimeout(nextStepTimer);
        }, 5000);
        return () => clearTimeout(verificationTimer);
    }
  }, [step, isVerifying, isVerified]);

  const handleConnect = () => {
    login();
  };

  const handleFinish = async () => {
    await setUserAsCreator();
    closeLoginModal();
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
                            <p className="mt-4 text-brand-muted animate-pulse">Verifying by TAG.ID...</p>
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
                     <p className="mt-2 text-brand-muted">You are now a creator on CrowdChain.</p>
                     <Button onClick={handleFinish} variant="primary" className="mt-8 w-full">Go to Dashboard</Button>
                </div>
            );
        default:
            return null;
    }
  };

  const modalTitle = step === 1 ? "Creator Onboarding" : step === 2 ? "Identity Verification" : "Setup Complete";

  return (
    <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal} title={modalTitle}>
        {renderStepContent()}
    </Modal>
  );
};

export default LoginModal;
