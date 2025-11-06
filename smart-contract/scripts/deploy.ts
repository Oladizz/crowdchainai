import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy CrowdChainAccessNFT
  const initialCreatorRate = ethers.parseEther("0.005"); // ~$10 at $2000/ETH
  const initialInvestorRate = ethers.parseEther("0.05"); // ~$100 at $2000/ETH
  const initialPremiumRate = ethers.parseEther("0.0167"); // ~$50 at $3000/ETH
  const initialCreatorURI = ""; // Placeholder
  const initialInvestorURI = ""; // Placeholder
  const initialPremiumURI = ""; // Placeholder

  const NFTContract = await ethers.deployContract("CrowdChainAccessNFT", [
    initialCreatorRate,
    initialInvestorRate,
    initialPremiumRate,
    initialCreatorURI,
    initialInvestorURI,
    initialPremiumURI,
  ]);
  await NFTContract.waitForDeployment();
  console.log(`-> CrowdChainAccessNFT deployed to: ${NFTContract.target}`);

  // 2. Deploy CrowdChain
  const companyWallet = deployer.address; // Using deployer as company wallet for test
  const crowdChain = await ethers.deployContract("CrowdChain", [companyWallet, NFTContract.target]);
  await crowdChain.waitForDeployment();

  console.log(`-> CrowdChain deployed to: ${crowdChain.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
