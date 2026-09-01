"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import TopBar from "../components/TopBar";
import { driversList, driverTypes } from "../../lib/vehicleData";
import "./GasReport.css";

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

export default function GasReportPage() {
  const [activeTab, setActiveTab] = useState("form");
  const [loading, setLoading] = useState(false);

  // Form State
  const [usageDate, setUsageDate] = useState("");
  const [selectedPlate, setSelectedPlate] = useState("");
  const [vehicleCode, setVehicleCode] = useState("");
  const [driverName, setDriverName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [odoStart, setOdoStart] = useState("");
  const [odoEnd, setOdoEnd] = useState("");
  const [machineHours, setMachineHours] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [repairDetails, setRepairDetails] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [notes, setNotes] = useState("");
  const [personnelList, setPersonnelList] = useState<any[]>([]);

  // Report State
  const [reportMonth, setReportMonth] = useState(thaiMonths[new Date().getMonth()]);
  const [reportYear, setReportYear] = useState((new Date().getFullYear() + 543).toString());
  const [reportPlate, setReportPlate] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [fetchingReports, setFetchingReports] = useState(false);

  useEffect(() => {
    // When plate changes, auto-fill driver
    if (selectedPlate) {
      const v = driversList.find(d => d.plate === selectedPlate);
      if (v) {
        setDriverName(v.driver);
      }
    }
  }, [selectedPlate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageDate || !selectedPlate || !driverName) {
      alert("กรุณากรอกข้อมูล วันที่, ทะเบียนรถ และ ผู้ขับขี่");
      return;
    }

    setLoading(true);
    try {
      const d = new Date(usageDate);
      const monthName = thaiMonths[d.getMonth()];
      const yearTh = (d.getFullYear() + 543).toString();

      const { error } = await supabase.from("gas_reports").insert({
        usage_date: usageDate,
        month_name: monthName,
        year_th: yearTh,
        license_plate: selectedPlate,
        vehicle_code: vehicleCode,
        driver_name: driverName,
        supervisor_name: supervisorName,
        work_location: workLocation,
        odo_start: odoStart ? parseFloat(odoStart) : null,
        odo_end: odoEnd ? parseFloat(odoEnd) : null,
        machine_hours: machineHours ? parseFloat(machineHours) : null,
        fuel_type: fuelType,
        fuel_liters: fuelLiters ? parseFloat(fuelLiters) : null,
        fuel_cost: fuelCost ? parseFloat(fuelCost) : null,
        repair_details: repairDetails,
        repair_cost: repairCost ? parseFloat(repairCost) : null,
        notes: notes
      });

      if (error) {
        console.error(error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
      } else {
        alert("บันทึกข้อมูลเรียบร้อย");
        // Reset some fields
        setWorkLocation("");
        setOdoStart("");
        setOdoEnd("");
        setMachineHours("");
        setFuelLiters("");
        setFuelCost("");
        setRepairDetails("");
        setRepairCost("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!reportMonth || !reportYear || !reportPlate) {
      alert("กรุณาเลือก เดือน, ปี และ ทะเบียนรถ ให้ครบถ้วน");
      return;
    }
    
    setFetchingReports(true);
    try {
      const { data, error } = await supabase
        .from("gas_reports")
        .select("*")
        .eq("month_name", reportMonth)
        .eq("year_th", reportYear)
        .eq("license_plate", reportPlate)
        .order("usage_date", { ascending: true });

      if (error) {
        console.error(error);
        alert("ดึงข้อมูลล้มเหลว: " + error.message);
      } else {
        setReports(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingReports(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDayOnly = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).getDate().toString();
  };

  return (
    <>
      <TopBar title="รายงานน้ำมัน (ยพ.6)" />
      <div className="content-area" style={{ padding: "20px" }}>
        <div className="gas-report-container">
          <h2 className="no-print" style={{ marginBottom: "20px", color: "#1e293b" }}>รายงานการใช้น้ำมัน (ยพ.6)</h2>

          <div className="gas-tabs no-print">
            <div 
              className={`gas-tab ${activeTab === "form" ? "active" : ""}`}
              onClick={() => setActiveTab("form")}
            >
              บันทึกประจำวัน
            </div>
            <div 
              className={`gas-tab ${activeTab === "report" ? "active" : ""}`}
              onClick={() => setActiveTab("report")}
            >
              รายงาน (ยพ.6)
            </div>
          </div>

          {activeTab === "form" && (
            <form onSubmit={handleSubmit} className="gas-form-grid">
              <div className="gas-form-group">
                <label>วันที่ *</label>
                <input type="date" value={usageDate} onChange={e => setUsageDate(e.target.value)} required />
              </div>

              <div className="gas-form-group">
                <label>ทะเบียนรถ *</label>
                <select value={selectedPlate} onChange={e => setSelectedPlate(e.target.value)} required>
                  <option value="">-- เลือกทะเบียน --</option>
                  {driversList.map(v => (
                    <option key={v.plate} value={v.plate}>{v.plate} - {v.desc}</option>
                  ))}
                </select>
              </div>

              <div className="gas-form-group">
                <label>ผู้ขับขี่ *</label>
                <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} required />
              </div>

              <div className="gas-form-group">
                <label>รหัสรถ / หมายเลข กฟภ.</label>
                <input type="text" value={vehicleCode} onChange={e => setVehicleCode(e.target.value)} placeholder="ระบุถ้่ามี" />
              </div>

              <div className="gas-form-group" style={{ gridColumn: "1 / -1" }}>
                <label>สถานที่ปฏิบัติงาน (ไป-กลับ)</label>
                <input type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>เลขไมล์ (เริ่มต้น)</label>
                <input type="number" step="0.1" value={odoStart} onChange={e => setOdoStart(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>เลขไมล์ (สิ้นสุด)</label>
                <input type="number" step="0.1" value={odoEnd} onChange={e => setOdoEnd(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>ชั่วโมงการทำงาน (เครื่องจักร)</label>
                <input type="number" step="0.1" value={machineHours} onChange={e => setMachineHours(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>ชนิดเชื้อเพลิง</label>
                <select value={fuelType} onChange={e => setFuelType(e.target.value)}>
                  <option value="">-- เลือกชนิดเชื้อเพลิง --</option>
                  <option value="ดีเซล">ดีเซล</option>
                  <option value="แก๊สโซฮอล์ 95">แก๊สโซฮอล์ 95</option>
                  <option value="แก๊สโซฮอล์ 91">แก๊สโซฮอล์ 91</option>
                  <option value="แก๊สโซฮอล์ E20">แก๊สโซฮอล์ E20</option>
                  <option value="น้ำมันหล่อลื่น">น้ำมันหล่อลื่น</option>
                </select>
              </div>

              <div className="gas-form-group">
                <label>ปริมาณน้ำมัน (ลิตร)</label>
                <input type="number" step="0.01" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>จำนวนเงินค่าน้ำมัน (บาท)</label>
                <input type="number" step="0.01" value={fuelCost} onChange={e => setFuelCost(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>รายการซ่อม</label>
                <input type="text" value={repairDetails} onChange={e => setRepairDetails(e.target.value)} />
              </div>

              <div className="gas-form-group">
                <label>ค่าซ่อม (บาท)</label>
                <input type="number" step="0.01" value={repairCost} onChange={e => setRepairCost(e.target.value)} />
              </div>

              <div className="gas-form-group" style={{ gridColumn: "1 / -1" }}>
                <label>หมายเหตุ (ใส่หมายเลขงาน WBS)</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <button type="submit" className="gas-submit-btn" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "report" && (
            <div>
              <div className="gas-report-header no-print">
                <div className="gas-report-filters">
                  <select value={reportMonth} onChange={e => setReportMonth(e.target.value)}>
                    {thaiMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  
                  <select value={reportYear} onChange={e => setReportYear(e.target.value)}>
                    {Array.from({length: 5}).map((_, i) => {
                      const y = (new Date().getFullYear() + 543 - i).toString();
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>

                  <select value={reportPlate} onChange={e => setReportPlate(e.target.value)}>
                    <option value="">-- เลือกทะเบียน --</option>
                    {driversList.map(v => (
                      <option key={v.plate} value={v.plate}>{v.plate}</option>
                    ))}
                  </select>

                  <button 
                    onClick={fetchReports} 
                    disabled={fetchingReports}
                    style={{ background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                  >
                    {fetchingReports ? "กำลังดึงข้อมูล..." : "ค้นหา"}
                  </button>
                </div>
                
                <button className="print-btn" onClick={handlePrint} disabled={reports.length === 0}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  พิมพ์ / PDF
                </button>
              </div>

              {reports.length > 0 ? (
                <div id="printable-report">
                  {Array.from({ length: Math.ceil(reports.length / 10) || 1 }).map((_, pageIndex) => {
                    const chunk = reports.slice(pageIndex * 10, (pageIndex + 1) * 10);
                    return (
                      <div key={pageIndex} className="official-form" style={{ pageBreakAfter: pageIndex < Math.ceil(reports.length / 10) - 1 ? 'always' : 'auto', position: 'relative', height: '190mm', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                          <img src="/PEA-Logo.png" alt="PEA" style={{ width: '80px' }} onError={(e) => (e.currentTarget as any).style.display = 'none'} />
                        </div>
                        <div className="form-header text-center" style={{ marginBottom: '24px' }}>
                          <div style={{ fontSize: '28px', marginBottom: '8px' }}>การไฟฟ้าส่วนภูมิภาค</div>
                          <div style={{ fontSize: '24px' }}>แบบฟอร์มรายงานการใช้ยานพาหนะหรือเครื่องจักร</div>
                        </div>

                        <div className="form-body">
                          <div className="form-row flex-between">
                            <div className="flex-1 flex-start">
                              <span style={{ width: '40px' }}>จาก</span>
                              <span className="dotted-blank text-center" style={{ flex: 1, maxWidth: '250px' }}>ผกร.กรย.(ก3)</span>
                            </div>
                            <div className="flex-1 flex-start" style={{ marginLeft: '40px' }}>
                              <span>ถึง (หัวหน้าหน่วยงาน)</span>
                              <span className="dotted-blank text-center" style={{ flex: 1, maxWidth: '250px' }}>กรย.(ก3)</span>
                            </div>
                          </div>

                          <div className="form-row flex-start">
                            <span style={{ minWidth: '320px' }}>เรื่อง รายงานการใช้ยานพาหนะหรือเครื่องจักร</span>
                            <span className="ml-4">วันที่</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                            <span className="ml-2">เดือน</span>
                            <span className="dotted-blank text-center" style={{ width: '150px' }}></span>
                            <span className="ml-2">ปี</span>
                            <span className="dotted-blank text-center" style={{ width: '120px' }}></span>
                          </div>

                          <div className="form-row flex-start">
                            <span style={{ width: '40px' }}>เรียน</span>
                            <span className="dotted-blank text-center" style={{ width: '400px' }}>อก.รย.(ก3)</span>
                          </div>

                          <div className="form-row flex-start flex-wrap">
                            <span>รายงานการใช้ยานพาหนะหรือเครื่องจักร ประจำเดือน</span>
                            <span className="dotted-blank text-center" style={{ width: '120px' }}>{reportMonth}</span>
                            <span className="ml-2">พ.ศ.</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}>{reportYear}</span>
                            <span className="ml-2">หมายเลขทะเบียน</span>
                            <span className="dotted-blank text-center" style={{ width: '120px' }}>{reportPlate}</span>
                            <span className="ml-2">รหัส</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                            <span className="ml-2">ประเภท</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                            <span className="ml-2">ชนิด</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                          </div>
                          
                          <div className="form-row dotted-line-full"></div>

                          <div className="form-row flex-start flex-wrap fuel-checkboxes" style={{ marginTop: '16px' }}>
                            <span style={{ marginRight: '8px' }}>ชนิดของเชื้อเพลิง</span>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ 95</label>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ 91</label>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ E20</label>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ E85</label>
                            <label><input type="checkbox" /> ดีเซล</label>
                            <label><input type="checkbox" /> น้ำมันหล่อลื่น จำนวน</label>
                            <span className="dotted-blank" style={{ width: '100px' }}></span>
                            <span>ลิตร</span>
                          </div>

                          <div className="form-row flex-start">
                            <span>อัตราการสิ้นเปลืองเชื้อเพลิงยานพาหนะ</span>
                            <span className="dotted-blank" style={{ width: '200px' }}></span>
                            <span>กิโลเมตร/ลิตร, เครื่องจักร</span>
                            <span className="dotted-blank" style={{ width: '200px' }}></span>
                            <span>ลิตร/ชั่วโมง</span>
                          </div>
                        </div>

                        <table className="official-table" style={{ flex: 1 }}>
                          <thead>
                            <tr>
                              <th rowSpan={2} style={{ width: '50px' }}>วันที่</th>
                              <th rowSpan={2} style={{ width: '120px' }}>ชื่อผู้ขับ<br/>(ผู้ควบคุม)</th>
                              <th rowSpan={2}>สถานที่ปฏิบัติงาน</th>
                              <th colSpan={2} style={{ width: '120px' }}>เลขระยะทาง</th>
                              <th rowSpan={2} style={{ width: '90px' }}>ชั่วโมงการทำงาน<br/>ของเครื่องจักร</th>
                              <th rowSpan={2} style={{ width: '90px' }}>จำนวนเชื้อเพลิง<br/>ที่เติม (ลิตร)</th>
                              <th rowSpan={2} style={{ width: '80px' }}>จำนวนเงิน<br/>(บาท)</th>
                              <th rowSpan={2} style={{ width: '120px' }}>รายการซ่อม</th>
                              <th rowSpan={2} style={{ width: '80px' }}>จำนวนเงิน<br/>(บาท)</th>
                            </tr>
                            <tr>
                              <th style={{ width: '60px' }}>ไป</th>
                              <th style={{ width: '60px' }}>กลับ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chunk.map((r, i) => (
                              <tr key={r.id}>
                                <td className="text-center">{getDayOnly(r.usage_date)}</td>
                                <td className="text-center">{r.driver_name}</td>
                                <td className="text-left">{r.work_location || ""}</td>
                                <td className="text-center">{r.odo_start || ""}</td>
                                <td className="text-center">{r.odo_end || ""}</td>
                                <td className="text-center">{r.machine_hours || ""}</td>
                                <td className="text-center">{r.fuel_liters || ""}</td>
                                <td className="text-right">{r.fuel_cost ? r.fuel_cost.toFixed(2) : ""}</td>
                                <td className="text-left">{r.repair_details || ""}</td>
                                <td className="text-right">{r.repair_cost ? r.repair_cost.toFixed(2) : ""}</td>
                              </tr>
                            ))}
                            {/* Fill up to exactly 10 rows per page */}
                            {Array.from({ length: 10 - chunk.length }).map((_, i) => (
                              <tr key={`empty-${i}`}>
                                <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr>
                              <td colSpan={6} className="text-right font-bold" style={{ paddingRight: '16px' }}>รวม</td>
                              <td className="text-center font-bold">
                                {chunk.reduce((sum, r) => sum + (r.fuel_liters || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.fuel_liters || 0), 0).toFixed(2) : ""}
                              </td>
                              <td className="text-right font-bold">
                                {chunk.reduce((sum, r) => sum + (r.fuel_cost || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.fuel_cost || 0), 0).toFixed(2) : ""}
                              </td>
                              <td></td>
                              <td className="text-right font-bold">
                                {chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0).toFixed(2) : ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <div style={{ marginTop: '8px', marginLeft: '40px', fontSize: '16px' }}>
                          จึงเรียนมาเพื่อโปรดทราบ
                        </div>

                        <div className="form-footer" style={{ marginTop: 'auto', paddingBottom: '20px' }}>
                          <div className="signature-section flex-between">
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.driver_name ? ` ${reports[0].driver_name} ` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.supervisor_name ? ` ${reports[0].supervisor_name} ` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>
                            </div>
                          </div>
                          <div className="form-code" style={{ position: 'absolute', bottom: '0', left: '0' }}>ยพ.6-ป.46</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b", background: "white", borderRadius: "8px" }}>
                  {fetchingReports ? "กำลังโหลดข้อมูล..." : "ไม่มีข้อมูลรายงาน กรุณาเลือกตัวกรองแล้วกดปุ่มค้นหา"}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
