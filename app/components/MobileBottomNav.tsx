"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileEdit, Bell, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      <Link href="/" className={`mobile-nav-item ${pathname === "/" ? "active" : ""}`}>
        <LayoutDashboard size={24} />
        <span>หน้าหลัก</span>
      </Link>
      <Link href="/update" className={`mobile-nav-item ${pathname === "/update" ? "active" : ""}`}>
        <FileEdit size={24} />
        <span>งานก่อสร้าง</span>
      </Link>
      <Link href="#" className="mobile-nav-item">
        <Bell size={24} />
        <span>แจ้งเตือน</span>
      </Link>
      <Link href="#" className="mobile-nav-item">
        <User size={24} />
        <span>โปรไฟล์</span>
      </Link>
    </nav>
  );
}
