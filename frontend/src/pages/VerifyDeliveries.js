import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Coordinator.css';

const VerifyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState({});

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/deliveries/');
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (deliveryId, status) => {
    try {
      const notes = verificationNotes[deliveryId] || '';
      await api.put(`/coordinator/deliveries/${deliveryId}/verify`, {
        verificationStatus: status,
        verificationNotes: notes,
      });
      alert(`Delivery marked as ${status}`);
      fetchDeliveries();
    } catch (error) {
      alert('Error verifying delivery: ' + error.message);
    }
  };

  const filteredDeliveries = deliveries.filter(d => 
    filter === 'all' ? true : d.verificationStatus === filter
  );

  if (loading) {
    return <div className="loading">Loading deliveries for verification...</div>;
  }

  return (
    <div className="coordinator-container">
      <div className="page-header">
        <h1>Verify Deliveries</h1>
        <p>Review and verify proof of delivery photos</p>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({deliveries.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({deliveries.filter(d => d.verificationStatus === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
          onClick={() => setFilter('verified')}
        >
          Verified ({deliveries.filter(d => d.verificationStatus === 'verified').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({deliveries.filter(d => d.verificationStatus === 'rejected').length})
        </button>
      </div>

      <div className="verification-list">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery._id} className="verification-card">
            <div className="verification-header">
              <div>
                <h3>{delivery.billId?.customerName}</h3>
                <p>Messenger: {delivery.messengerId?.name}</p>
              </div>
              <span className={`verify-badge verify-${delivery.verificationStatus}`}>
                {delivery.verificationStatus.toUpperCase()}
              </span>
            </div>

            <div className="verification-details">
              <div className="detail-row">
                <span>Account:</span>
                <span className="account-number">{delivery.billId?.accountNumber}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className={`status-badge status-${delivery.status}`}>
                  {delivery.status}
                </span>
              </div>
              <div className="detail-row">
                <span>Delivery Date:</span>
                <span>{delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {delivery.proofImages && delivery.proofImages.length > 0 && (
              <div className="proof-images">
                <p className="proof-label">Proof Images:</p>
                <div className="images-grid">
                  {delivery.proofImages.map((img, idx) => (
                    <div key={idx} className="proof-image">
                      <img src={img.url} alt={`Proof ${idx + 1}`} />
                      <p className="timestamp">
                        {new Date(img.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {delivery.verificationStatus === 'pending' && (
              <div className="verification-actions">
                <textarea
                  placeholder="Add verification notes (optional)"
                  value={verificationNotes[delivery._id] || ''}
                  onChange={(e) => setVerificationNotes({
                    ...verificationNotes,
                    [delivery._id]: e.target.value,
                  })}
                  className="notes-input"
                />
                <div className="action-buttons">
                  <button 
                    className="action-btn success"
                    onClick={() => handleVerify(delivery._id, 'verified')}
                  >
                    Approve
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={() => handleVerify(delivery._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {delivery.verificationNotes && (
              <div className="verification-notes">
                <p className="notes-label">📝 Notes:</p>
                <p>{delivery.verificationNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="empty-state">
          <p>No deliveries found for verification.</p>
        </div>
      )}
    </div>
  );
};

export default VerifyDeliveries;
