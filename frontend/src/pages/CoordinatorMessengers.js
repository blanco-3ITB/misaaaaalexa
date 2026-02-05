import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Coordinator.css';

const CoordinatorMessengers = () => {
  const [messengers, setMessengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    area: '',
    employeeId: '',
  });

  useEffect(() => {
    fetchMessengers();
  }, []);

  const fetchMessengers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/messengers');
      setMessengers(response.data);
    } catch (error) {
      console.error('Error fetching messengers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMessenger = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing messenger
        await api.put(`/coordinator/messengers/${editingId}`, formData);
        alert('Messenger updated successfully');
        setEditingId(null);
      } else {
        // Create new messenger
        await api.post('/coordinator/messengers', formData);
        alert('Messenger created successfully');
      }
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        area: '',
        employeeId: '',
      });
      setShowForm(false);
      fetchMessengers();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditMessenger = (messenger) => {
    setFormData({
      name: messenger.name,
      email: messenger.email,
      password: '',
      phone: messenger.phone || '',
      area: messenger.area || '',
      employeeId: messenger.employeeId || '',
    });
    setEditingId(messenger._id);
    setShowForm(true);
  };

  const handleDeleteMessenger = async (id) => {
    if (window.confirm('Are you sure you want to delete this messenger?')) {
      try {
        await api.delete(`/coordinator/messengers/${id}`);
        alert('Messenger deleted successfully');
        fetchMessengers();
      } catch (error) {
        alert('Error deleting messenger: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading messengers...</div>;
  }

  return (
    <div className="coordinator-container">
      <div className="page-header">
        <h1>Manage Messengers</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add New Messenger'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddMessenger} className="coordinator-form">
            <h2>{editingId ? 'Edit Messenger' : 'Add New Messenger'}</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Area/Zone</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Messenger' : 'Create Messenger'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setShowForm(false);
                  setFormData({name: '', email: '', password: '', phone: '', area: '', employeeId: ''});
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      <div className="messengers-grid">
        {messengers.map((messenger) => (
          <div key={messenger._id} className="messenger-card">
            <div className="card-header">
              <h3>{messenger.name}</h3>
              <span className={`status-badge ${messenger.isActive ? 'active' : 'inactive'}`}>
                {messenger.isActive ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
            <div className="card-body">
              <p><strong>Email:</strong> {messenger.email}</p>
              <p><strong>Phone:</strong> {messenger.phone || 'N/A'}</p>
              <p><strong>Area:</strong> {messenger.area || 'N/A'}</p>
              <p><strong>Employee ID:</strong> {messenger.employeeId || 'N/A'}</p>
            </div>
            <div className="card-actions">
              <button className="action-btn edit" onClick={() => handleEditMessenger(messenger)}>✎ Edit</button>
              <button className="action-btn delete" onClick={() => handleDeleteMessenger(messenger._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {messengers.length === 0 && (
        <div className="empty-state">
          <p>No messengers yet. Add one to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CoordinatorMessengers;
