

import React, { useState, useMemo, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { GoogleGenAI, Type } from '@google/genai';
import { ProjectCategory } from '../context/types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useAppContext } from '../context/AppContext';

interface GeneratedMilestone {
    title: string;
    description: string;
    fundsRequired: number;
}

interface GeneratedProjectData {
    name: string;
    description: string;
    category: ProjectCategory;
    milestones: GeneratedMilestone[];
    image: File | string;
    durationDays: number;
}

const CreateProjectPage: React.FC = () => {
    const { user, createProject, addToast } = useAppContext();

    useEffect(() => {
        if (user && user.role === 'investor') {
            addToast("Only creators can create new projects.", 'error');
        }
    }, [user, addToast]);

    if (!user || user.role === 'investor') {
        return <Navigate to="/dashboard" replace />;
    }

    const [mode, setMode] = useState<'ai' | 'manual'>('ai');
    
    // AI Mode State
    const [prompt, setPrompt] = useState('');
    const [generatedData, setGeneratedData] = useState<Omit<GeneratedProjectData, 'image'> | null>(null);
    const [aiImageFile, setAiImageFile] = useState<File | null>(null);
    
    // Manual Mode State
    const [manualData, setManualData] = useState<GeneratedProjectData>({
        name: '',
        description: '',
        category: ProjectCategory.TECH,
        milestones: [{ title: '', description: '', fundsRequired: 0 }],
        image: '',
        durationDays: 30,
    });

    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const totalManualGoal = useMemo(() => {
        return manualData.milestones.reduce((sum, m) => sum + (Number(m.fundsRequired) || 0), 0);
    }, [manualData.milestones]);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a project idea.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedData(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'A creative and concise name for the project.' },
                    description: { type: Type.STRING, description: 'A compelling, detailed description of the project (2-3 sentences).' },
                    category: { type: Type.STRING, enum: Object.values(ProjectCategory), description: 'The most appropriate category for the project.' },
                    durationDays: { type: Type.INTEGER, description: 'The campaign duration in days (1-90).' },
                    milestones: {
                        type: Type.ARRAY,
                        description: 'A list of 3-4 logical milestones to complete the project.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: 'A short, clear title for the milestone.' },
                                description: { type: Type.STRING, description: 'A brief description of what this milestone entails.' },
                                fundsRequired: { type: Type.INTEGER, description: 'The estimated amount of funds (USD) required for this milestone.' }
                            },
                            required: ['title', 'description', 'fundsRequired']
                        }
                    }
                },
                required: ['name', 'description', 'category', 'milestones', 'durationDays']
            };
            const fullPrompt = `You are a creative project manager for a decentralized crowdfunding platform. Based on the user's idea, generate a complete project plan... User Idea: "${prompt}"... Respond ONLY with the JSON object.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: { responseMimeType: "application/json", responseSchema },
            });
            const parsedData = JSON.parse(response.text);
            setGeneratedData(parsedData);
        } catch (err) {
            console.error(err);
            setError('Failed to generate project plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (data: GeneratedProjectData | null) => {
        if (!data) {
            setError("No project data to submit.");
            return;
        }
        if (!user) {
            setError("You must be logged in to submit a project.");
            return;
        }
        // Basic validation for manual data
        if (mode === 'manual') {
            if (!data.name || !data.description || !data.image || !data.durationDays || data.durationDays <= 0 || data.milestones.some(m => !m.title || m.fundsRequired <= 0)) {
                setError("Please fill all required fields, including the project image and a valid duration. Milestones must have a title and require more than $0 in funding.");
                return;
            }
        }
        createProject(data);
        setSubmitted(true);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setManualData(prev => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManualData(prev => ({ ...prev, [name]: value }));
    };

    const handleMilestoneChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newMilestones = [...manualData.milestones];
        const currentMilestone = { ...newMilestones[index] };
        
        if (name === 'fundsRequired') {
            currentMilestone.fundsRequired = Number(value);
        } else if (name === 'title') {
            currentMilestone.title = value;
        } else if (name === 'description') {
            currentMilestone.description = value;
        }
        
        newMilestones[index] = currentMilestone;
        setManualData(prev => ({ ...prev, milestones: newMilestones }));
    };

    const addMilestone = () => {
        setManualData(prev => ({
            ...prev,
            milestones: [...prev.milestones, { title: '', description: '', fundsRequired: 0 }]
        }));
    };

    const removeMilestone = (index: number) => {
        if (manualData.milestones.length <= 1) return;
        const newMilestones = manualData.milestones.filter((_, i) => i !== index);
        setManualData(prev => ({ ...prev, milestones: newMilestones }));
    };

    if (submitted) {
        return (
            <div className="text-center py-16 animate-fade-in">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Thank You!</h1>
                <p className="mt-4 text-brand-muted">Your project has been submitted for DAO review.</p>
                <p className="mt-4 text-brand-muted">You can track its status on your dashboard.</p>
                 <div className="mt-6 flex justify-center space-x-4">
                    <Link to="/dashboard"><Button variant="primary">Go to Dashboard</Button></Link>
                    <Link to="/explore"><Button variant="secondary">Explore More Projects</Button></Link>
                </div>
            </div>
        );
    }
    
    const ModeButton: React.FC<{
        label: string;
        currentMode: 'ai' | 'manual';
        targetMode: 'ai' | 'manual';
    }> = ({ label, currentMode, targetMode }) => (
        <button
            onClick={() => setMode(targetMode)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
                currentMode === targetMode
                    ? 'bg-brand-surface text-white border-b-2 border-brand-blue'
                    : 'text-brand-muted hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Create a New Project</h1>
                <p className="mt-2 sm:mt-4 text-sm sm:text-base text-brand-muted">
                    Choose your method: use our AI assistant to build a plan from your idea, or fill out the details manually.
                </p>
            </div>
            
            <div className="flex justify-center border-b border-brand-surface">
                <ModeButton label="Use AI Assistant" currentMode={mode} targetMode='ai' />
                <ModeButton label="Create Manually" currentMode={mode} targetMode='manual' />
            </div>

            {mode === 'ai' && (
                <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-brand-muted">Your Project Idea</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., An open-source, decentralized social media app focused on user privacy."
                        rows={4}
                        className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white"
                        disabled={isLoading}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleGenerate} disabled={isLoading || !prompt} variant="primary">
                            {isLoading ? <><Spinner className="mr-2" /> Generating...</> : 'Generate Project Plan'}
                        </Button>
                    </div>
                </div>
            )}

            {mode === 'manual' && (
                 <div className="space-y-6">
                    <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                         <h3 className="text-lg font-semibold text-white">Project Details</h3>
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-brand-muted mb-1">Project Name</label>
                            <input type="text" name="name" id="name" value={manualData.name} onChange={handleManualChange} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white" required />
                         </div>
                         <div>
                            <label htmlFor="image" className="block text-sm font-medium text-brand-muted mb-1">Project Image</label>
                            <input type="file" name="image" id="image" onChange={handleFileChange} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white" required />
                         </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-brand-muted mb-1">Description</label>
                            <textarea name="description" id="description" value={manualData.description} onChange={handleManualChange} rows={4} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white" required />
                         </div>
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-brand-muted mb-1">Category</label>
                            <select name="category" id="category" value={manualData.category} onChange={handleManualChange} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white">
                                {Object.values(ProjectCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                         </div>
                         <div>
                            <label htmlFor="durationDays" className="block text-sm font-medium text-brand-muted mb-1">Campaign Duration (in days)</label>
                            <input type="number" name="durationDays" id="durationDays" value={manualData.durationDays} onChange={handleManualChange} min="1" max="90" className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white" required />
                            <p className="text-xs text-brand-muted mt-1">Max 90 days, as per contract rules.</p>
                         </div>
                    </div>
                    <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white">Funding Milestones</h3>
                        {manualData.milestones.map((milestone, index) => (
                            <div key={index} className="p-3 border border-brand-bg rounded-md space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-white">Milestone {index + 1}</p>
                                    {manualData.milestones.length > 1 && (
                                        <button onClick={() => removeMilestone(index)} className="text-xs text-red-400 hover:text-red-300">&times; Remove</button>
                                    )}
                                </div>
                                <input type="text" name="title" placeholder="Milestone Title" value={milestone.title} onChange={(e) => handleMilestoneChange(index, e)} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white text-sm" required />
                                <textarea name="description" placeholder="Milestone Description" value={milestone.description} onChange={(e) => handleMilestoneChange(index, e)} rows={2} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white text-sm" />
                                <input type="number" name="fundsRequired" placeholder="Funds Required (USD)" value={milestone.fundsRequired || ''} onChange={(e) => handleMilestoneChange(index, e)} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white text-sm" required min="1" />
                            </div>
                        ))}
                         <div className="flex justify-between items-center">
                            <Button variant="secondary" onClick={addMilestone}>Add Milestone</Button>
                            <p className="text-right font-bold text-white">Total Funding Goal: <span className="text-brand-blue-light">${totalManualGoal.toLocaleString()}</span></p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="primary" onClick={() => handleSubmit(manualData)} disabled={isLoading || !user}>Submit to DAO</Button>
                    </div>
                </div>
            )}
            
            {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md animate-fade-in">{error}</p>}

            {isLoading && (
                <div className="text-center py-10">
                    <div className="flex justify-center items-center"><Spinner className="h-8 w-8" /></div>
                    <p className="mt-4 text-brand-muted animate-pulse">Generating your project...</p>
                </div>
            )}

            {generatedData && mode === 'ai' && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-center text-white">Review Your Generated Project</h2>
                    <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white">Project Details</h3>
                        <div>
                            <p className="text-sm font-medium text-brand-muted">Project Name</p>
                            <p className="mt-1 text-white break-words">{generatedData.name}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-brand-muted">Category</p>
                            <p className="mt-1 text-white break-words">{generatedData.category}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-muted">Campaign Duration</p>
                            <p className="mt-1 text-white break-words">{generatedData.durationDays} days</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-muted">Description</p>
                            <p className="mt-1 text-brand-muted break-words">{generatedData.description}</p>
                        </div>
                    </div>
                     <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white">Generated Milestones</h3>
                        <div className="space-y-3">
                            {generatedData.milestones.map((milestone, index) => (
                                <div key={index} className="p-3 border border-brand-bg rounded-md">
                                    <p className="font-medium text-white break-words">{milestone.title} - <span className="text-brand-blue-light">${milestone.fundsRequired.toLocaleString()}</span></p>
                                    <p className="text-sm text-brand-muted break-words">{milestone.description}</p>
                                </div>
                            ))}
                        </div>
                         <p className="text-right font-bold text-white">Total Funding Goal: ${generatedData.milestones.reduce((sum, m) => sum + m.fundsRequired, 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                        <h3 className="text-lg font-semibold text-white">Upload Project Image</h3>
                        <input type="file" name="image" id="ai-image" onChange={(e) => setAiImageFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white" required />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button variant="secondary" onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? <Spinner className="mr-2" /> : 'Regenerate'}
                        </Button>
                        <Button variant="primary" onClick={() => handleSubmit({ ...generatedData, image: aiImageFile })} disabled={isLoading || !user || !aiImageFile}>Submit to DAO</Button>
                    </div>
                </div>
            )}

            {!user && (
                 <div className="bg-yellow-900/50 text-yellow-300 text-center p-4 rounded-lg mt-4">
                    <p>Please connect your wallet to create and submit a project.</p>
                </div>
            )}
        </div>
    );
};

export default CreateProjectPage;
