"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileEdit, CalendarDays, Car, ShieldCheck, BookOpen, AlertCircle, LogOut, Recycle, ArrowRightLeft, Camera } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(sessionStorage.getItem("pea_role"));
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
        <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard งานก่อสร้าง</span>
        </Link>
        <Link href="/planning" className={`nav-item ${pathname === "/planning" ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span>วางแผนงานก่อสร้าง</span>
        </Link>
        <Link href="/update" className={`nav-item ${pathname === "/update" ? "active" : ""}`}>
          <FileEdit size={20} />
          <span>อัพเดทสถานะงาน</span>
        </Link>
        <Link href="/wire-return" className={`nav-item ${pathname === "/wire-return" ? "active" : ""}`}>
          <Recycle size={20} />
          <span>สถานะการส่งคืนเศษสาย</span>
        </Link>
        <Link href="/important" className={`nav-item ${pathname === "/important" ? "active" : ""}`}>
          <AlertCircle size={20} />
          <span>ติดตามงานสำคัญ</span>
        </Link>
        <Link href="/budget-transfer" className={`nav-item ${pathname === "/budget-transfer" ? "active" : ""}`}>
          <ArrowRightLeft size={20} />
          <span>เอกสารโอนงบค่าใช้จ่าย</span>
        </Link>
        <Link href="/teco-checker" className={`nav-item ${pathname === "/teco-checker" ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>ตรวจสอบปิดงาน (TECO)</span>
        </Link>
        
        <Link href="/outage" className={`nav-item ${pathname === "/outage" ? "active" : ""}`}>
          <CalendarDays size={20} />
          <span>แผนงานระดม/แผนใช้รถ</span>
        </Link>

        <Link href="/safety" className={`nav-item ${pathname === "/safety" ? "active" : ""}`}>
          <ShieldCheck size={20} />
          <span>งานความปลอดภัย</span>
        </Link>
        {userRole === 'admin' && (
          <Link href="/safety-hub" className={`nav-item ${pathname === "/safety-hub" ? "active" : ""}`}>
            <Camera size={20} />
            <span>รายงาน Safety Hub</span>
          </Link>
        )}
        <Link href="/guide" className={`nav-item ${pathname === "/guide" ? "active" : ""}`}>
          <BookOpen size={20} />
          <span>คู่มือเทคนิคงานก่อสร้างระบบ 115 kV</span>
        </Link>
        <Link href="/personnel" className={`nav-item ${pathname === "/personnel" ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>ข้อมูลบุคลากร</span>
        </Link>
        <Link href="/driver-ot" className={`nav-item ${pathname === "/driver-ot" ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>คำนวณ OT พขร.</span>
        </Link>
        <Link href="/team-ot" className={`nav-item ${pathname === "/team-ot" ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>คำนวณ OT พนักงาน บ.</span>
        </Link>
        <Link href="/vehicle" className={`nav-item ${pathname === "/vehicle" ? "active" : ""}`}>
          <Car size={20} />
          <span>ระบบยานพาหนะ</span>
        </Link>
        <Link href="/gas-report" className={`nav-item ${pathname === "/gas-report" ? "active" : ""}`}>
          <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M4 22V11c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v11"/><path d="M14 22v-6c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6"/><path d="M18 5V3c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2"/></svg>
          <span>รายงานน้ำมัน (ยพ.6)</span>
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
