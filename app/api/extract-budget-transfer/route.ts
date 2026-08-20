import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a financial data extractor. I am providing you with a construction project report PDF.
Your task is to extract the budget difference data to help calculate budget transfers.

Look for the table titled "2. รายละเอียดค่าใช้จ่ายงานก่อสร้าง สถานะรายงาน".
Inside this table, there are multiple networks (e.g., HT-C-E, HT-R-E, TR-C-E).
For each network, find the row labeled "ผลต่าง" (Difference).

I need you to extract the "ผลต่าง" values for the following columns ONLY:
- ค่าแรงงาน
- ค่าควบคุมงาน
- ค่าขนส่ง/ยานพาหนะ (or just ค่าขนส่ง)
- ค่าเบ็ดเตล็ด
- ค่าดำเนินการ

Return the data as a JSON array of objects.
Each object should represent a network that has at least one of these columns with a non-zero "ผลต่าง".
For negative values (which might have a trailing minus sign like '31,401.00-'), parse them as regular negative numbers (e.g., -31401.00).

Use this EXACT JSON format:
[
  {
    "network": "6001381469",
    "networkName": "HT-C-E",
    "differences": {
      "ค่าแรง": -31401.00,
      "ค่าควบคุมงาน": -3864.00,
      "ค่าขนส่ง": 12423.36,
      "ค่าเบ็ดเตล็ด": -90534.01,
      "ค่าดำเนินการ": 61841.00
    }
  },
  ...
]

Rules:
- Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.
- If a value is 0 or empty, you can either omit it or set it to 0.
- Make sure to correctly parse trailing minus signs (e.g., 100.00- becomes -100).
- The network ID is the number before the network name (e.g., 6001381469).
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
