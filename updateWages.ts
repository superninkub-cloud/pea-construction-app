import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const wageData = [
  { name: "นายศราวุธ อ่ำเทศ", wage: "608" },
  { name: "นายโฆษิต สอดสี", wage: "525" },
  { name: "นายอภิรักษ์ จันทร์พฤกษ์", wage: "525" },
  { name: "นายเรวัฒน์ เสือคล้าย", wage: "734" },
  { name: "นายมนต์ชัย โพธิ์น้อย", wage: "734" },
  { name: "นายภานุพงษ์ เพลงปาน", wage: "608" },
  { name: "นายอนุชิต ศิริบุตร", wage: "734" },
  { name: "นายนพพล ยางระหงษ์", wage: "734" },
  { name: "นายอดิศักดิ์ นพเก้า", wage: "608" },
  { name: "นายอิทธิ พรหมชนะ", wage: "525" },
  { name: "นายศราวุฒิ โสภีร์", wage: "525" },
  { name: "นายสิริวัชญ์ ภิรมย์มาก", wage: "525" },
  { name: "นายวรนาถ รัตนดากุล", wage: "525" },
  { name: "นายปรีดา คล้ายสินธุ์", wage: "734" },
  { name: "นายปกรณ์ เทียนเทศ", wage: "734" },
  { name: "นายพรชัย นิลโพธิ์ทอง", wage: "734" },
  { name: "นายสุรินทร์ สาเป้า", wage: "608" },
  { name: "นายกิตติพิชญ์ พุ่มกำพล", wage: "608" },
  { name: "นายพีรภัทร ทองเงิน", wage: "525" },
  { name: "นายไพบูลย์ ศรีจันทร์อินทร์", wage: "608" },
  { name: "นายมาโนช คำเอี่ยม", wage: "734" },
  { name: "นายอาก่า อายีกู่", wage: "734" },
  { name: "นายมานพ พราหมมณี", wage: "734" },
  { name: "นายวรยุทธ บรรเทาวงษ์", wage: "608" },
  { name: "นายกมลวิทย์ สุนทรพรเจริญ", wage: "525" },
  { name: "นายสุทัศน์ เผือกบำรุง", wage: "525" },
  { name: "นายสุรวุฒิ เมืองสมบัติ", wage: "525" },
  { name: "นายจิรภัทร หินเพ็ชร", wage: "608" },
  { name: "นายไพศาล ศรีจันทร์อินทร์", wage: "525" },
  { name: "นายภานุมาศ สูงประเสริฐกุล", wage: "734" },
  { name: "นายณัฐพงษ์ พรานนก", wage: "608" },
  { name: "นายธีรพัฒน์ ธนภัทรวรพงษ์", wage: "525" },
  { name: "นายศุภมิตร สุรสีห์เรืองชัย", wage: "525" },
  { name: "นายเรืองศักดิ์ ตั้งแท่นทอง", wage: "608" },
  { name: "นายวันเฉลิม วินิจผล", wage: "608" },
  { name: "นายมานะ ชวดมา", wage: "608" },
  { name: "นายธนชัย ชวดมา", wage: "525" },
  { name: "นายธนเทพ เจริญวิบูลย์", wage: "525" },
  { name: "นายธนทัต รื่นนุสาน", wage: "525" },
  { name: "นายวีรภัทร บัวคำศรี", wage: "525" },
  { name: "นายวันชัย เกิดป้อม", wage: "525" },
  { name: "นายพงศ์สมิทร์ พิเชฐ์พิริยะ", wage: "734" },
  { name: "นายชัชวาล พร้อมโกมล", wage: "608" },
  { name: "ว่าที่ ร.ต.ทัตพิทักษ์ คงถาวรวณิชย์", wage: "525" },
  { name: "นายธัญยธรณ์ สงวนทรัพย์", wage: "525" },
  { name: "นายคัมภีร์ หลักคำ", wage: "525" },
  { name: "นายกันตภณ หินศรี", wage: "525" },
  { name: "นายวิศัย ใจบุญ", wage: "608" },
  { name: "นายจิรศักดิ์ เกณฑ์สาคู", wage: "608" },
  { name: "นายกิตกมล รอดโพธิ์ทอง", wage: "525" },
  { name: "นายธนพล สามงามเอี่ยม", wage: "608" },
  { name: "นายทวีทรัพย์ ชิวปรีชา", wage: "525" },
  { name: "นายวุฒิพงศ์ จิระกุลสวัสดิ์", wage: "608" },
  { name: "นายบังเอิญ สิงห์โตทอง", wage: "525" },
  { name: "นายพุฒิพงษ์ วิริยะหิรัญไพบูลย์", wage: "525" },
  { name: "นายอาณกร พุทธรักษา", wage: "525" },
  { name: "นายสุททธิเกียรติ วรพินท์", wage: "525" },
  { name: "นายธนวัฒน์ จงรอดน่วม", wage: "525" },
  { name: "นายภูริช เจริญสุข", wage: "525" },
];

function normalizeName(name: string) {
  return name.replace(/^(นาย|นาง|นางสาว|ว่าที่ ร\.ต\.)\s*/, '').replace(/\s+/g, ' ').trim();
}

async function run() {
  const { data: personnelList, error: fetchError } = await supabase.from('personnel').select('id, full_name, wage');
  if (fetchError) {
    console.error("Error fetching personnel:", fetchError);
    return;
  }
  
  let updatedCount = 0;
  let notFoundCount = 0;

  for (const item of wageData) {
    const normalizedItemName = normalizeName(item.name);
    const person = personnelList.find(p => normalizeName(p.full_name) === normalizedItemName);
    
    if (person) {
      if (person.wage === item.wage) {
        // console.log(`Skipping ${person.full_name}, already updated.`);
        continue;
      }
      console.log(`Updating ${person.full_name} -> ${item.wage}`);
      const { error } = await supabase.from('personnel').update({ wage: item.wage }).eq('id', person.id);
      if (error) {
        console.error(`Failed to update ${person.full_name}:`, error.message);
      } else {
        updatedCount++;
      }
    } else {
      console.log(`Person not found in DB: ${item.name}`);
      notFoundCount++;
    }
  }

  console.log(`Update complete. Successfully updated: ${updatedCount}, Not found in DB: ${notFoundCount}`);
}

run();
