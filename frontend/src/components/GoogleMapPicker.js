import React, { useState, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import './GoogleMapPicker.css';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = { lat: 6.5244, lng: 3.3792 };

const GoogleMapPicker = ({ initialPosition, onSelect, onClose }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [marker, setMarker] = useState(initialPosition || null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [address, setAddress] = useState('');

  const onMapClick = useCallback((e) => {
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const onLoadAutocomplete = (auto) => {
    setAutocomplete(auto);
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMarker({ lat, lng });
      setAddress(place.formatted_address || place.name || '');
    }
  };

  const handleChoose = () => {
    if (!marker) return;
    if (onSelect) onSelect({ lat: marker.lat, lng: marker.lng, address: address || '' });
    if (onClose) onClose();
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="gmap-modal">
      <div className="gmap-modal-content">
        <div className="gmap-header">
          <h3>Search or pick location</h3>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        <div className="gmap-search">
          <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={handlePlaceChanged}>
            <input className="gmap-input" placeholder="Search places or addresses" />
          </Autocomplete>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker || initialPosition || defaultCenter}
          zoom={13}
          onClick={onMapClick}
        >
          {marker && <Marker position={{ lat: marker.lat, lng: marker.lng }} />}
        </GoogleMap>

        <div className="gmap-footer">
          <div className="coords">Selected: {marker ? `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}` : 'None'}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleChoose} disabled={!marker}>Choose Location</button>
            <button className="btn-secondary" onClick={() => { setMarker(null); setAddress(''); }}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapPicker;
