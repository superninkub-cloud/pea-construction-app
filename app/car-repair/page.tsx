"use client";

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Truck,
  Building,
  Printer,
  Copy,
  Sparkles,
  Download,
  Calendar,
  Check,
  Plus,
  Trash2,
  UserCheck,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  FileText
} from 'lucide-react';
import './car-repair.css';
import {
  CarRepairFormData,
  RepairCaseType,
  SAMPLE_CASE1_VEHICLE_DEPT_DATA,
  SAMPLE_CASE2_PEA_AREA_DATA,
  POPULAR_VEHICLE_TYPES,
  POPULAR_DEFECT_ITEMS,
  COMMON_VEHICLE_PRESETS,
  VehiclePreset,
  composeCarRepairSubject,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  generateCase1BodyText,
  generateCase2BodyParts,
  generateCarRepairMemoPlainText,
  generateCarRepairWordDocument
} from './carRepairUtils';
import TopBar from '../components/TopBar';

type EditSectionKey = 'header' | 'vehicle' | 'defects' | 'site' | 'signer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'vehicle', title: '2. ข้อมูลยานพาหนะ & พนักงานขับรถ', shortName: 'ยานพาหนะ', icon: Truck },
  { key: 'defects', title: '3. รายการชำรุดและงานซ่อม', shortName: 'รายการชำรุด', icon: Wrench },
  { key: 'site', title: '4. ข้อมูลหน้างาน & แหล่งงบประมาณ', shortName: 'หน้างาน & งบ', icon: Briefcase },
  { key: 'signer', title: '5. ผู้เสนอและคำสั่งการ (อก.รย.)', shortName: 'ผู้เสนอ & คำสั่ง', icon: UserCheck },
];

