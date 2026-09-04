const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://imxqmofvoklxgjwsgvvq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteHFtb2Z2b2tseGdqd3NndnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDk4NTgsImV4cCI6MjEwMDEyNTg1OH0.BFs6cW9NqaSlujhWu5QJOZL_N8GycXQpiVsqp1lV0vM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data } = await supabase.from('vehicles').select('*');
  console.log("Vehicles in Supabase:");
  const oldPlate = data.find(v => v.plate_number.includes('55-0774'));
  const newPlate = data.find(v => v.plate_number.includes('90-8896'));
  console.log("Old Plate found:", oldPlate);
  console.log("New Plate found:", newPlate);
}

check();
