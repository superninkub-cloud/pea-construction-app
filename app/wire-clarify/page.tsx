"use client";

import React, { useState, useEffect } from 'react';
import {
  FileWarning,
  Calculator,
  Printer,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Layers,
  Check,
  FileSpreadsheet,
  Download,
  Calendar,
  Eye,
  ExternalLink,
  Table as TableIcon,
  Percent,
  Scale,
  Building,
  UserCheck
} from 'lucide-react';
import './wire-clarify.css';
import {
  WireClarifyFormData,
  WireItem,
  SAMPLE_WIRE_CLARIFY_DATA,
  POPULAR_WIRE_TYPES,
  formatKg,
  calculateWirePercent,
  formatPercent,
  getTodayThaiDate,
  generateWireClarifyMemoPlainText,
  generateWireClarifyTableHtmlForWord,
  generateWireClarifyWordDocument,
  generateWireClarifyTsvForExcel
} from './wireClarifyUtils';

export default function WireClarifyPage() {
  const [formData, setFormData] = useState<WireClarifyFormData>(SAMPLE_WIRE_CLARIFY_DATA);
  const [activeTab, setActiveTab] = useState<'form' | 'word' | 'preview'>('form');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Load stored data from LocalStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem('pea_wire_clarify_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          setFormData(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading stored wire clarify form:', e);
    }
  }, []);

  // Save to LocalStorage
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem('pea_wire_clarify_form', JSON.stringify(formData));
      showToast('✓ บันทึกข้อมูลลงเบราว์เซอร์สำเร็จ');
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

  // Reset to original sample
  const handleResetToSample = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นแบบฟอร์มตัวอย่างเริ่มต้นใช่หรือไม่?')) {
      setFormData(SAMPLE_WIRE_CLARIFY_DATA);
      try {
        localStorage.removeItem('pea_wire_clarify_form');
      } catch (e) {}
      showToast('✓ รีเซ็ตเป็นแบบฟอร์มตัวอย่างสำเร็จรูปแล้ว');
    }
  };

  // Calculations
  const totalEstimatedKg = formData.items.reduce((sum, item) => sum + (Number(item.estimatedKg) || 0), 0);
  const totalActualKg = formData.items.reduce((sum, item) => sum + (Number(item.actualKg) || 0), 0);
  const totalPercentage = calculateWirePercent(totalActualKg, totalEstimatedKg);
  const differenceKg = totalEstimatedKg - totalActualKg;

  // Add / Duplicate / Delete / Update Item
  const handleAddItem = () => {
    const newItem: WireItem = {
      id: `wire-${Date.now()}`,
      wireType: POPULAR_WIRE_TYPES[0],
      estimatedKg: 0,
      actualKg: 0,
      remarks: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleDuplicateItem = (index: number) => {
    const target = formData.items[index];
    if (!target) return;
    const duplicated: WireItem = {
      ...target,
      id: `wire-${Date.now()}`
    };
    const updated = [...formData.items];
    updated.splice(index + 1, 0, duplicated);
    setFormData(prev => ({ ...prev, items: updated }));
    showToast('คัดลอกแถวเรียบร้อย');
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) {
      showToast('ต้องมีรายการสายอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: keyof WireItem, value: any) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleClearTable = () => {
    if (confirm('คุณต้องการเคลียร์ค่าในตารางเศษสายทั้งหมดใช่หรือไม่?')) {
      setFormData(prev => ({
        ...prev,
        items: [
          {
            id: `wire-${Date.now()}`,
            wireType: '',
            estimatedKg: 0,
            actualKg: 0,
            remarks: ''
          }
        ]
      }));
      showToast('เคลียร์ค่าในตารางเรียบร้อยแล้ว');
    }
  };

  // Set today's date
  const handleSetTodayDocDate = (type: 'short' | 'thai_num' = 'short') => {
    const todayStr = getTodayThaiDate(type);
    setFormData(prev => ({
      ...prev,
      docDate: todayStr,
      signerDate: todayStr
    }));
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  // Switch Document Mode (Division memo vs Supervisor report)
  const handleSwitchDocLevel = (level: 'division_memo' | 'supervisor_report') => {
    if (level === 'division_memo') {
      setFormData(prev => ({
        ...prev,
        docLevel: 'division_memo',
        docFrom: 'กรย.(ก๓)',
        docTo: 'ผวบ.(ก๓)',
        salutation: 'อผ.วบ.(ก๓) ผ่าน รผ.วบ.(ก๓)',
        subject: 'ขออนุมัตินำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        docLevel: 'supervisor_report',
        docFrom: `พชง.ผู้ควบคุมงาน (${prev.supervisorName.split(' ')[1] || 'ผู้ควบคุมงาน'})`,
        docTo: 'ผกร.กรย.(ก๓)',
        salutation: 'ผห.กร.กรย.(ก๓) ผ่าน ชผ.กร.กรย.(ก๓)',
        subject: `ขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอนงาน${prev.projectName}`
      }));
    }
    showToast(`สลับแบบฟอร์มเป็น: ${level === 'division_memo' ? 'บันทึกขออนุมัติ กอง กรย.' : 'รายงานผู้ควบคุมงาน พชง.'}`);
  };

  // ============================================================================
  // DIRECT CLIPBOARD COPY FOR WORD / EXCEL
  // ============================================================================

  const handleCopyMemo = async () => {
    const plainText = generateWireClarifyMemoPlainText(formData);
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('memo');
      showToast('✓ คัดลอกข้อความบันทึกแล้ว! กด Ctrl+V ใน Microsoft Word ได้ทันที');
    } catch (e) {
      showToast('⚠️ ไม่สามารถคัดลอกได้');
    }
  };

  const handleCopyTable = async () => {
    const tableHtml = generateWireClarifyTableHtmlForWord(formData);
    const plainText = generateWireClarifyTsvForExcel(formData);

    try {
      const htmlBlob = new Blob([tableHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('table');
      showToast('✓ คัดลอกตาราง ๕ ช่องแล้ว! กด Ctrl+V ใน Microsoft Word จะได้ตาราง Word แท้ๆ สมบูรณ์');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('table');
      showToast('✓ คัดลอกตารางแล้ว');
    }
  };

  const handleCopyAll = async () => {
    const plainText = `${generateWireClarifyMemoPlainText(formData)}\n\n--- ตารางคำนวณส่งคืนเศษสาย ---\n\n${generateWireClarifyTsvForExcel(formData)}`;
    const fullHtml = generateWireClarifyWordDocument(formData);

    try {
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('all');
      showToast('✓ คัดลอกเอกสารทั้งชุดแล้ว! นำไปกด Ctrl+V ใน Word ได้ทันที');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('all');
      showToast('✓ คัดลอกข้อความทั้งหมดแล้ว');
    }
  };

  const handleCopyExcel = async () => {
    const tsv = generateWireClarifyTsvForExcel(formData);
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedItem('excel');
      showToast('✓ คัดลอกตารางสำหรับ Excel แล้ว! นำไปกด Ctrl+V ใน Excel แยกคอลัมน์อัตโนมัติ');
    } catch (e) {
      showToast('⚠️ ไม่สามารถคัดลอกได้');
    }
  };

  const handleDownloadWordFile = () => {
    const content = generateWireClarifyWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = formData.wbsNo || 'PEA';
    link.download = `บันทึกชี้แจงส่งคืนเศษสาย_${cleanName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ ดาวน์โหลดไฟล์ Microsoft Word (.doc) สำเร็จแล้ว!');
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  if (!isClient) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>กำลังโหลดโปรแกรมชี้แจงส่งคืนเศษสาย...</div>;
  }

  return (
    <div className="wire-clarify-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="wc-toast">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="wc-header wc-no-print">
        <div className="wc-header-left">
          <div className="wc-header-icon">
            <Percent size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <h1 className="wc-header-title">โปรแกรมชี้แจงส่งคืนเศษสายไม่ครบ 100%</h1>
              <span className="wc-badge-active">
                <CheckCircle2 size={12} />
                เปิดใช้งาน
              </span>
              <span className="wc-badge-calc">
                <Calculator size={12} />
                คำนวณ % อัตโนมัติ
              </span>
            </div>
            <div className="wc-header-sub">
              ระบบจัดทำบันทึกข้อความชี้แจงเหตุผลทางวิศวกรรม คำนวณเปอร์เซ็นต์ส่งคืน และศูนย์คัดลอกลง Microsoft Word / Excel ทันที
            </div>
          </div>
        </div>

        <div className="wc-header-actions">
          <button
            type="button"
            className="wc-btn wc-btn-secondary"
            onClick={handleResetToSample}
            title="รีเซ็ตเป็นแบบฟอร์มตัวอย่างเริ่มต้น"
          >
            <RotateCcw size={15} />
            รีเซ็ตตัวอย่าง
          </button>
          <button
            type="button"
            className="wc-btn wc-btn-secondary"
            onClick={handleSaveToStorage}
            title="บันทึกข้อมูลเก็บไว้ในเบราว์เซอร์"
          >
            <Save size={15} />
            บันทึก
          </button>
          <button
            type="button"
            className="wc-btn wc-btn-word"
            onClick={handleCopyAll}
            title="คัดลอกทั้งหมดลง Microsoft Word"
          >
            <Copy size={16} />
            คัดลอกลง Word
          </button>
          <button
            type="button"
            className="wc-btn wc-btn-secondary"
            onClick={handleTriggerPrint}
            title="พิมพ์เอกสารออกทางเครื่องพิมพ์"
          >
            <Printer size={16} />
            สั่งพิมพ์
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="wc-tabs-bar wc-no-print">
        <button
          type="button"
          className={`wc-tab-item ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <Scale size={18} />
          ๑. ปรับแต่งข้อมูลและตารางคำนวณ
        </button>

        <button
          type="button"
          className={`wc-tab-item ${activeTab === 'word' ? 'active' : ''}`}
          onClick={() => setActiveTab('word')}
        >
          <Copy size={18} />
          ๒. ศูนย์คัดลอกลง Word / Excel
        </button>

        <button
          type="button"
          className={`wc-tab-item ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={18} />
          ๓. ตัวอย่างเอกสาร & สั่งพิมพ์ A4
        </button>
      </div>

      {/* ====================================================================
          TAB 1: FORM & INTERACTIVE CALCULATION TABLE
          ==================================================================== */}
      {activeTab === 'form' && (
        <div className="wc-no-print">
          {/* Document Level Switcher */}
          <div className="wc-doc-selector">
            <span className="wc-doc-selector-title">
              <Building size={16} />
              เลือกระดับเอกสารที่ต้องการจัดทำ:
            </span>
            <button
              type="button"
              className={`wc-doc-pill ${formData.docLevel === 'division_memo' ? 'active' : ''}`}
              onClick={() => handleSwitchDocLevel('division_memo')}
            >
              แบบที่ ๑: บันทึกขออนุมัติ กรย.(ก๓) ถึง ผวบ.(ก๓) (ระดับกอง/เขต มี ๓ ตอน)
            </button>
            <button
              type="button"
              className={`wc-doc-pill ${formData.docLevel === 'supervisor_report' ? 'active' : ''}`}
              onClick={() => handleSwitchDocLevel('supervisor_report')}
            >
              แบบที่ ๒: บันทึกรายงานผล พชง. ถึง ผกร.กรย.(ก๓) (ระดับหน้างาน/ผู้ควบคุมงาน)
            </button>
          </div>

          {/* KPI Calculation Highlights */}
          <div className="wc-kpi-container">
            <div className="wc-kpi-card">
              <span className="wc-kpi-label">ประมาณการส่งคืนรวม</span>
              <div className="wc-kpi-val blue">{formatKg(totalEstimatedKg)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>KG</span></div>
              <div className="wc-kpi-sub">น้ำหนักตามแผนรื้อถอนทั้งหมด</div>
            </div>

            <div className="wc-kpi-card">
              <span className="wc-kpi-label">จำนวนส่งคืนจริงรวม</span>
              <div className="wc-kpi-val orange">{formatKg(totalActualKg)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>KG</span></div>
              <div className="wc-kpi-sub">น้ำหนักที่รื้อถอนส่งคืนคลังได้จริง</div>
            </div>

            <div className="wc-kpi-card">
              <span className="wc-kpi-label">คิดเป็นเปอร์เซ็นต์ (%)</span>
              <div className={`wc-kpi-val ${totalPercentage >= 90 ? 'green' : totalPercentage >= 70 ? 'orange' : 'red'}`}>
                {formatPercent(totalPercentage)}
              </div>
              <div className="wc-kpi-sub">
                {totalPercentage >= 90 ? '✓ ผ่านเกณฑ์มาตรฐาน (> 90%)' : '⚠️ ต่ำกว่าเกณฑ์ ต้องมีบันทึกชี้แจง'}
              </div>
            </div>

            <div className="wc-kpi-card">
              <span className="wc-kpi-label">ส่วนต่างน้ำหนักที่ขาด</span>
              <div className={`wc-kpi-val ${differenceKg > 0 ? 'red' : 'green'}`}>
                {formatKg(differenceKg)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>KG</span>
              </div>
              <div className="wc-kpi-sub">
                ขาดไป {(100 - totalPercentage).toFixed(2)} % จากประมาณการ
              </div>
            </div>
          </div>

          {/* Card 1: ข้อมูลโครงการและส่วนหัวบันทึก */}
          <div className="wc-card">
            <div className="wc-card-header">
              <div className="wc-card-title">
                <FileText className="text-orange-600" size={20} />
                <span>1. ข้อมูลโครงการและส่วนหัวบันทึกข้อความ</span>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-word"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={handleCopyMemo}
              >
                <Copy size={13} />
                คัดลอกข้อความส่วนนี้
              </button>
            </div>

            <div className="wc-card-body">
              {/* Meta Grid 4 */}
              <div className="wc-form-grid-4" style={{ marginBottom: '16px' }}>
                <div className="wc-field">
                  <label className="wc-label">จาก</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.docFrom}
                    onChange={e => setFormData({ ...formData, docFrom: e.target.value })}
                    placeholder="เช่น กรย.(ก๓)"
                  />
                </div>

                <div className="wc-field">
                  <label className="wc-label">ถึง</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.docTo}
                    onChange={e => setFormData({ ...formData, docTo: e.target.value })}
                    placeholder="เช่น ผวบ.(ก๓)"
                  />
                </div>

                <div className="wc-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="wc-label" style={{ margin: 0 }}>เลขที่หนังสือ</label>
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
                    className="wc-input"
                    value={formData.docNo}
                    onChange={e => setFormData({ ...formData, docNo: e.target.value })}
                    placeholder="เว้นว่างไว้ลงรับ หรือกรอก เช่น ก.๓ กรย.(กร.) ..."
                  />
                </div>

                <div className="wc-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="wc-label" style={{ margin: 0 }}>วันที่</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleSetTodayDocDate('short')}
                        style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: '4px', cursor: 'pointer' }}
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
                    className="wc-input"
                    value={formData.docDate}
                    onChange={e => setFormData({ ...formData, docDate: e.target.value })}
                    placeholder="เว้นว่างไว้ลงวันที่ หรือกรอก เช่น ๑๗ ก.ย. ๖๙"
                  />
                </div>
              </div>

              {/* Subject & Salutation */}
              <div className="wc-form-grid-2" style={{ marginBottom: '16px' }}>
                <div className="wc-field">
                  <label className="wc-label">เรื่อง</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="wc-field">
                  <label className="wc-label">เรียน</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.salutation}
                    onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                  />
                </div>
              </div>

              {/* Project Specific Info */}
              <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#9a3412', marginBottom: '12px' }}>
                  รายละเอียดงานก่อสร้างและหมายเลข WBS
                </div>

                <div className="wc-form-grid-3" style={{ marginBottom: '12px' }}>
                  <div className="wc-field">
                    <label className="wc-label">หมายเลขงาน (WBS)</label>
                    <input
                      type="text"
                      className="wc-input"
                      value={formData.wbsNo}
                      onChange={e => setFormData({ ...formData, wbsNo: e.target.value })}
                      placeholder="P-TDD02.3-I-LYAIA.0016"
                    />
                  </div>

                  <div className="wc-field">
                    <label className="wc-label">หนังสืออนุมัติงาน</label>
                    <input
                      type="text"
                      className="wc-input"
                      value={formData.approvalDocRef}
                      onChange={e => setFormData({ ...formData, approvalDocRef: e.target.value })}
                      placeholder="ก.๓ กวว.(วร) ๑๘๔๗/๒๕๖๗ ลงวันที่ ๑๖ สิงหาคม ๒๕๖๗"
                    />
                  </div>

                  <div className="wc-field">
                    <label className="wc-label">หมายเลขโครงข่ายรื้อถอน</label>
                    <input
                      type="text"
                      className="wc-input"
                      value={formData.networkNo}
                      onChange={e => setFormData({ ...formData, networkNo: e.target.value })}
                      placeholder="โครงข่ายรื้อถอนแรงสูงภายนอก ๖๐๐๑๓๘๑๔๗๘"
                    />
                  </div>
                </div>

                <div className="wc-field">
                  <label className="wc-label">ชื่องานและสถานที่ก่อสร้าง</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.projectName}
                    onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="ปรับปรุงระบบจำหน่าย ๒๒ เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง ๒ อ.ศรีสวัสดิ์ จ.กาญจนบุรี"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: เนื้อหาชี้แจงเหตุผล */}
          <div className="wc-card">
            <div className="wc-card-header">
              <div className="wc-card-title">
                <AlertTriangle className="text-amber-600" size={20} />
                <span>
                  2. ข้อความชี้แจงเหตุผลทางวิศวกรรม ({formData.docLevel === 'division_memo' ? 'แบบ ๓ ตอนตามระเบียบ' : 'รายงานผู้ควบคุมงาน'})
                </span>
              </div>
            </div>

            <div className="wc-card-body">
              {formData.docLevel === 'division_memo' ? (
                <>
                  <div className="wc-field" style={{ marginBottom: '16px' }}>
                    <label className="wc-label">๑. เรื่องเดิม</label>
                    <textarea
                      className="wc-textarea"
                      rows={3}
                      value={formData.memoBackground}
                      onChange={e => setFormData({ ...formData, memoBackground: e.target.value })}
                    />
                  </div>

                  <div className="wc-field" style={{ marginBottom: '16px' }}>
                    <label className="wc-label">
                      <span>๒. ข้อเท็จจริง (เหตุผลที่เศษสายไม่ครบตามประมาณการ)</span>
                      <span style={{ fontSize: '0.78rem', color: '#ea580c' }}>
                        *ตัดทิ้งเป็นเศษสั้นๆ อุปกรณ์เข้าปลายสาย/ช่วงต่อสาย/ต่อแยกสาย
                      </span>
                    </label>
                    <textarea
                      className="wc-textarea"
                      rows={4}
                      value={formData.memoFacts}
                      onChange={e => setFormData({ ...formData, memoFacts: e.target.value })}
                    />
                  </div>

                  <div className="wc-field" style={{ marginBottom: '16px' }}>
                    <label className="wc-label">๓. ข้อพิจารณา</label>
                    <textarea
                      className="wc-textarea"
                      rows={4}
                      value={formData.memoConsideration}
                      onChange={e => setFormData({ ...formData, memoConsideration: e.target.value })}
                    />
                  </div>

                  <div className="wc-field">
                    <label className="wc-label">ข้อความปิดท้าย</label>
                    <input
                      type="text"
                      className="wc-input"
                      value={formData.memoClosing}
                      onChange={e => setFormData({ ...formData, memoClosing: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="wc-field" style={{ marginBottom: '16px' }}>
                    <label className="wc-label">เนื้อความรายงานของผู้ควบคุมงาน</label>
                    <textarea
                      className="wc-textarea"
                      rows={5}
                      value={formData.supervisorBody}
                      onChange={e => setFormData({ ...formData, supervisorBody: e.target.value })}
                    />
                  </div>

                  <div className="wc-field">
                    <label className="wc-label">ข้อความปิดท้าย</label>
                    <textarea
                      className="wc-textarea"
                      rows={3}
                      value={formData.supervisorClosing}
                      onChange={e => setFormData({ ...formData, supervisorClosing: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 3: ตารางคำนวณส่งคืนเศษสาย (Interactive Table Editor) */}
          <div className="wc-card">
            <div className="wc-card-header">
              <div className="wc-card-title">
                <Layers className="text-orange-600" size={20} />
                <span>3. ตารางส่งคืนเศษสายและคำนวณเปอร์เซ็นต์อัตโนมัติ</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="wc-btn wc-btn-secondary"
                  onClick={handleClearTable}
                  title="เคลียร์ค่าทุกช่องในตารางให้เป็นช่องว่าง"
                >
                  <RotateCcw size={15} />
                  เคลียร์ค่าตาราง
                </button>
                <button
                  type="button"
                  className="wc-btn wc-btn-excel"
                  onClick={handleCopyExcel}
                >
                  <FileSpreadsheet size={15} />
                  คัดลอกลง Excel
                </button>
                <button
                  type="button"
                  className="wc-btn wc-btn-primary"
                  onClick={handleAddItem}
                >
                  <Plus size={16} />
                  เพิ่มชนิดสาย (+ 1 แถว)
                </button>
              </div>
            </div>

            <div className="wc-card-body">
              <div className="wc-table-wrapper">
                <table className="wc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>ลำดับ</th>
                      <th style={{ minWidth: '240px', textAlign: 'left' }}>ชนิดสาย</th>
                      <th style={{ width: '180px', textAlign: 'right' }}>ประมาณการส่งคืน (KG)</th>
                      <th style={{ width: '180px', textAlign: 'right' }}>จำนวนส่งคืน (KG)</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>คิดเป็นเปอร์เซ็นต์</th>
                      <th style={{ width: '130px', textAlign: 'right' }}>ส่วนต่างขาด (KG)</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const pct = calculateWirePercent(Number(item.actualKg) || 0, Number(item.estimatedKg) || 0);
                      const diff = (Number(item.estimatedKg) || 0) - (Number(item.actualKg) || 0);

                      return (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="wc-input-cell"
                              value={item.wireType}
                              onChange={e => handleUpdateItem(index, 'wireType', e.target.value)}
                              placeholder="ระบุชนิดสาย เช่น เศษสายอลูมิเนียมแกนเหล็ก"
                              list="popularWireList"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="any"
                              className="wc-input-cell"
                              style={{ textAlign: 'right', fontWeight: 600 }}
                              value={item.estimatedKg || ''}
                              onChange={e => handleUpdateItem(index, 'estimatedKg', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="any"
                              className="wc-input-cell"
                              style={{ textAlign: 'right', fontWeight: 600, color: '#c2410c' }}
                              value={item.actualKg || ''}
                              onChange={e => handleUpdateItem(index, 'actualKg', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`wc-pct-badge ${pct >= 90 ? 'good' : pct >= 70 ? 'warn' : 'danger'}`}>
                              {formatPercent(pct)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 500, color: diff > 0 ? '#dc2626' : '#16a34a' }}>
                            {formatKg(diff)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem(index)}
                                style={{
                                  padding: '4px 6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  color: '#475569',
                                }}
                                title="ทำสำเนาแถวนี้"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(index)}
                                style={{
                                  padding: '4px 6px',
                                  border: '1px solid #fecaca',
                                  background: '#fef2f2',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                }}
                                title="ลบแถวนี้"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Data list for wire types */}
              <datalist id="popularWireList">
                {POPULAR_WIRE_TYPES.map(wt => (
                  <option key={wt} value={wt} />
                ))}
              </datalist>

              {/* Summary Bar */}
              <div className="wc-summary-bar">
                <div className="wc-sum-items">
                  <div className="wc-sum-item">
                    <span className="wc-sum-label">รวมประมาณการส่งคืน:</span>
                    <span className="wc-sum-val">{formatKg(totalEstimatedKg)} KG</span>
                  </div>
                  <div className="wc-sum-item">
                    <span className="wc-sum-label">รวมจำนวนส่งคืนจริง:</span>
                    <span className="wc-sum-val">{formatKg(totalActualKg)} KG</span>
                  </div>
                  <div className="wc-sum-item">
                    <span className="wc-sum-label">คิดเป็นเปอร์เซ็นต์รวม:</span>
                    <span className="wc-sum-val" style={{ color: totalPercentage >= 90 ? '#15803d' : '#c2410c' }}>
                      {formatPercent(totalPercentage)}
                    </span>
                  </div>
                  <div className="wc-sum-item">
                    <span className="wc-sum-label">ส่วนต่างน้ำหนักขาด:</span>
                    <span className="wc-sum-val" style={{ color: differenceKg > 0 ? '#b91c1c' : '#15803d' }}>
                      {formatKg(differenceKg)} KG
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="wc-btn wc-btn-word"
                    onClick={() => setActiveTab('word')}
                  >
                    ไปที่ศูนย์คัดลอกลง Word
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: ผู้ลงนามและผู้เกี่ยวข้อง */}
          <div className="wc-card">
            <div className="wc-card-header">
              <div className="wc-card-title">
                <UserCheck className="text-orange-600" size={20} />
                <span>4. ข้อมูลผู้ลงนามและผู้เกี่ยวข้อง</span>
              </div>
            </div>

            <div className="wc-card-body">
              <div className="wc-form-grid-3" style={{ marginBottom: '16px' }}>
                <div className="wc-field">
                  <label className="wc-label">ชื่อผู้ควบคุมงาน</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.supervisorName}
                    onChange={e => setFormData({ ...formData, supervisorName: e.target.value })}
                    placeholder="นายอุดมศักดิ์ จันทร์กลิ่น"
                  />
                </div>
                <div className="wc-field">
                  <label className="wc-label">ตำแหน่งผู้ควบคุมงาน</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.supervisorPosition}
                    onChange={e => setFormData({ ...formData, supervisorPosition: e.target.value })}
                    placeholder="พชง.๗ ผกร.กรย.(ก๓)"
                  />
                </div>
                <div className="wc-field">
                  <label className="wc-label">หัวหน้าแผนก (ชผ.กร. / ผห.กร.)</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.headOfSectionName}
                    onChange={e => setFormData({ ...formData, headOfSectionName: e.target.value })}
                    placeholder="นายชานินทร์ ศรีสวัสดิ์"
                  />
                </div>
              </div>

              <div className="wc-form-grid-3">
                <div className="wc-field">
                  <label className="wc-label">ชื่อผู้ลงนามหลัก (กรย.)</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.signerName}
                    onChange={e => setFormData({ ...formData, signerName: e.target.value })}
                    placeholder="นายอนันต์ กาญจนอุปถัมภ์"
                  />
                </div>
                <div className="wc-field">
                  <label className="wc-label">ตำแหน่งผู้ลงนามหลัก</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.signerTitle}
                    onChange={e => setFormData({ ...formData, signerTitle: e.target.value })}
                    placeholder="รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)"
                  />
                </div>
                <div className="wc-field">
                  <label className="wc-label">ผู้อนุมัติ (อผ.วบ.)</label>
                  <input
                    type="text"
                    className="wc-input"
                    value={formData.approverName}
                    onChange={e => setFormData({ ...formData, approverName: e.target.value })}
                    placeholder="นายเมธี สุกก่ำ"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: MICROSOFT WORD & EXCEL COPY HUB
          ==================================================================== */}
      {activeTab === 'word' && (
        <div className="wc-no-print">
          {/* Action Cards Grid */}
          <div className="wc-word-grid">
            {/* Card 1: Copy Memo Text */}
            <div className="wc-word-action-card">
              <div>
                <div className="wc-word-card-top">
                  <div className="wc-word-card-icon blue">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="wc-word-card-title">คัดลอกข้อความบันทึก</h3>
                    <p className="wc-word-card-desc">
                      คัดลอกข้อความหัวกระดาษ เลขที่ วันที่ เรื่อง เรียน เหตุผล ๓ ตอน และผู้ลงนาม นำไปวาง (Ctrl+V) ใน Word ได้ทันที
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-word"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyMemo}
              >
                {copiedItem === 'memo' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'memo' ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความบันทึก'}
              </button>
            </div>

            {/* Card 2: Copy Wire Table */}
            <div className="wc-word-action-card">
              <div>
                <div className="wc-word-card-top">
                  <div className="wc-word-card-icon orange">
                    <TableIcon size={22} />
                  </div>
                  <div>
                    <h3 className="wc-word-card-title">คัดลอกตารางส่งคืนเศษสาย</h3>
                    <p className="wc-word-card-desc">
                      คัดลอกเป็นตาราง Word แท้ๆ พร้อมเส้นกรอบ หัวตาราง การจัดตำแหน่งตัวเลข และผลรวมเปอร์เซ็นต์ วางใน Word แก้ไขต่อได้เลย
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyTable}
              >
                {copiedItem === 'table' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'table' ? 'คัดลอกแล้ว!' : 'คัดลอกตาราง ๕ ช่องลง Word'}
              </button>
            </div>

            {/* Card 3: Download Word File (.doc) */}
            <div className="wc-word-action-card">
              <div>
                <div className="wc-word-card-top">
                  <div className="wc-word-card-icon blue">
                    <Download size={22} />
                  </div>
                  <div>
                    <h3 className="wc-word-card-title">ดาวน์โหลดเป็นไฟล์ Word (.doc)</h3>
                    <p className="wc-word-card-desc">
                      บันทึกเป็นไฟล์ Word อัตโนมัติ เปิดในโปรแกรม Microsoft Word ได้ทันที ทั้งข้อความ ตารางคำนวณ และส่วนเกษียน
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#2563eb', color: '#1d4ed8' }}
                onClick={handleDownloadWordFile}
              >
                <Download size={16} />
                ดาวน์โหลดไฟล์ Word (.doc)
              </button>
            </div>

            {/* Card 4: Copy for Excel */}
            <div className="wc-word-action-card">
              <div>
                <div className="wc-word-card-top">
                  <div className="wc-word-card-icon green">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 className="wc-word-card-title">คัดลอกตารางลง Excel</h3>
                    <p className="wc-word-card-desc">
                      คัดลอกข้อมูลเฉพาะตารางตัวเลข นำไปวางในโปรแกรม Microsoft Excel แยกคอลัมน์ให้อัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-excel"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyExcel}
              >
                {copiedItem === 'excel' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'excel' ? 'คัดลอกแล้ว!' : 'คัดลอกสำหรับ Excel'}
              </button>
            </div>
          </div>

          {/* Live Preview Box for Memo */}
          <div className="wc-copy-preview-box">
            <div className="wc-copy-preview-header">
              <div className="wc-copy-preview-title">
                <FileText size={18} className="text-blue-600" />
                <span>ตัวอย่างข้อความบันทึก ({formData.docLevel === 'division_memo' ? 'แบบที่ ๑: บันทึกขออนุมัติ กรย.' : 'แบบที่ ๒: รายงาน พชง.'})</span>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                onClick={handleCopyMemo}
              >
                <Copy size={14} />
                คัดลอกส่วนนี้
              </button>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b', fontSize: '15pt', lineHeight: 1.6, fontFamily: 'Sarabun, sans-serif' }}>
              {generateWireClarifyMemoPlainText(formData)}
            </div>
          </div>

          {/* Live Preview Box for Table */}
          <div className="wc-copy-preview-box">
            <div className="wc-copy-preview-header">
              <div className="wc-copy-preview-title">
                <TableIcon size={18} className="text-orange-600" />
                <span>ตัวอย่างตาราง ๕ ช่อง (พร้อมคัดลอกเป็นตาราง Word)</span>
              </div>
              <button
                type="button"
                className="wc-btn wc-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                onClick={handleCopyTable}
              >
                <Copy size={14} />
                คัดลอกตารางนี้
              </button>
            </div>

            <div 
              style={{ overflowX: 'auto', margin: '10px 0' }}
              dangerouslySetInnerHTML={{ __html: generateWireClarifyTableHtmlForWord(formData) }}
            />
          </div>

          {/* Guidance Alert */}
          <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <strong>💡 คำแนะนำการนำไปใส่ใน Microsoft Word:</strong>
            <ol style={{ paddingLeft: '20px', marginTop: '6px', margin: 0 }}>
              <li>กดปุ่ม <b>&ldquo;คัดลอกตาราง ๕ ช่องลง Word&rdquo;</b> หรือ <b>&ldquo;คัดลอกข้อความบันทึก&rdquo;</b> ด้านบน</li>
              <li>เปิดโปรแกรม Microsoft Word หรือไฟล์เทมเพลตเอกสารของคุณ</li>
              <li>คลิกตำแหน่งที่ต้องการ แล้วกดปุ่ม <b>Ctrl + V</b> (หรือคลิกขวาเลือก Paste)</li>
              <li>ตารางและข้อความจะปรากฏใน Word ทันที โดยเป็นตารางของ Word ที่คุณสามารถจัดหน้า ปรับความกว้างคอลัมน์ หรือแก้ไขตัวอักษรได้อิสระครับ</li>
            </ol>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: DOCUMENT PREVIEW & DIRECT PRINT
          ==================================================================== */}
      {activeTab === 'preview' && (
        <div className="wc-no-print">
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
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>ระดับหนังสือ:</span>
              <button
                type="button"
                className={`wc-btn ${formData.docLevel === 'division_memo' ? 'wc-btn-primary' : 'wc-btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => handleSwitchDocLevel('division_memo')}
              >
                แบบที่ ๑: บันทึกขออนุมัติ กรย.(ก๓) ถึง ผวบ.(ก๓)
              </button>
              <button
                type="button"
                className={`wc-btn ${formData.docLevel === 'supervisor_report' ? 'wc-btn-primary' : 'wc-btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => handleSwitchDocLevel('supervisor_report')}
              >
                แบบที่ ๒: รายงานผล พชง. ถึง ผกร.กรย.(ก๓)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="wc-btn wc-btn-word"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={handleCopyAll}
              >
                <Copy size={15} />
                คัดลอกลง Word
              </button>
              <button
                type="button"
                className="wc-btn wc-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={handleTriggerPrint}
              >
                <Printer size={15} />
                สั่งพิมพ์หน้านี้
              </button>
            </div>
          </div>

          {/* Screen Preview Document */}
          <div className="wc-doc-preview-wrapper">
            {/* Header */}
            <div className="wc-memo-header">
              <img src="/pea-logo.png" alt="PEA Logo" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
                <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
              </div>
            </div>

            {/* Meta Table */}
            <table className="wc-memo-meta-table">
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

            {/* Body */}
            {formData.docLevel === 'division_memo' ? (
              <>
                <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๑. เรื่องเดิม</p>
                <p className="wc-memo-p">{formData.memoBackground}</p>

                <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๒. ข้อเท็จจริง</p>
                <p className="wc-memo-p">{formData.memoFacts}</p>

                <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๓. ข้อพิจารณา</p>
                <p className="wc-memo-p">{formData.memoConsideration}</p>

                <div 
                  style={{ overflowX: 'auto', margin: '14px 0' }}
                  dangerouslySetInnerHTML={{ __html: generateWireClarifyTableHtmlForWord(formData) }}
                />

                <p className="wc-memo-p" style={{ marginTop: '12px' }}>{formData.memoClosing}</p>

                <div className="wc-signer-block">
                  <p style={{ marginBottom: '25px' }}><br/></p>
                  <p>({formData.signerName})</p>
                  <p>{formData.signerTitle}</p>
                  {formData.signerDate && <p style={{ fontSize: '14pt' }}>{formData.signerDate}</p>}
                </div>

                {/* Approver Endorsement Box */}
                <table style={{ width: '100%', border: 'none', marginTop: '40px', fontSize: '14pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', verticalAlign: 'top', border: 'none' }}>
                        <p><b>อก.บฟ.(ก๓)</b></p>
                        <p style={{ marginTop: '6px' }}>อนุมัติ แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป</p>
                        <p style={{ marginTop: '30px' }}><br/></p>
                        <p>({formData.approverName})</p>
                        <p>{formData.approverTitle}</p>
                      </td>
                      <td style={{ width: '50%', verticalAlign: 'top', border: 'none', textAlign: 'right' }}>
                        <p>ผห.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                        <p style={{ marginTop: '10px' }}>ชผ.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <p className="wc-memo-p">{formData.supervisorBody}</p>
                {formData.networkNo && (
                  <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '10pt 0' }}>{formData.networkNo}</p>
                )}

                <div 
                  style={{ overflowX: 'auto', margin: '14px 0' }}
                  dangerouslySetInnerHTML={{ __html: generateWireClarifyTableHtmlForWord(formData) }}
                />

                <p className="wc-memo-p" style={{ marginTop: '12px' }}>
                  ทั้งนี้จึงขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน เพื่อให้ส่วนเกี่ยวข้องช่วยพิจารณาดำเนินการต่อไป
                </p>
                <p className="wc-memo-p">
                  จึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
                </p>

                <div className="wc-signer-block">
                  <p style={{ marginBottom: '25px' }}><br/></p>
                  <p>({formData.supervisorName})</p>
                  <p>{formData.supervisorPosition}</p>
                </div>

                <div className="wc-signer-block" style={{ marginTop: '30px' }}>
                  <p>ทราบ ดำเนินการต่อไป</p>
                  <p style={{ marginBottom: '25px' }}><br/></p>
                  <p>({formData.headOfSectionName})</p>
                  <p>{formData.headOfSectionTitle}</p>
                </div>

                <div style={{ marginTop: '50px', fontSize: '11pt', color: '#64748b', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                  <p>{formData.contactDepartment}</p>
                  <p>โทรศัพท์ {formData.contactPhone}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          PRINT ONLY VIEWPORT
          ==================================================================== */}
      <div className="wc-print-only">
        <div className="wc-doc-preview-wrapper">
          <div className="wc-memo-header">
            <img src="/pea-logo.png" alt="PEA Logo" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
              <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
            </div>
          </div>

          <table className="wc-memo-meta-table">
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

          {formData.docLevel === 'division_memo' ? (
            <>
              <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๑. เรื่องเดิม</p>
              <p className="wc-memo-p">{formData.memoBackground}</p>

              <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๒. ข้อเท็จจริง</p>
              <p className="wc-memo-p">{formData.memoFacts}</p>

              <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>๓. ข้อพิจารณา</p>
              <p className="wc-memo-p">{formData.memoConsideration}</p>

              <div dangerouslySetInnerHTML={{ __html: generateWireClarifyTableHtmlForWord(formData) }} />

              <p className="wc-memo-p" style={{ marginTop: '12px' }}>{formData.memoClosing}</p>

              <div className="wc-signer-block">
                <p style={{ marginBottom: '25px' }}><br/></p>
                <p>({formData.signerName})</p>
                <p>{formData.signerTitle}</p>
                {formData.signerDate && <p style={{ fontSize: '14pt' }}>{formData.signerDate}</p>}
              </div>

              <table style={{ width: '100%', border: 'none', marginTop: '40px', fontSize: '14pt' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', verticalAlign: 'top', border: 'none' }}>
                      <p><b>อก.บฟ.(ก๓)</b></p>
                      <p style={{ marginTop: '6px' }}>อนุมัติ แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป</p>
                      <p style={{ marginTop: '30px' }}><br/></p>
                      <p>({formData.approverName})</p>
                      <p>{formData.approverTitle}</p>
                    </td>
                    <td style={{ width: '50%', verticalAlign: 'top', border: 'none', textAlign: 'right' }}>
                      <p>ผห.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                      <p style={{ marginTop: '10px' }}>ชผ.กร.(ก๓) .............................. วันที่ ....../....../......</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <p className="wc-memo-p">{formData.supervisorBody}</p>
              {formData.networkNo && (
                <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '10pt 0' }}>{formData.networkNo}</p>
              )}

              <div dangerouslySetInnerHTML={{ __html: generateWireClarifyTableHtmlForWord(formData) }} />

              <p className="wc-memo-p" style={{ marginTop: '12px' }}>
                ทั้งนี้จึงขอรายงานผลการนำส่งคืนพัสดุชำรุดประเภทสายจากการรื้อถอนส่งคืนคลังไม่ครบตามประมาณการรื้อถอน เพื่อให้ส่วนเกี่ยวข้องช่วยพิจารณาดำเนินการต่อไป
              </p>
              <p className="wc-memo-p">
                จึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
              </p>

              <div className="wc-signer-block">
                <p style={{ marginBottom: '25px' }}><br/></p>
                <p>({formData.supervisorName})</p>
                <p>{formData.supervisorPosition}</p>
              </div>

              <div className="wc-signer-block" style={{ marginTop: '30px' }}>
                <p>ทราบ ดำเนินการต่อไป</p>
                <p style={{ marginBottom: '25px' }}><br/></p>
                <p>({formData.headOfSectionName})</p>
                <p>{formData.headOfSectionTitle}</p>
              </div>

              <div style={{ marginTop: '50px', fontSize: '11pt', color: '#64748b', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                <p>{formData.contactDepartment}</p>
                <p>โทรศัพท์ {formData.contactPhone}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
