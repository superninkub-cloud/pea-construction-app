import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Parse PDF text using unpdf
    const pdfBuffer = new Uint8Array(arrayBuffer);
    const pdf = await getDocumentProxy(pdfBuffer);
    const { text: extractedText } = await extractText(pdf, { mergePages: true });

    const prompt = `
You are an expert data extraction assistant for PEA (Provincial Electricity Authority).
I will provide you with the text content of a ZPSR018 PDF material return document.
Your task is to extract material tracking data based STRICTLY on the following rules:

# Rules for Extraction:
1. Identify the WBS element (e.g. WBS: I.1111111).
2. Check the project status. If the status is "F4" (Closed), you MUST SKIP that WBS and not extract any materials for it.
3. For non-F4 projects, extract the materials. There are 2 parts of materials:
   - "new" (พัสดุเบิกใหม่): Materials for construction. Look for departments with "-C-E" or "แผนกก่อสร้าง" (e.g., HT-C-E, LT-C-E, TL-C-E, TR-C-E).
   - "demolish" (พัสดุรื้อถอน): Materials from demolition that need to be returned. Look for departments with "-R-E" or "แผนกรื้อถอน" (e.g., HT-R-E, LT-R-E, TL-R-E, TR-R-E). NOTE: Even if the main table header says "ก่อสร้าง" (Construction), if the sub-header specifies a demolition department like "-R-E" or "แผนกรื้อถอน", ALL items under that sub-header MUST be classified as "demolish" (รื้อถอน).
4. EXTRACT ALL materials listed under these departments. DO NOT skip any material even if its drawn quantity, returned quantity, or damaged quantity is 0 (i.e. it hasn't been drawn or returned yet).
5. If technician name (ชื่อช่าง) is mentioned in the document, extract it. Otherwise, set it to an empty string "".

Return ONLY a valid JSON array of objects representing the valid materials. Each object must have the following keys:
- "wbs": The WBS element.
- "technician_name": Technician name if found, else "".
- "material_code": Material code/number (if available, else "").
- "material_name": The name/description of the material.
- "estimated_quantity": The estimated quantity (จำนวนพัสดุ ตามประมาณการ) as a number. If blank or not found, use 0.
- "actual_quantity": For "new" materials, this is the amount DRAWN (จำนวนพัสดุ เบิกจากคลัง). For "demolish" materials, this is the GOOD condition amount RETURNED (จำนวนพัสดุดี ส่งคืนคลัง). MUST strictly take the value from this column. Even if the material name contains the word "ชำรุด", if the value is in the "ส่งคืนคลัง" column, it goes here. Return as a number, if blank or not found, use 0.
- "damaged_quantity": For "demolish" materials, this is the DAMAGED amount RETURNED (จำนวนพัสดุ ชำรุด). MUST strictly take the value from the "ชำรุด" column only. Return as a number, if blank or not found, use 0.
- "unit": The unit of measure (e.g. "ม.", "กก.", "ต้น", "EA").
- "part": Must be exactly "new" or "demolish".

Example Output:
[
  {
    "wbs": "I.690001",
    "technician_name": "นายสมชาย สีทา",
    "material_code": "100001",
    "material_name": "สายไฟ THW 50",
    "estimated_quantity": 100,
    "actual_quantity": 100,
    "damaged_quantity": 0,
    "unit": "ม.",
    "part": "new"
  },
  {
    "wbs": "I.690001",
    "technician_name": "",
    "material_code": "",
    "material_name": "มิเตอร์ 15(45)A",
    "quantity": 2,
    "unit": "เครื่อง",
    "part": "demolish"
  }
]

Do not include any markdown formatting like \`\`\`json. Return only the raw JSON array. If no valid materials are found, return an empty array [].

---
Data from PDF:
${extractedText}
    `;

    const modelsToTry = ["gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
    let result;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([prompt]);
        console.log(`Successfully used model: ${modelName} for Material Tracking Extraction`);
        break; // Success!
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        if (!err.message?.includes("503") && !err.message?.includes("429") && err.status !== 503 && err.status !== 429) {
          break;
        }
      }
    }

    if (!result) {
      throw lastError || new Error("All AI models are currently overloaded. Please try again later.");
    }

    const responseText = result.response.text();
    // Clean up potential markdown formatting
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    let jsonData;
    try {
      jsonData = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to parse JSON from AI:", cleanedText);
      return NextResponse.json({ error: "AI returned invalid JSON format", rawText: cleanedText }, { status: 500 });
    }

    return NextResponse.json({ materials: jsonData });
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: error.message || "Failed to process PDF" }, { status: 500 });
  }
}
