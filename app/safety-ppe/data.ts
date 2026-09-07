export type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  standard: number;
  actual: number;
  missing: number;
  damaged: number;
  remarks?: string;
};

export type TeamPPE = {
  id: string;
  name: string;
  membersCount: number;
  equipment: EquipmentItem[];
};

export const safetyData: TeamPPE[] = [
  {
    id: "team1",
    name: "ชุดงาน นายขวัญนคร ศรีจันทร์อินทร์",
    membersCount: 11,
    equipment: [
      { id: "1", name: "หมวกนิรภัย (Safety Helmet)", category: "1.1 ป้องกันศีรษะ", unit: "ใบ", standard: 11, actual: 11, missing: 0, damaged: 0 },
      { id: "2", name: "แว่นตานิรภัย (Safety Glass)", category: "1.2 ป้องกันใบหน้าและดวงตา", unit: "อัน", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "3", name: "ถุงมือยางแรงสูง พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "4", name: "ถุงมือยางแรงต่ำ พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 4, actual: 0, missing: 4, damaged: 0 },
      { id: "5", name: "ถุงมือปีนเสา", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "6", name: "ถุงมือผ้า", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 11, actual: 11, missing: 22, damaged: 0, remarks: "ใช้งานบ่อย" },
      { id: "7", name: "เสื้อกั๊กสะท้อนแสง", category: "1.5 ป้องกันลำตัว", unit: "ตัว", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "8", name: "รองเท้าบู๊ทหนังปีนเสา", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 11, actual: 11, missing: 0, damaged: 0 },
      { id: "9", name: "รองเท้านิรภัย (หัวเหล็ก)", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 1, actual: 0, missing: 1, damaged: 0, remarks: "ของช่างคุมงาน" },
      { id: "10", name: "รองเท้าบู๊ทยางกันไฟฟ้าแรงสูง", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "11", name: "เข็มขัดนิรภัยพร้อมสายกันตก", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 6, actual: 5, missing: 6, damaged: 5 },
      { id: "12", name: "เข็มขัดนิรภัยชนิดเต็มตัว", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "13", name: "สายหรือเชือกช่วยชีวิต (Lifelines)", category: "1.8 ป้องกันการตก", unit: "เส้น", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "14", name: "ขาปีนเสา คอร.", category: "1.8 ป้องกันการตก", unit: "คู่", standard: 11, actual: 5, missing: 6, damaged: 0 },
      { id: "15", name: "เครื่องมือต่อสายลงดิน 22-33 kV", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 2, missing: 1, damaged: 0 },
      { id: "16", name: "เครื่องมือต่อสายลงดินกับรถ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 2, missing: 1, damaged: 0 },
      { id: "17", name: "ไม้ชักฟิวส์ชนิด 3 ท่อน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "18", name: "โคมไฟสปอร์ตไลท์ หรือไฟฉาย", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "19", name: "ไฟฉุกเฉิน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "20", name: "ถังดับเพลิง", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ถัง", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "21", name: "ธงให้สัญญาณ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ผืน", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "22", name: "เชือกช่วยชีวิต", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "เส้น", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "23", name: "เครื่องตรวจสอบแรงดันไฟฟ้าแรงสูง", category: "2.2 เครื่องมือตรวจวัด", unit: "เครื่อง", standard: 1, actual: 1, missing: 0, damaged: 0 },
      { id: "24", name: "เครื่องตรวจสอบแรงดันไฟฟ้าแรงต่ำ", category: "2.2 เครื่องมือตรวจวัด", unit: "เครื่อง", standard: 11, actual: 11, missing: 0, damaged: 0 },
      { id: "25", name: "ป้ายห้ามสับสวิตช์", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "26", name: "ป้ายกั้นทางแจ้งเตือนอันตราย", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 2, damaged: 0 },
      { id: "27", name: "ป้ายเตือน พนักงานกำลังปฏิบัติงาน", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 2, damaged: 0 },
      { id: "28", name: "ไฟสัญญาณเตือนวับวาบสีเหลือง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 1, missing: 2, damaged: 1 },
      { id: "29", name: "กรวยยางสะท้อนแสง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 30, actual: 15, missing: 15, damaged: 0 },
      { id: "30", name: "เทปกำหนดขอบเขต", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ม้วน", standard: 1, actual: 0, missing: 1, damaged: 0 },
      { id: "31", name: "วิทยุสื่อสาร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "เครื่อง", standard: 3, actual: 0, missing: 3, damaged: 0 },
      { id: "32", name: "ไฟฉายคาดศีรษะ", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "33", name: "กระบองไฟจราจร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 2, actual: 0, missing: 2, damaged: 0 },
    ]
  },
  {
    id: "team2",
    name: "ชุดงาน นายวีรพัฒน์ นาคลมัย",
    membersCount: 8,
    equipment: [
      { id: "1", name: "หมวกนิรภัย (Safety Helmet)", category: "1.1 ป้องกันศีรษะ", unit: "ใบ", standard: 8, actual: 8, missing: 0, damaged: 0 },
      { id: "2", name: "แว่นตานิรภัย (Safety Glass)", category: "1.2 ป้องกันใบหน้าและดวงตา", unit: "อัน", standard: 8, actual: 2, missing: 6, damaged: 0 },
      { id: "3", name: "ถุงมือยางแรงสูง พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "4", name: "ถุงมือยางแรงต่ำ พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 4, actual: 2, missing: 2, damaged: 0 },
      { id: "5", name: "ถุงมือปีนเสา", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 8, actual: 0, missing: 8, damaged: 0 },
      { id: "6", name: "ถุงมือผ้า", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 8, actual: 8, missing: 8, damaged: 0 },
      { id: "7", name: "เสื้อกั๊กสะท้อนแสง", category: "1.5 ป้องกันลำตัว", unit: "ตัว", standard: 8, actual: 0, missing: 8, damaged: 0 },
      { id: "8", name: "รองเท้าบู๊ทหนังปีนเสา", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 8, actual: 8, missing: 3, damaged: 3 },
      { id: "9", name: "รองเท้านิรภัย (หัวเหล็ก)", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 1, actual: 0, missing: 1, damaged: 0 },
      { id: "10", name: "รองเท้าบู๊ทยางกันไฟฟ้าแรงสูง", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "11", name: "เข็มขัดนิรภัยพร้อมสายกันตก", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 6, actual: 4, missing: 6, damaged: 4 },
      { id: "12", name: "เข็มขัดนิรภัยชนิดเต็มตัว", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "13", name: "สายหรือเชือกช่วยชีวิต (Lifelines)", category: "1.8 ป้องกันการตก", unit: "เส้น", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "14", name: "ขาปีนเสา คอร.", category: "1.8 ป้องกันการตก", unit: "คู่", standard: 8, actual: 4, missing: 4, damaged: 0, remarks: "ควรเปลี่ยนเชือกรัด" },
      { id: "15", name: "เครื่องมือต่อสายลงดิน 22-33 kV", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 3, missing: 0, damaged: 0 },
      { id: "16", name: "เครื่องมือต่อสายลงดินกับรถ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 3, missing: 0, damaged: 0 },
      { id: "17", name: "ไม้ชักฟิวส์ชนิด 3 ท่อน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 2, missing: 2, damaged: 2 },
      { id: "18", name: "โคมไฟสปอร์ตไลท์ หรือไฟฉาย", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "19", name: "ไฟฉุกเฉิน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "20", name: "ถังดับเพลิง", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ถัง", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "21", name: "เชือกช่วยชีวิต", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "เส้น", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "23", name: "เครื่องตรวจสอบแรงดันไฟฟ้าแรงสูง", category: "2.2 เครื่องมือตรวจวัด", unit: "เครื่อง", standard: 1, actual: 1, missing: 0, damaged: 0 },
      { id: "25", name: "ป้ายห้ามสับสวิตช์", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "26", name: "ป้ายกั้นทางแจ้งเตือนอันตราย", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "27", name: "ป้ายเตือน พนักงานกำลังปฏิบัติงาน", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "28", name: "ไฟสัญญาณเตือนวับวาบสีเหลือง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "29", name: "กรวยยางสะท้อนแสง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 30, actual: 30, missing: 0, damaged: 0 },
      { id: "30", name: "เทปกำหนดขอบเขต", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ม้วน", standard: 1, actual: 1, missing: 0, damaged: 0 },
      { id: "31", name: "วิทยุสื่อสาร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "เครื่อง", standard: 3, actual: 0, missing: 3, damaged: 0 },
      { id: "32", name: "ไฟฉายคาดศีรษะ", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "33", name: "กระบองไฟจราจร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 2, actual: 0, missing: 2, damaged: 0 },
    ]
  },
  {
    id: "team3",
    name: "ชุดงาน นายศราวุฒิ เกิดสีเล็ก",
    membersCount: 8,
    equipment: [
      { id: "1", name: "หมวกนิรภัย (Safety Helmet)", category: "1.1 ป้องกันศีรษะ", unit: "ใบ", standard: 8, actual: 8, missing: 0, damaged: 0 },
      { id: "2", name: "แว่นตานิรภัย (Safety Glass)", category: "1.2 ป้องกันใบหน้าและดวงตา", unit: "อัน", standard: 8, actual: 2, missing: 6, damaged: 0 },
      { id: "3", name: "ถุงมือยางแรงสูง พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "4", name: "ถุงมือยางแรงต่ำ พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 4, actual: 2, missing: 2, damaged: 0 },
      { id: "5", name: "ถุงมือปีนเสา", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 8, actual: 0, missing: 8, damaged: 0 },
      { id: "6", name: "ถุงมือผ้า", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 8, actual: 8, missing: 16, damaged: 0 },
      { id: "7", name: "เสื้อกั๊กสะท้อนแสง", category: "1.5 ป้องกันลำตัว", unit: "ตัว", standard: 8, actual: 0, missing: 8, damaged: 0 },
      { id: "8", name: "รองเท้าบู๊ทหนังปีนเสา", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 8, actual: 8, missing: 0, damaged: 0 },
      { id: "9", name: "รองเท้านิรภัย (หัวเหล็ก)", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 1, actual: 0, missing: 1, damaged: 0 },
      { id: "10", name: "รองเท้าบู๊ทยางกันไฟฟ้าแรงสูง", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "11", name: "เข็มขัดนิรภัยพร้อมสายกันตก", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 6, actual: 3, missing: 3, damaged: 0 },
      { id: "12", name: "เข็มขัดนิรภัยชนิดเต็มตัว", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "13", name: "สายหรือเชือกช่วยชีวิต (Lifelines)", category: "1.8 ป้องกันการตก", unit: "เส้น", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "14", name: "ขาปีนเสา คอร.", category: "1.8 ป้องกันการตก", unit: "คู่", standard: 8, actual: 3, missing: 5, damaged: 0 },
      { id: "15", name: "เครื่องมือต่อสายลงดิน 22-33 kV", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 2, missing: 1, damaged: 0 },
      { id: "16", name: "เครื่องมือต่อสายลงดินกับรถ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 2, missing: 1, damaged: 0 },
      { id: "17", name: "ไม้ชักฟิวส์ชนิด 3 ท่อน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 1, missing: 1, damaged: 0 },
      { id: "18", name: "โคมไฟสปอร์ตไลท์ หรือไฟฉาย", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "19", name: "ไฟฉุกเฉิน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "20", name: "ถังดับเพลิง", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ถัง", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "21", name: "ธงให้สัญญาณ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ผืน", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "22", name: "เชือกช่วยชีวิต", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "เส้น", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "23", name: "เครื่องตรวจสอบแรงดันไฟฟ้าแรงสูง", category: "2.2 เครื่องมือตรวจวัด", unit: "เครื่อง", standard: 1, actual: 1, missing: 1, damaged: 1, remarks: "ซื้อไม้เพิ่ม" },
      { id: "25", name: "ป้ายห้ามสับสวิตช์", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "26", name: "ป้ายกั้นทางแจ้งเตือนอันตราย", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 2, damaged: 2 },
      { id: "27", name: "ป้ายเตือน พนักงานกำลังปฏิบัติงาน", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 2, missing: 2, damaged: 2 },
      { id: "28", name: "ไฟสัญญาณเตือนวับวาบสีเหลือง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "29", name: "กรวยยางสะท้อนแสง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 30, actual: 30, missing: 0, damaged: 0 },
      { id: "30", name: "เทปกำหนดขอบเขต", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ม้วน", standard: 1, actual: 0, missing: 1, damaged: 0 },
      { id: "31", name: "วิทยุสื่อสาร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "เครื่อง", standard: 3, actual: 2, missing: 1, damaged: 0 },
      { id: "32", name: "ไฟฉายคาดศีรษะ", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "33", name: "กระบองไฟจราจร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 2, actual: 0, missing: 2, damaged: 0 },
    ]
  },
  {
    id: "team4",
    name: "ชุดงาน นายศุภวิชญ์ เกาะลอย",
    membersCount: 11,
    equipment: [
      { id: "1", name: "หมวกนิรภัย (Safety Helmet)", category: "1.1 ป้องกันศีรษะ", unit: "ใบ", standard: 11, actual: 11, missing: 0, damaged: 0 },
      { id: "2", name: "แว่นตานิรภัย (Safety Glass)", category: "1.2 ป้องกันใบหน้าและดวงตา", unit: "อัน", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "3", name: "ถุงมือยางแรงสูง พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "4", name: "ถุงมือยางแรงต่ำ พร้อมถุงมือหนัง", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 4, actual: 2, missing: 2, damaged: 0 },
      { id: "5", name: "ถุงมือปีนเสา", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "6", name: "ถุงมือผ้า", category: "1.4 ป้องกันมือและแขน", unit: "คู่", standard: 11, actual: 11, missing: 22, damaged: 0, remarks: "ใช้งานบ่อย" },
      { id: "7", name: "เสื้อกั๊กสะท้อนแสง", category: "1.5 ป้องกันลำตัว", unit: "ตัว", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "8", name: "รองเท้าบู๊ทหนังปีนเสา", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 11, actual: 11, missing: 0, damaged: 0 },
      { id: "9", name: "รองเท้านิรภัย (หัวเหล็ก)", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 1, actual: 0, missing: 1, damaged: 0 },
      { id: "10", name: "รองเท้าบู๊ทยางกันไฟฟ้าแรงสูง", category: "1.6 ป้องกันเท้า", unit: "คู่", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "11", name: "เข็มขัดนิรภัยพร้อมสายกันตก", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 6, actual: 6, missing: 6, damaged: 6 },
      { id: "12", name: "เข็มขัดนิรภัยชนิดเต็มตัว", category: "1.8 ป้องกันการตก", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "13", name: "สายหรือเชือกช่วยชีวิต (Lifelines)", category: "1.8 ป้องกันการตก", unit: "เส้น", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "14", name: "ขาปีนเสา คอร.", category: "1.8 ป้องกันการตก", unit: "คู่", standard: 11, actual: 11, missing: 0, damaged: 0 },
      { id: "15", name: "เครื่องมือต่อสายลงดิน 22-33 kV", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 3, missing: 0, damaged: 0 },
      { id: "16", name: "เครื่องมือต่อสายลงดินกับรถ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 3, actual: 3, missing: 0, damaged: 0 },
      { id: "17", name: "ไม้ชักฟิวส์ชนิด 3 ท่อน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "18", name: "โคมไฟสปอร์ตไลท์ หรือไฟฉาย", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "19", name: "ไฟฉุกเฉิน", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "20", name: "ถังดับเพลิง", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ถัง", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "21", name: "ธงให้สัญญาณ", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "ผืน", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "22", name: "เชือกช่วยชีวิต", category: "2.1 เครื่องมือปฏิบัติงาน", unit: "เส้น", standard: 2, actual: 2, missing: 0, damaged: 0 },
      { id: "23", name: "เครื่องตรวจสอบแรงดันไฟฟ้าแรงสูง", category: "2.2 เครื่องมือตรวจวัด", unit: "เครื่อง", standard: 1, actual: 1, missing: 0, damaged: 0 },
      { id: "24", name: "เครื่องตรวจสอบแรงดันไฟฟ้าแรงต่ำ", category: "2.2 เครื่องมือตรวจวัด", unit: "เครื่อง", standard: 11, actual: 0, missing: 11, damaged: 0 },
      { id: "25", name: "ป้ายห้ามสับสวิตช์", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "26", name: "ป้ายกั้นทางแจ้งเตือนอันตราย", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "27", name: "ป้ายเตือน พนักงานกำลังปฏิบัติงาน", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ป้าย", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "28", name: "ไฟสัญญาณเตือนวับวาบสีเหลือง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "29", name: "กรวยยางสะท้อนแสง", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 30, actual: 20, missing: 10, damaged: 0 },
      { id: "30", name: "เทปกำหนดขอบเขต", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ม้วน", standard: 1, actual: 0, missing: 1, damaged: 0 },
      { id: "31", name: "วิทยุสื่อสาร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "เครื่อง", standard: 3, actual: 0, missing: 3, damaged: 0 },
      { id: "32", name: "ไฟฉายคาดศีรษะ", category: "2.3 เครื่องมือแจ้งเตือน", unit: "ชุด", standard: 2, actual: 0, missing: 2, damaged: 0 },
      { id: "33", name: "กระบองไฟจราจร", category: "2.3 เครื่องมือแจ้งเตือน", unit: "อัน", standard: 2, actual: 0, missing: 2, damaged: 0 },
    ]
  }
];

export const getSafetyStats = () => {
  let totalItems = 0;
  let readyItems = 0;
  let damagedItems = 0;
  let missingItems = 0;

  safetyData.forEach(team => {
    team.equipment.forEach(item => {
      totalItems += item.standard;
      readyItems += (item.actual - item.damaged);
      damagedItems += item.damaged;
      missingItems += item.missing;
    });
  });

  return {
    totalItems,
    readyItems,
    damagedItems,
    missingItems,
    totalTeams: safetyData.length
  };
};
