import { ethers } from 'ethers';
import TrustGigArtifact from '../artifacts/contracts/TrustGig.sol/TrustGig.json';
import ContractAddress from '../contract-address.json';

const CONTRACT_ADDRESS = ContractAddress.address;

export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer, address: await signer.getAddress() };
};

export const getContract = async (signerOrProvider) => {
    return new ethers.Contract(CONTRACT_ADDRESS, TrustGigArtifact.abi, signerOrProvider);
};

export const postJob = async (signer, { description, reward, duration }) => {
    const contract = await getContract(signer);
    const tx = await contract.postJob(description, duration, {
        value: ethers.parseEther(reward.toString())
    });
    return await tx.wait();
};

export const applyForJob = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.applyForJob(jobId);
    return await tx.wait();
};

export const selectFreelancer = async (signer, jobId, freelancer, duration) => {
    const contract = await getContract(signer);
    const tx = await contract.selectFreelancer(jobId, freelancer, duration);
    return await tx.wait();
};

export const cancelJob = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.cancelJob(jobId);
    return await tx.wait();
};

export const markCompleted = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.markCompleted(jobId);
    return await tx.wait();
};

export const approveAndPay = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.approveAndPay(jobId);
    return await tx.wait();
};

export const requestRevision = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.requestRevision(jobId);
    return await tx.wait();
};

export const freelancerRefund = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.freelancerRefund(jobId);
    return await tx.wait();
};

export const refund = async (signer, jobId) => {
    const contract = await getContract(signer);
    const tx = await contract.refund(jobId);
    return await tx.wait();
};

export const getGigs = async (provider) => {
    const contract = await getContract(provider);
    const count = await contract.jobCounter();
    const gigs = [];

    for (let i = Number(count); i > Math.max(0, Number(count) - 20); i--) {
        const job = await contract.getJob(i);
        gigs.push(parseGig(job));
    }
    return gigs;
};

const parseGig = (job) => ({
    id: job.id.toString(),
    client: job.client,
    freelancer: job.freelancer,
    amount: ethers.formatEther(job.amount),
    deadline: job.deadline > 0 ? new Date(Number(job.deadline) * 1000).toLocaleDateString() : "Not set",
    status: Number(job.status), // 0: OPEN, 1: ASSIGNED, 2: COMPLETED, 3: PAID, 4: REFUNDED
    description: job.description,
    reward: ethers.formatEther(job.reward),
    applicants: job.applicants,
    duration: job.duration.toString()
});
