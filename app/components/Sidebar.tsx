"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileEdit, CalendarDays, Car, ShieldCheck } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar">
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

      <nav className="sidebar-nav">
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
      </nav>
    </div>
  );
}
