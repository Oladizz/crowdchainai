
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI, Chat } from '@google/genai';
import Spinner from './Spinner';

const ChatIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);


const AiChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initializeChat = () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are CrowdChainAI, a friendly and helpful assistant for the CrowdChain decentralized crowdfunding platform. Your goal is to answer user questions clearly and concisely. Keep your answers brief, around 2-3 sentences, unless the user asks for more detail."
                }
            });
            setMessages([{
                role: 'model',
                text: "Hello! I'm CrowdChainAI. How can I help you explore the future of funding today?"
            }]);
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            setMessages([{ role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen && !chatRef.current) {
            initializeChat();
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;
        
        const userMessage = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: input });
            const modelMessage = { role: 'model' as const, text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = { role: 'model' as const, text: "Sorry, I couldn't process that. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleToggle}
                className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[99] bg-brand-purple text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-blue transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-blue border-2 border-white/20"
                aria-label="Toggle AI Chatbot"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>

            {isOpen && (
                <div className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-[98] w-full max-w-sm h-[60vh] max-h-[500px] bg-brand-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-slide-in-bottom">
                    {/* Header */}
                    <div className="flex-shrink-0 p-3 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white">CrowdChain AI Assistant</h3>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-3 space-y-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 text-sm font-bold">AI</div>}
                                <div className={`p-3 rounded-xl max-w-xs break-words ${msg.role === 'user' ? 'bg-brand-button text-white rounded-br-none' : 'bg-brand-bg text-brand-muted rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 text-sm font-bold">AI</div>
                                <div className="p-3 rounded-xl bg-brand-bg">
                                    <Spinner className="w-5 h-5" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full bg-brand-bg border border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-full py-2 px-4 text-white placeholder-brand-muted"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-blue text-white w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-brand-muted disabled:cursor-not-allowed">
                                <SendIcon />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AiChatbot;
