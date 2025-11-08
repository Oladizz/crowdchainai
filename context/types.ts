export enum ProjectCategory {
  TECH = 'Technology',
  ART = 'Art',
  GAMING = 'Gaming',
  COMMUNITY = 'Community',
  SCIENCE = 'Science'
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  fundsRequired: number;
  status: 'Pending' | 'In Review' | 'Complete';
  proof?: string;
  yesVotes?: number;
}

export interface Project {
  id: string;
  name: string;
  name_lowercase?: string;
  creator: string;
  creatorWallet: string;
  image: string;
  description: string;
  category: ProjectCategory;
  fundingGoal: number;
  amountRaised: number;
  deadline: string;
  milestones: Milestone[];
  daoStatus: 'Pending' | 'Approved' | 'Rejected';
  updates: { date: string; message: string }[];
}

export interface Proposal {
  id: string;
  projectId: string;
  projectName: string;
  type: 'New Project' | 'Milestone Release';
  description: string;
  votesFor: number;
  votesAgainst: number;
  deadline: string;
  milestoneId?: number;
}

export interface User {
  walletAddress: string;
  username?: string;
  username_lowercase?: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  website?: string;
  status?: 'Active' | 'Suspended';
  createdProjectIds: string[];
  fundedProjects: { projectId: string; amount: number }[];
  role?: 'creator' | 'investor' | 'admin' | 'premium';
  isSuperAdmin?: boolean;
}

export interface WaitlistEntry {
  email: string;
  date: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  date: string;
}

export interface Report {
  id?: string;
  type: 'project' | 'user';
  reportedId: string;
  reporterId: string;
  reason: string;
  timestamp: any; // serverTimestamp
}
