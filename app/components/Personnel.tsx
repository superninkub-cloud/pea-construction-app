"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Personnel } from "../../lib/types";

export default function PersonnelComponent() {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    phone: "",
    team: "อุดมศักดิ์",
    wage: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const teams = ["อุดมศักดิ์", "วีรพัฒน์", "ศุภวิชญ์", "ขวัญนคร", "ศราวุฒิ", "สังกัดแผนก"];

  useEffect(() => {
    setUserRole(sessionStorage.getItem("pea_role"));
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("personnel").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setPersonnelList(data as Personnel[]);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.full_name || !formData.position) {
      setMessage({ text: "กรุณากรอกชื่อและตำแหน่ง", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      let imageUrl = previewUrl && !file ? previewUrl : "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(`personnel/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('site-images')
          .getPublicUrl(`personnel/${fileName}`);

        imageUrl = publicUrl;
      }

      if (editId) {
        // Update existing
        const { error } = await supabase.from("personnel").update({
          full_name: formData.full_name,
          position: formData.position,
          phone: formData.phone,
          team: formData.team,
          wage: formData.wage,
          ...(imageUrl ? { image_url: imageUrl } : {}) // Update image only if we uploaded a new one or had a preview
        }).eq("id", editId);

        if (error) throw error;
        setMessage({ text: "แก้ไขข้อมูลสำเร็จ", type: "success" });
      } else {
        // Insert new
        const { error } = await supabase.from("personnel").insert([{
          full_name: formData.full_name,
          position: formData.position,
          phone: formData.phone,
          team: formData.team,
          wage: formData.wage,
          image_url: imageUrl,
        }]);

        if (error) throw error;
        setMessage({ text: "เพิ่มข้อมูลสำเร็จ", type: "success" });
      }

      setIsAddModalOpen(false);
      setEditId(null);
      setFormData({ full_name: "", position: "", phone: "", team: "อุดมศักดิ์", wage: "" });
      setFile(null);
      setPreviewUrl(null);
      fetchPersonnel();
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `ล้มเหลว: ${error.message}`, type: "error" });
    }
    setSubmitting(false);
  };

  const handleEditClick = (p: Personnel) => {
    setEditId(p.id);
    setFormData({
      full_name: p.full_name,
      position: p.position,
      phone: p.phone || "",
      team: p.team || "อุดมศักดิ์",
      wage: p.wage || "",
    });
    setPreviewUrl(p.image_url || null);
    setFile(null);
    setMessage({ text: "", type: "" });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ${name}?`)) return;
    
    try {
      const { error } = await supabase.from("personnel").delete().eq("id", id);
      if (error) throw error;
      fetchPersonnel();
    } catch (error: any) {
      alert(`ลบล้มเหลว: ${error.message}`);
    }
  };

  const filteredPersonnel = personnelList.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ color: "var(--pea-purple)", fontWeight: "700", margin: 0 }}>👥 ข้อมูลบุคลากร</h2>
        {userRole !== "guest" && (
          <button className="btn btn-primary" onClick={() => {
            setEditId(null);
            setFormData({ full_name: "", position: "", phone: "", team: "อุดมศักดิ์", wage: "" });
            setPreviewUrl(null);
            setFile(null);
            setIsAddModalOpen(true);
            setMessage({ text: "", type: "" });
          }}>
            + เพิ่มข้อมูลบุคลากร
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="ค้นหาชื่อ, ตำแหน่ง, หรือชุดงาน..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <div>
          {["สังกัดแผนก", "อุดมศักดิ์", "วีรพัฒน์", "ศุภวิชญ์", "ขวัญนคร", "ศราวุฒิ"].map(team => {
            let teamPersonnel = filteredPersonnel.filter(p => p.team === team);
            
            // Sort logic
            const getRank = (position: string) => {
              const p = position.toLowerCase();
              if (p.includes("ผู้ช่วยหัวหน้าแผนก") || p.includes("ผู้ช่วยหัวหน้า")) return 2;
              if (p.includes("หัวหน้าแผนก")) return 1;
              if (p.includes("หัวหน้า") || p.includes("ผจก") || p.includes("ผู้จัดการ")) return 3;
              
              if (p.includes("ระดับ 7") || p.includes("ระดับ7")) return 11;
              if (p.includes("ระดับ 6") || p.includes("ระดับ6")) return 12;
              if (p.includes("ระดับ 5") || p.includes("ระดับ5")) return 13;
              if (p.includes("ระดับ 4") || p.includes("ระดับ4")) return 14;
              if (p.includes("ระดับ 3") || p.includes("ระดับ3")) return 15;
              if (p.includes("ระดับ 2") || p.includes("ระดับ2")) return 16;
              if (p.includes("ระดับ 1") || p.includes("ระดับ1")) return 17;

              if (p.includes("ช่าง") || p.includes("พนักงานช่าง")) return 20;
              if (p.includes("ขับรถ")) return 30;
              return 40;
            };

            teamPersonnel.sort((a, b) => getRank(a.position) - getRank(b.position));

            if (teamPersonnel.length === 0) return null;

            const isCollapsed = collapsedTeams[team] || false;
            
            const toggleTeam = (teamName: string) => {
              setCollapsedTeams(prev => ({
                ...prev,
                [teamName]: !prev[teamName]
              }));
            };

            return (
              <div key={team} style={{ marginBottom: '40px' }}>
                <h3 
                  onClick={() => toggleTeam(team)}
                  style={{ cursor: 'pointer', margin: "0 0 16px 0", color: "var(--pea-purple)", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px", display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  {team === "สังกัดแผนก" ? "บุคลากร สังกัดแผนก" : `ทีมงานชุด: ${team}`}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', background: '#f1f5f9', padding: '2px 10px', borderRadius: '12px', marginLeft: 'auto' }}>
                    {teamPersonnel.length} คน
                  </span>
                  <div style={{ padding: '4px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px' }}>
                    {isCollapsed ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    )}
                  </div>
                </h3>
                
                {!isCollapsed && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {teamPersonnel.map(p => (
                      <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                      <div style={{ height: '220px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        )}
                      </div>
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontWeight: '700', fontSize: '1.1rem' }}>{p.full_name}</h4>
                        <div style={{ color: 'var(--pea-purple)', fontWeight: '600', marginBottom: '16px', fontSize: '0.95rem' }}>{p.position}</div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          {p.phone || "-"}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          สังกัด: {p.team}
                        </div>
                        {p.position.includes("พนักงาน บ") && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            ค่าแรง: {p.wage || "-"}
                          </div>
                        )}

                        {userRole === "admin" && (
                          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => handleEditClick(p)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              แก้ไข
                            </button>
                            <button onClick={() => handleDelete(p.id, p.full_name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              ลบข้อมูล
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredPersonnel.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              ไม่พบข้อมูลบุคลากรในระบบ
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--pea-purple)' }}>{editId ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มข้อมูลบุคลากร"}</h3>
            
            {message.text && (
              <div style={{ padding: "12px", borderRadius: "8px", background: message.type === "success" ? "#d1fae5" : "#fee2e2", color: message.type === "success" ? "#047857" : "#b91c1c", marginBottom: '16px' }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px dashed #cbd5e1", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: '12px' }}>📷 อัพโหลดรูปถ่ายประจำตัว</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} style={{ maxWidth: '300px' }} />
                {previewUrl && (
                  <div style={{ marginTop: "16px", textAlign: "center", width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">ชื่อ - นามสกุล *</label>
                <input type="text" className="form-control" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="เช่น นายสมชาย ใจดี" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">ตำแหน่ง *</label>
                  <input type="text" className="form-control" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} placeholder="เช่น พนักงานขับรถ, ช่างไฟ" />
                </div>
                <div>
                  <label className="form-label">เบอร์โทรศัพท์</label>
                  <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="08X-XXX-XXXX" />
                </div>
              </div>

              <div>
                <label className="form-label">สังกัดชุดงาน</label>
                <select className="form-select" value={formData.team} onChange={e => setFormData({ ...formData, team: e.target.value })}>
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {formData.position.includes("พนักงาน บ") && (
                <div>
                  <label className="form-label">ค่าแรง (บาท/วัน)</label>
                  <input type="text" className="form-control" value={formData.wage} onChange={e => setFormData({ ...formData, wage: e.target.value })} placeholder="เช่น 500" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button className="btn" onClick={() => setIsAddModalOpen(false)} style={{ background: '#f1f5f9', color: 'var(--text-dark)' }}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAddSubmit} disabled={submitting}>
                {submitting ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
