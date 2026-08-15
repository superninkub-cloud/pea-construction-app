const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib', 'wireData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Define mapping from prefix/ID to category in Thai
const getCategory = (id, name) => {
  if (id.startsWith('1010100')) return 'ลวดเหล็กตีเกลียว';
  if (id.startsWith('1020000')) return 'สายทองแดงเปลือย';
  if (id.startsWith('1020010')) return 'สายอลูมิเนียมเปลือย';
  if (id.startsWith('1020020')) return 'สายอลูมิเนียมแกนเหล็ก';
  if (id.startsWith('1020030')) return 'สายอลูมิเนียมอัลลอย';
  if (id.startsWith('10200403')) return 'สายเคเบิลใต้ดิน CV'; // Added based on CV 0.6/1 KV
  if (id.startsWith('1020040')) return 'สายเคเบิลใต้ดินทองแดง';
  if (id.startsWith('10200500') || id.startsWith('10200501')) return 'สายเคเบิลอากาศ (AERIAL)';
  if (id.startsWith('10200502') || id.startsWith('10200503')) return 'สายเคเบิลอากาศ (TWISTED/TAC)';
  if (id.startsWith('1020060')) return 'สายไม่เต็มพิกัด (PIC)';
  if (id.startsWith('1020070')) return 'สายอลูมิเนียมหุ้มพีวีซี';
  if (id.startsWith('10200805') || id.startsWith('10200806') || id.startsWith('10200800')) return 'สายทองแดงหุ้มพีวีซี';
  if (name.includes('CONTROL CABLE')) return 'สายคอนโทรล';
  if (name.includes('CABLE,PVC. FLEX')) return 'สายทองแดงหุ้มพีวีซี';
  if (name.includes('CABLE,CU,NYY')) return 'สายทองแดง NYY';
  if (name.includes('CONDUCTOR,CU,NFYW')) return 'สายทองแดง NFYW';
  
  return 'สายอื่นๆ';
};

// Update the interface
content = content.replace(
  'export interface WireData {\n  id: string;\n  name: string;\n  weightPerMeter: number;\n}',
  'export interface WireData {\n  id: string;\n  name: string;\n  category: string;\n  weightPerMeter: number;\n}'
);

// Match each wire item
const regex = /{ id: "(.*?)", name: "(.*?)", weightPerMeter: (.*?) }/g;
content = content.replace(regex, (match, id, name, weightPerMeter) => {
  const category = getCategory(id, name);
  return `{ id: "${id}", name: "${name}", category: "${category}", weightPerMeter: ${weightPerMeter} }`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated wireData.ts with categories.');
