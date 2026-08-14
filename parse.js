const fs = require('fs');

const raw = fs.readFileSync('raw_wires.txt', 'utf-8');
const lines = raw.trim().split('\n');

const wires = [];
for (const line of lines) {
  const parts = line.split(' ');
  const num = parts[0];
  const code = parts[1];
  
  const weightStr = parts[parts.length - 1];
  const weight = weightStr === '-' ? 0 : parseFloat(weightStr);
  
  // Note: line 67 has no size column. "67 1020040307 CABLE,UG.CV.0.6/1 KV.1X240 SQ.MM. -"
  // Wait, looking at the data, the parts before weight could be the name and size.
  // Actually, size might be the second to last part, unless it's missing.
  // Let's just grab everything between code and the last part (or last two parts).
  
  let name = "";
  if (weightStr === '-' && parts.length >= 4 && isNaN(parseFloat(parts[parts.length - 2]))) {
    // If weight is '-' and the previous token is not a number, it might be that the size column is missing or combined.
    // e.g. 67 1020040307 CABLE,UG.CV.0.6/1 KV.1X240 SQ.MM. -
    name = parts.slice(2, parts.length - 1).join(' ');
  } else {
    // Usually second to last is size
    // e.g. 1 1010100002 ST. WIRE, STRANDED 25 SQ.MM.TIS.404 25 0.1920
    let potentialSize = parts[parts.length - 2];
    if (!isNaN(parseFloat(potentialSize))) {
       name = parts.slice(2, parts.length - 2).join(' ');
    } else {
       // if not a number, maybe size is missing
       name = parts.slice(2, parts.length - 1).join(' ');
    }
  }

  wires.push(`  { id: "${code}", name: "${name}", weightPerMeter: ${weight} },`);
}

const out = `export interface WireData {
  id: string;
  name: string;
  weightPerMeter: number;
}

export const wireDataList: WireData[] = [
${wires.join('\n')}
];
`;

fs.writeFileSync('lib/wireData.ts', out);
console.log('done!');
