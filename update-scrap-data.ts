import { supabase } from './lib/supabaseClient';

async function updateScrapData() {
  const wbs = "I-67-I-PNN68.HB.1507";
  const { data, error: fetchError } = await supabase.from("projects").select("*").eq("wbs", wbs).limit(1);
  
  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log(`No project found with WBS: ${wbs}. Please make sure the project exists.`);
    return;
  }
  
  const p = data[0];
  console.log("Found project:", p.name, `(${p.id})`);
  
  // Data from PDF
  const formattedWires = [
    {
      id: Date.now().toString() + "1",
      type: "1-50-001-0004", // เศษสายอลูมิเนียมแกนเหล็กชำรุด
      length: 865.48, // using weight as length since weightPerMeter is 1
      returned_weight: 865.48
    },
    {
      id: Date.now().toString() + "2",
      type: "1-50-002-0001", // เศษเหล็กและวัสดุ
      length: 500, // 429 + 38 + 33
      returned_weight: 500
    },
    {
      id: Date.now().toString() + "3",
      type: "1-50-001-0002", // เศษสายอลูมิเนียมหุ้ม พีวีซี สี
      length: 140.81, // 4.47 + 136.34
      returned_weight: 140.81
    },
    {
      id: Date.now().toString() + "4",
      type: "1-50-001-0006", // เศษสายเคเบิลอากาศชำรุด
      length: 7.99,
      returned_weight: 7.99
    },
    {
      id: Date.now().toString() + "5",
      type: "1-50-001-0001", // เศษสายอลูมิเนียมเปลือยชำรุด
      length: 92.46,
      returned_weight: 92.46
    }
  ];
  
  const { error } = await supabase.from("projects").update({
    scrap_wires_data: formattedWires,
    scrap_wire_type: null,
    scrap_wire_length: null,
    scrap_returned_weight: null
  }).eq("id", p.id);
  
  if (error) {
    console.error("Update Error:", error);
  } else {
    console.log("Update Success! Scrap wire data has been added.");
  }
}

updateScrapData();
