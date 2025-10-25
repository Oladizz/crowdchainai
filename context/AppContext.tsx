import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Project, Proposal, User, ProjectCategory, Milestone, WaitlistEntry, ContactMessage } from './types';

interface GeneratedProjectData {
    name: string;
    description: string;
    category: ProjectCategory;
    milestones: {
        title: string;
        description: string;
        fundsRequired: number;
    }[];
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
  projects: Project[];
  proposals: Proposal[];
  user: User | null;
  allUsers: User[];
  waitlist: WaitlistEntry[];
  contactMessages: ContactMessage[];
  theme: 'dark' | 'light';
  toasts: Toast[];
  isLoading: boolean;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: number) => void;
  login: () => void;
  logout: () => void;
  toggleTheme: () => void;
  fundProject: (projectId: string, amount: number) => void;
  voteOnProposal: (proposalId: string, voteType: 'for' | 'against') => void;
  updateMilestoneStatus: (projectId: string, milestoneId: number, status: 'Pending' | 'In Review' | 'Complete', proof?: string) => void;
  createProject: (projectData: GeneratedProjectData) => void;
  updateUserProfile: (profileData: Partial<Pick<User, 'username' | 'avatar' | 'bio' | 'twitter' | 'website'>>) => void;
  setUserAsCreator: () => void;
  addWaitlistEntry: (email: string) => void;
  addContactMessage: (name: string, email: string, message: string) => void;
  suspendUser: (walletAddress: string) => void;
  reinstateUser: (walletAddress: string) => void;
  deleteUser: (walletAddress: string) => void;
  truncateAddress: (address: string) => string;
  getUserProfileByWallet: (walletAddress: string) => User | null;
  updateProjectDaoStatus: (projectId: string, status: 'Approved' | 'Rejected') => void;
  updateUserRole: (walletAddress: string, role: 'creator' | 'investor') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532 in hex
// NOTE: For demonstration purposes, this wallet is designated as an admin.
const ADMIN_WALLETS = ['0x1234567890123456789012345678901234567890'];

