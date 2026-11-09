"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, X, HardHat, ChevronDown, 
  List, CheckCircle, AlertTriangle, Box, RefreshCw,
  Filter, ChevronLeft, ChevronRight, Wrench, Calendar, Trash2, Edit3, Users, ShieldCheck,
  Download, Printer, FileText, Sparkles
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { safetyData } from './data';

// --- Type Definitions ---
type AggregatedEquipment = {
  rowKey: string; // e.g., team1_1
  teamId: string;
  userName: string;
  membersCount: number;
  category: string;
  name: string;
  unit: string;
  standard: number;
  ready: number;
  pending: number;
  damaged: number;
  disposed: number; // ขาด / จำหน่าย / เบิกเพิ่ม
  lastInspected: string;
  remarks?: string;
};

// Custom SVG Safety Helmet & Emoji mapping so icons render crisply on all OS versions
const SafetyHelmetIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dome */}
    <path d="M10 38C10 23.6406 19.8497 12 32 12C44.1503 12 54 23.6406 54 38H10Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3" strokeLinejoin="round"/>
    {/* Top Ridge */}
    <path d="M27 12.5C27 10.567 29.2386 9 32 9C34.7614 9 37 10.567 37 12.5V34H27V12.5Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round"/>
    {/* Highlight */}
    <path d="M17 29C18.5 22 22.5 17.5 26 16" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round"/>
    {/*PEA Purple/White Front Badge */}
    <rect x="28" y="21" width="8" height="8" rx="2" fill="#7C3AED" stroke="#FEF3C7" strokeWidth="1.5"/>
    {/* Brim */}
    <path d="M5 38C5 36.3431 6.34315 35 8 35H56C57.6569 35 59 36.3431 59 38V40C59 41.6569 57.6569 43 56 43H8C6.34315 43 5 41.6569 5 40V38Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" strokeLinejoin="round"/>
    {/* Chin strap hint */}
    <path d="M16 43L20 51H44L48 43" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getEmojiIcon = (category: string, name: string) => {
  if (name.includes('หมวก') || category.includes('ป้องกันศีรษะ')) {
    return <SafetyHelmetIcon size={28} />;
  }
  if (name.includes('แว่น')) return '🥽';
  if (name.includes('ปลั๊กอุดหู')) return '🎧';
  if (name.includes('ถุงมือ')) return '🧤';
  if (name.includes('เสื้อ') || name.includes('กั๊ก')) return '🦺';
  if (name.includes('รองเท้า')) return '🥾';
  if (name.includes('หน้ากาก')) return '😷';
  if (name.includes('เข็มขัด') || name.includes('ขาปีน')) return '🧗';
  if (name.includes('กรวย') || name.includes('ป้าย') || name.includes('สัญญาณ')) return '🚧';
  if (name.includes('ถังดับเพลิง')) return '🧯';
  if (category.includes('ตรวจวัด')) return '⚡';
  return '🛠️';
};

const STORAGE_KEY = 'pea_safety_data_v5_summary';
const ITEM_EXEC_REMARKS_KEY = 'pea_safety_item_exec_remarks_v1';
const OVERALL_EXEC_NOTE_KEY = 'pea_safety_overall_exec_note_v1';

const buildDefaultAggregatedData = (): AggregatedEquipment[] => {
  const today = new Date().toISOString().split('T')[0];
  const rows: AggregatedEquipment[] = [];
  safetyData.forEach(team => {
    const cleanUser = team.name.replace('ชุดงาน นาย', 'นาย');
    team.equipment.forEach(eq => {
      const readyCount = Math.max(0, eq.actual - (eq.damaged || 0) - (eq.pending || 0));
      const pendingCount = eq.pending || 0;
      const damagedCount = eq.damaged || 0;
      const disposedCount = eq.missing || 0;
      rows.push({
        rowKey: `${team.id}_${eq.id}`,
        teamId: team.id,
        userName: cleanUser,
        membersCount: team.membersCount,
        category: eq.category,
        name: eq.name,
        unit: eq.unit || 'ชิ้น',
        standard: eq.standard,
        ready: readyCount,
        pending: pendingCount,
        damaged: damagedCount,
        disposed: disposedCount,
        lastInspected: today,
        remarks: eq.remarks || '',
      });
    });
  });
  return rows;
};

