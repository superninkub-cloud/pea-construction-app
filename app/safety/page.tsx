"use client";

import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../../lib/supabaseClient";

export default function SafetyPlan() {
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('wbs', 'SAFETY_PLAN_2026')
      .single();

    if (data && data.remarks) {
      try {
        setProgress(JSON.parse(data.remarks));
        setProjectId(data.id);
      } catch (e) { }
    }
  };

  const toggleProgress = async (topicId: number, month: number) => {
    const key = `${topicId}_${month}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);

    const payload = {
      wbs: 'SAFETY_PLAN_2026',
      name: 'Safety Training Progress',
      remarks: JSON.stringify(newProgress)
    };

    if (projectId) {
      await supabase.from('projects').update(payload).eq('id', projectId);
    } else {
      const { data } = await supabase.from('projects').insert(payload).select().single();
      if (data) setProjectId(data.id);
    }
  };

  const trainingPlans = [
    { id: 1, topic: "การฝึกซ้อมการติดตั้งเครื่องมือต่อลงดิน", instructor: "นายวีรพัฒน์ นาคลมัย", months: [3, 5, 7, 9, 11] },
    { id: 2, topic: "การฝึกประกอบและติดตั้งอุปกรณ์หัวเสาแรงสูง", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [3, 5, 7, 9, 11] },
    { id: 3, topic: "การฝึกการจัดการทางจราจร การวางกรวยยาง", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [4, 6, 8, 10, 12] },
    { id: 4, topic: "การฝึกใช้สลิงจับเสา, การจับเสา, การบังคับเสา", instructor: "นายวีรพัฒน์ นาคลมัย", months: [5, 7, 9, 11] },
    { id: 5, topic: "การฝึกทดสอบแรงดันไฟฟ้า, การฝึกตรวจสอบเสาและอุปกรณ์หัวเสา...", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [6, 8, 10, 12] },
    { id: 6, topic: "ฝึกการพาดสายเปลือย, สาย SAC", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [7, 9, 11] },
    { id: 7, topic: "การฝึกอ่านแบบ, วัดระยะการก่อสร้าง, การฝึกใช้กล้องวัดระดับ", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [8, 10, 12] },
    { id: 8, topic: "การฝึกตีปรีฟอร์มสายส่ง 115 เควี", instructor: "นายวีรพัฒน์ นาคลมัย", months: [9, 11] },
    { id: 9, topic: "การฝึกปักเสาและการเล็งแนว เสา คอร. ขนาด 22 เมตร", instructor: "นายวีรพัฒน์ นาคลมัย", months: [10, 12] },
    { id: 10, topic: "การฝึกต่อสายด้วยหลอดต่อสาย (รับแรง, และไม่รับแรงดึง)", instructor: "นายวีรพัฒน์ นาคลมัย", months: [11] },
    { id: 11, topic: "การฝึกขุดหลุมปักเสา การใช้รถสว่าน", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [12] },
    
    { id: 12, topic: "การฝึกปีนเสาแรงสูงและทักษะการปฏิบัติงานบนเสาไฟฟ้า", instructor: "นายวีรพัฒน์ นาคลมัย", months: [3] },
    { id: 13, topic: "การฝึกตรวจเช็คสายกันตก", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [3] },
    { id: 14, topic: "การฝึกตรวจถุงมือแรงสูง", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [4] },
    { id: 15, topic: "การฝึกผูกขาปีนเสา", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [4] },
    { id: 16, topic: "การฝึกตรวจเช็คไม้ชักฟิวส์", instructor: "นายศุภวิชญ์ เกาะลอย", months: [5] },
    { id: 17, topic: "การฝึกให้สัญญาณมือ", instructor: "นายวีรพัฒน์ นาคลมัย", months: [5] },
    { id: 18, topic: "การฝึกตรวจสภาพรถเครน", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [6] },
    { id: 19, topic: "การฝึกตรวจเช็คสลิงยกเสา", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [6] },
    { id: 20, topic: "การฝึกวิเคราะห์จุดอันตราย", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [7] },
    { id: 21, topic: "การฝึกซ้อมการติดต่อสื่อสารและการฝึกประสานงานที่ดี (การ SWITCHING ดับไฟ)", instructor: "นายศุภวิชญ์ เกาะลอย", months: [7] },
    { id: 22, topic: "การฝึกใช้ Voltage Dectector", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [8] },
    { id: 23, topic: "การฝึก Short ground", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [8] },
    { id: 24, topic: "การฝึกปอกสายแรงสูง และพันสายแรงสูง", instructor: "นายศุภวิชญ์ เกาะลอย", months: [9] },
    { id: 25, topic: "การฝึกปฐมพยาบาลเบื้องต้น", instructor: "นายอุดมศักดิ์ จันทร์กลิ่น", months: [9] },
    { id: 26, topic: "การฝึกผูกกระเช้าติดปลายเครน", instructor: "นายศุภวิชญ์ เกาะลอย", months: [10] },
    
    { id: 27, topic: "การฝึกเปลี่ยน / ผูกลูกถ้วยแรงสูง, ลูกถ้วยแขวน", instructor: "นายขวัญนคร ศรีจันทร์อินทร์", months: [10] },
    { id: 28, topic: "การฝึกคล้องสายกันตก", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [11] },
    { id: 29, topic: "การฝึกตรวจสอบประเมินเสาไฟฟ้าก่อนปฏิบัติงาน", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [11] },
    { id: 30, topic: "ฝึกปฏิบัติงานบนเสาแรงต่ำที่มีอายุมากกว่า 30 ปี และเสาที่อยู่ในสภาพผิดปกติ...", instructor: "นายศราวุฒิ เกิดสีเล็ก", months: [12] }
  ];

  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const filteredPlans = trainingPlans.filter(plan => 
    plan.topic.includes(search) || plan.instructor.includes(search)
  );

  return (
    <>
      <TopBar title="แผนฝึกซ้อม/ทบทวนความตระหนักด้านความปลอดภัย ประจำปี 2569" />
      <div className="content-area animation-fade-in">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--pea-purple)', fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>
              🛡️ แผนฝึกซ้อมขั้นตอนการปฏิบัติงาน ของ กรย.(ก3) ปี 2569
            </h2>
            <div style={{ width: '300px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="🔎 ค้นหาหัวข้อฝึก หรือ ชื่อผู้ฝึกสอน..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive" style={{ padding: 0 }}>
            <table className="table-custom" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '35%' }}>แผนงาน / หัวข้อการฝึก</th>
                  {monthNames.map((m, i) => (
                    <th key={i} style={{ width: '4%', textAlign: 'center', fontSize: '0.85rem' }}>{m}</th>
                  ))}
                  <th style={{ width: '12%', textAlign: 'center' }}>ผู้ฝึกสอน</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.length > 0 ? filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-light)' }}>{plan.id}</td>
                    <td style={{ fontWeight: '500', color: 'var(--text-dark)' }}>{plan.topic}</td>
                    {monthNames.map((m, i) => {
                      const isScheduled = plan.months.includes(i + 1);
                      const key = `${plan.id}_${i + 1}`;
                      const isCompleted = progress[key];

                      return (
                        <td key={i} style={{ textAlign: 'center', padding: '4px 2px', verticalAlign: 'middle' }}>
                          {isScheduled && (
                            <div style={{
                              background: '#dcfce7', // light green indicating plan
                              border: '1px solid #86efac',
                              borderRadius: '6px',
                              padding: '4px',
                              display: 'flex',
                              justifyContent: 'center',
                              margin: '0 auto',
                              width: '32px'
                            }} title="แผนที่กำหนดไว้">
                              <div 
                                onClick={() => toggleProgress(plan.id, i + 1)}
                                style={{ 
                                  background: isCompleted ? 'var(--pea-green)' : 'white',
                                  color: isCompleted ? 'white' : 'transparent', 
                                  border: isCompleted ? '2px solid var(--pea-green)' : '2px solid #94a3b8',
                                  borderRadius: '4px', 
                                  width: '20px', 
                                  height: '20px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}>
                                ✓
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--pea-purple)' }}>{plan.instructor}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={15} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>ไม่พบข้อมูลที่ค้นหา</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
