"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileEdit, CalendarDays, Car, ShieldCheck, BookOpen, AlertCircle, LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="sidebar-logo-container">
        <img
          src="https://lh3.googleusercontent.com/d/1pQWRFXNG6IL3cQUTWmuQVE7wMHVFrsjD"
          alt="PEA Logo"
          className="sidebar-logo"
        />
        <div>
          <div className="sidebar-title" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>ระบบติดตามงาน ผกร.กรย.(ก3)</div>
          <div className="sidebar-subtitle">ระบบก่อสร้าง ผกร.(ก3)</div>
        </div>
      </div>

      <nav className="sidebar-nav" onClick={closeSidebar}>
        <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard งานก่อสร้าง</span>
        </Link>
        <Link href="/update" className={`nav-item ${pathname === "/update" ? "active" : ""}`}>
          <FileEdit size={20} />
          <span>อัพเดทสถานะงาน</span>
        </Link>
        <Link href="/outage" className={`nav-item ${pathname === "/outage" ? "active" : ""}`}>
          <CalendarDays size={20} />
          <span>แผนงานระดม/แผนใช้รถ</span>
        </Link>
        <Link href="/vehicle" className={`nav-item ${pathname === "/vehicle" ? "active" : ""}`}>
          <Car size={20} />
          <span>ระบบยานพาหนะ</span>
        </Link>
        <Link href="/safety" className={`nav-item ${pathname === "/safety" ? "active" : ""}`}>
          <ShieldCheck size={20} />
          <span>งานความปลอดภัย</span>
        </Link>
        <Link href="/important" className={`nav-item ${pathname === "/important" ? "active" : ""}`}>
          <AlertCircle size={20} />
          <span>ติดตามงานสำคัญ</span>
        </Link>
        <Link href="/guide" className={`nav-item ${pathname === "/guide" ? "active" : ""}`}>
          <BookOpen size={20} />
          <span>คู่มืองานก่อสร้าง 115kV</span>
        </Link>
        <div 
          onClick={() => {
            sessionStorage.removeItem("pea_auth");
            sessionStorage.removeItem("pea_role");
            window.location.reload();
          }}
          className="nav-item" 
          style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '15px', color: '#ef4444', cursor: 'pointer' }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '600' }}>ออกจากระบบ</span>
        </div>
      </nav>
    </div>
  );
}
