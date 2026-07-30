import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const trackedWbs = [
  'P-TDD02.1-I-PMNT0.0001',
  'P-TDD02.1-I-PMNT0.0002',
  'P-TDD02.3-I-KPNIA.0006',
  'P-TDD02.3-I-KPNIA.0011',
  'P-TDD02.3-I-NPMNA.0019',
  'P-TDD02.3-I-SPINA.0001',
  'P-TDD02.3-I-SPINA.0002',
  'P-TDD02.3-I-SPINA.0003',
  'P-TDD02.3-I-SPINA.0004',
  'P-TDD02.3-I-SPINA.0007',
  'P-TDD02.3-I-SPINA.0011',
  'P-TDD02.3-I-SPINA.0012',
  'P-TDD02.3-I-SPINA.0013'
];

async function run() {
  for (const wbs of trackedWbs) {
    console.log('Updating:', wbs);
    const { data, error } = await supabase
      .from('projects')
      .update({ p_tracking: 'งานกลุ่ม 1 งานก่อนปี 68 ที่ตกแผน สาย ป ติดตาม' })
      .eq('wbs', wbs);
      
    if (error) {
      console.error('Error updating', wbs, error);
    } else {
      console.log('Success:', wbs);
    }
  }
}

run();
