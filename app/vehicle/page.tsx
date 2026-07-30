"use client";

import TopBar from "../components/TopBar";

export default function VehicleWeb() {
  return (
    <>
      <TopBar title="ระบบจัดการยานพาหนะ (C3 Vehicle)" />
      <div style={{ width: '100%', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }} className="animation-fade-in">
        <iframe 
          src="https://c3-vehicle-web.vercel.app/" 
          style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
          title="C3 Vehicle Web"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </>
  );
}
