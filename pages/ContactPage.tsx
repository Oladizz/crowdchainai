import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';

const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-16 w-16 text-green-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ContactPage: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const { addContactMessage } = useAppContext();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        if (name && email && message) {
            addContactMessage(name, email, message);
            setSubmitted(true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-8 animate-fade-in">
            <div className="text-center flex flex-col items-center">
                {submitted && <CheckCircleIcon />}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4">
                    {submitted ? 'Message Sent!' : 'Get In Touch'}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-muted">
                    {submitted
                        ? "Thank you for reaching out. We've received your message and will get back to you as soon as possible."
                        : "Have questions, feedback, or partnership inquiries? We'd love to hear from you."}
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
                <form onSubmit={handleSubmit} className="p-6 bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl space-y-6 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-brand-muted">Full Name</label>
                            <input type="text" name="name" id="name" required className="mt-1 w-full bg-white dark:bg-brand-bg border border-gray-300 dark:border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-brand-muted">Email Address</label>
                            <input type="email" name="email" id="email" required className="mt-1 w-full bg-white dark:bg-brand-bg border border-gray-300 dark:border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-brand-muted">Message</label>
                        <textarea name="message" id="message" rows={5} required className="mt-1 w-full bg-white dark:bg-brand-bg border border-gray-300 dark:border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-gray-900 dark:text-white"></textarea>
                    </div>
                    <div className="text-right">
                        <Button type="submit" variant="primary">Send Message</Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ContactPage;
