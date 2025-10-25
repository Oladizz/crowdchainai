
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          About CrowdChain
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-muted">
          Powering the next generation of creative and technological projects with decentralized governance.
        </p>
      </div>

      <div className="p-6 bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg dark:border dark:border-white/10 rounded-xl space-y-4 text-base text-brand-muted leading-relaxed">
        <p>
          CrowdChain was born from a simple yet powerful idea: crowdfunding should be more transparent, equitable, and community-driven. Traditional platforms often act as gatekeepers, imposing high fees and centralized control over projects. We believe in a different future—one where creators have direct access to funding and backers have a real stake in the projects they support.
        </p>
        <p>
          By leveraging the power of blockchain technology and Decentralized Autonomous Organizations (DAOs), CrowdChain puts governance in the hands of its community. Every approved project is a testament to the collective will of our members, and every dollar contributed is a vote of confidence tracked transparently on-chain.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <ul className="space-y-4 text-brand-muted">
            <li className="flex items-start space-x-3">
              <strong className="text-brand-blue-light">1. Submit:</strong>
              <span>Creators submit their project proposals, outlining their vision, goals, and funding milestones.</span>
            </li>
            <li className="flex items-start space-x-3">
              <strong className="text-brand-blue-light">2. Vote:</strong>
              <span>The CrowdChain DAO, comprised of token holders, votes on which projects to approve for funding.</span>
            </li>
            <li className="flex items-start space-x-3">
              <strong className="text-brand-blue-light">3. Fund:</strong>
              <span>Once approved, projects are listed on our platform for anyone to fund. Funds are held in a secure smart contract.</span>
            </li>
            <li className="flex items-start space-x-3">
              <strong className="text-brand-blue-light">4. Build:</strong>
              <span>Funds are released to creators in tranches as they complete and submit proof for each milestone, which is again verified by the DAO.</span>
            </li>
          </ul>
        </div>
        <div className="text-center">
          <img src="https://picsum.photos/seed/about/500/500" alt="Community collaboration" className="rounded-xl shadow-xl" />
        </div>
      </div>
      
      <div className="text-center pt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Join the Movement</h2>
        <p className="mt-2 max-w-xl mx-auto text-brand-muted">
          Whether you're a creator with a bold idea or a supporter looking to fund the future, CrowdChain is your platform.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
            <Link to="/explore">
                <Button variant="primary">Explore Projects</Button>
            </Link>
            <Link to="/create">
                <Button variant="secondary">Start Your Own</Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
