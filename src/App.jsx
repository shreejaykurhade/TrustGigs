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
        } else {
          setAccount(null);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(await (await provider.getSigner()).getAddress());
          fetchGigs(provider);
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
    } catch (err) {
      console.error("Fetch Error:", err);
      // Don't alert on initial load to avoid noise, but log it
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

      // Force immediate fetch and then another after 1s for safety
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

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Navigation */}
      <nav className="glass-panel" style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: '1200px', padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h1 className="shimmer-text" style={{ fontSize: '1.5rem', fontWeight: '700' }}>TrustGig</h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Localhost v2</span>
        </div>

        {account ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-success)', boxShadow: '0 0 10px var(--accent-success)' }} />
          </div>
        ) : (
          <button className="btn-primary" onClick={handleConnect}>Connect Wallet</button>
        )}
      </nav>

      {/* Hero Section */}
      <div className="container" style={{ paddingTop: '140px', textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Safe Gigs on the <br />
          <span className="shimmer-text">Blockchain.</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Post jobs, apply as a freelancer, and let smart contracts handle the escrow. Zero trust issues.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '1.1rem', padding: '14px 28px' }}>
            + Post a Job
          </button>
          <button className="btn-secondary" onClick={() => fetchGigs()} style={{ fontSize: '1.1rem', padding: '14px 28px' }}>
            ↻ Refresh Gigs
          </button>
        </div>
      </div>

      <div className="container">
        <h2 style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Marketplace</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {gigs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center' }}>No jobs posted yet. Be the first!</p>
          ) : (
            gigs.map((gig) => (
              <GigCard
                key={gig.id}
                gig={gig}
                currentAccount={account}
                onApply={() => handleAction(applyForJob, gig.id)}
                onSelect={(freelancer) => handleAction(selectFreelancer, gig.id, freelancer, gig.reward, 14)} // Increased default duration to 14 days for easier testing
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
      {
        loading && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div className="shimmer-text" style={{ fontSize: '2rem' }}>Processing...</div>
          </div>
        )
      }

      {/* Debug Footer */}
      <footer className="glass-panel" style={{
        position: 'fixed', bottom: 10, right: 10, padding: '4px 10px',
        fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', border: 'none', background: 'transparent'
      }}>
        Connected to: {ContractAddress.address}
      </footer>
    </div >
  );
}


const GigCard = ({ gig, currentAccount, onApply, onSelect, onComplete, onPay, onRevision, onFreelancerRefund, onRefund }) => {
  const isClient = currentAccount?.toLowerCase() === gig.client?.toLowerCase();
  const isFreelancer = currentAccount?.toLowerCase() === gig.freelancer?.toLowerCase();
  const hasApplied = gig.applicants.some(a => a.toLowerCase() === currentAccount?.toLowerCase());

  // Calculate if deadline passed
  // Note: This is simplified. In a real app we'd need block.timestamp from explorer or just local time as approximation.
  const deadlinePassed = gig.status === 1 && new Date() > new Date(gig.deadline);

  const getStatusLabel = () => {
    switch (gig.status) {
      case 0: return <span className="status-badge status-open">Open for Apps</span>;
      case 1: return <span className="status-badge status-open">In Progress</span>;
      case 2: return <span className="status-badge status-completed">Delivered</span>;
      case 3: return <span className="status-badge status-paid">Paid</span>;
      case 4: return <span className="status-badge status-refunded">Refunded</span>;
      default: return null;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <h3 style={{ fontSize: '1.2rem' }}>{gig.description}</h3>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>
          {gig.status === 0 ? gig.reward : gig.amount} ETH
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Client:</span>
          <span style={{ color: 'white' }}>{gig.client.slice(0, 6)}...{gig.client.slice(-4)}</span>
        </div>
        {gig.status > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Freelancer:</span>
            <span style={{ color: 'white' }}>{gig.freelancer.slice(0, 6)}...{gig.freelancer.slice(-4)}</span>
          </div>
        )}
        {(gig.status === 1 || gig.status === 2) && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Deadline:</span>
            <span style={{ color: deadlinePassed ? 'var(--accent-error)' : 'white' }}>{gig.deadline}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        {getStatusLabel()}

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Action Buttons */}
          {gig.status === 0 && !isClient && !hasApplied && (
            <button className="btn-primary" style={{ width: '100%' }} onClick={onApply}>Apply to Job</button>
          )}
          {gig.status === 0 && !isClient && hasApplied && (
            <button className="btn-secondary" style={{ width: '100%', cursor: 'default' }} disabled>Applied</button>
          )}

          {gig.status === 0 && isClient && (
            <div>
              <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Applicants ({gig.applicants.length}):</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {gig.applicants.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Waiting for applicants...</span>
                ) : (
                  gig.applicants.map(addr => (
                    <div key={addr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.75rem' }}>{addr.slice(0, 10)}...</span>
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => onSelect(addr)}>Hire</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {gig.status === 1 && isFreelancer && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ flex: 2 }} onClick={onComplete}>Mark Done</button>
              <button className="btn-secondary" style={{ flex: 1, color: 'var(--accent-error)' }} onClick={onFreelancerRefund}>Refund</button>
            </div>
          )}

          {gig.status === 2 && isClient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={onPay}>Approve & Pay</button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={onRevision}>Ask for Revision</button>
                <button className="btn-secondary" style={{ flex: 1, color: 'var(--accent-error)' }} onClick={onRefund}>Force Refund</button>
              </div>
            </div>
          )}

          {(gig.status === 1) && isClient && (
            <button className="btn-secondary" style={{ width: '100%', color: 'var(--accent-error)' }} onClick={onRefund}>
              Cancel & Refund (If Late)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
