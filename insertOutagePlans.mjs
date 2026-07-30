import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const plansToInsert = [
  { outage_date: '2026-07-02', details: 'ตัดเสาคลองบ้านห้วย บางปะ...', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-02', details: 'ระดม นครชัยศรี 4 ชุด', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-05', details: 'บ่อพลอย', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-06', details: 'ปักเสา 115 กาญ5 5 ชุด', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-07', details: 'อู่ทองขอเทรลเลอร์ ย้ายเสา', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-08', details: 'อู่ทองขอเทรลเลอร์ ย้ายเสา', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-09', details: 'กร่างทอง ท่าม่วง 5 ชุด', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-19', details: 'บ่อพลอย', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-21', details: 'อู่ทองขอเทรลเลอร์ ย้ายเสา', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-22', details: 'อู่ทองขอเทรลเลอร์ ย้ายเสา', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-25', details: 'ตลาดกำแพงแสน 5 ชุด', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-27', details: '115 บางเลน 5 ชุด โรงหมี่', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-28', details: 'วันเฉลิมพระชนมพรรษา', wbs: '', status: 'หน่วยงานตนเอง' },
  { outage_date: '2026-07-29', details: 'วันอาสาฬหบูชา', wbs: '', status: 'หน่วยงานตนเอง' }
];

async function run() {
  console.log('Inserting plans...');
  const { data, error } = await supabase.from('outage_plans').insert(plansToInsert);
  
  if (error) {
    console.error('Error inserting plans', error);
  } else {
    console.log('Success inserting plans:', plansToInsert.length);
  }
}

run();
