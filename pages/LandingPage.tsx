import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import { useAppContext } from '../context/AppContext';
import { ProjectCategory } from '../context/types';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';
import Footer from '../components/Footer';

// --- SVG Icons ---
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const VoteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const CashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

const RocketIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-4 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);

const CodeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
);

const PaletteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
);

const GamepadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4.329a1 1 0 01.916.984l.024 1.251A5.002 5.002 0 0112 5a5 5 0 012.06 9.435l.024-1.25a1 1 0 01.916-.985h0a1 1 0 01.984.916l-.024 1.251A5.002 5.002 0 0112 19a5 5 0 01-2.06-9.435l-.024-1.251a1 1 0 01.916-.984z" /><path d="M15 9l-3 3-3-3" /></svg>
);

const UsersIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

const BeakerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path d="M9 9h6v6H9z" /></svg>
);

const categoryIcons: Record<ProjectCategory, React.ReactNode> = {
    [ProjectCategory.TECH]: <CodeIcon />,
    [ProjectCategory.ART]: <PaletteIcon />,
    [ProjectCategory.GAMING]: <GamepadIcon />,
    [ProjectCategory.COMMUNITY]: <UsersIcon />,
    [ProjectCategory.SCIENCE]: <BeakerIcon />,
};

const LandingPage: React.FC = () => {
  const { projects, user, getUserProfileByWallet, isLoading, openGetStartedModal } = useAppContext();
  
  const approvedProjects = useMemo(() => projects.filter(p => p.daoStatus === 'Approved'), [projects]);

  const spotlightProjects = approvedProjects.slice(0, 4);
  const newestProjects = [...approvedProjects].sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()).slice(0, 4); // Simplistic way to get "newest"

  const recommendedProjects = useMemo(() => {
    if (!user) return [];

    const fundedProjectIds = new Set(user.fundedProjects.map(p => p.projectId));
    if (fundedProjectIds.size === 0) return [];

    const fundedCategories = new Set(
        projects
            .filter(p => fundedProjectIds.has(p.id))
            .map(p => p.category)
    );

    return approvedProjects.filter(p => 
        !fundedProjectIds.has(p.id) &&
        !user.createdProjectIds.includes(p.id) &&
        fundedCategories.has(p.category)
    ).slice(0, 4);
  }, [user, projects, approvedProjects]);
  
  const totalFundsRaised = Math.round(projects.reduce((sum, p) => sum + p.amountRaised, 0));
  const activeProjectsCount = approvedProjects.length;
  
  const daoMembers = useMemo(() => {
    const creatorWallets = new Set(projects.map(p => p.creatorWallet));
    return creatorWallets.size;
  }, [projects]);

  return (
    <div className="space-y-16 sm:space-y-24 animate-fade-in px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center pt-12 pb-8" data-guide="welcome">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white animate-text-focus-in">
          The Future of Funding, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
            Decentralized.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-brand-muted animate-fade-in" style={{ animationDelay: '0.5s' }}>
          CrowdChain empowers creators and communities by connecting innovative ideas with blockchain-powered funding and DAO governance.
        </p>
        <div className="mt-10 flex flex-row justify-center items-center space-x-4 animate-fade-in" style={{ animationDelay: '1s' }}>
          <Button variant="primary" className="w-auto text-sm px-6 py-2" onClick={openGetStartedModal}>Get Started</Button>
          <Link to="/waitlist"><Button variant="secondary" className="w-auto text-sm px-6 py-2 glowing-button">Join Waitlist</Button></Link>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-left animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="p-4 rounded-xl border border-transparent dark:border-white/10">
                <h3 className="font-bold text-white">DAO Governed</h3>
                <p className="text-sm text-brand-muted mt-1">Projects are approved by the community, for the community.</p>
            </div>
            <div className="p-4 rounded-xl border border-transparent dark:border-white/10">
                <h3 className="font-bold text-white">Milestone Payouts</h3>
                <p className="text-sm text-brand-muted mt-1">Funds are released on milestone completion, ensuring accountability.</p>
            </div>
            <div className="p-4 rounded-xl border border-transparent dark:border-white/10">
                <h3 className="font-bold text-white">Fully Transparent</h3>
                <p className="text-sm text-brand-muted mt-1">All funding and voting activities are recorded on-chain.</p>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
          <StatCard label="Total Funds Raised" value={totalFundsRaised} prefix="$" />
          <StatCard label="Active Projects" value={activeProjectsCount} />
          <StatCard label="DAO Members" value={daoMembers} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto text-center animate-slide-in-bottom" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-3xl font-bold text-white mb-2">A Simple, Powerful Process</h2>
        <p className="text-lg text-brand-muted mb-12">From idea to reality in four community-driven steps.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-4 rounded-xl border border-transparent dark:border-white/10">
                <PencilIcon />
                <h3 className="text-lg font-semibold text-white">1. Submit</h3>
                <p className="text-sm text-brand-muted mt-2">Creators submit detailed project proposals with clear milestones.</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl border border-transparent dark:border-white/10">
                <VoteIcon />
                <h3 className="text-lg font-semibold text-white">2. Vote</h3>
                <p className="text-sm text-brand-muted mt-2">The DAO community votes to approve projects for funding.</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl border border-transparent dark:border-white/10">
                <CashIcon />
                <h3 className="text-lg font-semibold text-white">3. Fund</h3>
                <p className="text-sm text-brand-muted mt-2">Approved projects are listed for anyone to back and support.</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl border border-transparent dark:border-white/10">
                <RocketIcon />
                <h3 className="text-lg font-semibold text-white">4. Build</h3>
                <p className="text-sm text-brand-muted mt-2">Funds unlock as milestones are met and verified by the DAO.</p>
            </div>
        </div>
      </section>

      {/* Spotlight Projects Section */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '0.6s' }} data-guide="spotlight">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Spotlight Projects</h2>
            <Link to="/explore" data-guide="explore-link">
                <Button variant="ghost" Icon={ChevronRightIcon}>
                    View All
                </Button>
            </Link>
        </div>
        {isLoading ? (
            <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 -mx-4 px-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-shrink-0 w-64"><ProjectCardSkeleton /></div>)}
            </div>
        ) : spotlightProjects.length > 0 ? (
          <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 -mx-4 px-4">
            {spotlightProjects.map(project => {
                const creatorProfile = getUserProfileByWallet(project.creatorWallet);
                return (
                  <div key={project.id} className="flex-shrink-0 w-64">
                    <ProjectCard
                        project={project}
                        creatorUsername={creatorProfile?.username}
                        creatorAvatar={creatorProfile?.avatar}
                    />
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-100 dark:bg-brand-surface rounded-xl">
            <p className="text-brand-muted">No spotlight projects available right now.</p>
          </div>
        )}
      </section>

      {/* Browse by Category Section */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-3xl font-bold text-white text-center mb-10">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {Object.values(ProjectCategory).map(category => (
                  <Link 
                      to={`/explore?category=${encodeURIComponent(category as ProjectCategory)}`} 
                      key={category}
                      className="group bg-brand-surface rounded-xl p-6 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-purple/30 border border-white/10"
                  >
                      {categoryIcons[category as ProjectCategory]}
                      <p className="mt-4 font-semibold text-white transition-colors group-hover:text-brand-blue-light">{category}</p>
                  </Link>
              ))}
          </div>
      </section>

      {/* Recommended For You Section */}
      {user && recommendedProjects.length > 0 && (
          <section className="animate-slide-in-bottom" style={{ animationDelay: '1.0s' }}>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
              </div>
              <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 -mx-4 px-4">
                  {recommendedProjects.map(project => {
                      const creatorProfile = getUserProfileByWallet(project.creatorWallet);
                      return (
                          <div key={project.id} className="flex-shrink-0 w-64">
                              <ProjectCard
                                  project={project}
                                  creatorUsername={creatorProfile?.username}
                                  creatorAvatar={creatorProfile?.avatar}
                              />
                          </div>
                      );
                  })}
              </div>
          </section>
      )}
      
      {/* Final CTA Section */}
      <section className="text-center bg-brand-surface rounded-xl p-8 sm:p-12 animate-slide-in-bottom border border-white/10" style={{ animationDelay: '1.2s' }}>
          <h2 className="text-3xl font-bold text-white">Ready to Dive In?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-muted">
              Explore groundbreaking projects or bring your own vision to the community.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/explore"><Button variant="primary">Explore Projects</Button></Link>
              <Link to="/create"><Button variant="secondary">Start a Project</Button></Link>
          </div>
      </section>

      <Footer />


    </div>
  );
};

export default LandingPage;
