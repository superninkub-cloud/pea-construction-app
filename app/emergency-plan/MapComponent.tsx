"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

const defaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const activeIcon = L.icon({
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


interface Point {
  id: string;
  lat: number;
  lng: number;
}

interface MapProps {
  points: Point[];
  activePointId?: string | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string) => void;
  readonly?: boolean;
}

const LocationMarker = ({ onMapClick, readonly }: { onMapClick?: (lat: number, lng: number) => void, readonly: boolean }) => {
  useMapEvents({
    click(e) {
      if (!readonly && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
};

const MapComponent = ({ points, activePointId, onMapClick, onMarkerClick, readonly = false }: MapProps) => {
  // Default to somewhere in Thailand
  const defaultCenter: [number, number] = [13.7563, 100.5018];
  
  // Center map on the first point if available, otherwise default
  const center = points.length > 0 ? [points[0].lat, points[0].lng] : defaultCenter;

  return (
    <MapContainer 
      center={center as [number, number]} 
      zoom={points.length > 0 ? 10 : 6} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onMapClick={onMapClick} readonly={readonly} />
      
      {points.map((pt) => (
        <Marker 
          key={pt.id} 
          position={[pt.lat, pt.lng]}
          icon={pt.id === activePointId ? activeIcon : defaultIcon}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) onMarkerClick(pt.id);
            }
          }}
        />
      ))}
    </MapContainer>
  );
};

export default MapComponent;
