
export interface GuideStep {
  elementSelector: string;
  title: string;
  content: string;
}

export const guideConfig: Record<string, GuideStep[]> = {
  home: [
    {
      elementSelector: '[data-guide="welcome"]',
      title: 'Welcome to CrowdChain!',
      content: "This is a decentralized platform where you can discover, fund, and govern innovative projects. Let's take a quick tour.",
    },
    {
      elementSelector: '[data-guide="connect-wallet"]',
      title: 'Connect Your Wallet',
      content: 'To get started, connect your wallet. This is your identity on CrowdChain, allowing you to fund projects and vote in the DAO.',
    },
    {
      elementSelector: '[data-guide="spotlight"]',
      title: 'Spotlight Projects',
      content: "Here you'll find featured projects that are gaining traction in the community.",
    },
    {
      elementSelector: '[data-guide="explore-link"]',
      title: 'Explore More Projects',
      content: 'Click "View All" to see every project on the platform. You can search by name or filter by category there.',
    },
    {
      elementSelector: '[data-guide="nav-bar"]',
      title: 'Navigate the App',
      content: 'Use the bottom bar to switch between exploring projects, participating in DAO governance, and viewing your personal dashboard.',
    }
  ],
  explore: [
    {
      elementSelector: '[data-guide="welcome"]',
      title: 'Welcome to CrowdChain!',
      content: "This is a decentralized platform where you can discover, fund, and govern innovative projects. Let's take a quick tour.",
    },
    {
      elementSelector: '[data-guide="connect-wallet"]',
      title: 'Connect Your Wallet',
      content: 'To get started, connect your wallet. This is your identity on CrowdChain, allowing you to fund projects and vote in the DAO.',
    },
    {
      elementSelector: '[data-guide="spotlight"]',
      title: 'Spotlight Projects',
      content: "Here you'll find featured projects that are gaining traction in the community.",
    },
    {
      elementSelector: '[data-guide="all-projects"]',
      title: 'Discover All Projects',
      content: 'Scroll down to explore all active projects. You can search by name or filter by category to find something that interests you.',
    },
    {
      elementSelector: '[data-guide="nav-bar"]',
      title: 'Navigate the App',
      content: 'Use the bottom bar to switch between exploring projects, participating in DAO governance, and viewing your personal dashboard.',
    }
  ],
  project: [
    {
      elementSelector: '[data-guide="project-funding"]',
      title: 'Funding Status',
      content: "Track the project's progress towards its funding goal and see how many days are left to contribute.",
    },
    {
      elementSelector: '[data-guide="fund-button"]',
      title: 'Fund This Project',
      content: 'Like what you see? Click here to contribute funds. Your support helps bring this idea to life!',
    },
    {
      elementSelector: '[data-guide="milestones"]',
      title: 'Milestone-Based Funding',
      content: 'Funds are released to creators as they complete milestones, which are approved by the DAO. This ensures accountability.',
    }
  ],
  dao: [
    {
      elementSelector: '[data-guide="dao-welcome"]',
      title: 'DAO Governance',
      content: "This is the heart of CrowdChain's governance. Here, the community votes on which projects get approved and when milestones are complete.",
    },
    {
      elementSelector: '[data-guide="proposal-section"]',
      title: 'Active Proposals',
      content: 'Each card represents a proposal, either for a new project or a milestone fund release. Review the details before voting.',
    },
    {
      elementSelector: '[data-guide="vote-button"]',
      title: 'Cast Your Vote',
      content: 'Your vote matters! Help decide the future of projects on the platform. This action is irreversible and recorded publicly.',
    }
  ],
  dashboard: [
    {
      elementSelector: '[data-guide="dashboard-welcome"]',
      title: 'Your Dashboard',
      content: "This is your personal hub. Track your investments, manage the projects you've created, and adjust your settings.",
    },
    {
      elementSelector: '[data-guide="dashboard-tabs"]',
      title: 'Your Activity',
      content: "Switch between tabs to see the projects you've funded and the ones you've created.",
    }
  ]
};