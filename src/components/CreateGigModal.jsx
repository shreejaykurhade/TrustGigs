import React, { useState } from 'react';

const CreateGigModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        description: '',
        reward: '',
        duration: '7'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({
            ...formData,
            duration: parseInt(formData.duration)
        });
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(5, 5, 8, 0.8)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel fade-in" style={{ width: '90%', maxWidth: '500px', padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Post a New Job</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label>Project Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Design a Landing Page"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label>Budget (ETH)</label>
                            <input
                                type="number"
                                step="0.001"
                                placeholder="0.5"
                                required
                                value={formData.reward}
                                onChange={e => setFormData({ ...formData, reward: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Duration (Days)</label>
                            <input
                                type="number"
                                placeholder="7"
                                required
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '-1rem', marginBottom: '2rem' }}>
                        Funds will be held in escrow until you approve the work.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 2 }}>Create Bounty</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGigModal;
