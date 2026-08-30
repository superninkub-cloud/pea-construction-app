import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../../lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 1. Fetch current projects data as context
    const { data: projects, error } = await supabase
      .from("projects")
      .select("wbs, name, status, supervisor, value, open_year, check1, check2, check3, check4, check5, check6");

    if (error) {
      console.error("Error fetching projects for copilot:", error);
      return NextResponse.json({ error: "Failed to fetch project data context" }, { status: 500 });
    }

    // 2. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. Construct context
    const systemInstruction = `
คุณคือ "PEA Copilot" ผู้ช่วยอัจฉริยะสำหรับเจ้าหน้าที่การไฟฟ้าส่วนภูมิภาค (PEA) แผนกก่อสร้าง
หน้าที่ของคุณคือการตอบคำถามของผู้ใช้งานเกี่ยวกับโครงการก่อสร้างต่างๆ โดยอ้างอิงจากข้อมูล JSON ด้านล่างนี้เท่านั้น
หากผู้ใช้ถามเรื่องที่ไม่มีในข้อมูล ให้ตอบว่า "ขออภัยครับ/ค่ะ ไม่มีข้อมูลในระบบสำหรับคำถามนี้"
พยายามตอบให้สั้น กระชับ เข้าใจง่าย เป็นมิตร และใช้ภาษาไทยเป็นหลัก

ความหมายของสถานะต่างๆ (check1-6):
check1 = ก่อสร้างเสร็จหน้างาน
check2 = ส่งคืนเศษสาย
check3 = ส่งคืนเศษเหล็ก
check4 = ทำ PM/ADS
check5 = ตรวจมาตรฐาน
check6 = จ่ายใบสำคัญ/รับโอนงบ (TECO)

ข้อมูลโครงการปัจจุบัน (JSON):
${JSON.stringify(projects)}

คำถามจากผู้ใช้: ${prompt}
    `;

    // 4. Generate response
    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });

  } catch (error) {
    console.error("Error in copilot API:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
