require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function run() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  let key = '';
  for(const line of envContent.split(/\r?\n/)) {
      if(line.startsWith('GEMINI_API_KEY=')) key = line.split('=')[1].trim();
  }
  
  if(!key) {
      console.log('No API key found in .env.local');
      return;
  }
  
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const pdfPath = 'C:\\\\Users\\\\pea\\\\.gemini\\\\antigravity-ide\\\\brain\\\\77eacf00-4f3a-45e1-914a-c77ab58078da\\\\.user_uploaded\\\\media_1789108810849.pdf';
  
  const fileData = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(pdfPath)).toString('base64'),
      mimeType: 'application/pdf'
    }
  };

  console.log('Sending PDF to Gemini...');
  const prompt = 'Extract all the assembly information from this PDF. The PDF contains multiple pages of materials. Each page has a table with materials (Code, Name, Unit, Quantity) and an Assembly Name (e.g. SS-TG-1 TANGENT STRUCTURE). Return ONLY a valid JSON array of objects. Each object should have "assemblyName" and "items". "items" is an array of objects with "code", "name", "unit", and "qty". Do NOT return markdown formatting like `json, just the raw JSON text. Make sure to extract from ALL pages.';
  
  const result = await model.generateContent([prompt, fileData]);
  const response = await result.response;
  let text = response.text();
  
  text = text.replace(/^\\\json/, '').replace(/\\\$/, '').trim();
  fs.writeFileSync('lib/estimationData.json', text);
  console.log('Successfully saved to lib/estimationData.json');
}

run().catch(console.error);
