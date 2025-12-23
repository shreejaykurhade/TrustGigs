import React, { useState, useEffect } from 'react';
import {
  connectWallet,
  getGigs,
  postJob,
  applyForJob,
  selectFreelancer,
  markCompleted,
  approveAndPay,
  requestRevision,
  freelancerRefund,
  refund
} from './utils/EscrowService';
import CreateGigModal from './components/CreateGigModal';
import { ethers } from 'ethers';
import ContractAddress from './contract-address.json';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [activeTab, setActiveTab] = useState("marketplace"); // marketplace, my-hires, my-gigs
  const [gigs, setGigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWallet();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchGigs();
          updateBalance(accounts[0]);
        } else {
          setAccount(null);
          setBalance("0");
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const updateBalance = async (addr) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(addr);
      setBalance(Number(ethers.formatEther(bal)).toFixed(4));
    }
  };

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const addr = await (await provider.getSigner()).getAddress();
          setAccount(addr);
          fetchGigs(provider);
          updateBalance(addr);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConnect = async () => {
    try {
      const { address, provider } = await connectWallet();
      setAccount(address);
      fetchGigs(provider);
      updateBalance(address);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchGigs = async (provider) => {
    try {
      if (!provider) {
        provider = new ethers.BrowserProvider(window.ethereum);
      }
      const data = await getGigs(provider);
      console.log("Fetched gigs:", data);
      setGigs(data);
      if (account) updateBalance(account);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (account) {
        console.log("Failed to fetch gigs. Check if contract is deployed to the correct address.");
      }
    }
  };

  const handlePostJob = async (data) => {
    setLoading(true);
    try {
      const { signer } = await connectWallet();
      const tx = await postJob(signer, data);
      console.log("Job posted tx:", tx.hash);

      await fetchGigs();
      setTimeout(async () => {
        await fetchGigs();
        setLoading(false);
        setShowModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + (err.reason || err.message));
      setLoading(false);
    }
  };

  const handleAction = async (actionFn, ...args) => {
    setLoading(true);
    try {
      const { signer } = await connectWallet();
      const tx = await actionFn(signer, ...args);
      console.log("Action tx:", tx.hash);

      await fetchGigs();
      setTimeout(async () => {
        await fetchGigs();
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err.reason || err.message));
      setLoading(false);
    }
  };

  // Filtering Logic
  const filteredGigs = gigs.filter(gig => {
    if (activeTab === 'marketplace') {
      return gig.status === 0; // Only show open jobs
    }
    if (activeTab === 'my-hires') {
      return gig.client.toLowerCase() === account?.toLowerCase();
    }
    if (activeTab === 'my-gigs') {
      return gig.freelancer.toLowerCase() === account?.toLowerCase() ||
        gig.applicants.some(a => a.toLowerCase() === account?.toLowerCase());
    }
    return true;
  });

  const stats = {
    totalJobs: gigs.length,
    myActiveJobs: gigs.filter(g => g.status > 0 && g.status < 3 &&
      (g.client.toLowerCase() === account?.toLowerCase() || g.freelancer.toLowerCase() === account?.toLowerCase())).length,
    openMarket: gigs.filter(g => g.status === 0).length
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Navigation */}
      <nav className="glass-panel" style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: '1200px', padding: '0.8rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))', borderRadius: '8px' }} />
          <h1 className="shimmer-text" style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>TrustGig</h1>
        </div>

        {account ? (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '1px' }}>Balance</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{balance} ETH</div>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)' }} />
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', background: 'hsla(0, 0%, 100%, 0.05)', padding: '6px 12px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'hsl(var(--accent-success))', boxShadow: '0 0 10px hsl(var(--accent-success))' }} />
            </div>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleConnect}>Connect Wallet</button>
        )}
      </nav>

      <div className="container" style={{ paddingTop: '120px' }}>
        {/* Stat Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-panel stat-card fade-in">
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Open Marketplace</span>
            <span className="stat-value">{stats.openMarket}</span>
          </div>
          <div className="glass-panel stat-card fade-in" style={{ animationDelay: '0.1s' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Active Contracts</span>
            <span className="stat-value">{stats.myActiveJobs}</span>
          </div>
          <div className="glass-panel stat-card fade-in" style={{ animationDelay: '0.2s' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Total Jobs</span>
            <span className="stat-value">{stats.totalJobs}</span>
          </div>
        </div>

        {/* Tab Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
              {activeTab === 'marketplace' ? 'Explore Jobs' : activeTab === 'my-hires' ? 'Client Dashboard' : 'Freelancer Workspace'}
            </h1>
            <div className="tab-container">
              <button className={`tab-item ${activeTab === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveTab('marketplace')}>Marketplace</button>
              <button className={`tab-item ${activeTab === 'my-hires' ? 'active' : ''}`} onClick={() => setActiveTab('my-hires')}>My Hires</button>
              <button className={`tab-item ${activeTab === 'my-gigs' ? 'active' : ''}`} onClick={() => setActiveTab('my-gigs')}>My Gigs</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '6px' }}>
            <button className="btn-secondary" onClick={() => fetchGigs()}>↻ Refresh</button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Post Job</button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
          {filteredGigs.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p>No jobs found in this category.</p>
            </div>
          ) : (
            filteredGigs.map((gig) => (
              <GigCard
                key={gig.id}
                gig={gig}
                currentAccount={account}
                onApply={() => handleAction(applyForJob, gig.id)}
                onSelect={(freelancer) => handleAction(selectFreelancer, gig.id, freelancer, gig.reward, 14)}
                onComplete={() => handleAction(markCompleted, gig.id)}
                onPay={() => handleAction(approveAndPay, gig.id)}
                onRevision={() => handleAction(requestRevision, gig.id)}
                onFreelancerRefund={() => handleAction(freelancerRefund, gig.id)}
                onRefund={() => handleAction(refund, gig.id)}
              />
            ))
          )}
        </div>
      </div>
      {showModal && <CreateGigModal onClose={() => setShowModal(false)} onCreate={handlePostJob} />}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="loading-pulse" style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))', marginBottom: '2rem', boxShadow: '0 0 40px hsla(var(--accent-primary), 0.5)' }} />
          <div className="shimmer-text" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Confirming Transaction...</div>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '1rem', fontSize: '0.9rem' }}>Please check your MetaMask wallet</p>
        </div>
      )}

      {/* Debug Footer */}
      <footer style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 90,
        background: 'hsla(0, 0%, 100%, 0.03)', padding: '6px 12px', borderRadius: '10px',
        fontSize: '0.7rem', color: 'hsl(var(--text-muted))', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)'
      }}>
        <span style={{ opacity: 0.6 }}>Network:</span> <span style={{ color: 'white' }}>Hardhat Local</span>
        <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
        <span style={{ opacity: 0.6 }}>Contract:</span> <span style={{ color: 'white' }}>{ContractAddress.address.slice(0, 8)}...</span>
      </footer>
    </div>
  );
}


