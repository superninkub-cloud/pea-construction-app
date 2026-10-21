"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileEdit, CalendarDays, Car, ShieldCheck, BookOpen, AlertCircle, 
  LogOut, Recycle, ArrowRightLeft, Camera, ClipboardList, ChevronDown, ChevronRight, 
  Package, MapPin, Calculator, FileWarning, FileCheck, Wrench, CreditCard, 
  CheckCircle2, Building, PlayCircle, Receipt, PackagePlus, Trash2, Moon, Archive, 
  X, Clock, Sparkles, Briefcase, Percent
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedUpcoming, setSelectedUpcoming] = useState<{
    id: string;
    title: string;
    icon: any;
    desc: string;
  } | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    main: true,
    office: true,
    planning: false,
    docs: false,
    safety: false,
    personnel: false,
    vehicle: false,
  });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ id, title, isFirst = false, badge }: { id: string, title: string, isFirst?: boolean, badge?: string }) => (
    <div
      onClick={(e) => { e.stopPropagation(); toggleSection(id); }}
      className={`px-3 text-[14px] font-semibold text-amber-100 mb-2 flex justify-between items-center cursor-pointer hover:text-white transition-colors group ${isFirst ? 'mt-4' : 'mt-6'}`}
    >
      <div className="flex items-center gap-2">
        <span>{title}</span>
        {badge && (
          <span style={{ fontSize: '0.65rem', backgroundColor: '#f59e0b', color: '#78350f', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
            {badge}
          </span>
        )}
      </div>
      {expanded[id] ? <ChevronDown size={16} className="opacity-70 group-hover:opacity-100" /> : <ChevronRight size={16} className="opacity-70 group-hover:opacity-100" />}
    </div>
  );

  useEffect(() => {
    try {
      const role = sessionStorage.getItem("pea_role");
      setUserRole(role);
      if (role === "office") {
        setExpanded({
          main: true,
          office: true,
          planning: false,
          docs: false,
          safety: false,
          personnel: false,
          vehicle: false,
        });
      } else if (role === "admin") {
        setExpanded({
          main: true,
          office: true,
          planning: false,
          docs: false,
          safety: false,
          personnel: false,
          vehicle: false,
        });
      } else {
        setExpanded({
          main: true,
          office: false,
          planning: false,
          docs: false,
          safety: false,
          personnel: false,
          vehicle: true,
        });
      }
    } catch (error) {
      setUserRole(null);
    }
  }, []);

  const isAdmin = userRole === 'admin';
  const isOffice = userRole === 'office';
  const isUser = userRole === 'user';
  const canAccessRestricted = isAdmin;
  const canAccessGuide = isAdmin || isUser || isOffice;
  const canAccessOfficeSection = isAdmin || isOffice || isUser;

  // 11 โปรแกรมใหม่สำหรับพนักงาน Office ที่อยู่ระหว่างเตรียมพัฒนา
  const officeUpcomingPrograms = [
    {
      id: "procurement-principle",
      title: "โปรแกรมอนุมัติหลักการจัดซื้อจัดจ้าง",
      icon: FileCheck,
      desc: "ระบบจัดทำบันทึกขออนุมัติหลักการจัดซื้อพัสดุและจัดจ้างแรงงานก่อสร้างตาม พ.ร.บ. จัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ",
    },
    {
      id: "car-repair",
      title: "โปรแกรมแจ้งซ่อมรถยนต์",
      icon: Wrench,
      desc: "ระบบออกใบแจ้งส่งซ่อมบำรุงยานพาหนะและเครื่องจักรกลหนักประจำแผนก ติดตามสถานะงานซ่อมอู่และศูนย์บริการ",
    },
    {
      id: "site-expense-extra",
      title: "โปรแกรมขอค่าใช้จ่ายหน้างานเพิ่มเติม",
      icon: CreditCard,
      desc: "ระบบขออนุมัติขยายกรอบวงเงินค่าใช้จ่ายหน้างานก่อสร้าง กรณีมีงานเร่งด่วนหรืองานที่มีความจำเป็นพิเศษ",
    },
    {
      id: "job-close-memo",
      title: "โปรแกรมบันทึกแจ้งปิดงาน",
      icon: CheckCircle2,
      desc: "ระบบจัดทำบันทึกข้อความแจ้งปิดงานก่อสร้างระบบไฟฟ้าอย่างเป็นทางการ ส่งฝ่ายบัญชี แผนกปฏิบัติการ และหน่วยงานที่เกี่ยวข้อง",
    },
    {
      id: "concrete-transfer",
      title: "โปรแกรมขอโอนคอนกรีตจาก กผภ.",
      icon: Building,
      desc: "ระบบจัดทำเอกสารประสานงานขอโอนพัสดุคอนกรีต เสา คอร. และคาน คอร. จากกองผลิตคอนกรีตและอุปกรณ์ (กผภ.)",
    },
    {
      id: "job-open-request",
      title: "โปรแกรมแจ้งขอเปิดงาน",
      icon: PlayCircle,
      desc: "ระบบแจ้งขอเปิด WBS และเริ่มงานก่อสร้างในพื้นที่ พร้อมประสานงานแผนกบริการลูกค้าและแผนกปฏิบัติการ",
    },
    {
      id: "voucher-certify",
      title: "โปรแกรมรับรองใบสำคัญจ่าย",
      icon: Receipt,
      desc: "ระบบออกหนังสือรับรองใบเสร็จรับเงิน/ใบสำคัญรับเงินสำหรับเบิกจ่ายชดใช้เงินยืมทดรองราชการของแผนก",
    },
    {
      id: "shortage-budget",
      title: "โปรแกรมของบซื้อพัสดุขาดแคลน",
      icon: PackagePlus,
      desc: "ระบบเสนอขอจัดสรรงบประมาณเพื่อจัดซื้อพัสดุอุปกรณ์ระบบจำหน่ายที่มีภาวะขาดแคลนในคลังพัสดุ",
    },
    {
      id: "demolish-scrap",
      title: "โปรแกรมขอส่งคืนพัสดุรื้อถอนแบบทำลาย",
      icon: Trash2,
      desc: "ระบบบันทึกรายการและขออนุมัติส่งคืนพัสดุรื้อถอนสภาพชำรุดเสียหายสิ้นเชิงเพื่อดำเนินการจำหน่ายทำลายตามระเบียบ",
    },
    {
      id: "overnight-stay",
      title: "โปรแกรมขออนุมัติพักแรมหน้างาน",
      icon: Moon,
      desc: "ระบบจัดทำหนังสือขออนุมัติให้ชุดงานก่อสร้างพักค้างแรมต่างพื้นที่ เพื่อประกอบการเบิกจ่ายเบี้ยเลี้ยงที่พัก",
    },
    {
      id: "asset-disposal",
      title: "โปรแกรมจำหน่ายทรัพย์สิน",
      icon: Archive,
      desc: "ระบบจัดทำเอกสารขอตัดบัญชีและจำหน่ายทรัพย์สินระบบจำหน่ายเดิมที่รื้อถอนออกจากระบบไฟฟ้า",
    },
  ];

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
          <div className="sidebar-subtitle">
            {isOffice ? 'ระบบงานพนักงาน Office' : isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'ระบบก่อสร้าง ผกร.(ก3)'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* หน้าหลัก */}
        <SectionHeader id="main" title="หน้าหลัก" isFirst={true} />
        {expanded.main && (
          <div onClick={closeSidebar}>
            <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard งานก่อสร้าง</span>
            </Link>

            {/* เมนูภาคสนาม แสดงเฉพาะเมื่อไม่ใช่ Office */}
            {!isOffice && (
              <>
                <Link href="/update" className={`nav-item ${pathname === "/update" ? "active" : ""}`}>
                  <FileEdit size={20} />
                  <span>อัปเดตสถานะงาน</span>
                </Link>
                <Link href="/wire-return" className={`nav-item ${pathname === "/wire-return" ? "active" : ""}`}>
                  <Recycle size={20} />
                  <span>สถานะการคืนเศษสาย</span>
                </Link>
                {canAccessRestricted && (
                  <Link href="/material-tracking" className={`nav-item ${pathname === "/material-tracking" ? "active" : ""}`}>
                    <Package size={20} />
                    <span>ติดตามพัสดุช่าง</span>
                  </Link>
                )}
                {canAccessRestricted && (
                  <Link href="/my-tasks" className={`nav-item ${pathname === "/my-tasks" ? "active" : ""}`}>
                    <ClipboardList size={20} />
                    <span>มอบหมายและติดตามงาน</span>
                  </Link>
                )}
                <Link href="/outage" className={`nav-item ${pathname === "/outage" ? "active" : ""}`}>
                  <CalendarDays size={20} />
                  <span>แผนงานระบบ / แผนใช้รถ</span>
                </Link>
              </>
            )}
          </div>
        )}

        {/* หมวดงานสำนักงานและธุรการ (Office) - เปิดให้เฉพาะ Admin และ Office */}
        {canAccessOfficeSection && (
          <>
            <SectionHeader 
              id="office" 
              title="งานเอกสารและธุรการ (Office)" 
              badge={isOffice ? "พนักงาน Office" : "Office"} 
            />
            {expanded.office && (
              <div onClick={closeSidebar}>
                {/* 3 โปรแกรมที่เปิดใช้งานจริงแล้ว */}
                <Link 
                  href="/budget-transfer" 
                  className={`nav-item ${pathname === "/budget-transfer" ? "active" : ""}`}
                  style={{ backgroundColor: pathname === "/budget-transfer" ? undefined : 'rgba(126, 34, 206, 0.15)' }}
                >
                  <ArrowRightLeft size={20} className="text-purple-300" />
                  <span className="font-semibold text-white">เอกสารใบขอเบิกค่าใช้จ่าย</span>
                </Link>

                <Link 
                  href="/account-adjust" 
                  className={`nav-item ${pathname === "/account-adjust" ? "active" : ""}`}
                  style={{ 
                    backgroundColor: pathname === "/account-adjust" ? undefined : 'rgba(126, 34, 206, 0.22)',
                    border: pathname === "/account-adjust" ? undefined : '1px solid rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <Calculator size={20} className="text-purple-300" />
                  <span className="font-semibold text-white">โปรแกรมปรับปรุงบัญชี</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontWeight: 600
                  }}>
                    เปิดใช้งาน
                  </span>
                </Link>

                <Link 
                  href="/wire-clarify" 
                  className={`nav-item ${pathname === "/wire-clarify" ? "active" : ""}`}
                  style={{ 
                    backgroundColor: pathname === "/wire-clarify" ? undefined : 'rgba(234, 88, 12, 0.22)',
                    border: pathname === "/wire-clarify" ? undefined : '1px solid rgba(249, 115, 22, 0.3)'
                  }}
                >
                  <Percent size={20} className="text-orange-400" />
                  <span className="font-semibold text-white">ชี้แจงส่งคืนเศษสายไม่ครบ</span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontWeight: 600
                  }}>
                    เปิดใช้งาน
                  </span>
                </Link>

                <Link 
                  href="/teco-checker" 
                  className={`nav-item ${pathname === "/teco-checker" ? "active" : ""}`}
                  style={{ backgroundColor: pathname === "/teco-checker" ? undefined : 'rgba(126, 34, 206, 0.15)' }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span className="font-semibold text-white">ตรวจสอบปิดงาน (TECO)</span>
                </Link>

                {/* เส้นคั่นโปรแกรมที่เตรียมพัฒนา */}
                <div style={{ margin: '10px 12px 6px', fontSize: '0.68rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Sparkles size={12} />
                  <span>โปรแกรมที่เตรียมเปิดใช้งาน ({officeUpcomingPrograms.length} โปรแกรม)</span>
                </div>

                {/* 13 โปรแกรมใหม่สำหรับพนักงาน Office */}
                {officeUpcomingPrograms.map((prog) => {
                  const IconComponent = prog.icon;
                  return (
                    <div
                      key={prog.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUpcoming(prog);
                      }}
                      className="nav-item group"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        marginBottom: '3px',
                        opacity: 0.9,
                        transition: 'all 0.15s ease',
                      }}
                      title={`${prog.title} (คลิกเพื่อดูรายละเอียด)`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
                        <IconComponent size={17} style={{ color: '#fbbf24', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prog.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.60rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.18)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          padding: '1px 5px',
                          borderRadius: '999px',
                          whiteSpace: 'nowrap',
                          fontWeight: '600'
                        }}
                      >
                        เร็วๆ นี้
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* หมวดภาคสนาม (ซ่อนจากผู้ใช้งาน Office เพื่อความกระชับ) */}
        {!isOffice && (
          <>
            <SectionHeader id="planning" title="บริหาร/วางแผนงานก่อสร้าง" />
            {expanded.planning && (
              <div onClick={closeSidebar}>
                {canAccessRestricted && (
                  <Link href="/planning" className={`nav-item ${pathname === "/planning" ? "active" : ""}`}>
                    <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    <span>วางแผนงานก่อสร้าง</span>
                  </Link>
                )}
                {canAccessRestricted && (
                  <Link href="/important" className={`nav-item ${pathname === "/important" ? "active" : ""}`}>
                    <AlertCircle size={20} />
                    <span>ติดตามงานสำคัญ</span>
                  </Link>
                )}
                <Link href="/emergency-plan" className={`nav-item ${pathname === "/emergency-plan" ? "active" : ""}`}>
                  <MapPin size={20} />
                  <span>งานฉุกเฉิน/รถชนเสา</span>
                </Link>
              </div>
            )}

            <SectionHeader id="docs" title="ตรวจสอบและเอกสาร" />
            {expanded.docs && (
              <div onClick={closeSidebar}>
                <Link href="/estimation" className={`nav-item ${pathname === "/estimation" ? "active" : ""}`}>
                  <ClipboardList size={20} />
                  <span>โปรแกรมประมาณการ</span>
                </Link>
                <Link href="/budget-transfer" className={`nav-item ${pathname === "/budget-transfer" ? "active" : ""}`}>
                  <ArrowRightLeft size={20} />
                  <span>เอกสารใบขอเบิกค่าใช้จ่าย</span>
                </Link>
                <Link href="/teco-checker" className={`nav-item ${pathname === "/teco-checker" ? "active" : ""}`}>
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>ตรวจสอบปิดงาน (TECO)</span>
                </Link>
                <Link href="/guide" className={`nav-item ${pathname === "/guide" ? "active" : ""}`}>
                  <BookOpen size={20} />
                  <span>คู่มือภาคสนามก่อสร้างระบบ 115 kV</span>
                </Link>
              </div>
            )}

            <SectionHeader id="safety" title="ความปลอดภัย" />
            {expanded.safety && (
              <div onClick={closeSidebar}>
                <Link href="/safety" className={`nav-item ${pathname === "/safety" ? "active" : ""}`}>
                  <ShieldCheck size={20} />
                  <span>งานความปลอดภัย</span>
                </Link>
                <Link href="/safety-ppe" className={`nav-item ${pathname === "/safety-ppe" ? "active" : ""}`}>
                  <ShieldCheck size={20} />
                  <span>ตรวจสอบอุปกรณ์ความปลอดภัยและ PPE</span>
                </Link>
                {isAdmin && (
                  <Link href="/safety-hub" className={`nav-item ${pathname === "/safety-hub" ? "active" : ""}`}>
                    <Camera size={20} />
                    <span>รายงาน Safety Hub</span>
                  </Link>
                )}
              </div>
            )}

            <SectionHeader id="personnel" title="บุคลากร" />
            {expanded.personnel && (
              <div onClick={closeSidebar}>
                <Link href="/personnel" className={`nav-item ${pathname === "/personnel" ? "active" : ""}`}>
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <span>ข้อมูลบุคลากร</span>
                </Link>
                <Link href="/driver-ot" className={`nav-item ${pathname === "/driver-ot" ? "active" : ""}`}>
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span>คำนวณ OT พขร.</span>
                </Link>
                <Link href="/team-ot" className={`nav-item ${pathname === "/team-ot" ? "active" : ""}`}>
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  <span>คำนวณ OT พนักงาน บ.</span>
                </Link>
              </div>
            )}

            <SectionHeader id="vehicle" title="ยานพาหนะและเชื้อเพลิง" />
            {expanded.vehicle && (
              <div onClick={closeSidebar}>
                <Link href="/vehicle" className={`nav-item ${pathname === "/vehicle" ? "active" : ""}`}>
                  <Car size={20} />
                  <span>ระบบยานพาหนะ</span>
                </Link>
                <Link href="/gas-report" className={`nav-item ${pathname === "/gas-report" ? "active" : ""}`}>
                  <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "20px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20" /><path d="M4 22V11c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v11" /><path d="M14 22v-6c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6" /><path d="M18 5V3c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2" /></svg>
                  <span>รายงานน้ำมัน (ยพ.6)</span>
                </Link>
              </div>
            )}
          </>
        )}

        {/* ส่วนท้าย Sidebar: คู่มือการใช้งานเว็บแอพ (ซ่อนสำหรับ Guest) */}
        <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px' }}>
          {canAccessGuide && (
            <div onClick={closeSidebar}>
              <Link
                href="/app-guide"
                className={`nav-item ${pathname === "/app-guide" ? "active" : ""}`}
                style={{
                  background: pathname === "/app-guide"
                    ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: pathname === "/app-guide"
                    ? '1px solid #a78bfa'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: pathname === "/app-guide" ? '0 4px 12px rgba(124, 58, 237, 0.35)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', lineHeight: 1.2 }}>คู่มือการใช้งานเว็บแอพ</span>
                    <span style={{ fontSize: '0.70rem', color: '#cbd5e1' }}>วิธีใช้ระบบ ผกร.(ก3)</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    backgroundColor: '#f59e0b',
                    color: '#78350f',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  คู่มือ
                </span>
              </Link>
            </div>
          )}

          <div
            onClick={() => {
              sessionStorage.removeItem("pea_auth");
              sessionStorage.removeItem("pea_role");
              window.location.reload();
            }}
            className="nav-item"
            style={{
              marginTop: '4px',
              padding: '10px 14px',
              borderRadius: '10px',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <LogOut size={18} />
            <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>ออกจากระบบ</span>
          </div>
        </div>
      </nav>

      {/* Modal หน้าต่างป๊อปอัปแจ้งรายละเอียดโปรแกรมที่อยู่ระหว่างการพัฒนา */}
      {selectedUpcoming && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setSelectedUpcoming(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUpcoming(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)'
              }}
            >
              {(() => {
                const IconComponent = selectedUpcoming.icon;
                return <IconComponent size={32} />;
              })()}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' }}>
              <Clock size={14} />
              <span>เตรียมเปิดใช้งานในเวอร์ชันถัดไป (เร็วๆ นี้)</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              {selectedUpcoming.title}
            </h3>

            <p style={{ fontSize: '0.90rem', color: '#64748b', lineHeight: 1.6, marginBottom: '18px' }}>
              {selectedUpcoming.desc}
            </p>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569', marginBottom: '22px', textAlign: 'left', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} className="text-amber-500" />
                <span>สถานะการพัฒนาสำหรับพนักงาน Office:</span>
              </div>
              <div>โมดูลนี้ได้รับการจัดเตรียมเมนูใน Sidebar เรียบร้อยแล้ว ขณะนี้ฝ่ายพัฒนากำลังเชื่อมโยงแบบฟอร์มเอกสารทางการ กฟภ. และระบบฐานข้อมูล หากต้องการสอบถามหรือเสนอแนะเพิ่มเติม สามารถติดต่อ ชผ.กร. ได้โดยตรงครับ</div>
            </div>

            <button
              onClick={() => setSelectedUpcoming(null)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#7e22ce',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(126, 34, 206, 0.35)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#6b21a8"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#7e22ce"}
            >
              รับทราบ (ปิดหน้าต่าง)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
