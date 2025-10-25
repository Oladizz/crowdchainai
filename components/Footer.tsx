

import React from 'react';
import { Link } from 'react-router-dom';

const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-brand-blue-light transition-transform duration-300 hover:scale-110">
        {children}
    </a>
);

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-100/60 dark:bg-brand-surface/60 backdrop-blur-lg border-t border-gray-200 dark:border-white/10">
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-sm text-brand-muted">
                        &copy; {new Date().getFullYear()} CrowdChain. All rights reserved.
                    </div>
                    <nav className="flex space-x-6 text-sm flex-wrap justify-center">
                        <Link to="/" className="text-brand-muted hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Home</Link>
                        <Link to="/explore" className="text-brand-muted hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Explore</Link>
                        <Link to="/dao" className="text-brand-muted hover:text-gray-900 dark:hover:text-white transition-colors duration-300">DAO</Link>
                        <Link to="/about" className="text-brand-muted hover:text-gray-900 dark:hover:text-white transition-colors duration-300">About</Link>
                        <Link to="/contact" className="text-brand-muted hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Contact</Link>
                        <Link to="/waitlist" className="text-brand-muted hover:text-gray-900 dark:hover:text-white transition-colors duration-300">Waitlist</Link>
                    </nav>
                    <div className="flex space-x-6">
                        <SocialIcon href="https://x.com/crowdchainDapp">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </SocialIcon>
                        <SocialIcon href="https://t.me/+Rkph17__oXw2OGU0">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-1.002 6.52-1.45 8.615-.17.8-.502 1.002-1.012.998-.424-.002-1.05-.24-1.582-.56-1.84-1.104-2.884-1.8-4.088-2.868-.534-.48-.994-.894-1.022-1.034-.02-.1-.01-.22.05-.33.204-.336 4.454-4.09 4.454-4.09.2-.18.02-.33-.13-.24-1.12.624-3.83 2.37-4.38 2.72-.52.33-.94.49-1.34.48-.49-.01-1.22-.16-1.8-.32-.75-.2-1.35-.31-1.28-.78.03-.28.3-.53.89-.74 2.47-1.03 6.9-2.83 8.3-3.32.36-.12.67-.18.84-.18z"/></svg>
                        </SocialIcon>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