const GigCard = ({ gig, currentAccount, onApply, onSelect, onComplete, onPay, onRevision, onFreelancerRefund, onRefund }) => {
  const isClient = currentAccount?.toLowerCase() === gig.client?.toLowerCase();
  const isFreelancer = currentAccount?.toLowerCase() === gig.freelancer?.toLowerCase();
  const hasApplied = gig.applicants.some(a => a.toLowerCase() === currentAccount?.toLowerCase());

  const getStatus = () => {
    switch (gig.status) {
      case 0: return { label: 'Open', class: 'status-open' };
      case 1: return { label: 'In Progress', class: 'status-assigned' };
      case 2: return { label: 'Delivered', class: 'status-completed' };
      case 3: return { label: 'Paid', class: 'status-paid' };
      case 4: return { label: 'Refunded', class: 'status-refunded' };
      default: return { label: 'Unknown', class: '' };
    }
  };

  const status = getStatus();

  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Role Indicator Tag */}
      {(isClient || isFreelancer) && (
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', background: isClient ? 'hsla(var(--accent-primary), 0.2)' : 'hsla(var(--accent-success), 0.2)', color: isClient ? 'hsl(var(--accent-primary))' : 'hsl(var(--accent-success))', borderRadius: '0 0 0 12px' }}>
          {isClient ? 'My Hire' : 'My Gig'}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className={`status-badge ${status.class}`}>{status.label}</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'hsl(var(--accent-success))' }}>{gig.status === 0 ? gig.reward : gig.amount} ETH</span>
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', lineHeight: 1.3 }}>{gig.description}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Client</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{gig.client.slice(0, 8)}...{gig.client.slice(-4)}</span>
        </div>
        {gig.status > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Freelancer</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{gig.freelancer.slice(0, 8)}...{gig.freelancer.slice(-4)}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Marketplace View */}
          {gig.status === 0 && !isClient && !hasApplied && (
            <button className="btn-primary" onClick={onApply}>Apply for this job</button>
          )}
          {gig.status === 0 && !isClient && hasApplied && (
            <button className="btn-secondary" style={{ opacity: 0.6, cursor: 'default' }} disabled>✓ Application Sent</button>
          )}

          {/* Client Selection View */}
          {gig.status === 0 && isClient && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Applications ({gig.applicants.length})</span>
                <div style={{ height: '1px', flex: 1, background: 'var(--glass-border)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {gig.applicants.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>Waiting for talent...</div>
                ) : (
                  gig.applicants.map(addr => (
                    <div key={addr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.8rem' }}>{addr.slice(0, 14)}...</span>
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => onSelect(addr)}>Hire</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Active Work View */}
          {gig.status === 1 && isFreelancer && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={onComplete}>Submit Work</button>
              <button className="btn-secondary" style={{ color: 'hsl(var(--accent-error))' }} onClick={onFreelancerRefund}>Cancel</button>
            </div>
          )}

          {gig.status === 2 && isClient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={onPay}>Approve & Pay</button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={onRevision}>Revision</button>
                <button className="btn-secondary" style={{ flex: 1, color: 'hsl(var(--accent-error))' }} onClick={onRefund}>Refund</button>
              </div>
            </div>
          )}

          {gig.status === 1 && isClient && (
            <button className="btn-secondary" style={{ color: 'hsl(var(--accent-error))' }} onClick={onRefund}>Force Cancel (If Late)</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
