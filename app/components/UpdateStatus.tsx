"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "./TopBar";
import { Plus, X, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { wireDataList } from "../../lib/wireData";

const getLatestRemarkDetail = (remarks?: string) => {
  if (!remarks) return null;
  const lines = remarks.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.includes(' | ')) {
      return trimmed.split(' | ').slice(1).join(' | ').trim();
    }
    if (!trimmed.includes('📍')) {
      return trimmed;
    }
  }
  return null;
};

export default function UpdateStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = searchParams?.get("step");

  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("ALL");
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedWbs, setSelectedWbs] = useState("");
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);

  // Calculator State
  const [calcWireId, setCalcWireId] = useState("");
  const [calcLength, setCalcLength] = useState("");
  const [calcPercentage, setCalcPercentage] = useState("100");
  const [calcWeight, setCalcWeight] = useState("");
  const [calcActiveInput, setCalcActiveInput] = useState<"length" | "weight" | "percentage" | null>(null);

  const [project, setProject] = useState<Project | null>(null);

  // Form State
  const [editWbs, setEditWbs] = useState("");
  const [editName, setEditName] = useState("");
  const [status, setStatus] = useState("");
  const [projectValue, setProjectValue] = useState("");
  const [pTracking, setPTracking] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [closingPlan, setClosingPlan] = useState("");
  const [constructionType, setConstructionType] = useState("1");
  const [progTargets, setProgTargets] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [progDone, setProgDone] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [manualProgress, setManualProgress] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState("ม.ค.");
  const [newRemarks, setNewRemarks] = useState("");
  const [oldRemarks, setOldRemarks] = useState("");
  const [checks, setChecks] = useState({
    check1: false,
    check2: false,
    check3: false,
    check4: false,
    check5: false,
    check6: false,
    check7: false,
    check8: false,
  });
  const [scrapWireType, setScrapWireType] = useState("");
  const [scrapWireLength, setScrapWireLength] = useState<number | "">("");
  const [scrapReturnedWeight, setScrapReturnedWeight] = useState<number | "">(
    "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [estSiteExpense, setEstSiteExpense] = useState("");
  const [allocatedSiteBudget, setAllocatedSiteBudget] = useState("");
  const [disbursedSiteExpense, setDisbursedSiteExpense] = useState("");
  const [estOperatingExpense, setEstOperatingExpense] = useState("");
  const [disbursedOperatingExpense, setDisbursedOperatingExpense] =
    useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userRole, setUserRole] = useState("user");
  const [viewMode, setViewMode] = useState("grid");
  const [expandedWbs, setExpandedWbs] = useState(new Set<string>());
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Add New Project State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    wbs: "",
    name: "",
    supervisor: "",
    project_type: "",
    value: "",
    open_year: "",
    p_tracking: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    const currentMonthIndex = new Date().getMonth();
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    setSelectedMonth(months[currentMonthIndex]);
    const role = sessionStorage.getItem("pea_role");
    if (role) setUserRole(role);
  }, []);

  // Handle URL step changes
  useEffect(() => {
    if (step === "1") {
      setSelectedWbs("");
      setIsScrapModalOpen(false);
    } else if (step === "2") {
      setIsScrapModalOpen(false);
      // We don't alert here because it could be annoying, just let them be on the form if selected, or list if not
    } else if (step === "3") {
      setIsScrapModalOpen(true);
    }
  }, [step]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("wbs");
    if (error) {
      console.error(error);
    } else {
      let projData = data as Project[];
      projData = projData.filter((p) => {
        if (
          (p.wbs &&
            (p.wbs.includes("IMPORTANT_TASKS") ||
              p.wbs.includes("SAFETY_PLAN"))) ||
          (p.name &&
            (p.name.includes("Important Tasks") ||
              p.name.includes("Safety Training")))
        ) {
          return false;
        }
        return true;
      });
      setProjects(projData);
      setFilteredProjects(projData);
      const uniqueSups = Array.from(
        new Set(projData.map((p) => p.supervisor || "ไม่มีข้อมูล")),
      );
      setSupervisors(uniqueSups as string[]);

      const uniqueStatuses = Array.from(
        new Set(projData.map((p) => p.status || "ไม่มีสถานะ")),
      );
      setAvailableStatuses(uniqueStatuses as string[]);
    }
  };

  useEffect(() => {
    let filtered = projects;

    if (selectedSupervisor !== "ALL") {
      filtered = filtered.filter(
        (p) => (p.supervisor || "ไม่มีข้อมูล") === selectedSupervisor,
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((p) =>
        selectedStatuses.includes(p.status || "ไม่มีสถานะ"),
      );
    }

    setFilteredProjects(filtered);
    setSelectedWbs("");
    setProject(null);
  }, [selectedSupervisor, selectedStatuses, projects]);

  useEffect(() => {
    if (selectedWbs) {
      const p = projects.find((x) => x.wbs === selectedWbs);
      if (p) {
        setProject(p);
        setEditWbs(p.wbs || "");
        setEditName(p.name || "");
        setStatus(p.status || "");
        setProjectValue(p.value ? p.value.toString() : "");
        setPTracking(p.p_tracking || "");
        setActionPlan(p.action_plan || "");
        setClosingPlan(p.closing_plan || "");
        setConstructionType(p.construction_type || "1");
        setProgTargets([
          p.step1_target || 0,
          p.step2_target || 0,
          p.step3_target || 0,
          p.step4_target || 0,
          p.step5_target || 0,
          p.step6_target || 0,
        ]);
        setProgDone([
          p.step1_done || 0,
          p.step2_done || 0,
          p.step3_done || 0,
          p.step4_done || 0,
          p.step5_done || 0,
          p.step6_done || 0,
        ]);
        setManualProgress(p.manual_progress || 0);

        // Clean up duplicate month markers in existing remarks
        let cleanedRemarks = p.remarks || "";
        if (cleanedRemarks) {
          const lines = cleanedRemarks.split("\n");
          const seenMarkers = new Set<string>();
          const newLines: string[] = [];
          for (const line of lines) {
            const match = line.match(/^(📍 \[[^\]]+\])/);
            if (match) {
              const marker = match[1];
              if (!seenMarkers.has(marker)) {
                seenMarkers.add(marker);
                newLines.push(line);
              }
            } else {
              newLines.push(line);
            }
          }
          cleanedRemarks = newLines.join("\n");
        }

        setOldRemarks(cleanedRemarks);
        setNewRemarks("");
        setScrapWireType(p.scrap_wire_type || "");
        setScrapWireLength(p.scrap_wire_length || "");
        setScrapReturnedWeight(p.scrap_returned_weight || "");
        setChecks({
          check1: p.check1,
          check2: p.check2,
          check3: p.check3,
          check4: p.check4,
          check5: p.check5,
          check6: p.check6,
          check7: p.check7,
          check8: p.check8,
        });
        setEstSiteExpense(
          p.est_site_expense ? p.est_site_expense.toString() : "",
        );
        setAllocatedSiteBudget(
          p.allocated_site_budget ? p.allocated_site_budget.toString() : "",
        );
        setDisbursedSiteExpense(
          p.disbursed_site_expense ? p.disbursed_site_expense.toString() : "",
        );
        setEstOperatingExpense(
          p.est_operating_expense ? p.est_operating_expense.toString() : "",
        );
        setDisbursedOperatingExpense(
          p.disbursed_operating_expense
            ? p.disbursed_operating_expense.toString()
            : "",
        );
        setFile(null);
        setPreviewUrl(p.image_url || "");
        setMessage({ text: "", type: "" });
      }
    } else {
      setProject(null);
    }
  }, [selectedWbs, projects]);

  const selectedCalcWire = wireDataList.find(w => w.id === calcWireId);

  const handleCalcWireChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setCalcWireId(newId);
    const wire = wireDataList.find(w => w.id === newId);
    if (wire) {
      if ((calcActiveInput === "length" || calcActiveInput === "percentage") && calcLength && !isNaN(Number(calcLength))) {
        const p = Number(calcPercentage) || 0;
        setCalcWeight((Number(calcLength) * (p / 100) * wire.weightPerMeter).toFixed(2));
      } else if (calcActiveInput === "weight" && calcWeight && !isNaN(Number(calcWeight)) && wire.weightPerMeter > 0) {
        if (calcLength && !isNaN(Number(calcLength)) && Number(calcLength) > 0) {
          const newPercent = (Number(calcWeight) / (Number(calcLength) * wire.weightPerMeter)) * 100;
          setCalcPercentage(newPercent.toFixed(1));
        } else {
          const p = Number(calcPercentage) || 100;
          if (p > 0) {
            setCalcLength((Number(calcWeight) / (wire.weightPerMeter * (p / 100))).toFixed(2));
          }
        }
      }
    }
  };

  const handleCalcLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcLength(val);
    setCalcActiveInput("length");
    if (selectedCalcWire && val && !isNaN(Number(val))) {
      const p = Number(calcPercentage) || 0;
      setCalcWeight((Number(val) * (p / 100) * selectedCalcWire.weightPerMeter).toFixed(2));
    } else {
      setCalcWeight("");
    }
  };

  const handleCalcWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcWeight(val);
    setCalcActiveInput("weight");
    if (selectedCalcWire && val && !isNaN(Number(val)) && selectedCalcWire.weightPerMeter > 0) {
      if (calcLength && !isNaN(Number(calcLength)) && Number(calcLength) > 0) {
        const p = (Number(val) / (Number(calcLength) * selectedCalcWire.weightPerMeter)) * 100;
        setCalcPercentage(p.toFixed(1));
      } else {
        const p = Number(calcPercentage) || 100;
        if (p > 0) {
          setCalcLength((Number(val) / (selectedCalcWire.weightPerMeter * (p / 100))).toFixed(2));
        }
      }
    } else {
      if (!calcLength) setCalcPercentage("100");
    }
  };

  const handleCalcPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCalcPercentage(val);
    setCalcActiveInput("percentage");
    if (selectedCalcWire && calcLength && !isNaN(Number(calcLength))) {
      const p = Number(val) || 0;
      setCalcWeight((Number(calcLength) * (p / 100) * selectedCalcWire.weightPerMeter).toFixed(2));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!project) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let imageUrl = project.image_url;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${project.wbs}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project_images")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("project_images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      let combinedRemarks = oldRemarks;
      if (newRemarks.trim() !== "" || status.trim() !== "") {
        const yearStr = (new Date().getFullYear() + 543).toString().slice(-2);
        const monthPrefix = `📍 [${selectedMonth} ${yearStr}]`;
        let newEntry = monthPrefix;
        if (status.trim() !== "") newEntry += ` สถานะ: ${status}`;
        if (newRemarks.trim() !== "") newEntry += ` | ${newRemarks.trim()}`;

        // Prepend new entry
        const tempRemarks =
          oldRemarks.trim() === ""
            ? newEntry
            : newEntry + "\n" + oldRemarks.trim();

        // Clean up any duplicates that might have been formed
        const lines = tempRemarks.split("\n");
        const seenMarkers = new Set<string>();
        const newLines: string[] = [];
        for (const line of lines) {
          const match = line.match(/^(📍 \[[^\]]+\])/);
          if (match) {
            const marker = match[1];
            if (!seenMarkers.has(marker)) {
              seenMarkers.add(marker);
              newLines.push(line);
            }
          } else {
            newLines.push(line);
          }
        }
        combinedRemarks = newLines.join("\n");
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          wbs: editWbs,
          name: editName,
          status,
          value: Number(projectValue) || 0,
          p_tracking: pTracking,
          action_plan: actionPlan,
          closing_plan: closingPlan,
          construction_type: constructionType,
          step1_target: progTargets[0],
          step1_done: progDone[0],
          step2_target: progTargets[1],
          step2_done: progDone[1],
          step3_target: progTargets[2],
          step3_done: progDone[2],
          step4_target: progTargets[3],
          step4_done: progDone[3],
          step5_target: progTargets[4],
          step5_done: progDone[4],
          step6_target: progTargets[5],
          step6_done: progDone[5],
          manual_progress: manualProgress,
          scrap_wire_type: scrapWireType,
          scrap_wire_length: Number(scrapWireLength) || 0,
          scrap_returned_weight: Number(scrapReturnedWeight) || 0,
          remarks: combinedRemarks,
          image_url: imageUrl,
          est_site_expense: Number(estSiteExpense) || 0,
          allocated_site_budget: Number(allocatedSiteBudget) || 0,
          disbursed_site_expense: Number(disbursedSiteExpense) || 0,
          est_operating_expense: Number(estOperatingExpense) || 0,
          disbursed_operating_expense: Number(disbursedOperatingExpense) || 0,
          ...checks,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (updateError) throw updateError;

      setMessage({
        text: "บันทึกสถานะงานและเช็คลิสท์เรียบร้อยแล้ว",
        type: "success",
      });
      setOldRemarks(combinedRemarks);
      setNewRemarks("");
      setFile(null);
      if (editWbs !== selectedWbs) {
        setSelectedWbs(editWbs);
      }
      fetchProjects();
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `ล้มเหลว: ${error.message}`, type: "error" });
    }
    setLoading(false);
  };

  const handleExtractPDF = async () => {
    if (!pdfFile || !project) return;
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("wbs", project.wbs || "");

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to extract");
      }

      const data = await res.json();

      if (data.est_site_expense !== undefined)
        setEstSiteExpense(data.est_site_expense.toString());
      if (data.allocated_site_budget !== undefined)
        setAllocatedSiteBudget(data.allocated_site_budget.toString());
      if (data.disbursed_site_expense !== undefined)
        setDisbursedSiteExpense(data.disbursed_site_expense.toString());
      if (data.project_value !== undefined && data.project_value > 0)
        setProjectValue(data.project_value.toString());

      alert("ดึงข้อมูลจาก PDF สำเร็จ! ตรวจสอบความถูกต้องและกดบันทึกข้อมูล");
    } catch (err: any) {
      console.error(err);
      alert(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${err.message}`);
    }
    setIsExtracting(false);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ที่จะลบโครงการ ${project.wbs}? ข้อมูลทั้งหมดของโครงการนี้จะหายไป`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);
      if (error) throw error;

      alert("ลบโครงการเรียบร้อยแล้ว");
      setProject(null);
      setSelectedWbs("");
      fetchProjects();
    } catch (error: any) {
      console.error(error);
      alert(`ลบล้มเหลว: ${error.message}`);
    }
    setLoading(false);
  };

  const handleAddNewProject = async () => {
    if (!newProject.wbs || !newProject.name) {
      alert("กรุณากรอกรหัส WBS และชื่องานให้ครบถ้วน");
      return;
    }
    setAddLoading(true);
    try {
      const { error } = await supabase.from("projects").insert({
        wbs: newProject.wbs,
        name: newProject.name,
        supervisor: newProject.supervisor,
        project_type: newProject.project_type,
        value: Number(newProject.value) || 0,
        open_year: newProject.open_year,
        p_tracking: newProject.p_tracking,
        status: "",
        remarks: "",
      });

      if (error) throw error;

      setIsAddModalOpen(false);
      setNewProject({
        wbs: "",
        name: "",
        supervisor: "",
        project_type: "",
        value: "",
        open_year: "",
        p_tracking: "",
      });
      fetchProjects();
      alert("เพิ่มงานใหม่เรียบร้อยแล้ว!");
    } catch (error: any) {
      console.error(error);
      alert(`ล้มเหลว: ${error.message}`);
    }
    setAddLoading(false);
  };

  const baseFilteredProjectsForStats = projects.filter((p) =>
    selectedStatuses.length === 0 ? true : selectedStatuses.includes(p.status || "ไม่มีสถานะ")
  );

  const supervisorStats = supervisors.map(sup => {
    const supProjects = baseFilteredProjectsForStats.filter(p => (p.supervisor || "ไม่มีข้อมูล") === sup);
    const total = supProjects.length;
    const f4 = supProjects.filter(p => p.status === 'F4').length;
    const percentage = total > 0 ? (f4 / total) * 100 : 0;
    return { name: sup, total, f4, percentage };
  }).filter(s => s.total > 0).sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.f4 - a.f4;
  });

  return (
    <>
      <TopBar title="อัพเดทสถานะงาน" />
      <div className="content-area animation-fade-in">

        {/* Supervisor Comparison Section */}
        {supervisorStats.length > 0 && !project && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Original Style: Progress Bar Cards */}
            <div className="card animation-fade-in" style={{ margin: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--pea-purple)" />
                เปรียบเทียบผลงานการปิดงาน (F4) ของช่างแต่ละคน
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {supervisorStats.map(stat => (
                  <div
                    key={stat.name}
                    onClick={() => selectedSupervisor === stat.name ? setSelectedSupervisor("ALL") : setSelectedSupervisor(stat.name)}
                    style={{
                      border: selectedSupervisor === stat.name ? '2px solid var(--pea-purple)' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      background: selectedSupervisor === stat.name ? '#f5f3ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedSupervisor === stat.name ? '0 4px 12px rgba(116, 56, 163, 0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: selectedSupervisor === stat.name ? 'var(--pea-purple)' : '#1e293b' }}>{stat.name}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: '700', color: stat.percentage === 100 ? '#10b981' : (stat.percentage > 50 ? '#f59e0b' : '#ef4444') }}>
                          {stat.percentage.toFixed(1)}%
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>(อัตราการปิดงานสำเร็จ)</div>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${stat.percentage}%`,
                        background: stat.percentage === 100 ? '#10b981' : (stat.percentage > 50 ? '#f59e0b' : '#ef4444')
                      }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                      <span>จำนวนงานทั้งหมด: <strong style={{ color: '#1e293b' }}>{stat.total}</strong> โครงการ</span>
                      <span>ปิดงาน F4 แล้ว: <strong style={{ color: '#10b981' }}>{stat.f4}</strong> โครงการ</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" style={{ width: "100%", height: "auto", maxWidth: "14px" }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                หมายเหตุ: คลิกเลือกที่ชื่อช่างเพื่อดูงานที่รับผิดชอบ คลิกซ้ำเพื่อยกเลิกและดูงานทั้งหมด
              </div>
            </div>

            {/* New Style: Bar Chart */}
            <div className="card animation-fade-in" style={{ minWidth: 0, margin: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--pea-purple)" />
                เปรียบเทียบจำนวนงาน F4 และงานทั้งหมด แยกตามช่าง
              </h3>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={supervisorStats} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="total" name="งานทั้งหมด" fill="var(--pea-purple)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="f4" name="ปิดงาน (F4)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr",
            gap: "20px",
          }}
        >
          <div>
            <label className="form-label">👷 กรองตามผู้ควบคุมงาน</label>
            <select
              className="form-select"
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
            >
              <option value="ALL">-- แสดงทั้งหมด --</option>
              {supervisors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {/* Status Filter */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              position: "relative",
            }}
          >
            <label className="form-label" style={{ marginBottom: "4px" }}>
              📊 กรองตามสถานะงาน
            </label>
            <div
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              style={{
                width: "100%",
                background: "#fff",
                border: "1px solid #dee2e6",
                fontWeight: "400",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#212529",
                fontSize: "0.95rem",
                height: "40px",
              }}
            >
              <span>
                {selectedStatuses.length === 0
                  ? "-- แสดงทั้งหมด --"
                  : `${selectedStatuses.length} สถานะ`}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#6c757d" }}>▼</span>
            </div>
            {isStatusDropdownOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9,
                  }}
                  onClick={() => setIsStatusDropdownOpen(false)}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "4px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    zIndex: 10,
                    width: "100%",
                    minWidth: "200px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background:
                        selectedStatuses.length === 0
                          ? "#f0fdf4"
                          : "transparent",
                    }}
                    onClick={() => {
                      setSelectedStatuses([]);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.length === 0}
                      readOnly
                      style={{ cursor: "pointer", accentColor: "#7e22ce" }}
                    />
                    <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                      -- แสดงทั้งหมด --
                    </span>
                  </div>
                  {availableStatuses.map((s) => (
                    <label
                      key={s}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        margin: 0,
                        background: selectedStatuses.includes(s)
                          ? "#f8fafc"
                          : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(s)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedStatuses([...selectedStatuses, s]);
                          else
                            setSelectedStatuses(
                              selectedStatuses.filter((st) => st !== s),
                            );
                        }}
                        style={{ cursor: "pointer", accentColor: "#7e22ce" }}
                      />
                      <span style={{ fontSize: "0.9rem", color: "#1e293b" }}>
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <div>
            <label className="form-label">
              📌 เลือกรหัส WBS / ชื่องานโครงการ
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                className="form-select"
                style={{
                  fontWeight: "600",
                  color: "var(--pea-purple)",
                  flex: 1,
                }}
                value={selectedWbs}
                onChange={(e) => setSelectedWbs(e.target.value)}
              >
                <option value="">-- หรือคลิกเลือกจากรายการด้านล่าง --</option>
                {filteredProjects.map((p) => (
                  <option key={p.id} value={p.wbs}>
                    [{p.wbs}] {p.name} - สถานะ: {p.status || "-"}
                  </option>
                ))}
              </select>
              {userRole !== "guest" && (
                <button
                  className="btn btn-primary"
                  style={{
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={18} /> เพิ่มงานใหม่
                </button>
              )}
            </div>
          </div>
        </div>

        {project ? (
          <div className="card">
            <button
              onClick={() => setSelectedWbs("")}
              className="btn"
              style={{
                marginBottom: "20px",
                background: "#f8fafc",
                color: "var(--text-dark)",
                border: "1px solid var(--border-color)",
                fontSize: "0.9rem",
                padding: "8px 16px",
              }}
            >
              ⬅️ ย้อนกลับไปหน้ารายการ
            </button>
            <div
              style={{
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "20px",
                marginBottom: "24px",
              }}
            >
              {userRole === "admin" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      color: "var(--pea-purple)",
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      width: "100%",
                      background: "#f8fafc",
                    }}
                    value={editWbs}
                    onChange={(e) => setEditWbs(e.target.value)}
                    placeholder="รหัส WBS"
                  />
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      color: "var(--text-dark)",
                      fontSize: "1.1rem",
                      fontWeight: "500",
                      width: "100%",
                      background: "#f8fafc",
                    }}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="ชื่องานโครงการ"
                  />
                </div>
              ) : (
                <>
                  <h4
                    style={{
                      color: "var(--pea-purple)",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      marginBottom: "4px",
                    }}
                  >
                    {project.wbs}
                  </h4>
                  <h5
                    style={{
                      color: "var(--text-dark)",
                      fontSize: "1.1rem",
                      fontWeight: "500",
                    }}
                  >
                    {project.name}
                  </h5>
                </>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div>
                <strong style={{ color: "var(--text-light)" }}>
                  ผู้ควบคุมงาน:
                </strong>{" "}
                <br />
                <span style={{ fontWeight: "600" }}>{project.supervisor}</span>
              </div>
              <div>
                <strong style={{ color: "var(--text-light)" }}>
                  ประเภทโครงการ:
                </strong>{" "}
                <br />
                <span style={{ fontWeight: "500" }}>
                  {project.project_type || "-"}
                </span>
              </div>
              <div>
                <strong style={{ color: "var(--text-light)" }}>มูลค่า:</strong>{" "}
                <br />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      maxWidth: "140px",
                      padding: "4px 8px",
                      backgroundColor:
                        userRole !== "admin" ? "#f1f5f9" : "white",
                      cursor: userRole !== "admin" ? "not-allowed" : "text",
                    }}
                    value={
                      projectValue
                        ? projectValue
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(val)) || val === "" || val === ".")
                        setProjectValue(val);
                    }}
                    disabled={userRole !== "admin"}
                    readOnly={userRole !== "admin"}
                  />
                  <span style={{ fontWeight: "600", color: "#047857" }}>
                    บาท
                  </span>
                </div>
              </div>
              <div>
                <strong style={{ color: "var(--text-light)" }}>
                  ปีเปิดงาน:
                </strong>{" "}
                <br />
                <span style={{ fontWeight: "500" }}>
                  {project.open_year || "-"} ({project.year_criteria || "-"})
                </span>
              </div>
            </div>

            {/* ข้อมูลงบประมาณและค่าใช้จ่าย */}
            <h5
              style={{
                color: "var(--pea-purple)",
                marginBottom: "16px",
                fontWeight: "600",
                fontSize: "1.1rem",
              }}
            >
              ข้อมูลงบประมาณและค่าใช้จ่าย
            </h5>
            <div
              style={{
                marginBottom: "32px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              {userRole === "admin" && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "16px",
                    background: "#eff6ff",
                    borderRadius: "8px",
                    border: "1px dashed #93c5fd",
                  }}
                >
                  <label
                    className="form-label"
                    style={{
                      color: "#1e40af",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    ✨ อัพโหลดไฟล์ PDF ดึงข้อมูลด้วย AI (อัตโนมัติ)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      className="form-control"
                      style={{ maxWidth: "300px", background: "white" }}
                      onChange={(e) =>
                        setPdfFile(e.target.files ? e.target.files[0] : null)
                      }
                    />
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: "8px 16px",
                        background: "#3b82f6",
                        borderColor: "#3b82f6",
                      }}
                      onClick={handleExtractPDF}
                      disabled={!pdfFile || isExtracting}
                    >
                      {isExtracting
                        ? "⏳ กำลังดึงข้อมูล..."
                        : "🤖 ดึงข้อมูลจาก PDF"}
                    </button>
                  </div>
                  <small
                    style={{
                      color: "#475569",
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    *อัพโหลดไฟล์รายงานการปิดงานก่อสร้าง (กส.)
                    เพื่อดึงค่างบประมาณต่างๆ ด้านล่าง
                  </small>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <label className="form-label">
                    ประมาณการค่าใช้จ่ายหน้างาน (บาท)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={
                      estSiteExpense
                        ? estSiteExpense
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(val)) || val === "" || val === ".")
                        setEstSiteExpense(val);
                    }}
                    disabled={userRole !== "admin"}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label className="form-label">
                    งบค่าใช้จ่ายหน้างานที่ได้รับจัดสรร (บาท)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      value={
                        allocatedSiteBudget
                          ? allocatedSiteBudget
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, "");
                        if (!isNaN(Number(val)) || val === "" || val === ".")
                          setAllocatedSiteBudget(val);
                      }}
                      disabled={userRole !== "admin"}
                    />
                    {Number(estSiteExpense) > 0 && (
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#3b82f6",
                          minWidth: "80px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {(
                          (Number(allocatedSiteBudget) /
                            Number(estSiteExpense)) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label className="form-label">
                    เบิกจ่ายค่าใช้จ่ายหน้างาน (บาท)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={
                      disbursedSiteExpense
                        ? disbursedSiteExpense
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(val)) || val === "" || val === ".")
                        setDisbursedSiteExpense(val);
                    }}
                    disabled={userRole !== "admin"}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontWeight: "600", color: "var(--text-dark)" }}
                  >
                    ค่าใช้จ่ายหน้างานคงเหลือ:
                  </span>
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      color:
                        Number(allocatedSiteBudget) -
                          Number(disbursedSiteExpense) >=
                          0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    {(
                      Number(allocatedSiteBudget) - Number(disbursedSiteExpense)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    บาท
                  </span>
                </div>
              </div>
            </div>
            <h5
              style={{
                color: "var(--pea-purple)",
                marginBottom: "16px",
                fontWeight: "600",
                fontSize: "1.1rem",
              }}
            >
              อัพเดทสถานะและการดำเนินงาน
            </h5>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label className="form-label">สถานะล่าสุด (เช่น C1, F4)</label>
                <input
                  type="text"
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">🚨 สถานะ สาย ป. ติดตาม</label>
                <select
                  className="form-select"
                  value={pTracking}
                  onChange={(e) => setPTracking(e.target.value)}
                >
                  <option value="">-- ไม่ได้ติดตาม --</option>
                  <option value="ติดตาม">ติดตาม (ทั่วไป)</option>
                  <option value="งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม">
                    งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม
                  </option>
                </select>
              </div>
              <div>
                <label className="form-label">📅 ประจำเดือน</label>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {[
                    "ม.ค.",
                    "ก.พ.",
                    "มี.ค.",
                    "เม.ย.",
                    "พ.ค.",
                    "มิ.ย.",
                    "ก.ค.",
                    "ส.ค.",
                    "ก.ย.",
                    "ต.ค.",
                    "พ.ย.",
                    "ธ.ค.",
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              {userRole === "admin" && (
                <>
                  <div>
                    <label className="form-label">แผนปฏิบัติการ</label>
                    <select
                      className="form-select"
                      value={actionPlan}
                      onChange={(e) => setActionPlan(e.target.value)}
                    >
                      <option value="">-- ไม่ได้กำหนด --</option>
                      <option value="ยังไม่ดำเนินการ">ยังไม่ดำเนินการ</option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 1">
                        ก่อสร้างแล้วเสร็จภายในไตรมาส 1
                      </option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 2">
                        ก่อสร้างแล้วเสร็จภายในไตรมาส 2
                      </option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 3">
                        ก่อสร้างแล้วเสร็จภายในไตรมาส 3
                      </option>
                      <option value="ก่อสร้างแล้วเสร็จภายในไตรมาส 4">
                        ก่อสร้างแล้วเสร็จภายในไตรมาส 4
                      </option>
                      <option value="ไม่เสร็จในปี 2569">
                        ไม่เสร็จในปี 2569
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">แผนปิดงาน</label>
                    <select
                      className="form-select"
                      value={closingPlan}
                      onChange={(e) => setClosingPlan(e.target.value)}
                    >
                      <option value="">-- ไม่ได้กำหนด --</option>
                      {[
                        "ม.ค. 69",
                        "ก.พ. 69",
                        "มี.ค. 69",
                        "เม.ย. 69",
                        "พ.ค. 69",
                        "มิ.ย. 69",
                        "ก.ค. 69",
                        "ส.ค. 69",
                        "ก.ย. 69",
                        "ต.ค. 69",
                        "พ.ย. 69",
                        "ธ.ค. 69",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">📝 อัพเดทความคืบหน้าใหม่</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="พิมพ์รายละเอียดที่นี่... (จะไปต่อท้ายประวัติเดิมโดยอัตโนมัติ)"
                value={newRemarks}
                onChange={(e) => setNewRemarks(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label
                className="form-label"
                style={{ color: "var(--text-light)" }}
              >
                🕒 ประวัติหมายเหตุเดิมทั้งหมด
              </label>
              <textarea
                className="form-control"
                rows={4}
                style={{
                  backgroundColor: "#f8fafc",
                  color: "var(--text-light)",
                  fontSize: "0.85rem",
                }}
                value={oldRemarks}
                disabled
              />
            </div>

            <h5
              style={{
                color: "var(--pea-purple)",
                marginBottom: "16px",
                fontWeight: "600",
                fontSize: "1.1rem",
              }}
            >
              ความก้าวหน้างานก่อสร้าง (หน้างาน)
            </h5>
            <div
              style={{
                marginBottom: "32px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">รูปแบบลักษณะงานก่อสร้าง</label>
                <select
                  className="form-select"
                  value={constructionType}
                  onChange={(e) => {
                    setConstructionType(e.target.value);
                    // Reset steps that are not applicable to 0? Or just let them be, the weight will be 0 anyway.
                  }}
                >
                  <option value="1">รูปแบบที่ 1: มีครบ 6 ขั้นตอน</option>
                  <option value="2">
                    รูปแบบที่ 2: ไม่มีพาดสายแรงต่ำ และไม่มีรื้อถอน (4 ขั้นตอน)
                  </option>
                  <option value="3">
                    รูปแบบที่ 3: ไม่มีพาดสายแรงต่ำ แต่มีรื้อถอน (5 ขั้นตอน)
                  </option>
                  <option value="4">
                    รูปแบบที่ 4: เฉพาะงานติดตั้งอุปกรณ์หัวเสาและงานพาดสายแรงสูง
                  </option>
                  <option value="5">
                    รูปแบบที่ 5: ประเมินความก้าวหน้ารวมเอง (%)
                  </option>
                </select>
              </div>

              {constructionType === "5" ? (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "16px",
                    background: "#fff",
                    borderRadius: "8px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <label
                    className="form-label"
                    style={{ fontSize: "0.95rem", marginBottom: "8px" }}
                  >
                    ความก้าวหน้างานก่อสร้างโดยรวม (ประเมินเอง)
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      maxWidth: "300px",
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      value={manualProgress || ""}
                      onChange={(e) =>
                        setManualProgress(
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0),
                          ),
                        )
                      }
                    />
                    <span
                      style={{ fontWeight: "500", color: "var(--text-light)" }}
                    >
                      %
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {[
                    { label: "1. ขุดหลุมปักเสา", idx: 0, unit: "ต้น" },
                    { label: "2. ปักเสา", idx: 1, unit: "ต้น" },
                    {
                      label: "3. ติดตั้งอุปกรณ์ประกอบหัวเสา",
                      idx: 2,
                      unit: "ชุด",
                    },
                    { label: "4. พาดสายแรงสูง", idx: 3, unit: "วงจร-กม." },
                    { label: "5. พาดสายแรงต่ำ", idx: 4, unit: "วงจร-กม." },
                    { label: "6. งานรื้อถอน", idx: 5, unit: "ต้น" },
                  ].map((step) => {
                    const weights =
                      constructionType === "2"
                        ? [20, 30, 25, 25, 0, 0]
                        : constructionType === "3"
                          ? [20, 25, 25, 20, 0, 10]
                          : constructionType === "4"
                            ? [0, 0, 50, 50, 0, 0]
                            : [15, 25, 20, 20, 10, 10];
                    const weight = weights[step.idx];
                    if (weight === 0) return null; // Hide if not applicable

                    return (
                      <div
                        key={step.idx}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <label
                          className="form-label"
                          style={{ fontSize: "0.9rem", marginBottom: "4px" }}
                        >
                          {step.label} (Weight: {weight}%)
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            placeholder="ผลงาน"
                            className="form-control"
                            value={
                              progDone[step.idx] === 0 &&
                                progTargets[step.idx] === 0
                                ? ""
                                : progDone[step.idx]
                            }
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                Number(e.target.value) || 0,
                              );
                              const newDone = [...progDone];
                              newDone[step.idx] = val;
                              setProgDone(newDone);
                            }}
                          />
                          <span style={{ color: "var(--text-light)" }}>/</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="เป้าหมาย"
                            className="form-control"
                            value={
                              progTargets[step.idx] === 0 &&
                                progDone[step.idx] === 0
                                ? ""
                                : progTargets[step.idx]
                            }
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                Number(e.target.value) || 0,
                              );
                              const newTargets = [...progTargets];
                              newTargets[step.idx] = val;
                              setProgTargets(newTargets);
                            }}
                          />
                          <span
                            style={{
                              fontWeight: "500",
                              color: "var(--text-light)",
                              minWidth: "35px",
                            }}
                          >
                            {step.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                  marginTop: "8px",
                }}
              >
                <span style={{ fontWeight: "600", marginRight: "12px" }}>
                  Progress งานก่อสร้างรวม:
                </span>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "var(--pea-purple)",
                  }}
                >
                  {(() => {
                    if (constructionType === "5")
                      return (manualProgress || 0).toFixed(2);
                    const w =
                      constructionType === "2"
                        ? [20, 30, 25, 25, 0, 0]
                        : constructionType === "3"
                          ? [20, 25, 25, 20, 0, 10]
                          : constructionType === "4"
                            ? [0, 0, 50, 50, 0, 0]
                            : [15, 25, 20, 20, 10, 10];
                    const total = progDone.reduce((sum, doneVal, idx) => {
                      const targetVal = progTargets[idx];
                      if (targetVal === 0 || w[idx] === 0) return sum;
                      const percent = doneVal / targetVal;
                      const cappedPercent = Math.min(1, percent);
                      return sum + cappedPercent * w[idx];
                    }, 0);
                    return total.toFixed(2);
                  })()}
                  %
                </span>
              </div>
            </div>

            {userRole === "admin" && (
              <>
                <h5
                  style={{
                    color: "var(--pea-purple)",
                    marginBottom: "16px",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                  }}
                >
                  ข้อมูลการส่งคืนเศษสาย
                </h5>
                <div
                  style={{
                    marginBottom: "32px",
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label className="form-label">ชนิดสายไฟที่รื้อถอน</label>
                      <select
                        className="form-select"
                        value={scrapWireType}
                        onChange={(e) => setScrapWireType(e.target.value)}
                      >
                        <option value="">-- เลือกชนิดสายไฟ --</option>
                        {wireDataList.map((wire) => (
                          <option key={wire.id} value={wire.id}>
                            {wire.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">
                        ระยะทางที่รื้อถอน (กม.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="เช่น 1.5"
                        className="form-control"
                        value={scrapWireLength}
                        onChange={(e) =>
                          setScrapWireLength(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        น้ำหนักที่ส่งคืนจริง (กก.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="เช่น 500"
                        className="form-control"
                        value={scrapReturnedWeight}
                        onChange={(e) =>
                          setScrapReturnedWeight(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>
                  {scrapWireType && scrapWireLength !== "" && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        background: "#eff6ff",
                        borderRadius: "8px",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      {(() => {
                        const wire = wireDataList.find(
                          (w) => w.id === scrapWireType,
                        );
                        if (!wire) return null;
                        const estimatedKg =
                          Number(scrapWireLength) * 1000 * wire.weightPerMeter;
                        return (
                          <span
                            style={{ fontSize: "0.9rem", color: "#1e40af" }}
                          >
                            💡 <strong>ประมาณการน้ำหนักเศษสาย:</strong>{" "}
                            {estimatedKg.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{" "}
                            กิโลกรัม
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </>
            )}

            <h5
              style={{
                color: "var(--pea-purple)",
                marginBottom: "16px",
                fontWeight: "600",
                fontSize: "1.1rem",
              }}
            >
              ตรวจสอบเช็คลิสท์
            </h5>

            <div className="checklist-grid" style={{ marginBottom: "32px" }}>
              {[
                { id: "check1", label: "ก่อสร้างเสร็จ" },
                { id: "check2", label: "ส่งคืนเศษสายแล้ว" },
                { id: "check3", label: "ส่งคืนเศษเหล็กแล้ว" },
                { id: "check4", label: "ทำ PM/ADS แล้ว" },
                { id: "check5", label: "ตรวจมาตรฐานแล้ว" },
                { id: "check6", label: "ใบสำคัญจ่ายครบแล้ว" },
                { id: "check7", label: "ขออนุมัติโอนงบแล้ว" },
                { id: "check8", label: "ปรับแผนผังและประมาณการแล้ว" },
              ].map((chk, i) => (
                <div key={chk.id} className="check-item">
                  <input
                    type="checkbox"
                    id={chk.id}
                    checked={checks[chk.id as keyof typeof checks]}
                    onChange={(e) =>
                      setChecks({ ...checks, [chk.id]: e.target.checked })
                    }
                  />
                  <label
                    htmlFor={chk.id}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      fontSize: "0.95rem",
                    }}
                  >
                    {chk.label}
                  </label>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "24px",
                borderRadius: "16px",
                border: "1px dashed #cbd5e1",
                marginBottom: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label className="form-label" style={{ marginBottom: "12px" }}>
                📷 อัพโหลดภาพถ่ายหน้างาน (ไม่บังคับ)
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                style={{ maxWidth: "400px" }}
              />
              {previewUrl && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      borderRadius: "12px",
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {message.text ? (
                <div
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    background:
                      message.type === "success" ? "#d1fae5" : "#fee2e2",
                    color: message.type === "success" ? "#047857" : "#b91c1c",
                    fontWeight: "500",
                    flex: 1,
                    marginRight: "20px",
                  }}
                >
                  {message.type === "success" ? "✅ " : "❌ "}
                  {message.text}
                </div>
              ) : (
                <div></div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                {userRole !== "guest" && (
                  <>
                    {userRole === "admin" && (
                      <button
                        className="btn"
                        onClick={handleDeleteProject}
                        disabled={loading}
                        style={{
                          minWidth: "140px",
                          background: "#fee2e2",
                          color: "#b91c1c",
                        }}
                      >
                        🗑️ ลบโครงการ
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ minWidth: "160px" }}
                    >
                      {loading ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  display: "flex",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  padding: "4px",
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: viewMode === "grid" ? "#fff" : "transparent",
                    color:
                      viewMode === "grid" ? "var(--pea-purple)" : "#64748b",
                    fontWeight: viewMode === "grid" ? "600" : "500",
                    cursor: "pointer",
                    boxShadow:
                      viewMode === "grid"
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  🔲 แบบตาราง
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: viewMode === "list" ? "#fff" : "transparent",
                    color:
                      viewMode === "list" ? "var(--pea-purple)" : "#64748b",
                    fontWeight: viewMode === "list" ? "600" : "500",
                    cursor: "pointer",
                    boxShadow:
                      viewMode === "list"
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  📄 แบบรายการ
                </button>
                <button
                  onClick={() => setShowAllProgress(!showAllProgress)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: showAllProgress ? "#fff" : "transparent",
                    color: showAllProgress ? "var(--pea-purple)" : "#64748b",
                    fontWeight: showAllProgress ? "600" : "500",
                    cursor: "pointer",
                    boxShadow: showAllProgress
                      ? "0 1px 3px rgba(0,0,0,0.1)"
                      : "none",
                    transition: "all 0.2s",
                    marginLeft: "4px"
                  }}
                >
                  {showAllProgress ? "ซ่อนความคืบหน้า" : "แสดงความคืบหน้า"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: viewMode === "grid" ? "grid" : "flex",
                flexDirection: viewMode === "list" ? "column" : "row",
                gridTemplateColumns:
                  viewMode === "grid"
                    ? "repeat(auto-fill, minmax(300px, 1fr))"
                    : "none",
                gap: viewMode === "grid" ? "20px" : "12px",
              }}
            >
              {filteredProjects.map((p) => {
                const steps = [
                  p.check1,
                  p.check2,
                  p.check3,
                  p.check4,
                  p.check5,
                  p.check6,
                  p.check7,
                  p.check8,
                ];
                const doneCount = steps.filter(Boolean).length;
                const progressPercent = (doneCount / 8) * 100;
                const type = p.construction_type || "1";
                const physicalProgress = (() => {
                  if (type === "5") return p.manual_progress || 0;
                  const w =
                    type === "2"
                      ? [20, 30, 25, 25, 0, 0]
                      : type === "3"
                        ? [20, 25, 25, 20, 0, 10]
                        : type === "4"
                          ? [0, 0, 50, 50, 0, 0]
                          : [15, 25, 20, 20, 10, 10];
                  const targets = [
                    p.step1_target,
                    p.step2_target,
                    p.step3_target,
                    p.step4_target,
                    p.step5_target,
                    p.step6_target,
                  ].map((val) => Number(val) || 0);
                  const dones = [
                    p.step1_done,
                    p.step2_done,
                    p.step3_done,
                    p.step4_done,
                    p.step5_done,
                    p.step6_done,
                  ].map((val) => Number(val) || 0);

                  return dones.reduce((sum, doneVal, idx) => {
                    const targetVal = targets[idx];
                    if (targetVal === 0 || w[idx] === 0) return sum;
                    const percent = doneVal / targetVal;
                    const cappedPercent = Math.min(1, percent);
                    return sum + cappedPercent * w[idx];
                  }, 0);
                })();

                const allocated = Number(p.allocated_site_budget) || 0;
                const disbursed = Number(p.disbursed_site_expense) || 0;
                const remaining = allocated - disbursed;
                const budgetPercent = Math.min(
                  100,
                  Math.max(
                    0,
                    allocated > 0 ? (disbursed / allocated) * 100 : 0,
                  ),
                );
                const isOverBudget = remaining < 0;
                const absRemaining = Math.abs(remaining);
                const remainingText =
                  absRemaining >= 1000000
                    ? `${(remaining / 1000000).toFixed(3)}m`
                    : absRemaining >= 1000
                      ? `${(remaining / 1000).toFixed(1)}k`
                      : remaining.toFixed(0);

                const isExpanded = expandedWbs.has(p.wbs);
                const toggleExpand = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const newSet = new Set(expandedWbs);
                  if (isExpanded) newSet.delete(p.wbs);
                  else newSet.add(p.wbs);
                  setExpandedWbs(newSet);
                };

                const detailsContent = (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginTop: viewMode === "list" ? "16px" : "0",
                    }}
                  >
                    {/* Physical Progress */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-light)",
                          minWidth: "40px",
                        }}
                      >
                        หน้างาน:
                      </span>
                      <div
                        style={{
                          background: "#f1f5f9",
                          height: "6px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${physicalProgress}%`,
                            backgroundColor:
                              physicalProgress === 100
                                ? "#10b981"
                                : physicalProgress > 50
                                  ? "#3b82f6"
                                  : "#8b5cf6",
                          }}
                        ></div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "var(--pea-purple)",
                          minWidth: "35px",
                          textAlign: "right",
                        }}
                      >
                        {physicalProgress.toFixed(1)}%
                      </span>
                    </div>

                    {/* Document Progress */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-light)",
                          minWidth: "40px",
                        }}
                      >
                        เอกสาร:
                      </span>
                      <div
                        style={{
                          background: "#f1f5f9",
                          height: "6px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${progressPercent}%`,
                            backgroundColor:
                              progressPercent === 100
                                ? "#10b981"
                                : progressPercent > 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        ></div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "var(--text-dark)",
                          minWidth: "35px",
                          textAlign: "right",
                        }}
                      >
                        {doneCount}/8
                      </span>
                    </div>

                    {/* Budget Progress */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-light)",
                          minWidth: "40px",
                        }}
                      >
                        งบฯเหลือ:
                      </span>
                      <div
                        style={{
                          background: "#f1f5f9",
                          height: "6px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          flex: 1,
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${budgetPercent}%`,
                            backgroundColor: isOverBudget
                              ? "#ef4444"
                              : budgetPercent > 80
                                ? "#f59e0b"
                                : "#10b981",
                          }}
                        ></div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: isOverBudget ? "#ef4444" : "#10b981",
                          minWidth: "35px",
                          textAlign: "right",
                        }}
                      >
                        {remainingText}
                      </span>
                    </div>
                  </div>
                );

                return (
                  <div
                    key={p.id}
                    className="card"
                    style={{
                      marginBottom: 0,
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      border: "1px solid #e2e8f0",
                      padding: viewMode === "list" ? "12px 16px" : "20px",
                    }}
                    onClick={() => setSelectedWbs(p.wbs)}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.borderColor = "var(--pea-purple)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.borderColor = "#e2e8f0")
                    }
                  >
                    {viewMode === "grid" ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              color: "var(--pea-purple)",
                            }}
                          >
                            {p.wbs}
                          </span>
                          <span
                            className={`badge ${p.status === "F4" ? "badge-success" : "badge-warning"}`}
                          >
                            {p.status || "-"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "1rem",
                            marginBottom: "8px",
                            flex: 1,
                            color: "var(--text-dark)",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            color: "var(--text-light)",
                            fontSize: "0.8rem",
                            marginBottom: isExpanded || showAllProgress ? "16px" : "0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <span>ผู้ควบคุมงาน: {p.supervisor}</span>
                          <button
                            onClick={toggleExpand}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#64748b",
                            }}
                            title={isExpanded || showAllProgress ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
                          >
                            {isExpanded || showAllProgress ? "▲" : "▼"}
                          </button>
                        </div>
                        {getLatestRemarkDetail(p.remarks) && (
                          <div style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            background: "#f8fafc",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            marginTop: "8px",
                            marginBottom: isExpanded || showAllProgress ? "16px" : "0",
                            borderLeft: "3px solid var(--pea-purple)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <span style={{ color: "var(--pea-purple)" }}>💬</span>
                            {getLatestRemarkDetail(p.remarks)}
                          </div>
                        )}
                        {(isExpanded || showAllProgress) && detailsContent}
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              flex: 1,
                              overflow: "hidden",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: "700",
                                color: "var(--pea-purple)",
                                minWidth: "160px",
                              }}
                            >
                              {p.wbs}
                            </span>
                            <span
                              style={{
                                fontWeight: "600",
                                color: "var(--text-dark)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {p.name}
                            </span>
                            <span
                              className={`badge ${p.status === "F4" ? "badge-success" : "badge-warning"}`}
                              style={{ marginLeft: "auto" }}
                            >
                              {p.status || "-"}
                            </span>
                          </div>
                          <button
                            onClick={toggleExpand}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#64748b",
                            }}
                            title={isExpanded || showAllProgress ? "ซ่อนรายละเอียด" : "แสดงรายละเอียด"}
                          >
                            {isExpanded || showAllProgress ? "▲" : "▼"}
                          </button>
                        </div>
                        {getLatestRemarkDetail(p.remarks) && (
                          <div style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            background: "#f8fafc",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            marginTop: "12px",
                            marginBottom: isExpanded || showAllProgress ? "16px" : "0",
                            borderLeft: "3px solid var(--pea-purple)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <span style={{ color: "var(--pea-purple)" }}>💬</span>
                            {getLatestRemarkDetail(p.remarks)}
                          </div>
                        )}
                        {(isExpanded || showAllProgress) && detailsContent}
                      </>
                    )}
                  </div>
                );
              })}
              {filteredProjects.length === 0 && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-light)",
                  }}
                >
                  ยังไม่มีข้อมูลโครงการ กรุณานำเข้าข้อมูลจาก Supabase ก่อนครับ
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New Project Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="card animation-fade-in"
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: 0,
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-light)",
              }}
            >
              <X />
            </button>

            <h3
              style={{
                color: "var(--pea-purple)",
                marginBottom: "24px",
                fontWeight: "bold",
              }}
            >
              ➕ เพิ่มข้อมูลงานก่อสร้างใหม่
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label className="form-label">📌 รหัส WBS *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProject.wbs}
                  onChange={(e) =>
                    setNewProject({ ...newProject, wbs: e.target.value })
                  }
                  placeholder="เช่น I-63-I-..."
                />
              </div>
              <div>
                <label className="form-label">👷 ผู้ควบคุมงาน</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProject.supervisor}
                  onChange={(e) =>
                    setNewProject({ ...newProject, supervisor: e.target.value })
                  }
                  placeholder="ชื่อผู้คุมงาน"
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">📝 ชื่องานโครงการ *</label>
              <textarea
                className="form-control"
                rows={2}
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="เช่น ยน.ขยายเขต..."
              ></textarea>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label className="form-label">ประเภทโครงการ</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProject.project_type}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      project_type: e.target.value,
                    })
                  }
                  placeholder="เช่น ขยายเขต"
                />
              </div>
              <div>
                <label className="form-label">มูลค่างาน (บาท)</label>
                <input
                  type="number"
                  className="form-control"
                  value={newProject.value}
                  onChange={(e) =>
                    setNewProject({ ...newProject, value: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="form-label">📅 ปีที่เปิดงาน</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProject.open_year}
                  onChange={(e) =>
                    setNewProject({ ...newProject, open_year: e.target.value })
                  }
                  placeholder="เช่น 2567"
                />
              </div>
              <div>
                <label className="form-label">🚨 สาย ป. ติดตาม</label>
                <select
                  className="form-select"
                  value={newProject.p_tracking}
                  onChange={(e) =>
                    setNewProject({ ...newProject, p_tracking: e.target.value })
                  }
                >
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="ติดตาม">ติดตาม (ทั่วไป)</option>
                  <option value="งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม">
                    งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม
                  </option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "20px",
              }}
            >
              <button
                className="btn"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "#f1f5f9", color: "var(--text-dark)" }}
              >
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddNewProject}
                disabled={addLoading || !newProject.wbs || !newProject.name}
              >
                {addLoading ? "กำลังบันทึก..." : "💾 บันทึกงานใหม่"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isScrapModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card animation-fade-in" style={{ width: '100%', maxWidth: '500px', margin: 0, position: 'relative', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button
              onClick={() => router.push('/update?step=2')}
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>X</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f5eff5', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '24px' }}>🧮</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>โปรแกรมคำนวณเศษสายไฟฟ้า</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>คำนวณน้ำหนักและความยาวของเศษสายได้อย่างรวดเร็ว</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>เลือกประเภทสาย / รหัสพัสดุ</label>
                <select
                  className="form-select"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', outline: 'none', fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}
                  value={calcWireId}
                  onChange={handleCalcWireChange}
                >
                  <option value="">-- เลือกสายไฟฟ้า --</option>
                  {wireDataList.map(w => (
                    <option key={w.id} value={w.id}>[{w.id}] {w.name} ({w.category})</option>
                  ))}
                </select>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', height: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  {selectedCalcWire ? (
                    <>
                      <span>น้ำหนักต่อเมตร: <span style={{ fontWeight: '600', color: '#3b82f6' }}>{selectedCalcWire.weightPerMeter}</span> กก./เมตร</span>
                      <span style={{ color: '#94a3b8' }}>{selectedCalcWire.category}</span>
                    </>
                  ) : ""}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f1f5f9', padding: '16px', borderRadius: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>ความยาว (เมตร)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      placeholder="0"
                      style={{ width: '100%', padding: '10px 16px', paddingRight: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: calcActiveInput === 'length' ? '#0f172a' : '#ef4444', fontWeight: calcActiveInput !== 'length' && calcLength ? '700' : '500', fontSize: '1rem' }}
                      value={calcLength}
                      onChange={handleCalcLengthChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>ม.</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>น้ำหนัก (กิโลกรัม)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      placeholder="0"
                      style={{ width: '100%', padding: '10px 16px', paddingRight: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: calcActiveInput === 'weight' ? '#0f172a' : '#ef4444', fontWeight: calcActiveInput !== 'weight' && calcWeight ? '700' : '500', fontSize: '1rem' }}
                      value={calcWeight}
                      onChange={handleCalcWeightChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>กก.</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>% ค่าเผื่อสาย (เพื่อความยืดหยุ่น)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min="0" max="120" step="1"
                    style={{ flex: 1, accentColor: '#7e22ce' }}
                    value={calcPercentage || "0"}
                    onChange={(e) => handleCalcPercentageChange(e as any)}
                    disabled={!selectedCalcWire}
                  />
                  <div style={{ position: 'relative', width: '80px' }}>
                    <input
                      type="number"
                      style={{ width: '100%', padding: '8px 12px', paddingRight: '24px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', outline: 'none', color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}
                      value={calcPercentage}
                      onChange={handleCalcPercentageChange}
                      disabled={!selectedCalcWire}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <button onClick={() => router.push('/update?step=2')} style={{ width: '100%', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>ปิดหน้าต่างนี้</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
