"use client";

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowRightLeft,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
  Calendar,
  Check,
  Plus,
  Trash2,
  Building,
  UserCheck,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  UploadCloud,
  Table as TableIcon,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  HelpCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toPng } from 'html-to-image';
import TopBar from '../components/TopBar';
import './budget-transfer.css';

// Dynamically import Xarrow for client-side rendering only
const Xarrow = dynamic(() => import('react-xarrows'), { ssr: false });

type EditSectionKey = 'header' | 'project' | 'reason' | 'transfers' | 'signer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'project', title: '2. โครงการ, อ้างอิงเดิม & ค่าใช้จ่าย', shortName: 'โครงการ & ค่าใช้จ่าย', icon: Briefcase },
  { key: 'reason', title: '3. เหตุผลความจำเป็นในการโอนงบ', shortName: 'เหตุผลชี้แจง', icon: Building },
  { key: 'transfers', title: '4. รายการโอนงบประมาณระหว่างโครงข่าย', shortName: 'รายการโอนงบ', icon: ArrowRightLeft },
  { key: 'signer', title: '5. ผู้เสนอและผู้อนุมัติ (อก.รย. & ฝวบ.)', shortName: 'ผู้เสนอ & อนุมัติ', icon: UserCheck },
];

export type BudgetCategory = {
  budget: number;
  disbursed: number;
  remaining: number;
};

export type NetworkData = {
  network: string;
  networkName: string;
  categories: Record<string, BudgetCategory>;
};

export type TransferItem = {
  id: string;
  networkFrom: string;
  categoryFrom: string;
  networkTo: string;
  categoryTo: string;
  amount: number;
};

const CATEGORIES = [
  "ค่าแรง",
  "ค่าควบคุมงาน",
  "ค่าขนส่ง",
  "ค่าเบ็ดเตล็ด",
  "ค่าดำเนินการ"
];

// Helper to translate network abbreviations to full names
const getFullNetworkName = (abbr: string) => {
  if (!abbr) return '';
  const mapping: Record<string, string> = {
    'HT-C-E': 'แผนกก่อสร้างแรงสูงภายนอก',
    'HT-R-E': 'แผนกรื้อถอนแรงสูงภายนอก',
    'TR-C-E': 'แผนกก่อสร้างหม้อแปลงภายนอก',
    'TR-R-E': 'แผนกรื้อถอนหม้อแปลงภายนอก',
    'LT-C-E': 'แผนกก่อสร้างแรงต่ำภายนอก',
    'LT-R-E': 'แผนกรื้อถอนแรงต่ำภายนอก',
    'TL-C-E': 'แผนกก่อสร้างสายส่งภายนอก',
    'TL-R-E': 'แผนกรื้อถอนสายส่งภายนอก'
  };
  return mapping[abbr] || abbr;
};

// Thai Baht Text Formatter
const getThaiBahtText = (amount: number): string => {
  if (!amount || amount === 0) return 'ศูนย์บาทถ้วน';
  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  let numStr = Math.floor(amount).toString();
  let text = '';
  for (let i = 0; i < numStr.length; i++) {
    let n = parseInt(numStr[i]);
    let p = numStr.length - i - 1;
    if (n === 0) continue;
    if (p === 0 && n === 1 && numStr.length > 1) {
      text += 'เอ็ด';
    } else if (p === 1 && n === 1) {
      text += 'สิบ';
    } else if (p === 1 && n === 2) {
      text += 'ยี่สิบ';
    } else {
      text += numbers[n] + positions[p];
    }
  }
  return text + 'บาทถ้วน';
};

// Sample ZPSR018 demo data for quick testing
const SAMPLE_ZPSR_DATA: NetworkData[] = [
  {
    network: "6001381477",
    networkName: "HT-C-E",
    categories: {
      "ค่าพัสดุ": { budget: 250000, disbursed: 120000, remaining: 130000 },
      "ค่าแรง": { budget: 140000, disbursed: 115000, remaining: 25000 },
      "ค่าควบคุมงาน": { budget: 42000, disbursed: 23000, remaining: 19000 },
      "ค่าขนส่ง": { budget: 85000, disbursed: 35000, remaining: 50000 },
      "ค่าเบ็ดเตล็ด": { budget: 60000, disbursed: 35000, remaining: 25000 },
      "ค่าดำเนินการ": { budget: 60000, disbursed: 0, remaining: 60000 }
    }
  },
  {
    network: "6001381478",
    networkName: "LT-C-E",
    categories: {
      "ค่าพัสดุ": { budget: 180000, disbursed: 150000, remaining: 30000 },
      "ค่าแรง": { budget: 80000, disbursed: 150000, remaining: -70000 },
      "ค่าควบคุมงาน": { budget: 25000, disbursed: 20000, remaining: 5000 },
      "ค่าขนส่ง": { budget: 30000, disbursed: 28000, remaining: 2000 },
      "ค่าเบ็ดเตล็ด": { budget: 20000, disbursed: 18000, remaining: 2000 },
      "ค่าดำเนินการ": { budget: 40000, disbursed: 0, remaining: 40000 }
    }
  }
];

