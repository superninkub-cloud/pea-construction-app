require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const {data, error} = await supabase.from('pole_estimations').select('project_name, pole_name, items').order('created_at', {ascending: false});
  if (error) console.error(error);
  else {
    let foundCount = 0;
    data.forEach(d => {
      d.items?.forEach(i => {
        if (i.code === '1020220109') {
          console.log(`Project: ${d.project_name} | Pole: ${d.pole_name} | Qty: ${i.qty}`);
          foundCount += Number(i.qty);
        }
      });
    });
    console.log(`Total found: ${foundCount}`);
  }
}
run();
