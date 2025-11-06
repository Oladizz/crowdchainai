import React, { useState } from 'react';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';

const BugReportPage: React.FC = () => {
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { addBugReport } = useAppContext();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            addBugReport(description);
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-white">Thank you!</h1>
                <p className="mt-4 text-brand-muted">Your bug report has been submitted.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Report a Bug</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the bug in detail..."
                    rows={8}
                    className="w-full bg-brand-surface border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white"
                />
                <div className="text-right">
                    <Button type="submit" variant="primary" disabled={!description.trim()}>Submit Report</Button>
                </div>
            </form>
        </div>
    );
};

export default BugReportPage;