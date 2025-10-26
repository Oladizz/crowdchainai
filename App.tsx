import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import ExplorePage from './pages/ExplorePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import DaoPage from './pages/DaoPage';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import DashboardPage from './pages/DashboardPage';
import CreateProjectPage from './pages/CreateProjectPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import WaitlistPage from './pages/WaitlistPage';
// import AiToolsPage from './pages/AiToolsPage'; // NOTE: File not provided, commented out.
import UserGuide from './components/UserGuide';
import GuideButton from './components/GuideButton';
import { guideConfig } from './guideConfig';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import LoginModal from './components/LoginModal';
import GetStartedModal from './components/GetStartedModal';
import AiChatbot from './components/AiChatbot';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [activeGuide, setActiveGuide] = useState<string | null>(null);
    const isDashboardPage = location.pathname === '/dashboard';

    const pathParts = location.pathname.split('/');
    let guideKey = pathParts[1] || 'home';
    if (pathParts[1] === 'project') {
        guideKey = 'project';
    } else if (pathParts[1] === 'home') {
        guideKey = 'home';
    }


    useEffect(() => {
        const hasViewed = localStorage.getItem(`guide_${guideKey}_viewed`);
        if (!hasViewed && guideConfig[guideKey]) {
            const timer = setTimeout(() => setActiveGuide(guideKey), 500);
            return () => clearTimeout(timer);
        }
    }, [guideKey]);

    const startGuide = (key?: string) => {
        const keyToUse = key || guideKey;
        if(guideConfig[keyToUse]){
            localStorage.removeItem(`guide_${keyToUse}_viewed`);
            setActiveGuide(keyToUse);
        }
    }

    const closeGuide = () => {
        setActiveGuide(null);
    }
    
    useEffect(() => {
        const handleStartGuide = (event: CustomEvent) => {
            startGuide(event.detail);
        };
        
        window.addEventListener('start-guide', handleStartGuide as EventListener);
        
        return () => {
            window.removeEventListener('start-guide', handleStartGuide as EventListener);
        }
    }, [guideKey]);


    return (
        <div className="flex min-h-screen font-sans text-gray-800 dark:text-white transition-colors duration-300 relative isolate">
            {/* Background and Glow effect */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-brand-bg" />
            <div className="fixed top-0 left-0 -z-10 h-screen w-screen bg-transparent bg-[radial-gradient(circle_800px_at_50%_200px,#00bfff10,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#00bfff20,transparent)]" />
            
            <Sidebar />
            <div className="flex-1 flex flex-col md:pl-64">
                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-6">
                    {children}
                </main>
                {isDashboardPage && <Footer />}
            </div>
            <BottomNavBar />
            <ToastContainer />
            {activeGuide && guideConfig[activeGuide] && (
                <UserGuide 
                    steps={guideConfig[activeGuide]} 
                    guideKey={activeGuide}
                    onClose={closeGuide} 
                />
            )}
            <GuideButton onClick={() => startGuide()} />
            <AiChatbot />
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                            <Header />
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/*" element={
                                    <MainLayout>
                                        <Routes>
                                            <Route path="/home" element={<ExplorePage />} />
                                            <Route path="/explore" element={<ExplorePage />} />
                                            <Route path="/project/:id" element={<ProjectDetailPage />} />
                                            <Route path="/dao" element={<DaoPage />} />
                                            <Route path="/dashboard" element={<DashboardPage />} />
                                            <Route path="/create" element={<CreateProjectPage />} />
                                            <Route path="/about" element={<AboutPage />} />
                                            <Route path="/contact" element={<ContactPage />} />
                                            <Route path="/waitlist" element={<WaitlistPage />} />
                                            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                                            {/* <Route path="/ai-tools" element={<AiToolsPage />} /> */}
                                            <Route path="/profile/:walletAddress" element={<ProfilePage />} />
                                        </Routes>
                                    </MainLayout>
                                } />
                            </Routes>
            <GetStartedModal />
            <LoginModal />
            </HashRouter>
        </AppProvider>
    );
};

// FIX: Add default export to resolve "no default export" error in index.tsx.
export default App;