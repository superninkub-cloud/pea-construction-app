"use client";

import React, { useState, useEffect } from "react";
import { TeamMemberPerformance, MemberDisasterMission } from "../types";
import {
  X,
  Check,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle2,
  User,
  Zap,
  Truck,
  ShieldCheck,
  ChevronRight,
  Briefcase,
  Users,
  Layers,
  ArrowRightLeft
} from "lucide-react";

interface EditPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberPerformance;
  allMembers?: TeamMemberPerformance[];
  onSelectMember?: (memberId: string) => void;
  onSave: (updatedMember: TeamMemberPerformance) => void;
}

export default function EditPresentationModal({
  isOpen,
  onClose,
  member,
  allMembers,
  onSelectMember,
  onSave
}: EditPresentationModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "disaster" | "highlights">("profile");

  // Profile Form States
  const [fullName, setFullName] = useState(member.fullName || "");
  const [shortName, setShortName] = useState(member.shortName || "");
  const [title, setTitle] = useState(member.title || "");
  const [position, setPosition] = useState(member.position || "");
  const [teamName, setTeamName] = useState(member.teamName || "");
  const [teamType, setTeamType] = useState<"leadership" | "field_team" | "coordination">(
    member.teamType || "field_team"
  );

  // Disaster Mission States
  const [disasterRoleTitle, setDisasterRoleTitle] = useState(member.disasterMission?.roleTitle || "");
  const [disasterIncidentFocus, setDisasterIncidentFocus] = useState(member.disasterMission?.incidentFocus || "");
  const [disasterDescription, setDisasterDescription] = useState(member.disasterMission?.description || "");
  const [disasterFleetSupport, setDisasterFleetSupport] = useState(member.disasterMission?.fleetSupport || "");
  const [disasterStatusBadge, setDisasterStatusBadge] = useState(
    member.disasterMission?.statusBadge || "สำเร็จ 100% (Zero Accident)"
  );

  // Highlights & Challenges & Notes
  const [executiveNotes, setExecutiveNotes] = useState(member.executiveNotes || "");
  const [highlights, setHighlights] = useState<string[]>(member.highlights || []);
  const [challenges, setChallenges] = useState<string[]>(member.challenges || []);
  const [newHighlight, setNewHighlight] = useState("");
  const [newChallenge, setNewChallenge] = useState("");

  // Sync state whenever member or isOpen changes
  useEffect(() => {
    setFullName(member.fullName || "");
    setShortName(member.shortName || "");
    setTitle(member.title || "");
    setPosition(member.position || "");
    setTeamName(member.teamName || "");
    setTeamType(member.teamType || "field_team");

    setDisasterRoleTitle(member.disasterMission?.roleTitle || "");
    setDisasterIncidentFocus(member.disasterMission?.incidentFocus || "");
    setDisasterDescription(member.disasterMission?.description || "");
    setDisasterFleetSupport(member.disasterMission?.fleetSupport || "");
    setDisasterStatusBadge(member.disasterMission?.statusBadge || "สำเร็จ 100% (Zero Accident)");

    setExecutiveNotes(member.executiveNotes || "");
    setHighlights([...(member.highlights || [])]);
    setChallenges([...(member.challenges || [])]);
    setNewHighlight("");
    setNewChallenge("");
  }, [member, isOpen]);

  if (!isOpen) return null;

  // Add / Remove Highlight
  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // Add / Remove Challenge
  const handleAddChallenge = () => {
    if (newChallenge.trim()) {
      setChallenges([...challenges, newChallenge.trim()]);
      setNewChallenge("");
    }
  };

  const handleRemoveChallenge = (index: number) => {
    setChallenges(challenges.filter((_, i) => i !== index));
  };

  // Quick Preset Helper for Disaster Missions
  const applyDisasterPreset = (type: "bangluang" | "donchedi" | "thongphaphum" | "fleet" | "warehouse") => {
    if (type === "bangluang") {
      setDisasterRoleTitle("หัวหน้าชุดปฏิบัติการกู้ภัยวาตภัยเสาล้ม ตลาดบางหลวง");
      setDisasterIncidentFocus("เหตุการณ์วาตภัยรุนแรงเสาล้ม ตลาดบางหลวง อ.บางเลน จ.นครปฐม");
      setDisasterDescription("นำกำลังพลเข้าพื้นที่ทันทีหลังเกิดเหตุ ระดมปักเสาทดแทน กอบกู้ระบบจำหน่ายแรงสูง 22 kV และเชื่อมโยงวงจรคืนกระแสไฟฟ้าให้ชุมชนและตลาดบางหลวงสำเร็จ 100%");
      setDisasterFleetSupport("สนับสนุนรถยนต์ยกเสา เครน และรถขนเสาคอนกรีตขนาด 12-14 เมตร");
      setDisasterStatusBadge("กู้คืนระบบสำเร็จ 100%");
    } else if (type === "donchedi") {
      setDisasterRoleTitle("หัวหน้าชุดปฏิบัติการกู้ภัยวาตภัยเสาหักโค่นรุนแรง พื้นที่ไฟฟ้าดอนเจดีย์");
      setDisasterIncidentFocus("พายุวาตภัยรุนแรงเสาหักโค่นเป็นแนวยาว บริเวณพื้นที่ไฟฟ้าดอนเจดีย์ จ.สุพรรณบุรี");
      setDisasterDescription("เผชิญเหตุวาตภัยเสาหักโค่นเป็นระยะทางยาว ระดมกำลังปักเสาทดแทน เชื่อมโยงวงจรจ่ายกระแสไฟฟ้าคืนประชาชนและสถานที่ราชการสำเร็จรวดเร็ว");
      setDisasterFleetSupport("ประสานกองรถยนต์ขนเสาลำเลียงเสาคอนกรีตขนาดใหญ่จากศูนย์พัสดุเข้าพื้นที่ต่อเนื่อง");
      setDisasterStatusBadge("จ่ายไฟคืนสำเร็จ 100%");
    } else if (type === "thongphaphum") {
      setDisasterRoleTitle("หัวหน้าชุดปฏิบัติการกอบกู้วิกฤตไฟฟ้าดับบริเวณกว้างพื้นที่ภูเขาสูง (Western Frontier)");
      setDisasterIncidentFocus("วิกฤตไฟดับบริเวณกว้างพื้นที่ไฟฟ้าทองผาภูมิ และไฟฟ้าสังขละบุรี (จ.กาญจนบุรี)");
      setDisasterDescription("ลุยฝ่าเส้นทางทุรกันดาร ภูเขาสูง และสภาพอากาศแปรปรวนเพื่อค้นหาจุดสายส่งชำรุด ดำเนินการพาดสาย ปักเสาแซม และจ่ายไฟฟ้าคืนชุมชนชายแดนสำเร็จ");
      setDisasterFleetSupport("ประสานการลำเลียงเสาไฟฟ้าด้วยรถยนต์ขนเสาขับเคลื่อนพิเศษข้ามแนวเขาลาดชัน");
      setDisasterStatusBadge("กอบกู้ระบบสำเร็จ 100%");
    } else if (type === "fleet") {
      setDisasterRoleTitle("ผู้บริหารจัดการกองยานยนต์ขนเสาและเครื่องจักรกลหนัก (Fleet Logistics Commander)");
      setDisasterIncidentFocus("บริหารควบคุมคิวและการเดินรถยนต์ขนเสา ลำเลียงเสาคอนกรีต 24 ชม. ทุกวิกฤตการณ์ปี 2569");
      setDisasterDescription("บริหารจัดการกองรถยนต์บรรทุกขนเสา รถเทรลเลอร์ และพนักงานขับรถ ควบคุมความปลอดภัยการผูกรัดเสาคอนกรีต และส่งมอบเสาถึงหน้างานภัยพิบัติ (บางหลวง, ดอนเจดีย์, กาญจนบุรี) 24 ชม. ตลอดทั้งปี");
      setDisasterFleetSupport("สถิติลำเลียงเสาไฟฟ้าคอนกรีตร้อยกว่าต้นด้วยมาตรฐานความปลอดภัยสูงสุด ไร้อุบัติเหตุ (Zero Accident)");
      setDisasterStatusBadge("ขนส่งเสาสำเร็จ 100% (Zero Accident)");
    } else if (type === "warehouse") {
      setDisasterRoleTitle("หัวหน้าฝ่ายอำนวยการและบริหารคลังพัสดุภัยพิบัติฉุกเฉิน (Material Chief)");
      setDisasterIncidentFocus("บริหารคลังพัสดุและเสาคอนกรีตฉุกเฉิน สนับสนุน 3 จุดวิกฤตและเหตุการณ์รายเดือน");
      setDisasterDescription("บริหารคลังพัสดุภัยพิบัติสำรอง เสาไฟฟ้าคอนกรีตทุกขนาด สายไฟ และอุปกรณ์ประกอบ ให้พร้อมเบิกจ่ายตลอด 24 ชม. รองรับเหตุภัยพิบัติหนักเกือบทุกเดือนตลอดปี 2569 ไร้พัสดุขาดแคลน");
      setDisasterFleetSupport("จัดคิวเบิกจ่ายพัสดุขึ้นกองรถยนต์ขนเสาฉุกเฉิน เร่งรัดการหมุนเวียนพัสดุคงคลังทดแทน");
      setDisasterStatusBadge("บริหารจัดการสำเร็จ 100%");
    }
  };

  // Save handler
  const handleSave = () => {
    let updatedDisaster: MemberDisasterMission | undefined = undefined;
    if (disasterRoleTitle.trim() || disasterIncidentFocus.trim() || disasterDescription.trim()) {
      updatedDisaster = {
        roleTitle: disasterRoleTitle.trim() || "ภารกิจกู้ภัยพิบัติฉุกเฉิน 2569",
        incidentFocus: disasterIncidentFocus.trim() || "เหตุการณ์ภัยพิบัติรุนแรงปี 2569",
        description: disasterDescription.trim() || "ปฏิบัติการกอบกู้ระบบไฟฟ้าสำเร็จตามเป้าหมาย",
        fleetSupport: disasterFleetSupport.trim() || undefined,
        statusBadge: disasterStatusBadge.trim() || "สำเร็จ 100% (Zero Accident)"
      };
    }

    const updated: TeamMemberPerformance = {
      ...member,
      fullName: fullName.trim() || member.fullName,
      shortName: shortName.trim() || member.shortName,
      title: title.trim() || member.title,
      position: position.trim() || member.position,
      teamName: teamName.trim() || member.teamName,
      teamType,
      executiveNotes: executiveNotes.trim(),
      highlights: highlights.filter((h) => h.trim().length > 0),
      challenges: challenges.filter((c) => c.trim().length > 0),
      disasterMission: updatedDisaster
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-purple-100 animate-fadeIn my-auto flex flex-col max-h-[90vh]">
        {/* =====================================================================
            MODAL HEADER & FAST MEMBER SWITCHER
            ===================================================================== */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-purple-950 font-black flex items-center justify-center text-sm shadow-md ring-2 ring-white/20">
              {member.order}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-white">
                  <span>แก้ไขข้อมูลผลงานและบทบาทนำเสนอ</span>
                </h3>
                <span className="text-[11px] bg-amber-400/25 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40 font-bold">
                  {member.shortName}
                </span>
              </div>
              <p className="text-[11.5px] text-purple-200/90 font-medium">
                {member.fullName} • {member.teamName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Member Dropdown Switcher if allMembers available */}
            {allMembers && allMembers.length > 0 && onSelectMember && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-xl border border-white/20 text-xs">
                <Users size={13} className="text-amber-300" />
                <select
                  value={member.id}
                  onChange={(e) => onSelectMember(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      #{m.order} {m.shortName} ({m.fullName.replace("นาย", "").trim()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/15 transition-all focus:outline-none"
              title="ปิดหน้าต่าง"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =====================================================================
            MODAL NAVIGATION TABS
            ===================================================================== */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-2 shrink-0 gap-2 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-all rounded-t-xl ${
              activeTab === "profile"
                ? "border-purple-700 text-purple-900 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User size={15} className={activeTab === "profile" ? "text-purple-700" : "text-slate-400"} />
            <span>1. ข้อมูลบุคคล & ตำแหน่ง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disaster")}
            className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-all rounded-t-xl ${
              activeTab === "disaster"
                ? "border-rose-600 text-rose-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap size={15} className={activeTab === "disaster" ? "text-rose-600" : "text-slate-400"} />
            <span>2. ภารกิจภัยพิบัติ & รถขนเสา 2569</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-bold">
              เด่น
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("highlights")}
            className={`flex items-center gap-2 py-2.5 px-4 border-b-2 transition-all rounded-t-xl ${
              activeTab === "highlights"
                ? "border-indigo-600 text-indigo-700 bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles size={15} className={activeTab === "highlights" ? "text-indigo-600" : "text-slate-400"} />
            <span>3. ผลงานเด่น & บันทึกผู้บริหาร</span>
          </button>
        </div>

        {/* =====================================================================
            MODAL FORM BODY (SCROLLABLE)
            ===================================================================== */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-800">
          {/* TAB 1: PROFILE & ROLE */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 text-purple-900 text-xs flex items-center gap-2">
                <User size={16} className="text-purple-700 shrink-0" />
                <span>
                  ปรับแต่งชื่อ-นามสกุล ตำแหน่ง และบทบาทของท่านนี้ ข้อมูลจะถูกอัปเดตทั้งในหน้าเว็บ เอกสาร PDF และสไลด์นำเสนอทันที
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุลเต็ม <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น นายพิสันติ์ จิตต์ปลื้ม"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อเรียกสั้น (สำหรับแท็บและแคปซูล) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="เช่น พิสันติ์"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    ตำแหน่งที่แสดงในหัวเรื่องนำเสนอ (Title)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น หัวหน้าแผนกก่อสร้างระบบไฟฟ้า (ผกร.)"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    สังกัดทีม / ชุดงาน (Team Name)
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="เช่น ชุดงานที่ 1 (อุดมศักดิ์) หรือ ช่างประจำสำนักงาน"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ประเภทบทบาท (Team Type)
                  </label>
                  <select
                    value={teamType}
                    onChange={(e) => setTeamType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white font-semibold"
                  >
                    <option value="leadership">ระดับบริหาร / บัญชาการ (Leadership)</option>
                    <option value="field_team">ชุดงานควบคุมการก่อสร้างภาคสนาม (Field Team)</option>
                    <option value="coordination">ช่างประจำสำนักงาน / ข้อมูลวิศวกรรม (Coordination)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    ตำแหน่งทางการและหน้าที่รับผิดชอบ (Official Position)
                  </label>
                  <textarea
                    rows={2}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="ระบุตำแหน่งอย่างเป็นทางการและขอบเขตงานหลัก..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISASTER & FLEET MISSION 2569 */}
          {activeTab === "disaster" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Presets Bar */}
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-3.5 rounded-2xl border border-rose-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950 flex items-center gap-1.5 text-xs">
                    <Zap size={14} className="text-rose-600" />
                    <span>เลือกเทมเพลตภารกิจสำเร็จรูปด่วน:</span>
                  </span>
                  <span className="text-[10px] text-slate-500">คลิกเพื่อเติมข้อความอัตโนมัติ</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyDisasterPreset("bangluang")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-rose-800 border border-rose-300 hover:bg-rose-100 transition-all shadow-xs"
                  >
                    🌪️ วาตภัยตลาดบางหลวง
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisasterPreset("donchedi")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all shadow-xs"
                  >
                    ⚡ วาตภัยดอนเจดีย์
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisasterPreset("thongphaphum")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all shadow-xs"
                  >
                    🏔️ ทองผาภูมิ-สังขละบุรี
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisasterPreset("fleet")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-purple-800 border border-purple-300 hover:bg-purple-100 transition-all shadow-xs"
                  >
                    🚛 กองยานยนต์ขนเสา
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDisasterPreset("warehouse")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-blue-800 border border-blue-300 hover:bg-blue-100 transition-all shadow-xs"
                  >
                    📦 คลังพัสดุภัยพิบัติ
                  </button>
                </div>
              </div>

              {/* Disaster Form Fields */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      บทบาทหน้าที่ในภารกิจภัยพิบัติ (Role Title)
                    </label>
                    <input
                      type="text"
                      value={disasterRoleTitle}
                      onChange={(e) => setDisasterRoleTitle(e.target.value)}
                      placeholder="เช่น หัวหน้าชุดปฏิบัติการกู้ภัยวาตภัย หรือ ผู้บัญชาการศูนย์..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ป้ายสถานะความสำเร็จ (Status Badge)
                    </label>
                    <input
                      type="text"
                      value={disasterStatusBadge}
                      onChange={(e) => setDisasterStatusBadge(e.target.value)}
                      placeholder="เช่น สำเร็จ 100% (Zero Accident)"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เหตุการณ์วิกฤตหลักหรือพื้นที่รับผิดชอบ (Incident Focus)
                  </label>
                  <input
                    type="text"
                    value={disasterIncidentFocus}
                    onChange={(e) => setDisasterIncidentFocus(e.target.value)}
                    placeholder="เช่น ตลาดบางหลวง / ดอนเจดีย์ / ทองผาภูมิ-สังขละบุรี / ควบคุมเดินรถ 24 ชม."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รายละเอียดผลการปฏิบัติการกู้ภัยพิบัติฉุกเฉิน
                  </label>
                  <textarea
                    rows={3}
                    value={disasterDescription}
                    onChange={(e) => setDisasterDescription(e.target.value)}
                    placeholder="อธิบายการระดมพล การปักเสา พาดสาย และการจ่ายกระแสไฟฟ้าคืนประชาชน..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Truck size={14} className="text-amber-600" />
                    <span>ภารกิจสนับสนุนกองยานยนต์ขนเสา & เครื่องจักรกลหนัก (Fleet Support)</span>
                  </label>
                  <input
                    type="text"
                    value={disasterFleetSupport}
                    onChange={(e) => setDisasterFleetSupport(e.target.value)}
                    placeholder="เช่น ควบคุมการเดินรถขนเสา 24 ชม. ส่งเสาคอนกรีตเข้าจุดเกิดเหตุปลอดภัย 100%"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HIGHLIGHTS, CHALLENGES & EXECUTIVE NOTES */}
          {activeTab === "highlights" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Executive Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>บันทึกประเด็นนำเสนอผู้บริหาร (Executive Talking Points / สรุปสาระสำคัญ)</span>
                </label>
                <textarea
                  rows={3}
                  value={executiveNotes}
                  onChange={(e) => setExecutiveNotes(e.target.value)}
                  placeholder="บันทึกข้อความสรุป หรือประเด็นสำคัญที่ต้องการกล่าวถึงในที่ประชุมผู้บริหาร..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>

              {/* Key Highlights */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
                <label className="block font-bold text-emerald-900 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-700" />
                    <span>ผลงานสำคัญและความสำเร็จ (Key Achievements)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800">
                    {highlights.length} รายการ
                  </span>
                </label>

                <div className="space-y-2 mb-3">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-emerald-200/80 text-slate-800 text-xs shadow-xs"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="leading-snug">{h}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(i)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                        title="ลบข้อความนี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHighlight())}
                    placeholder="พิมพ์ผลงานสำคัญ แล้วกด Enter หรือคลิกปุ่มเพิ่ม..."
                    className="flex-1 px-3.5 py-2 border border-emerald-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>เพิ่มผลงาน</span>
                  </button>
                </div>
              </div>

              {/* Challenges */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
                <label className="block font-bold text-amber-950 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-amber-700" />
                    <span>ประเด็นเร่งรัดและข้อจำกัดหน้างาน (Key Challenges)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-amber-900">
                    {challenges.length} รายการ
                  </span>
                </label>

                <div className="space-y-2 mb-3">
                  {challenges.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-amber-200/80 text-slate-800 text-xs shadow-xs"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span className="leading-snug">{c}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChallenge(i)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors shrink-0"
                        title="ลบข้อความนี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddChallenge())}
                    placeholder="พิมพ์ข้อจำกัด/ประเด็นเร่งรัด แล้วกด Enter หรือคลิกเพิ่ม..."
                    className="flex-1 px-3.5 py-2 border border-amber-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddChallenge}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>เพิ่มประเด็น</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================================
            MODAL FOOTER ACTIONS
            ===================================================================== */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            ระบบจะบันทึกข้อมูลและนำไปอัปเดตในสไลด์นำเสนอและเอกสาร PDF ทันที
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-800/30 hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Check size={16} />
              <span>บันทึกการแก้ไขทั้งหมด</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
