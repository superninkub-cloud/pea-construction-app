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
Your task is to extract scrap wire data based STRICTLY on the following rules:

# Rules for Extraction:
1. Only extract data from Demolition Departments (แผนกรื้อถอน):
   - ONLY include items from HT-R-E, TR-R-E, LT-R-E, TL-R-E.
   - SKIP any items from Construction Departments (แผนกก่อสร้าง) like HT-C-E, LT-C-E, TR-C-E, TL-C-E.

2. Exclude Steel Stranded Wire:
   - DO NOT extract any items containing "ลวดเหล็กตีเกลียว", "ST. WIRE", "STRANDED", or "เศษเหล็กและวัสดุ". Completely skip them.

3. Calculate True Scrap Wire Length:
   - Look for the 'Estimated' amount (จํานวนพัสดุ ตามประมาณการ).
   - Look for the 'Good Material Returned' amount (จํานวนพัสดุดี ส่งคืนคลัง).
   - True Scrap Length = Estimated - Good Material Returned.
   - If (Estimated - Good Material Returned) equals 0 or less, SKIP that wire completely (it yielded no scrap).
   - Some tables might list the Scrap value directly, but ALWAYS verify using the formula.

4. Normalization of Wire Type (Important):
   - Ensure the extracted "type" closely matches standard PEA wire names (e.g., "CABLE,AERIAL,AL 22 KV. 1X50 SQ.MM.", "COND.,AL,BARE 50/7 SQ.MM.TIS.85").
   - If the exact name is fragmented in the PDF, piece it together cleanly.

Return ONLY a valid JSON array of objects representing the valid scrap wires. Each object must have exactly two keys:
- "type": The name/type of the wire as a string.
- "length": The calculated true scrap length as a number (True Scrap Length = Estimated - Good Material Returned).

Example Output:
[
  {
    "type": "CABLE,AERIAL,AL 22 KV. 1X50 SQ.MM.",
    "length": 3669
  },
  {
    "type": "CABLE,AL.,750 V.50 SQ.MM. TIS.293",
    "length": 4631
  }
]

Do not include any markdown formatting like \`\`\`json. Return only the raw JSON array. If no valid wires are found, return an empty array [].

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
        console.log(`Successfully used model: ${modelName} for Wire Extraction`);
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

    return NextResponse.json({ wires: jsonData });
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: error.message || "Failed to process PDF" }, { status: 500 });
  }
}
