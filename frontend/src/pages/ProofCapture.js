import React, { useState, useRef } from 'react';
import api from '../utils/api';
import './Messenger.css';

const ProofCapture = () => {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');
  const [deliveries, setDeliveries] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [useCamera, setUseCamera] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
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
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setUploadedImage(imageData);
      setUseCamera(false);
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleUploadProof = async () => {
    if (!selectedDeliveryId || !uploadedImage) {
      alert('Please select a delivery and capture/upload a photo');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/messenger/deliveries/${selectedDeliveryId}/proof`, {
        imageData: uploadedImage,
      });
      alert('Proof uploaded successfully!');
      setUploadedImage(null);
      setSelectedDeliveryId('');
    } catch (error) {
      alert('Error uploading proof: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messenger-container">
      <div className="page-header">
        <h1>Upload Proof of Delivery</h1>
        <p>Capture photo evidence of successful delivery</p>
      </div>

      <div className="proof-form">
        <div className="form-section">
          <label>Select Delivery:</label>
          <input 
            type="text" 
            placeholder="Enter delivery ID or search"
            value={selectedDeliveryId}
            onChange={(e) => setSelectedDeliveryId(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-section">
          <label>Upload Photo:</label>
          
          <div className="upload-options">
            <button className="upload-btn camera" onClick={startCamera}>
              Use Camera
            </button>
            <button className="upload-btn gallery" onClick={() => fileInputRef.current?.click()}>
              Upload from Gallery
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {useCamera && (
            <div className="camera-section">
              <video ref={videoRef} autoPlay playsInline></video>
              <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
              <button className="capture-btn" onClick={capturePhoto}>📸 Capture</button>
            </div>
          )}

          {uploadedImage && (
            <div className="image-preview">
              <img src={uploadedImage} alt="Proof" />
              <p>✓ Photo ready for upload</p>
            </div>
          )}
        </div>

        <button 
          className="submit-btn"
          onClick={handleUploadProof}
          disabled={loading || !selectedDeliveryId || !uploadedImage}
        >
          {loading ? 'Uploading...' : 'Upload Proof'}
        </button>
      </div>

      <div className="info-box">
        <h3>Guidelines for Proof Capture:</h3>
        <ul>
          <li>Capture a clear photo of the delivery location</li>
          <li>Include house/building number if visible</li>
          <li>Ensure good lighting for clarity</li>
          <li>Photo will be timestamped automatically</li>
          <li>Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );
};

export default ProofCapture;
