"use client";
import { useState, useEffect } from "react";
import { Menu, LogOut, Bell } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function TopBar({ title }: { title: string }) {
  const { toggleSidebar } = useSidebar();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(sessionStorage.getItem("pea_role"));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("pea_auth");
    sessionStorage.removeItem("pea_role");
    window.location.reload();
  };

  let topText = "ผศก.กรย.(ก3)";
  let bottomText = "บุคลากรแผนก";
  let avatarText = "PT";

  if (role === "admin") {
    topText = "ADMIN";
    bottomText = "ชานินทร์";
    avatarText = "AD";
  } else if (role === "guest") {
    topText = "บุคคลภายนอก";
    bottomText = "ผู้เยี่ยมชม";
    avatarText = "GU";
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="user-profile">

        <div className="avatar" style={{ backgroundColor: '#7e22ce', color: 'white', fontWeight: '600', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{avatarText}</div>
        <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="user-name" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>{topText}</span>
          <span className="user-role" style={{ fontSize: '0.75rem', color: '#64748b' }}>{bottomText}</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            marginLeft: '12px',
            padding: '6px 12px',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
          title="ออกจากระบบ"
        >
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
