import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TrackingObject } from '../types/TrackingObject';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapViewProps {
  objects: TrackingObject[];
  onMapClick: (lat: number, lng: number) => void;
  onMarkerClick: (object: TrackingObject) => void;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);
  
  return null;
}

const MapView: React.FC<MapViewProps> = ({ objects, onMapClick, onMarkerClick }) => {
  const mapRef = useRef<any>(null);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onClick={onMapClick} />
        
        {objects.map((object) => (
          <Marker
            key={object.id}
            position={[object.latitude, object.longitude]}
            eventHandlers={{
              click: () => onMarkerClick(object),
            }}
          >
            <Popup>
              <div>
                <h3>{object.name}</h3>
                {object.description && <p>{object.description}</p>}
                <p>
                  <small>
                    Lat: {object.latitude.toFixed(4)}, Lng: {object.longitude.toFixed(4)}
                  </small>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
