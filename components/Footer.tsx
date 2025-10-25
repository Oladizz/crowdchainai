

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
                        <SocialIcon href="https://twitter.com">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                        </SocialIcon>
                        <SocialIcon href="https://discord.com">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-2.148-.72-3.048-1.224-3.816-1.5-1.032-.384-2.16-.48-3.264-.48-1.38 0-2.6.156-3.72.504-1.224.372-2.316.996-3.144 1.68-1.02.84-1.764 1.992-1.92 3.3-1.404-1.632-1.404-1.632-3.216-1.44-1.62.168-2.796 1.236-2.796 1.236-1.116 1.656-1.248 3.6-1.248 3.6s.768 1.944 3.564 2.412c-2.4.48-3.324 1.464-3.324 1.464-1.152 2.136.216 4.344.216 4.344 1.644 1.2 3.06 1.2 3.06 1.2l.168-.18s-1.824-.54-2.904-1.38c.18.06.372.12.564.18 1.152.324 2.376.504 3.66.504 3.204 0 5.8-1.5 5.8-1.5s-.624.576-1.644 1.128c1.392.48 2.808.48 2.808.48l.144.144s1.284.144 2.724-1.032c1.44-1.176 1.596-3.036 1.596-3.036s-1.044-1.056-3.036-1.536z" /></svg>
                        </SocialIcon>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
