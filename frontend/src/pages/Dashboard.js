import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = user?.role === 'messenger' 
    ? [
        { icon: '', title: 'My Routes', description: 'View assigned routes and tasks', path: '/messenger/routes' },
        { icon: '', title: 'Delivery History', description: 'View completed and pending deliveries', path: '/messenger/deliveries' },
        { icon: '', title: 'Upload Proof', description: 'Submit proof of delivery', path: '/messenger/proof' },
      ]
    : [
        { icon: '', title: 'Messengers', description: 'Manage messenger accounts', path: '/coordinator/messengers' },
        { icon: '', title: 'Bills', description: 'Input and manage bills', path: '/coordinator/bills' },
        { icon: '', title: 'Tracking', description: 'Real-time delivery tracking', path: '/coordinator/tracking' },
        { icon: '', title: 'Verification', description: 'Verify delivery proofs', path: '/coordinator/verification' },
        { icon: '', title: 'Reports', description: 'Generate DSR and analytics', path: '/coordinator/reports' },
      ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p className="subtitle">Digital Proof-of-Delivery System</p>
      </div>

      <div className="dashboard-grid">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className="dashboard-card"
            onClick={() => navigate(item.path)}
          >
            <div className="card-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="card-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
      </div>
    </div>
  );
};

export default Dashboard;
