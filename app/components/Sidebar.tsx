"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileEdit, CalendarDays, Car, ShieldCheck, BookOpen, AlertCircle, LogOut, Recycle, ArrowRightLeft, Camera, ClipboardList } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUserRole(sessionStorage.getItem("pea_role"));
    } catch (error) {
      setUserRole(null);
    }
  }, []);

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="sidebar-logo-container">
        <img
          src="https://lh3.googleusercontent.com/d/1pQWRFXNG6IL3cQUTWmuQVE7wMHVFrsjD"
          alt="PEA Logo"
          className="sidebar-logo"
        />
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileEdit, CalendarDays, Car, ShieldCheck, BookOpen, AlertCircle, LogOut, Recycle, ArrowRightLeft, Camera, ClipboardList } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUserRole(sessionStorage.getItem("pea_role"));
    } catch (error) {
      setUserRole(null);
    }
  }, []);

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="sidebar-logo-container">
        <img
          src="https://lh3.googleusercontent.com/d/1pQWRFXNG6IL3cQUTWmuQVE7wMHVFrsjD"
          alt="PEA Logo"
          className="sidebar-logo"
        />
        <div>
          <div className="sidebar-title" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>ระบบติดตาม ผกร.(ก3)</div>
          <div className="sidebar-subtitle">ระบบก่อสร้าง ผกร.(ก3)</div>
        </div>
      </div>

      <nav className="sidebar-nav" onClick={closeSidebar}>
        <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-4">หน้าหลัก</div>
        <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard งานก่อสร้าง</span>
        </Link>
        <Link href="/update" className={`nav-item ${pathname === "/update" ? "active" : ""}`}>
          <FileEdit size={20} />
          <span>อัปเดตสถานะงาน</span>
        </Link>
        <Link href="/wire-return" className={`nav-item ${pathname === "/wire-return" ? "active" : ""}`}>
          <Recycle size={20} />
          <span>สถานะการคืนเศษสาย</span>
        </Link>

        <Link href="/my-tasks" className={`nav-item ${pathname === "/my-tasks" ? "active" : ""}`} style={{ marginTop: '16px' }}>
          <ClipboardList size={20} />
          <span>มอบหมายและติดตามงาน</span>
        </Link>
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
