import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Coordinator.css';
import GoogleMapPicker from '../components/GoogleMapPicker';

const BillsManagement = () => {
  const [bills, setBills] = useState([]);
  const [messengers, setMessengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [selectedMessenger, setSelectedMessenger] = useState('');
  const [formData, setFormData] = useState({
    accountNumber: '',
    customerName: '',
    address: '',
    latitude: '',
    longitude: '',
    billType: 'regular_bill',
    billingMonth: new Date().toISOString().split('T')[0],
  });
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBills();
    fetchMessengers();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/bills');
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coordinator/bills', { bills: [formData] });
      alert('Bill added successfully');
      setFormData({
        accountNumber: '',
        customerName: '',
        address: '',
        route: '',
        billType: 'regular_bill',
        billingMonth: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchBills();
    } catch (error) {
      alert('Error adding bill: ' + error.response?.data?.error);
    }
  };

  const handleSelectBill = (billId) => {
    setSelectedBillIds(prev =>
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleAssignBills = async () => {
    if (!selectedMessenger || selectedBillIds.length === 0) {
      alert('Please select a messenger and at least one bill');
      return;
    }

    try {
      await api.post('/coordinator/assign-bills', {
        billIds: selectedBillIds,
        messengerId: selectedMessenger,
      });
      alert('Bills assigned successfully!');
      setSelectedBillIds([]);
      setSelectedMessenger('');
      setShowAssignModal(false);
      fetchBills();
    } catch (error) {
      alert('Error assigning bills: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLocationSelect = ({ lat, lng }) => {
    setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6), address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
    setShowGooglePicker(false);
  };

  const filteredBills = filter === 'all' ? bills : bills.filter(b => b.status === filter);

  if (loading) {
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="coordinator-container">
      <div className="page-header">
        <h1>Bills Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Add New Bill'}
          </button>
          {selectedBillIds.length > 0 && (
            <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
              Assign Selected ({selectedBillIds.length})
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddBill} className="coordinator-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowGooglePicker(true)}>Pick on Map</button>
                  <div style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : ''}
                  </div>
                </div>
              </div>
              <input type="hidden" name="latitude" value={formData.latitude} />
              <input type="hidden" name="longitude" value={formData.longitude} />
              <div className="form-group">
                <label>Bill Type</label>
                <select name="billType" value={formData.billType} onChange={handleInputChange}>
                  <option value="regular_bill">Regular Bill</option>
                  <option value="disconnection_notice">Disconnection Notice</option>
                </select>
              </div>
              <div className="form-group">
                <label>Billing Month</label>
                <input
                  type="date"
                  name="billingMonth"
                  value={formData.billingMonth}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Bill</button>
          </form>
        </div>
      )}

      {showAssignModal && (
        <div className="form-container">
          <div className="coordinator-form">
            <h2>Assign Bills to Messenger</h2>
            <p>Selected {selectedBillIds.length} bill(s)</p>
            <div className="form-group">
              <label>Select Messenger</label>
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
              <button className="btn-primary" onClick={handleAssignBills}>
                ✓ Assign Bills
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedBillIds([]);
                  setSelectedMessenger('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      

      {showGooglePicker && (
        <GoogleMapPicker
          initialPosition={formData.latitude && formData.longitude ? { lat: Number(formData.latitude), lng: Number(formData.longitude) } : undefined}
          onSelect={({ lat, lng, address }) => {
            setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6), address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
            setShowGooglePicker(false);
          }}
          onClose={() => setShowGooglePicker(false)}
        />
      )}

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({bills.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`}
          onClick={() => setFilter('unassigned')}
        >
          Unassigned ({bills.filter(b => b.status === 'unassigned').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Assigned ({bills.filter(b => b.status === 'assigned').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered ({bills.filter(b => b.status === 'delivered').length})
        </button>
      </div>

      <div className="bills-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox"
                  checked={selectedBillIds.length === filteredBills.length && filteredBills.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBillIds(filteredBills.map(b => b._id));
                    } else {
                      setSelectedBillIds([]);
                    }
                  }}
                  disabled={filteredBills.length === 0}
                />
              </th>
              <th>Account No.</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Billing Month</th>
              <th>Type</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill._id}>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedBillIds.includes(bill._id)}
                    onChange={() => handleSelectBill(bill._id)}
                    disabled={bill.status !== 'unassigned'}
                  />
                </td>
                <td className="account-number">{bill.accountNumber}</td>
                <td>{bill.customerName}</td>
                <td>{bill.address}</td>
                <td>{bill.billingMonth ? new Date(bill.billingMonth).toLocaleDateString() : '-'}</td>
                
                <td>
                  <span className={`badge ${bill.billType === 'disconnection_notice' ? 'disconnection' : 'bill'}`}>
                    {bill.billType === 'disconnection_notice' ? 'Notice' : 'Bill'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${bill.status}`}>
                    {bill.status.toUpperCase()}
                  </span>
                </td>
                <td>{bill.assignedTo?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBills.length === 0 && (
        <div className="empty-state">
          <p>No bills found in this filter.</p>
        </div>
      )}
    </div>
  );
};

export default BillsManagement;
