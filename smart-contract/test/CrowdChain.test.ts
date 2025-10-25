import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrowdChain", function () {
  async function deployCrowdChain() {
    const [owner, company, creator, funder1] = await ethers.getSigners();

    const CrowdChain = await ethers.getContractFactory("CrowdChain");
    const crowdChain = await CrowdChain.deploy(company.address);

    return { crowdChain, owner, company, creator, funder1 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { crowdChain, owner } = await deployCrowdChain();
      expect(await crowdChain.owner()).to.equal(owner.address);
    });

    it("Should set the right company wallet", async function () {
      const { crowdChain, company } = await deployCrowdChain();
      expect(await crowdChain.companyWallet()).to.equal(company.address);
    });
  });
});
