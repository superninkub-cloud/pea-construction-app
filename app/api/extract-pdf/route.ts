import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Specify edge or node runtime. Edge might have issues with some large files if limit is reached,
// but for 1-10 page PDFs, it should be fine. We'll use nodejs runtime just to be safe.
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
    const wbs = formData.get("wbs") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a financial data extractor. I am providing you with a construction project report PDF.
Your task is to extract three specific values from this report for the project WBS: ${wbs || "the main project"}.

Follow these rules STRICTLY:
1. est_site_expense: 
   - Find the table titled "2. รายละเอียดค่าใช้จ่ายงานก่อสร้าง สถานะรายงาน" or similar.
   - Look at the "รวมประมาณการ" (Total Estimates) row at the bottom of the table.
   - Sum the values from the following columns: 'ค่าแรงงาน', 'ค่าควบคุมงาน', 'ค่าขนส่ง', and 'ค่าเบ็ดเตล็ด'.
   - This sum is the est_site_expense.
   - (Do NOT include 'ค่าพัสดุ', 'พัสดุเข้างาน', or 'ค่าดำเนินการ').
2. allocated_site_budget: 
   - Find the text summary below the table that looks like: "งานก่อสร้างดังกล่าวได้รับจัดสรรงบประมาณจำนวน [X] บาท"
   - Extract the number X as allocated_site_budget.
3. disbursed_site_expense: 
   - Find the text summary below the table that looks like: "ค่าใช้จ่ายจริง(เฉพาะที่ควบคุมงบฯ)จำนวน [Y] บาท"
   - Extract the number Y as disbursed_site_expense.

Return ONLY a valid JSON object with the following keys and numerical values (no commas or currency symbols in the numbers). If you cannot find a value, return 0.
Do NOT include markdown formatting like \`\`\`json. Just the raw JSON object.

Example output:
{
  "est_site_expense": 1500000.00,
  "allocated_site_budget": 1200000.50,
  "disbursed_site_expense": 1200000.50
}
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || "application/pdf",
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();
    // Clean up potential markdown formatting if the model still outputs it
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    let jsonData;
    try {
      jsonData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON:", cleanedText);
      return NextResponse.json({ error: "Failed to parse AI response into JSON." }, { status: 500 });
    }

    return NextResponse.json(jsonData, { status: 200 });
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during extraction." },
      { status: 500 }
    );
  }
}