export default function SafetyPPEDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [localData, setLocalData] = useState<AggregatedEquipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'equipment' | 'technician'>('equipment');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportViewMode, setExportViewMode] = useState<'summary_by_item' | 'summary_by_tech' | 'detailed_list'>('summary_by_item');
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [itemExecRemarks, setItemExecRemarks] = useState<Record<string, string>>({});
  const [overallExecNote, setOverallExecNote] = useState<string>('');
  const exportRef = useRef<HTMLDivElement>(null);
  const [updateItem, setUpdateItem] = useState<AggregatedEquipment | null>(null);
  const [editStandard, setEditStandard] = useState<number>(0);
  const [editReady, setEditReady] = useState<number>(0);
  const [editPending, setEditPending] = useState<number>(0);
  const [editDamaged, setEditDamaged] = useState<number>(0);
  const [editDisposed, setEditDisposed] = useState<number>(0);
  const [editRemarks, setEditRemarks] = useState<string>('');

  // Create form state
  const [newUserName, setNewUserName] = useState('');
  const [newCategory, setNewCategory] = useState('1.1 ป้องกันศีรษะ');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('ใบ');
  const [newStandard, setNewStandard] = useState(1);
  const [newReady, setNewReady] = useState(1);
  const [newPending, setNewPending] = useState(0);
  const [newDamaged, setNewDamaged] = useState(0);
  const [newDisposed, setNewDisposed] = useState(0);

  useEffect(() => {
    setUserRole(sessionStorage.getItem("pea_role"));
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && 'ready' in parsed[0]) {
          setLocalData(parsed);
        } else {
          const initial = buildDefaultAggregatedData();
          setLocalData(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch {
        const initial = buildDefaultAggregatedData();
        setLocalData(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } else {
      const initial = buildDefaultAggregatedData();
      setLocalData(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
    const savedItemRemarks = localStorage.getItem(ITEM_EXEC_REMARKS_KEY);
    if (savedItemRemarks) {
      try {
        setItemExecRemarks(JSON.parse(savedItemRemarks));
      } catch {}
    }

    const savedOverallNote = localStorage.getItem(OVERALL_EXEC_NOTE_KEY);
    if (savedOverallNote) {
      setOverallExecNote(savedOverallNote);
    }

    setIsLoaded(true);
    
    return () => clearInterval(timer);
  }, []);

  const saveLocalData = (newData: AggregatedEquipment[]) => {
    setLocalData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const updateItemExecRemark = (equipmentName: string, value: string) => {
    const updated = { ...itemExecRemarks, [equipmentName]: value };
    setItemExecRemarks(updated);
    localStorage.setItem(ITEM_EXEC_REMARKS_KEY, JSON.stringify(updated));
  };

  const updateRowRemarkInline = (rowKey: string, value: string) => {
    const newData = localData.map(item =>
      item.rowKey === rowKey ? { ...item, remarks: value } : item
    );
    saveLocalData(newData);
  };

  const updateOverallNote = (value: string) => {
    setOverallExecNote(value);
    localStorage.setItem(OVERALL_EXEC_NOTE_KEY, value);
  };

  const openEditModal = (item: AggregatedEquipment) => {
    setUpdateItem(item);
    setEditStandard(item.standard || 0);
    setEditReady(item.ready);
    setEditPending(item.pending);
    setEditDamaged(item.damaged);
    setEditDisposed(item.disposed);
    setEditRemarks(item.remarks || '');
  };

  const handleUpdateQuantities = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItem) return;
    
    const newData = localData.map(item => {
      if (item.rowKey === updateItem.rowKey) {
        return {
          ...item,
          standard: Math.max(0, Number(editStandard) || 0),
          ready: Math.max(0, Number(editReady) || 0),
          pending: Math.max(0, Number(editPending) || 0),
          damaged: Math.max(0, Number(editDamaged) || 0),
          disposed: Math.max(0, Number(editDisposed) || 0),
          remarks: editRemarks.trim(),
          lastInspected: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    
    saveLocalData(newData);
    setUpdateItem(null);
  };

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUserName.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const existingIndex = localData.findIndex(
      i => i.userName === newUserName && i.name.trim().toLowerCase() === newName.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...localData];
      const target = updated[existingIndex];
      updated[existingIndex] = {
        ...target,
        standard: Math.max(0, Number(newStandard) || target.standard),
        ready: target.ready + Math.max(0, Number(newReady) || 0),
        pending: target.pending + Math.max(0, Number(newPending) || 0),
        damaged: target.damaged + Math.max(0, Number(newDamaged) || 0),
        disposed: target.disposed + Math.max(0, Number(newDisposed) || 0),
        lastInspected: today,
      };
      saveLocalData(updated);
    } else {
      const totalAdded = Math.max(0, Number(newReady) || 0) + Math.max(0, Number(newPending) || 0) + Math.max(0, Number(newDamaged) || 0);
      const newRow: AggregatedEquipment = {
        rowKey: `custom_${Date.now()}`,
        teamId: `custom`,
        userName: newUserName,
        membersCount: 10,
        category: newCategory,
        name: newName.trim(),
        unit: newUnit.trim() || 'ชิ้น',
        standard: Math.max(0, Number(newStandard) || totalAdded || 1),
        ready: Math.max(0, Number(newReady) || 0),
        pending: Math.max(0, Number(newPending) || 0),
        damaged: Math.max(0, Number(newDamaged) || 0),
        disposed: Math.max(0, Number(newDisposed) || 0),
        lastInspected: today,
      };
      saveLocalData([newRow, ...localData]);
    }

    setNewName('');
    setNewStandard(1);
    setNewReady(1);
    setNewPending(0);
    setNewDamaged(0);
    setNewDisposed(0);
    setShowCreateModal(false);
  };

  // Derived filter options
  const allCategories = useMemo(() => Array.from(new Set(localData.map(i => i.category))).sort(), [localData]);
  const allUsers = useMemo(() => Array.from(new Set(localData.map(i => i.userName))).sort(), [localData]);

  useEffect(() => {
    if (!newUserName && allUsers.length > 0) {
      setNewUserName(allUsers[0]);
    }
  }, [allUsers, newUserName]);

  // Apply filters
  const filteredData = useMemo(() => {
    return localData.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.remarks && item.remarks.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchUser = selectedUser === 'all' || item.userName === selectedUser;
      
      let matchStatus = true;
      if (selectedStatus === 'ready') matchStatus = item.ready > 0;
      else if (selectedStatus === 'pending') matchStatus = item.pending > 0;
      else if (selectedStatus === 'damaged') matchStatus = item.damaged > 0;
      else if (selectedStatus === 'disposed') matchStatus = item.disposed > 0;
      
      return matchSearch && matchCat && matchUser && matchStatus;
    });
  }, [localData, searchQuery, selectedCategory, selectedUser, selectedStatus]);

  // Group by Technician for "ดูตามช่างผู้เบิก" tab
  const groupedByTechnician = useMemo(() => {
    const map = new Map<string, {
      userName: string;
      items: AggregatedEquipment[];
      totalItems: number;
      ready: number;
      pending: number;
      damaged: number;
      disposed: number;
    }>();

    filteredData.forEach(item => {
      const itemTotal = item.ready + item.pending + item.damaged + item.disposed;
      const existing = map.get(item.userName);
      if (existing) {
        existing.items.push(item);
        existing.totalItems += itemTotal;
        existing.ready += item.ready;
        existing.pending += item.pending;
        existing.damaged += item.damaged;
        existing.disposed += item.disposed;
      } else {
        map.set(item.userName, {
          userName: item.userName,
          items: [item],
          totalItems: itemTotal,
          ready: item.ready,
          pending: item.pending,
          damaged: item.damaged,
          disposed: item.disposed,
        });
      }
    });

    return Array.from(map.values());
  }, [filteredData]);

  // Group by Equipment Name across all filtered rows (for executive summary by equipment type)
  const groupedByEquipmentType = useMemo(() => {
    const map = new Map<string, {
      name: string;
      category: string;
      unit: string;
      teamsCount: number;
      standardTotal: number;
      readyTotal: number;
      pendingTotal: number;
      damagedTotal: number;
      disposedTotal: number;
      defaultRemarks: string[];
      teamBreakdowns: { userName: string; standard: number; ready: number; damaged: number; pending: number; disposed: number }[];
    }>();

    filteredData.forEach(item => {
      const existing = map.get(item.name);
      if (existing) {
        existing.teamsCount += 1;
        existing.standardTotal += item.standard;
        existing.readyTotal += item.ready;
        existing.pendingTotal += item.pending;
        existing.damagedTotal += item.damaged;
        existing.disposedTotal += item.disposed;
        if (item.remarks && !existing.defaultRemarks.includes(item.remarks)) {
          existing.defaultRemarks.push(item.remarks);
        }
        existing.teamBreakdowns.push({
          userName: item.userName,
          standard: item.standard,
          ready: item.ready,
          damaged: item.damaged,
          pending: item.pending,
          disposed: item.disposed,
        });
      } else {
        map.set(item.name, {
          name: item.name,
          category: item.category,
          unit: item.unit,
          teamsCount: 1,
          standardTotal: item.standard,
          readyTotal: item.ready,
          pendingTotal: item.pending,
          damagedTotal: item.damaged,
          disposedTotal: item.disposed,
          defaultRemarks: item.remarks ? [item.remarks] : [],
          teamBreakdowns: [{
            userName: item.userName,
            standard: item.standard,
            ready: item.ready,
            damaged: item.damaged,
            pending: item.pending,
            disposed: item.disposed,
          }],
        });
      }
    });

    return Array.from(map.values());
  }, [filteredData]);

  const handleDownloadPNG = async () => {
    if (!exportRef.current) return;
    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(exportRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `รายงานสรุปอุปกรณ์_PPE_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handlePrintDocument = () => {
    if (!exportRef.current) return;
    // Clone node and bake current input/textarea values into attributes/textContent so they appear in print
    const clone = exportRef.current.cloneNode(true) as HTMLElement;
    const origInputs = exportRef.current.querySelectorAll('input');
    const cloneInputs = clone.querySelectorAll('input');
    origInputs.forEach((inp, i) => {
      if (cloneInputs[i]) {
        cloneInputs[i].setAttribute('value', inp.value);
        if (!inp.value) cloneInputs[i].setAttribute('placeholder', '-');
      }
    });
    const origTextareas = exportRef.current.querySelectorAll('textarea');
    const cloneTextareas = clone.querySelectorAll('textarea');
    origTextareas.forEach((ta, i) => {
      if (cloneTextareas[i]) {
        cloneTextareas[i].textContent = ta.value;
        if (!ta.value) cloneTextareas[i].setAttribute('placeholder', '-');
      }
    });

    const printContents = clone.innerHTML;
    const win = window.open('', '_blank', 'width=1200,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>เอกสารสรุปภาพรวมสถานะและความพร้อมของอุปกรณ์ความปลอดภัยและ PPE</title>
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: 'Prompt', sans-serif; background: #fff; margin: 0; padding: 16px; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @media print {
              body { padding: 0; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div>${printContents}</div>
          <script>
            setTimeout(() => { window.print(); }, 600);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats calculation (respects selectedUser & selectedCategory so filtering by technician shows their totals!)
  const stats = useMemo(() => {
    let ready = 0, pending = 0, damaged = 0, disposed = 0;
    
    const baseForStats = localData.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchUser = selectedUser === 'all' || item.userName === selectedUser;
      return matchCat && matchUser;
    });

    baseForStats.forEach(i => {
      ready += i.ready;
      pending += i.pending;
      damaged += i.damaged;
      disposed += i.disposed;
    });
    
    const total = ready + pending + damaged + disposed;
    
    return {
      total,
      ready,
      readyPct: total ? Math.round((ready / total) * 100) : 0,
      damaged,
      damagedPct: total ? Math.round((damaged / total) * 100) : 0,
      pending,
      pendingPct: total ? Math.round((pending / total) * 100) : 0,
      disposed,
      disposedPct: total ? Math.round((disposed / total) * 100) : 0,
    };
  }, [localData, selectedCategory, selectedUser]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear() + 543}`;
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear() + 543;
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  };

  // Build natural summary sentence e.g. "มีหมวก 5 ใบ: พร้อมใช้งาน 4 ใบ • ชำรุด 1 ใบ"
  const renderOverviewSummary = (item: AggregatedEquipment) => {
    const activeTotal = item.ready + item.pending + item.damaged;
    const totalAll = activeTotal + item.disposed;
    const unit = item.unit || 'ชิ้น';

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
          ทั้งหมด {totalAll} {unit}
        </span>
        {item.ready > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <CheckCircle size={12} /> พร้อมใช้งาน {item.ready} {unit}
          </span>
        )}
        {item.damaged > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <AlertTriangle size={12} /> ชำรุด {item.damaged} {unit}
          </span>
        )}
        {item.pending > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Wrench size={12} /> รอซ่อม {item.pending} {unit}
          </span>
        )}
        {item.disposed > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Trash2 size={12} /> จำหน่าย/ขาด {item.disposed} {unit}
          </span>
        )}
        {totalAll === 0 && (
          <span className="text-xs text-slate-400 italic">ยังไม่มีอุปกรณ์ในรายการนี้</span>
        )}
      </div>
    );
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
            <SafetyHelmetIcon size={36} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">ระบบติดตามสถานะอุปกรณ์ (PPE)</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar size={14} /> {formatDateTime(currentTime)} • ภาพรวมจำนวนอุปกรณ์ประจำชุดงานช่าง (ไม่ใช้รหัสรายชิ้น)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold text-xs">AD</div>
          <div className="text-sm">
            <p className="font-bold text-slate-800 leading-tight">Admin</p>
            <p className="text-xs text-slate-500 leading-tight">ผู้ดูแลระบบ</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        
        {/* Stat Cards - 5 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div 
            onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'all' ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white border-slate-200'}`}
          >
            <div className="bg-blue-50 text-blue-500 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
              <Box size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-0.5">อุปกรณ์ทั้งหมด</p>
              <p className="text-2xl font-black text-[#1A237E] leading-none">{stats.total}</p>
            </div>
          </div>

          <div 
            onClick={() => { setSelectedStatus('ready'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'ready' ? 'bg-[#DCFCE7]/60 border-[#22C55E] ring-2 ring-[#22C55E]/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#059669]">
                <CheckCircle size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">พร้อมใช้งาน</p>
              </div>
              <span className="bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.readyPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.ready}</p>
          </div>

          <div 
            onClick={() => { setSelectedStatus('pending'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'pending' ? 'bg-[#FEF3C7]/60 border-[#F59E0B] ring-2 ring-[#F59E0B]/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#D97706]">
                <Wrench size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">รอตรวจ/รอซ่อม</p>
              </div>
              <span className="bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.pendingPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.pending}</p>
          </div>

          <div 
            onClick={() => { setSelectedStatus('damaged'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'damaged' ? 'bg-[#FEE2E2]/60 border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#DC2626]">
                <AlertTriangle size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">ชำรุด</p>
              </div>
              <span className="bg-[#FEE2E2] text-[#991B1B] px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.damagedPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.damaged}</p>
          </div>

          <div 
            onClick={() => { setSelectedStatus('disposed'); setCurrentPage(1); }}
            className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${selectedStatus === 'disposed' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Trash2 size={16} strokeWidth={2.5} />
                <p className="text-xs font-bold">จำหน่าย/เลิกใช้งาน</p>
              </div>
              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.disposedPct}%</span>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">{stats.disposed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="relative col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ค้นหาอุปกรณ์ / ช่าง</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่ออุปกรณ์, ชื่อช่างผู้เบิก..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] bg-white shadow-sm transition-shadow hover:border-slate-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">หมวดหมู่</label>
              <div className="relative">
                <List className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 w-full border border-slate-200 rounded-xl text-sm appearance-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] cursor-pointer hover:border-slate-300"
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">ทั้งหมด</option>
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">ผู้ใช้งาน / ช่าง</label>
              <div className="relative">
                <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 w-full border border-slate-200 rounded-xl text-sm appearance-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] cursor-pointer hover:border-slate-300"
                  value={selectedUser}
                  onChange={(e) => { setSelectedUser(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">ทุกคน</option>
                  {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">กรองรายการที่มีสถานะ</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 w-full border border-slate-200 rounded-xl text-sm appearance-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] cursor-pointer hover:border-slate-300"
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="ready">มีพร้อมใช้งาน</option>
                  <option value="pending">มีรายการรอตรวจ / รอซ่อม</option>
                  <option value="damaged">มีรายการชำรุด</option>
                  <option value="disposed">มีรายการจำหน่าย/ขาด</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-row gap-2 shrink-0">
            <button 
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B2169] to-[#8A3B87] hover:from-[#581a56] hover:to-[#732f70] text-white py-2.5 px-5 rounded-xl font-bold text-sm transition-all shadow-sm whitespace-nowrap border-0 cursor-pointer"
            >
              <FileText size={18} /> Export สรุปผู้บริหาร
            </button>
            <button 
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#7C5EE4] hover:bg-[#6D53C9] text-white py-2.5 px-5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap border-0 cursor-pointer"
            >
              <Plus size={18} /> เพิ่มอุปกรณ์ใหม่
            </button>
            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedUser('all'); setSelectedStatus('all'); setCurrentPage(1); }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap border border-slate-200 cursor-pointer"
            >
              <RefreshCw size={16} /> ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Tabs & Table Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
            <div className="inline-flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1.5">
              <button 
                type="button"
                onClick={() => setActiveTab('equipment')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
                  activeTab === 'equipment'
                    ? 'bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck size={16} /> ภาพรวมแต่ละอุปกรณ์
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'equipment' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {filteredData.length} รายการ
                </span>
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('technician')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-0 cursor-pointer ${
                  activeTab === 'technician'
                    ? 'bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Users size={16} /> ดูแยกตามช่างผู้เบิก
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                  activeTab === 'technician' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {groupedByTechnician.length} ชุดงาน
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-[#6B2169] border border-purple-200 transition-colors cursor-pointer"
              >
                <Sparkles size={14} /> ออกรายงานสรุปความพร้อม PPE
              </button>
              {activeTab === 'equipment' && (
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100 appearance-none focus:outline-none"
                  >
                    <option value={15}>แสดง 15 รายการ</option>
                    <option value={30}>แสดง 30 รายการ</option>
                    <option value={50}>แสดง 50 รายการ</option>
                    <option value={200}>แสดงทั้งหมด</option>
                  </select>
                  <ChevronDown size={14} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {activeTab === 'equipment' ? (
            <>
              {/* Aggregated Equipment Data Table (No PPE ID column) */}
              <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left text-[13px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200">
                      <th className="px-4 py-3.5 font-bold">รูปภาพ</th>
                      <th className="px-4 py-3.5 font-bold text-slate-800">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-3.5 font-bold">หมวดหมู่</th>
                      <th className="px-4 py-3.5 font-bold">ผู้ใช้งาน / ช่าง</th>
                      <th className="px-4 py-3.5 font-bold text-center">จำนวนขั้นต่ำต่อชุด</th>
                      <th className="px-4 py-3.5 font-bold">ภาพรวมสถานะแต่ละอุปกรณ์</th>
                      <th className="px-3 py-3.5 font-bold text-center">พร้อมใช้</th>
                      <th className="px-3 py-3.5 font-bold text-center">ชำรุด</th>
                      <th className="px-3 py-3.5 font-bold text-center">รอซ่อม</th>
                      <th className="px-4 py-3.5 font-bold min-w-[200px]">หมายเหตุ / คำชี้แจง</th>
                      <th className="px-3 py-3.5 font-bold">ตรวจล่าสุด</th>
                      <th className="px-4 py-3.5 font-bold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-6 py-12 text-center text-slate-500">
                          ไม่มีข้อมูลที่ตรงกับตัวกรอง
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item) => {
                        return (
                          <tr key={item.rowKey} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm border border-slate-200">
                                {getEmojiIcon(item.category, item.name)}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-800">{item.name}</div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500">
                              {item.category.split(' ')[1] || item.category}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {item.userName.replace('นาย', '').charAt(0)}
                                </div>
                                <span className="text-slate-800 font-semibold">{item.userName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-purple-50 text-purple-800 border border-purple-200">
                                {item.standard} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {renderOverviewSummary(item)}
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <span className={`font-extrabold text-sm ${item.ready > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {item.ready} {item.unit}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <span className={`font-extrabold text-sm ${item.damaged > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                                {item.damaged} {item.unit}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <span className={`font-extrabold text-sm ${item.pending > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                {item.pending} {item.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={item.remarks || ''}
                                onChange={(e) => updateRowRemarkInline(item.rowKey, e.target.value)}
                                placeholder="ระบุหมายเหตุ/คำชี้แจง..."
                                className="w-full min-w-[180px] px-3 py-1.5 rounded-lg text-xs text-slate-800 font-medium bg-slate-50 hover:bg-amber-50/50 focus:bg-white border border-slate-200 hover:border-amber-300 focus:border-[#1E88E5] focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 transition-all"
                              />
                            </td>
                            <td className="px-3 py-3.5 text-slate-500 text-xs">{formatDate(item.lastInspected)}</td>
                            <td className="px-4 py-3.5 text-center">
                              <button 
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#1E88E5] bg-blue-50/60 hover:bg-blue-100/80 rounded-lg transition-colors border border-blue-200/60 cursor-pointer"
                              >
                                <Edit3 size={14} /> ปรับจำนวน
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC]">
                <p className="text-sm font-medium text-slate-500">
                  แสดง {(currentPage - 1) * itemsPerPage + (filteredData.length > 0 ? 1 : 0)} - {Math.min(currentPage * itemsPerPage, filteredData.length)} จาก {filteredData.length} รายการอุปกรณ์
                </p>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let page = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      page = currentPage - 2 + i;
                      if (page > totalPages) return null;
                    }
                    
                    return (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page ? 'bg-[#1E88E5] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Technician Grouped View */
            <div className="p-6 space-y-6 bg-slate-50/50">
              {groupedByTechnician.length === 0 ? (
                <div className="py-12 text-center text-slate-500">ไม่มีข้อมูลที่ตรงกับตัวกรอง</div>
              ) : (
                groupedByTechnician.map(group => (
                  <div key={group.userName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1E88E5] text-white flex items-center justify-center font-black text-base shadow-sm">
                          {group.userName.replace('นาย', '').charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{group.userName}</h3>
                          <p className="text-xs text-slate-500">รายการอุปกรณ์ทั้งหมด {group.items.length} ประเภท ({group.totalItems} ชิ้น)</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          พร้อมใช้งาน {group.ready}
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                          ชำรุด {group.damaged}
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          รอซ่อม {group.pending}
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                          จำหน่าย/ขาด {group.disposed}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {group.items.map(item => {
                        const totalCount = item.ready + item.pending + item.damaged + item.disposed;
                        return (
                          <div
                            key={item.rowKey}
                            className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-white flex flex-col gap-2.5 transition-all shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                                  {getEmojiIcon(item.category, item.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate" title={item.name}>
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    ขั้นต่ำ <span className="font-bold text-purple-700">{item.standard} {item.unit}</span>
                                    {' • '}
                                    รวม <span className="font-bold text-slate-800">{totalCount} {item.unit}</span>
                                    {' • '}
                                    <span className="text-emerald-600 font-bold">พร้อมใช้ {item.ready} {item.unit}</span>
                                    {item.damaged > 0 && (
                                      <> • <span className="text-rose-600 font-bold">ชำรุด {item.damaged} {item.unit}</span></>
                                    )}
                                    {item.pending > 0 && (
                                      <> • <span className="text-amber-600 font-bold">รอซ่อม {item.pending} {item.unit}</span></>
                                    )}
                                    {item.disposed > 0 && (
                                      <> • <span className="text-slate-500 font-semibold">ขาด/จำหน่าย {item.disposed} {item.unit}</span></>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-1.5 text-slate-400 hover:text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors shrink-0 border-0 cursor-pointer"
                                title="แก้ไขจำนวน"
                              >
                                <Edit3 size={15} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={item.remarks || ''}
                              onChange={(e) => updateRowRemarkInline(item.rowKey, e.target.value)}
                              placeholder="ระบุหมายเหตุ/คำชี้แจง..."
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-700 bg-slate-50 hover:bg-amber-50/50 focus:bg-white border border-slate-200 focus:border-[#1E88E5] focus:outline-none placeholder:text-slate-400 transition-colors"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </main>

      {/* Update Aggregated Quantities Modal */}
      {updateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-600" /> อัปเดตภาพรวมจำนวนอุปกรณ์
              </h3>
              <button onClick={() => setUpdateItem(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm border border-slate-200 shrink-0">
                  {getEmojiIcon(updateItem.category, updateItem.name)}
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-600 mb-0.5">ผู้ถือครอง / ช่าง: {updateItem.userName}</p>
                  <h4 className="font-bold text-slate-900 text-base leading-tight">{updateItem.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    รวมทั้งหมด {(Number(editReady) || 0) + (Number(editPending) || 0) + (Number(editDamaged) || 0) + (Number(editDisposed) || 0)} {updateItem.unit}
                  </p>
                </div>
              </div>

              <form id="update-form" onSubmit={handleUpdateQuantities} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-4">
                  <label className="text-xs font-bold text-purple-900">
                    จำนวนอุปกรณ์ขั้นต่ำต่อชุด ({updateItem.unit})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editStandard}
                    onChange={(e) => setEditStandard(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 px-3 py-1.5 bg-white border border-purple-300 rounded-lg font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1.5">
                      <CheckCircle size={14} /> พร้อมใช้งาน ({updateItem.unit})
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editReady}
                      onChange={(e) => setEditReady(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1.5">
                      <AlertTriangle size={14} /> ชำรุด ({updateItem.unit})
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editDamaged}
                      onChange={(e) => setEditDamaged(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
                      <Wrench size={14} /> รอตรวจ / รอซ่อม ({updateItem.unit})
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editPending}
                      onChange={(e) => setEditPending(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                      <Trash2 size={14} /> จำหน่าย / ขาด ({updateItem.unit})
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editDisposed}
                      onChange={(e) => setEditDisposed(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="เช่น รอเบิกทดแทน 1 ใบ..."
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setUpdateItem(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">ยกเลิก</button>
              <button type="submit" form="update-form" className="px-6 py-2 text-sm font-bold text-white bg-[#1E88E5] hover:bg-blue-600 rounded-lg transition-colors shadow-sm">
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new equipment modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Plus size={20} className="text-[#7C5EE4]" /> เพิ่ม/ปรับปรุงรายการอุปกรณ์
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ผู้ใช้งาน / ช่าง</label>
                <select
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                >
                  {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่ออุปกรณ์</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น หมวกนิรภัย (Safety Helmet)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">หน่วยนับ</label>
                  <input
                    type="text"
                    placeholder="ใบ / คู่ / ชุด"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">หมวดหมู่</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                >
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between gap-3">
                <label className="text-xs font-bold text-purple-900">จำนวนอุปกรณ์ขั้นต่ำต่อชุด ({newUnit || 'ชิ้น'})</label>
                <input
                  type="number"
                  min={0}
                  value={newStandard}
                  onChange={(e) => setNewStandard(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 px-3 py-1.5 bg-white border border-purple-300 rounded-xl text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1">พร้อมใช้งาน</label>
                  <input
                    type="number"
                    min={0}
                    value={newReady}
                    onChange={(e) => setNewReady(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">ชำรุด</label>
                  <input
                    type="number"
                    min={0}
                    value={newDamaged}
                    onChange={(e) => setNewDamaged(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 mb-1">รอตรวจ/รอซ่อม</label>
                  <input
                    type="number"
                    min={0}
                    value={newPending}
                    onChange={(e) => setNewPending(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">จำหน่าย/ขาด</label>
                  <input
                    type="number"
                    min={0}
                    value={newDisposed}
                    onChange={(e) => setNewDisposed(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer">
                  ยกเลิก
                </button>
                <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-[#7C5EE4] hover:bg-[#6D53C9] rounded-lg transition-colors shadow-sm border-0 cursor-pointer">
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Executive Summary Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-100 rounded-3xl w-full max-w-6xl max-h-[94vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            
            {/* Modal Top Controls */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#4A154B] via-[#6B2169] to-[#8A3B87] text-white flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <FileText size={20} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg leading-tight">เอกสารสรุปภาพรวมรายการอุปกรณ์และความพร้อม PPE (สำหรับนำเสนอผู้บริหาร)</h3>
                  <p className="text-xs text-purple-200">สามารถเลือกรูปแบบสรุป บันทึกเป็นรูปภาพ (PNG) หรือสั่งพิมพ์ / บันทึกเป็น PDF ได้ทันที</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex bg-black/25 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setExportViewMode('summary_by_item')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                      exportViewMode === 'summary_by_item' ? 'bg-white text-[#6B2169] shadow-sm' : 'bg-transparent text-white/85 hover:text-white'
                    }`}
                  >
                    สรุปตามประเภทอุปกรณ์
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportViewMode('summary_by_tech')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                      exportViewMode === 'summary_by_tech' ? 'bg-white text-[#6B2169] shadow-sm' : 'bg-transparent text-white/85 hover:text-white'
                    }`}
                  >
                    สรุปแยกตามชุดงานช่าง
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportViewMode('detailed_list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                      exportViewMode === 'detailed_list' ? 'bg-white text-[#6B2169] shadow-sm' : 'bg-transparent text-white/85 hover:text-white'
                    }`}
                  >
                    ตารางรายการละเอียด
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-sm transition-all border-0 cursor-pointer"
                >
                  <Printer size={15} /> พิมพ์ / บันทึก PDF
                </button>
                <button
                  type="button"
                  disabled={isExportingImage}
                  onClick={handleDownloadPNG}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all border-0 cursor-pointer disabled:opacity-60"
                >
                  <Download size={15} /> {isExportingImage ? 'กำลังสร้างไฟล์...' : 'บันทึกรูปภาพ (PNG)'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors border-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Report Body */}
            <div className="p-4 md:p-8 overflow-y-auto flex-1">
              <div
                ref={exportRef}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-5xl mx-auto text-slate-800 space-y-6"
              >
                {/* Report Banner Header */}
                <div className="rounded-2xl bg-gradient-to-r from-[#4A154B] via-[#6B2169] to-[#8A3B87] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/95 flex items-center justify-center shadow-md shrink-0">
                      <SafetyHelmetIcon size={44} />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-900 mb-1.5">
                        PEA ผกร.กรย.(ก3) • EXECUTIVE SAFETY REPORT
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-snug">
                        รายงานสรุปสถานะและความพร้อมอุปกรณ์ความปลอดภัย (PPE)
                      </h2>
                      <p className="text-xs text-purple-100 mt-1">
                        ขอบเขตข้อมูล: {selectedCategory === 'all' ? 'ทุกหมวดหมู่อุปกรณ์' : selectedCategory} • ผู้เบิก/ชุดงาน: {selectedUser === 'all' ? `ทุกชุดงาน (${groupedByTechnician.length} ชุดงาน)` : selectedUser}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-right shrink-0">
                    <p className="text-[11px] text-purple-100">%ความพร้อมใช้งาน</p>
                    <p className="text-3xl font-black text-amber-300 leading-none mt-1">{stats.readyPct}%</p>
                    <p className="text-[11px] text-purple-100 mt-1">ข้อมูล ณ วันที่ {formatDateTime(currentTime)}</p>
                  </div>
                </div>

                {/* Executive KPI Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500">จำนวนอุปกรณ์รวมทั้งหมด</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.total.toLocaleString()} <span className="text-xs font-bold text-slate-500">ชิ้น/หน่วย</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-emerald-800">พร้อมใช้งาน</p>
                      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900">{stats.readyPct}%</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{stats.ready.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-rose-800">ชำรุด</p>
                      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-rose-200/70 text-rose-900">{stats.damagedPct}%</span>
                    </div>
                    <p className="text-2xl font-black text-rose-700 mt-1">{stats.damaged.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-800">รอตรวจ / รอซ่อม</p>
                      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900">{stats.pendingPct}%</span>
                    </div>
                    <p className="text-2xl font-black text-amber-700 mt-1">{stats.pending.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-300">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">จำหน่าย / ขาดอัตรา</p>
                      <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-slate-300 text-slate-800">{stats.disposedPct}%</span>
                    </div>
                    <p className="text-2xl font-black text-slate-700 mt-1">{stats.disposed.toLocaleString()}</p>
                  </div>
                </div>

                {/* Section 1: Summary By Equipment Type */}
                {exportViewMode === 'summary_by_item' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-1">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <ShieldCheck size={17} className="text-[#6B2169]" />
                        ตารางสรุปภาพรวมความพร้อมแยกตามประเภทอุปกรณ์ ({groupedByEquipmentType.length} รายการ)
                      </h4>
                      <span className="text-xs text-purple-700 font-semibold">💡 คลิกที่ช่อง หมายเหตุ / คำชี้แจง เพื่อพิมพ์รายละเอียดชี้แจงผู้บริหารได้ทันที</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <th className="py-2.5 px-3 font-bold">ลำดับ</th>
                            <th className="py-2.5 px-3 font-bold">รายการอุปกรณ์</th>
                            <th className="py-2.5 px-3 font-bold">หมวดหมู่</th>
                            <th className="py-2.5 px-3 font-bold text-center">เกณฑ์ขั้นต่ำรวม</th>
                            <th className="py-2.5 px-3 font-bold text-center text-emerald-700">พร้อมใช้งาน</th>
                            <th className="py-2.5 px-3 font-bold text-center text-rose-700">ชำรุด</th>
                            <th className="py-2.5 px-3 font-bold text-center text-amber-700">รอซ่อม</th>
                            <th className="py-2.5 px-3 font-bold text-center text-slate-600">จำหน่าย/ขาด</th>
                            <th className="py-2.5 px-3 font-bold text-center">ความพร้อม (%)</th>
                            <th className="py-2.5 px-3 font-bold min-w-[200px]">หมายเหตุ / คำชี้แจงผู้บริหาร</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {groupedByEquipmentType.map((eq, idx) => {
                            const readinessPct = eq.standardTotal > 0 ? Math.min(100, Math.round((eq.readyTotal / eq.standardTotal) * 100)) : 100;
                            const currentRemark = itemExecRemarks[eq.name] !== undefined
                              ? itemExecRemarks[eq.name]
                              : eq.defaultRemarks.join(', ');
                            return (
                              <tr key={eq.name} className="hover:bg-slate-50/70">
                                <td className="py-2 px-3 text-slate-500 font-semibold">{idx + 1}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{getEmojiIcon(eq.category, eq.name)}</span>
                                    <span>{eq.name}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-slate-500">{eq.category.split(' ')[1] || eq.category}</td>
                                <td className="py-2 px-3 text-center font-bold text-purple-800 bg-purple-50/40">{eq.standardTotal} {eq.unit}</td>
                                <td className="py-2 px-3 text-center font-extrabold text-emerald-700 bg-emerald-50/40">{eq.readyTotal} {eq.unit}</td>
                                <td className="py-2 px-3 text-center font-bold text-rose-600">{eq.damagedTotal > 0 ? `${eq.damagedTotal} ${eq.unit}` : '-'}</td>
                                <td className="py-2 px-3 text-center font-bold text-amber-600">{eq.pendingTotal > 0 ? `${eq.pendingTotal} ${eq.unit}` : '-'}</td>
                                <td className="py-2 px-3 text-center font-semibold text-slate-500">{eq.disposedTotal > 0 ? `${eq.disposedTotal} ${eq.unit}` : '-'}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                    readinessPct >= 80
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : readinessPct >= 50
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {readinessPct}%
                                  </span>
                                </td>
                                <td className="py-1.5 px-2.5">
                                  <input
                                    type="text"
                                    value={currentRemark}
                                    onChange={(e) => updateItemExecRemark(eq.name, e.target.value)}
                                    placeholder="คลิกเพื่อระบุคำชี้แจง..."
                                    className="w-full px-2.5 py-1 rounded-lg text-xs text-slate-800 font-medium bg-transparent hover:bg-amber-50/60 focus:bg-amber-50 border border-transparent hover:border-amber-200 focus:border-amber-400 focus:outline-none placeholder:text-slate-300 transition-colors"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section 2: Summary By Technician */}
                {exportViewMode === 'summary_by_tech' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Users size={17} className="text-[#6B2169]" />
                        สรุปความพร้อมอุปกรณ์แยกตามชุดงานช่าง ({groupedByTechnician.length} ชุดงาน)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {groupedByTechnician.map((tech) => {
                        const techMinTotal = tech.items.reduce((acc, i) => acc + (i.standard || 0), 0);
                        const techReadyPct = techMinTotal > 0 ? Math.min(100, Math.round((tech.ready / techMinTotal) * 100)) : 0;
                        return (
                          <div key={tech.userName} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#6B2169] text-white flex items-center justify-center font-bold text-xs">
                                  {tech.userName.replace('นาย', '').charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{tech.userName}</p>
                                  <p className="text-[11px] text-slate-500">จำนวนรายการอุปกรณ์ {tech.items.length} ประเภท • ความพร้อมเทียบเกณฑ์ขั้นต่ำ {techReadyPct}%</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200">ขั้นต่ำรวม {techMinTotal}</span>
                                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">พร้อมใช้งาน {tech.ready}</span>
                                <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">ชำรุด {tech.damaged}</span>
                                <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">รอซ่อม {tech.pending}</span>
                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">จำหน่าย/ขาด {tech.disposed}</span>
                              </div>
                            </div>
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {tech.items.map(item => (
                                <div key={item.rowKey} className="px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col gap-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800 truncate pr-2">{item.name}</span>
                                    <span className="shrink-0 font-bold text-[11px]">
                                      <span className="text-purple-700">ขั้นต่ำ {item.standard}</span>
                                      {' | '}
                                      <span className="text-emerald-600">ดี {item.ready}</span>
                                      {item.damaged > 0 && <span className="text-rose-600"> • ชำรุด {item.damaged}</span>}
                                      {item.disposed > 0 && <span className="text-slate-500"> • ขาด {item.disposed}</span>}
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={item.remarks || ''}
                                    onChange={(e) => updateRowRemarkInline(item.rowKey, e.target.value)}
                                    placeholder="หมายเหตุ/คำชี้แจง..."
                                    className="w-full px-2 py-0.5 rounded text-[11px] text-amber-800 bg-white/80 hover:bg-amber-50/60 focus:bg-amber-50 border border-slate-200/70 focus:border-amber-400 focus:outline-none placeholder:text-slate-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 3: Detailed List */}
                {exportViewMode === 'detailed_list' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-1">
                      <h4 className="font-bold text-slate-800 text-sm">
                        ตารางรายการอุปกรณ์รายชุดงาน ({filteredData.length} รายการ)
                      </h4>
                      <span className="text-xs text-purple-700 font-semibold">💡 คลิกที่ช่อง หมายเหตุ / คำชี้แจง เพื่อพิมพ์แก้ไขได้ทันที</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                            <th className="py-2 px-3 font-bold">ชื่ออุปกรณ์</th>
                            <th className="py-2 px-3 font-bold">หมวดหมู่</th>
                            <th className="py-2 px-3 font-bold">ผู้ใช้งาน / ช่าง</th>
                            <th className="py-2 px-3 font-bold text-center">ขั้นต่ำต่อชุด</th>
                            <th className="py-2 px-3 font-bold text-center text-emerald-700">พร้อมใช้</th>
                            <th className="py-2 px-3 font-bold text-center text-rose-700">ชำรุด</th>
                            <th className="py-2 px-3 font-bold text-center text-amber-700">รอซ่อม</th>
                            <th className="py-2 px-3 font-bold text-center text-slate-600">จำหน่าย/ขาด</th>
                            <th className="py-2 px-3 font-bold min-w-[200px]">หมายเหตุ / คำชี้แจงผู้บริหาร</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredData.map((item) => (
                            <tr key={item.rowKey}>
                              <td className="py-2 px-3 font-bold text-slate-800">{item.name}</td>
                              <td className="py-2 px-3 text-slate-500">{item.category.split(' ')[1] || item.category}</td>
                              <td className="py-2 px-3 font-semibold text-slate-700">{item.userName}</td>
                              <td className="py-2 px-3 text-center font-bold text-purple-800">{item.standard} {item.unit}</td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-600">{item.ready} {item.unit}</td>
                              <td className="py-2 px-3 text-center font-bold text-rose-600">{item.damaged > 0 ? `${item.damaged} ${item.unit}` : '-'}</td>
                              <td className="py-2 px-3 text-center font-bold text-amber-600">{item.pending > 0 ? `${item.pending} ${item.unit}` : '-'}</td>
                              <td className="py-2 px-3 text-center text-slate-500">{item.disposed > 0 ? `${item.disposed} ${item.unit}` : '-'}</td>
                              <td className="py-1.5 px-2.5">
                                <input
                                  type="text"
                                  value={item.remarks || ''}
                                  onChange={(e) => updateRowRemarkInline(item.rowKey, e.target.value)}
                                  placeholder="คลิกเพื่อระบุคำชี้แจง..."
                                  className="w-full px-2.5 py-1 rounded-lg text-xs text-slate-800 font-medium bg-transparent hover:bg-amber-50/60 focus:bg-amber-50 border border-transparent hover:border-amber-200 focus:border-amber-400 focus:outline-none placeholder:text-slate-300 transition-colors"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Overall Executive Note / Clarification Box */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Edit3 size={14} className="text-amber-700" />
                      หมายเหตุสรุปภาพรวม / คำชี้แจงเพิ่มเติมเพื่อเรียนผู้บริหาร
                    </label>
                    <span className="text-[11px] text-amber-700">สามารถพิมพ์รายละเอียดแผนการจัดซื้อ/เบิกทดแทน หรือเหตุผลชี้แจงเพิ่มเติมได้โดยตรง</span>
                  </div>
                  <textarea
                    rows={3}
                    value={overallExecNote}
                    onChange={(e) => updateOverallNote(e.target.value)}
                    placeholder="พิมพ์รายละเอียดชี้แจงผู้บริหาร เช่น รายการที่ขาดอัตราอยู่ระหว่างดำเนินการขออนุมัติจัดซื้อทดแทนประจำปีงบประมาณ / อุปกรณ์ที่ชำรุดได้ส่งตรวจสอบมาตรฐานแล้ว..."
                    className="w-full p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y placeholder:text-slate-400"
                  />
                </div>

                {/* Report Footer Signature / Timestamp */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-400">
                  <span>ระบบติดตามสถานะและความพร้อมอุปกรณ์ความปลอดภัย (Safety & PPE Dashboard) • PEA ผกร.กรย.(ก3)</span>
                  <span>ผู้จัดทำรายงาน: Admin • พิมพ์เมื่อ {formatDateTime(currentTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
