

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';

const MailIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-16 w-16 text-brand-blue"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-16 w-16 text-green-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const WaitlistPage: React.FC = () => {
    const { addWaitlistEntry } = useAppContext();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic email validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        addWaitlistEntry(email);
        setSubmitted(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-8 animate-fade-in">
            <div className="text-center flex flex-col items-center">
                 {submitted ? <CheckCircleIcon /> : <MailIcon />}
                <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {submitted ? "You're on the list!" : "Join the Waitlist"}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-muted">
                    {submitted 
                        ? "Thank you for signing up! We'll notify you as soon as we launch. Get ready to be part of the future of funding."
                        : "Be the first to know about our upcoming native token launch, exclusive platform features, and early access opportunities. Sign up now!"
                    }
                </p>
                {submitted && (
                    <div className="mt-8">
                        <Link to="/explore">
                            <Button variant="primary">Continue Exploring</Button>
                        </Link>
                    </div>
                )}
            </div>

            {!submitted && (
                <form onSubmit={handleSubmit} className="p-6 bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl space-y-4 max-w-lg mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-grow w-full bg-white dark:bg-brand-bg border border-gray-300 dark:border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-3 text-gray-900 dark:text-white"
                            placeholder="your@email.com"
                            aria-label="Email Address"
                        />
                        <Button type="submit" variant="primary" className="flex-shrink-0">Notify Me</Button>
                    </div>
                     {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default WaitlistPage;