export default function CarRepairPage() {
  const [formData, setFormData] = useState<CarRepairFormData>(SAMPLE_CASE1_VEHICLE_DEPT_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [newDefectInput, setNewDefectInput] = useState<string>('');
  const [isThaiNum, setIsThaiNum] = useState<boolean>(false);
  const [bodyMode, setBodyMode] = useState<'guided' | 'freeform'>('guided');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_car_repair_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.subject) {
          // Automatic migration of user requested values
          if (!parsed.docTo || parsed.docTo === 'โทร.' || parsed.docTo === '-') {
            parsed.docTo = 'กรย.(ก3)';
          }
          if (parsed.proposerName === 'นายพิสันต์ จิตต์ปลื้ม' || !parsed.proposerName) {
            parsed.proposerName = 'นายพิสันติ์ จิตต์ปลื้ม';
          }
          if (parsed.proposerPosition === 'หน.กร.(ก3)' || parsed.proposerPosition === 'หน.กร.(ก3)' || !parsed.proposerPosition) {
            parsed.proposerPosition = 'หผ.กร.(ก3)';
          }
          if (parsed.budgetSource === 'งบทำการของ ผยก.' || !parsed.budgetSource) {
            parsed.budgetSource = 'งบทำการของ ผยค.(ก3)';
          }
          if (parsed.closingStatement && parsed.closingStatement.includes('ผยก.')) {
            parsed.closingStatement = parsed.closingStatement.replace(/ผยก\./g, 'ผยค.(ก3)');
          }
          if (parsed.commanderTarget === 'ผยก.' || parsed.commanderTarget === 'ผยค.(ก3)' || !parsed.commanderTarget) {
            parsed.commanderTarget = '- หผ.ยค.(ก3)';
          }
          if (!parsed.commandText) {
            parsed.commandText = 'ดำเนินการต่อไป';
          }
          if (!parsed.commanderDate) {
            parsed.commanderDate = '19 ต.ค. 63';
          }
          if (!parsed.docNo || parsed.docNo.includes('2437') || parsed.docNo.includes('2443') || parsed.docNo.includes('2563') || parsed.docNo.includes('2561') || parsed.docNo.includes('คชย')) {
            parsed.docNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.docDate && (parsed.docDate.includes('17 ต.ค.') || parsed.docDate.includes('20 ต.ค.') || parsed.docDate.includes('63') || parsed.docDate.includes('61'))) {
            parsed.docDate = '';
          }
          setFormData(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading stored car repair form:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pea_car_repair_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectCase = (caseType: RepairCaseType) => {
    if (caseType === 'vehicle_dept') {
      setFormData(SAMPLE_CASE1_VEHICLE_DEPT_DATA);
      showToast('✓ สลับเป็นกรณีที่ 1: แผนกยานพาหนะซ่อม (เบิกงบทำการ ผยค.(ก3))');
    } else {
      setFormData(SAMPLE_CASE2_PEA_AREA_DATA);
      showToast('✓ สลับเป็นกรณีที่ 2: การไฟฟ้าพื้นที่ซ่อม (เบิกงบ WBS)');
    }
  };

  const handleApplyVehiclePreset = (preset: VehiclePreset) => {
    setFormData(prev => ({
      ...prev,
      vehicleType: preset.vehicleType,
      licensePlate: preset.licensePlate,
      driverName: preset.driverName,
      driverPosition: preset.driverPosition,
      mileage: preset.mileage,
      craneHours: preset.craneHours || '',
      engineHours: preset.engineHours || '',
      subject: preset.subject
    }));
    showToast(`✓ นำเข้าข้อมูลรถ: ${preset.badge}`);
  };

  const handleAutoCompileSubject = () => {
    const newSubject = composeCarRepairSubject({
      vehicleType: formData.vehicleType,
      licensePlate: formData.licensePlate,
      prefix: formData.repairCase === 'pea_area' ? 'ขอความอนุเคราะห์จัดซ่อม' : 'ขอแจ้งซ่อม'
    });
    setFormData(prev => ({ ...prev, subject: newSubject }));
    showToast('✓ ประกอบชื่อเรื่องอัตโนมัติเรียบร้อย');
  };

  const handleSetTodayDocDate = () => {
    const todayStr = getTodayThaiDate('short');
    setFormData(prev => ({
      ...prev,
      docDate: todayStr,
      proposerDate: todayStr,
      commanderDate: prev.repairCase === 'vehicle_dept' ? todayStr : prev.commanderDate
    }));
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  const handleToggleNumerals = () => {
    const nextState = !isThaiNum;
    setIsThaiNum(nextState);
    const convert = nextState ? toThaiNumerals : toArabicNumerals;
    setFormData(prev => ({
      ...prev,
      docNo: convert(prev.docNo),
      docDate: convert(prev.docDate),
      subject: convert(prev.subject),
      vehicleType: convert(prev.vehicleType),
      licensePlate: convert(prev.licensePlate),
      mileage: convert(prev.mileage),
      craneHours: convert(prev.craneHours),
      engineHours: convert(prev.engineHours),
      networkNo: convert(prev.networkNo),
      activityNo: convert(prev.activityNo),
      proposerDate: convert(prev.proposerDate),
      commanderDate: convert(prev.commanderDate),
      defectItems: prev.defectItems.map(item => convert(item))
    }));
    showToast(nextState ? '✓ แปลงเป็นเลขไทย (1 2 3) แล้ว' : '✓ แปลงเป็นเลขอารบิก (1 2 3) แล้ว');
  };

  const handleAddDefect = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setFormData(prev => ({
      ...prev,
      defectItems: [...prev.defectItems, trimmed]
    }));
    setNewDefectInput('');
    showToast(`✓ เพิ่มรายการชำรุด: ${trimmed}`);
  };

  const handleRemoveDefect = (index: number) => {
    if (formData.defectItems.length <= 1) {
      showToast('⚠️ ต้องมีรายการชำรุดอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      defectItems: prev.defectItems.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateVariable = (field: keyof CarRepairFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyMemo = async () => {
    const plainText = generateCarRepairMemoPlainText(formData);
    const html = generateCarRepairWordDocument(formData);
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('memo');
      showToast('✓ คัดลอกแล้ว! เปิด Microsoft Word แล้วกด Ctrl+V ได้ทันที');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('memo');
      showToast('✓ คัดลอกข้อความแล้ว (Plain Text)');
    }
  };

  const handleDownloadWordFile = () => {
    const content = generateCarRepairWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanPlate = formData.licensePlate?.replace(/[^a-zA-Z0-9ก-๙]/g, '_') || 'PEA';
    link.download = `บันทึกแจ้งซ่อมรถยนต์_${cleanPlate}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) สำเร็จ');
  };

  const currentSectionIndex = SECTIONS_META.findIndex(s => s.key === activeEditSection);
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setActiveEditSection(SECTIONS_META[currentSectionIndex - 1].key);
    }
  };
  const handleNextSection = () => {
    if (currentSectionIndex < SECTIONS_META.length - 1) {
      setActiveEditSection(SECTIONS_META[currentSectionIndex + 1].key);
    }
  };

  return (
    <>
      <TopBar title="โปรแกรมแจ้งซ่อมรถยนต์" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <Wrench size={18} className="text-sky-400" />
              <span>แจ้งซ่อมรถยนต์ (ผกร.กรย.ก3)</span>
            </div>
            <div className="a4-preset-group">
              <span className="text-xs text-slate-300 font-medium">กรณีการซ่อม:</span>
              <button
                type="button"
                className={`a4-preset-chip ${formData.repairCase === 'vehicle_dept' ? 'active' : ''}`}
                onClick={() => handleSelectCase('vehicle_dept')}
              >
                กรณี 1: ผยค.(ก3) ซ่อม (งบทำการ)
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${formData.repairCase === 'pea_area' ? 'active' : ''}`}
                onClick={() => handleSelectCase('pea_area')}
              >
                กรณี 2: กฟฟ.พื้นที่ซ่อม (งบ WBS)
              </button>
            </div>
          </div>

          <div className="a4-action-right">
            <button
              type="button"
              className="a4-action-btn a4-btn-muted"
              onClick={handleSetTodayDocDate}
              title="ใส่วันที่ปัจจุบันในเอกสาร"
            >
              <Calendar size={15} /> วันที่วันนี้
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-muted"
              onClick={handleToggleNumerals}
              title="สลับเลขไทย 123 และเลขอารบิก 123"
            >
              {isThaiNum ? 'เลขไทย 1 2 3' : '123 อารบิก'}
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-indigo"
              onClick={handleCopyMemo}
              title="คัดลอกลง Word (Ctrl+V ได้ทันที)"
            >
              <Copy size={15} /> คัดลอกลง Word
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-emerald"
              onClick={handleDownloadWordFile}
              title="ดาวน์โหลดไฟล์ .doc"
            >
              <Download size={15} /> ดาวน์โหลด Word
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-amber"
              onClick={() => window.print()}
              title="สั่งพิมพ์หน้ากระดาษ A4"
            >
              <Printer size={15} /> พิมพ์ A4
            </button>
          </div>
        </div>

        {/* Section Quick Jump Bar */}
        <div className="a4-jump-bar no-print">
          <span className="text-xs text-slate-400 font-medium">จิ้มแก้ไขส่วน:</span>
          {SECTIONS_META.map((sec) => (
            <button
              key={sec.key}
              type="button"
              className={`a4-jump-chip ${activeEditSection === sec.key ? 'active' : ''}`}
              onClick={() => setActiveEditSection(sec.key)}
            >
              <sec.icon size={13} />
              <span>{sec.shortName}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* A4 PAPER CANVAS (LIVE EDITABLE)                                           */}
        {/* ========================================================================= */}
        <div className="a4-page-shadow">
          <div className="a4-page">
            {/* 1. HEADER SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('header')}
              title="คลิกเพื่อแก้ไขส่วนหัวหนังสือ"
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขส่วนหัวหนังสือ
              </div>

              <div className="a4-pea-header">
                <img
                  src="/pea-logo.png"
                  alt="PEA Logo"
                  style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                />
                <div style={{ marginLeft: '12px' }}>
                  <div style={{ fontSize: '20pt', fontWeight: 'bold', lineHeight: 1.15, fontFamily: 'var(--font-sarabun)' }}>
                    บันทึกข้อความ
                  </div>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', letterSpacing: '0.4px', color: '#1e293b' }}>
                    การไฟฟ้าส่วนภูมิภาค
                  </div>
                </div>
              </div>

              <table className="a4-info-table">
                <tbody>
                  <tr>
                    <td style={{ width: '8%', fontWeight: 'bold' }}>จาก</td>
                    <td style={{ width: '42%' }}>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น ผกร. หรือ กรย.(ก3)"
                      />
                    </td>
                    <td style={{ width: '8%', fontWeight: 'bold' }}>ถึง</td>
                    <td style={{ width: '42%' }}>
                      <input
                        type="text"
                        className="a4-live-input a4-var-spot yellow"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น กรย.(ก3)"
                        title="ถึง (หน่วยงานปลายทาง)"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>ที่</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="a4-live-input a4-var-spot orange"
                          style={{ flex: 1, fontWeight: 500 }}
                          value={formData.docNo}
                          onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="เช่น ก.3 กรย.(กร)"
                          title="เลขที่หนังสือ (จุดที่ต้องแก้ไขแต่ละครั้ง)"
                        />
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>วันที่</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="a4-live-input a4-var-spot orange"
                          style={{ flex: 1, fontWeight: 500 }}
                          value={formData.docDate}
                          onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder=""
                          title="วันที่ในหนังสือ (จุดที่ต้องแก้ไขแต่ละครั้ง)"
                        />
                        <button
                          type="button"
                          className="no-print var-quick-opt-btn"
                          style={{ fontSize: '10px', padding: '2px 6px', whiteSpace: 'nowrap' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetTodayDocDate();
                          }}
                          title="ใส่วันที่ปัจจุบัน"
                        >
                          📅 วันนี้
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                    <td colSpan={3}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="no-print"
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: formData.repairCase === 'vehicle_dept' ? '#e0f2fe' : '#ffedd5',
                            color: formData.repairCase === 'vehicle_dept' ? '#0369a1' : '#c2410c',
                            border: formData.repairCase === 'vehicle_dept' ? '1px solid #bae6fd' : '1px solid #fed7aa',
                            cursor: 'pointer',
                            userSelect: 'none',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCase(formData.repairCase === 'vehicle_dept' ? 'pea_area' : 'vehicle_dept');
                          }}
                          title="คลิกเพื่อสลับระหว่าง กรณี 1 (ผยค.(ก3) ซ่อม) ↔ กรณี 2 (กฟฟ.พื้นที่ซ่อม)"
                        >
                          {formData.repairCase === 'vehicle_dept' ? '🚚 ผยค.(ก3) ซ่อม' : '🏢 กฟฟ.พื้นที่'}
                        </span>
                        <input
                          type="text"
                          className="a4-live-input a4-var-spot subject"
                          style={{ fontWeight: 'bold', flex: 1 }}
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          title="ชื่อเรื่องบันทึกข้อความ (พิมพ์แก้ไขได้ทันที หรือกดปุ่ม ⚡ เพื่อเลือกแม่แบบรถ)"
                        />
                        <button
                          type="button"
                          className="no-print var-quick-opt-btn"
                          style={{ whiteSpace: 'nowrap', fontSize: '11px', padding: '3px 8px', backgroundColor: '#f1f5f9' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEditSection('header');
                          }}
                          title="เปิดหน้าต่างเลือกแม่แบบรถยนต์และทะเบียน"
                        >
                          ⚡ แม่แบบรถ/ทะเบียน
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>เรียน</td>
                    <td colSpan={3}>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.salutation}
                        onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2 & 3. MEMO BODY CONTENT */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('vehicle')}
              title="คลิกเพื่อแก้ไขเนื้อหาและรายละเอียดรถ"
              style={{ marginTop: '14pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขข้อมูลรถ & รายการชำรุด
              </div>

              {/* Dynamic Variable Hint on Screen */}
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  📌 รถ: {formData.vehicleType} • ทะเบียน {formData.licensePlate}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  (ส่วนที่มีสีไฮไลท์คือจุดตัวแปรเฉพาะงาน • พิมพ์หรือสั่งพิมพ์เป็นสีดำทางการปกติ)
                </span>
              </div>

              {formData.repairCase === 'vehicle_dept' ? (
                /* Case 1: ผยค.(ก3) ซ่อม */
                <div>
                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                    ด้วย แผนกก่อสร้างระบบไฟฟ้า (ผกร.) มีรถยนต์{' '}
                    <span
                      className="a4-var-spot blue cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                      title="คลิกเพื่อแก้ไขชนิดยานพาหนะ"
                    >
                      {formData.vehicleType}
                    </span>{' '}
                    หมายเลขทะเบียน{' '}
                    <span
                      className="a4-var-spot green cursor-pointer"
                      style={{ fontWeight: 'bold' }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                      title="คลิกเพื่อแก้ไขหมายเลขทะเบียน"
                    >
                      {formData.licensePlate}
                    </span>{' '}
                    ใช้งานประจำที่{' '}
                    <span
                      className="a4-var-spot yellow cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                      title="คลิกเพื่อแก้ไขหน่วยงานประจำรถ"
                    >
                      {formData.assignedUnit}
                    </span>{' '}
                    โดยมี{' '}
                    <span
                      className="a4-var-spot purple cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                      title="คลิกเพื่อแก้ไขพนักงานขับรถ"
                    >
                      {formData.driverName}
                    </span>{' '}
                    ตำแหน่ง{' '}
                    <span
                      className="a4-var-spot purple cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                      title="คลิกเพื่อแก้ไขตำแหน่ง พขร."
                    >
                      {formData.driverPosition}
                    </span>{' '}
                    เป็นพนักงานขับรถยนต์คันดังกล่าว ซึ่งปัจจุบันเลขไมล์{' '}
                    <span
                      className="a4-var-spot orange cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                      title="คลิกเพื่อแก้ไขเลขไมล์"
                    >
                      {formData.mileage}
                    </span>{' '}
                    กิโลเมตร{' '}
                    {formData.craneHours && (
                      <>
                        ชั่วโมงเครน{' '}
                        <span
                          className="a4-var-spot orange cursor-pointer"
                          style={{ fontWeight: 600 }}
                          onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                          title="คลิกเพื่อแก้ไขชั่วโมงเครน"
                        >
                          {formData.craneHours}
                        </span>{' '}
                        ชั่วโมง{' '}
                      </>
                    )}
                    {formData.engineHours && (
                      <>
                        ชั่วโมงเครื่องยนต์{' '}
                        <span
                          className="a4-var-spot orange cursor-pointer"
                          style={{ fontWeight: 600 }}
                          onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                          title="คลิกเพื่อแก้ไขชั่วโมงเครื่องยนต์"
                        >
                          {formData.engineHours}
                        </span>{' '}
                        ชั่วโมง{' '}
                      </>
                    )}
                    เกิดการชำรุดดังนี้
                  </p>

                  <div style={{ margin: '8pt 0 8pt 3cm', lineHeight: 1.6 }}>
                    {formData.defectItems.map((defect, idx) => (
                      <div key={idx} style={{ marginBottom: '2pt' }}>
                        {isThaiNum ? toThaiNumerals(idx + 1) : (idx + 1)}.{' '}
                        <span
                          className="a4-var-spot blue cursor-pointer"
                          style={{ fontWeight: 600 }}
                          onClick={(e) => { e.stopPropagation(); setActiveEditSection('defects'); }}
                          title="คลิกเพื่อแก้ไขรายการชำรุด"
                        >
                          {defect}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                    จึงเรียนมาเพื่อโปรดพิจารณาส่งซ่อม โดยขอเบิกจ่ายค่าใช้จ่ายจาก{' '}
                    <span
                      className="a4-var-spot purple cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('site'); }}
                      title="คลิกเพื่อแก้ไขแหล่งงบประมาณ"
                    >
                      {formData.budgetSource}
                    </span>{' '}
                    ต่อไป
                  </p>
                </div>
              ) : (
                /* Case 2: การไฟฟ้าพื้นที่ซ่อม */
                <div>
                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                    ด้วย แผนกก่อสร้างระบบไฟฟ้า (ผกร.) กองก่อสร้างและบริหารโครงการ (กรย.) ได้นำรถยนต์{' '}
                    <span
                      className="a4-var-spot blue cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                    >
                      {formData.vehicleType}
                    </span>{' '}
                    หมายเลขทะเบียน{' '}
                    <span
                      className="a4-var-spot green cursor-pointer"
                      style={{ fontWeight: 'bold' }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                    >
                      {formData.licensePlate}
                    </span>{' '}
                    โดยมี{' '}
                    <span
                      className="a4-var-spot purple cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('vehicle'); }}
                    >
                      {formData.driverName}
                    </span>{' '}
                    ตำแหน่ง {formData.driverPosition} ประจำรถคันดังกล่าว ไปปฏิบัติงานก่อสร้างโครงการ{' '}
                    <span
                      className="a4-var-spot blue cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('site'); }}
                    >
                      {formData.workDetails}
                    </span>{' '}
                    ในพื้นที่ของ{' '}
                    <span
                      className="a4-var-spot yellow cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('site'); }}
                    >
                      {formData.peaAreaName}
                    </span>{' '}
                    ตามหมายเลขงาน WBS:{' '}
                    <span
                      className="a4-var-spot orange cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('site'); }}
                    >
                      {formData.wbsNo}
                    </span>{' '}
                    โครงข่าย {formData.networkNo} กิจกรรม {formData.activityNo} เกิดการชำรุดดังนี้
                  </p>

                  <div style={{ margin: '6pt 0 6pt 3cm', lineHeight: 1.6 }}>
                    {formData.defectItems.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '2pt' }}>
                        {isThaiNum ? toThaiNumerals(idx + 1) : (idx + 1)}.{' '}
                        <span
                          className="a4-var-spot blue cursor-pointer"
                          style={{ fontWeight: 600 }}
                          onClick={(e) => { e.stopPropagation(); setActiveEditSection('defects'); }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginTop: '6pt' }}>
                    กรย.(ก3) มีความประสงค์ขอความอนุเคราะห์จาก {formData.peaAreaName} พิจารณาจัดซ่อมรถยนต์คันดังกล่าว โดยขอเบิกจ่ายค่าใช้จ่ายจากหมายเลขงาน (WBS){' '}
                    <span
                      className="a4-var-spot orange cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('site'); }}
                    >
                      {formData.wbsNo}
                    </span>{' '}
                    โครงข่าย {formData.networkNo} กิจกรรม {formData.activityNo}
                  </p>
                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginTop: '6pt' }}>
                    {formData.closingStatement}
                  </p>
                </div>
              )}
            </div>

            {/* 5. PROPOSER SIGNER SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('signer')}
              title="คลิกเพื่อแก้ไขผู้เสนอเรื่อง"
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16pt', marginBottom: '24pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้เสนอเรื่อง
              </div>

              <div style={{ textAlign: 'center', minWidth: '270px' }}>
                <div style={{ height: '36px' }}></div>
                <div>({formData.proposerName || '...................................................'})</div>
                <div style={{ fontSize: '13pt', color: '#334155', marginTop: '2pt' }}>{formData.proposerPosition}</div>
                {formData.proposerDate && (
                  <div style={{ fontSize: '12pt', color: '#64748b', marginTop: '2pt' }}>{formData.proposerDate}</div>
                )}
              </div>
            </div>

            {/* COMMANDER ORDER SECTION (เฉพาะกรณีที่ 1: แทงเรื่องสั่งการด้านล่าง) */}
            {formData.repairCase === 'vehicle_dept' && formData.hasCommanderOrder && (
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('signer')}
                title="คลิกเพื่อแก้ไขคำสั่งการ อก.รย. (แทงเรื่อง)"
                style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12pt', marginTop: '16pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขคำสั่งการ อก.รย. (แทงเรื่อง)
                </div>

                <div style={{ fontSize: '13pt', maxWidth: '380px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14pt' }}>
                    {formData.commanderTarget || '- หผ.ยค.(ก3)'}
                  </div>
                  <div style={{ marginTop: '3pt', textIndent: '1cm', fontSize: '13pt' }}>
                    {formData.commandText || 'ดำเนินการต่อไป'}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '14pt', marginLeft: '1.5cm' }}>
                    <div style={{ height: '24px' }}></div>
                    <div>({formData.commanderName})</div>
                    <div style={{ fontSize: '12pt', color: '#475569', marginTop: '2pt' }}>{formData.commanderPosition}</div>
                    {formData.commanderDate && (
                      <div style={{ fontSize: '11pt', color: '#64748b', marginTop: '2pt' }}>{formData.commanderDate}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BIG SECTION POP-OUT EDITOR MODAL                                          */}
      {/* ========================================================================= */}
      {activeEditSection && (
        <div className="big-editor-overlay" onClick={() => setActiveEditSection(null)}>
          <div className="big-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="big-editor-header">
              <div className="big-editor-title">
                {(() => {
                  const meta = SECTIONS_META.find(s => s.key === activeEditSection);
                  const Icon = meta?.icon || FileText;
                  return (
                    <>
                      <Icon size={22} className="text-sky-400" />
                      <span>{meta?.title}</span>
                    </>
                  );
                })()}
              </div>
              <button
                type="button"
                className="big-editor-close"
                onClick={() => setActiveEditSection(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="big-editor-body">
              {/* SECTION 1: HEADER */}
              {activeEditSection === 'header' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">จาก (หน่วยงานเจ้าของเรื่อง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        placeholder="เช่น ผกร. หรือ กรย.(ก3)"
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docFrom: 'ผกร.' })}
                        >
                          📌 ผกร.
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docFrom: 'ผกร.กรย.(ก3)' })}
                        >
                          📌 ผกร.กรย.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docFrom: 'กรย.(ก3)' })}
                        >
                          📌 กรย.(ก3)
                        </button>
                      </div>
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">ถึง (หน่วยงานปลายทาง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="เช่น กรย.(ก3) หรือ กฟส.สค.2(บพว.)"
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กรย.(ก3)' })}
                        >
                          📌 กรย.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กรย.(ก3)' })}
                        >
                          📌 กรย.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กฟส.สค.2(บพว.)' })}
                        >
                          📌 กฟส.สค.2(บพว.)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Highlight for docNo & docDate changing each time */}
                  <div style={{ fontSize: '12px', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: '6px', margin: '10px 0' }}>
                    📌 <strong>จุดที่ต้องระบุใหม่แต่ละครั้ง:</strong> เลขที่หนังสือ และ วันที่ออกหนังสือ
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่หนังสือ (เปลี่ยนแต่ละครั้ง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="เช่น ก.3 กรย.(กร)"
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docNo: 'ก.3 กรย.(กร)- ' })}
                        >
                          📌 ก.3 กรย.(กร)-
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docNo: '' })}
                        >
                          🗑️ ล้างเลขที่ว่าง
                        </button>
                      </div>
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ (เปลี่ยนแต่ละครั้ง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        placeholder=""
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={handleSetTodayDocDate}
                        >
                          📅 ใส่วันที่วันนี้
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docDate: '' })}
                        >
                          🗑️ ล้างวันที่ว่าง
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card เรื่อง & แม่แบบรถ */}
                  <div className="variable-card" style={{ border: '1.5px solid #0284c7', background: '#f0f9ff', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="variable-badge-num badge-blue">เรื่อง</span>
                        <strong style={{ fontSize: '14px', color: '#0369a1' }}>ชื่อเรื่องบันทึกข้อความ (ขอแจ้งซ่อม / ขอความอนุเคราะห์)</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          style={{
                            backgroundColor: formData.repairCase === 'vehicle_dept' ? '#0284c7' : '#ffffff',
                            color: formData.repairCase === 'vehicle_dept' ? '#ffffff' : '#475569',
                            fontWeight: 600,
                            border: formData.repairCase === 'vehicle_dept' ? '1px solid #0284c7' : '1px solid #cbd5e1'
                          }}
                          onClick={() => handleSelectCase('vehicle_dept')}
                        >
                          🚚 ผยค.(ก3) ซ่อม (งบทำการ)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          style={{
                            backgroundColor: formData.repairCase === 'pea_area' ? '#ea580c' : '#ffffff',
                            color: formData.repairCase === 'pea_area' ? '#ffffff' : '#475569',
                            fontWeight: 600,
                            border: formData.repairCase === 'pea_area' ? '1px solid #ea580c' : '1px solid #cbd5e1'
                          }}
                          onClick={() => handleSelectCase('pea_area')}
                        >
                          🏢 กฟฟ.พื้นที่ ซ่อม (งบ WBS)
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      className="big-input"
                      style={{ fontWeight: 600 }}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        เลือกแม่แบบรถยอดนิยมของ ผกร. หรือกดประกอบชื่อเรื่องอัตโนมัติ:
                      </span>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 600 }}
                        onClick={handleAutoCompileSubject}
                      >
                        <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        ประกอบชื่อเรื่องอัตโนมัติ
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px', marginTop: '8px' }}>
                      {COMMON_VEHICLE_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          className="var-quick-opt-btn"
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '12px',
                            backgroundColor: formData.licensePlate === preset.licensePlate ? '#e0f2fe' : '#ffffff',
                            borderColor: formData.licensePlate === preset.licensePlate ? '#0284c7' : '#e2e8f0',
                            color: formData.licensePlate === preset.licensePlate ? '#0369a1' : '#334155',
                            fontWeight: formData.licensePlate === preset.licensePlate ? 600 : 400
                          }}
                          onClick={() => handleApplyVehiclePreset(preset)}
                        >
                          {preset.badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="big-field-group" style={{ marginTop: '12px' }}>
                    <label className="big-label">เรียน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3)"
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อก.รย.(ก3) ผ่าน รก.รย.(ก3)' })}
                      >
                        📌 อก.รย.(ก3) ผ่าน รก.รย.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อก.รย.(ก3)' })}
                      >
                        📌 อก.รย.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'ผจก.กฟส.สค.2(บพว.)' })}
                      >
                        📌 ผจก.กฟส.สค.2(บพว.)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: VEHICLE & DRIVER (GUIDED VARIABLE BUILDER + FREEFORM) */}
              {activeEditSection === 'vehicle' && (
                <div>
                  {/* Mode switcher */}
                  <div className="var-mode-toggle">
                    <button
                      type="button"
                      className={`var-mode-btn ${bodyMode === 'guided' ? 'active' : ''}`}
                      onClick={() => setBodyMode('guided')}
                    >
                      <Sparkles size={15} /> โหมดกรอกตัวแปรเฉพาะจุด (แนะนำ - แก้ไขง่าย)
                    </button>
                    <button
                      type="button"
                      className={`var-mode-btn ${bodyMode === 'freeform' ? 'active' : ''}`}
                      onClick={() => setBodyMode('freeform')}
                    >
                      <Edit3 size={15} /> โหมดแก้ไขข้อความอิสระ (Freeform)
                    </button>
                  </div>

                  {bodyMode === 'guided' ? (
                    <div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        💡 <strong>ระบบช่วยกรอกตัวแปรเฉพาะจุด:</strong> กรอกข้อมูลรถ เลขไมล์/ชั่วโมง พนักงานขับรถ และรายการชำรุด ระบบจะนำไปประกอบเข้าเป็นย่อหน้าและรายการชำรุดในบันทึกข้อความให้อัตโนมัติทันที
                      </div>

                      {/* Card 0: เรื่อง & แม่แบบยานพาหนะ */}
                      <div className="variable-card" style={{ border: '1.5px solid #0284c7', background: '#f0f9ff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="variable-badge-num badge-blue">เรื่อง</span>
                            <strong style={{ fontSize: '14px', color: '#0369a1' }}>ชื่อเรื่องบันทึกข้อความ (ขอแจ้งซ่อมรถยนต์)</strong>
                          </div>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 600 }}
                            onClick={handleAutoCompileSubject}
                          >
                            <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            ประกอบชื่อเรื่องอัตโนมัติ
                          </button>
                        </div>

                        <input
                          type="text"
                          className="big-input"
                          style={{ fontWeight: 600 }}
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px', marginTop: '8px' }}>
                          {COMMON_VEHICLE_PRESETS.map((preset) => (
                            <button
                              key={preset.key}
                              type="button"
                              className="var-quick-opt-btn"
                              style={{
                                textAlign: 'left',
                                padding: '6px 10px',
                                fontSize: '12px',
                                backgroundColor: formData.licensePlate === preset.licensePlate ? '#e0f2fe' : '#ffffff',
                                borderColor: formData.licensePlate === preset.licensePlate ? '#0284c7' : '#e2e8f0',
                                color: formData.licensePlate === preset.licensePlate ? '#0369a1' : '#334155',
                                fontWeight: formData.licensePlate === preset.licensePlate ? 600 : 400
                              }}
                              onClick={() => handleApplyVehiclePreset(preset)}
                            >
                              {preset.badge}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card 1: จุดที่ 1: ข้อมูลยานพาหนะ & ทะเบียน */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-blue">จุดที่ 1</span>
                          <strong style={{ fontSize: '14px', color: '#1d4ed8' }}>ชนิดยานพาหนะ, หมายเลขทะเบียน และสังกัด</strong>
                        </div>
                        <div className="big-grid-2">
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ชนิดยานพาหนะ</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.vehicleType}
                              onChange={(e) => handleUpdateVariable('vehicleType', e.target.value)}
                              placeholder="เช่น รถเครน TADANO ขนาดพิกัด 30 ตัน/เมตร"
                            />
                            <div className="var-quick-options" style={{ marginTop: '6px' }}>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('vehicleType', 'รถเครน TADANO ขนาดพิกัด 30 ตัน/เมตร')}
                              >
                                + รถเครน 30 ตัน
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('vehicleType', 'รถเครน ขนาดพิกัด 25 ตัน')}
                              >
                                + รถเครน 25 ตัน
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('vehicleType', 'รถยนต์เทรลเลอร์')}
                              >
                                + รถเทรลเลอร์
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('vehicleType', 'รถบรรทุก 6 ล้อ ติดเครน 5 ตัน')}
                              >
                                + รถบรรทุก 6 ล้อ
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('vehicleType', 'รถกระเช้าซ่อมแซมระบบไฟฟ้า')}
                              >
                                + รถกระเช้า
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('vehicleType', 'รถยนต์บรรทุกดีเซล 4 ประตู')}
                              >
                                + รถกระบะ 4 ประตู
                              </button>
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>หมายเลขทะเบียน</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.licensePlate}
                              onChange={(e) => handleUpdateVariable('licensePlate', e.target.value)}
                              placeholder="เช่น 90-7332 นฐ."
                            />
                            <div style={{ marginTop: '10px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>ใช้งานประจำที่ (สังกัด)</span>
                              <input
                                type="text"
                                className="big-input"
                                value={formData.assignedUnit}
                                onChange={(e) => handleUpdateVariable('assignedUnit', e.target.value)}
                                placeholder="เช่น ผกร. หรือ กรย.(ก3)"
                              />
                              <div className="var-quick-options" style={{ marginTop: '6px' }}>
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => handleUpdateVariable('assignedUnit', 'ผกร.')}
                                >
                                  📌 ผกร.
                                </button>
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => handleUpdateVariable('assignedUnit', 'กรย.(ก3)')}
                                >
                                  📌 กรย.(ก3)
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: จุดที่ 2: พนักงานขับรถยนต์ (พขร.) */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-purple">จุดที่ 2</span>
                          <strong style={{ fontSize: '14px', color: '#7c3aed' }}>พนักงานขับรถยนต์ (พขร.)</strong>
                        </div>
                        <div className="big-grid-2">
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ชื่อพนักงานขับรถ (พขร.)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.driverName}
                              onChange={(e) => handleUpdateVariable('driverName', e.target.value)}
                              placeholder="เช่น นายขวัญเรือน มีถาวร"
                            />
                            <div className="var-quick-options" style={{ marginTop: '6px' }}>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('driverName', 'นายขวัญเรือน มีถาวร')}
                              >
                                📌 นายขวัญเรือน มีถาวร
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('driverName', 'นายธวัชชัย โต๊ะศรีสุข')}
                              >
                                📌 นายธวัชชัย โต๊ะศรีสุข
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('driverName', 'นายมนตรี พันธุ์สว่าง')}
                              >
                                📌 นายมนตรี พันธุ์สว่าง
                              </button>
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ตำแหน่ง พขร.</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.driverPosition}
                              onChange={(e) => handleUpdateVariable('driverPosition', e.target.value)}
                              placeholder="เช่น พขร.(บ)"
                            />
                            <div className="var-quick-options" style={{ marginTop: '6px' }}>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('driverPosition', 'พขร.(บ)')}
                              >
                                📌 พขร.(บ)
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('driverPosition', 'พขร.')}
                              >
                                📌 พขร.
                              </button>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => handleUpdateVariable('driverPosition', 'ลูกจ้างชั่วคราว')}
                              >
                                📌 ลูกจ้างชั่วคราว
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: จุดที่ 3: เลขไมล์ & ชั่วโมงการทำงาน */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-orange">จุดที่ 3</span>
                          <strong style={{ fontSize: '14px', color: '#c2410c' }}>เลขไมล์ และชั่วโมงการทำงาน</strong>
                        </div>
                        <div className="big-grid-3">
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>เลขไมล์ (กิโลเมตร)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.mileage}
                              onChange={(e) => handleUpdateVariable('mileage', e.target.value)}
                              placeholder="เช่น 54,268"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ชั่วโมงเครน (ถ้ามี)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.craneHours}
                              onChange={(e) => handleUpdateVariable('craneHours', e.target.value)}
                              placeholder="เช่น 1,887"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ชั่วโมงเครื่องยนต์ (ถ้ามี)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.engineHours}
                              onChange={(e) => handleUpdateVariable('engineHours', e.target.value)}
                              placeholder="เช่น 3,835.5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 4: จุดที่ 4: รายการชำรุดและงานซ่อม */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-green">จุดที่ 4</span>
                          <strong style={{ fontSize: '14px', color: '#15803d' }}>รายการชำรุดและงานซ่อม</strong>
                        </div>

                        <div className="big-field-group">
                          <label className="big-label">เพิ่มรายการชำรุดใหม่</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="big-input"
                              value={newDefectInput}
                              onChange={(e) => setNewDefectInput(e.target.value)}
                              placeholder="เช่น สายวัดความยาวบูมชำรุด แล้วกดเพิ่ม"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddDefect(newDefectInput);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="a4-action-btn a4-btn-emerald"
                              onClick={() => handleAddDefect(newDefectInput)}
                            >
                              <Plus size={16} /> เพิ่ม
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {POPULAR_DEFECT_ITEMS.map((item, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleAddDefect(item)}
                                className="a4-action-btn a4-btn-muted"
                                style={{ padding: '2px 8px', fontSize: '11px' }}
                              >
                                + {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="big-label" style={{ marginTop: '14px' }}>
                          รายการชำรุดในเอกสาร ({formData.defectItems.length} รายการ)
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {formData.defectItems.map((defect, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: '#0369a1', width: '24px' }}>{idx + 1}.</span>
                              <input
                                type="text"
                                className="big-input"
                                value={defect}
                                onChange={(e) => {
                                  const copy = [...formData.defectItems];
                                  copy[idx] = e.target.value;
                                  setFormData({ ...formData, defectItems: copy });
                                }}
                              />
                              {formData.defectItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDefect(idx)}
                                  className="a4-action-btn"
                                  style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px' }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card 5: จุดที่ 5: แหล่งงบประมาณ & หน้างาน */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-teal">จุดที่ 5</span>
                          <strong style={{ fontSize: '14px', color: '#0f766e' }}>แหล่งงบประมาณ & ข้อความปิดท้าย</strong>
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">แหล่งงบประมาณในการเบิกจ่าย</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.budgetSource}
                            onChange={(e) => handleUpdateVariable('budgetSource', e.target.value)}
                            placeholder="เช่น งบทำการของ ผยค.(ก3) หรือ หมายเลขงาน (WBS)"
                          />
                          <div className="var-quick-options" style={{ marginTop: '6px' }}>
                            <button
                              type="button"
                              className="var-quick-opt-btn"
                              onClick={() => handleUpdateVariable('budgetSource', 'งบทำการของ ผยค.(ก3)')}
                            >
                              📌 งบทำการของ ผยค.(ก3)
                            </button>
                            <button
                              type="button"
                              className="var-quick-opt-btn"
                              onClick={() => handleUpdateVariable('budgetSource', 'งบทำการของ ผกร.')}
                            >
                              📌 งบทำการของ ผกร.
                            </button>
                            <button
                              type="button"
                              className="var-quick-opt-btn"
                              onClick={() => handleUpdateVariable('budgetSource', 'หมายเลขงาน (WBS)')}
                            >
                              📌 หมายเลขงาน (WBS)
                            </button>
                          </div>
                        </div>

                        {formData.repairCase === 'pea_area' && (
                          <div style={{ marginTop: '12px' }}>
                            <div className="big-grid-2">
                              <div>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>การไฟฟ้าพื้นที่</span>
                                <input
                                  type="text"
                                  className="big-input"
                                  value={formData.peaAreaName}
                                  onChange={(e) => handleUpdateVariable('peaAreaName', e.target.value)}
                                  placeholder="เช่น กฟส.สค.2(บพว.)"
                                />
                              </div>
                              <div>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>หมายเลขงาน WBS</span>
                                <input
                                  type="text"
                                  className="big-input"
                                  value={formData.wbsNo}
                                  onChange={(e) => handleUpdateVariable('wbsNo', e.target.value)}
                                  placeholder="เช่น I-68-I-SM2'A.IQ.2001"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Live Compiled Preview */}
                      <div className="var-live-preview-box">
                        <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} /> ตัวอย่างข้อความที่จะปรากฏในบันทึกข้อความ (Live Preview):
                        </div>
                        {formData.repairCase === 'vehicle_dept' ? (
                          <>
                            <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px', lineHeight: 1.5 }}>
                              <strong>ย่อหน้า 1:</strong> {generateCase1BodyText(formData)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.5 }}>
                              <strong>ย่อหน้า 2:</strong> จึงเรียนมาเพื่อโปรดพิจารณาส่งซ่อม โดยขอเบิกจ่ายค่าใช้จ่ายจาก {formData.budgetSource} ต่อไป
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px', lineHeight: 1.5 }}>
                              <strong>ย่อหน้า 1:</strong> {generateCase2BodyParts(formData).intro}
                            </div>
                            <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.5 }}>
                              <strong>ย่อหน้า 2:</strong> {generateCase2BodyParts(formData).request}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Freeform editor */}
                      <div className="big-grid-2">
                        <div className="big-field-group">
                          <label className="big-label">ชนิดยานพาหนะ</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.vehicleType}
                            onChange={(e) => handleUpdateVariable('vehicleType', e.target.value)}
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">หมายเลขทะเบียน</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.licensePlate}
                            onChange={(e) => handleUpdateVariable('licensePlate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="big-grid-2">
                        <div className="big-field-group">
                          <label className="big-label">ชื่อพนักงานขับรถ (พขร.)</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.driverName}
                            onChange={(e) => handleUpdateVariable('driverName', e.target.value)}
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">ตำแหน่ง พขร.</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.driverPosition}
                            onChange={(e) => handleUpdateVariable('driverPosition', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="big-grid-3">
                        <div className="big-field-group">
                          <label className="big-label">เลขไมล์ (กม.)</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.mileage}
                            onChange={(e) => handleUpdateVariable('mileage', e.target.value)}
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">ชั่วโมงเครน (ถ้ามี)</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.craneHours}
                            onChange={(e) => handleUpdateVariable('craneHours', e.target.value)}
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">ชั่วโมงเครื่องยนต์ (ถ้ามี)</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.engineHours}
                            onChange={(e) => handleUpdateVariable('engineHours', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: DEFECTS */}
              {activeEditSection === 'defects' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">เพิ่มรายการชำรุดใหม่</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="big-input"
                        value={newDefectInput}
                        onChange={(e) => setNewDefectInput(e.target.value)}
                        placeholder="เช่น สายวัดความยาวบูมชำรุด แล้วกดเพิ่ม"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDefect(newDefectInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="a4-action-btn a4-btn-emerald"
                        onClick={() => handleAddDefect(newDefectInput)}
                      >
                        <Plus size={16} /> เพิ่ม
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {POPULAR_DEFECT_ITEMS.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddDefect(item)}
                          className="a4-action-btn a4-btn-muted"
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="big-label" style={{ marginTop: '16px' }}>
                    รายการชำรุดทั้งหมด ({formData.defectItems.length} รายการ)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.defectItems.map((defect, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#0369a1', width: '24px' }}>{idx + 1}.</span>
                        <input
                          type="text"
                          className="big-input"
                          value={defect}
                          onChange={(e) => {
                            const copy = [...formData.defectItems];
                            copy[idx] = e.target.value;
                            setFormData({ ...formData, defectItems: copy });
                          }}
                        />
                        {formData.defectItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDefect(idx)}
                            className="a4-action-btn"
                            style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: SITE & BUDGET */}
              {activeEditSection === 'site' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">แหล่งงบประมาณในการเบิกจ่าย</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.budgetSource}
                      onChange={(e) => setFormData({ ...formData, budgetSource: e.target.value })}
                      placeholder="เช่น งบทำการของ ผยค.(ก3) หรือ หมายเลขงาน (WBS)"
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, budgetSource: 'งบทำการของ ผยค.(ก3)' })}
                      >
                        📌 งบทำการของ ผยค.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, budgetSource: 'งบทำการของ ผกร.' })}
                      >
                        📌 งบทำการของ ผกร.
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, budgetSource: 'หมายเลขงาน (WBS)' })}
                      >
                        📌 หมายเลขงาน (WBS)
                      </button>
                    </div>
                  </div>

                  {formData.repairCase === 'pea_area' && (
                    <>
                      <div className="big-grid-2">
                        <div className="big-field-group">
                          <label className="big-label">การไฟฟ้าพื้นที่ปฏิบัติงาน</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.peaAreaName}
                            onChange={(e) => setFormData({ ...formData, peaAreaName: e.target.value })}
                            placeholder="เช่น กฟส.สค.2(บพว.)"
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">หมายเลขงาน WBS</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.wbsNo}
                            onChange={(e) => setFormData({ ...formData, wbsNo: e.target.value })}
                            placeholder="เช่น I-68-I-SM2'A.IQ.2001"
                          />
                        </div>
                      </div>

                      <div className="big-grid-2">
                        <div className="big-field-group">
                          <label className="big-label">โครงข่าย</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.networkNo}
                            onChange={(e) => setFormData({ ...formData, networkNo: e.target.value })}
                            placeholder="เช่น 7001117369"
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">กิจกรรม</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.activityNo}
                            onChange={(e) => setFormData({ ...formData, activityNo: e.target.value })}
                            placeholder="เช่น 0050"
                          />
                        </div>
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">รายละเอียดงานก่อสร้างของโครงการ</label>
                        <textarea
                          rows={2}
                          className="big-textarea"
                          value={formData.workDetails}
                          onChange={(e) => setFormData({ ...formData, workDetails: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SECTION 5: SIGNER & COMMANDER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ชื่อผู้เสนอเรื่อง</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerName}
                      onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                      placeholder="เช่น นายพิสันติ์ จิตต์ปลื้ม"
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, proposerName: 'นายพิสันติ์ จิตต์ปลื้ม' })}
                      >
                        📌 นายพิสันติ์ จิตต์ปลื้ม
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, proposerName: 'นายพิสันต์ จิตต์ปลื้ม' })}
                      >
                        📌 นายพิสันต์ จิตต์ปลื้ม
                      </button>
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตำแหน่งผู้เสนอ</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerPosition}
                      onChange={(e) => setFormData({ ...formData, proposerPosition: e.target.value })}
                      placeholder="เช่น หผ.กร.(ก3)"
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, proposerPosition: 'หผ.กร.(ก3)' })}
                      >
                        📌 หผ.กร.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, proposerPosition: 'หน.กร.(ก3)' })}
                      >
                        📌 หน.กร.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, proposerPosition: 'ผห.กร.กรย.(ก3)' })}
                      >
                        📌 ผห.กร.กรย.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, proposerPosition: 'ผกร.กรย.(ก3)' })}
                      >
                        📌 ผกร.กรย.(ก3)
                      </button>
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">วันที่เสนอ</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerDate}
                      onChange={(e) => setFormData({ ...formData, proposerDate: e.target.value })}
                      placeholder=""
                    />
                  </div>

                  {formData.repairCase === 'vehicle_dept' && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="big-label" style={{ marginBottom: 0 }}>
                          คำสั่งการ อก.รย. (แทงเรื่องด้านล่าง)
                        </span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.hasCommanderOrder}
                            onChange={(e) => setFormData({ ...formData, hasCommanderOrder: e.target.checked })}
                          />
                          <span>แสดงคำสั่งการ</span>
                        </label>
                      </div>

                      {formData.hasCommanderOrder && (
                        <>
                          <div className="big-grid-2">
                            <div className="big-field-group">
                              <label className="big-label">คำสั่งการถึง (หน่วยงาน)</label>
                              <input
                                type="text"
                                className="big-input"
                                value={formData.commanderTarget}
                                onChange={(e) => setFormData({ ...formData, commanderTarget: e.target.value })}
                                placeholder="เช่น - หผ.ยค.(ก3)"
                              />
                              <div className="var-quick-options">
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commanderTarget: '- หผ.ยค.(ก3)' })}
                                >
                                  📌 - หผ.ยค.(ก3)
                                </button>
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commanderTarget: '- ผยค.(ก3)' })}
                                >
                                  📌 - ผยค.(ก3)
                                </button>
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commanderTarget: '- หผ.กร.(ก3)' })}
                                >
                                  📌 - หผ.กร.(ก3)
                                </button>
                              </div>
                            </div>

                            <div className="big-field-group">
                              <label className="big-label">ข้อความสั่งการ</label>
                              <input
                                type="text"
                                className="big-input"
                                value={formData.commandText}
                                onChange={(e) => setFormData({ ...formData, commandText: e.target.value })}
                                placeholder="เช่น ดำเนินการต่อไป"
                              />
                              <div className="var-quick-options">
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commandText: 'ดำเนินการต่อไป' })}
                                >
                                  📌 ดำเนินการต่อไป
                                </button>
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commandText: 'เพื่อโปรดพิจารณาดำเนินการต่อไป' })}
                                >
                                  📌 เพื่อโปรดพิจารณาดำเนินการต่อไป
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="big-grid-2">
                            <div className="big-field-group">
                              <label className="big-label">ชื่อผู้สั่งการ</label>
                              <input
                                type="text"
                                className="big-input"
                                value={formData.commanderName}
                                onChange={(e) => setFormData({ ...formData, commanderName: e.target.value })}
                                placeholder="เช่น นายอนันต์ กาญจนอุปถัมภ์"
                              />
                              <div className="var-quick-options">
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commanderName: 'นายอนันต์ กาญจนอุปถัมภ์' })}
                                >
                                  📌 นายอนันต์ กาญจนอุปถัมภ์
                                </button>
                              </div>
                            </div>

                            <div className="big-field-group">
                              <label className="big-label">ตำแหน่งผู้สั่งการ</label>
                              <input
                                type="text"
                                className="big-input"
                                value={formData.commanderPosition}
                                onChange={(e) => setFormData({ ...formData, commanderPosition: e.target.value })}
                                placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                              />
                              <div className="var-quick-options">
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commanderPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)' })}
                                >
                                  📌 รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
                                </button>
                                <button
                                  type="button"
                                  className="var-quick-opt-btn"
                                  onClick={() => setFormData({ ...formData, commanderPosition: 'อก.รย.(ก3)' })}
                                >
                                  📌 อก.รย.(ก3)
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="big-editor-footer">
              <button
                type="button"
                className="stepper-btn"
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
              >
                <ChevronLeft size={16} /> ส่วนก่อนหน้า
              </button>

              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {currentSectionIndex + 1} จาก {SECTIONS_META.length} ส่วน
              </div>

              {currentSectionIndex < SECTIONS_META.length - 1 ? (
                <button
                  type="button"
                  className="stepper-btn primary"
                  onClick={handleNextSection}
                >
                  ส่วนถัดไป <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="stepper-btn primary"
                  onClick={() => setActiveEditSection(null)}
                >
                  เสร็จสิ้น / บันทึก <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="a4-toast no-print">
          <Check size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
