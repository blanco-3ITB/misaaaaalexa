import React, { useState } from 'react';
import api from '../utils/api';
import './Coordinator.css';

const Reporting = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentReport, setCurrentReport] = useState(null);

  const handleGenerateDSR = async () => {
    try {
      setLoading(true);
      const response = await api.post('/reports/dsr', {
        reportDate: selectedDate,
      });
      setCurrentReport(response.data.report);
      alert('Daily Situation Report generated successfully!');
    } catch (error) {
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coordinator-container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Generate DSR and performance metrics</p>
      </div>

      <div className="report-generator">
        <div className="generator-form">
          <div className="form-group">
            <label>Select Date for Report:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={handleGenerateDSR}
            disabled={loading}
          >
            {loading ? 'Generating...' : '📄 Generate DSR'}
          </button>
        </div>
      </div>

      {currentReport && (
        <div className="report-container">
          <div className="report-header">
            <h2>Daily Situation Report (DSR)</h2>
            <p className="report-date">Generated: {new Date(currentReport.generatedAt).toLocaleString()}</p>
          </div>

          <div className="report-grid">
            <div className="report-card">
              <h3>Total Bills Processed</h3>
              <p className="report-value">{currentReport.data.totalBillsProcessed}</p>
            </div>
            <div className="report-card">
              <h3>✓ Delivered</h3>
              <p className="report-value success">{currentReport.data.totalBillsDelivered}</p>
            </div>
            <div className="report-card">
              <h3>Disconnection Notices</h3>
              <p className="report-value">{currentReport.data.totalDisconnectionNotices}</p>
            </div>
            <div className="report-card">
              <h3>Delivery Rate</h3>
              <p className="report-value">{currentReport.data.deliveryRate.toFixed(1)}%</p>
            </div>
            <div className="report-card">
              <h3>❌ Failed</h3>
              <p className="report-value danger">{currentReport.data.failureCount}</p>
            </div>
          </div>

          <div className="report-section">
            <h3>Messenger Performance</h3>
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Messenger</th>
                  <th>Assigned</th>
                  <th>Delivered</th>
                  <th>Failed</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.data.messengerPerformance.map((perf, idx) => (
                  <tr key={idx}>
                    <td>{perf.messengerName}</td>
                    <td>{perf.assigned}</td>
                    <td className="success">{perf.delivered}</td>
                    <td className="danger">{perf.failed}</td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${perf.performanceScore}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{perf.performanceScore.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h3>Critical Path Analysis</h3>
            <div className="critical-path">
              {currentReport.criticalPath.stages.map((stage, idx) => (
                <div key={idx} className="path-stage">
                  <div className="stage-number">{idx + 1}</div>
                  <div className="stage-info">
                    <p className="stage-name">{stage.stage}</p>
                    <p className="stage-duration">{stage.duration} minutes</p>
                  </div>
                  {idx < currentReport.criticalPath.stages.length - 1 && (
                    <div className="stage-arrow">→</div>
                  )}
                </div>
              ))}
            </div>
            <p className="estimated-time">
              Estimated Completion: {new Date(currentReport.criticalPath.estimatedCompletion).toLocaleTimeString()}
            </p>
          </div>

          <button className="btn-export">Print Report</button>
        </div>
      )}

      {!currentReport && (
        <div className="empty-state">
          <p>Select a date and generate a report to see performance metrics.</p>
        </div>
      )}
    </div>
  );
};

export default Reporting;