const MOCK_PROJECTS: Project[] = [
    { id: '1', name: 'Decentralized AI Art Generator', creator: 'AI Art Collective', creatorWallet: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', image: 'https://picsum.photos/seed/1/800/600', description: 'An open-source, community-governed AI that creates unique art based on textual prompts. All generated art is minted as an NFT, with royalties shared among DAO members.', category: ProjectCategory.ART, fundingGoal: 50000, amountRaised: 35000, deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), milestones: [ { id: 1, title: 'Model Development', description: 'Train the core AI model.', fundsRequired: 20000, status: 'Complete', proof: '#' }, { id: 2, title: 'Frontend Interface', description: 'Build a user-friendly web interface.', fundsRequired: 15000, status: 'In Review' }, { id: 3, title: 'NFT Minting Contract', description: 'Deploy the smart contract for NFT minting.', fundsRequired: 15000, status: 'Pending' }, ], daoStatus: 'Approved', updates: [{ date: new Date().toISOString(), message: 'Milestone 1 completed ahead of schedule!' }], },
    { id: '2', name: 'GameChain: A Web3 Gaming Platform', creator: 'Pixel Pioneers', creatorWallet: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u', image: 'https://picsum.photos/seed/2/800/600', description: 'A platform for indie game developers to launch and monetize their games using blockchain technology. Features include player-owned assets and a decentralized game economy.', category: ProjectCategory.GAMING, fundingGoal: 100000, amountRaised: 85000, deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), milestones: [ { id: 1, title: 'Platform Alpha', description: 'Core infrastructure and SDK for developers.', fundsRequired: 40000, status: 'Complete' }, { id: 2, title: 'Marketplace Beta', description: 'Launch the in-game asset marketplace.', fundsRequired: 30000, status: 'In Review' }, { id: 3, title: 'Public Launch', description: 'Full public release and marketing campaign.', fundsRequired: 30000, status: 'Pending' }, ], daoStatus: 'Approved', updates: [{ date: new Date().toISOString(), message: 'Alpha SDK released to early partners.' }], },
    { id: '3', name: 'DeSci Protocol for Research Funding', creator: 'LabRats DAO', creatorWallet: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v', image: 'https://picsum.photos/seed/3/800/600', description: 'A decentralized protocol to fund and publish scientific research. Aims to combat censorship and biases in traditional academic publishing.', category: ProjectCategory.SCIENCE, fundingGoal: 75000, amountRaised: 25000, deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), milestones: [ { id: 1, title: 'Protocol Whitepaper', description: 'Publish detailed technical whitepaper.', fundsRequired: 10000, status: 'Complete' }, { id: 2, title: 'Testnet Launch', description: 'Deploy the protocol on a public testnet.', fundsRequired: 35000, status: 'Pending' }, { id: 3, title: 'Mainnet Launch', description: 'Full mainnet deployment.', fundsRequired: 30000, status: 'Pending' }, ], daoStatus: 'Approved', updates: [], },
    { id: '4', name: 'Carbon Negative Blockchain Initiative', creator: 'EcoWarriors', creatorWallet: '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w', image: 'https://picsum.photos/seed/4/800/600', description: 'A new layer-1 blockchain designed to be carbon negative by directly funding and integrating with renewable energy projects.', category: ProjectCategory.TECH, fundingGoal: 250000, amountRaised: 120000, deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), milestones: [ { id: 1, title: 'Consensus Model Design', description: 'Finalize the novel proof-of-stake consensus algorithm.', fundsRequired: 100000, status: 'Pending' }, { id: 2, title: 'Alphanet Release', description: 'Internal testing network for core features.', fundsRequired: 150000, status: 'Pending' }, ], daoStatus: 'Approved', updates: [], },
    { id: '5', name: 'Project Pending Approval', creator: 'Future Vision', creatorWallet: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x', image: 'https://picsum.photos/seed/5/800/600', description: 'A very cool project that is currently waiting for the DAO to approve it for funding.', category: ProjectCategory.COMMUNITY, fundingGoal: 10000, amountRaised: 0, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), milestones: [ { id: 1, title: 'Initial Setup', description: 'Get the project off the ground.', fundsRequired: 10000, status: 'Pending' } ], daoStatus: 'Pending', updates: [], },
];

const MOCK_PROPOSALS: Proposal[] = [
    { id: 'p1', projectId: '5', projectName: 'Project Pending Approval', type: 'New Project', description: 'Proposal to approve the new community project "Project Pending Approval".', votesFor: 120, votesAgainst: 15, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'p2', projectId: '2', projectName: 'GameChain: A Web3 Gaming Platform', type: 'Milestone Release', description: 'Request to release funds for the "Marketplace Beta" milestone.', votesFor: 250, votesAgainst: 5, deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
];


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Load initial data from localStorage
    const savedWaitlist = localStorage.getItem('waitlist');
    if (savedWaitlist) setWaitlist(JSON.parse(savedWaitlist));
    
    const savedContacts = localStorage.getItem('contactMessages');
    if (savedContacts) setContactMessages(JSON.parse(savedContacts));

    // Simulate data fetching
    const timer = setTimeout(() => {
        setProjects(MOCK_PROJECTS);
        setProposals(MOCK_PROPOSALS);
        setIsLoading(false);
    }, 1500);

    getAllUsers();
    
    return () => clearTimeout(timer);
  }, []);

  const addToast = (message: string, type: Toast['type']) => {
      const id = Date.now();
      setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: number) => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      addToast('Please install a web3 wallet!', 'error');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        addToast('No accounts found.', 'error');
        return;
      }
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            addToast('Please add Base Sepolia to your wallet.', 'error');
          } else {
            addToast('Failed to switch to Base Sepolia.', 'error');
          }
          return;
        }
      }

      const walletAddress = accounts[0];
      // FIX: Type savedProfile as Partial<User> to allow accessing optional properties like 'role' and 'status'.
      let savedProfile: Partial<User> = getUserProfileByWallet(walletAddress) || {};
      
      const isAdmin = ADMIN_WALLETS.includes(walletAddress.toLowerCase());

      if (!savedProfile.role) {
        savedProfile.role = isAdmin ? 'admin' : 'investor';
      } else if (isAdmin) {
        savedProfile.role = 'admin';
      }
      
      if (!savedProfile.status) {
          savedProfile.status = 'Active';
      }

      const newUser: User = {
        walletAddress,
        createdProjectIds: [], // In real app, this would be fetched
        fundedProjects: [], // In real app, this would be fetched
        ...savedProfile,
      };

      setUser(newUser);
      
      localStorage.setItem(`user_profile_${walletAddress.toLowerCase()}`, JSON.stringify(newUser));
      localStorage.setItem('walletAddress', walletAddress);
      addToast(isAdmin ? 'Admin wallet connected!' : 'Wallet connected!', 'success');
      getAllUsers();

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      addToast('Failed to connect wallet.', 'error');
    }
  };
  
  const setUserAsCreator = () => {
    if (!user) return;
    const updatedUser = { ...user, role: 'creator' as const };
    setUser(updatedUser);
    localStorage.setItem(`user_profile_${updatedUser.walletAddress.toLowerCase()}`, JSON.stringify(updatedUser));
    addToast('Your creator account is set up!', 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('walletAddress');
    addToast('Wallet disconnected.', 'info');
  };

  useEffect(() => {
    const autoConnect = async () => {
        if ((window as any).ethereum && localStorage.getItem('walletAddress')) {
            await connectWallet();
        }
    };
    autoConnect();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        logout();
      } else if (user && accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      return () => {
        (window as any).ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const fundProject = (projectId: string, amount: number) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, amountRaised: p.amountRaised + amount } : p
      )
    );
    if (user) {
        const existingFunding = user.fundedProjects.find(fp => fp.projectId === projectId);
        if (existingFunding) {
            const updatedFundedProjects = user.fundedProjects.map(fp => fp.projectId === projectId ? {...fp, amount: fp.amount + amount} : fp);
            setUser({...user, fundedProjects: updatedFundedProjects});
        } else {
            setUser({...user, fundedProjects: [...user.fundedProjects, {projectId, amount}]});
        }
    }
    addToast(`Successfully funded with $${amount}!`, 'success');
  };

  const voteOnProposal = (proposalId: string, voteType: 'for' | 'against') => {
    setProposals(prevProposals =>
      prevProposals.map(p => {
        if (p.id === proposalId) {
          return voteType === 'for'
            ? { ...p, votesFor: p.votesFor + 1 } 
            : { ...p, votesAgainst: p.votesAgainst + 1 };
        }
        return p;
      })
    );
    addToast('Your vote has been cast!', 'success');
  };
  
  const updateMilestoneStatus = (projectId: string, milestoneId: number, status: 'Pending' | 'In Review' | 'Complete', proof?: string) => {
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                milestones: p.milestones.map(m => {
                    if (m.id === milestoneId) {
                        const updatedMilestone: Milestone = { ...m, status };
                        if (proof) {
                           updatedMilestone.proof = proof;
                        }
                        return updatedMilestone;
                    }
                    return m;
                })
            }
        }
        return p;
    }));
    if (status === 'In Review') {
        addToast('Milestone submitted for DAO review.', 'info');
    }
  };

  const createProject = (projectData: GeneratedProjectData) => {
    if (!user) {
        addToast("Connect your wallet to create a project.", 'error');
        return;
    }
    const newProjectId = (projects.length + 1 + Date.now()).toString();
    const fundingGoal = projectData.milestones.reduce((sum, m) => sum + m.fundsRequired, 0);
    const newProject: Project = {
        id: newProjectId,
        name: projectData.name,
        creator: user.username || user.walletAddress,
        creatorWallet: user.walletAddress,
        image: `https://picsum.photos/seed/${newProjectId}/800/600`,
        description: projectData.description,
        category: projectData.category,
        fundingGoal: fundingGoal,
        amountRaised: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: projectData.milestones.map((m, index) => ({
            id: index + 1,
            title: m.title,
            description: m.description,
            fundsRequired: m.fundsRequired,
            status: 'Pending',
        })),
        daoStatus: 'Pending',
        updates: [],
    };
    const newProposal: Proposal = {
        id: `p${proposals.length + 1 + Date.now()}`,
        projectId: newProjectId,
        projectName: newProject.name,
        type: 'New Project',
        description: `Proposal to approve the new project: "${newProject.name}".`,
        votesFor: 0,
        votesAgainst: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
    setProposals(prevProposals => [newProposal, ...prevProposals]);
    setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, createdProjectIds: [...prevUser.createdProjectIds, newProjectId] };
    });
    addToast('Project submitted to DAO for review!', 'success');
  };

  const updateUserProfile = (profileData: Partial<Pick<User, 'username' | 'avatar' | 'bio' | 'twitter' | 'website'>>) => {
    if (!user) return;
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...profileData };
        localStorage.setItem(`user_profile_${updatedUser.walletAddress.toLowerCase()}`, JSON.stringify(updatedUser));
        return updatedUser;
    });
    addToast('Profile updated successfully!', 'success');
  };
  
  const getUserProfileByWallet = (walletAddress: string): User | null => {
    if (!walletAddress) return null;
    const savedProfileJSON = localStorage.getItem(`user_profile_${walletAddress.toLowerCase()}`);
    if (!savedProfileJSON) return null;
    return JSON.parse(savedProfileJSON);
  };

  const addWaitlistEntry = (email: string) => {
    const newEntry = { email, date: new Date().toLocaleString() };
    const updatedWaitlist = [...waitlist, newEntry];
    setWaitlist(updatedWaitlist);
    localStorage.setItem('waitlist', JSON.stringify(updatedWaitlist));
  };
  
  const addContactMessage = (name: string, email: string, message: string) => {
    const newMessage = { name, email, message, date: new Date().toLocaleString() };
    const updatedMessages = [...contactMessages, newMessage];
    setContactMessages(updatedMessages);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
  };
  
  const suspendUser = (walletAddress: string) => {
    const profile = getUserProfileByWallet(walletAddress);
    if (profile && profile.role !== 'admin') {
        profile.status = 'Suspended';
        localStorage.setItem(`user_profile_${walletAddress.toLowerCase()}`, JSON.stringify(profile));
        getAllUsers();
        addToast('User has been suspended.', 'success');
    } else {
        addToast('Cannot suspend an admin.', 'error');
    }
  };
  
  const reinstateUser = (walletAddress: string) => {
      const profile = getUserProfileByWallet(walletAddress);
      if (profile) {
          profile.status = 'Active';
          localStorage.setItem(`user_profile_${walletAddress.toLowerCase()}`, JSON.stringify(profile));
          getAllUsers();
          addToast('User has been reinstated.', 'success');
      }
  };

  const deleteUser = (walletAddress: string) => {
    const profile = getUserProfileByWallet(walletAddress);
    if (profile && profile.role !== 'admin') {
      localStorage.removeItem(`user_profile_${walletAddress.toLowerCase()}`);
      getAllUsers();
      addToast('User has been deleted.', 'success');
    } else {
      addToast('Cannot delete an admin.', 'error');
    }
  };

  const updateProjectDaoStatus = (projectId: string, status: 'Approved' | 'Rejected') => {
      setProjects(prev => prev.map(p => p.id === projectId ? {...p, daoStatus: status} : p));
      addToast(`Project status updated to ${status}.`, 'success');
  };

  const updateUserRole = (walletAddress: string, role: 'creator' | 'investor') => {
    const profile = getUserProfileByWallet(walletAddress);
    if (profile) {
        profile.role = role;
        localStorage.setItem(`user_profile_${walletAddress.toLowerCase()}`, JSON.stringify(profile));
        getAllUsers();
        addToast('User role updated successfully.', 'success');
    }
  };

  const getAllUsers = () => {
    const users: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_profile_')) {
            const profileData = JSON.parse(localStorage.getItem(key) as string);
            users.push(profileData);
        }
    }
    setAllUsers(users);
  };

  return (
    <AppContext.Provider value={{ projects, proposals, user, allUsers, waitlist, contactMessages, theme, toasts, isLoading, addToast, removeToast, login: connectWallet, logout, toggleTheme, fundProject, voteOnProposal, updateMilestoneStatus, createProject, updateUserProfile, setUserAsCreator, addWaitlistEntry, addContactMessage, suspendUser, reinstateUser, deleteUser, truncateAddress, getUserProfileByWallet, updateProjectDaoStatus, updateUserRole }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};