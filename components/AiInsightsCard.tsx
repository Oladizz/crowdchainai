import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Project } from '../context/types';
import Spinner from './Spinner';

interface AiInsights {
    successProbability: number;
    riskScore: number;
    fraudRisk: number;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    sentimentSummary: string;
}

const Gauge: React.FC<{ value: number; label: string }> = ({ value, label }) => {
    const percentage = Math.max(0, Math.min(100, value));
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-green-400';
    if (percentage < 40) colorClass = 'text-red-400';
    else if (percentage < 70) colorClass = 'text-yellow-400';

    return (
        <div className="flex flex-col items-center">
            <svg className="w-24 h-24 transform -rotate-90">
                <circle className="text-brand-surface" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                <circle
                    className={colorClass}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <span className={`-mt-16 text-xl font-bold ${colorClass}`}>{percentage}%</span>
            <span className="mt-10 text-xs text-brand-muted">{label}</span>
        </div>
    );
};

const SentimentDisplay: React.FC<{ sentiment: AiInsights['sentiment']; summary: string }> = ({ sentiment, summary }) => {
    const sentimentConfig = {
        Positive: { icon: '😊', color: 'text-green-400', label: 'Positive' },
        Neutral: { icon: '😐', color: 'text-yellow-400', label: 'Neutral' },
        Negative: { icon: '😟', color: 'text-red-400', label: 'Negative' },
    };
    const config = sentimentConfig[sentiment];

    return (
        <div className="text-center">
            <span className="text-4xl">{config.icon}</span>
            <p className={`mt-2 font-semibold ${config.color}`}>{config.label} Sentiment</p>
            <p className="mt-1 text-xs text-brand-muted">{summary}</p>
        </div>
    );
};


const AiInsightsCard: React.FC<{ project: Project }> = ({ project }) => {
    const [insights, setInsights] = useState<AiInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        successProbability: { type: Type.INTEGER, description: 'Estimated success probability (0-100).' },
                        riskScore: { type: Type.INTEGER, description: 'Overall risk score (0-100, higher is riskier).' },
                        fraudRisk: { type: Type.INTEGER, description: 'Risk of fraudulent activity (0-100).' },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
                        sentimentSummary: { type: Type.STRING, description: 'A one-sentence summary of public sentiment.' },
                    },
                     required: ['successProbability', 'riskScore', 'fraudRisk', 'sentiment', 'sentimentSummary']
                };

                const prompt = `Analyze the following crypto crowdfunding project and provide key investor insights. Project Name: "${project.name}", Description: "${project.description}", Funding Goal: $${project.fundingGoal}. Simulate public sentiment based on the project idea. Respond ONLY with the JSON object.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema },
                });
                
                setInsights(JSON.parse(response.text));
            } catch (err) {
                console.error("AI insights failed:", err);
                setError("Could not load AI insights.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, [project]);

    return (
        <div className="bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 text-center">AI-Powered Insights</h3>
            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <Spinner />
                </div>
            )}
            {error && <p className="text-center text-red-400 text-sm">{error}</p>}
            {insights && !isLoading && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Gauge value={insights.successProbability} label="Success Probability" />
                        <Gauge value={100 - insights.riskScore} label="Safety Score" />
                    </div>
                    <div className="border-t border-white/10 my-4"></div>
                    <SentimentDisplay sentiment={insights.sentiment} summary={insights.sentimentSummary} />
                </div>
            )}
        </div>
    );
};

export default AiInsightsCard;
