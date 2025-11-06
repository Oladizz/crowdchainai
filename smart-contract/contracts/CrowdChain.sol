// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CrowdChain is Ownable, Pausable, ReentrancyGuard {

    enum ProjectState { Fundraising, Expired, Successful }
    enum MilestoneState { Pending, InReview, Complete }

    struct Update {
        string message;
        uint256 timestamp;
    }

    struct Milestone {
        string description;
        uint256 fundsRequired;
        MilestoneState state;
        uint256 yesVotes;
        uint256 noVotes;
    }

    struct Project {
        uint256 id;
        address payable creator;
        string name;
        string description;
        uint256 fundingGoal;
        uint256 amountRaised;
        uint256 deadline;
        ProjectState state;
        Update[] updates;
        Milestone[] milestones;
        address[] funders;
        mapping(address => uint256) contributions;
        mapping(uint256 => mapping(address => bool)) milestoneVotes;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCounter;
    address payable public companyWallet;
    IERC1155 public accessNFT;
    address public marketplaceOperator = 0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC; // OpenSea Seaport 1.5

    uint256 public constant MAX_DURATION = 90 days;
    uint256 public constant VOTE_QUORUM_PERCENT = 20;

    event ProjectCreated(uint256 id, address indexed creator, string name, uint256 fundingGoal, uint256 deadline);
    event ProjectFunded(uint256 id, address indexed funder, uint256 amount);
    event ProjectUpdate(uint256 id, string message, uint256 timestamp);
    event OwnershipTransferred(uint256 id, address indexed previousCreator, address indexed newCreator);
    event MilestoneFundsReleased(uint256 projectId, uint256 milestoneIndex, uint256 amount);

    constructor(address payable _companyWallet, address _accessNFTAddress) Ownable(msg.sender) {
        companyWallet = _companyWallet;
        accessNFT = IERC1155(_accessNFTAddress);
    }

    function createProject(
        string memory _name,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _deadline,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneFunds
    ) public whenNotPaused {
        require(accessNFT.balanceOf(msg.sender, 0) > 0, "Must hold a Creator NFT"); // 0 is CREATOR_ID
        require(!accessNFT.isApprovedForAll(msg.sender, marketplaceOperator), "Creator NFT must not be listed for sale");

        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_deadline <= block.timestamp + MAX_DURATION, "Deadline is too far in the future");
        require(_milestoneDescriptions.length == _milestoneFunds.length, "Milestone descriptions and funds must have the same length");

        uint256 totalMilestoneFunds = 0;
        for (uint i = 0; i < _milestoneFunds.length; i++) {
            totalMilestoneFunds += _milestoneFunds[i];
        }
        require(totalMilestoneFunds == _fundingGoal, "Total milestone funds must equal the funding goal");

        projectCounter++;
        uint256 newProjectId = projectCounter;

        Project storage newProject = projects[newProjectId];
        newProject.id = newProjectId;
        newProject.creator = payable(msg.sender);
        newProject.name = _name;
        newProject.description = _description;
        newProject.fundingGoal = _fundingGoal;
        newProject.deadline = _deadline;
        newProject.state = ProjectState.Fundraising;

        for (uint i = 0; i < _milestoneDescriptions.length; i++) {
            newProject.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                fundsRequired: _milestoneFunds[i],
                state: MilestoneState.Pending,
                yesVotes: 0,
                noVotes: 0
            }));
        }

        emit ProjectCreated(newProjectId, msg.sender, _name, _fundingGoal, _deadline);
    }

    function fundProject(uint256 _projectId) public payable whenNotPaused nonReentrant {
        Project storage project = projects[_projectId];

        require(project.state == ProjectState.Fundraising, "Project is not in fundraising state");
        require(block.timestamp < project.deadline, "Funding deadline has passed");
        require(msg.value > 0, "Must send some ETH");

        project.amountRaised += msg.value;

        // Add funder to list if they are not already there and are not the creator
        if (project.contributions[msg.sender] == 0 && msg.sender != project.creator) {
            project.funders.push(msg.sender);
        }
        
        project.contributions[msg.sender] += msg.value;

        emit ProjectFunded(_projectId, msg.sender, msg.value);
    }

    function checkFundingStatus(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(project.state == ProjectState.Fundraising, "Project is not in fundraising state");
        require(block.timestamp >= project.deadline, "Deadline has not passed yet");

        if (project.amountRaised >= project.fundingGoal) {
            project.state = ProjectState.Successful;
        } else {
            project.state = ProjectState.Expired;
        }
    }

    function claimRefund(uint256 _projectId) public nonReentrant {
        Project storage project = projects[_projectId];
        require(project.state == ProjectState.Expired, "Project did not expire");

        uint256 amountToRefund = project.contributions[msg.sender];
        require(amountToRefund > 0, "You did not contribute to this project");

        project.contributions[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amountToRefund}("");
        require(sent, "Failed to send refund");
    }

    function postUpdate(uint256 _projectId, string memory _message) public whenNotPaused {
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only the creator can post updates");

        project.updates.push(Update({ 
            message: _message, 
            timestamp: block.timestamp 
        }));

        emit ProjectUpdate(_projectId, _message, block.timestamp);
    }

    function submitMilestoneForReview(uint256 _projectId, uint256 _milestoneIndex) public whenNotPaused {
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only the creator can submit milestones for review");
        require(project.milestones[_milestoneIndex].state == MilestoneState.Pending, "Milestone must be pending");

        project.milestones[_milestoneIndex].state = MilestoneState.InReview;
    }

    function transferProjectOwnership(uint256 _projectId, address payable _newCreator) public whenNotPaused {
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only the current creator can transfer ownership");
        require(_newCreator != address(0), "New creator cannot be the zero address");

        address previousCreator = project.creator;
        project.creator = _newCreator;

        emit OwnershipTransferred(_projectId, previousCreator, _newCreator);
    }

    function voteOnMilestone(uint256 _projectId, uint256 _milestoneIndex, bool vote) public {
        Project storage project = projects[_projectId];
        require(accessNFT.balanceOf(msg.sender, 1) > 0, "Must hold an Investor NFT to vote"); // 1 is INVESTOR_ID
        require(project.state == ProjectState.Successful, "Project is not successful");
        require(project.milestones[_milestoneIndex].state == MilestoneState.InReview, "Milestone is not in review");
        require(project.contributions[msg.sender] > 0, "Only funders can vote");
        require(!project.milestoneVotes[_milestoneIndex][msg.sender], "You have already voted on this milestone");

        project.milestoneVotes[_milestoneIndex][msg.sender] = true;
        if (vote) {
            project.milestones[_milestoneIndex].yesVotes++;
        } else {
            project.milestones[_milestoneIndex].noVotes++;
        }
    }

    function releaseMilestoneFunds(uint256 _projectId, uint256 _milestoneIndex) public nonReentrant {
        Project storage project = projects[_projectId];
        Milestone storage milestone = project.milestones[_milestoneIndex];

        require(msg.sender == project.creator, "Only the project creator can release funds");
        require(project.state == ProjectState.Successful, "Project is not successful");
        require(milestone.state == MilestoneState.InReview, "Milestone is not in review");
        if (project.funders.length > 0) {
            require((milestone.yesVotes + milestone.noVotes) * 100 / project.funders.length >= VOTE_QUORUM_PERCENT, "Quorum not reached");
            require(milestone.yesVotes > milestone.noVotes, "Milestone not approved by majority");
        }

        uint256 milestoneAmount = milestone.fundsRequired;
        uint256 fee = (milestoneAmount * 3) / 100;
        uint256 amountToCreator = milestoneAmount - fee;

        // Transfer the fee to the company wallet
        (bool sentFee, ) = companyWallet.call{value: fee}("");
        require(sentFee, "Failed to send fee");

        // Transfer the remaining amount to the project creator
        (bool sentToCreator, ) = project.creator.call{value: amountToCreator}("");
        require(sentToCreator, "Failed to send funds to creator");

        milestone.state = MilestoneState.Complete;

        emit MilestoneFundsReleased(_projectId, _milestoneIndex, amountToCreator);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getMilestones(uint256 _projectId) public view returns (Milestone[] memory) {
        return projects[_projectId].milestones;
    }

    function setCompanyWallet(address payable _newCompanyWallet) public onlyOwner {
        companyWallet = _newCompanyWallet;
    }
}
