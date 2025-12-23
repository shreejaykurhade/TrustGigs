# 🛡️ TrustGig: Decentralized Freelance Escrow

A premium, dark-themed Web3 marketplace that uses Ethereum Smart Contracts to ensure safe and trustless transactions between clients and freelancers.

---

## 🏗️ Project Architecture

TrustGig is built on a "State Machine" architecture where the lifecycle of a job is strictly controlled by a Smart Contract.

### **The Three Layers:**
1.  **The Engine (Smart Contract)**: `TrustGig.sol`
    - Written in Solidity.
    - Acts as the "Digital Judge" that holds funds in escrow.
    - Defines states: `OPEN` -> `ASSIGNED` -> `COMPLETED` -> `PAID`.
2.  **The Bridge (Ether.js & EscrowService)**: `src/utils/EscrowService.js`
    - Connects the browser (MetaMask) to the local blockchain.
    - Translates user clicks into complex blockchain transactions.
3.  **The User Interface**: `React + Vite`
    - A glassmorphism-inspired dashboard for managing jobs.
    - Uses CSS variables for a premium, consistent dark-mode aesthetic.

---

## ⛓️ Blockchain Basics Used

- **Escrow**: A financial arrangement where a third party (the Smart Contract) holds funds until conditions are met. This prevents "Client-ran-away" and "Freelancer-didn't-deliver" scenarios.
- **Gas**: Each transaction on the blockchain costs "Gas" (fees). On the local node, we use free test-ETH for this.
- **Wallet (MetaMask)**: Your digital key. It signs transactions to prove you are the Client or Freelancer.
- **Local Node (Hardhat)**: A personal blockchain running on your computer for instant, free testing.

---

## 🚀 How to Run

### **Prerequisites**
- [Node.js](https://nodejs.org/) installed.
- [MetaMask](https://metamask.io/) browser extension.

### **Getting Started**

Open three separate terminals in the project root:

#### **Terminal 1: Start the Blockchain**
```bash
npx hardhat node
```
> [!IMPORTANT]
> Keep this terminal open! It prints the **Private Keys** you need for MetaMask.

#### **Terminal 2: Deploy the Contract**
```bash
# First time or after changes
npx hardhat compile

# Deploy to local node
npx hardhat run scripts/deploy_fixed.cjs --network localhost
```
*This command automatically updates the frontend with the newest contract address.*

#### **Terminal 3: Start the Website**
```bash
npm run dev
```
*Open the local URL provided (usually `http://localhost:5173`).*

---

## 🛠️ MetaMask Setup

1.  **Add Network**: 
    - Network Name: `Localhost 8545`
    - RPC URL: `http://127.0.0.1:8545`
    - Chain ID: `31337`
2.  **Import Accounts**: 
    - Use the first two private keys from **Terminal 1** to import **Client** and **Freelancer** accounts.
3.  **Reset if Stuck**: 
    - If a transaction hangs: `MetaMask > Settings > Advanced > Clear Activity Tab Data`.

---

## 🔄 The Full Workflow

1.  **Client**: Posts a Job (Budget is defined).
2.  **Freelancer**: Switches account and clicks **"Apply"**.
3.  **Client**: Selects the Freelancer and **deposits ETH into Escrow**.
4.  **Freelancer**: Delivers work and clicks **"Mark Done"**.
5.  **Client**: Reviews and clicks **"Approve & Pay"**. Contract releases funds instantly.

---

*Made with ❤️ for the Web3 Freelancing Community.*
