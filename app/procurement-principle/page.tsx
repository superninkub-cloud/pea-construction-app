"use client";

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  ShoppingBag,
  Truck,
  Printer,
  Save,
  RotateCcw,
  Copy,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Check,
  Download,
  Calendar,
  Eye,
  Building,
  UserCheck,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import './procurement.css';
import {
  ProcurementFormData,
  ProcurementType,
  SAMPLE_BUY_DATA,
  SAMPLE_HIRE_DATA,
  DEFAULT_DELEGATION_ORDER,
  getTodayThaiDate,
  generateProcurementMemoPlainText,
  generateProcurementWordDocument
} from './procurementUtils';

export default function ProcurementPrinciplePage() {
  const [formData, setFormData] = useState<ProcurementFormData>(SAMPLE_BUY_DATA);
  const [activeTab, setActiveTab] = useState<'form' | 'word' | 'preview'>('form');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Load from LocalStorage if available
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem('pea_procurement_principle_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.subject) {
          // Clean legacy sample docNo or docDate if cached
          if (parsed.docNo && (parsed.docNo.includes('๑๑๗๘') || parsed.docNo.includes('๒๔๒๖'))) {
            parsed.docNo = '';
          }
          if (parsed.docDate && (parsed.docDate.includes('พ.ย.') || parsed.docDate.includes('ต.ค.'))) {
            parsed.docDate = '';
          }
          setFormData(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading stored procurement form:', e);
    }
  }, []);

  // Save to LocalStorage
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem('pea_procurement_principle_form', JSON.stringify(formData));
      showToast('✓ บันทึกข้อมูลลงเบราว์เซอร์สำเร็จเรียบร้อย');
    } catch (e) {
      showToast('⚠️ ไม่สามารถบันทึกลงเบราว์เซอร์ได้');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Switch between Buy (จัดซื้อ) and Hire (จัดจ้าง)
  const handleSelectMode = (type: ProcurementType) => {
    if (type === 'buy') {
      setFormData(SAMPLE_BUY_DATA);
      showToast('✓ สลับเป็นแบบฟอร์ม: ขออนุมัติหลักการจัดซื้อพัสดุ/อุปกรณ์');
    } else {
      setFormData(SAMPLE_HIRE_DATA);
      showToast('✓ สลับเป็นแบบฟอร์ม: ขออนุมัติหลักการจัดจ้างเครื่องจักร/บริการภายนอก');
    }
  };

  // Reset to original preset
  const handleResetCurrentMode = () => {
    if (confirm(`คุณต้องการรีเซ็ตข้อมูลกลับเป็นแบบฟอร์มตัวอย่าง${formData.procurementType === 'buy' ? 'การจัดซื้อ' : 'การจัดจ้าง'}ใช่หรือไม่?`)) {
      if (formData.procurementType === 'buy') {
        setFormData(SAMPLE_BUY_DATA);
      } else {
        setFormData(SAMPLE_HIRE_DATA);
      }
      try {
        localStorage.removeItem('pea_procurement_principle_form');
      } catch (e) {}
      showToast('✓ รีเซ็ตข้อมูลเป็นแบบฟอร์มตัวอย่างเรียบร้อย');
    }
  };

  // Date shortcut
  const handleSetTodayDocDate = (type: 'short' | 'thai_num' = 'short') => {
    const todayStr = getTodayThaiDate(type);
    setFormData(prev => ({
      ...prev,
      docDate: todayStr,
      signerDate: todayStr
    }));
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  // ============================================================================
  // DIRECT CLIPBOARD COPY FOR WORD
  // ============================================================================

  const handleCopyMemo = async () => {
    const plainText = generateProcurementMemoPlainText(formData);
    const html = generateProcurementWordDocument(formData);

    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('memo');
      showToast('✓ คัดลอกบันทึกข้อความแล้ว! กด Ctrl+V ใน Microsoft Word ได้ทันที');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('memo');
      showToast('✓ คัดลอกข้อความแล้ว (Plain Text)');
    }
  };

  const handleDownloadWordFile = () => {
    const content = generateProcurementWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanSubject = formData.procurementType === 'buy' ? 'ขออนุมัติจัดซื้อ' : 'ขออนุมัติจัดจ้าง';
    const cleanWbs = formData.wbsNo || 'PEA';
    link.download = `บันทึก${cleanSubject}_${cleanWbs}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ ดาวน์โหลดไฟล์ Microsoft Word (.doc) สำเร็จแล้ว!');
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  if (!isClient) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>กำลังโหลดโปรแกรมอนุมัติหลักการจัดซื้อจัดจ้าง...</div>;
  }

  return (
    <div className="procurement-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="pp-toast">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pp-header pp-no-print">
        <div className="pp-header-left">
          <div className="pp-header-icon">
            <FileCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <h1 className="pp-header-title">โปรแกรมอนุมัติหลักการจัดซื้อจัดจ้าง</h1>
              <span className="pp-badge-active">
                <CheckCircle2 size={12} />
                เปิดใช้งาน
              </span>
              <span className="pp-badge-preset">
                <Sparkles size={12} />
                แบบฟอร์มสำเร็จรูป
              </span>
            </div>
            <div className="pp-header-sub">
              ระบบจัดทำบันทึกข้อความขออนุมัติหลักการจัดซื้อพัสดุอุปกรณ์และจัดจ้างเครื่องจักรตามระเบียบ กฟภ. พร้อมศูนย์คัดลอกลง Microsoft Word ทันที
            </div>
          </div>
        </div>

        <div className="pp-header-actions">
          <button
            type="button"
            className="pp-btn pp-btn-secondary"
            onClick={handleResetCurrentMode}
            title="รีเซ็ตเป็นแบบฟอร์มตัวอย่างเริ่มต้น"
          >
            <RotateCcw size={15} />
            รีเซ็ตตัวอย่าง
          </button>
          <button
            type="button"
            className="pp-btn pp-btn-secondary"
            onClick={handleSaveToStorage}
            title="บันทึกข้อมูลเก็บไว้ในเบราว์เซอร์"
          >
            <Save size={15} />
            บันทึก
          </button>
          <button
            type="button"
            className="pp-btn pp-btn-word"
            onClick={handleCopyMemo}
            title="คัดลอกทั้งหมดลง Microsoft Word"
          >
            <Copy size={16} />
            คัดลอกลง Word
          </button>
          <button
            type="button"
            className="pp-btn pp-btn-secondary"
            onClick={handleTriggerPrint}
            title="พิมพ์เอกสารออกทางเครื่องพิมพ์"
          >
            <Printer size={16} />
            สั่งพิมพ์
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="pp-tabs-bar pp-no-print">
        <button
          type="button"
          className={`pp-tab-item ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <Briefcase size={18} />
          ๑. ปรับแต่งข้อมูลบันทึกข้อความ
        </button>

        <button
          type="button"
          className={`pp-tab-item ${activeTab === 'word' ? 'active' : ''}`}
          onClick={() => setActiveTab('word')}
        >
          <Copy size={18} />
          ๒. ศูนย์คัดลอกลง Microsoft Word
        </button>

        <button
          type="button"
          className={`pp-tab-item ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={18} />
          ๓. ตัวอย่างเอกสาร & สั่งพิมพ์ A4
        </button>
      </div>

      {/* ====================================================================
          TAB 1: FORM & DETAILS EDITOR
          ==================================================================== */}
      {activeTab === 'form' && (
        <div className="pp-no-print">
          {/* Mode Switcher Banner */}
          <div className="pp-mode-banner">
            <div className="pp-mode-title">
              <Building size={20} />
              <span>เลือกประเภทการขออนุมัติหลักการ (แม่แบบสำเร็จรูป):</span>
            </div>
            <div className="pp-mode-pills">
              <button
                type="button"
                className={`pp-mode-pill ${formData.procurementType === 'buy' ? 'active' : ''}`}
                onClick={() => handleSelectMode('buy')}
              >
                <ShoppingBag size={16} />
                แบบที่ ๑: ขออนุมัติหลักการจัดซื้อ (พัสดุ/อุปกรณ์ เช่น ดอกสว่านเจาะเหล็ก)
              </button>
              <button
                type="button"
                className={`pp-mode-pill ${formData.procurementType === 'hire' ? 'active' : ''}`}
                onClick={() => handleSelectMode('hire')}
              >
                <Truck size={16} />
                แบบที่ ๒: ขออนุมัติหลักการจัดจ้าง (เครื่องจักร/บุคคลภายนอก เช่น แบคโฮหัวกระแทก)
              </button>
            </div>
          </div>

          {/* Card 1: ข้อมูลส่วนหัวหนังสือ */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">
                <FileText className="text-emerald-600" size={20} />
                <span>1. ข้อมูลส่วนหัวบันทึกข้อความ</span>
              </div>
              <button
                type="button"
                className="pp-btn pp-btn-word"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={handleCopyMemo}
              >
                <Copy size={13} />
                คัดลอกข้อความส่วนนี้
              </button>
            </div>

            <div className="pp-card-body">
              <div className="pp-form-grid-4" style={{ marginBottom: '16px' }}>
                <div className="pp-field">
                  <label className="pp-label">จาก</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.docFrom}
                    onChange={e => setFormData({ ...formData, docFrom: e.target.value })}
                    placeholder="เช่น กรย.(ก๓)"
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">ถึง</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.docTo}
                    onChange={e => setFormData({ ...formData, docTo: e.target.value })}
                    placeholder="เช่น ผวบ.(ก๓)"
                  />
                </div>

                <div className="pp-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="pp-label" style={{ margin: 0 }}>เลขที่หนังสือ</label>
                    {formData.docNo && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, docNo: '' }));
                          showToast('ล้างเลขที่หนังสือแล้ว');
                        }}
                        style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                        title="ล้างเลขที่หนังสือ"
                      >
                        ล้าง
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.docNo}
                    onChange={e => setFormData({ ...formData, docNo: e.target.value })}
                    placeholder="เว้นว่างไว้ลงรับ หรือกรอก เช่น ก.๓ กรย.(กร.) ..."
                  />
                </div>

                <div className="pp-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="pp-label" style={{ margin: 0 }}>วันที่</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleSetTodayDocDate('short')}
                        style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '4px', cursor: 'pointer' }}
                        title="ใส่วันที่ปัจจุบัน"
                      >
                        ใส่วันนี้
                      </button>
                      {formData.docDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, docDate: '', signerDate: '' }));
                            showToast('ล้างวันที่แล้ว');
                          }}
                          style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                          title="ล้างวันที่"
                        >
                          ล้าง
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.docDate}
                    onChange={e => setFormData({ ...formData, docDate: e.target.value })}
                    placeholder="เว้นว่างไว้ลงวันที่ หรือกรอก เช่น ๑๙ ต.ค. ๖๙"
                  />
                </div>
              </div>

              {/* Subject & Salutation */}
              <div className="pp-form-grid-2" style={{ marginBottom: '16px' }}>
                <div className="pp-field">
                  <label className="pp-label">เรื่อง</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="pp-field">
                  <label className="pp-label">เรียน</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.salutation}
                    onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                  />
                </div>
              </div>

              {/* Project Details Banner */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#166534', marginBottom: '12px' }}>
                  ข้อมูลโครงการและแผนงานก่อสร้าง
                </div>

                <div className="pp-form-grid-3" style={{ marginBottom: '12px' }}>
                  <div className="pp-field">
                    <label className="pp-label">หมายเลขงาน (WBS)</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.wbsNo}
                      onChange={e => setFormData({ ...formData, wbsNo: e.target.value })}
                      placeholder="I-69-I-PSCXX.19.3909"
                    />
                  </div>

                  <div className="pp-field">
                    <label className="pp-label">โครงข่าย / กิจกรรม (ถ้ามี)</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.networkNo ? `${formData.networkNo} ${formData.activityNo ? `/ ${formData.activityNo}` : ''}` : ''}
                      onChange={e => {
                        const parts = e.target.value.split('/');
                        setFormData({
                          ...formData,
                          networkNo: parts[0]?.trim() || '',
                          activityNo: parts[1]?.trim() || ''
                        });
                      }}
                      placeholder="เช่น 7001210932 / 0050"
                    />
                  </div>

                  <div className="pp-field">
                    <label className="pp-label">หนังสืออนุมัติงาน</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.approvalDocRef}
                      onChange={e => setFormData({ ...formData, approvalDocRef: e.target.value })}
                      placeholder="ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙"
                    />
                  </div>
                </div>

                <div className="pp-form-grid-2">
                  <div className="pp-field">
                    <label className="pp-label">ชื่องานและสถานที่ก่อสร้าง</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.projectName}
                      onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                    />
                  </div>

                  <div className="pp-field">
                    <label className="pp-label">ผู้เปิดงาน / ผู้ควบคุมงาน</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.workOpenerName}
                      onChange={e => setFormData({ ...formData, workOpenerName: e.target.value })}
                      placeholder="นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: เนื้อหา ๓ ตอน */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">
                <ShieldCheck className="text-emerald-600" size={20} />
                <span>2. เนื้อหา ๓ ตอน (เรื่องเดิม, ข้อเท็จจริง, ข้อเสนอเพื่อพิจารณา)</span>
              </div>
            </div>

            <div className="pp-card-body">
              <div className="pp-field" style={{ marginBottom: '16px' }}>
                <label className="pp-label">๑. เรื่องเดิม</label>
                <textarea
                  className="pp-textarea"
                  rows={3}
                  value={formData.backgroundText}
                  onChange={e => setFormData({ ...formData, backgroundText: e.target.value })}
                />
              </div>

              <div className="pp-field" style={{ marginBottom: '16px' }}>
                <label className="pp-label">
                  <span>๒. ข้อเท็จจริง (เหตุผลความจำเป็นในการจัดซื้อ/จัดจ้าง)</span>
                  <span style={{ fontSize: '0.78rem', color: '#059669' }}>
                    *สามารถระบุเป็นข้อ ๒.๑, ๒.๒ หรือเขียนบรรยายความจำเป็นหน้างานได้
                  </span>
                </label>
                <textarea
                  className="pp-textarea"
                  rows={4}
                  value={formData.factsText}
                  onChange={e => setFormData({ ...formData, factsText: e.target.value })}
                />
              </div>

              <div className="pp-field" style={{ marginBottom: '16px' }}>
                <label className="pp-label">๓. ข้อเสนอเพื่อพิจารณา (ขออนุมัติหลักการ)</label>
                <textarea
                  className="pp-textarea"
                  rows={4}
                  value={formData.proposalText}
                  onChange={e => setFormData({ ...formData, proposalText: e.target.value })}
                />
              </div>

              <div className="pp-field" style={{ marginBottom: '16px' }}>
                <label className="pp-label">
                  <span>คำสั่งมอบอำนาจ กฟภ. (วงเงินไม่เกิน ๑,๐๐๐,๐๐๐ บาท)</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delegationOrderText: DEFAULT_DELEGATION_ORDER })}
                    style={{ fontSize: '0.72rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ใช้ข้อความคำสั่งมาตรฐาน พ.(ม) ๒๘/๒๕๖๘
                  </button>
                </label>
                <textarea
                  className="pp-textarea"
                  rows={3}
                  value={formData.delegationOrderText}
                  onChange={e => setFormData({ ...formData, delegationOrderText: e.target.value })}
                />
              </div>

              <div className="pp-field">
                <label className="pp-label">ข้อความปิดท้าย</label>
                <input
                  type="text"
                  className="pp-input"
                  value={formData.closingText}
                  onChange={e => setFormData({ ...formData, closingText: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card 3: ผู้ลงนามและส่วนเกษียนอนุมัติ */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-title">
                <UserCheck className="text-emerald-600" size={20} />
                <span>3. ข้อมูลผู้ลงนามและส่วนเกษียนอนุมัติ</span>
              </div>
            </div>

            <div className="pp-card-body">
              <div className="pp-form-grid-3" style={{ marginBottom: '18px' }}>
                <div className="pp-field">
                  <label className="pp-label">ชื่อผู้ลงนามหลัก (กรย.)</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.signerName}
                    onChange={e => setFormData({ ...formData, signerName: e.target.value })}
                    placeholder="นายกำพล ตุ้ยเต็มวงศ์ หรือ นายอนันต์ กาญจนอุปถัมภ์"
                  />
                </div>
                <div className="pp-field">
                  <label className="pp-label">ตำแหน่งผู้ลงนามหลัก</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.signerTitle}
                    onChange={e => setFormData({ ...formData, signerTitle: e.target.value })}
                    placeholder="อก.รย.(ก๓) หรือ รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)"
                  />
                </div>
                <div className="pp-field">
                  <label className="pp-label">วันที่กำกับลายเซ็น (ถ้ามี)</label>
                  <input
                    type="text"
                    className="pp-input"
                    value={formData.signerDate}
                    onChange={e => setFormData({ ...formData, signerDate: e.target.value })}
                    placeholder="เว้นว่างไว้ลงวันที่จริง"
                  />
                </div>
              </div>

              {/* Endorsement Block */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
                  ส่วนเกษียนสั่งการของผู้อำนวยการฝ่าย (อผ.วบ.)
                </div>

                <div className="pp-form-grid-3">
                  <div className="pp-field">
                    <label className="pp-label">คำสั่งการอนุมัติ</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.approverDivisionText}
                      onChange={e => setFormData({ ...formData, approverDivisionText: e.target.value })}
                      placeholder="อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง"
                    />
                  </div>
                  <div className="pp-field">
                    <label className="pp-label">ชื่อผู้อนุมัติ (อผ.วบ.)</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.approverName}
                      onChange={e => setFormData({ ...formData, approverName: e.target.value })}
                      placeholder="นายเมธี สุกก่ำ"
                    />
                  </div>
                  <div className="pp-field">
                    <label className="pp-label">ตำแหน่งผู้อนุมัติ</label>
                    <input
                      type="text"
                      className="pp-input"
                      value={formData.approverTitle}
                      onChange={e => setFormData({ ...formData, approverTitle: e.target.value })}
                      placeholder="อผ.วบ.(ก๓)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: WORD HUB (1-CLICK COPY & EXPORT)
          ==================================================================== */}
      {activeTab === 'word' && (
        <div className="pp-no-print">
          <div className="pp-word-grid">
            {/* Card 1: Copy Memo */}
            <div className="pp-word-action-card">
              <div>
                <div className="pp-word-card-top">
                  <div className="pp-word-card-icon blue">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="pp-word-card-title">คัดลอกบันทึกข้อความทั้งหมด</h3>
                    <p className="pp-word-card-desc">
                      คัดลอกข้อความบันทึกครบทั้ง ๓ ตอน พร้อมส่วนเกษียนอนุมัติ นำไปวาง (Ctrl+V) ใน Microsoft Word ได้ทันที
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="pp-btn pp-btn-word"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyMemo}
              >
                {copiedItem === 'memo' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'memo' ? 'คัดลอกแล้ว!' : 'คัดลอกบันทึกข้อความลง Word'}
              </button>
            </div>

            {/* Card 2: Download Word File */}
            <div className="pp-word-action-card">
              <div>
                <div className="pp-word-card-top">
                  <div className="pp-word-card-icon green">
                    <Download size={22} />
                  </div>
                  <div>
                    <h3 className="pp-word-card-title">ดาวน์โหลดเป็นไฟล์ Word (.doc)</h3>
                    <p className="pp-word-card-desc">
                      บันทึกเป็นไฟล์ Word อัตโนมัติ สามารถเปิดในโปรแกรม Microsoft Word ได้ทันที จัดระยะบรรทัดและย่อหน้าให้อย่างสวยงาม
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="pp-btn pp-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleDownloadWordFile}
              >
                <Download size={16} />
                ดาวน์โหลดไฟล์ Word (.doc)
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="pp-copy-preview-box">
            <div className="pp-copy-preview-header">
              <div className="pp-copy-preview-title">
                <FileText size={18} className="text-emerald-600" />
                <span>ตัวอย่างข้อความบันทึก (พร้อมนำไปวางใน Word)</span>
              </div>
              <button
                type="button"
                className="pp-btn pp-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                onClick={handleCopyMemo}
              >
                <Copy size={14} />
                คัดลอกส่วนนี้
              </button>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b', fontSize: '15pt', lineHeight: 1.6, fontFamily: 'Sarabun, sans-serif' }}>
              {generateProcurementMemoPlainText(formData)}
            </div>
          </div>

          {/* Guidance Alert */}
          <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <strong>💡 คำแนะนำการนำไปใส่ใน Microsoft Word:</strong>
            <ol style={{ paddingLeft: '20px', marginTop: '6px', margin: 0 }}>
              <li>กดปุ่ม <b>&ldquo;คัดลอกบันทึกข้อความลง Word&rdquo;</b> ด้านบน</li>
              <li>เปิดโปรแกรม Microsoft Word หรือไฟล์เทมเพลตเอกสารของคุณ</li>
              <li>คลิกตำแหน่งที่ต้องการ แล้วกดปุ่ม <b>Ctrl + V</b> (หรือคลิกขวาเลือก Paste)</li>
              <li>ข้อความจะปรากฏใน Word ทันที โดยมีย่อหน้าและส่วนเกษียนครบถ้วน สามารถแก้ไขตัวอักษรหรือจัดหน้าต่อได้อิสระครับ</li>
            </ol>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: DOCUMENT PREVIEW & DIRECT PRINT
          ==================================================================== */}
      {activeTab === 'preview' && (
        <div className="pp-no-print">
          {/* Controls Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>แม่แบบปัจจุบัน:</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#047857' }}>
                {formData.procurementType === 'buy' ? 'แบบที่ ๑: ขออนุมัติหลักการจัดซื้อพัสดุ' : 'แบบที่ ๒: ขออนุมัติหลักการจัดจ้างเครื่องจักร'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="pp-btn pp-btn-word"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={handleCopyMemo}
              >
                <Copy size={15} />
                คัดลอกลง Word
              </button>
              <button
                type="button"
                className="pp-btn pp-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={handleTriggerPrint}
              >
                <Printer size={15} />
                สั่งพิมพ์หน้านี้
              </button>
            </div>
          </div>

          {/* Screen Preview Document */}
          <div className="pp-doc-preview-wrapper">
            {/* Header */}
            <div className="pp-memo-header">
              <img src="/pea-logo.png" alt="PEA Logo" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
                <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
              </div>
            </div>

            {/* Meta Table */}
            <table className="pp-memo-meta-table">
              <tbody>
                <tr>
                  <td style={{ width: '10%', fontWeight: 'bold' }}>จาก</td>
                  <td style={{ width: '40%' }}>{formData.docFrom || '................................'}</td>
                  <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                  <td style={{ width: '40%' }}>{formData.docTo || '................................'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เลขที่</td>
                  <td>{formData.docNo || '................................'}</td>
                  <td style={{ fontWeight: 'bold' }}>วันที่</td>
                  <td>{formData.docDate || '................................'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                  <td colSpan={3} style={{ fontWeight: 'bold' }}>{formData.subject}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เรียน</td>
                  <td colSpan={3}>{formData.salutation}</td>
                </tr>
              </tbody>
            </table>

            {/* Body 3 Paragraphs */}
            <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๑. เรื่องเดิม</p>
            <p className="pp-memo-p">{formData.backgroundText}</p>

            <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๒. ข้อเท็จจริง</p>
            <p className="pp-memo-p" style={{ whiteSpace: 'pre-wrap' }}>{formData.factsText}</p>

            <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๓. ข้อเสนอเพื่อพิจารณา</p>
            <p className="pp-memo-p">{formData.proposalText}</p>
            <p className="pp-memo-p">{formData.delegationOrderText}</p>

            <p className="pp-memo-p" style={{ marginTop: '14pt' }}>{formData.closingText}</p>

            {/* Signer Block */}
            <div className="pp-signer-block">
              <p style={{ marginBottom: '25px' }}><br/></p>
              <p>({formData.signerName})</p>
              <p>{formData.signerTitle}</p>
              {formData.signerDate && <p style={{ fontSize: '14pt' }}>{formData.signerDate}</p>}
            </div>

            {/* Approver Endorsement Block */}
            <table style={{ width: '100%', border: 'none', marginTop: '45px', fontSize: '14pt' }}>
              <tbody>
                <tr>
                  <td style={{ width: '55%', verticalAlign: 'top', border: 'none' }}>
                    <p>- {formData.docFrom || 'กรย.(ก๓)'}</p>
                    <p style={{ marginTop: '6px' }}>{formData.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}</p>
                    <p style={{ marginTop: '35px' }}><br/></p>
                    <p>({formData.approverName})</p>
                    <p>{formData.approverTitle}</p>
                  </td>
                  <td style={{ width: '45%', verticalAlign: 'top', border: 'none', textAlign: 'right' }}>
                    <p>รผ.วบ.(ก๓) .............................. วันที่ ....../....../......</p>
                    <p style={{ marginTop: '10px' }}>ผห.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                    <p style={{ marginTop: '10px' }}>ชผ.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          PRINT ONLY VIEWPORT
          ==================================================================== */}
      <div className="pp-print-only">
        <div className="pp-doc-preview-wrapper">
          <div className="pp-memo-header">
            <img src="/pea-logo.png" alt="PEA Logo" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
              <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
            </div>
          </div>

          <table className="pp-memo-meta-table">
            <tbody>
              <tr>
                <td style={{ width: '10%', fontWeight: 'bold' }}>จาก</td>
                <td style={{ width: '40%' }}>{formData.docFrom || '................................'}</td>
                <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                <td style={{ width: '40%' }}>{formData.docTo || '................................'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>เลขที่</td>
                <td>{formData.docNo || '................................'}</td>
                <td style={{ fontWeight: 'bold' }}>วันที่</td>
                <td>{formData.docDate || '................................'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                <td colSpan={3} style={{ fontWeight: 'bold' }}>{formData.subject}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>เรียน</td>
                <td colSpan={3}>{formData.salutation}</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๑. เรื่องเดิม</p>
          <p className="pp-memo-p">{formData.backgroundText}</p>

          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๒. ข้อเท็จจริง</p>
          <p className="pp-memo-p" style={{ whiteSpace: 'pre-wrap' }}>{formData.factsText}</p>

          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๓. ข้อเสนอเพื่อพิจารณา</p>
          <p className="pp-memo-p">{formData.proposalText}</p>
          <p className="pp-memo-p">{formData.delegationOrderText}</p>

          <p className="pp-memo-p" style={{ marginTop: '14pt' }}>{formData.closingText}</p>

          <div className="pp-signer-block">
            <p style={{ marginBottom: '25px' }}><br/></p>
            <p>({formData.signerName})</p>
            <p>{formData.signerTitle}</p>
            {formData.signerDate && <p style={{ fontSize: '14pt' }}>{formData.signerDate}</p>}
          </div>

          <table style={{ width: '100%', border: 'none', marginTop: '45px', fontSize: '14pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '55%', verticalAlign: 'top', border: 'none' }}>
                  <p>- {formData.docFrom || 'กรย.(ก๓)'}</p>
                  <p style={{ marginTop: '6px' }}>{formData.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}</p>
                  <p style={{ marginTop: '35px' }}><br/></p>
                  <p>({formData.approverName})</p>
                  <p>{formData.approverTitle}</p>
                </td>
                <td style={{ width: '45%', verticalAlign: 'top', border: 'none', textAlign: 'right' }}>
                  <p>รผ.วบ.(ก๓) .............................. วันที่ ....../....../......</p>
                  <p style={{ marginTop: '10px' }}>ผห.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                  <p style={{ marginTop: '10px' }}>ชผ.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
