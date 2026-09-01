\"use client\";

import { useState, useEffect } from \"react\";
import { supabase } from \"../../lib/supabaseClient\";
import TopBar from \"../components/TopBar\";
import { driversList, driverTypes } from \"../../lib/vehicleData\";
import \"./GasReport.css\";

const thaiMonths = [
  \"มกราคม\", \"กุมภาพันธ์\", \"มีนาคม\", \"เมษายน\", \"พฤษภาคม\", \"มิถุนายน\",
  \"กรกฎาคม\", \"สิงหาคม\", \"กันยายน\", \"ตุลาคม\", \"พฤศจิกายน\", \"ธันวาคม\"
];

export default function GasReportPage() {
  const [activeTab, setActiveTab] = useState(\"form\");
  const [loading, setLoading] = useState(false);

  // Form State
  const [usageDate, setUsageDate] = useState(\"\");
  const [selectedPlate, setSelectedPlate] = useState(\"\");
  const [vehicleCode, setVehicleCode] = useState(\"\");
  const [driverName, setDriverName] = useState(\"\");
  const [supervisorName, setSupervisorName] = useState(\"\");
  const [workLocation, setWorkLocation] = useState(\"\");
  const [odoStart, setOdoStart] = useState(\"\");
  const [odoEnd, setOdoEnd] = useState(\"\");
  const [machineHours, setMachineHours] = useState(\"\");
  const [fuelType, setFuelType] = useState(\"\");
  const [fuelLiters, setFuelLiters] = useState(\"\");
  const [fuelCost, setFuelCost] = useState(\"\");
  const [repairDetails, setRepairDetails] = useState(\"\");
  const [repairCost, setRepairCost] = useState(\"\");
  const [notes, setNotes] = useState(\"\");

  // Report State
  const [reportMonth, setReportMonth] = useState(thaiMonths[new Date().getMonth()]);
  const [reportYear, setReportYear] = useState((new Date().getFullYear() + 543).toString());
  const [reportPlate, setReportPlate] = useState(\"\");
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
      alert(\"กรุณากรอกข้อมูล วันที่, ทะเบียนรถ และ ผู้ขับขี่\");
      return;
    }

    setLoading(true);
    try {
      const d = new Date(usageDate);
      const monthName = thaiMonths[d.getMonth()];
      const yearTh = (d.getFullYear() + 543).toString();

      const { error } = await supabase.from(\"gas_reports\").insert({
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
        alert(\"เกิดข้อผิดพลาดในการบันทึกข้อมูล: \" + error.message);
      } else {
        alert(\"บันทึกข้อมูลเรียบร้อย\");
        // Reset some fields
        setWorkLocation(\"\");
        setOdoStart(\"\");
        setOdoEnd(\"\");
        setMachineHours(\"\");
        setFuelLiters(\"\");
        setFuelCost(\"\");
        setRepairDetails(\"\");
        setRepairCost(\"\");
        setNotes(\"\");
      }
    } catch (err) {
      console.error(err);
      alert(\"เกิดข้อผิดพลาดในการบันทึกข้อมูล\");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!reportMonth || !reportYear || !reportPlate) {
      alert(\"กรุณาเลือก เดือน, ปี และ ทะเบียนรถ ให้ครบถ้วน\");
      return;
    }
    
    setFetchingReports(true);
    try {
      const { data, error } = await supabase
        .from(\"gas_reports\")
        .select(\"*\")
        .eq(\"month_name\", reportMonth)
        .eq(\"year_th\", reportYear)
        .eq(\"license_plate\", reportPlate)
        .order(\"usage_date\", { ascending: true });

      if (error) {
        console.error(error);
        alert(\"ดึงข้อมูลล้มเหลว: \" + error.message);
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
    if (!dateStr) return \"\";
    return new Date(dateStr).getDate().toString();
  };

  return (
    <div className=\"app-container\">
      <TopBar />
      <div className=\"main-content\" style={{ padding: \"20px\" }}>
        <div className=\"gas-report-container\">
          <h2 style={{ marginBottom: \"20px\", color: \"#1e293b\" }}>รายงานการใช้น้ำมัน (ยพ.6)</h2>

          <div className=\"gas-tabs no-print\">
            <div 
              className={`gas-tab ${activeTab === \"form\" ? \"active\" : \"\"}`}
              onClick={() => setActiveTab(\"form\")}
            >
              บันทึกประจำวัน
            </div>
            <div 
              className={`gas-tab ${activeTab === \"report\" ? \"active\" : \"\"}`}
              onClick={() => setActiveTab(\"report\")}
            >
              รายงาน (ยพ.6)
            </div>
          </div>

          {activeTab === \"form\" && (
            <form onSubmit={handleSubmit} className=\"gas-form-grid\">
              <div className=\"gas-form-group\">
                <label>วันที่ *</label>
                <input type=\"date\" value={usageDate} onChange={e => setUsageDate(e.target.value)} required />
              </div>

              <div className=\"gas-form-group\">
                <label>ทะเบียนรถ *</label>
                <select value={selectedPlate} onChange={e => setSelectedPlate(e.target.value)} required>
                  <option value=\"\">-- เลือกทะเบียน --</option>
                  {driversList.map(v => (
                    <option key={v.plate} value={v.plate}>{v.plate} - {v.desc}</option>
                  ))}
                </select>
              </div>

              <div className=\"gas-form-group\">
                <label>ผู้ขับขี่ *</label>
                <input type=\"text\" value={driverName} onChange={e => setDriverName(e.target.value)} required />
              </div>

              <div className=\"gas-form-group\">
                <label>รหัสรถ / หมายเลข กฟภ.</label>
                <input type=\"text\" value={vehicleCode} onChange={e => setVehicleCode(e.target.value)} placeholder=\"ระบุถ้่ามี\" />
              </div>

              <div className=\"gas-form-group\" style={{ gridColumn: \"1 / -1\" }}>
                <label>สถานที่ปฏิบัติงาน (ไป-กลับ)</label>
                <input type=\"text\" value={workLocation} onChange={e => setWorkLocation(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>เลขไมล์ (เริ่มต้น)</label>
                <input type=\"number\" step=\"0.1\" value={odoStart} onChange={e => setOdoStart(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>เลขไมล์ (สิ้นสุด)</label>
                <input type=\"number\" step=\"0.1\" value={odoEnd} onChange={e => setOdoEnd(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>ชั่วโมงการทำงาน (เครื่องจักร)</label>
                <input type=\"number\" step=\"0.1\" value={machineHours} onChange={e => setMachineHours(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>ชนิดเชื้อเพลิง</label>
                <select value={fuelType} onChange={e => setFuelType(e.target.value)}>
                  <option value=\"\">-- เลือกชนิดเชื้อเพลิง --</option>
                  <option value=\"ดีเซล\">ดีเซล</option>
                  <option value=\"แก๊สโซฮอล์ 95\">แก๊สโซฮอล์ 95</option>
                  <option value=\"แก๊สโซฮอล์ 91\">แก๊สโซฮอล์ 91</option>
                  <option value=\"แก๊สโซฮอล์ E20\">แก๊สโซฮอล์ E20</option>
                  <option value=\"น้ำมันหล่อลื่น\">น้ำมันหล่อลื่น</option>
                </select>
              </div>

              <div className=\"gas-form-group\">
                <label>ปริมาณน้ำมัน (ลิตร)</label>
                <input type=\"number\" step=\"0.01\" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>จำนวนเงินค่าน้ำมัน (บาท)</label>
                <input type=\"number\" step=\"0.01\" value={fuelCost} onChange={e => setFuelCost(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>รายการซ่อม</label>
                <input type=\"text\" value={repairDetails} onChange={e => setRepairDetails(e.target.value)} />
              </div>

              <div className=\"gas-form-group\">
                <label>ค่าซ่อม (บาท)</label>
                <input type=\"number\" step=\"0.01\" value={repairCost} onChange={e => setRepairCost(e.target.value)} />
              </div>

              <div className=\"gas-form-group\" style={{ gridColumn: \"1 / -1\" }}>
                <label>หมายเหตุ</label>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
              </div>

              <div style={{ gridColumn: \"1 / -1\" }}>
                <button type=\"submit\" className=\"gas-submit-btn\" disabled={loading}>
                  {loading ? \"กำลังบันทึก...\" : \"บันทึกข้อมูล\"}
                </button>
              </div>
            </form>
          )}

          {activeTab === \"report\" && (
            <div>
              <div className=\"gas-report-header no-print\">
                <div className=\"gas-report-filters\">
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
                    <option value=\"\">-- เลือกทะเบียน --</option>
                    {driversList.map(v => (
                      <option key={v.plate} value={v.plate}>{v.plate}</option>
                    ))}
                  </select>

                  <button 
                    onClick={fetchReports} 
                    disabled={fetchingReports}
                    style={{ background: \"#3b82f6\", color: \"white\", padding: \"8px 16px\", borderRadius: \"6px\", border: \"none\", cursor: \"pointer\" }}
                  >
                    {fetchingReports ? \"กำลังดึงข้อมูล...\" : \"ค้นหา\"}
                  </button>
                </div>
                
                <button className=\"print-btn\" onClick={handlePrint} disabled={reports.length === 0}>
                  <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><polyline points=\"6 9 6 2 18 2 18 9\"></polyline><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect></svg>
                  พิมพ์ / PDF
                </button>
              </div>

              {reports.length > 0 ? (
                <div id=\"printable-report\" className=\"report-table-wrapper\">
                  <div style={{ textAlign: \"center\", marginBottom: \"16px\", fontWeight: \"bold\" }}>
                    แบบรายงานการใช้น้ำมันเชื้อเพลิงและหล่อลื่น (ยพ.6-ป.46)<br/>
                    ประจำเดือน {reportMonth} ปี {reportYear} รถทะเบียน {reportPlate}
                  </div>
                  <table className=\"gas-table\">
                    <thead>
                      <tr>
                        <th rowSpan={2}>วันที่</th>
                        <th rowSpan={2}>สถานที่ไปปฏิบัติงาน/เหตุผล</th>
                        <th colSpan={3}>มิเตอร์/กม. (ชม.)</th>
                        <th colSpan={4}>รับเชื้อเพลิง/ลิตร (บาท)</th>
                        <th colSpan={2}>ค่าซ่อมบำรุง</th>
                        <th rowSpan={2}>พนักงานขับรถ</th>
                        <th rowSpan={2}>หมายเหตุ</th>
                      </tr>
                      <tr>
                        <th>ก่อนเดินทาง</th>
                        <th>หลังเดินทาง</th>
                        <th>ระยะทาง</th>
                        <th>ชนิด</th>
                        <th>ลิตร</th>
                        <th>ราคา/ลิตร</th>
                        <th>จำนวนเงิน</th>
                        <th>รายการซ่อม</th>
                        <th>จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r, i) => {
                        const distance = (r.odo_start && r.odo_end) ? (r.odo_end - r.odo_start).toFixed(1) : \"\";
                        const pricePerLiter = (r.fuel_cost && r.fuel_liters && r.fuel_liters > 0) ? (r.fuel_cost / r.fuel_liters).toFixed(2) : \"\";
                        return (
                          <tr key={r.id}>
                            <td>{getDayOnly(r.usage_date)}</td>
                            <td className=\"text-left\">{r.work_location || \"-\"}</td>
                            <td>{r.odo_start || \"-\"}</td>
                            <td>{r.odo_end || \"-\"}</td>
                            <td>{distance || \"-\"}</td>
                            <td>{r.fuel_type || \"-\"}</td>
                            <td>{r.fuel_liters || \"-\"}</td>
                            <td>{pricePerLiter || \"-\"}</td>
                            <td>{r.fuel_cost || \"-\"}</td>
                            <td>{r.repair_details || \"-\"}</td>
                            <td>{r.repair_cost || \"-\"}</td>
                            <td>{r.driver_name}</td>
                            <td>{r.notes || \"-\"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={2} style={{ textAlign: \"right\" }}>รวมทั้งสิ้น</th>
                        <th></th>
                        <th></th>
                        <th>{reports.reduce((sum, r) => sum + ((r.odo_end && r.odo_start) ? (r.odo_end - r.odo_start) : 0), 0).toFixed(1) || \"0.0\"}</th>
                        <th></th>
                        <th>{reports.reduce((sum, r) => sum + (r.fuel_liters || 0), 0).toFixed(2) || \"0.00\"}</th>
                        <th></th>
                        <th>{reports.reduce((sum, r) => sum + (r.fuel_cost || 0), 0).toFixed(2) || \"0.00\"}</th>
                        <th></th>
                        <th>{reports.reduce((sum, r) => sum + (r.repair_cost || 0), 0).toFixed(2) || \"0.00\"}</th>
                        <th colSpan={2}></th>
                      </tr>
                    </tfoot>
                  </table>
                  <div style={{ display: \"flex\", justifyContent: \"space-around\", marginTop: \"40px\" }}>
                    <div style={{ textAlign: \"center\" }}>
                      ลงชื่อ......................................................<br/><br/>
                      (......................................................)<br/>
                      ผู้ควบคุมรถ
                    </div>
                    <div style={{ textAlign: \"center\" }}>
                      ลงชื่อ......................................................<br/><br/>
                      (......................................................)<br/>
                      พนักงานขับรถ
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: \"center\", padding: \"40px\", color: \"#64748b\", background: \"white\", borderRadius: \"8px\" }}>
                  {fetchingReports ? \"กำลังโหลดข้อมูล...\" : \"ไม่มีข้อมูลรายงาน กรุณาเลือกตัวกรองแล้วกดปุ่มค้นหา\"}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
