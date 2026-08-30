import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";
export const maxDuration = 60; // Max allowed for Vercel Hobby plan

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.replace(/\s/g, '');
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    // Parse PDF text using unpdf (Vercel edge friendly)
    const pdfBuffer = new Uint8Array(arrayBuffer);
    const pdf = await getDocumentProxy(pdfBuffer);
    const { text: extractedText } = await extractText(pdf, { mergePages: true });

    const model = genAI.getGenerativeModel({ model: "gemini-3.7-flash" });

    const prompt = `
You are a financial data extractor. I am providing you with a construction project report PDF.
Your task is to extract the budget data for each network to help generate an official budget transfer memo.

Look for the table titled "2. รายละเอียดค่าใช้จ่ายงานก่อสร้าง สถานะรายงาน".
Inside this table, there are multiple networks (e.g., HT-C-E, HT-R-E, TR-C-E, TL-C-E, LT-C-E, LT-R-E, TL-R-E).
For each network, find the rows for the following cost categories ONLY:
- ค่าพัสดุ
- ค่าแรงงาน (or ค่าแรง)
- ค่าควบคุมงาน
- ค่าขนส่ง/ยานพาหนะ (or ค่าขนส่ง)
- ค่าเบ็ดเตล็ด
- ค่าดำเนินการ

For each of these categories, I need you to extract 3 values:
1. Budget: from the column "ประมาณการ(1)" or "งบประมาณ"
2. Disbursed: from the column "เบิกจ่ายจริง(2)" or "เบิกจ่ายแล้ว"
3. Remaining: from the column "ผลต่าง" or "คงเหลือ(3)=(1)-(2)"

Return the data as a JSON array of objects.
Each object should represent a network. Only include networks that have at least one non-zero value in any of these categories.
For negative values (which might have a trailing minus sign like '31,401.00-'), parse them as regular negative numbers (e.g., -31401.00). Remove commas from numbers.

Use this EXACT JSON format:
[
  {
    "network": "6001381469",
    "networkName": "HT-C-E",
    "categories": {
      "ค่าพัสดุ": { "budget": 100000.00, "disbursed": 50000.00, "remaining": 50000.00 },
      "ค่าแรง": { "budget": 140358.00, "disbursed": 115155.00, "remaining": 25203.00 },
      "ค่าควบคุมงาน": { "budget": 42107.00, "disbursed": 23005.00, "remaining": 19102.00 },
      "ค่าขนส่ง": { "budget": 46665.00, "disbursed": 34969.18, "remaining": 11695.82 },
      "ค่าเบ็ดเตล็ด": { "budget": 58131.00, "disbursed": 237299.10, "remaining": -179168.10 },
      "ค่าดำเนินการ": { "budget": 61028.00, "disbursed": 0.00, "remaining": 61028.00 }
    }
  },
  ...
]

Rules:
- Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.
- If a value is 0, empty, or missing, set it to 0.
- Make sure to correctly parse trailing minus signs (e.g., 100.00- becomes -100).
- The network ID is the 10-digit number before the network name (e.g., 6001381469).
    `;

    const result = await model.generateContent([
      `ข้อมูลจากเอกสาร PDF:\n${extractedText}\n\n`,
      prompt,
    ]);

    const responseText = result.response.text();
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
