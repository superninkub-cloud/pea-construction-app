import { supabase } from './lib/supabaseClient';

async function test() {
  const { data, error: fetchError } = await supabase.from("projects").select("*").limit(1);
  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("No projects found");
    return;
  }
  
  const p = data[0];
  console.log("Found project:", p.id);
  
  const formattedWires = [
    {
      id: Date.now().toString(),
      type: "1020010009",
      length: 1500,
      returned_weight: 1000
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
    console.log("Update Success!");
  }
}

test();