function BudgetTransferContent() {
  // Document State
  const [docFrom, setDocFrom] = useState('กรย.(ก3)');
  const [docTo, setDocTo] = useState('ฝวบ.(ก3)');
  const [docNo, setDocNo] = useState('ก.3กรย.(กร)          /2569');
  const [docDate, setDocDate] = useState('');
  const [subject, setSubject] = useState('ขออนุมัติโอนค่าใช้จ่ายหน้างาน');
  const [salutation, setSalutation] = useState('อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)');

  // Project Info
  const [projectName, setProjectName] = useState('งานปรับปรุงระบบจำหน่าย 22 เควี');
  const [wbs, setWbs] = useState('P-TDD02.3-I-LYAIA.0015');
  const [refDocNo, setRefDocNo] = useState('กวว.(วร) 380/2567');
  const [refDocDate, setRefDocDate] = useState('16 สิงหาคม 2567');
  const [peaOffice, setPeaOffice] = useState('กฟส.ลญ.');
  const [supervisorName, setSupervisorName] = useState('นายอุดมศักดิ์ จันทร์กลิ่น');
  const [supervisorLevel, setSupervisorLevel] = useState('7');

  // Project Expense Breakdown (Customizable & Editable)
  const [totalExpense, setTotalExpense] = useState('1,915,387.03');
  const [materialExpense, setMaterialExpense] = useState('1,357,472.03');
  const [siteExpense, setSiteExpense] = useState('479,162.00');
  const [operatingExpense, setOperatingExpense] = useState('78,753.00');

  // Reason
  const [reasonText, setReasonText] = useState('ปัจจุบันงานก่อสร้างดังกล่าวได้ดำเนินการแล้วเสร็จและจ่ายไฟแล้ว แต่เนื่องจากในการดำเนินการก่อสร้างมีความจำเป็นต้องดับกระแสไฟและระดมชุดงานเพื่อปฏิบัติงานในวันอาทิตย์หลายครั้ง ซึ่งในการปฏิบัติงานวันอาทิตย์นั้น กฟภ.ต้องจ่ายค่าแรงงานเป็น 2 เท่าของค่าแรงงานปกติ จึงส่งผลให้ค่าใช้จ่ายหน้างานในบางส่วนไม่เพียงพอ');

  // Signers
  const [signer1Name, setSigner1Name] = useState('นายอนันต์ กาญจนอุปถัมภ์');
  const [signer1Title, setSigner1Title] = useState('รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)');
  const [signer2Name, setSigner2Name] = useState('นายเมธี สุกก่ำ');
  const [signer2Title, setSigner2Title] = useState('อฝ.วบ.(ก3)');

  // Transfers List
  const [transfers, setTransfers] = useState<TransferItem[]>([
    {
      id: 't-1',
      networkFrom: '6001381477',
      categoryFrom: 'ค่าขนส่ง',
      networkTo: '6001381478',
      categoryTo: 'ค่าแรง',
      amount: 45000
    },
    {
      id: 't-2',
      networkFrom: '6001381477',
      categoryFrom: 'ค่าเบ็ดเตล็ด',
      networkTo: '6001381478',
      categoryTo: 'ค่าแรง',
      amount: 25000
    }
  ]);

  // ZPSR018 Extracted Data & Calculator State
  const [networkDataList, setNetworkDataList] = useState<NetworkData[]>([]);
  const [pullHistory, setPullHistory] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [showZpsrModal, setShowZpsrModal] = useState<boolean>(false);

  // UI state
  const [activeSheet, setActiveSheet] = useState<'memo' | 'approval' | 'flow'>('memo');
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // LocalStorage persist & load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_budget_transfer_form_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.wbs) setWbs(parsed.wbs);
        if (parsed.docNo) setDocNo(parsed.docNo);
        if (parsed.docDate !== undefined) setDocDate(parsed.docDate);
        if (parsed.docTo) setDocTo(parsed.docTo);
        if (parsed.docFrom) setDocFrom(parsed.docFrom);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.salutation) setSalutation(parsed.salutation);
        if (parsed.refDocNo) setRefDocNo(parsed.refDocNo);
        if (parsed.refDocDate) setRefDocDate(parsed.refDocDate);
        if (parsed.peaOffice) setPeaOffice(parsed.peaOffice);
        if (parsed.supervisorName) setSupervisorName(parsed.supervisorName);
        if (parsed.supervisorLevel) setSupervisorLevel(parsed.supervisorLevel);
        if (parsed.totalExpense !== undefined) setTotalExpense(parsed.totalExpense);
        if (parsed.materialExpense !== undefined) setMaterialExpense(parsed.materialExpense);
        if (parsed.siteExpense !== undefined) setSiteExpense(parsed.siteExpense);
        if (parsed.operatingExpense !== undefined) setOperatingExpense(parsed.operatingExpense);
        if (parsed.reasonText) setReasonText(parsed.reasonText);
        if (parsed.signer1Name) setSigner1Name(parsed.signer1Name);
        if (parsed.signer1Title) setSigner1Title(parsed.signer1Title);
        if (parsed.signer2Name) setSigner2Name(parsed.signer2Name);
        if (parsed.signer2Title) setSigner2Title(parsed.signer2Title);
        if (parsed.transfers && Array.isArray(parsed.transfers)) setTransfers(parsed.transfers);
        if (parsed.networkDataList && Array.isArray(parsed.networkDataList)) setNetworkDataList(parsed.networkDataList);
      }
      const hist = localStorage.getItem("zpsr018_pull_history_budget") || "";
      setPullHistory(hist);
    } catch (e) {
      console.warn('Could not load cached form', e);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = {
        projectName, wbs, docNo, docDate, docTo, docFrom, subject, salutation,
        refDocNo, refDocDate, peaOffice, supervisorName, supervisorLevel,
        totalExpense, materialExpense, siteExpense, operatingExpense,
        reasonText, signer1Name, signer1Title, signer2Name, signer2Title,
        transfers, networkDataList
      };
      localStorage.setItem('pea_budget_transfer_form_v2', JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save form', e);
    }
  }, [
    projectName, wbs, docNo, docDate, docTo, docFrom, subject, salutation,
    refDocNo, refDocDate, peaOffice, supervisorName, supervisorLevel,
    totalExpense, materialExpense, siteExpense, operatingExpense,
    reasonText, signer1Name, signer1Title, signer2Name, signer2Title,
    transfers, networkDataList
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalAmount = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const fmt = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return "0.00";
    if (Math.abs(num) < 0.001) return "-";
    return Number(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper to format in ZPSR style (trailing minus for negative)
  const fmtZpsr = (num: number | undefined) => {
    if (!num || Math.abs(num) < 0.01) return "0.00";
    const isNeg = num < 0;
    const s = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isNeg ? s + "-" : s;
  };

  // Calculate project totals from ZPSR network list
  const calculateTotalProjectValue = () => {
    let total = 0;
    networkDataList.forEach(net => {
      Object.values(net.categories).forEach(vals => {
        total += vals.budget;
      });
    });
    return total;
  };

  const calculateBudgetByCategoryGroup = (groups: string[]) => {
    let total = 0;
    networkDataList.forEach(net => {
      Object.entries(net.categories).forEach(([catKey, vals]) => {
        if (groups.some(g => catKey.includes(g) || g.includes(catKey.replace('งาน', '')))) {
          total += vals.budget;
        }
      });
    });
    return total;
  };

  // Helper to auto-sum sub-expenses into totalExpense
  const handleAutoSumExpenses = () => {
    const parseNum = (val: string) => {
      const clean = (val || '').replace(/,/g, '').trim();
      const n = parseFloat(clean);
      return isNaN(n) ? 0 : n;
    };
    const mat = parseNum(materialExpense);
    const site = parseNum(siteExpense);
    const ops = parseNum(operatingExpense);
    const sum = mat + site + ops;
    setTotalExpense(fmt(sum));
    showToast(`✓ คำนวณรวมยอดค่าใช้จ่ายทั้งสิ้นเป็น ${fmt(sum)} บาท เรียบร้อยแล้ว`);
  };

  // Helper to pull calculated expenses from ZPSR018
  const handlePullZpsrExpenses = () => {
    if (networkDataList.length === 0) {
      showToast('⚠️ ไม่พบข้อมูล ZPSR018 ให้ดึง');
      return;
    }
    const totalB = calculateTotalProjectValue();
    const matB = calculateBudgetByCategoryGroup(['พัสดุ']);
    const siteB = calculateBudgetByCategoryGroup(['แรง', 'ควบคุมงาน', 'ขนส่ง', 'เบ็ดเตล็ด']);
    const opsB = calculateBudgetByCategoryGroup(['ดำเนินการ']);

    setTotalExpense(fmt(totalB));
    setMaterialExpense(fmt(matB));
    setSiteExpense(fmt(siteB));
    setOperatingExpense(fmt(opsB));
    showToast('✓ ดึงยอดคำนวณจาก ZPSR018 เรียบร้อยแล้ว');
  };

  // Helper to find deficit categories for a network
  const getNetworkDeficits = (net: NetworkData) => {
    const deficits: { category: string; amount: number; remaining: number }[] = [];
    CATEGORIES.forEach(cat => {
      const catKey = Object.keys(net.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน', '')));
      const vals = catKey ? net.categories[catKey] : null;
      if (vals && vals.remaining < 0) {
        deficits.push({
          category: cat,
          amount: Math.abs(vals.remaining),
          remaining: vals.remaining
        });
      }
    });
    return deficits;
  };

  // Auto Calculation Algorithm (Exact logic matching PEA financial transfer rules)
  const autoCalculateTransfers = (data: NetworkData[]): TransferItem[] => {
    let fieldDeficits: { network: string; category: string; amount: number }[] = [];
    let fieldSurpluses: { network: string; category: string; amount: number }[] = [];
    let opsSurpluses: { network: string; category: string; amount: number }[] = [];

    const fieldCategories = ["ค่าแรง", "ค่าควบคุมงาน", "ค่าขนส่ง", "ค่าเบ็ดเตล็ด"];

    data.forEach(net => {
      Object.entries(net.categories).forEach(([cat, vals]) => {
        let normalizedCat = cat.replace('งาน', '');
        if (cat.includes('แรง')) normalizedCat = 'ค่าแรง';
        if (cat.includes('ควบคุม')) normalizedCat = 'ค่าควบคุมงาน';
        if (cat.includes('ขนส่ง')) normalizedCat = 'ค่าขนส่ง';
        if (cat.includes('เบ็ดเตล็ด')) normalizedCat = 'ค่าเบ็ดเตล็ด';
        if (cat.includes('ดำเนินการ')) normalizedCat = 'ค่าดำเนินการ';
        if (cat.includes('พัสดุ')) normalizedCat = 'ค่าพัสดุ';

        if (normalizedCat === 'ค่าพัสดุ') return; // Cannot transfer material

        if (fieldCategories.includes(normalizedCat)) {
          if (vals.remaining < 0) {
            fieldDeficits.push({ network: net.network, category: normalizedCat, amount: Math.abs(vals.remaining) });
          } else if (vals.remaining > 0) {
            fieldSurpluses.push({ network: net.network, category: normalizedCat, amount: vals.remaining });
          }
        } else if (normalizedCat === 'ค่าดำเนินการ') {
          if (vals.remaining > 0) {
            opsSurpluses.push({ network: net.network, category: normalizedCat, amount: vals.remaining });
          }
        }
      });
    });

    fieldDeficits.sort((a, b) => b.amount - a.amount);
    fieldSurpluses.sort((a, b) => b.amount - a.amount);
    opsSurpluses.sort((a, b) => b.amount - a.amount);

    const newTransfers: TransferItem[] = [];

    // Phase 1: Transfer from Field Surpluses to Field Deficits
    for (let d of fieldDeficits) {
      let needed = Math.ceil(d.amount / 100) * 100;
      for (let s of fieldSurpluses) {
        if (needed <= 0) break;

        let maxTake = Math.floor(s.amount / 100) * 100;
        if (maxTake <= 0) continue;

        const transferAmount = Math.min(needed, maxTake);

        newTransfers.push({
          id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          networkFrom: s.network,
          categoryFrom: s.category,
          networkTo: d.network,
          categoryTo: d.category,
          amount: Number(transferAmount.toFixed(2))
        });

        needed -= transferAmount;
        s.amount -= transferAmount;
      }
      d.amount = needed; // Update remaining deficit
    }

    // Phase 2: If there are still field deficits, use Operations Surpluses
    for (let d of fieldDeficits) {
      let needed = Math.ceil(d.amount / 100) * 100;
      if (needed <= 0) continue;

      for (let s of opsSurpluses) {
        if (needed <= 0) break;

        let maxTake = Math.floor(s.amount / 100) * 100;
        if (maxTake <= 0) continue;

        const transferAmount = Math.min(needed, maxTake);

        newTransfers.push({
          id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          networkFrom: s.network,
          categoryFrom: s.category,
          networkTo: d.network,
          categoryTo: d.category,
          amount: Number(transferAmount.toFixed(2))
        });

        needed -= transferAmount;
        s.amount -= transferAmount;
      }
      d.amount = needed;
    }

    return newTransfers;
  };

  // Upload ZPSR018 PDF file and call extraction API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('wbs', wbs);

    try {
      const res = await fetch('/api/extract-budget-transfer', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json();
          throw new Error(err.error || 'ไม่สามารถดึงข้อมูลจากไฟล์ PDF ได้');
        } else {
          throw new Error(`Server Error (${res.status}): ไฟล์อาจมีขนาดใหญ่หรือการเชื่อมต่อหมดเวลา`);
        }
      }

      if (contentType && contentType.includes("application/json")) {
        const data: NetworkData[] = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('ไม่พบข้อมูลงบประมาณในไฟล์ PDF กรุณาตรวจสอบว่าเป็นรายงาน ZPSR018 ที่ถูกต้อง');
        }

        setNetworkDataList(data);

        // Calculate and pre-fill project expenses from ZPSR018
        let totalB = 0;
        let matB = 0;
        let siteB = 0;
        let opsB = 0;
        data.forEach(net => {
          Object.entries(net.categories).forEach(([catKey, vals]) => {
            totalB += vals.budget;
            if (catKey.includes('พัสดุ')) matB += vals.budget;
            if (['แรง', 'ควบคุมงาน', 'ขนส่ง', 'เบ็ดเตล็ด'].some(g => catKey.includes(g) || g.includes(catKey.replace('งาน', '')))) {
              siteB += vals.budget;
            }
            if (catKey.includes('ดำเนินการ')) opsB += vals.budget;
          });
        });
        if (totalB > 0) {
          setTotalExpense(fmt(totalB));
          setMaterialExpense(fmt(matB));
          setSiteExpense(fmt(siteB));
          setOperatingExpense(fmt(opsB));
        }

        const now = new Date().toLocaleString('th-TH');
        setPullHistory(now);
        localStorage.setItem("zpsr018_pull_history_budget", now);

        const calculated = autoCalculateTransfers(data);
        setTransfers(calculated);
        showToast(`✓ อัพโหลดสำเร็จ! สกัดได้ ${data.length} โครงข่าย คำนวณโอนงบแล้ว ${calculated.length} รายการ`);
      } else {
        throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง');
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('503 Service Unavailable') || errMsg.includes('503')) {
        setUploadError('ระบบ AI กำลังมีผู้ใช้งานจำนวนมาก (503 Service Unavailable) กรุณารอสักครู่แล้วลองอัพโหลดใหม่อีกครั้ง');
      } else {
        setUploadError(errMsg || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF ZPSR018');
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Load sample demo data
  const handleLoadSampleZpsr = () => {
    setNetworkDataList(SAMPLE_ZPSR_DATA);
    const calculated = autoCalculateTransfers(SAMPLE_ZPSR_DATA);
    setTransfers(calculated);
    const now = new Date().toLocaleString('th-TH') + ' (ตัวอย่าง)';
    setPullHistory(now);
    localStorage.setItem("zpsr018_pull_history_budget", now);
    showToast('✓ โหลดข้อมูลตัวอย่าง ZPSR018 และคำนวณการโอนงบเรียบร้อยแล้ว');
  };

  // Recalculate based on existing networkDataList
  const handleRecalculate = () => {
    if (networkDataList.length === 0) {
      showToast('⚠️ ยังไม่มีข้อมูล ZPSR018 กรุณาอัพโหลดไฟล์ก่อน');
      return;
    }
    const calculated = autoCalculateTransfers(networkDataList);
    setTransfers(calculated);
    showToast(`✓ คำนวณการโอนงบใหม่แล้ว (${calculated.length} รายการ)`);
  };

  // Clear ZPSR data and return to manual
  const handleClearZpsr = () => {
    if (confirm('ต้องการล้างข้อมูล ZPSR018 ที่ดึงมาใช่หรือไม่?')) {
      setNetworkDataList([]);
      setPullHistory('');
      localStorage.removeItem("zpsr018_pull_history_budget");
      showToast('ล้างข้อมูล ZPSR018 เรียบร้อยแล้ว');
    }
  };

  const handleAddTransfer = () => {
    const newItem: TransferItem = {
      id: `t-${Date.now()}`,
      networkFrom: networkDataList[0]?.network || '',
      categoryFrom: 'ค่าขนส่ง',
      networkTo: networkDataList[1]?.network || '',
      categoryTo: 'ค่าแรง',
      amount: 0
    };
    setTransfers([...transfers, newItem]);
    showToast('✓ เพิ่มรายการโอนใหม่แล้ว');
  };

  const handleRemoveTransfer = (index: number) => {
    if (transfers.length <= 1) {
      showToast('⚠️ ต้องมีรายการโอนอย่างน้อย 1 รายการ');
      return;
    }
    setTransfers(transfers.filter((_, i) => i !== index));
  };

  const handleUpdateTransfer = (index: number, field: keyof TransferItem, val: any) => {
    const copy = [...transfers];
    copy[index] = { ...copy[index], [field]: val };
    setTransfers(copy);
  };

  const handleSetTodayDocDate = () => {
    const todayStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    setDocDate(todayStr);
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  const handleCopyWord = async () => {
    const el = document.getElementById('budget-print-area');
    if (!el) return;
    try {
      const html = el.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([el.innerText || ''], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      showToast('✓ คัดลอกแล้ว! เปิด Microsoft Word แล้วกด Ctrl+V ได้ทันที');
    } catch (e) {
      showToast('✓ คัดลอกข้อความสำเร็จ');
    }
  };

  const handleCopyImage = async () => {
    const el = document.querySelector('#flow-chart-container') as HTMLElement;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', style: { padding: '20px' } });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);
      showToast('✓ คัดลอกรูปภาพผังจำลองสำเร็จ! กด Ctrl+V ลงใน Word หรือ Slide ได้ทันที');
    } catch (err) {
      showToast('⚠️ ไม่สามารถคัดลอกภาพได้ ให้ลองดาวน์โหลดเป็นไฟล์แทน');
    }
  };

  const handleDownloadImage = async () => {
    const el = document.querySelector('#flow-chart-container') as HTMLElement;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', style: { padding: '20px' } });
      const link = document.createElement('a');
      link.download = `zpsr018-budget-transfer-flow-${wbs || 'export'}.png`;
      link.href = dataUrl;
      link.click();
      showToast('✓ บันทึกรูปภาพผังจำลองโอนงบแล้ว');
    } catch (err) {
      showToast('⚠️ เกิดข้อผิดพลาดในการบันทึกภาพ');
    }
  };

  const handleResetToSample = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้นใช่หรือไม่?')) {
      setDocFrom('กรย.(ก3)');
      setDocTo('ฝวบ.(ก3)');
      setDocNo('ก.3กรย.(กร)          /2569');
      setDocDate('');
      setSubject('ขออนุมัติโอนค่าใช้จ่ายหน้างาน');
      setSalutation('อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)');
      setProjectName('งานปรับปรุงระบบจำหน่าย 22 เควี');
      setWbs('P-TDD02.3-I-LYAIA.0015');
      setRefDocNo('กวว.(วร) 380/2567');
      setRefDocDate('16 สิงหาคม 2567');
      setPeaOffice('กฟส.ลญ.');
      setSupervisorName('นายอุดมศักดิ์ จันทร์กลิ่น');
      setSupervisorLevel('7');
      setReasonText('ปัจจุบันงานก่อสร้างดังกล่าวได้ดำเนินการแล้วเสร็จและจ่ายไฟแล้ว แต่เนื่องจากในการดำเนินการก่อสร้างมีความจำเป็นต้องดับกระแสไฟและระดมชุดงานเพื่อปฏิบัติงานในวันอาทิตย์หลายครั้ง ซึ่งในการปฏิบัติงานวันอาทิตย์นั้น กฟภ.ต้องจ่ายค่าแรงงานเป็น 2 เท่าของค่าแรงงานปกติ จึงส่งผลให้ค่าใช้จ่ายหน้างานในบางส่วนไม่เพียงพอ');
      setSigner1Name('นายอนันต์ กาญจนอุปถัมภ์');
      setSigner1Title('รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)');
      setSigner2Name('นายเมธี สุกก่ำ');
      setSigner2Title('อฝ.วบ.(ก3)');
      setNetworkDataList(SAMPLE_ZPSR_DATA);
      const calculated = autoCalculateTransfers(SAMPLE_ZPSR_DATA);
      setTransfers(calculated);
      showToast('✓ รีเซ็ตเป็นตัวอย่างเริ่มต้นแล้ว');
    }
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

  // Collect all involved networks across transfers
  const allInvolvedNetworks = Array.from(new Set([
    ...transfers.map(t => t.networkFrom),
    ...transfers.map(t => t.networkTo)
  ])).filter(Boolean);
  allInvolvedNetworks.sort();

  return (
    <>
      <TopBar title="โปรแกรมเอกสารใบขอเบิกค่าใช้จ่าย (โอนงบ)" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <ArrowRightLeft size={18} className="text-purple-300" />
              <span>เอกสารใบขอเบิกค่าใช้จ่าย / โอนงบ</span>
            </div>

            <div className="a4-preset-group">
              <span className="text-xs text-slate-300 font-medium">มุมมอง:</span>
              <button
                type="button"
                className={`a4-preset-chip ${activeSheet === 'memo' ? 'active' : ''}`}
                onClick={() => setActiveSheet('memo')}
              >
                หน้า 1: บันทึกข้อความ
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${activeSheet === 'approval' ? 'active' : ''}`}
                onClick={() => setActiveSheet('approval')}
              >
                หน้า 2: แบบฟอร์มขออนุมัติ
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${activeSheet === 'flow' ? 'active' : ''}`}
                onClick={() => setActiveSheet('flow')}
                title="ตารางจำลองโอนงบและผังโยงลูกศร"
              >
                <TableIcon size={13} /> ผังจำลองโอนงบ (ZPSR018)
              </button>
              <button
                type="button"
                className="a4-preset-chip"
                onClick={handleResetToSample}
                title="รีเซ็ตเป็นตัวอย่างเริ่มต้น"
              >
                <RotateCcw size={13} /> รีเซ็ต
              </button>
            </div>
          </div>

          <div className="a4-action-right">
            {/* ZPSR018 Trigger Button */}
            <button
              type="button"
              className="a4-action-btn"
              style={{
                backgroundColor: networkDataList.length > 0 ? '#8b5cf6' : '#6366f1',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
              onClick={() => setShowZpsrModal(true)}
              title="อัพโหลดรายงาน ZPSR018 จาก SAP เพื่อคำนวณการโอนงบอัตโนมัติ"
            >
              <Sparkles size={15} />
              <span>{networkDataList.length > 0 ? `ZPSR018 (${networkDataList.length} โครงข่าย)` : '⚡ อัพโหลด ZPSR018 คำนวณโอนงบ'}</span>
            </button>

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
              className="a4-action-btn a4-btn-indigo"
              onClick={handleCopyWord}
              title="คัดลอกลง Word (Ctrl+V ได้ทันที)"
            >
              <Copy size={15} /> คัดลอกลง Word
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

          {networkDataList.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#86efac', fontWeight: 500 }}>
                ✓ ใช้ข้อมูลจาก ZPSR018 ({networkDataList.length} โครงข่าย)
              </span>
              <button
                type="button"
                className="a4-preset-chip"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                onClick={handleRecalculate}
                title="คำนวณการโอนงบใหม่อีกครั้ง"
              >
                <RefreshCw size={11} /> คำนวณใหม่
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1 & 2: A4 PAPER CANVAS (MEMO & APPROVAL)                             */}
        {/* ========================================================================= */}
        {(activeSheet === 'memo' || activeSheet === 'approval') && (
          <div className="a4-page-shadow" id="budget-print-area">
            {/* SHEET 1: MEMO */}
            {activeSheet === 'memo' && (
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
                        <td style={{ width: '10%', fontWeight: 'bold' }}>หน่วยงาน</td>
                        <td style={{ width: '40%' }}>
                          <input
                            type="text"
                            className="a4-live-input"
                            value={docFrom}
                            onChange={(e) => setDocFrom(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="เช่น กรย.(ก3)"
                          />
                        </td>
                        <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                        <td style={{ width: '40%' }}>
                          <input
                            type="text"
                            className="a4-live-input"
                            value={docTo}
                            onChange={(e) => setDocTo(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="เช่น ฝวบ.(ก3)"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>ที่</td>
                        <td>
                          <input
                            type="text"
                            className="a4-live-input"
                            value={docNo}
                            onChange={(e) => setDocNo(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="เช่น ก.3กรย.(กร)          /2569"
                          />
                        </td>
                        <td style={{ fontWeight: 'bold' }}>วันที่</td>
                        <td>
                          <input
                            type="text"
                            className="a4-live-input"
                            value={docDate}
                            onChange={(e) => setDocDate(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="เช่น 4 ตุลาคม 2569"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                        <td colSpan={3}>
                          <input
                            type="text"
                            className="a4-live-input"
                            style={{ fontWeight: 'bold' }}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>เรียน</td>
                        <td colSpan={3}>
                          <input
                            type="text"
                            className="a4-live-input"
                            value={salutation}
                            onChange={(e) => setSalutation(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. PROJECT & REASON SECTION */}
                <div
                  className="a4-section-hoverable"
                  onClick={() => setActiveEditSection('project')}
                  title="คลิกเพื่อแก้ไขข้อมูลโครงการ, หนังสืออ้างอิง และค่าใช้จ่าย"
                  style={{ marginTop: '12pt' }}
                >
                  <div className="section-edit-badge">
                    <Edit3 size={12} /> จิ้มแก้ไขข้อมูลโครงการ, อ้างอิง & ค่าใช้จ่าย
                  </div>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                    1. ตามหนังสือ <span className="a4-var-spot" style={{ fontWeight: 600 }}>{refDocNo || '..................'}</span> ลงวันที่{' '}
                    <span className="a4-var-spot" style={{ fontWeight: 600 }}>{refDocDate || '..................'}</span> อนุมัติให้งาน{' '}
                    <span className="a4-var-spot blue" style={{ fontWeight: 600 }}>{projectName}</span> หมายเลขงาน (WBS){' '}
                    <span className="a4-var-spot orange" style={{ fontWeight: 600 }}>{wbs}</span> โดยมีค่าใช้จ่ายทั้งสิ้นเป็นเงิน{' '}
                    <span
                      className="a4-var-spot blue cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('project'); }}
                      title="คลิกเพื่อแก้ไขค่าใช้จ่ายทั้งสิ้น"
                    >
                      {totalExpense || fmt(calculateTotalProjectValue())}
                    </span>.- บาท แยกเป็นค่าพัสดุจำนวน{' '}
                    <span
                      className="a4-var-spot purple cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('project'); }}
                      title="คลิกเพื่อแก้ไขค่าพัสดุ"
                    >
                      {materialExpense || fmt(calculateBudgetByCategoryGroup(['พัสดุ']))}
                    </span>.- บาท ค่าใช้จ่ายหน้างาน เป็นเงิน{' '}
                    <span
                      className="a4-var-spot orange cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('project'); }}
                      title="คลิกเพื่อแก้ไขค่าใช้จ่ายหน้างาน"
                    >
                      {siteExpense || fmt(calculateBudgetByCategoryGroup(['แรง', 'ควบคุมงาน', 'ขนส่ง', 'เบ็ดเตล็ด']))}
                    </span>.- บาท และค่าดำเนินการ เป็นเงิน{' '}
                    <span
                      className="a4-var-spot teal cursor-pointer"
                      style={{ fontWeight: 600 }}
                      onClick={(e) => { e.stopPropagation(); setActiveEditSection('project'); }}
                      title="คลิกเพื่อแก้ไขค่าดำเนินการ"
                    >
                      {operatingExpense || fmt(calculateBudgetByCategoryGroup(['ดำเนินการ']))}
                    </span>.- บาท ซึ่งมี{' '}
                    <span className="a4-var-spot green" style={{ fontWeight: 600 }}>{supervisorName}</span> {supervisorLevel ? `พชง.${supervisorLevel}` : ''} เป็นผู้ควบคุมงาน นั้น
                  </p>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginTop: '6pt' }}>
                    2. {reasonText}
                  </p>

                  {/* Summary Callout for Deficits */}
                  {networkDataList.some(net => getNetworkDeficits(net).length > 0) && (
                    <div style={{ margin: '8pt 0 10pt 0', padding: '8pt 14pt', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '11.5pt', marginBottom: '4pt' }}>
                        สรุปงบประมาณไม่เพียงพอที่ต้องขออนุมัติโอนงบมาชดเชย:
                      </div>
                      {networkDataList.filter(net => getNetworkDeficits(net).length > 0).map(net => {
                        const defs = getNetworkDeficits(net);
                        return (
                          <div key={net.network} style={{ fontSize: '11pt', color: '#b91c1c', marginLeft: '12px', lineHeight: 1.5 }}>
                            • <strong>{getFullNetworkName(net.networkName)}</strong> (โครงข่าย {net.network}):{' '}
                            {defs.map(d => `${d.category} ขาดงบ ${fmt(Math.abs(d.remaining))} บาท`).join(', ')}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Breakdown for each network with budget table */}
                  {networkDataList.length > 0 && (
                    <div style={{ marginTop: '8pt' }}>
                      {networkDataList.map((net, i) => {
                        const deficits = getNetworkDeficits(net);
                        const hasDeficit = deficits.length > 0;

                        return (
                          <div key={net.network} style={{ marginBottom: '14pt', pageBreakInside: 'avoid' }}>
                            <div style={{ fontSize: '12.5pt', color: '#0f172a', fontWeight: 600, marginBottom: '4pt' }}>
                              2.{i + 1} {getFullNetworkName(net.networkName)} โครงข่าย {net.network}
                              {hasDeficit ? (
                                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '11pt', marginLeft: '8px' }}>
                                  (งบประมาณไม่เพียงพอ: {deficits.map(d => `${d.category} ขาด ${fmt(Math.abs(d.remaining))} บาท`).join(', ')})
                                </span>
                              ) : (
                                <span style={{ color: '#16a34a', fontWeight: 500, fontSize: '10.5pt', marginLeft: '8px' }}>
                                  (มีงบคงเหลือ)
                                </span>
                              )}
                            </div>

                            <table className="a4-table" style={{ fontSize: '10.5pt', width: '100%', margin: '2pt 0 6pt 0' }}>
                              <thead>
                                <tr>
                                  <th style={{ width: '28%', textAlign: 'center' }}>รายการ</th>
                                  <th style={{ width: '24%', textAlign: 'center' }}>งบประมาณ (บาท)</th>
                                  <th style={{ width: '24%', textAlign: 'center' }}>เบิกจ่ายแล้ว (บาท)</th>
                                  <th style={{ width: '24%', textAlign: 'center' }}>คงเหลือ (บาท)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {CATEGORIES.map(cat => {
                                  const catKey = Object.keys(net.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน', '')));
                                  const vals = catKey ? net.categories[catKey] : { budget: 0, disbursed: 0, remaining: 0 };
                                  if (vals.budget === 0 && vals.disbursed === 0 && vals.remaining === 0) return null;
                                  const isDeficit = vals.remaining < 0;

                                  return (
                                    <tr
                                      key={cat}
                                      style={{
                                        backgroundColor: isDeficit ? '#fef2f2' : 'transparent',
                                        color: isDeficit ? '#991b1b' : 'inherit'
                                      }}
                                    >
                                      <td style={{ textAlign: 'left', fontWeight: isDeficit ? 600 : 'normal' }}>
                                        {cat} {isDeficit && <span style={{ color: '#dc2626', fontSize: '9pt', fontWeight: 700 }}>(ไม่เพียงพอ)</span>}
                                      </td>
                                      <td style={{ textAlign: 'right' }}>{fmt(vals.budget)}</td>
                                      <td style={{ textAlign: 'right' }}>{fmt(vals.disbursed)}</td>
                                      <td
                                        style={{
                                          textAlign: 'right',
                                          fontWeight: isDeficit ? 700 : 'normal',
                                          color: isDeficit ? '#dc2626' : (vals.remaining > 0 ? '#15803d' : 'inherit')
                                        }}
                                      >
                                        {fmt(vals.remaining)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. TRANSFERS SECTION */}
                <div
                  className="a4-section-hoverable"
                  onClick={() => setActiveEditSection('transfers')}
                  title="คลิกเพื่อแก้ไขรายการโอนงบ"
                  style={{ marginTop: '8pt' }}
                >
                  <div className="section-edit-badge">
                    <Edit3 size={12} /> จิ้มแก้ไขรายการโอนงบ ({transfers.length} รายการ)
                  </div>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                    3. กรย.(ก3) พิจารณาแล้ว เพื่อให้การเบิกจ่ายค่าใช้จ่ายหน้างานเป็นไปด้วยความเรียบร้อย จึงเห็นควรขออนุมัติโอนงบค่าใช้จ่ายหน้างาน ดังนี้
                  </p>

                  <div style={{ margin: '6pt 0 10pt 2.5cm', lineHeight: 1.6 }}>
                    {transfers.map((t, idx) => {
                      const netFromInfo = networkDataList.find(n => n.network === t.networkFrom);
                      const netToInfo = networkDataList.find(n => n.network === t.networkTo);
                      const fromLabel = netFromInfo ? `แผนก${getFullNetworkName(netFromInfo.networkName).replace('แผนก', '').trim()}` : `โครงข่าย ${t.networkFrom || '............'}`;
                      const toLabel = netToInfo ? `แผนก${getFullNetworkName(netToInfo.networkName).replace('แผนก', '').trim()}` : `โครงข่าย ${t.networkTo || '............'}`;

                      return (
                        <div key={t.id} style={{ marginBottom: '4pt' }}>
                          3.{idx + 1} โอน{t.categoryFrom} {fromLabel} ไปเป็น {t.categoryTo} {toLabel} จำนวน <span style={{ fontWeight: 600, color: '#15803d' }}>{fmt(t.amount)}</span> บาท
                        </div>
                      );
                    })}
                    <div style={{ fontWeight: 'bold', color: '#1e3a8a', marginTop: '6pt' }}>
                      รวมเป็นเงินทั้งสิ้น {fmt(totalAmount)} บาท
                    </div>
                  </div>

                  {/* If ZPSR018 data is available, render the comparison tables per network */}
                  {networkDataList.length > 0 && (
                    <div style={{ marginTop: '12pt' }}>
                      {networkDataList.map((net) => {
                        const netTransfers = transfers.filter(t => t.networkFrom === net.network || t.networkTo === net.network);
                        if (netTransfers.length === 0) return null;

                        return (
                          <div key={net.network} style={{ marginTop: '14pt', pageBreakInside: 'avoid' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '12pt', marginBottom: '4pt', color: '#0f172a' }}>
                              ตารางแสดงงบประมาณโครงข่าย {net.network} {getFullNetworkName(net.networkName)}
                            </div>
                            <table className="a4-table" style={{ fontSize: '10pt' }}>
                              <thead>
                                <tr>
                                  <th rowSpan={2} style={{ width: '22%' }}>รายการ</th>
                                  <th colSpan={3} style={{ textAlign: 'center' }}>ประมาณการและผลการเบิกจ่าย</th>
                                  <th rowSpan={2} style={{ width: '15%', textAlign: 'center' }}>รายการเพิ่ม-ลด<br />(4)</th>
                                  <th colSpan={2} style={{ textAlign: 'center' }}>รายละเอียดหลังเพิ่ม-ลด</th>
                                </tr>
                                <tr>
                                  <th style={{ textAlign: 'right', width: '13%' }}>ประมาณการ (1)</th>
                                  <th style={{ textAlign: 'right', width: '13%' }}>เบิกจ่ายจริง (2)</th>
                                  <th style={{ textAlign: 'right', width: '13%' }}>คงเหลือ (3)</th>
                                  <th style={{ textAlign: 'right', width: '12%' }}>อนุมัติครั้งนี้ (5)</th>
                                  <th style={{ textAlign: 'right', width: '12%' }}>คงเหลือ (6)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {CATEGORIES.map(cat => {
                                  const catKey = Object.keys(net.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน', '')));
                                  const vals = catKey ? net.categories[catKey] : { budget: 0, disbursed: 0, remaining: 0 };
                                  let diffAmount = 0;
                                  transfers.forEach(t => {
                                    if (t.networkFrom === net.network && t.categoryFrom === cat) diffAmount -= Number(t.amount);
                                    if (t.networkTo === net.network && t.categoryTo === cat) diffAmount += Number(t.amount);
                                  });
                                  if (vals.budget === 0 && vals.disbursed === 0 && diffAmount === 0) return null;
                                  const finalBudget = vals.budget + diffAmount;
                                  const finalRemaining = finalBudget - vals.disbursed;
                                  return (
                                    <tr key={cat}>
                                      <td>{cat}</td>
                                      <td style={{ textAlign: 'right' }}>{fmt(vals.budget)}</td>
                                      <td style={{ textAlign: 'right' }}>{fmt(vals.disbursed)}</td>
                                      <td style={{ textAlign: 'right', color: vals.remaining < 0 ? '#dc2626' : 'inherit', fontWeight: vals.remaining < 0 ? 600 : 'normal' }}>
                                        {fmt(vals.remaining)}
                                      </td>
                                      <td style={{ textAlign: 'right', fontWeight: 600, color: diffAmount > 0 ? '#16a34a' : (diffAmount < 0 ? '#dc2626' : 'inherit') }}>
                                        {diffAmount !== 0 ? (diffAmount > 0 ? `+${fmt(diffAmount)}` : fmt(diffAmount)) : '-'}
                                      </td>
                                      <td style={{ textAlign: 'right' }}>{fmt(finalBudget)}</td>
                                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(finalRemaining)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="a4-text-indent" style={{ marginTop: '14pt', marginBottom: '24pt' }}>
                    จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติโอนงบค่าใช้จ่ายต่างๆ ตามเสนอ พร้อมลงนามในแบบฟอร์มโอนค่าใช้จ่ายตามเอกสารแนบต่อไป พร้อมนี้ได้แนบเรื่องเดิมมาเพื่อประกอบการพิจารณาด้วยแล้ว
                  </p>
                </div>

                {/* 4. SIGNER & APPROVER SECTION */}
                <div
                  className="a4-section-hoverable"
                  onClick={() => setActiveEditSection('signer')}
                  title="คลิกเพื่อแก้ไขผู้เสนอ & ผู้อนุมัติ"
                  style={{ marginTop: '12pt' }}
                >
                  <div className="section-edit-badge">
                    <Edit3 size={12} /> จิ้มแก้ไขผู้เสนอ & ผู้อนุมัติ
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24pt' }}>
                    <div style={{ textAlign: 'center', minWidth: '270px' }}>
                      <div style={{ height: '36px' }}></div>
                      <div>({signer1Name})</div>
                      <div style={{ fontSize: '12pt', color: '#334155', marginTop: '2pt' }}>{signer1Title}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10pt', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '13pt' }}>
                      <div style={{ fontWeight: 600 }}>- ผจก.{peaOffice || '........................'}</div>
                      <div style={{ marginTop: '4pt', paddingLeft: '1cm' }}>อนุมัติ และให้ดำเนินการในส่วนเกี่ยวข้องต่อไป</div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '250px' }}>
                      <div style={{ height: '30px' }}></div>
                      <div>({signer2Name})</div>
                      <div style={{ fontSize: '12pt', color: '#475569' }}>{signer2Title}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHEET 2: EXPENSE APPROVAL FORM */}
            {activeSheet === 'approval' && (
              <div className="a4-page">
                <div
                  className="a4-section-hoverable"
                  onClick={() => setActiveEditSection('header')}
                  title="คลิกเพื่อแก้ไขข้อมูลแบบฟอร์ม"
                >
                  <div className="section-edit-badge">
                    <Edit3 size={12} /> จิ้มแก้ไขข้อมูลแบบฟอร์ม
                  </div>

                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16pt', marginBottom: '4pt' }}>
                    การไฟฟ้าส่วนภูมิภาค
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15pt', marginBottom: '16pt' }}>
                    แบบฟอร์มขออนุมัติค่าใช้จ่ายหน้างาน
                  </div>

                  <table className="a4-info-table" style={{ marginBottom: '14pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '10%', fontWeight: 'bold' }}>จาก</td>
                        <td style={{ width: '40%' }}>{docFrom}</td>
                        <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                        <td style={{ width: '40%' }}>{docTo}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                        <td colSpan={3}>ขออนุมัติโอนค่าใช้จ่ายหน้างาน</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>เรียน</td>
                        <td colSpan={3}>{salutation}</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '12pt' }}>
                    ตามหนังสือ {refDocNo || '..................'} ลงวันที่ {refDocDate || '..................'} อนุมัติให้งาน {projectName} หมายเลขงาน (WBS) {wbs} นั้น ในขั้นนี้เห็นควรอนุมัติค่าใช้จ่ายหน้างานในการก่อสร้าง (เพิ่มเติม) ดังรายการต่อไปนี้
                  </p>
                </div>

                {/* TABLE TRANSFERS */}
                <div
                  className="a4-section-hoverable"
                  onClick={() => setActiveEditSection('transfers')}
                  title="คลิกเพื่อแก้ไขตารางโอนงบ"
                  style={{ marginTop: '8pt', marginBottom: '14pt' }}
                >
                  <div className="section-edit-badge">
                    <Edit3 size={12} /> จิ้มแก้ไขตารางรายการโอน
                  </div>

                  {networkDataList.length > 0 && allInvolvedNetworks.length > 0 ? (
                    // Rich Multi-Column Matrix when ZPSR018 is loaded
                    <div style={{ overflowX: 'auto', marginBottom: '12pt' }}>
                      <table className="a4-table" style={{ fontSize: '10.5pt' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '22%', textAlign: 'center' }}>งบ</th>
                            {allInvolvedNetworks.map(net => (
                              <th key={net} style={{ textAlign: 'center' }}>กฟภ.</th>
                            ))}
                          </tr>
                          <tr>
                            <th style={{ textAlign: 'center' }}>โครงข่าย</th>
                            {allInvolvedNetworks.map(net => (
                              <th key={net} style={{ textAlign: 'center' }}>{net}</th>
                            ))}
                          </tr>
                          <tr>
                            <th style={{ textAlign: 'center' }}>รายการ</th>
                            {allInvolvedNetworks.map(net => {
                              const nInfo = networkDataList.find(n => n.network === net);
                              return (
                                <th key={net} style={{ textAlign: 'center' }}>
                                  {getFullNetworkName(nInfo?.networkName || '').replace('แผนก', '')}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {CATEGORIES.map(cat => {
                            const rowHasData = allInvolvedNetworks.some(net => {
                              return transfers.some(t => (t.networkFrom === net && t.categoryFrom === cat) || (t.networkTo === net && t.categoryTo === cat));
                            });
                            if (!rowHasData) return null;

                            return (
                              <tr key={cat}>
                                <td style={{ textAlign: 'left', fontWeight: 500 }}>{cat}</td>
                                {allInvolvedNetworks.map(net => {
                                  const involved = transfers.filter(t => (t.networkFrom === net && t.categoryFrom === cat) || (t.networkTo === net && t.categoryTo === cat));
                                  const totalForCell = involved.reduce((sum, t) => sum + Number(t.amount), 0);
                                  return (
                                    <td key={net} style={{ textAlign: 'right' }}>
                                      {totalForCell > 0 ? `${fmt(totalForCell)}` : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                          <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                            <td style={{ textAlign: 'center' }}>รวม</td>
                            {allInvolvedNetworks.map(net => {
                              const totalForNet = transfers.filter(t => t.networkFrom === net || t.networkTo === net).reduce((sum, t) => sum + Number(t.amount), 0);
                              return (
                                <td key={net} style={{ textAlign: 'right' }}>
                                  {totalForNet > 0 ? `${fmt(totalForNet)}` : '-'}
                                </td>
                              );
                            })}
                          </tr>
                          <tr style={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>
                            <td style={{ textAlign: 'center' }}>รวมทั้งสิ้น</td>
                            <td colSpan={allInvolvedNetworks.length} style={{ textAlign: 'right', color: '#1e3a8a', paddingRight: '12px' }}>
                              {fmt(totalAmount)} บาท
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // Standard clean table
                    <table className="a4-table">
                      <thead>
                        <tr>
                          <th style={{ width: '10%', textAlign: 'center' }}>ลำดับ</th>
                          <th style={{ width: '30%' }}>โครงข่ายต้นทาง (โอนออก)</th>
                          <th style={{ width: '30%' }}>โครงข่ายปลายทาง (รับโอน)</th>
                          <th style={{ width: '30%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.map((t, idx) => (
                          <tr key={t.id}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td>{t.categoryFrom} ({t.networkFrom || '-'})</td>
                            <td>{t.categoryTo} ({t.networkTo || '-'})</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(t.amount)}</td>
                          </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                          <td colSpan={3} style={{ textAlign: 'center' }}>รวมทั้งสิ้น</td>
                          <td style={{ textAlign: 'right', color: '#1e3a8a' }}>{fmt(totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                <div
                  className="a4-section-hoverable"
                  onClick={() => setActiveEditSection('signer')}
                  title="คลิกเพื่อแก้ไขผู้เสนอ & ผู้อนุมัติ"
                  style={{ marginTop: '16pt' }}
                >
                  <div className="section-edit-badge">
                    <Edit3 size={12} /> จิ้มแก้ไขผู้ลงนาม
                  </div>

                  <p className="a4-text-indent" style={{ lineHeight: 1.6, marginBottom: '6pt' }}>
                    จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติค่าใช้จ่ายหน้างานเป็นเงิน {fmt(totalAmount)} บาท ({getThaiBahtText(totalAmount)})
                  </p>
                  <p style={{ textIndent: '2.5cm', marginBottom: '24pt' }}>
                    โดยให้ ผจก.{peaOffice || '........................'} เป็นผู้เบิกและสั่งจ่ายต่อไป
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20pt' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '36px' }}></div>
                      <div>({signer1Name})</div>
                      <div style={{ fontSize: '12pt', color: '#475569' }}>{signer1Title}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '8pt' }}>อนุมัติ</div>
                      <div style={{ height: '24px' }}></div>
                      <div>({signer2Name})</div>
                      <div style={{ fontSize: '12pt', color: '#475569' }}>{signer2Title}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: VISUAL FLOW & MATRIX TAB                                          */}
        {/* ========================================================================= */}
        {activeSheet === 'flow' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                  ตารางจำลองโอนงบ ZPSR018 & ผังโยงลูกศร
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  จำลองค่าใช้จ่ายตามแบบฟอร์ม SAP ZPSR018 แสดงทิศทางการโอนระหว่างโครงข่าย
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="a4-action-btn a4-btn-indigo"
                  onClick={handleCopyImage}
                  title="คัดลอกรูปภาพผังไปวางใน Word / PowerPoint"
                >
                  <Copy size={16} /> คัดลอกรูปภาพ
                </button>
                <button
                  type="button"
                  className="a4-action-btn a4-btn-emerald"
                  onClick={handleDownloadImage}
                  title="บันทึกรูปภาพ PNG"
                >
                  <Download size={16} /> บันทึกภาพ PNG
                </button>
                <button
                  type="button"
                  className="a4-action-btn a4-btn-purple"
                  onClick={() => setShowZpsrModal(true)}
                >
                  <UploadCloud size={16} /> อัพโหลดไฟล์ ZPSR018
                </button>
              </div>
            </div>

            {networkDataList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <UploadCloud size={48} style={{ color: '#94a3b8', margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  ยังไม่มีข้อมูล ZPSR018 สำหรับสร้างผังจำลอง
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 20px auto' }}>
                  คุณสามารถอัพโหลดไฟล์ PDF ZPSR018 เพื่อให้ระบบแยกประเภทงบประมาณและวาดผังโยงลูกศรแสดงการโอนอัตโนมัติ
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="a4-action-btn a4-btn-purple"
                    onClick={() => setShowZpsrModal(true)}
                  >
                    <UploadCloud size={16} /> เปิดหน้าต่างอัพโหลด ZPSR018
                  </button>
                  <button
                    type="button"
                    className="a4-action-btn a4-btn-muted"
                    onClick={handleLoadSampleZpsr}
                  >
                    <Sparkles size={16} /> โหลดข้อมูลตัวอย่าง
                  </button>
                </div>
              </div>
            ) : (
              <div id="flow-chart-container" style={{ position: 'relative', overflowX: 'auto', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                    ตารางจำลองโอนงบ ZPSR018
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    โครงการ: {projectName} (WBS: {wbs}) | รวมโอนทั้งสิ้น: <strong style={{ color: '#7c3aed' }}>{fmt(totalAmount)}</strong> บาท
                  </div>
                </div>

                <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', backgroundColor: '#f1f5f9', width: '4%' }}>ที่</th>
                      <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', backgroundColor: '#f1f5f9', width: '15%' }}>เลขที่โครงข่าย<br />(แผนก)</th>
                      <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', backgroundColor: '#f1f5f9', width: '8%' }}>รายการ</th>
                      <th colSpan={7} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', backgroundColor: '#f1f5f9' }}>ค่าใช้จ่ายจริง (บาท)</th>
                    </tr>
                    <tr>
                      <th style={{ border: '1px solid #000' }}></th>
                      <th style={{ border: '1px solid #000' }}></th>
                      <th style={{ border: '1px solid #000' }}></th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>ค่าพัสดุ</th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>พัสดุเข้างาน</th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>ค่าแรงงาน<br />/ค่าจ้างเหมา</th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>ค่าควบคุมงาน</th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>ค่าขนส่ง/<br />ยานพาหนะ</th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>ค่าเบ็ดเตล็ด</th>
                      <th style={{ border: '1px solid #000', padding: '8px 4px', textAlign: 'center' }}>ค่าดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networkDataList.map((net, idx) => {
                      const getVal = (catName: string, field: 'budget' | 'disbursed' | 'remaining') => {
                        const catKey = Object.keys(net.categories).find(k => k.includes(catName) || catName.includes(k.replace('งาน', '')));
                        return catKey ? net.categories[catKey][field] : 0;
                      };

                      const cols = [
                        { name: 'พัสดุ', key: 'ค่าพัสดุ' },
                        { name: 'พัสดุเข้างาน', dummy: true },
                        { name: 'แรง', key: 'ค่าแรง' },
                        { name: 'ควบคุมงาน', key: 'ค่าควบคุมงาน' },
                        { name: 'ขนส่ง', key: 'ค่าขนส่ง' },
                        { name: 'เบ็ดเตล็ด', key: 'ค่าเบ็ดเตล็ด' },
                        { name: 'ดำเนินการ', key: 'ค่าดำเนินการ' }
                      ];

                      return (
                        <React.Fragment key={net.network}>
                          {/* Row 1: Budget */}
                          <tr>
                            <td rowSpan={3} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'top', fontWeight: 600 }}>{idx + 1}</td>
                            <td rowSpan={3} style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{net.network}</div>
                              <div style={{ fontSize: '0.85rem', color: '#475569' }}>{getFullNetworkName(net.networkName)}</div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '0.85rem', color: '#64748b' }}>งบประมาณ</td>
                            {cols.map((c, i) => (
                              <td key={i} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>
                                {c.dummy ? '0.00' : fmtZpsr(getVal(c.name, 'budget'))}
                              </td>
                            ))}
                          </tr>
                          {/* Row 2: Disbursed */}
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '0.85rem', color: '#64748b' }}>ค่าจริง</td>
                            {cols.map((c, i) => (
                              <td key={i} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'right' }}>
                                {c.dummy ? '0.00' : fmtZpsr(getVal(c.name, 'disbursed'))}
                              </td>
                            ))}
                          </tr>
                          {/* Row 3: Remaining */}
                          <tr>
                            <td style={{ border: '1px solid #000', padding: '6px', fontSize: '0.85rem', fontWeight: 600 }}>ผลต่าง</td>
                            {cols.map((c, i) => {
                              const remaining = c.dummy ? 0 : getVal(c.name, 'remaining');
                              const cellId = `cell-${net.network}-${c.key}`;
                              const isDeficit = remaining < 0;
                              return (
                                <td key={i} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', height: '80px', verticalAlign: 'top' }}>
                                  <div
                                    id={cellId}
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: isDeficit ? 700 : 'normal',
                                      color: isDeficit ? '#dc2626' : (remaining > 0 ? '#15803d' : '#334155'),
                                      backgroundColor: isDeficit ? '#fee2e2' : (remaining > 0 ? '#dcfce7' : 'transparent')
                                    }}
                                  >
                                    {fmtZpsr(remaining)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* Draw Arrows between Surplus and Deficit cells */}
                {transfers.map((t, i) => {
                  const fromId = `cell-${t.networkFrom}-${t.categoryFrom}`;
                  const toId = `cell-${t.networkTo}-${t.categoryTo}`;

                  const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0ea5e9', '#65a30d'];
                  const color = colors[i % colors.length];

                  const startOffset = (i % 3 - 1) * 20;
                  const endOffset = (i % 2 === 0 ? 1 : -1) * 15;
                  const yOffset = (i % 5 - 2) * 20;

                  return (
                    <Xarrow
                      key={t.id}
                      start={fromId}
                      end={toId}
                      color={color}
                      strokeWidth={2.5}
                      path="grid"
                      headSize={6}
                      startAnchor={{ position: "bottom", offset: { x: startOffset } }}
                      endAnchor={{ position: "bottom", offset: { x: endOffset } }}
                      gridBreak="30%"
                      labels={{
                        middle: (
                          <div style={{
                            background: 'white',
                            padding: '2px 8px',
                            border: `1.5px solid ${color}`,
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: color,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            transform: `translate(${startOffset / 2}px, ${yOffset}px)`
                          }}>
                            โอน {fmt(t.amount)}
                          </div>
                        )
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ZPSR018 UPLOAD & CALCULATION MODAL                                */}
      {/* ========================================================================= */}
      {showZpsrModal && (
        <div className="big-editor-overlay" onClick={() => setShowZpsrModal(false)}>
          <div
            className="big-editor-modal"
            style={{ maxWidth: '950px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="big-editor-header">
              <div className="big-editor-title">
                <Sparkles size={22} className="text-purple-400" />
                <span>ระบบอัพโหลด ZPSR018 & คำนวณการโอนงบประมาณอัตโนมัติ</span>
              </div>
              <button
                type="button"
                className="big-editor-close"
                onClick={() => setShowZpsrModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="big-editor-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
              {/* Introduction Banner */}
              <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <HelpCircle size={20} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.9rem', color: '#4c1d95', lineHeight: 1.5 }}>
                    <strong>วิธีใช้งาน:</strong> อัพโหลดไฟล์ PDF รายงาน <strong>ZPSR018</strong> ที่ดาวน์โหลดจากระบบ SAP ของ กฟภ. ระบบ AI จะทำการสกัดโครงข่าย งบประมาณ ค่าใช้จ่ายจริง และผลต่าง จากนั้นโปรแกรมจะจับคู่งวดงบประมาณที่ติดลบ (Deficit) กับงวดงบประมาณที่เหลืออยู่ (Surplus) และคำนวณยอดโอนเงินลงในบันทึกข้อความและแบบฟอร์มขออนุมัติให้อัตโนมัติ
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div style={{ marginBottom: '20px' }}>
                <label className="big-label" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>เลือกไฟล์ PDF รายงาน ZPSR018</span>
                  {pullHistory && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      ประวัติล่าสุด: {pullHistory}
                    </span>
                  )}
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    backgroundColor: isUploading ? '#f8fafc' : '#ffffff',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />

                  {isUploading ? (
                    <>
                      <Loader2 size={36} className="animate-spin text-purple-600" style={{ marginBottom: '12px' }} />
                      <div style={{ fontWeight: 600, color: '#7c3aed', fontSize: '1rem', marginBottom: '4px' }}>
                        กำลังประมวลผล AI และสกัดข้อมูลงบประมาณจาก ZPSR018...
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        ระบบกำลังวิเคราะห์ตารางโครงข่าย กรุณารอสักครู่ (ใช้เวลาประมาณ 10-20 วินาที)
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={40} style={{ color: '#7c3aed', marginBottom: '10px' }} />
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem', marginBottom: '4px' }}>
                        คลิกเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวางที่นี่
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>
                        รองรับไฟล์ .PDF รายงาน ZPSR018 จากระบบ SAP
                      </div>
                      <span
                        style={{
                          backgroundColor: '#f5f3ff',
                          color: '#7c3aed',
                          padding: '6px 16px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          border: '1px solid #ddd6fe'
                        }}
                      >
                        เลือกไฟล์ PDF ZPSR018
                      </span>
                    </>
                  )}
                </label>

                {uploadError && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginTop: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Demo Helper Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  ไม่มีไฟล์ PDF ตอนนี้? ทดลองดูผลลัพธ์ด้วยข้อมูลจำลอง:
                </span>
                <button
                  type="button"
                  className="a4-action-btn a4-btn-muted"
                  style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                  onClick={handleLoadSampleZpsr}
                >
                  <Sparkles size={14} /> โหลดตัวอย่างข้อมูล ZPSR018
                </button>
              </div>

              {/* Extracted Networks Data Summary */}
              {networkDataList.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>
                      ข้อมูลงบประมาณที่สกัดได้ ({networkDataList.length} โครงข่าย)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="a4-action-btn a4-btn-indigo"
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        onClick={handleRecalculate}
                      >
                        <RefreshCw size={13} /> คำนวณใหม่
                      </button>
                      <button
                        type="button"
                        className="a4-action-btn"
                        style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', fontSize: '0.8rem', border: 'none' }}
                        onClick={handleClearZpsr}
                      >
                        <Trash2 size={13} /> ล้างข้อมูล
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {networkDataList.map((net) => (
                      <div key={net.network} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#f1f5f9', padding: '8px 12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span style={{ color: '#1e3a8a' }}>โครงข่าย {net.network} ({getFullNetworkName(net.networkName)})</span>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{net.networkName}</span>
                        </div>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ textAlign: 'left', padding: '6px 10px' }}>หมวดค่าใช้จ่าย</th>
                              <th style={{ textAlign: 'right', padding: '6px 10px' }}>ประมาณการ (บาท)</th>
                              <th style={{ textAlign: 'right', padding: '6px 10px' }}>เบิกจ่ายจริง (บาท)</th>
                              <th style={{ textAlign: 'right', padding: '6px 10px' }}>คงเหลือ (ผลต่าง)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {CATEGORIES.map(cat => {
                              const catKey = Object.keys(net.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน', '')));
                              const vals = catKey ? net.categories[catKey] : { budget: 0, disbursed: 0, remaining: 0 };
                              const isDeficit = vals.remaining < 0;
                              return (
                                <tr key={cat} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '6px 10px' }}>{cat}</td>
                                  <td style={{ textAlign: 'right', padding: '6px 10px' }}>{fmt(vals.budget)}</td>
                                  <td style={{ textAlign: 'right', padding: '6px 10px' }}>{fmt(vals.disbursed)}</td>
                                  <td style={{ textAlign: 'right', padding: '6px 10px', fontWeight: 600, color: isDeficit ? '#dc2626' : (vals.remaining > 0 ? '#16a34a' : 'inherit') }}>
                                    {fmt(vals.remaining)}
                                    {isDeficit && <span style={{ fontSize: '10px', marginLeft: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 4px', borderRadius: '4px' }}>งบขาด</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculated Transfers List */}
              {transfers.length > 0 && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#166534', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={18} /> ผลการคำนวณโอนงบอัตโนมัติ ({transfers.length} รายการ)
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '1rem' }}>
                      รวมทั้งสิ้น: {fmt(totalAmount)} บาท
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {transfers.map((t, idx) => (
                      <div
                        key={t.id}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #dcfce7',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.9rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#15803d' }}>{idx + 1}.</span>
                          <span>โอนจาก <strong>{t.categoryFrom}</strong> ({t.networkFrom || '-'})</span>
                          <ArrowRightLeft size={14} style={{ color: '#7c3aed' }} />
                          <span>ไปเป็น <strong>{t.categoryTo}</strong> ({t.networkTo || '-'})</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' }}>
                          {fmt(t.amount)} บาท
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="big-editor-footer">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setShowZpsrModal(false)}
              >
                ปิดหน้าต่าง
              </button>

              <button
                type="button"
                className="stepper-btn primary"
                onClick={() => {
                  setShowZpsrModal(false);
                  setActiveSheet('memo');
                  showToast('✓ นำผลการคำนวณ ZPSR018 ลงในเอกสารเรียบร้อยแล้ว');
                }}
              >
                นำผลการคำนวณลงเอกสาร A4 <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BIG SECTION POP-OUT EDITOR MODAL                                 */}
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
                      <Icon size={22} className="text-purple-400" />
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
                        value={docFrom}
                        onChange={(e) => setDocFrom(e.target.value)}
                        placeholder="เช่น กรย.(ก3)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ถึง (หน่วยงานปลายทาง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docTo}
                        onChange={(e) => setDocTo(e.target.value)}
                        placeholder="เช่น ฝวบ.(ก3)"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่หนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docNo}
                        onChange={(e) => setDocNo(e.target.value)}
                        placeholder="เช่น ก.3กรย.(กร)          /2569"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        placeholder="เช่น 4 ตุลาคม 2569"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรื่อง</label>
                    <input
                      type="text"
                      className="big-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรียน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value)}
                      placeholder="เช่น อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: PROJECT & WBS */}
              {activeEditSection === 'project' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ชื่องาน / โครงการ</label>
                    <input
                      type="text"
                      className="big-input"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="เช่น งานปรับปรุงระบบจำหน่าย 22 เควี..."
                    />
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">หมายเลขงาน (WBS)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={wbs}
                        onChange={(e) => setWbs(e.target.value)}
                        placeholder="เช่น P-TDD02.3-I-LYAIA.0015"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">กฟฟ. ที่ขออนุมัติ (ผจก.)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={peaOffice}
                        onChange={(e) => setPeaOffice(e.target.value)}
                        placeholder="เช่น กฟส.ลญ."
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">หนังสืออนุมัติเดิม (เลขที่)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={refDocNo}
                        onChange={(e) => setRefDocNo(e.target.value)}
                        placeholder="เช่น กวว.(วร) 380/2567"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่หนังสืออ้างอิง</label>
                      <input
                        type="text"
                        className="big-input"
                        value={refDocDate}
                        onChange={(e) => setRefDocDate(e.target.value)}
                        placeholder="เช่น 16 สิงหาคม 2567"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้ควบคุมงาน</label>
                      <input
                        type="text"
                        className="big-input"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                        placeholder="เช่น นายอุดมศักดิ์ จันทร์กลิ่น"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ตำแหน่ง / ระดับ พชง.</label>
                      <input
                        type="text"
                        className="big-input"
                        value={supervisorLevel}
                        onChange={(e) => setSupervisorLevel(e.target.value)}
                        placeholder="เช่น 7"
                      />
                    </div>
                  </div>

                  {/* EXPENSE BREAKDOWN (EDITABLE) */}
                  <div style={{
                    marginTop: '16px',
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #cbd5e1'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <label className="big-label" style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💰 รายการค่าใช้จ่ายตามหนังสืออนุมัติเดิม (แก้ไขปรับเปลี่ยนได้):</span>
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {networkDataList.length > 0 && (
                          <button
                            type="button"
                            onClick={handlePullZpsrExpenses}
                            className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded font-semibold flex items-center gap-1 transition"
                            title="ดึงยอดคำนวณจากไฟล์ ZPSR018 ที่อัพโหลดไว้"
                          >
                            <RefreshCw size={12} /> ดึงจาก ZPSR018
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAutoSumExpenses}
                          className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-semibold flex items-center gap-1 transition"
                          title="รวมยอด: ค่าพัสดุ + ค่าใช้จ่ายหน้างาน + ค่าดำเนินการ ลงในช่องค่าใช้จ่ายทั้งสิ้น"
                        >
                          <Plus size={12} /> รวมยอดทั้งสิ้น
                        </button>
                      </div>
                    </div>

                    <div className="big-grid-2">
                      <div className="big-field-group">
                        <label className="big-label" style={{ fontSize: '12px', color: '#1e40af' }}>
                          1. ค่าใช้จ่ายทั้งสิ้น (บาท)
                        </label>
                        <input
                          type="text"
                          className="big-input"
                          style={{ borderColor: '#93c5fd', fontWeight: 600, color: '#1e3a8a' }}
                          value={totalExpense}
                          onChange={(e) => setTotalExpense(e.target.value)}
                          placeholder="เช่น 1,915,387.03"
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label" style={{ fontSize: '12px', color: '#6b21a8' }}>
                          2. แยกเป็นค่าพัสดุ (บาท)
                        </label>
                        <input
                          type="text"
                          className="big-input"
                          style={{ borderColor: '#d8b4fe', color: '#6b21a8' }}
                          value={materialExpense}
                          onChange={(e) => setMaterialExpense(e.target.value)}
                          placeholder="เช่น 1,357,472.03"
                        />
                      </div>
                    </div>

                    <div className="big-grid-2" style={{ marginTop: '8px' }}>
                      <div className="big-field-group">
                        <label className="big-label" style={{ fontSize: '12px', color: '#c2410c' }}>
                          3. ค่าใช้จ่ายหน้างาน (บาท)
                        </label>
                        <input
                          type="text"
                          className="big-input"
                          style={{ borderColor: '#fdba74', color: '#c2410c' }}
                          value={siteExpense}
                          onChange={(e) => setSiteExpense(e.target.value)}
                          placeholder="เช่น 479,162.00"
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label" style={{ fontSize: '12px', color: '#0f766e' }}>
                          4. ค่าดำเนินการ (บาท)
                        </label>
                        <input
                          type="text"
                          className="big-input"
                          style={{ borderColor: '#99f6e4', color: '#0f766e' }}
                          value={operatingExpense}
                          onChange={(e) => setOperatingExpense(e.target.value)}
                          placeholder="เช่น 78,753.00"
                        />
                      </div>
                    </div>

                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
                      💡 ตัวเลขค่าใช้จ่าย 4 ช่องนี้จะแสดงผลลงในข้อ 1. ของบันทึกข้อความทันที (สามารถแก้ไขเปลี่ยนแปลงได้ทุกครั้งตามหนังสืออนุมัติจริง)
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 3: REASON */}
              {activeEditSection === 'reason' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">เหตุผลความจำเป็นในการขอโอนงบ (ข้อ 2)</label>
                    <textarea
                      rows={5}
                      className="big-textarea"
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                    />
                  </div>

                  {networkDataList.length > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <label className="big-label" style={{ color: '#0f172a' }}>
                        ข้อมูลโครงข่ายและงบประมาณที่ไม่เพียงพอ (ข้อ 2.1 - 2.{networkDataList.length})
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {networkDataList.map((net, i) => {
                          const deficits = getNetworkDeficits(net);
                          const hasDeficit = deficits.length > 0;
                          return (
                            <div
                              key={net.network}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: hasDeficit ? '1px solid #fecaca' : '1px solid #e2e8f0',
                                backgroundColor: hasDeficit ? '#fef2f2' : '#f8fafc',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 600, color: hasDeficit ? '#991b1b' : '#334155' }}>
                                  2.{i + 1} {getFullNetworkName(net.networkName)} ({net.network})
                                </span>
                              </div>
                              <div>
                                {hasDeficit ? (
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>
                                    ⚠️ {deficits.map(d => `${d.category} ขาด ${fmt(Math.abs(d.remaining))} บ.`).join(', ')}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                                    ✓ งบคงเหลือปกติ
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: TRANSFERS */}
              {activeEditSection === 'transfers' && (
                <div>
                  {/* ZPSR018 Trigger inside Modal */}
                  <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#6d28d9', fontSize: '0.9rem' }}>
                        ⚡ โหมดคำนวณอัตโนมัติจาก ZPSR018
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {networkDataList.length > 0 ? `ดึงข้อมูลแล้ว ${networkDataList.length} โครงข่าย` : 'อัพโหลดไฟล์ PDF เพื่อให้ระบบคำนวณให้อัตโนมัติ'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-purple"
                      onClick={() => setShowZpsrModal(true)}
                    >
                      <Sparkles size={14} /> เปิดหน้าต่าง ZPSR018
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="big-label" style={{ marginBottom: 0 }}>
                      รายการโอนงบประมาณ ({transfers.length} รายการ)
                    </label>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-emerald"
                      onClick={handleAddTransfer}
                    >
                      <Plus size={15} /> เพิ่มรายการโอน
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transfers.map((t, idx) => (
                      <div key={t.id} className="big-table-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                            รายการโอนที่ {idx + 1}
                          </span>
                          {transfers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTransfer(idx)}
                              className="a4-action-btn"
                              style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px' }}
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          )}
                        </div>

                        <div className="big-grid-2">
                          {/* ต้นทาง */}
                          <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>โอนจาก (ต้นทาง)</div>
                            <div style={{ marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>เลขที่โครงข่ายต้นทาง</span>
                              <input
                                type="text"
                                className="big-input"
                                value={t.networkFrom}
                                onChange={(e) => handleUpdateTransfer(idx, 'networkFrom', e.target.value)}
                                placeholder="เช่น 6001381477"
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>หมวดค่าใช้จ่าย</span>
                              <select
                                className="big-input"
                                value={t.categoryFrom}
                                onChange={(e) => handleUpdateTransfer(idx, 'categoryFrom', e.target.value)}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* ปลายทาง */}
                          <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>ไปเป็น (ปลายทาง)</div>
                            <div style={{ marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>เลขที่โครงข่ายปลายทาง</span>
                              <input
                                type="text"
                                className="big-input"
                                value={t.networkTo}
                                onChange={(e) => handleUpdateTransfer(idx, 'networkTo', e.target.value)}
                                placeholder="เช่น 6001381478"
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>หมวดค่าใช้จ่าย</span>
                              <select
                                className="big-input"
                                value={t.categoryTo}
                                onChange={(e) => handleUpdateTransfer(idx, 'categoryTo', e.target.value)}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="big-field-group" style={{ marginTop: '8px', marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>จำนวนเงินที่โอน (บาท)</span>
                          <input
                            type="number"
                            className="big-input"
                            value={t.amount}
                            onChange={(e) => handleUpdateTransfer(idx, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#6d28d9' }}>
                      <span>รวมรายการโอนทั้งสิ้น:</span>
                      <span>{fmt(totalAmount)} บาท</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SIGNER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้เสนอขออนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer1Name}
                        onChange={(e) => setSigner1Name(e.target.value)}
                        placeholder="เช่น นายอนันต์ กาญจนอุปถัมภ์"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ตำแหน่งผู้เสนอ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer1Title}
                        onChange={(e) => setSigner1Title(e.target.value)}
                        placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้อนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer2Name}
                        onChange={(e) => setSigner2Name(e.target.value)}
                        placeholder="เช่น นายเมธี สุกก่ำ"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ตำแหน่งผู้อนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer2Title}
                        onChange={(e) => setSigner2Title(e.target.value)}
                        placeholder="เช่น อฝ.วบ.(ก3)"
                      />
                    </div>
                  </div>
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

export default function BudgetTransferPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>กำลังโหลดแบบฟอร์ม...</div>}>
      <BudgetTransferContent />
    </Suspense>
  );
}
