
const { ethers } = require("hardhat");

async function main() {
  console.log("--- Starting Comprehensive Contract Test ---");

  // 1. SETUP
  console.log("\n[1/14] Setting up accounts and deploying contracts...");
  const [owner, company, creator, funder1, funder2, nonAdmin, premiumUser] = await ethers.getSigners();
  
  const initialCreatorRate = ethers.parseEther("0.005");
  const initialInvestorRate = ethers.parseEther("0.05");
  const initialPremiumRate = ethers.parseEther("0.0167");
  const NFTContract = await ethers.deployContract("CrowdChainAccessNFT", [initialCreatorRate, initialInvestorRate, initialPremiumRate, "", "", ""]);
  await NFTContract.waitForDeployment();
  console.log(`  -> CrowdChainAccessNFT deployed to: ${NFTContract.target}`);

  const CrowdChain = await ethers.getContractFactory("CrowdChain");
  const crowdChain = await CrowdChain.deploy(company.address, NFTContract.target);
  await crowdChain.waitForDeployment();
  console.log(`  -> CrowdChain deployed to: ${crowdChain.target}`);

  // 2. ADMIN ACCESS CONTROL TEST
  console.log("\n[2/14] Testing: Admin functions (Failure Case)...");
  try {
    await NFTContract.connect(nonAdmin).setRates(0, 0, 0);
    throw new Error("non-admin was able to call setRates");
  } catch (error) {
    if (error.message.includes("OwnableUnauthorizedAccount")) {
      console.log("  -> SUCCESS: Non-admin correctly blocked from calling setRates.");
    } else { throw error; }
  }

  // 3. NFT GATING TEST (FAILURE CASE)
  console.log("\n[3/14] Testing: createProject() without Creator NFT...");
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  try {
    await crowdChain.connect(creator).createProject("Project Name", "", ethers.parseEther("1"), deadline, [], []);
    throw new Error("Should have failed");
  } catch (error) {
    if (error.message.includes("Must hold a Creator NFT")) {
      console.log("  -> SUCCESS: Blocked project creation without Creator NFT.");
    } else { throw error; }
  }

  // 4. MINT NFTs
  console.log("\n[4/14] Testing: Minting NFTs...");
  await NFTContract.connect(creator).mintCreatorNFT({ value: initialCreatorRate });
  console.log("  -> Creator minted Creator NFT.");
  await NFTContract.connect(funder1).mintInvestorNFT({ value: initialInvestorRate });
  console.log("  -> Funder1 minted Investor NFT.");
  await NFTContract.connect(premiumUser).mintPremiumNFT({ value: initialPremiumRate });
  console.log("  -> Premium user minted Premium NFT.");

  // 5. DUPLICATE MINT TEST
  console.log("\n[5/14] Testing: Duplicate NFT Mint (Failure Case)...");
  try {
    await NFTContract.connect(creator).mintCreatorNFT({ value: initialCreatorRate });
    throw new Error("Should have failed");
  } catch (error) {
    if (error.message.includes("Creator NFT already owned")) {
      console.log("  -> SUCCESS: Blocked user from minting a duplicate Creator NFT.");
    } else { throw error; }
  }

  // 6. "NFT LISTED" TEST (FAILURE CASE)
  console.log("\n[6/14] Testing: createProject() with listed NFT (Failure Case)...");
  const marketplaceAddress = await crowdChain.marketplaceOperator();
  await NFTContract.connect(creator).setApprovalForAll(marketplaceAddress, true);
  console.log("  -> Creator approved marketplace.");
  try {
    await crowdChain.connect(creator).createProject("Project Name", "", ethers.parseEther("1"), deadline, [], []);
    throw new Error("Should have failed");
  } catch (error) {
    if (error.message.includes("Creator NFT must not be listed for sale")) {
      console.log("  -> SUCCESS: Blocked project creation with listed NFT.");
    } else { throw error; }
  }
  // Un-approve for subsequent tests
  await NFTContract.connect(creator).setApprovalForAll(marketplaceAddress, false);
  console.log("  -> Creator un-approved marketplace.");

  // 7. HAPPY PATH (Creation, Funding, Voting, Release)
  console.log("\n[7/14] Testing: The main successful project lifecycle...");
  const projectId = 1;
  await crowdChain.connect(creator).createProject("Test Project 1", "Desc", ethers.parseEther("10"), deadline, ["M1"], [ethers.parseEther("10")])
  console.log("  -> Project created.");
  await crowdChain.connect(funder1).fundProject(projectId, { value: ethers.parseEther("10") });
  console.log("  -> Project funded.");
  await ethers.provider.send("evm_setNextBlockTimestamp", [deadline + 1]);
  await ethers.provider.send("evm_mine");
  await crowdChain.checkFundingStatus(projectId);
  console.log("  -> Project status set to Successful.");
  await crowdChain.connect(creator).submitMilestoneForReview(projectId, 0);
  console.log("  -> Milestone submitted for review.");
  try {
      await crowdChain.connect(funder2).voteOnMilestone(projectId, 0, true);
      throw new Error("Should have failed");
  } catch(error) {
      if(error.message.includes("Must hold an Investor NFT to vote")) {
          console.log("  -> SUCCESS: Blocked voting without Investor NFT.");
      } else { throw error; }
  }
  await crowdChain.connect(funder1).voteOnMilestone(projectId, 0, true);
  console.log("  -> Funder1 voted.");
  const creatorEthBalanceBefore = await ethers.provider.getBalance(creator.address);
  await crowdChain.connect(creator).releaseMilestoneFunds(projectId, 0);
  const creatorEthBalanceAfter = await ethers.provider.getBalance(creator.address);
  if (creatorEthBalanceAfter <= creatorEthBalanceBefore) throw new Error("Creator balance did not increase!");
  console.log("  -> SUCCESS: Full lifecycle complete.");

  // 8. ZERO FUNDER TEST (BUG FIX VERIFICATION)
  console.log("\n[8/14] Testing: Milestone release with zero funders (Bug Fix)...");
  const zfProjectId = 2;
  const zfDeadline = (await ethers.provider.getBlock("latest")).timestamp + 3600;
  await crowdChain.connect(creator).createProject("Zero Funder Project", "", ethers.parseEther("1"), zfDeadline, ["M1"], [ethers.parseEther("1")]); // Creator self-funds
  await crowdChain.connect(creator).fundProject(zfProjectId, { value: ethers.parseEther("1") });
  await ethers.provider.send("evm_setNextBlockTimestamp", [zfDeadline + 1]);
  await ethers.provider.send("evm_mine");
  await crowdChain.checkFundingStatus(zfProjectId);
  await crowdChain.connect(creator).submitMilestoneForReview(zfProjectId, 0);
  await crowdChain.connect(creator).releaseMilestoneFunds(zfProjectId, 0); // Should not revert with division-by-zero
  console.log("  -> SUCCESS: Milestone released on project with zero external funders.");

  // 9. REFUND PATH
  console.log("\n[9/14] Testing: claimRefund() path...");
  const failProjectId = 3;
  const failDeadline = (await ethers.provider.getBlock("latest")).timestamp + 1800;
  await crowdChain.connect(creator).createProject("Fail Project", "", ethers.parseEther("100"), failDeadline, ["M1"], [ethers.parseEther("100")]); 
  await crowdChain.connect(funder1).fundProject(failProjectId, { value: ethers.parseEther("5") });
  await ethers.provider.send("evm_setNextBlockTimestamp", [failDeadline + 1]);
  await ethers.provider.send("evm_mine");
  await crowdChain.checkFundingStatus(failProjectId);
  const funderBalanceBefore = await ethers.provider.getBalance(funder1.address);
  const tx = await crowdChain.connect(funder1).claimRefund(failProjectId);
  const receipt = await tx.wait();
  const funderBalanceAfter = await ethers.provider.getBalance(funder1.address);
  if (funderBalanceAfter <= funderBalanceBefore) throw new Error("Funder balance did not increase after refund!");
  console.log("  -> SUCCESS: Funder successfully claimed a refund.");

  // 10. PAUSABLE TEST
  console.log("\n[10/14] Testing: Pausable functionality...");
  await crowdChain.connect(owner).pause();
  console.log("  -> Contract paused.");
  try {
      await crowdChain.connect(creator).createProject("Paused Project", "", 1, 1, [], []);
      throw new Error("Should have failed");
  } catch(error) {
      if(error.message.includes("EnforcedPause")) {
          console.log("  -> SUCCESS: Blocked actions while paused.");
      } else { throw error; }
  }
  await crowdChain.connect(owner).unpause();
  console.log("  -> Contract unpaused.");

  // 11. ADMIN: setRates
  console.log("\n[11/14] Testing: Admin setRates()...");
  const newCreatorRate = ethers.parseEther("0.01");
  const newPremiumRate = ethers.parseEther("0.02");
  await NFTContract.connect(owner).setRates(newCreatorRate, initialInvestorRate, newPremiumRate);
  if (await NFTContract.creatorNFTRate() !== newCreatorRate) throw new Error("setRates failed for creator");
  if (await NFTContract.premiumNFTRate() !== newPremiumRate) throw new Error("setRates failed for premium");
  console.log("  -> SUCCESS: Admin changed NFT prices.");

  // 12. ADMIN: setTokenURIs
  console.log("\n[12/14] Testing: Admin setTokenURIs()...");
  const newURI = "ipfs://new_metadata_hash";
  await NFTContract.connect(owner).setTokenURIs(newURI, newURI, newURI);
  if (await NFTContract.uri(0) !== newURI) throw new Error("setTokenURIs failed for creator");
  if (await NFTContract.uri(2) !== newURI) throw new Error("setTokenURIs failed for premium");
  console.log("  -> SUCCESS: Admin changed NFT metadata URIs.");

  console.log("\n--- Comprehensive Test Complete ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
