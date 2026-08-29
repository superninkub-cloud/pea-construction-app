"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, FileEdit, Bell, User, UploadCloud, FileText, Printer, PackageSearch } from "lucide-react";
import { Suspense } from "react";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStep = searchParams?.get("step") || "1";

  if (pathname?.startsWith("/budget-transfer")) {
    return (
      <nav className="mobile-bottom-nav">
        <Link href="/budget-transfer?step=1" className={`mobile-nav-item ${currentStep === "1" ? "active" : ""}`}>
          <UploadCloud size={24} />
          <span>1. อัปโหลด</span>
        </Link>
        <Link href="/budget-transfer?step=2" className={`mobile-nav-item ${currentStep === "2" ? "active" : ""}`}>
          <FileText size={24} />
          <span>2. ข้อมูล</span>
        </Link>
        <Link href="/budget-transfer?step=3" className={`mobile-nav-item ${currentStep === "3" ? "active" : ""}`}>
          <Printer size={24} />
          <span>3. พิมพ์</span>
        </Link>
      </nav>
    );
  }

  if (pathname?.startsWith("/wire-return")) {
    return (
      <nav className="mobile-bottom-nav">
        <Link href="/wire-return?step=1" className={`mobile-nav-item ${currentStep === "1" ? "active" : ""}`}>
          <UploadCloud size={24} />
          <span>1. อัปโหลด</span>
        </Link>
        <Link href="/wire-return?step=2" className={`mobile-nav-item ${currentStep === "2" ? "active" : ""}`}>
          <PackageSearch size={24} />
          <span>2. ตรวจสอบ</span>
        </Link>
        <Link href="/wire-return?step=3" className={`mobile-nav-item ${currentStep === "3" ? "active" : ""}`}>
          <Printer size={24} />
          <span>3. พิมพ์</span>
        </Link>
      </nav>
    );
  }

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

export default function MobileBottomNav() {
  return (
    <Suspense fallback={<nav className="mobile-bottom-nav"></nav>}>
      <BottomNavContent />
    </Suspense>
  );
}
