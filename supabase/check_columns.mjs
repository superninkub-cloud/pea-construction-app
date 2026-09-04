import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhackepxxidleddkkyme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYWNrZXB4eGlkbGVkZGtreW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDg0MzksImV4cCI6MjEwMzU4NDQzOX0.bwn9-9Hf9dKW3b8HuufHFEDM7vJR4R3BAjzf9mdLj-c';

const supabase = createClient(supabaseUrl, supabaseKey);

// Check existing tasks
const { data, error } = await supabase
  .from('project_tasks')
  .select('*')
  .limit(10);

console.log('Error:', error?.message || 'none');
console.log('Existing tasks count:', data?.length || 0);
if (data && data.length > 0) {
  console.log('Sample task:', JSON.stringify(data[0], null, 2));
  console.log('Has step_order?', 'step_order' in data[0]);
  console.log('Has weight?', 'weight' in data[0]);
}

// Check columns via a specific query
const { data: colTest, error: colErr } = await supabase
  .from('project_tasks')
  .select('id, step_order, weight')
  .limit(1);

console.log('\nColumn test error:', colErr?.message || 'none');
console.log('Column test data:', colTest);
