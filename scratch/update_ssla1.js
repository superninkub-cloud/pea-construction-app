const fs = require('fs');

const dataPath = './lib/estimationData.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Find the assembly SS-LA-1 (MP)
const targetAssemblyIndex = data.findIndex(a => a.assemblyName.includes('SS-LA-1 (MP)') && a.assemblyName.includes('5906'));

const newItems = [
  { "code": "1010000304", "name": "STEEL CHANNEL150X75X6.5 MM.2,500MM.", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010030002", "name": "PLATE,STEEL 6X100X450 MM.", "unit": "ชิ้น", "qty": 4 },
  { "code": "1010030006", "name": "PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004", "unit": "ชิ้น", "qty": 1 },
  { "code": "1010050002", "name": "ST. PIPE,SIZE 20, 150 MM.LONG W/O T.E.", "unit": "ชิ้น", "qty": 1 },
  { "code": "1010050010", "name": "PIPE,STEEL,SIZE 20,TYPE 2, 250 mm LONG TIS.277 BUT WITHOUT THREADED END", "unit": "ชิ้น", "qty": 1 },
  { "code": "1010100003", "name": "WIRE,STEEL STRANDED 35 SQ.MM.TIS.404", "unit": "ม.", "qty": 3.5 },
  { "code": "1010110101", "name": "BOLE,MACHINE M. 12x50 MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010110202", "name": "BOLT,MACHINE M.16x200 mm.", "unit": "ชุด", "qty": 4 },
  { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 3 },
  { "code": "1010140001", "name": "BOLT, ROUNG EYE M 16X200 MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010150100", "name": "BOLT,OVAL M.20X350 MM.", "unit": "ชุด", "qty": 4 },
  { "code": "1010150101", "name": "BOLT,OVAL M.20X450 MM.", "unit": "ชุด", "qty": 2 },
  { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 18 },
  { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 12 },
  { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010180302", "name": "WASHER,LOCK,SPRING,SIZE 20 MM.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010210200", "name": "BOLT,STRAND EYE,SINGLE M.16X350 MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010210304", "name": "THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.", "unit": "ชิ้น", "qty": 1 },
  { "code": "1010230000", "name": "CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)", "unit": "ชุด", "qty": 1 },
  { "code": "1010230003", "name": "CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.", "unit": "ชุด", "qty": 4 },
  { "code": "1020240000", "name": "SPACER,HELICAL ROD,PREFORMED,FOR AL.400 SQ.MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1020420302", "name": "TERMINAL,COMPRESSION,15 DEGREE PAD,NEMA,4-HOLE,FOR AL. 400 SQ.MM.", "unit": "ชิ้น", "qty": 6 },
  { "code": "1020430101", "name": "CLAMP,DEAD END,COMPRESSION,DOUBLE LUG,FOR AL.CONDUCTOR 400 SQ.MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1030020101", "name": "INSULATOR,SUSPENSION,COMPOSITE,FOR 115 KV.NOMINAL SELTION LENGHT 1,500-1,600 MM.TEN", "unit": "ชิ้น", "qty": 6 },
  { "code": "1030110103", "name": "CLAMP,STRAIN,WITH CLAMPING KEEPER,FOR AL.CONDUCTOR 400 SQ.MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1030140003", "name": "SOCKET-EYE", "unit": "ชุด", "qty": 3 },
  { "code": "1030140006", "name": "SOCKET-CLEVIS,ANSI TYPE B", "unit": "ชุด", "qty": 3 },
  { "code": "9090011007", "name": "WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD", "unit": "ชิ้น", "qty": 1 }
];

if (targetAssemblyIndex !== -1) {
  data[targetAssemblyIndex].items = newItems;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully updated items for assembly: ${data[targetAssemblyIndex].assemblyName}`);
} else {
  console.log(`Could not find assembly matching SS-LA-1 (MP) 5906`);
}
