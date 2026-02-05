import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Coordinator.css';

const DeliveryTracking = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [messengers, setMessengers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedMessenger, setSelectedMessenger] = useState('');

  useEffect(() => {
    fetchTracking();
    fetchMessengers();
  }, []);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/tracking');
      setDeliveries(response.data.deliveries);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessengers = async () => {
    try {
      const response = await api.get('/coordinator/messengers');
      setMessengers(response.data);
    } catch (error) {
      console.error('Error fetching messengers:', error);
    }
  };

  const handleReassign = async () => {
    if (!selectedMessenger) {
      alert('Please select a messenger');
      return;
    }

    try {
      await api.put(`/coordinator/deliveries/${selectedDelivery._id}/reassign`, {
        newMessengerId: selectedMessenger,
      });
      alert('Delivery reassigned successfully!');
      setShowReassignModal(false);
      setSelectedDelivery(null);
      setSelectedMessenger('');
      fetchTracking();
    } catch (error) {
      alert('Error reassigning delivery: ' + (error.response?.data?.error || error.message));
    }
  };

  const openReassignModal = (delivery) => {
    setSelectedDelivery(delivery);
    setSelectedMessenger(delivery.messengerId?._id || '');
    setShowReassignModal(true);
  };

  const filteredDeliveries = filter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === filter);

  if (loading) {
    return <div className="loading">Loading delivery tracking...</div>;
  }

  return (
    <div className="coordinator-container">
      <div className="page-header">
        <h1>Real-Time Delivery Tracking</h1>
        <p>Monitor all messenger deliveries in real-time</p>
      </div>

      {stats && (
        <div className="stats-grid-coord">
          <div className="stat-card-coord">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card-coord success">
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-label">Delivered</div>
          </div>
          <div className="stat-card-coord warning">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card-coord danger">
            <div className="stat-value">{stats.failed}</div>
            <div className="stat-label">Failed</div>
          </div>
          <div className="stat-card-coord info">
            <div className="stat-value">{stats.verified}</div>
            <div className="stat-label">Verified</div>
          </div>
        </div>
      )}

      {showReassignModal && selectedDelivery && (
        <div className="form-container">
          <div className="coordinator-form">
            <h2>Reassign Delivery</h2>
            <p>Bill: {selectedDelivery.billId?.accountNumber} - {selectedDelivery.billId?.customerName}</p>
            <p>Current Messenger: {selectedDelivery.messengerId?.name}</p>
            <div className="form-group">
              <label>Select New Messenger</label>
              <select 
                value={selectedMessenger} 
                onChange={(e) => setSelectedMessenger(e.target.value)}
              >
                <option value="">-- Choose Messenger --</option>
                {messengers.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.area})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleReassign}>
                ✓ Reassign
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedDelivery(null);
                  setSelectedMessenger('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered
        </button>
        <button 
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed
        </button>
      </div>

      <div className="tracking-table-container">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Messenger</th>
              <th>Customer</th>
              <th>Account</th>
              <th>Address</th>
              <th>Type</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map((delivery) => (
              <tr key={delivery._id}>
                <td>
                  <div className="messenger-info">
                    {delivery.messengerId?.name}
                  </div>
                </td>
                <td>{delivery.billId?.customerName}</td>
                <td className="account-number">{delivery.billId?.accountNumber}</td>
                <td className="address-cell">{delivery.billId?.address}</td>
                <td>
                  {delivery.billId?.billType === 'disconnection_notice' ? 'Notice' : 'Bill'}
                </td>
                <td>
                  <span className={`status-badge status-${delivery.status}`}>
                    {delivery.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`verify-badge verify-${delivery.verificationStatus}`}>
                    {delivery.verificationStatus.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-btn edit"
                    onClick={() => openReassignModal(delivery)}
                    title="Reassign to different messenger"
                  >
                    Reassign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="empty-state">
          <p>No deliveries found in this filter.</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;
