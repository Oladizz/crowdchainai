import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { ProjectCategory } from '../context/types';
import { useAppContext } from '../context/AppContext';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ExplorePage: React.FC = () => {
  const query = useQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(query.get('category') || 'All');
  
  const { projects, getUserProfileByWallet, isLoading } = useAppContext();
  
  useEffect(() => {
    const queryCategory = query.get('category');
    if (queryCategory && Object.values(ProjectCategory).includes(queryCategory as ProjectCategory)) {
        setCategory(queryCategory);
    }
  }, [query]);
  
  const approvedProjects = useMemo(() => projects.filter(p => p.daoStatus === 'Approved'), [projects]);

  const spotlightProjects = approvedProjects.slice(0, 4);
  
  const totalFundsRaised = Math.round(projects.reduce((sum, p) => sum + p.amountRaised, 0));
  const activeProjectsCount = approvedProjects.length;
  
  const daoMembers = useMemo(() => {
    const creatorWallets = new Set(projects.map(p => p.creatorWallet));
    return creatorWallets.size;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return approvedProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'All' || project.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, category, approvedProjects]);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-6" data-guide="welcome">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white animate-text-focus-in">
          The Future of Funding, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
            Decentralized.
          </span>
        </h1>
        <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-brand-muted animate-fade-in" style={{ animationDelay: '0.5s' }}>
          CrowdChain empowers creators and communities by connecting innovative ideas with blockchain-powered funding and DAO governance.
        </p>
         <div className="mt-8 sm:mt-10 flex flex-row justify-center space-x-4 animate-fade-in" style={{ animationDelay: '1s' }}>
          <a href="#all-projects" onClick={(e) => {
              e.preventDefault();
              document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <Button variant="primary">
              Explore Projects
            </Button>
          </a>
          <Link to="/dashboard">
            <Button variant="secondary">Start a Project</Button>
          </Link>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '1.2s' }}>
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
          <StatCard label="Total Funds Raised" value={totalFundsRaised} prefix="$" />
          <StatCard label="Active Projects" value={activeProjectsCount} />
          <StatCard label="DAO Members" value={daoMembers} />
        </div>
      </section>

      {/* Spotlight Projects Section */}
      <section className="animate-slide-in-bottom" style={{ animationDelay: '1.4s' }} data-guide="spotlight">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Spotlight Projects</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : spotlightProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {spotlightProjects.map(project => {
                const creatorProfile = getUserProfileByWallet(project.creatorWallet);
                return (
                  <ProjectCard 
                      key={project.id} 
                      project={project} 
                      creatorUsername={creatorProfile?.username}
                      creatorAvatar={creatorProfile?.avatar}
                  />
                );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-100 dark:bg-brand-surface/60 dark:backdrop-blur-lg dark:border dark:border-white/10 rounded-xl">
            <p className="text-brand-muted">No spotlight projects available right now.</p>
          </div>
        )}
      </section>
      
      <section id="all-projects" data-guide="all-projects" className="space-y-8 sm:space-y-10 scroll-mt-20">
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">All Projects</h1>
            <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base text-brand-muted">
            Discover the next wave of innovation. Fund projects you believe in and help shape the future.
            </p>
        </div>

        {/* Filters and Search */}
        <div className="sticky top-16 bg-white/60 dark:bg-brand-surface/60 backdrop-blur-lg z-20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
            <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-brand-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                </div>
                <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 dark:bg-brand-surface border border-gray-200 dark:border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md py-2 pl-10 pr-4 text-gray-900 dark:text-white text-sm"
                />
            </div>
            <div className="w-full md:w-auto">
                <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-100 dark:bg-brand-surface border border-gray-200 dark:border-brand-surface focus:border-brand-blue focus:ring-brand-blue rounded-md py-2 pl-4 pr-10 text-gray-900 dark:text-white text-sm"
                >
                <option value="All">All Categories</option>
                {Object.values(ProjectCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>
            </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
        ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProjects.map(project => {
                const creatorProfile = getUserProfileByWallet(project.creatorWallet);
                return (
                  <ProjectCard 
                      key={project.id} 
                      project={project} 
                      creatorUsername={creatorProfile?.username}
                      creatorAvatar={creatorProfile?.avatar}
                  />
                );
            })}
            </div>
        ) : (
            <div className="text-center py-12 sm:py-16">
                <p className="text-lg sm:text-xl text-brand-muted">No projects found.</p>
                <p className="text-sm sm:text-base text-brand-muted mt-2">Try a different search or filter.</p>
            </div>
        )}
      </section>
    </div>
  );
};

export default ExplorePage;