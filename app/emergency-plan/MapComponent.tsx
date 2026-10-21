"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

const defaultIcon = L.divIcon({
  className: 'custom-dot-icon',
  html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const activeIcon = L.divIcon({
  className: 'custom-dot-icon-active',
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 3px rgba(239,68,68,0.5), 0 2px 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});


interface Point {
  id: string;
  lat: number;
  lng: number;
  image_url?: string;
  image_base64?: string;
  preview_url?: string;
  pole_name?: string;
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
        >
          {/* Permanent Label for Pole Name */}
          {pt.pole_name && (
            <Tooltip permanent direction="bottom" offset={[0, 0]} className="font-bold text-xs bg-white/90 text-blue-800 px-1.5 py-0.5 border border-blue-200 shadow-sm rounded">
              {pt.pole_name}
            </Tooltip>
          )}

          {/* Show image and details popup */}
          <Popup>
            <div className="w-48 overflow-hidden rounded-lg flex flex-col gap-2 p-1">
              {pt.pole_name && (
                <div className="font-bold text-sm text-blue-800 border-b pb-1 text-center bg-blue-50 py-1 rounded-md">
                  หัวเสา: {pt.pole_name}
                </div>
              )}
              {(pt.preview_url || pt.image_base64 || pt.image_url) ? (
                <img 
                  src={pt.preview_url || pt.image_base64 || pt.image_url} 
                  alt="Site" 
                  className="w-full h-auto object-cover rounded shadow-sm"
                />
              ) : (
                <div className="w-full h-24 bg-slate-100 flex items-center justify-center text-slate-400 rounded">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
