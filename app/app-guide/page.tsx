"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import TopBar from "../components/TopBar";
import {
  BookOpen,
  Search,
  Sparkles,
  LayoutDashboard,
  FileEdit,
  Recycle,
  Package,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  MapPin,
  FileText,
  ShieldCheck,
  Users,
  Car,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info,
  Smartphone,
  Shield,
  Layers,
  ArrowRightLeft,
  ArrowRight,
  Zap,
  Wrench,
  Clock,
  Key,
  FolderOpen
} from "lucide-react";

export default function AppGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | "guest">("user");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    intro: true,
    roles: true,
    overview: true,
    update: true,
    wire: true,
    material: true,
    tasks: true,
    outage: true,
    planning: true,
    emergency: true,
    estimation: true,
    budget: true,
    teco: true,
    guide115: true,
    safety: true,
    fleet: true,
    faq: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    Object.keys(expandedSections).forEach((key) => {
      allExpanded[key] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    Object.keys(expandedSections).forEach((key) => {
      allCollapsed[key] = false;
    });
    setExpandedSections(allCollapsed);
  };

  const categories = [
    { id: "all", label: "ทั้งหมด (All Topics)" },
    { id: "overview", label: "📊 หน้าหลัก & สรุปภาพรวม" },
    { id: "tasks", label: "🔨 งาน & พัสดุก่อสร้าง" },
    { id: "planning", label: "📅 วางแผน & ฉุกเฉิน" },
    { id: "docs", label: "📑 ประมาณการ & เอกสาร" },
    { id: "safety", label: "🦺 ความปลอดภัย & PPE" },
    { id: "fleet", label: "🚗 ยานพาหนะ & เชื้อเพลิง" },
    { id: "faq", label: "❓ FAQ & การตั้งค่า" },
  ];

  // Modules list for searching and filtering
  const modules = useMemo(
    () => [
      {
        id: "overview",
        category: "overview",
        path: "/",
        title: "1. Dashboard งานก่อสร้าง (ภาพรวมโครงการ)",
        badge: "หน้าหลัก",
        badgeColor: "bg-purple-100 text-purple-700",
        summary: "ศูนย์รวมข้อมูลสถิติ สรุปความก้าวหน้าโครงการ และรายงานผลการดำเนินงานก่อสร้างทั้งหมด",
        keywords: "dashboard หน้าหลัก ภาพรวม สถิติ wbs กรองสถานะ ปีงบประมาณ ค้นหา กราฟ ผู้ควบคุมงาน",
        steps: [
          {
            title: "การดูสรุปการ์ดตัวเลข (Key Metrics)",
            desc: "ด้านบนสุดจะแสดงตัวเลขโครงการทั้งหมด, งานที่กำลังดำเนินการ, งานที่รอดำเนินการ และงานที่แล้วเสร็จ พร้อมมูลค่างานรวม",
          },
          {
            title: "การใช้ตัวกรองหลายมิติ (Multi-Filtering)",
            desc: "สามารถเลือกกรองตามปีงบประมาณ (ก่อน 2568, 2568, 2569), ผู้ควบคุมงาน (Supervisor), สถานะงานก่อสร้าง หรือพิมพ์ค้นหาด้วยเลข WBS / ชื่องานได้ทันที",
          },
          {
            title: "การวิเคราะห์กราฟแท่งและสัดส่วน (Analytics Charts)",
            desc: "กราฟแท่งจะเปรียบเทียบสัดส่วนงานแต่ละสถานะ และแผนงานดำเนินงานเพื่อใช้วิเคราะห์ในที่ประชุมประจำสัปดาห์",
          },
          {
            title: "การพิมพ์และส่งออกเอกสาร (Print Report)",
            desc: "กดปุ่ม 'พิมพ์หน้านี้' ที่มุมขวาบน ระบบจะจัดฟอร์แมตกระดาษให้พร้อมพิมพ์เป็นเอกสารสรุปสถานะ หรือ Save as PDF ได้อย่างสวยงาม",
          },
        ],
        tips: "สามารถใช้ช่องค้นหาพิมพ์เพียงบางส่วนของเลข WBS (เช่น 66- หรือ 67-) เพื่อดึงเฉพาะกลุ่มงานที่ต้องการได้อย่างรวดเร็ว",
      },
      {
        id: "update",
        category: "tasks",
        path: "/update",
        title: "2. อัปเดตสถานะงาน (Update Status)",
        badge: "งานภาคสนาม",
        badgeColor: "bg-blue-100 text-blue-700",
        summary: "บันทึกความคืบหน้างานก่อสร้างประจำวัน รายงานเปอร์เซ็นต์งาน แนบภาพถ่ายหน้างาน และพิกัด GPS",
        keywords: "อัปเดต สถานะ เปอร์เซ็นต์ รูปถ่าย gps พิกัด กล้อง เศษสาย คำนวณสาย ประวัติ history",
        steps: [
          {
            title: "เลือกโครงการที่ต้องการอัปเดต",
            desc: "เลือกค้นหาด้วยเลข WBS หรือคลิกเลือกจากรายการโครงการที่รับผิดชอบ",
          },
          {
            title: "กรอกข้อมูลความคืบหน้าและเปอร์เซ็นต์งาน (%)",
            desc: "ระบุเปอร์เซ็นต์ความคืบหน้า (0-100%), สถานะปัจจุบัน, วันที่เริ่มงานจริง, วันที่คาดว่าจะแล้วเสร็จ, แผนดำเนินการถัดไป และแผนปิดงาน",
          },
          {
            title: "ถ่ายภาพหรือแนบภาพถ่ายหน้างานพร้อมพิกัด GPS",
            desc: "อัปโหลดภาพถ่ายการปฏิบัติงาน ระบบจะอ่านข้อมูลพิกัดละติจูด/ลองจิจูดจากภาพถ่ายโดยอัตโนมัติ (Exif Data) เพื่อยืนยันสถานที่ทำงานจริง",
          },
          {
            title: "ใช้โปรแกรมคำนวณเศษสายส่ง (Wire Scrap Calculator)",
            desc: "มีเครื่องมือในตัวสำหรับคำนวณความยาว (เมตร) แปลงเป็นน้ำหนัก (กก.) หรือสัดส่วน % คืนเศษสายตามตารางมาตรฐานสายตัวนำ กฟภ.",
          },
          {
            title: "บันทึกและตรวจสอบประวัติ (History Log)",
            desc: "กดปุ่ม 'บันทึกข้อมูล' ระบบจะเก็บประวัติการอัปเดตของแต่ละวันไว้ สามารถเปิดแท็บ 'ประวัติการอัปเดต' เพื่อดูย้อนหลังได้ตลอดเวลา",
          },
        ],
        tips: "ควรถ่ายภาพหน้างานผ่านกล้องมือถือที่เปิดระบบ Location/GPS ไว้ เพื่อให้ระบบดึงพิกัดลงแผนที่ได้อย่างแม่นยำ 100%",
        warning: "หากไม่มีการแก้ไขสถานะเป็นเวลาเกินกำหนด ระบบจะขึ้นสัญลักษณ์แจ้งเตือนงานค้างอัปเดต",
      },
      {
        id: "wire",
        category: "tasks",
        path: "/wire-return",
        title: "3. สถานะการคืนเศษสาย (Wire Return Tracking)",
        badge: "คลังพัสดุ",
        badgeColor: "bg-emerald-100 text-emerald-700",
        summary: "ระบบติดตามการส่งคืนเศษสายเคเบิลและสายตัวนำกลับคลังพัสดุ ป้องกันปัญหาพัสดุค้างส่งมอบ",
        keywords: "คืนสาย เศษสาย ชั่งน้ำหนัก zpsr018 pdf ตัวนำ คลังพัสดุ ลวดสาย ส่งคืน scrap",
        steps: [
          {
            title: "ค้นหาหรือนำเข้าข้อมูลสายตาม WBS",
            desc: "เลือกรหัสโครงการ หรือใช้ฟังก์ชัน 'อัปโหลดรายงาน SAP (ZPSR018 PDF)' เพื่อให้ระบบดึงรายการสายเคเบิลที่เบิกไปโดยอัตโนมัติ",
          },
          {
            title: "ตรวจสอบประเภทสายและความยาวตามแบบ",
            desc: "ระบบจะแสดงรายการสาย เช่น สายเปลือย, สาย SAC, สาย XLPE พร้อมความยาวที่เบิกและน้ำหนักมาตรฐานที่ต้องคืน",
          },
          {
            title: "บันทึกน้ำหนักที่ชั่งคืนจริง (Returned Weight)",
            desc: "เมื่อนำเศษสายไปชั่งที่คลังพัสดุ ให้กรอกน้ำหนักที่ชั่งได้จริง (กก.) พร้อมเลือกสถานะการส่งคืน เช่น 'คืนครบแล้ว', 'คืนบางส่วน', 'ยังไม่คืน'",
          },
          {
            title: "พิมพ์รายงานสรุปการคืนเศษสาย",
            desc: "กดพิมพ์สรุปเพื่อแนบเป็นหลักฐานประกอบเอกสารปิดงาน (TECO) ส่งฝ่ายบัญชีและคลังพัสดุ",
          },
        ],
        tips: "สามารถใช้เครื่องคิดเลขแปลงความยาวเป็นน้ำหนักเพื่อตรวจสอบความสมเหตุสมผลของเศษสายก่อนนำส่งคืนจริง",
      },
      {
        id: "material",
        category: "tasks",
        path: "/material-tracking",
        title: "4. ติดตามพัสดุช่าง (Material & Tool Tracking)",
        badge: "พัสดุ & ช่าง",
        badgeColor: "bg-amber-100 text-amber-700",
        summary: "ติดตามการเบิก-จ่ายพัสดุอุปกรณ์งานก่อสร้าง ตรวจสอบสถานะการติดตั้งและการรื้อถอนรายบุคคล",
        keywords: "พัสดุ ช่าง เบิกของ ติดตั้ง รื้อถอน คืนดี คืนชำรุด สต็อก camp inventory sap",
        steps: [
          {
            title: "เลือกดูพัสดุตามช่างผู้รับผิดชอบหรือ WBS",
            desc: "เลือกฟิลเตอร์ช่างผู้ควบคุมงานเพื่อดูเฉพาะรายการพัสดุที่ช่างคนนั้นเบิกไปปฏิบัติงาน",
          },
          {
            title: "ติดตามสถานะพัสดุ 6 หมวดสำคัญ",
            desc: "1) นำไปก่อสร้างแล้ว 2) ยังไม่ได้ก่อสร้าง 3) ยังไม่รื้อ 4) รื้อแล้วยังไม่คืน 5) คืนดี (ส่งคลัง) 6) คืนชำรุด",
          },
          {
            title: "อัปเดตจำนวนพัสดุที่ติดตั้งหรือรื้อถอนจริง",
            desc: "กรอกจำนวนอุปกรณ์ที่ดำเนินการแล้วเสร็จ ระบบจะคำนวณจำนวนคงเหลือให้อัตโนมัติ",
          },
          {
            title: "ถ่ายรูปพัสดุหน้างานเพื่อยืนยันสภาพ",
            desc: "สามารถกดถ่ายรูปพัสดุที่รื้อถอน หรือพัสดุชำรุดเพื่อบันทึกไว้ในระบบก่อนส่งคืนคลัง",
          },
          {
            title: "ตรวจสอบคลังพักพัสดุช่าง (Camp Inventory)",
            desc: "ดูรายการพัสดุและเครื่องมือที่อยู่ที่แคมป์ช่าง เพื่อป้องกันของสูญหายหรือเบิกซ้ำซ้อน",
          },
        ],
        tips: "การระบุพัสดุรื้อถอน 'คืนดี' และ 'คืนชำรุด' ให้ชัดเจนตั้งแต่หน้างาน จะช่วยให้การทำเอกสารส่งคืนคลังรวดเร็วขึ้นมาก",
      },
      {
        id: "tasks",
        category: "tasks",
        path: "/my-tasks",
        title: "5. มอบหมายและติดตามงาน (My Tasks & Assignments)",
        badge: "บริหารทีม",
        badgeColor: "bg-indigo-100 text-indigo-700",
        summary: "มอบหมายภารกิจประจำวันให้ทีมงาน กำหนดลำดับความสำคัญ และติดตามสถานะแบบเรียลไทม์",
        keywords: "มอบหมาย งานของฉัน tasks ช่าง มอบหมายงาน priority ด่วน เสร็จ กำหนดส่ง overdue",
        steps: [
          {
            title: "สร้างงานใหม่ (Add Task)",
            desc: "กดปุ่ม '+ มอบหมายงาน' ระบุชื่องาน, เลข WBS, รายละเอียดงาน, พิกัดสถานที่ และกำหนดส่งมอบ",
          },
          {
            title: "เลือกผู้รับผิดชอบ (Assignee) และระดับความสำคัญ",
            desc: "เลือกช่างผู้รับผิดชอบจากรายชื่อบุคลากร พร้อมเลือกระดับความสำคัญ: 'ฉุกเฉินด่วนที่สุด', 'สำคัญมาก', 'ปานกลาง', หรือ 'ทั่วไป'",
          },
          {
            title: "ช่างเปิดดูรายการงานส่วนบุคคล (My Tasks)",
            desc: "ช่างสามารถเข้ามาดูเฉพาะงานที่ตนเองได้รับมอบหมาย พร้อมเบอร์โทรและแผนที่นำทางไปยังหน้างาน",
          },
          {
            title: "อัปเดตสถานะงาน (Pending -> In Progress -> Done)",
            desc: "เมื่อเริ่มทำงานให้กด 'เริ่มดำเนินการ' และเมื่อทำเสร็จให้กด 'เสร็จสิ้น' พร้อมแนบรูปถ่ายจบงาน",
          },
          {
            title: "ระบบแจ้งเตือนงานเกินกำหนด (Overdue Alert)",
            desc: "งานที่เลยวันกำหนดส่งจะถูกไฮไลต์สีแดงเตือนผู้ควบคุมงานทันทีเพื่อเร่งรัดการปฏิบัติงาน",
          },
        ],
        tips: "สามารถกดดูงานเรียงตามความสำคัญ (Priority) เพื่อให้ทีมงานเลือกทำงานเร่งด่วนที่สุดก่อนได้เสมอ",
      },
      {
        id: "outage",
        category: "planning",
        path: "/outage",
        title: "6. แผนงานระบบ / แผนใช้รถ (Outage & Vehicle Schedule)",
        badge: "ปฏิทินงาน",
        badgeColor: "bg-teal-100 text-teal-700",
        summary: "ปฏิทินแสดงตารางดับกระแสไฟฟ้าปฏิบัติงาน และการจองจัดสรรยานพาหนะเครื่องจักรกลหนัก",
        keywords: "ดับไฟ outage ปฏิทิน รถกระเช้า รถเครน แผนงานระบบ แผนใช้รถ หน่วยงาน จองรถ",
        steps: [
          {
            title: "ดูปฏิทินแผนดับไฟประจำเดือน",
            desc: "ปฏิทินจะแสดงรายการดับไฟและแผนงานก่อสร้างในแต่ละวัน สามารถเลื่อนดูเดือนก่อนหน้าหรือถัดไปได้",
          },
          {
            title: "แยกประเภทงานด้วยแถบสี",
            desc: "ระบบแบ่งชัดเจนระหว่าง 'งานหน่วยงานตนเอง' (ผกร.) กับ 'งานภายนอก/หน่วยงานอื่นขอความร่วมมือ'",
          },
          {
            title: "เพิ่มหรือแก้ไขแผนดับไฟ",
            desc: "คลิกที่วันที่ในปฏิทิน กรอกเลข WBS, รายละเอียดการดับไฟ, พื้นที่ที่ได้รับผลกระทบ และเวลาที่กำหนดดับกระแสไฟ",
          },
          {
            title: "วางแผนการใช้รถเครื่องจักร (รถเครน/รถกระเช้า/รถบรรทุก)",
            desc: "ตรวจสอบว่าในวันดับไฟมีการใช้รถซ้ำซ้อนกันหรือไม่ เพื่อจัดสรรรถและพนักงานขับรถให้สอดคล้องกัน",
          },
        ],
        tips: "ควรลงแผนดับไฟล่วงหน้าอย่างน้อย 3-5 วันทำการ เพื่อให้การประสานงานกับศูนย์สั่งการจ่ายไฟ (Dispatcher) ราบรื่น",
      },
      {
        id: "planning",
        category: "planning",
        path: "/planning",
        title: "7. วางแผนงานก่อสร้าง (Gantt Chart & S-Curve)",
        badge: "การวางแผน",
        badgeColor: "bg-cyan-100 text-cyan-700",
        summary: "วางแผนก่อสร้างตาม 7 ขั้นตอนมาตรฐาน กฟภ. พร้อมกราฟ Gantt Chart และ S-Curve วิเคราะห์ความก้าวหน้า",
        keywords: "วางแผน planning gantt s-curve 7ขั้นตอน ขุดหลุม ปักเสา พาดสาย รื้อถอน ความก้าวหน้า",
        steps: [
          {
            title: "เลือกโครงการที่ต้องการวางแผน",
            desc: "เลือกโครงการจากตาราง หรือค้นหาด้วยเลข WBS เพื่อเข้าสู่แดชบอร์ดวางแผนงาน",
          },
          {
            title: "กำหนดวันเริ่มต้น-สิ้นสุดของ 7 ขั้นตอนมาตรฐาน กฟภ.",
            desc: "0. เบิกของเตรียมอุปกรณ์ (น้ำหนัก 5%)\n1. ขุดหลุมปักเสา (น้ำหนัก 15%)\n2. ปักเสา (น้ำหนัก 20%)\n3. ติดตั้งอุปกรณ์ประกอบหัวเสา (น้ำหนัก 20%)\n4. พาดสายแรงสูง (น้ำหนัก 20%)\n5. พาดสายแรงต่ำ (น้ำหนัก 10%)\n6. งานรื้อถอน (น้ำหนัก 10%)",
          },
          {
            title: "ดูแถบความก้าวหน้า Gantt Chart",
            desc: "เปิดแท็บ 'Gantt Chart' เพื่อดู Timeline แผนงานและผลการทำงานจริง (Actual vs Planned) ของแต่ละขั้นตอน",
          },
          {
            title: "วิเคราะห์กราฟ S-Curve",
            desc: "ดูกราฟเส้น S-Curve เปรียบเทียบเส้นแผนงานกับเส้นผลงานจริง หากเส้นจริงต่ำกว่าแผนแสดงว่างบประมาณหรืองานล่าช้า",
          },
          {
            title: "แผนงานรายเดือน (Monthly Plan) และการพิมพ์",
            desc: "กดพิมพ์แผนงานเพื่อนำไปใช้ในการประชุมติดตามความก้าวหน้าร่วมกับผู้บริหารหรือคณะกรรมการตรวจรับ",
          },
        ],
        tips: "เมื่อปรับจำนวนปริมาณงาน (Quantity) ในแต่ละขั้นตอน ระบบจะคำนวณเปอร์เซ็นต์สะสมของโครงการให้อัตโนมัติตามน้ำหนักมาตรฐาน",
      },
      {
        id: "emergency",
        category: "planning",
        path: "/emergency-plan",
        title: "8. งานฉุกเฉิน / รถชนเสา (Emergency & Accident Response)",
        badge: "ฉุกเฉินเร่งด่วน",
        badgeColor: "bg-rose-100 text-rose-700",
        summary: "ระบบตอบสนองอุบัติเหตุรถชนเสาไฟฟ้า ปักหมุดแผนที่ดาวเทียม สกัดพิกัด GPS อัตโนมัติ และคำนวณพัสดุซ่อมด่วน",
        keywords: "ฉุกเฉิน รถชนเสา อุบัติเหตุ แผนที่ พิกัด gps ด่วน กู้ภัย เสาหัก ซ่อมแซม พัสดุด่วน",
        steps: [
          {
            title: "สร้างเหตุการณ์ฉุกเฉินใหม่ (New Incident)",
            desc: "กดสร้างเหตุการณ์ ระบุชื่อเหตุการณ์ เช่น 'รถบรรทุกชนเสา ถ.เพชรเกษม กม.45' และวันที่เกิดเหตุ",
          },
          {
            title: "อัปโหลดภาพถ่ายความเสียหาย (ดึงพิกัดอัตโนมัติ)",
            desc: "อัปโหลดภาพถ่ายเสาหักหรือสายขาด ระบบจะอ่านพิกัด GPS จากรูปถ่ายและปักหมุดบนแผนที่ดาวเทียมให้ทันที",
          },
          {
            title: "ระบุความเสียหายและจำนวนอุปกรณ์ที่ต้องใช้",
            desc: "ระบุจำนวนเสาที่ต้องเปลี่ยน (เช่น เสา คอร. 12 ม., 14 ม.), คาน, ลูกถ้วย, และสายตัวนำที่ขาด",
          },
          {
            title: "สรุปรายการพัสดุและระดมทีมงาน (Resource Summary)",
            desc: "ระบบจะสรุปรวมพัสดุทั้งหมดที่ต้องเบิกด่วน พร้อมคำนวณจำนวนทีมงานและรถกระเช้าที่ต้องระดมเข้าพื้นที่",
          },
          {
            title: "ส่งออกข้อมูลรายงานเบื้องต้น",
            desc: "สามารถแคปเจอร์แผนที่และข้อมูลความเสียหายส่งเข้ากลุ่ม LINE หรือพิมพ์รายงานด่วนส่งผู้บังคับบัญชา",
          },
        ],
        tips: "สามารถคลิกเลื่อนหมุดบนแผนที่ได้โดยตรงหากรูปถ่ายไม่มีข้อมูลพิกัด GPS เพื่อให้ทีมงานภาคสนามนำทางได้ถูกต้อง",
      },
      {
        id: "estimation",
        category: "docs",
        path: "/estimation",
        title: "9. โปรแกรมประมาณการ (Cost & Assembly Estimation)",
        badge: "ประมาณการ",
        badgeColor: "bg-violet-100 text-violet-700",
        summary: "โปรแกรมจัดทำประมาณการงานก่อสร้างระบบจำหน่าย ประกอบชุด Assembly เสา และคำนวณค่าแรง/ค่าพัสดุ",
        keywords: "ประมาณการ ค่าแรง ค่าพัสดุ assembly ต้นทุน boq ราคา เสา อุปกรณ์หัวเสา",
        steps: [
          {
            title: "สร้างหรือเลือกโครงการประมาณการ",
            desc: "กรอกชื่อโครงการหรือเลือกจากรายการที่มีอยู่เพื่อเริ่มจัดทำประมาณการ",
          },
          {
            title: "เพิ่มต้นเสาและเลือกประเภทโครงสร้าง",
            desc: "ระบุชื่อต้นเสา (เช่น ต้นที่ 1, ต้นที่ 2) และเลือกประเภทเสาเดี่ยว/เสาคู่",
          },
          {
            title: "เลือกชุด Assembly มาตรฐาน กฟภ.",
            desc: "เลือกชุดอุปกรณ์หัวเสา เช่น ชุดสายตรง, ชุดดึงสุด, ชุดแยกมุม ฯลฯ ระบบจะดึงรายการพัสดุและค่าแรงตามมาตรฐานให้อัตโนมัติ",
          },
          {
            title: "ตรวจสอบรายการพัสดุและภาพประกอบ",
            desc: "ดูรายการพัสดุแต่ละชิ้นพร้อมรูปภาพอุปกรณ์จริงเพื่อความถูกต้องในการสั่งเบิกของ",
          },
          {
            title: "ดูหน้ารวมสรุป (Summary BOQ) และสั่งพิมพ์",
            desc: "เปิดแท็บ 'สรุปรายการทั้งหมด' เพื่อดูยอดรวมค่าพัสดุ, ค่าแรงงาน และพิมพ์เอกสารประมาณการ",
          },
        ],
        tips: "สามารถเพิ่มรายการพัสดุพิเศษเพิ่มเติม (Custom Items) ที่ไม่มีใน Assembly มาตรฐานได้ตลอดเวลา",
      },
      {
        id: "budget",
        category: "docs",
        path: "/budget-transfer",
        title: "10. เอกสารใบขอเบิกค่าใช้จ่าย (Budget Transfer & Signatures)",
        badge: "เอกสารการเงิน",
        badgeColor: "bg-fuchsia-100 text-fuchsia-700",
        summary: "จัดทำเอกสารขอเบิกค่าใช้จ่ายงานก่อสร้าง โอนงบประมาณระหว่าง Network พร้อมระบบลงนามดิจิทัล",
        keywords: "ขอเบิก โอนงบประมาณ ค่าใช้จ่าย ลายเซ็น network wbs งบประมาณ เงินยืม เอกสาร",
        steps: [
          {
            title: "Step 1: กรอกข้อมูลโครงการและเลขที่เอกสาร",
            desc: "กรอกเลขที่หนังสือ, วันที่, เลข WBS, ชื่องานก่อสร้าง และข้อมูลผู้ขอเบิก",
          },
          {
            title: "Step 2: จัดสรรและโอนงบประมาณระหว่าง Network",
            desc: "ระบุรายการค่าใช้จ่ายที่ต้องการเบิก หรือโอนย้ายระหว่างหมวดงบประมาณ ระบบมีแผนผังแสดงทิศทางการโอนงบชัดเจน",
          },
          {
            title: "Step 3: ตรวจสอบแบบฟอร์มทางการและลงนามดิจิทัล",
            desc: "ระบบจะสร้างแบบฟอร์มเอกสารมาตรฐานของ กฟภ. พร้อมตราสัญลักษณ์ และพื้นที่ลงนามของผู้ขอเบิกและผู้อนุมัติ",
          },
          {
            title: "บันทึกและพิมพ์เอกสาร (Print / Export PDF)",
            desc: "กดพิมพ์เพื่อพิมพ์ออกเครื่องพิมพ์ หรือบันทึกเป็นไฟล์ PDF ส่งฝ่ายบัญชีและการเงินได้ทันที",
          },
        ],
        tips: "ระบบจะคำนวณยอดเงินคงเหลือหลังการโอนงบให้แบบเรียลไทม์ ป้องกันปัญหางบประมาณติดลบ",
      },
      {
        id: "teco",
        category: "docs",
        path: "/teco-checker",
        title: "11. ตรวจสอบปิดงาน TECO (TECO Readiness Checker)",
        badge: "ตรวจปิดงาน",
        badgeColor: "bg-amber-100 text-amber-700",
        summary: "เครื่องมือตรวจสอบความพร้อมก่อนส่งปิดงานทางเทคนิค (TECO) ในระบบ SAP ป้องกันเอกสารตีกลับ",
        keywords: "teco ปิดงาน ตรวจสอบ zpsr018 sap ค้างส่ง เศษสาย คืนพัสดุ ตรวจรับ เสร็จสมบูรณ์",
        steps: [
          {
            title: "อัปโหลดรายงาน SAP ZPSR018 (ไฟล์ PDF)",
            desc: "ลากไฟล์รายงานพัสดุคงค้าง ZPSR018 จากระบบ SAP มาวางในช่องอัปโหลด หรือกดเลือกไฟล์จากเครื่อง",
          },
          {
            title: "ระบบประมวลผลและตรวจสอบเงื่อนไขอัตโนมัติ (AI Analysis)",
            desc: "ระบบจะสแกนหา: 1) พัสดุที่เบิกแล้วยังไม่ตัดจ่าย 2) เศษสายที่ยังไม่ส่งคืน 3) ยอดเงินคงค้างที่ยังไม่เคลียร์",
          },
          {
            title: "อ่านรายงานผลการตรวจสอบ (Checklist Result)",
            desc: "ระบบจะแสดงเป็นข้อๆ อย่างชัดเจนว่าจุดไหน 'ผ่าน (Pass)' หรือจุดไหน 'ต้องแก้ไข (Action Required)' ก่อนกดยืนยัน TECO",
          },
          {
            title: "ดำเนินการแก้ไขและสั่งพิมพ์ผลตรวจรับ",
            desc: "แก้ไขรายการที่ติดปัญหาให้ครบถ้วน แล้วนำผลการตรวจสอบแนบในชุดเอกสารส่งปิดงานในระบบ SAP",
          },
        ],
        tips: "การตรวจสอบผ่านเครื่องมือนี้ก่อนส่งทำ TECO ใน SAP จะลดเวลาการตรวจรับและป้องกันปัญหาการโดนปฏิเสธจากฝ่ายบัญชีได้ 100%",
      },
      {
        id: "guide115",
        category: "docs",
        path: "/guide",
        title: "12. คู่มือภาคสนามก่อสร้างระบบ 115 kV (Technical Engineering Guide)",
        badge: "มาตรฐานวิศวกรรม",
        badgeColor: "bg-sky-100 text-sky-700",
        summary: "คู่มืออ้างอิงมาตรฐานวิศวกรรม 115 kV คำนวณ Sag & Tension ระยะ Clearances พร้อมระบบ AI ผู้ช่วยถาม-ตอบ",
        keywords: "115kv คู่มือ มาตรฐาน sag tension clearances เสาสายส่ง ลูกถ้วย ground ai ถามตอบ",
        steps: [
          {
            title: "เลือกดูหัวข้อมาตรฐานวิศวกรรม",
            desc: "มีหัวข้อครบถ้วน: Sag & Tension, Clearances ระยะห่างปลอดภัย, โครงสร้างเสา (Structures), สายตัวนำ (Conductors), ลูกถ้วย (Insulators), เสาและการต่อลงดิน (Poles & Grounding), และอุปกรณ์ยึดโยง (Hardware)",
          },
          {
            title: "ใช้เครื่องคำนวณระยะตกท้องช้าง (Sag & Tension Calculator)",
            desc: "ใส่ช่วงเสา (Span Length), อุณหภูมิ และชนิดสาย เพื่อคำนวณระยะหย่อนและแรงดึงที่ถูกต้องตามเกณฑ์ กฟภ.",
          },
          {
            title: "ตรวจสอบระยะห่างปลอดภัย (Clearance Table)",
            desc: "ดูระยะห่างต่ำสุดระหว่างสาย 115 kV กับพื้นดิน, อาคาร, ต้นไม้ และสายระบบจำหน่ายแรงต่ำ",
          },
          {
            title: "ถามคำถามกับ AI ผู้ช่วยภาคสนาม (AI Chat Assistant)",
            desc: "กดปุ่มผู้ช่วย AI ที่มุมขวาล่าง พิมพ์ถามข้อสงสัยเกี่ยวกับมาตรฐานก่อสร้าง 115 kV ได้ตลอด 24 ชั่วโมง",
          },
        ],
        tips: "เหมาะอย่างยิ่งสำหรับวิศวกรและผู้ควบคุมงานที่อยู่หน้างานและต้องการเปิดดูมาตรฐานความปลอดภัยทันทีโดยไม่ต้องพกเล่มคู่มือขนาดใหญ่",
      },
      {
        id: "safety",
        category: "safety",
        path: "/safety",
        title: "13. งานความปลอดภัย & PPE (Safety Compliance & PPE)",
        badge: "ความปลอดภัย",
        badgeColor: "bg-green-100 text-green-700",
        summary: "ติดตามแผนการฝึกอบรมความปลอดภัยประจำเดือน 10 หัวข้อ ตรวจสอบสภาพอุปกรณ์ PPE และรายงาน Safety Hub",
        keywords: "ความปลอดภัย safety ppe หมวก ถุงมือ เข็มขัด kyt ฝึกซ้อม อุปกรณ์ ตรวจสอบ อุบัติเหตุ",
        steps: [
          {
            title: "บันทึกผลการฝึกซ้อมความปลอดภัยประจำเดือน (/safety)",
            desc: "ติดตามการฝึกซ้อม 10 หัวข้อมาตรฐาน เช่น การต่อลงดิน, การติดตั้งหัวเสา, การจัดการจราจร, การใช้สลิงจับเสา และการพาดสาย",
          },
          {
            title: "ตรวจสอบสภาพอุปกรณ์ความปลอดภัยและ PPE (/safety-ppe)",
            desc: "ตรวจเช็คสภาพหมวกนิรภัย, แว่นตากันสะเก็ด, ถุงมือหนัง/ถุงมือยางกันไฟฟ้า, รองเท้านิรภัย และเข็มขัดรัดลำตัว (Full Body Harness) ประจำงวด",
          },
          {
            title: "รายงานความปลอดภัย Safety Hub (/safety-hub สำหรับ Admin)",
            desc: "ผู้ดูแลระบบสามารถเข้าดูสถิติอุบัติเหตุเป็นศูนย์, บันทึกภาพถ่ายกิจกรรมความปลอดภัยภาคสนาม และประเมินผลความปลอดภัยรวม",
          },
        ],
        tips: "ความปลอดภัยคือสิ่งสำคัญที่สุด ก่อนเริ่มปฏิบัติงานทุกครั้งต้องทำ KYT (Morning Talk) และตรวจเช็คอุปกรณ์ป้องกันตนเองทุกชิ้น",
      },
      {
        id: "fleet",
        category: "fleet",
        path: "/vehicle",
        title: "14. ระบบยานพาหนะ & รายงานน้ำมัน ยพ.6 (Fleet & Fuel Report)",
        badge: "ยานพาหนะ & น้ำมัน",
        badgeColor: "bg-orange-100 text-orange-700",
        summary: "ทะเบียนรถยนต์และเครื่องจักร คำนวณเบี้ยเลี้ยงและค่าล่วงเวลา (OT) พขร. พร้อมจัดทำรายงานน้ำมัน ยพ.6 อัตโนมัติ",
        keywords: "ยานพาหนะ รถยนต์ รถเครน น้ำมัน ยพ.6 ot พขร. พนักงานขับรถ เลขไมล์ ซ่อมบำรุง",
        steps: [
          {
            title: "ตรวจสอบข้อมูลยานพาหนะ (/vehicle)",
            desc: "ดูทะเบียนรถ, ยี่ห้อ, พนักงานขับรถประจำ, ประวัติการบำรุงรักษา และสถานะความพร้อมใช้งานของรถแต่ละคัน",
          },
          {
            title: "บันทึกการใช้รถและน้ำมันเชื้อเพลิง ยพ.6 (/gas-report)",
            desc: "กรอกข้อมูลวันที่ใช้งาน, ทะเบียนรถ, พขร., สถานที่ปฏิบัติงาน, เลขไมล์เริ่มต้น-สิ้นสุด, จำนวนลิตรที่เติม, ค่าน้ำมัน และค่าซ่อมบำรุง",
          },
          {
            title: "สร้างรายงานสรุปน้ำมันประจำเดือน (Monthly Report)",
            desc: "ระบบจะสรุปรวมระยะทาง (กม.), อัตราสิ้นเปลือง (กม./ลิตร) และยอดเงินรวมของแต่ละคันในรูปแบบตาราง ยพ.6 พร้อมสั่งพิมพ์ส่งฝ่ายบัญชี",
          },
          {
            title: "คำนวณเงินเพิ่มพิเศษและค่าล่วงเวลา พขร. (/driver-ot)",
            desc: "โปรแกรมคำนวณชั่วโมงทำงานนอกเวลาและวันหยุด อัตรา 1.0, 1.5, 3.0 เท่า พร้อมคำนวณเบี้ยเลี้ยงที่พักตามระเบียบ กฟภ.",
          },
          {
            title: "คำนวณค่าล่วงเวลาพนักงานบริษัท (/team-ot)",
            desc: "คำนวณ OT สำหรับพนักงานบริษัทที่ออกปฏิบัติงานก่อสร้างนอกเวลาทำการ",
          },
        ],
        tips: "บันทึกเลขไมล์และแนบรูปถ่ายใบเสร็จน้ำมันทุกครั้งที่เติม เพื่อให้ยอดในรายงาน ยพ.6 ตรงกับใบเสร็จต้นฉบับอย่างสมบูรณ์",
      },
      {
        id: "faq",
        category: "faq",
        path: "/app-guide",
        title: "15. คำถามที่พบบ่อย & การตั้งค่า (FAQ & Technical Tips)",
        badge: "ช่วยเหลือ & ตอบคำถาม",
        badgeColor: "bg-slate-100 text-slate-700",
        summary: "รวมข้อสงสัย วิธีแก้ปัญหาเมื่อระบบติดขัด และเทคนิคการติดตั้งเว็บแอพลงบนหน้าจอมือถือ",
        keywords: "faq คำถาม ช่วยเหลือ แก้ปัญหา ไม่บันทึก ล็อกอิน หลุด mobile ติดตั้ง pwa line",
        steps: [
          {
            title: "Q: ทำไมระบบไม่จำสถานะการล็อกอินเมื่อปิดเบราว์เซอร์?",
            desc: "A: ระบบออกแบบความปลอดภัยด้วย SessionStorage หากเปิดใช้งานในโหมดไม่ระบุตัวตน (Incognito/Private Browsing) หรือปิดแท็บเบราว์เซอร์ ระบบจะให้ยืนยันตัวตนใหม่ หากต้องการให้จำสถานะ แนะนำให้ใช้งานในโหมดเบราว์เซอร์ปกติ",
          },
          {
            title: "Q: รูปถ่ายหน้างานไม่อ่านพิกัด GPS อัตโนมัติ เกิดจากอะไร?",
            desc: "A: เกิดจากแอปกล้องในมือถือยังไม่ได้เปิดสิทธิ์ 'บันทึกตำแหน่งที่ตั้ง (Location Tags)'. วิธีแก้: เข้าไปที่การตั้งค่ากล้องในมือถือ -> เปิด 'Location tags' หรือ 'บันทึกตำแหน่ง' ก่อนถ่ายภาพ",
          },
          {
            title: "Q: วิธีเพิ่มไอคอนเว็บแอพไว้ที่หน้าจอมือถือ (Add to Home Screen)?",
            desc: "A: บน iPhone (Safari): กดปุ่มแชร์ (สัญลักษณ์ลูกศรชี้ขึ้น) -> เลือก 'เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)'\nบน Android (Chrome): กดเมนูจุดสามจุดมุมบนขวา -> เลือก 'ติดตั้งแอพ' หรือ 'เพิ่มลงในหน้าจอหลัก'",
          },
          {
            title: "Q: เมื่อสั่งพิมพ์เอกสาร ทำไมมีวันที่หรือ URL ขึ้นหัวกระดาษ?",
            desc: "A: ในหน้าต่างตัวเลือกการพิมพ์ (Print Dialog) ให้คลิก 'การตั้งค่าเพิ่มเติม (More settings)' -> เอาเครื่องหมายถูกออกจากช่อง 'Headers and footers (หัวกระดาษและท้ายกระดาษ)' เอกสารจะสะอาดเหมือนพิมพ์จากระบบทางการ",
          },
          {
            title: "Q: หากพบปัญหาข้อมูลไม่ตรงหรือต้องการแก้ไข WBS ด่วน ต้องติดต่อใคร?",
            desc: "A: ติดต่อผู้ดูแลระบบ ผกร.(ก3) หรือส่งข้อความแจ้งในกลุ่มประสานงานก่อสร้าง พร้อมระบุเลข WBS และภาพหน้าจอที่มีปัญหา",
          },
        ],
        tips: "สามารถกดปุ่ม 'พิมพ์ / บันทึก PDF' ด้านบนของหน้านี้เพื่อเก็บคู่มือฉบับเต็มไว้เปิดอ่านแบบออฟไลน์ได้ตลอดเวลา",
      },
    ],
    []
  );

  // Filter modules based on search query and category
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchCat = activeCategory === "all" || m.category === activeCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = m.title.toLowerCase().includes(q);
      const inSummary = m.summary.toLowerCase().includes(q);
      const inKeywords = m.keywords.toLowerCase().includes(q);
      const inSteps = m.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
      );

      return inTitle || inSummary || inKeywords || inSteps;
    });
  }, [modules, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* TopBar with custom title */}
      <TopBar title="คู่มือการใช้งานระบบ ผกร.(ก3)" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Hero Section Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl mb-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold mb-3">
                <Sparkles size={16} />
                <span>คู่มือการใช้งานอย่างเป็นทางการ | PEA Construction Web App</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                คู่มือการใช้งานระบบติดตามและบริหารงานก่อสร้าง
              </h1>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed opacity-90">
                รวบรวมขั้นตอนการทำงาน วิธีการใช้งานฟังก์ชันระบบทั้งหมด คำแนะนำการส่งต่อข้อมูล
                และการแก้ปัญหาหน้างาน สำหรับวิศวกร ผู้ควบคุมงาน ช่าง และเจ้าหน้าที่แผนกก่อสร้างและบูรณะระบบจำหน่าย (ผกร.ก3)
              </p>

              {/* Quick Spec Pills */}
              <div className="flex flex-wrap gap-2 mt-4 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white backdrop-blur-sm border border-white/10">
                  ⚡ เวอร์ชันระบบ: 2026.1
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white backdrop-blur-sm border border-white/10">
                  📱 รองรับ PC, แท็บเล็ต และสมาร์ทโฟน
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-white backdrop-blur-sm border border-white/10">
                  🗂️ 15 โมดูลระบบครอบคลุมทุกสายงาน
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 font-bold text-sm shadow hover:bg-purple-50 transition-all duration-150 active:scale-95"
              >
                <Printer size={18} className="text-purple-700" />
                <span>พิมพ์ / บันทึก PDF</span>
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700/60 hover:bg-purple-700 text-white font-semibold text-sm border border-purple-400/30 transition-all duration-150"
              >
                <LayoutDashboard size={18} />
                <span>ไปที่ Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Search & Filter Controls */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาตามชื่อโมดูล, WBS, พัสดุ, หรือวิธีใช้งาน..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="text-xs text-slate-500 font-medium">
                พบ <span className="text-purple-700 font-bold">{filteredModules.length}</span> หัวข้อ
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  ขยายทั้งหมด
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  ย่อทั้งหมด
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1 scrollbar-thin">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  activeCategory === c.id
                    ? "bg-purple-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roles & Permissions Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Key size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">ระดับสิทธิ์การเข้าใช้งานระบบ (Roles & Permissions)</h2>
                <p className="text-xs text-slate-500">ระบบแบ่งการทำงานตามสิทธิ์ 3 ระดับเพื่อความถูกต้องและความปลอดภัยของข้อมูล</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedRole("user")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedRole === "user" ? "bg-white text-purple-800 shadow-sm" : "text-slate-600"
                }`}
              >
                👷 บุคลากรแผนก (User)
              </button>
              <button
                onClick={() => setSelectedRole("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedRole === "admin" ? "bg-white text-purple-800 shadow-sm" : "text-slate-600"
                }`}
              >
                🛡️ ผู้ดูแลระบบ (Admin)
              </button>
              <button
                onClick={() => setSelectedRole("guest")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedRole === "guest" ? "bg-white text-purple-800 shadow-sm" : "text-slate-600"
                }`}
              >
                👁️ บุคคลภายนอก (Guest)
              </button>
            </div>
          </div>

          {selectedRole === "user" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              <div>
                <div className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-purple-600" />
                  สิทธิ์การทำงานหลัก
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  เหมาะสำหรับช่าง ผู้ควบคุมงาน และเจ้าหน้าที่ภาคสนาม สามารถอัปเดตสถานะงาน, ส่งคืนเศษสาย, บันทึกรายงานน้ำมัน ยพ.6 และคำนวณเงิน OT ได้
                </p>
              </div>
              <div>
                <div className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <Key size={16} className="text-purple-600" />
                  การเข้าสู่ระบบ
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ล็อกอินด้วยรหัสผ่านบุคลากรแผนกผกร. (ค่ามาตรฐาน: <code className="bg-white px-1.5 py-0.5 rounded text-purple-700 font-mono font-bold">pscc3</code>)
                </p>
              </div>
              <div>
                <div className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <Shield size={16} className="text-purple-600" />
                  ข้อจำกัด
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ไม่สามารถลบโครงการหลัก หรือเข้าถึงเมนูของ Admin ได้ ได้แก่ Safety Hub, วางแผนงานก่อสร้าง, ติดตามพัสดุช่าง, มอบหมายและติดตามงาน และติดตามงานสำคัญ
                </p>
              </div>
            </div>
          )}

          {selectedRole === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <div>
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-amber-600" />
                  สิทธิ์ระดับสูงสุด (Full Access)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  สำหรับหัวหน้าแผนกและผู้ดูแลระบบ เข้าถึงทุกเมนู รวมถึงเมนูที่เปิดให้เฉพาะ Admin ได้แก่ วางแผนงานก่อสร้าง, ติดตามพัสดุช่าง, มอบหมายและติดตามงาน, ติดตามงานสำคัญ และรายงาน Safety Hub, ลบหรือแก้ไขข้อมูลโครงการหลัก และอนุมัติเอกสารขอเบิกค่าใช้จ่าย
                </p>
              </div>
              <div>
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Key size={16} className="text-amber-600" />
                  การเข้าสู่ระบบ
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ล็อกอินด้วยรหัสผ่านผู้ดูแลระบบ (Admin Password) ประจำแผนก
                </p>
              </div>
              <div>
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Shield size={16} className="text-amber-600" />
                  ความรับผิดชอบ
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ตรวจสอบความถูกต้องของข้อมูลก่อนส่งต่อเข้าระบบสารสนเทศกลาง กฟภ. (SAP ERP)
                </p>
              </div>
            </div>
          )}

          {selectedRole === "guest" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-slate-500" />
                  สิทธิ์การดูข้อมูล (Read-Only)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  สำหรับผู้มาติดต่อ บุคคลภายนอก หรือผู้บริหารที่ต้องการดูเฉพาะภาพรวม Dashboard, แผนดับไฟปฏิบัติงาน และค้นหาคู่มือภาคสนาม 115 kV
                </p>
              </div>
              <div>
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Key size={16} className="text-slate-500" />
                  การเข้าสู่ระบบ
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  กดปุ่ม &quot;เข้าใช้งานแบบผู้เยี่ยมชม (Guest Login)&quot; ได้ทันทีโดยไม่ต้องกรอกรหัสผ่าน
                </p>
              </div>
              <div>
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Shield size={16} className="text-slate-500" />
                  ข้อจำกัด
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ไม่สามารถแก้ไขข้อมูล, อัปเดตงาน, เบิกจ่ายพัสดุ หรือบันทึกเอกสารการเงินใดๆ ได้ และจะไม่เห็นเมนู วางแผนงานก่อสร้าง, ติดตามพัสดุช่าง, มอบหมายและติดตามงาน, ติดตามงานสำคัญ (เปิดให้เฉพาะ Admin)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* System Architecture Flow Diagram */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ผังวงจรการทำงานของระบบ (Work Process Cycle)</h2>
              <p className="text-xs text-slate-500">ขั้นตอนการดำเนินงานก่อสร้างตั้งแต่เริ่มต้นจนถึงปิดงานสมบูรณ์</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-900">1. วางแผน & จัดเตรียม</span>
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>ประมาณการงานก่อสร้าง (/estimation)</li>
                  <li>จัดทำแผนงาน 7 ขั้นตอน (/planning)</li>
                  <li>ลงปฏิทินดับไฟและจัดรถ (/outage)</li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-purple-200 text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                <span>เริ่มก่อนเปิดหน้างาน</span>
                <ArrowRight size={12} className="ml-auto" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900">2. ปฏิบัติงานภาคสนาม</span>
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>ตรวจ PPE & Morning Talk (/safety)</li>
                  <li>เบิกและติดตามพัสดุช่าง (/material-tracking)</li>
                  <li>รับมอบหมายงานรายวัน (/my-tasks)</li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-blue-200 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                <span>ความปลอดภัยอันดับหนึ่ง</span>
                <ArrowRight size={12} className="ml-auto" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-900">3. รายงาน & อัปเดต</span>
                  <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>อัปเดต % งาน + แนบรูป GPS (/update)</li>
                  <li>คำนวณและบันทึกคืนเศษสาย (/wire-return)</li>
                  <li>บันทึกเลขไมล์และน้ำมัน ยพ.6 (/gas-report)</li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-amber-200 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                <span>บันทึกรายวัน</span>
                <ArrowRight size={12} className="ml-auto" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-900">4. สรุป & ปิดงาน (TECO)</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">4</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>ตรวจเช็คความพร้อมปิดงาน (/teco-checker)</li>
                  <li>ทำเอกสารขอเบิกค่าใช้จ่าย (/budget-transfer)</li>
                  <li>สรุป OT พขร. และช่าง (/driver-ot)</li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span>ส่งมอบงานสมบูรณ์</span>
                <CheckCircle2 size={12} className="ml-auto text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Modules Detailed Documentation List */}
        <div className="space-y-6">
          {filteredModules.map((m) => {
            const isExpanded = expandedSections[m.id] ?? true;

            return (
              <div
                key={m.id}
                id={m.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:border-purple-300"
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleSection(m.id)}
                  className="p-5 flex items-start justify-between cursor-pointer select-none bg-gradient-to-r from-slate-50 to-white hover:from-purple-50/40 transition"
                >
                  <div className="flex items-start gap-3">
                    <button
                      className="mt-1 p-1 rounded-md text-slate-400 hover:text-slate-600 transition"
                      aria-label="Toggle section"
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${m.badgeColor}`}>
                          {m.badge}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">{m.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 leading-normal">{m.summary}</p>
                    </div>
                  </div>

                  <Link
                    href={m.path}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition"
                  >
                    <span>เปิดหน้างาน</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>

                {/* Collapsible Content Body */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 bg-white space-y-5 text-sm">
                    {/* Steps list */}
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-purple-600" />
                        ขั้นตอนการใช้งานทีละขั้นตอน (Step-by-Step Instructions)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {m.steps.map((st, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50/30 transition flex gap-3"
                          >
                            <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-800 text-sm mb-1">{st.title}</div>
                              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{st.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips Callout */}
                    {m.tips && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                        <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-amber-950">💡 กลเม็ดเด็ด (Pro-Tip): </strong>
                          <span>{m.tips}</span>
                        </div>
                      </div>
                    )}

                    {/* Warning Callout (if any) */}
                    {m.warning && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs leading-relaxed">
                        <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-rose-950">⚠️ ข้อควรระวัง: </strong>
                          <span>{m.warning}</span>
                        </div>
                      </div>
                    )}

                    {/* Direct Launch Button on mobile */}
                    <div className="pt-2 sm:hidden flex justify-end">
                      <Link
                        href={m.path}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold text-xs"
                      >
                        <span>เปิดหน้า {m.badge}</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredModules.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
              <HelpCircle size={40} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-700 mb-1">ไม่พบหัวข้อที่ตรงกับการค้นหา</h3>
              <p className="text-xs text-slate-500 mb-4">ลองเปลี่ยนคำค้นหา เช่น &quot;wbs&quot;, &quot;เศษสาย&quot;, &quot;ยพ.6&quot;, หรือ &quot;ดับไฟ&quot;</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition"
              >
                ล้างคำค้นหาทั้งหมด
              </button>
            </div>
          )}
        </div>

        {/* Footer Support & Contacts */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white border border-purple-800/40 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <BookOpen size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">ศูนย์ช่วยเหลือและสนับสนุนระบบ ผกร.(ก3)</h4>
                <p className="text-xs text-purple-200/80">แผนกก่อสร้างและบูรณะระบบจำหน่าย การไฟฟ้าส่วนภูมิภาค เขต 3 (ภาคใต้) จังหวัดยะลา</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10"
              >
                กลับขึ้นด้านบน ↑
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow"
              >
                พิมพ์คู่มือหน้านี้
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
