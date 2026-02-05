import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix default icon path for Leaflet in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

const MapPicker = ({ initialPosition = { lat: 6.5244, lng: 3.3792 }, onSelect, onClose }) => {
  const [markerPos, setMarkerPos] = useState(null);

  useEffect(() => {
    if (initialPosition && initialPosition.lat && initialPosition.lng) {
      setMarkerPos(initialPosition);
    }
  }, [initialPosition]);

  const handleMapClick = (latlng) => {
    setMarkerPos(latlng);
  };

  const handleChoose = () => {
    if (markerPos && onSelect) onSelect({ lat: markerPos.lat, lng: markerPos.lng });
    if (onClose) onClose();
  };

  return (
    <div className="map-modal">
      <div className="map-modal-content">
        <div className="map-header">
          <h3>Pick Location on Map</h3>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
        <div className="map-container">
          <MapContainer center={[initialPosition.lat, initialPosition.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onClick={handleMapClick} />
            {markerPos && (
              <Marker position={[markerPos.lat, markerPos.lng]} />
            )}
          </MapContainer>
        </div>
        <div className="map-picker-btns">
          <div className="coords">
            Selected: {markerPos ? `${markerPos.lat.toFixed(5)}, ${markerPos.lng.toFixed(5)}` : 'None'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleChoose} disabled={!markerPos}>Choose Location</button>
            <button className="btn-secondary" onClick={() => setMarkerPos(null)}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
