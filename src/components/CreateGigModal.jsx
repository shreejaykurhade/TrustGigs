import React, { useState } from 'react';

const CreateGigModal = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        description: '',
        reward: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(formData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Post a New Job</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Project Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Design a Landing Page"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated Budget (ETH)</label>
                        <input
                            type="number"
                            step="0.001"
                            placeholder="0.5"
                            required
                            value={formData.reward}
                            onChange={e => setFormData({ ...formData, reward: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Post Job</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGigModal;
