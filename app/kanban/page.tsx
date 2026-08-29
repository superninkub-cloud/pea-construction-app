"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";
import TopBar from "../components/TopBar";
import { Loader2 } from "lucide-react";

const COLUMNS = ["ไม่ได้กำหนด", "D1", "D2", "C1", "C2", "C3", "C4", "F1", "F2", "F3", "F4"];

export default function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("wbs", { ascending: true });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
    setTimeout(() => {
      // Small delay to let the drag ghost image render before hiding the original
      if(e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProject(null);
    if(e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedProject) return;
    if (draggedProject.status === newStatus) return; // No change

    // Optimistic UI update
    const previousProjects = [...projects];
    const updatedProjects = projects.map(p => 
      p.id === draggedProject.id ? { ...p, status: newStatus } : p
    );
    setProjects(updatedProjects);
    setSaving(true);

    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", draggedProject.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating status:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      // Revert on error
      setProjects(previousProjects);
    } finally {
      setSaving(false);
      setDraggedProject(null);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="กระดานสถานะงาน (Kanban Board)" />
        <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader2 className="animate-spin" /> กำลังโหลดข้อมูล...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="กระดานสถานะงาน (Kanban Board)" />
      
      <div className="content-area" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-light)', margin: 0 }}>
            ลากการ์ด WBS แล้วไปปล่อยในคอลัมน์สถานะที่ต้องการ เพื่ออัปเดตสถานะทันที
          </p>
          {saving && <span style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={16} className="animate-spin"/> กำลังบันทึก...</span>}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          overflowX: 'auto', 
          flex: 1, 
          paddingBottom: '16px' 
        }}>
          {COLUMNS.map(columnStatus => {
            const columnProjects = projects.filter(p => {
              const s = p.status || "ไม่ได้กำหนด";
              return s === columnStatus;
            });

            return (
              <div 
                key={columnStatus}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columnStatus)}
                style={{
                  minWidth: '280px',
                  width: '280px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  borderBottom: '2px solid',
                  borderBottomColor: columnStatus === 'F4' ? '#10b981' : 'var(--pea-purple)',
                  paddingBottom: '8px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {columnStatus}
                  </h3>
                  <span style={{ 
                    background: '#e2e8f0', 
                    color: '#64748b', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {columnProjects.length}
                  </span>
                </div>

                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  paddingRight: '4px'
                }}>
                  {columnProjects.map(p => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p)}
                      onDragEnd={handleDragEnd}
                      style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0',
                        cursor: 'grab',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                      className="kanban-card hover-lift"
                    >
                      <div style={{ fontWeight: '700', color: 'var(--pea-purple)', fontSize: '1rem', marginBottom: '4px' }}>
                        {p.wbs}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-light)', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>👷 {p.supervisor}</span>
                        <span style={{ fontWeight: '600', color: '#047857' }}>฿{(Number(p.value)||0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {columnProjects.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0', fontSize: '0.9rem', border: '2px dashed #cbd5e1', borderRadius: '8px' }}>
                      วางการ์ดที่นี่
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .kanban-card:active {
          cursor: grabbing !important;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
}
