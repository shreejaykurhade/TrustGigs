# 🛡️ TrustGigs: Decentralized Freelance Escrow

Welcome to **TrustGigs**! This project is a decentralized application (dApp) designed to make freelancing safe. It uses "Smart Contracts" to ensure that freelancers get paid and clients get the work they asked for, without needing to trust each other or a middle-man.

---

## � What is Web3? (For Beginners)

If you are new to this, think of **Web2** (the current internet like Facebook or Uber) as a system where a single big company owns the data and the "rules." 

**Web3** is different. It's the **Decentralized Web**. Instead of one company, the "rules" and "money" are managed by a network of computers (the **Blockchain**). 
- **No Boss**: No single person can change the rules once the code is "deployed."
- **Transparency**: Everyone can see the transactions, but no one can fake them.
- **Ownership**: You own your money in your "Wallet" (like MetaMask), and only you can authorize spending it.

---

## 🏗️ Project Architecture (How it works)

This project has three main parts that talk to each other:

### 1. The Smart Contract (The "Digital Law")
- **File**: `contracts/TrustGig.sol`
- **What it is**: This is a piece of code that lives **on the blockchain**. It acts like a robotic judge.
- **What it does**: It holds the money (Escrow). It says: *"I will hold this 1 ETH. I will only give it to the Freelancer if the Client clicks 'Approve'."* It cannot be bribed or changed.

### 2. The Blockchain (The "World")
- **Software**: `Hardhat`
- **What it is**: Since we don't want to spend real money yet, we run a "Fake Ethereum" on your computer. 
- **What it does**: It simulates a network of computers. It gives us test accounts with 10,000 "fake" ETH to play with.

### 3. The Frontend (The "Dashboard")
- **Software**: `React + Vite`
- **What it is**: This is the website you see in your browser.
- **What it does**: It uses a library called `Ethers.js` (The Bridge) to talk to the blockchain. When you click a button on the site, it asks your **MetaMask Wallet** to sign a digital permission slip to move money or create a job.

---

## 🚀 Step-by-Step Guides

### **A. Initial Setup (First Time Only)**
If you just downloaded the folder and have never run it:
1.  **Install everything**: Open a terminal in the folder and run:
    ```bash
    npm install
    ```

### **B. How to Start (Every Time you work)**
Open **3 separate terminal windows** and run these in order:

#### **Terminal 1: The Blockchain Server**
```bash
npx hardhat node
```
*This starts your private "Ethereum" world. Leave it running.*

#### **Terminal 2: The Logic (The "Law")**
```bash
npx hardhat run scripts/deploy_fixed.cjs --network localhost
```
*This puts your Smart Contract onto that private world. Run this EVERY time you start Terminal 1.*

#### **Terminal 3: The Website**
```bash
npm run dev
```
*This starts the dashboard. Click the link (e.g., `http://localhost:5173`) to open it.*

---

## 🔄 How to "RE-RUN" (If things get stuck)
If you close your laptop or the website stops updating:
1.  **Close all 3 terminals**.
2.  **Repeat Steps B1, B2, and B3** above.
3.  **MetaMask Reset (Important)**:
    - MetaMask remembers your old transactions. When you restart the blockchain (Step B1), MetaMask gets confused.
    - **Fix**: Open MetaMask -> Settings -> Advanced -> **Clear Activity Tab Data**.
    - This "resets" the wallet's memory so it matches the new blockchain.

---

## 🛠️ MetaMask Help (Your Digital Key)

1.  **Connecting**: Make sure MetaMask is set to `Localhost 8545`. 
2.  **Importing**: Click the circle in MetaMask -> "Import Account" -> Paste a **Private Key** from Terminal 1. Do this for two accounts (one for Client, one for Freelancer).
3.  **Resetting (Crucial)**: If you restart the blockchain (Step 1), MetaMask will get confused because the "World" has been reset but MetaMask remembers the old one.
    - **Fix**: Go to MetaMask > Settings > Advanced > **Clear Activity Tab Data**. This will fix 99% of "Pending" or "Failed" errors.

---

## 🔄 The Lifecycle of a Gig

1.  **Post**: Client posts a job description and a budget.
2.  **Apply**: Freelancer applies (proves they are interested).
3.  **Hire**: Client Picks the freelancer. **This is when the money is locked in Escrow.**
4.  **Mark Done**: Freelancer finishes and signals the contract.
5.  **Pay**: Client approves, and the contract **automatically** sends the money to the Freelancer.

*TrustGig: Making the internet a safer place to work.*
