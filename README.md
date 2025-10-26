
![crowdchain](https://i.postimg.cc/RVSP1wh3/Crowd-logo.png)

# CrowdChain

"Building the next generation of crowdfunding — decentralized, intelligent, unstoppable."

Decentralized crowdfunding reinvented — combining blockchain transparency, AI-driven project analysis, and secure identity verification to build trust between creators and backers.

---

## Overview

CrowdChain is a next-generation crowdfunding platform that uses a hybrid architecture: Firebase for fast, off-chain storage of static project data, and an Ethereum Layer‑2 smart contract for verifiable, on‑chain recording of funds, votes, and milestone releases. An integrated AI layer evaluates proposals before they go live, while passkey and KYC flows help ensure participant authenticity.

Key goals:
- Ensure funds are used as promised via milestone-based disbursements.
- Reduce fraud and surface high-quality projects with AI review.
- Provide backers with transparent, auditable fund flow.

---

## Core Features

- Project creation: Creators publish campaigns with rich metadata (media, goals, milestones). Static content lives in Firebase; funding and dynamic state are on-chain.
- Milestone voting: Backers vote on milestone approval. Milestone results are recorded on-chain and determine fund releases.
- AI project analysis: Pre-flight checks evaluate proposal quality, credibility, and risk to help surface promising campaigns.
- Hybrid data model: Firebase for static content and fast queries; smart contracts for funds, votes, and irreversible audit trails.
- Secure onboarding: Passkey authentication and optional KYC for higher trust.
- Real-time transparency: Every contribution, vote, and payout is traceable on-chain.

---

## Architecture

- Frontend: React + TypeScript + Vite  
- Backend: Node.js + Firebase (Auth, Firestore, Storage)  
- Blockchain: Solidity smart contracts, Ethers.js, deployed to an L2 (Base)  
- AI: Google Gemini or custom AI integration for proposal scoring  
- Hosting: Render / Vercel

Data flow:
1. Creators submit project details → saved in Firebase (Firestore + Storage).
2. Funding, votes, and milestone statuses → managed by the smart contract on-chain.
3. Frontend merges both sources to show a unified, real-time view.

---

## Smart Contract Model

- Each campaign is a Project identified by projectId.
- A Project is split into ordered Milestones (indexed by milestoneIndex).
- Funding is contributed to the Project on-chain.
- Milestone progression requires community approval via voteOnMilestone:
  - _voteType_ = true => approval
  - _voteType_ = false => rejection
- Funds are released only when milestone approval criteria are met, ensuring accountability.

---

## User Flow

1. Discover projects and read AI-backed analysis.
2. Create and submit a campaign (KYC optional/required depending on policy).
3. Backers fund projects on-chain.
4. Projects deliver milestones; backers vote to approve.
5. Approved milestones release the next tranche of funds.

---

## Security & Trust

- Decentralized voting controls milestone releases.
- On-chain logging of contributions, votes, and disbursements.
- AI proposal screening to reduce low-quality or fraudulent campaigns.
- Passkey authentication to improve account security and reduce credential theft.

---

## Tech Stack (at-a-glance)

| Layer           | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React, TypeScript, Vite              |
| Backend        | Node.js, Firebase                    |
| Blockchain     | Solidity, Ethers.js (Layer 2 - Base) |
| Database       | Firebase Firestore                   |
| Auth           | Passkey + Third‑party KYC            |
| AI             | Google Gemini / Custom API           |
| Hosting        | Render / Vercel                      |

---

## Socials

Stay connected and get updates:

- X (formerly Twitter): https://x.com/crowdchainDapp
- Telegram: https://t.me/+Rkph17__oXw2OGU0

Follow us for product updates, community discussions, and support.

---

## Run Locally

Prerequisites:
- Node.js (recommended latest LTS)

Steps:
1. Clone the repo and install dependencies:
   npm install
2. Create a local env file (e.g., .env.local) and add keys:
   - GEMINI_API_KEY=your_gemini_api_key
   - FIREBASE_CONFIG (or individual Firebase env vars)
   - Other keys as required (see project config)
3. Start the dev server:
   npm run dev

---

## Environment Variables (example)

- GEMINI_API_KEY — API key for AI service
- NEXT_PUBLIC_FIREBASE_API_KEY — Firebase public key (example)
- FIREBASE_PRIVATE_KEY — Firebase service account private key (if used)
- CONTRACT_ADDRESS — Deployed contract address (for local testing)

Adjust names to match your project's configuration files and scripts.

---

## Contributing

Contributions are welcome. Suggested workflow:
1. Fork the repository.
2. Create a feature branch: git checkout -b feature/my-change
3. Open a Pull Request with a clear description of changes and rationale.

Please include tests for new behavior and keep changes focused and documented.

---

## Roadmap / Ideas

- On-chain reputation system for creators and backers.
- Granular vesting schedules and dispute resolution mechanisms.
- Expand AI analysis with external data sources and more transparent scoring.

---

## License

Specify your license here (e.g., MIT). Add a LICENSE file in the repo if not present.

---

Built to bring transparency, accountability, and intelligent screening to community-funded projects.
```
