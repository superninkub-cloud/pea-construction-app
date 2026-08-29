import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const promptOverride = formData.get("prompt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const defaultPrompt = `
คุณคือผู้เชี่ยวชาญด้านการตรวจสอบระบบ SAP ของ กฟภ. (PEA) หน้าที่ของคุณคือวิเคราะห์ข้อมูลที่สกัดมาจากเอกสาร ZPSR018 และ ZPSE004 
เพื่อตรวจสอบความพร้อมก่อนปิดงานก่อสร้าง (TECO) 

จงตรวจสอบข้อมูลที่แนบมานี้ และสรุปผลตามหัวข้อต่อไปนี้ โดยระบุสถานะว่า "✅ เรียบร้อยแล้ว" หรือ "❌ ยังไม่ดำเนินการ/มีปัญหา" พร้อมคำแนะนำ:

1. การเบิกพัสดุ: ตรวจสอบว่ามีรายการ Reservation ค้างจ่ายหรือไม่ (ต้องไม่มีรายการค้าง)
2. การคืนเศษพัสดุ/เศษสาย: ตรวจสอบรายการพัสดุประเภทเศษสายไฟ หรือเศษวัสดุ ว่ามีการทำรับคืนเข้าคลังครบถ้วนหรือไม่ มียอดคงค้างหน้างานหรือไม่
3. ข้อมูลพัสดุรื้อถอน (ZPSE004): ตรวจสอบว่ามีการบันทึกพัสดุรื้อถอนครบถ้วน และรับเข้าคลังเรียบร้อยแล้วหรือไม่
4. งบประมาณ (Budget vs Actual Cost): ตรวจสอบว่าค่าใช้จ่ายที่เกิดขึ้นจริง (Actual) เกินกว่างบประมาณที่ได้รับจัดสรร (Budget) หรือไม่
5. PR/PO ค้างระบบ: ตรวจสอบว่ามีรายการจัดซื้อจัดจ้างที่ยังไม่ได้รับของหรือเคลียร์ยอด Commitment หรือไม่
    `;

    const prompt = promptOverride || defaultPrompt;

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

    return NextResponse.json({ result: responseText }, { status: 200 });
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during extraction." },
      { status: 500 }
    );
  }
}
