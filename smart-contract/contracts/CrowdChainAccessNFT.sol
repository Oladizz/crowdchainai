// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrowdChainAccessNFT
 * @dev An ERC1155 contract for issuing Creator and Investor access NFTs.
 */
contract CrowdChainAccessNFT is ERC1155, Ownable {
    uint256 public constant CREATOR_ID = 0;
    uint256 public constant INVESTOR_ID = 1;
    uint256 public constant PREMIUM_ID = 2;

    uint256 public creatorNFTRate;
    uint256 public investorNFTRate;
    uint256 public premiumNFTRate;

    string private creatorTokenURI;
    string private investorTokenURI;
    string private premiumTokenURI;

    event RateChanged(uint256 newCreatorRate, uint256 newInvestorRate, uint256 newPremiumRate);
    event NFTMinted(address indexed user, uint256 indexed tokenId);
    event URIsSet(string newCreatorURI, string newInvestorURI, string newPremiumURI);

    constructor(uint256 _initialCreatorRate, uint256 _initialInvestorRate, uint256 _initialPremiumRate, string memory _initialCreatorURI, string memory _initialInvestorURI, string memory _initialPremiumURI) ERC1155("") Ownable(msg.sender) {
        creatorNFTRate = _initialCreatorRate;
        investorNFTRate = _initialInvestorRate;
        premiumNFTRate = _initialPremiumRate;
        creatorTokenURI = _initialCreatorURI;
        investorTokenURI = _initialInvestorURI;
        premiumTokenURI = _initialPremiumURI;
    }

    /**
     * @dev Returns the URI for a given token ID.
     */
    function uri(uint256 _id) public view override returns (string memory) {
        require(_id == CREATOR_ID || _id == INVESTOR_ID || _id == PREMIUM_ID, "Invalid token ID");
        if (_id == CREATOR_ID) {
            return creatorTokenURI;
        } else if (_id == INVESTOR_ID) {
            return investorTokenURI;
        } else {
            return premiumTokenURI;
        }
    }

    /**
     * @dev Allows an admin to set new token URIs for the NFTs.
     */
    function setTokenURIs(string memory _newCreatorURI, string memory _newInvestorURI, string memory _newPremiumURI) public onlyOwner {
        creatorTokenURI = _newCreatorURI;
        investorTokenURI = _newInvestorURI;
        premiumTokenURI = _newPremiumURI;
        emit URIsSet(_newCreatorURI, _newInvestorURI, _newPremiumURI);
    }

    /**
     * @dev Allows an admin to set new minting rates for the NFTs.
     */
    function setRates(uint256 _newCreatorRate, uint256 _newInvestorRate, uint256 _newPremiumRate) public onlyOwner {
        creatorNFTRate = _newCreatorRate;
        investorNFTRate = _newInvestorRate;
        premiumNFTRate = _newPremiumRate;
        emit RateChanged(_newCreatorRate, _newInvestorRate, _newPremiumRate);
    }

    /**
     * @dev Mints a Creator NFT for the caller.
     */
    function mintCreatorNFT() public payable {
        require(msg.value >= creatorNFTRate, "Insufficient payment for Creator NFT");
        require(balanceOf(msg.sender, CREATOR_ID) == 0, "Creator NFT already owned");
        _mint(msg.sender, CREATOR_ID, 1, "");
        emit NFTMinted(msg.sender, CREATOR_ID);
    }

    /**
     * @dev Mints an Investor NFT for the caller.
     */
    function mintInvestorNFT() public payable {
        require(msg.value >= investorNFTRate, "Insufficient payment for Investor NFT");
        require(balanceOf(msg.sender, INVESTOR_ID) == 0, "Investor NFT already owned");
        _mint(msg.sender, INVESTOR_ID, 1, "");
        emit NFTMinted(msg.sender, INVESTOR_ID);
    }

    /**
     * @dev Mints a Premium NFT for the caller.
     */
    function mintPremiumNFT() public payable {
        require(msg.value >= premiumNFTRate, "Insufficient payment for Premium NFT");
        require(balanceOf(msg.sender, PREMIUM_ID) == 0, "Premium NFT already owned");
        _mint(msg.sender, PREMIUM_ID, 1, "");
        emit NFTMinted(msg.sender, PREMIUM_ID);
    }

    /**
     * @dev Withdraws the contract balance to the owner's wallet.
     */
    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
