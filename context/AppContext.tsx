import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Project, Proposal, User, ProjectCategory, Milestone, WaitlistEntry, ContactMessage } from './types';
import { db } from '../services/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, increment, getDoc, setDoc, runTransaction, arrayUnion, serverTimestamp, query, orderBy, writeBatch } from "firebase/firestore";
import { ethers } from "ethers";
import CrowdChainABI from "../smart-contract/artifacts/contracts/CrowdChain.sol/CrowdChain.json";

const CROWDCHAIN_CONTRACT_ADDRESS = "0x01525fD607fd12dDBdFb99102Af955a618EBaE21";

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
  isGetStartedModalOpen: boolean;
  isLoginModalOpen: boolean;
  openGetStartedModal: () => void;
  closeGetStartedModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
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
const ADMIN_WALLETS = ['0xf68f2973d5347a8a27Ee3be0618c37b52c846D50'];

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
  const [crowdChainContract, setCrowdChainContract] = useState<ethers.Contract | null>(null);
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const addSuperAdmin = async () => {
        const superAdminAddress = '0xf68f2973d5347a8a27ee3be0618c37b52c846d50';
        const superAdminRef = doc(db, "superAdmins", superAdminAddress.toLowerCase());
        const superAdminSnap = await getDoc(superAdminRef);
        if (!superAdminSnap.exists()) {
            await setDoc(superAdminRef, { isSuperAdmin: true });
            console.log("Super admin created.");
        }
    };
    addSuperAdmin();
  }, []);

  const openGetStartedModal = () => {
    console.log('openGetStartedModal called');
    setIsGetStartedModalOpen(true);
  }
  const closeGetStartedModal = () => setIsGetStartedModalOpen(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  useEffect(() => {
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      provider.getSigner().then(signer => {
        const contract = new ethers.Contract(CROWDCHAIN_CONTRACT_ADDRESS, CrowdChainABI.abi, signer);
        setCrowdChainContract(contract);
      });
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribeProjects = onSnapshot(collection(db, "projects"), async (snapshot) => {
      const firebaseProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      if (crowdChainContract) {
        const mergedProjects = await Promise.all(firebaseProjects.map(async (project) => {
          try {
            const onChainProject = await crowdChainContract.projects(project.id);
            
            // Map ProjectState enum to frontend daoStatus
            let daoStatus: Project['daoStatus'];
            switch (onChainProject.state) {
              case 0: // Fundraising
                daoStatus = 'Pending'; // Or a more appropriate status if available
                break;
              case 1: // Expired
                daoStatus = 'Rejected'; // Or a more appropriate status
                break;
              case 2: // Successful
                daoStatus = 'Approved';
                break;
              default:
                daoStatus = 'Pending';
            }

            // Merge on-chain milestone data
            const mergedMilestones = project.milestones.map((milestone, index) => {
              const onChainMilestone = onChainProject.milestones[index]; // Assuming direct index mapping
              return {
                ...milestone,
                state: onChainMilestone.state, // Update milestone state
                yesVotes: Number(onChainMilestone.yesVotes), // Update votes
              };
            });

            return {
              ...project,
              amountRaised: Number(ethers.formatEther(onChainProject.amountRaised)), // Convert from Wei to Ether
              daoStatus: daoStatus, // Update project state from on-chain
              milestones: mergedMilestones,
            };
          } catch (e) {
            console.error(`Error fetching on-chain data for project ${project.id}:`, e);
            return project; // Return original project if on-chain fetch fails
          }
        }));
        setProjects(mergedProjects);
      } else {
        setProjects(firebaseProjects);
      }
      setIsLoading(false);
    });

    const unsubscribeProposals = onSnapshot(collection(db, "proposals"), (snapshot) => {
      const proposalList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
      setProposals(proposalList);
    });

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ walletAddress: doc.id, ...doc.data() } as User));
        setAllUsers(usersList);
    });

    const unsubscribeWaitlist = onSnapshot(collection(db, "waitlist"), (snapshot) => {
        const waitlistList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaitlistEntry));
        setWaitlist(waitlistList);
    });

    const unsubscribeContacts = onSnapshot(collection(db, "contacts"), (snapshot) => {
        const contactList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
        setContactMessages(contactList);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeProposals();
      unsubscribeUsers();
      unsubscribeWaitlist();
      unsubscribeContacts();
    };
  }, [crowdChainContract]);

  const addToast = (message: string, type: Toast['type']) => {
      const id = Date.now();
      setToasts(prevToasts => {
          const recentMessages = prevToasts.slice(-5).map(t => t.message);
          if (recentMessages.includes(message)) {
              return prevToasts;
          }
          return [...prevToasts, { id, message, type }];
      });
  };

  const removeToast = (id: number) => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      addToast('Please install a web3 wallet to continue.', 'info');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        addToast('No accounts found. Please create an account in your wallet.', 'info');
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
            addToast('Please add Base Sepolia to your wallet.', 'info');
          } else {
            addToast('Could not switch to Base Sepolia. Please do it manually in your wallet.', 'info');
          }
          return;
        }
      }

      const walletAddress = accounts[0].toLowerCase();
      const userRef = doc(db, "users", walletAddress);
      const userSnap = await getDoc(userRef);

      const isAdmin = ADMIN_WALLETS.includes(walletAddress);

      if (userSnap.exists()) {
          const userData = userSnap.data();
          const updatedUser: User = {
              walletAddress,
              ...userData,
              role: isAdmin ? 'admin' : (userData.role || 'investor'),
              status: userData.status || 'Active',
          };
          setUser(updatedUser);
          await setDoc(userRef, updatedUser, { merge: true });
      } else {
          const newUser: User = {
              walletAddress,
              username: '',
              avatar: '',
              bio: '',
              twitter: '',
              website: '',
              status: 'Active',
              createdProjectIds: [],
              fundedProjects: [],
              role: isAdmin ? 'admin' : 'investor',
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
      }
      
      localStorage.setItem('walletAddress', walletAddress);
      addToast(isAdmin ? 'Admin wallet connected!' : 'Wallet connected!', 'success');
      getAllUsers();

    } catch (error: any) {
        if (error.code === 4001) {
            addToast('You rejected the connection request. Please connect your wallet to continue.', 'info');
        } else if (error.code === -32002) {
            addToast('Connection request already pending. Please check your wallet.', 'info');
        } else {
            console.error('Failed to connect wallet:', error);
            addToast('An unexpected error occurred. Please try again.', 'error');
        }
    }
  };
  
  const setUserAsCreator = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.walletAddress.toLowerCase());
    const updatedUser = { ...user, role: 'creator' as const };
    setUser(updatedUser);
    await updateDoc(userRef, { role: 'creator' });
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

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        logout();
      } else if (user && accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
        await connectWallet();
      } else if (!user && accounts.length > 0) {
        await connectWallet();
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

  const fundProject = async (projectId: string, amount: number) => {
    if (!user) return;
    if (!crowdChainContract) {
        addToast("Blockchain contract not loaded.", 'error');
        return;
    }

    try {
        const tx = await crowdChainContract.fundProject(projectId, { value: ethers.parseEther(amount.toString()) });
        await tx.wait();

        // --- Firebase Update (for UI purposes) ---
        const projectRef = doc(db, "projects", projectId);
        const userRef = doc(db, "users", user.walletAddress.toLowerCase());
        
        await updateDoc(projectRef, {
            amountRaised: increment(amount),
            backers: arrayUnion(user.walletAddress.toLowerCase())
        });
        
        const existingFundingIndex = user.fundedProjects.findIndex(fp => fp.projectId === projectId);
        let updatedFundedProjects;
        if (existingFundingIndex > -1) {
            updatedFundedProjects = [...user.fundedProjects];
            updatedFundedProjects[existingFundingIndex].amount += amount;
        } else {
            updatedFundedProjects = [...user.fundedProjects, {projectId, amount}];
        }
        await updateDoc(userRef, { fundedProjects: updatedFundedProjects });
        // --- End Firebase Update ---

        addToast(`Successfully funded with ${amount}!`, 'success');
    } catch (e) {
        console.error("Error funding project: ", e);
        addToast('Failed to fund project.', 'error');
    }
  };

  const voteOnProposal = async (proposalId: string, voteType: 'for' | 'against') => {
    if (!user) {
        addToast("Please connect your wallet to vote.", 'error');
        return;
    }
    if (!crowdChainContract) {
        addToast("Blockchain contract not loaded.", 'error');
        return;
    }

    const proposalRef = doc(db, "proposals", proposalId);

    try {
        const proposalDoc = await getDoc(proposalRef);
        if (!proposalDoc.exists()) {
            addToast("Proposal does not exist!", 'error');
            return;
        }
        const proposalData = proposalDoc.data();
        const projectId = proposalData.projectId;
        const milestoneId = proposalData.milestoneId; // Assuming milestoneId is stored in the proposal

        const isFunder = user.fundedProjects.some(p => p.projectId === projectId);
        if (!isFunder) {
            addToast("Only backers of this project can vote on its proposals.", 'error');
            return;
        }

        if (proposalData.votedBy && proposalData.votedBy.includes(user.walletAddress)) {
            addToast("You have already voted on this proposal.", 'error');
            return;
        }

        const vote = voteType === 'for' ? true : false;

        const tx = await crowdChainContract.voteOnMilestone(projectId, milestoneId, vote);
        await tx.wait();

        // --- Firebase Update (for UI purposes) ---
        await runTransaction(db, async (transaction) => {
            const currentProposalDoc = await transaction.get(proposalRef);
            if (!currentProposalDoc.exists()) {
                throw "Proposal does not exist!";
            }

            const currentProposalData = currentProposalDoc.data();
            const updateData: any = {
                votedBy: arrayUnion(user.walletAddress)
            };

            if (voteType === 'for') {
                updateData.votesFor = increment(1);
            } else {
                updateData.votesAgainst = increment(1);
            }

            transaction.update(proposalRef, updateData);
        });
        // --- End Firebase Update ---

        addToast('Your vote has been cast!', 'success');
    } catch (e: any) {
        console.error("Error voting on proposal: ", e);
        const errorMessage = typeof e === 'string' ? e : 'Failed to cast vote.';
        addToast(errorMessage, 'error');
    }
  };
  
  const updateMilestoneStatus = async (projectId: string, milestoneId: number, status: 'Pending' | 'In Review' | 'Complete', proof?: string) => {
    const projectRef = doc(db, "projects", projectId);
    try {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const newMilestones = project.milestones.map(m => {
            if (m.id === milestoneId) {
                const updatedMilestone: Milestone = { ...m, status };
                if (proof) {
                   updatedMilestone.proof = proof;
                }
                return updatedMilestone;
            }
            return m;
        });

        await updateDoc(projectRef, { milestones: newMilestones });

        if (status === 'In Review') {
            addToast('Milestone submitted for DAO review.', 'info');
        }
    } catch (e) {
        console.error("Error updating milestone: ", e);
        addToast('Failed to update milestone.', 'error');
    }
  };

  const createProject = async (projectData: GeneratedProjectData) => {
    if (!user) {
        addToast("Connect your wallet to create a project.", 'error');
        return;
    }
    if (!crowdChainContract) {
        addToast("Blockchain contract not loaded.", 'error');
        return;
    }

    try {
        const fundingGoal = projectData.milestones.reduce((sum, m) => sum + m.fundsRequired, 0);
        const milestoneDescriptions = projectData.milestones.map(m => m.description);
        const milestoneFunds = projectData.milestones.map(m => m.fundsRequired);
        const deadline = Math.floor(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime() / 1000); // 30 days from now in seconds

        const tx = await crowdChainContract.createProject(
            projectData.name,
            projectData.description,
            fundingGoal,
            deadline,
            milestoneDescriptions,
            milestoneFunds
        );
        await tx.wait();

        // --- Firebase Update (for UI purposes, can be removed if fetching directly from blockchain) ---
        const projectPayload = {
            name: projectData.name,
            creator: user.username || user.walletAddress,
            creatorWallet: user.walletAddress,
            image: `https://picsum.photos/seed/${Date.now()}/800/600`, // Placeholder image
            description: projectData.description,
            category: projectData.category,
            fundingGoal: fundingGoal,
            amountRaised: 0,
            deadline: new Date(deadline * 1000).toISOString(), // Convert back to ISO string for Firebase
            milestones: projectData.milestones.map((m, index) => ({
                id: index + 1,
                title: m.title,
                description: m.description,
                fundsRequired: m.fundsRequired,
                status: 'Pending',
            })),
            daoStatus: 'Pending',
            updates: [],
            backers: [],
        };

        const projectDocRef = await addDoc(collection(db, "projects"), projectPayload);

        await addDoc(collection(db, "proposals"), {
            projectId: projectDocRef.id,
            projectName: projectData.name,
            type: 'New Project',
            description: `Proposal to approve the new project: "${projectData.name}".`,
            votesFor: 0,
            votesAgainst: 0,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

        const userRef = doc(db, "users", user.walletAddress.toLowerCase());
        const updatedCreatedProjectIds = [...user.createdProjectIds, projectDocRef.id];
        await updateDoc(userRef, { createdProjectIds: updatedCreatedProjectIds });
        // --- End Firebase Update ---

        addToast('Project submitted to DAO for review!', 'success');
    } catch (e) {
        console.error("Error creating project: ", e);
        addToast('Failed to create project.', 'error');
    }
  };

  const updateUserProfile = async (profileData: Partial<Pick<User, 'username' | 'avatar' | 'bio' | 'twitter' | 'website'>>) => {
    if (!user) return;
    const userRef = doc(db, "users", user.walletAddress.toLowerCase());
    try {
        const cleanedProfileData = Object.fromEntries(
            Object.entries(profileData).filter(([, value]) => value !== undefined)
        );

        if (Object.keys(cleanedProfileData).length === 0) {
            addToast('No changes to save.', 'info');
            return;
        }

        await setDoc(userRef, cleanedProfileData, { merge: true });
        addToast('Profile updated successfully!', 'success');
    } catch (e) {
        console.error("Error updating profile: ", e);
        addToast('Failed to update profile.', 'error');
    }
  };
  
  const getUserProfileByWallet = (walletAddress: string): User | null => {
    if (!walletAddress) return null;
    return allUsers.find(user => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()) || null;
  };

  const addWaitlistEntry = async (email: string) => {
    try {
        await addDoc(collection(db, "waitlist"), {
            email: email,
            createdAt: serverTimestamp()
        });
        addToast('Successfully joined waitlist!', 'success');
    } catch (e) {
        console.error("Error adding to waitlist: ", e);
        addToast('Failed to join waitlist.', 'error');
    }
  };
  
  const addContactMessage = async (name: string, email: string, message: string) => {
    try {
        await addDoc(collection(db, "contacts"), {
            name: name,
            email: email,
            message: message,
            createdAt: serverTimestamp()
        });
        addToast('Message sent successfully!', 'success');
    } catch (e) {
        console.error("Error sending contact message: ", e);
        addToast('Failed to send message.', 'error');
    }
  };
  
  const suspendUser = async (walletAddress: string) => {
    const userRef = doc(db, "users", walletAddress.toLowerCase());
    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().role !== 'admin') {
            await updateDoc(userRef, { status: 'Suspended' });
            addToast('User has been suspended.', 'success');
        } else {
            addToast('Cannot suspend an admin or non-existent user.', 'error');
        }
    } catch (e) {
        console.error("Error suspending user: ", e);
        addToast('Failed to suspend user.', 'error');
    }
  };
  
  const reinstateUser = async (walletAddress: string) => {
      const userRef = doc(db, "users", walletAddress.toLowerCase());
      try {
          await updateDoc(userRef, { status: 'Active' });
          addToast('User has been reinstated.', 'success');
      } catch (e) {
          console.error("Error reinstating user: ", e);
          addToast('Failed to reinstate user.', 'error');
      }
  };

  const deleteUser = async (walletAddress: string) => {
    const userRef = doc(db, "users", walletAddress.toLowerCase());
    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().role !== 'admin') {
            await deleteDoc(userRef);
            addToast('User has been deleted.', 'success');
        } else {
            addToast('Cannot delete an admin or non-existent user.', 'error');
        }
    } catch (e) {
        console.error("Error deleting user: ", e);
        addToast('Failed to delete user.', 'error');
    }
  };

  const updateProjectDaoStatus = async (projectId: string, status: 'Approved' | 'Rejected') => {
      const projectRef = doc(db, "projects", projectId);
      try {
          await updateDoc(projectRef, { daoStatus: status });
          addToast(`Project status updated to ${status}.`, 'success');
      } catch (e) {
          console.error("Error updating project DAO status: ", e);
          addToast('Failed to update project status.', 'error');
      }
  };

  const updateUserRole = async (walletAddress: string, role: 'creator' | 'investor') => {
    const userRef = doc(db, "users", walletAddress.toLowerCase());
    try {
        await updateDoc(userRef, { role: role });
        addToast('User role updated successfully.', 'success');
    } catch (e) {
        console.error("Error updating user role: ", e);
        addToast('Failed to update user role.', 'error');
    }
  };

  const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({ walletAddress: doc.id, ...doc.data() } as User));
        setAllUsers(usersList);
    } catch (e) {
        console.error("Error getting all users: ", e);
    }
  };

  return (
    <AppContext.Provider value={{ projects, proposals, user, allUsers, waitlist, contactMessages, theme, toasts, isLoading, isGetStartedModalOpen, openGetStartedModal, closeGetStartedModal, isLoginModalOpen, openLoginModal, closeLoginModal, addToast, removeToast, login: connectWallet, logout, toggleTheme, fundProject, voteOnProposal, updateMilestoneStatus, createProject, updateUserProfile, setUserAsCreator, addWaitlistEntry, addContactMessage, suspendUser, reinstateUser, deleteUser, truncateAddress, getUserProfileByWallet, updateProjectDaoStatus, updateUserRole }}>
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