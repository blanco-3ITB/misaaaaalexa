import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Messenger.css';

const MessengerDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, [filter]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      let url = '/messenger/deliveries';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      const response = await api.get(url);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const stats = {
      total: deliveries.length,
      completed: deliveries.filter(d => d.status === 'delivered').length,
      pending: deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
    };
    return stats;
  };

  if (loading) {
    return <div className="loading">Loading deliveries...</div>;
  }

  const stats = getStats();

  return (
    <div className="messenger-container">
      <div className="page-header">
        <h1>Delivery History</h1>
        <p>View all your completed and pending deliveries</p>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-box success">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box warning">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-box danger">
          <div className="stat-number">{stats.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Completed
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed
        </button>
      </div>

      <div className="deliveries-list">
        {deliveries.map((delivery) => (
          <div key={delivery._id} className="delivery-card">
            <div className="delivery-header">
              <div>
                <h3>{delivery.billId?.customerName || 'Unknown'}</h3>
                <p className="delivery-account">Account: {delivery.billId?.accountNumber}</p>
              </div>
              <span className={`status-badge status-${delivery.status}`}>
                {delivery.status.toUpperCase()}
              </span>
            </div>

            <div className="delivery-details">
              <div className="detail-row">
                <span className="label">Address:</span>
                <span className="value">{delivery.billId?.address}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{delivery.billId?.billType === 'disconnection_notice' ? 'Disconnection Notice' : 'Regular Bill'}</span>
              </div>
              {delivery.deliveryDate && (
                <div className="detail-row">
                  <span className="label">Delivered:</span>
                  <span className="value">{new Date(delivery.deliveryDate).toLocaleString()}</span>
                </div>
              )}
              {delivery.failureReason && (
                <div className="detail-row failure-reason">
                  <span className="label">Failure Reason:</span>
                  <span className="value">{delivery.failureReason}</span>
                </div>
              )}
              {delivery.proofImages && delivery.proofImages.length > 0 && (
                <div className="detail-row">
                  <span className="label">Proofs:</span>
                  <span className="value">{delivery.proofImages.length} image(s)</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} deliveries found.</p>
        </div>
      )}
    </div>
  );
};

export default MessengerDeliveries;
