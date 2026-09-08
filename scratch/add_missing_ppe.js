const fs = require('fs');

const path = 'app/safety-ppe/data.ts';
let content = fs.readFileSync(path, 'utf8');

// Insert 1.3 after 1.2
content = content.replace(
  /(category: "1\.2 ป้องกันใบหน้าและดวงตา".*?standard:\s*)(\d+)(.*?\n)/g,
  '$1$2$3      { id: "1_3_" + Math.random().toString(36).substr(2, 5), name: "ปลั๊กอุดหู (Ear Plugs)", category: "1.3 ป้องกันระบบการได้ยิน", unit: "คู่", standard: $2, actual: $2, missing: 0, damaged: 0 },\n'
);

// Insert 1.7 after 1.6 (specifically the last 1.6 item which is "รองเท้าบู๊ทยางกันไฟฟ้าแรงสูง")
// Since standard for "รองเท้าบู๊ทยางกันไฟฟ้าแรงสูง" is usually 2, we should extract the standard from "รองเท้าบู๊ทหนังปีนเสา" instead to get the full team count.
// But it's easier to just get the team count from membersCount.
// Let's just do a simpler script that evaluates the module or just matches the blocks.

let modified = false;

const teams = [
  { name: 'team1', count: 11, line12: 27, line16: 35 },
  { name: 'team2', count: 8, line12: 67, line16: 75 },
  { name: 'team3', count: 8, line12: 105, line16: 113 },
  { name: 'team4', count: 11, line12: 144, line16: 152 },
  { name: 'team5', count: 10, line12: 184, line16: 192 },
];

let lines = fs.readFileSync(path, 'utf8').split('\n');

// We need to insert backwards to not mess up the line numbers
for (let i = teams.length - 1; i >= 0; i--) {
  let team = teams[i];
  
  // Insert 1.7 after line16 (index = line16)
  lines.splice(team.line16, 0, `      { id: "1_7_${team.name}", name: "หน้ากากกรองฝุ่น/สารเคมี (Respirator)", category: "1.7 ป้องกันระบบทางเดินหายใจ", unit: "ชิ้น", standard: ${team.count}, actual: ${team.count}, missing: 0, damaged: 0 },`);
  
  // Insert 1.3 after line12 (index = line12)
  lines.splice(team.line12, 0, `      { id: "1_3_${team.name}", name: "ปลั๊กอุดหู (Ear Plugs)", category: "1.3 ป้องกันระบบการได้ยิน", unit: "คู่", standard: ${team.count}, actual: ${team.count}, missing: 0, damaged: 0 },`);
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully added 1.3 and 1.7');
