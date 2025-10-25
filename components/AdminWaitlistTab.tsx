import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from './Button';

const AdminWaitlistTab: React.FC = () => {
    const { waitlist } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWaitlist = useMemo(() => {
        return waitlist.filter(entry =>
            entry.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, waitlist]);

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="text-xl font-semibold text-white">Waitlist Signups ({waitlist.length})</h2>

            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-full py-2 px-4 text-white text-sm"
                />
                <Button variant="secondary" onClick={() => setSearchTerm('')}>Clear</Button>
            </div>
            
            <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-surface">
                        <thead className="bg-brand-surface/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">Date Signed Up</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-surface">
                            {filteredWaitlist.map((entry, index) => (
                                <tr key={index} className="hover:bg-brand-surface/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{entry.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted">{entry.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredWaitlist.length === 0 && (
                        <p className="p-6 text-center text-brand-muted">No entries found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminWaitlistTab;
