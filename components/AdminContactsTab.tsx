import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from './Button';

const AdminContactsTab: React.FC = () => {
    const { contactMessages } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(5);

    const filteredMessages = useMemo(() => {
        return contactMessages.filter(msg =>
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.message.toLowerCase().includes(searchTerm.toLowerCase())
        ).reverse(); // Show newest first
    }, [searchTerm, contactMessages]);

    const visibleMessages = filteredMessages.slice(0, visibleCount);

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-semibold text-white">Contact Messages ({contactMessages.length})</h2>
             <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search by email, name, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-full py-2 px-4 text-white text-sm"
                />
                <Button variant="secondary" onClick={() => setSearchTerm('')}>Clear</Button>
            </div>

            <div className="space-y-4">
                {visibleMessages.length > 0 ? (
                    visibleMessages.map((msg, index) => (
                        <div key={index} className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 rounded-xl">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{msg.name} - <span className="text-brand-blue-light">{msg.email}</span></p>
                                    <p className="text-xs text-brand-muted">{msg.date}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-brand-muted break-words">{msg.message}</p>
                        </div>
                    ))
                ) : (
                     <div className="text-center py-10 bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl">
                        <p className="text-brand-muted">No contact messages found.</p>
                    </div>
                )}
            </div>

            {visibleCount < filteredMessages.length && (
                <div className="text-center">
                    <Button variant="secondary" onClick={() => setVisibleCount(c => c + 5)}>Load More</Button>
                </div>
            )}
        </div>
    );
};

export default AdminContactsTab;
