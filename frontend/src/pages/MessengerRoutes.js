import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import './Messenger.css';

const MessengerRoutes = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [failureModal, setFailureModal] = useState({ visible: false, deliveryId: null });
  const [failureReason, setFailureReason] = useState('');
  const [assignedRoute, setAssignedRoute] = useState(null);
  // Proof capture refs/state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [useCamera, setUseCamera] = useState(false);
  const [uploadedProof, setUploadedProof] = useState(null);
  const [proofModal, setProofModal] = useState({ visible: false, deliveryId: null });

  useEffect(() => {
    fetchRoutes();
    // Auto-refresh every 30 seconds (FR-M12: route update notifications)
    const interval = setInterval(fetchRoutes, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messenger/routes');
      const rawDeliveries = response.data.deliveries;
      
      // Extract route info (FR-M03: assigned route for the day)
      const routes = [...new Set(rawDeliveries.map(d => d.billId?.route).filter(Boolean))];
      setAssignedRoute(routes.length === 1 ? routes[0] : `Multiple Routes (${routes.length})`);
      
      // Sort by sequence/address for optimization (FR-M04: optimized delivery sequence)
      const optimizedDeliveries = sortDeliveries(rawDeliveries);
      setDeliveries(optimizedDeliveries);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple optimization: group by route, then sort by pending status first, then address
  const sortDeliveries = (items) => {
    return items.sort((a, b) => {
      const statusOrder = { pending: 0, assigned: 1, delivered: 2, failed: 3 };
      const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (statusDiff !== 0) return statusDiff;
      
      const addrA = a.billId?.address || '';
      const addrB = b.billId?.address || '';
      return addrA.localeCompare(addrB);
    });
  };

  const filteredDeliveries = filter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === filter);

  const handleStatusUpdate = async (deliveryId, newStatus, reason = '') => {
    try {
      await api.put(`/messenger/deliveries/${deliveryId}/status`, {
        status: newStatus,
        failureReason: reason,
        notes: reason,
      });
      fetchRoutes();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating delivery status');
    }
  };

  const openFailureModal = (deliveryId) => {
    setFailureModal({ visible: true, deliveryId });
    setFailureReason('');
  };

  const submitFailure = () => {
    if (!failureReason.trim()) {
      alert('Please enter a failure reason');
      return;
    }
    handleStatusUpdate(failureModal.deliveryId, 'failed', failureReason);
    setFailureModal({ visible: false, deliveryId: null });
    setFailureReason('');
  };

  // Proof modal helpers: require proof before marking delivered
  const openProofModal = (deliveryId) => {
    setProofModal({ visible: true, deliveryId });
    setUploadedProof(null);
    setUseCamera(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setUseCamera(true);
      }
    } catch (error) {
      alert('Could not access camera: ' + error.message);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setUploadedProof(imageData);
      setUseCamera(false);
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleProofFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedProof(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!proofModal.deliveryId || !uploadedProof) {
      alert('Please capture or upload a photo first');
      return;
    }
    try {
      await api.post(`/messenger/deliveries/${proofModal.deliveryId}/proof`, { imageData: uploadedProof });
      alert('Proof uploaded and delivery marked as delivered');
      setProofModal({ visible: false, deliveryId: null });
      setUploadedProof(null);
      fetchRoutes();
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Error uploading proof');
    }
  };

  if (loading) {
    return <div className="loading">Loading your routes...</div>;
  }

  return (
    <div className="messenger-container">
      <div className="page-header">
        <h1>My Routes & Tasks</h1>
        <p>Track your daily deliveries and update status</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-box success">
            <div className="stat-number">{stats.delivered}</div>
            <div className="stat-label">Delivered</div>
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

      {/* Delivery Sequence (FR-M04: optimized sequence shown in order) */}
      <div className="sequence-note">
        Deliveries are optimized by status and address sequence
      </div>

      <div className="deliveries-list">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery._id} className="delivery-card">
            <div className="delivery-header">
              <div>
                <h3>{delivery.billId?.customerName || 'Unknown Customer'}</h3>
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
                <span className="label">📄 Bill Type:</span>
                <span className="value">{delivery.billId?.billType === 'disconnection_notice' ? 'Disconnection Notice' : 'Regular Bill'}</span>
              </div>
            </div>

            <div className="delivery-actions">
              {delivery.status === 'pending' || delivery.status === 'assigned' ? (
                <>
                  <button 
                    className="action-btn success"
                    onClick={() => openProofModal(delivery._id)}
                  >
                    Mark Delivered
                  </button>
                  <button 
                    className="action-btn warning"
                    onClick={() => openFailureModal(delivery._id)}
                  >
                    Mark Failed
                  </button>
                </>
              ) : (
                <span className="completed-badge">
                  {delivery.status === 'delivered' ? 'Completed' : 'Failed'}
                </span>
              )}
            </div>
            {delivery.failureReason && (
              <div className="delivery-failure-reason">
                <strong>Reason:</strong> {delivery.failureReason}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} deliveries at the moment.</p>
        </div>
      )}

      {/* Proof Upload Modal (require proof before marking delivered) */}
      {proofModal.visible && (
        <div className="modal-overlay" onClick={() => setProofModal({ visible: false, deliveryId: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Upload Proof of Delivery</h2>
            <p>Capture or upload photo evidence before marking delivered.</p>

            <div className="upload-options">
              <button className="upload-btn camera" onClick={startCamera}>Use Camera</button>
              <button className="upload-btn gallery" onClick={() => fileInputRef.current?.click()}>Upload from Gallery</button>
            </div>

            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleProofFile} />

            {useCamera && (
              <div className="camera-section">
                <video ref={videoRef} autoPlay playsInline></video>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <button className="capture-btn" onClick={capturePhoto}>📸 Capture</button>
              </div>
            )}

            {uploadedProof && (
              <div className="image-preview">
                <img src={uploadedProof} alt="Proof" />
              </div>
            )}

            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setProofModal({ visible: false, deliveryId: null })}>Cancel</button>
              <button className="btn btn-danger" onClick={handleUploadProof}>Upload & Mark Delivered</button>
            </div>
          </div>
        </div>
      )}

      {/* Failure Reason Modal (FR-M07: require reason for failed delivery) */}
      {failureModal.visible && (
        <div className="modal-overlay" onClick={() => setFailureModal({ visible: false, deliveryId: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Mark Delivery as Failed</h2>
            <p>Please provide the reason for failure:</p>
            <textarea
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Enter reason (e.g., Customer not home, Address not found, etc.)"
              className="failure-textarea"
            />
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setFailureModal({ visible: false, deliveryId: null })}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={submitFailure}
              >
                Confirm Failed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerRoutes;
