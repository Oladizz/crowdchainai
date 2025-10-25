import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Replace with a real address before deployment to a live network
  const companyWallet = deployer.address;

  const crowdChain = await ethers.deployContract("CrowdChain", [companyWallet]);

  await crowdChain.waitForDeployment();

  console.log(`CrowdChain deployed to: ${crowdChain.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
