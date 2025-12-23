// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustGig {
    enum JobStatus { OPEN, ASSIGNED, COMPLETED, PAID, REFUNDED }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount; // Amount in escrow
        uint256 deadline;
        JobStatus status;
        string description;
        uint256 reward; // Proposed reward for the job
        address[] applicants;
    }

    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => mapping(address => bool)) public hasApplied;

    event JobPosted(uint256 indexed id, address indexed client, string description, uint256 reward);
    event Applied(uint256 indexed id, address indexed freelancer);
    event JobAssigned(uint256 indexed id, address indexed freelancer, uint256 amount);
    event JobCompleted(uint256 indexed id);
    event JobPaid(uint256 indexed id, uint256 amount);
    event JobRefunded(uint256 indexed id, uint256 amount);
    event RevisionRequested(uint256 indexed id);

    function postJob(string memory _description, uint256 _reward) external {
        jobCounter++;
        jobs[jobCounter].id = jobCounter;
        jobs[jobCounter].client = msg.sender;
        jobs[jobCounter].description = _description;
        jobs[jobCounter].reward = _reward;
        jobs[jobCounter].status = JobStatus.OPEN;

        emit JobPosted(jobCounter, msg.sender, _description, _reward);
    }

    function applyForJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.OPEN, "Job is not open");
        require(msg.sender != job.client, "Client cannot apply to own job");
        require(!hasApplied[_jobId][msg.sender], "Already applied");

        job.applicants.push(msg.sender);
        hasApplied[_jobId][msg.sender] = true;

        emit Applied(_jobId, msg.sender);
    }

    function selectFreelancer(uint256 _jobId, address _freelancer, uint256 _durationInDays) external payable {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can select");
        require(job.status == JobStatus.OPEN, "Job is not open");
        require(hasApplied[_jobId][_freelancer], "Address did not apply");
        require(msg.value > 0, "Escrow deposit required");

        job.freelancer = _freelancer;
        job.amount = msg.value;
        job.deadline = block.timestamp + (_durationInDays * 1 days);
        job.status = JobStatus.ASSIGNED;

        emit JobAssigned(_jobId, _freelancer, msg.value);
    }

    function markCompleted(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.freelancer, "Only freelancer can complete");
        require(job.status == JobStatus.ASSIGNED, "Job not assigned");

        job.status = JobStatus.COMPLETED;
        emit JobCompleted(_jobId);
    }

    function requestRevision(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can request revision");
        require(job.status == JobStatus.COMPLETED, "Work not delivered yet");

        job.status = JobStatus.ASSIGNED;
        emit RevisionRequested(_jobId);
    }

    function approveAndPay(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can approve");
        require(job.status == JobStatus.COMPLETED, "Work not marked complete");

        job.status = JobStatus.PAID;
        uint256 payout = job.amount;
        job.amount = 0; // Prevent re-entrance
        payable(job.freelancer).transfer(payout);
        emit JobPaid(_jobId, payout);
    }

    function freelancerRefund(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.freelancer, "Only freelancer can refund");
        require(job.status == JobStatus.ASSIGNED || job.status == JobStatus.COMPLETED, "Not in a refundable state");

        job.status = JobStatus.REFUNDED;
        uint256 refundAmount = job.amount;
        job.amount = 0;
        payable(job.client).transfer(refundAmount);
        emit JobRefunded(_jobId, refundAmount);
    }

    function refund(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can refund");
        require(job.status == JobStatus.ASSIGNED || job.status == JobStatus.COMPLETED, "Cannot refund in this state");
        require(block.timestamp > job.deadline, "Deadline not passed");

        job.status = JobStatus.REFUNDED;
        uint256 refundAmount = job.amount;
        job.amount = 0;
        payable(job.client).transfer(refundAmount);
        emit JobRefunded(_jobId, refundAmount);
    }

    function getJob(uint256 _jobId) external view returns (
        uint256 id,
        address client,
        address freelancer,
        uint256 amount,
        uint256 deadline,
        JobStatus status,
        string memory description,
        uint256 reward,
        address[] memory applicants
    ) {
        Job storage job = jobs[_jobId];
        return (
            job.id,
            job.client,
            job.freelancer,
            job.amount,
            job.deadline,
            job.status,
            job.description,
            job.reward,
            job.applicants
        );
    }
}
