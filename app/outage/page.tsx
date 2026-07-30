"use client";

import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function OutagePlan() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({ id: "", details: "", wbs: "", status: "หน่วยงานตนเอง" });
  const [loading, setLoading] = useState(false);

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Fetch plans
  const fetchPlans = async () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 12).toISOString().split('T')[0];
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 12).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from("outage_plans")
      .select("*")
      .gte("outage_date", start)
      .lte("outage_date", end);
      
    if (data && !error) setPlans(data);
  };

  useEffect(() => {
    fetchPlans();
  }, [currentDate]);

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDayClick = (day: number) => {
    if (!day) return;
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12);
    setSelectedDate(clickedDate);
    
    const dateStr = clickedDate.toISOString().split('T')[0];
    const existingPlan = plans.find(p => p.outage_date === dateStr);
    
    if (existingPlan) {
      setFormData({ id: existingPlan.id, details: existingPlan.details, wbs: existingPlan.wbs || "", status: existingPlan.status });
    } else {
      setFormData({ id: "", details: "", wbs: "", status: "หน่วยงานตนเอง" });
    }
    
    setIsModalOpen(true);
  };

  const savePlan = async () => {
    if (!selectedDate || !formData.details) return;
    setLoading(true);
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const payload = {
      outage_date: dateStr,
      details: formData.details,
      wbs: formData.wbs,
      status: formData.status
    };

    if (formData.id) {
      await supabase.from("outage_plans").update(payload).eq("id", formData.id);
    } else {
      await supabase.from("outage_plans").insert(payload);
    }
    
    setIsModalOpen(false);
    fetchPlans();
    setLoading(false);
  };

  const deletePlan = async () => {
    if (!formData.id) return;
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบแผนงานนี้?")) {
      setLoading(true);
      await supabase.from("outage_plans").delete().eq("id", formData.id);
      setIsModalOpen(false);
      fetchPlans();
      setLoading(false);
    }
  };

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  return (
    <>
      <TopBar title="ตารางแผนงานดับไฟ/แผนการใช้รถ/กิจกรรมอื่น ๆ" />
      <div className="content-area animation-fade-in">
        <div className="card">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--pea-purple)', fontSize: '1.5rem', fontWeight: 'bold' }}>
              เดือน{monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" onClick={prevMonth} style={{ padding: '8px', background: '#f1f5f9', color: '#334155' }}><ChevronLeft /></button>
              <button className="btn" onClick={nextMonth} style={{ padding: '8px', background: '#f1f5f9', color: '#334155' }}><ChevronRight /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-light)' }}>
            <div>อา.</div><div>จ.</div><div>อ.</div><div>พ.</div><div>พฤ.</div><div>ศ.</div><div>ส.</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {days.map((day, i) => {
              if (!day) return <div key={i} style={{ padding: '40px 10px', background: '#f8fafc', borderRadius: '12px' }} />;
              
              const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12).toISOString().split('T')[0];
              const dayPlans = plans.filter(p => p.outage_date === dateStr);
              
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              
              return (
                <div 
                  key={i} 
                  onClick={() => handleDayClick(day)}
                  style={{ 
                    padding: '10px', 
                    minHeight: '100px', 
                    background: isToday ? '#f3e8ff' : '#ffffff', 
                    border: isToday ? '2px solid var(--pea-purple)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--pea-purple)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = isToday ? 'var(--pea-purple)' : '#e2e8f0'}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: isToday ? 'var(--pea-purple)' : 'var(--text-dark)' }}>{day}</div>
                  
                  {/* Indicators */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayPlans.map((p, idx) => (
                      <div key={idx} style={{ 
                        fontSize: '0.75rem', 
                        background: p.status === 'หน่วยงานอื่น' ? '#fee2e2' : '#d1fae5', 
                        color: p.status === 'หน่วยงานอื่น' ? '#b91c1c' : '#065f46',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}>
                        {p.wbs ? <strong style={{display: 'block', marginBottom: '2px'}}>[{p.wbs}]</strong> : null}
                        {p.details}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card animation-fade-in" style={{ width: '100%', maxWidth: '500px', margin: 0, position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
            >
              <X />
            </button>
            
            <h3 style={{ color: 'var(--pea-purple)', marginBottom: '20px', fontWeight: 'bold' }}>
              แผนงานวันที่ {selectedDate?.getDate()} {monthNames[selectedDate?.getMonth() || 0]} {selectedDate ? selectedDate.getFullYear() + 543 : ''}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">📌 รหัส WBS / โครงการ (ถ้ามี)</label>
              <input type="text" className="form-control" value={formData.wbs} onChange={e => setFormData({...formData, wbs: e.target.value})} placeholder="เช่น I-63-..." />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">📝 ประเภทงาน และรายละเอียด *</label>
              <textarea className="form-control" rows={3} value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="ระบุว่าเป็น แผนดับไฟ, แผนใช้รถ หรือ กิจกรรมอื่นๆ พร้อมรายละเอียด..."></textarea>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">ปฏิบัติงานให้หน่วยงาน</label>
              <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="หน่วยงานตนเอง">หน่วยงานตนเอง</option>
                <option value="หน่วยงานอื่น">หน่วยงานอื่น</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {formData.id && (
                <button className="btn" onClick={deletePlan} disabled={loading} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  🗑️ ลบแผนงาน
                </button>
              )}
              <button className="btn" onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={savePlan} disabled={loading || !formData.details}>
                {loading ? "กำลังบันทึก..." : "💾 บันทึกแผนงาน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
