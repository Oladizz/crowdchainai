 ![crowdchain](https://i.postimg.cc/RVSP1wh3/Crowd-logo.png)
 # CrowdChain

**Decentralized Crowdfunding Reinvented with Transparency, Trust, and Technology.**


## 🌍 Overview

# CrowdChain is a next-generation crowdfunding platform that blends blockchain transparency with AI-driven project analysis to ensure trust between creators and investors.
**It allows users to create, fund, and monitor projects seamlessly — eliminating fraud and bringing accountability to community-driven funding.**

## **CrowdChain goes beyond traditional crowdfunding by combining:**

- 🧱 Blockchain verification for funds and milestones.

- 🤖 AI evaluation for proposal credibility.

- 🔐 Secure identity verification (KYC) for trust.

- ⚡ Passkey-enabled access for secure logins.

- 🔗 Firebase + Smart Contract integration for hybrid data management.




## 🧩 Core Features

1. 💡 *Project Creation*

Creators can easily start campaigns by submitting detailed project information, visuals, and funding goals. Static details are stored on Firebase, while dynamic funding progress is stored on-chain.

2. 🗳️ *Milestone Voting*

Investors can vote on each project milestone before the next round of funds is released.
Votes are handled transparently on-chain using the voteOnMilestone function, ensuring that community consensus controls project progression.

3. 🔍 *AI-Powered Project Analysis*

Before projects go live, CrowdChain’s integrated AI evaluates proposal quality, credibility, and potential — helping users identify the most promising campaigns.

4. 🧾 *Hybrid Data System*

CrowdChain uses a hybrid data model:

Firebase for static project details (titles, descriptions, media).

Blockchain for dynamic updates (milestones, votes, funds raised).
This ensures speed, scalability, and verifiable transparency.


5. 🪙 *Transparent Fund Flow*

Every contribution, milestone vote, and disbursement is recorded on-chain, allowing backers to track their funds in real time.




##🏗️ Architecture

- Frontend: React + TypeScript + Vite
- Backend: Firebase + Node.js
- Blockchain: Solidity (Ethereum Layer 2 – Base)
- Storage: Firebase Firestore
- Authentication: Passkey + KYC Integration
- Hosting: Render / Vercel

#### Data Flow Summary:

1. Firebase stores static project info.


2. Smart contract stores funding, votes, and progress.


3. The frontend merges both in real time for a smooth user experience.





## ⚙️ Smart Contract Logic

Each project contains multiple milestones.

Project ID (_projectId) identifies the main campaign.

Milestone Index (_milestoneIndex) identifies a stage of the project.

Vote Type (_voteType) is true for approval and false for rejection.


This ensures every project milestone is community-approved before additional funds are released.



## 🌐 User Flow

1. Discovery: Browse active projects and success stories.


2. Creation: Submit new project proposals.


3. Verification: AI and KYC systems verify submissions.


4. Funding: Backers invest securely.


5. Milestones: Investors vote to approve progress.


6. Payout: Funds are automatically released on milestone approval.





## 🔒 Security & Trust

✅ Decentralized voting for milestone approval.

✅ Blockchain-stored votes and payouts for transparency.

✅ AI-based proposal review to minimize risk.

✅ Secure logins via passkey (no password leaks).




## 👨‍💻 Tech Stack

Layer Technology

Frontend React, TypeScript, Vite
Backend Node.js, Firebase
Blockchain Solidity, Ethers.js
Database Firebase Firestore
Authentication Passkey + Third-party KYC
Deployment Render / Vercel
AI Layer Google Gemini / Custom API





# 🧠 Vision

To build a trustless crowdfunding ecosystem where technology guarantees accountability — enabling creators to innovate and investors to contribute confidently.




## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
