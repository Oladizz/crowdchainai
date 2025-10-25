import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ProjectCategory } from '../context/types';
import Button from './Button';
import Spinner from './Spinner';
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
}

interface AnalysisResult {
    credibilityScore: number;
    suggestions: string[];
    risks: string[];
}

const CreateProjectTab: React.FC = () => {
    const [mode, setMode] = useState<'ai' | 'manual'>('ai');
    
    // AI Mode State
    const [prompt, setPrompt] = useState('');
    const [generatedData, setGeneratedData] = useState<GeneratedProjectData | null>(null);
    
    // Manual Mode State
    const [manualData, setManualData] = useState<GeneratedProjectData>({
        name: '',
        description: '',
        category: ProjectCategory.TECH,
        milestones: [{ title: '', description: '', fundsRequired: 0 }],
    });

    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { user, createProject } = useAppContext();
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'A creative and concise name for the project.' },
                    description: { type: Type.STRING, description: 'A compelling, detailed description of the project (2-3 sentences).' },
                    category: { type: Type.STRING, enum: Object.values(ProjectCategory), description: 'The most appropriate category for the project.' },
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
                required: ['name', 'description', 'category', 'milestones']
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

    const handleAnalyze = async () => {
        const data = mode === 'ai' ? generatedData : manualData;
        if (!data || !data.name || !data.description) {
            setError("Project name and description are required for analysis.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const analysisSchema = {
                type: Type.OBJECT,
                properties: {
                    credibilityScore: { type: Type.INTEGER, description: 'A score from 0-100 indicating the proposal\'s credibility.' },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 actionable suggestions for improvement.' },
                    risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 potential risks or red flags detected.' }
                },
                required: ['credibilityScore', 'suggestions', 'risks']
            };
            const analysisPrompt = `Analyze this project proposal for a crowdfunding platform. Project: ${JSON.stringify(data)}. Provide a credibility score, suggestions, and risks. Respond ONLY with the JSON object.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: analysisPrompt,
                config: { responseMimeType: "application/json", responseSchema: analysisSchema },
            });
            setAnalysisResult(JSON.parse(response.text));
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("Failed to analyze project. Please try again.");
        } finally {
            setIsAnalyzing(false);
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
        if (mode === 'manual') {
            if (!data.name || !data.description || data.milestones.some(m => !m.title || m.fundsRequired <= 0)) {
                setError("Please fill all required fields. Milestones must have a title and require more than $0 in funding.");
                return;
            }
        }
        createProject(data);
        setSubmitted(true);
    };
    
    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setAnalysisResult(null);
        const { name, value } = e.target;
        setManualData(prev => ({ ...prev, [name]: value }));
    };

    const handleMilestoneChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAnalysisResult(null);
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
                <p className="text-brand-muted">You can track its status under the "My Projects" tab.</p>
            </div>
        );
    }
    
    const ModeButton: React.FC<{
        label: string;
        currentMode: 'ai' | 'manual';
        targetMode: 'ai' | 'manual';
    }> = ({ label, currentMode, targetMode }) => (
        <button
            onClick={() => { setMode(targetMode); setAnalysisResult(null); setError(null); }}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
                currentMode === targetMode
                    ? 'bg-brand-surface text-white border-b-2 border-brand-blue'
                    : 'text-brand-muted hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    const dataToSubmit = mode === 'ai' ? generatedData : manualData;
    const canAnalyze = dataToSubmit && dataToSubmit.name && dataToSubmit.description;
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-center border-b border-brand-surface">
                <ModeButton label="Use AI Assistant" currentMode={mode} targetMode='ai' />
                <ModeButton label="Create Manually" currentMode={mode} targetMode='manual' />
            </div>

            {mode === 'ai' && (
                 <>
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Bring Your Idea to Life with AI</h1>
                        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-brand-muted">
                            Describe your project idea, and our AI will help you build a comprehensive plan to submit for funding.
                        </p>
                    </div>
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
                </>
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
                            <label htmlFor="description" className="block text-sm font-medium text-brand-muted mb-1">Description</label>
                            <textarea name="description" id="description" value={manualData.description} onChange={handleManualChange} rows={4} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white" required />
                         </div>
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-brand-muted mb-1">Category</label>
                            <select name="category" id="category" value={manualData.category} onChange={handleManualChange} className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md p-2 text-white">
                                {Object.values(ProjectCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
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
                </div>
            )}
            
            {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md animate-fade-in">{error}</p>}

            {(isLoading || isAnalyzing) && (
                <div className="text-center py-10">
                    <div className="flex justify-center items-center"><Spinner className="h-8 w-8" /></div>
                    <p className="mt-4 text-brand-muted animate-pulse">{isLoading ? 'Generating your project...' : 'Analyzing...'}</p>
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
                </div>
            )}

            {analysisResult && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-center text-white">AI Analysis Results</h2>
                    <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 p-4 sm:p-6 rounded-xl space-y-4">
                        <div className="text-center">
                            <p className="text-brand-muted text-sm">Credibility Score</p>
                            <p className="text-4xl font-bold text-brand-blue-light">{analysisResult.credibilityScore}/100</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-400">Suggestions for Improvement</h4>
                            <ul className="list-disc list-inside text-sm text-brand-muted mt-2 space-y-1">
                                {analysisResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-yellow-400">Potential Risks</h4>
                            <ul className="list-disc list-inside text-sm text-brand-muted mt-2 space-y-1">
                                {analysisResult.risks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t border-brand-surface">
                 <Button variant="secondary" onClick={handleAnalyze} disabled={isAnalyzing || !canAnalyze}>
                    {isAnalyzing ? <><Spinner className="mr-2 h-4 w-4" /> Analyzing...</> : 'Analyze with AI'}
                 </Button>
                 <Button variant="primary" onClick={() => handleSubmit(dataToSubmit)} disabled={isLoading || isAnalyzing || !user || !canAnalyze}>
                    Submit to DAO
                 </Button>
            </div>
             {!user && <p className="text-right text-yellow-400 text-xs mt-2">Please connect your wallet to submit.</p>}

        </div>
    );
};

export default CreateProjectTab;