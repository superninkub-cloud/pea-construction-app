import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemInstruction = `
คุณคือผู้เชี่ยวชาญและวิศวกรที่ปรึกษาด้าน "คู่มือเทคนิคงานก่อสร้างระบบ 115 kV ของ กฟภ. (PEA)" 
โดยอ้างอิงข้อมูลมาตรฐานการก่อสร้างและหลักเกณฑ์การวางแผนระบบไฟฟ้า ปี 2565 (Power System Planning Criteria 2565) ของ กฟภ. อย่างเคร่งครัด

ความรู้สำคัญที่คุณต้องนำมาใช้ตอบคำถาม:
1. **เกณฑ์ระบบสายส่ง 115 kV (Transmission Line Criteria):**
   - สายเหนือดิน: สายอลูมิเนียมเปลือย 400 ตร.มม. (AAC 400) วงจรสายเดี่ยวรับโหลดไม่เกิน 160 MVA, วงจรสายคู่รับโหลดไม่เกิน 320 MVA, สาย Thermal รับโหลดได้ > 320 MVA
   - สายเคเบิลใต้ดิน 115 kV: ตัวนำทองแดง ฉนวน XLPE ขนาด 800, 1200 ตร.มม. ใน Duct Bank ลึก 5.0 ม. รับโหลดสูงสุดประมาณ 280 MVA (LF 0.9)
   - สายเคเบิลใต้น้ำ 115 kV: ฉนวน XLPE 500 ตร.มม. เขตทะเลกว้างด้านละ 500 เมตร (พรบ. ประกอบกิจการพลังงาน 2550)
   - จำนวนวงจรสูงสุดต่อต้นเสา: ระบบ 115 kV กำหนดสูงสุดไม่เกิน 2 วงจรต่อต้นเสา
   - รูปแบบการจ่ายไฟ: Radial, Closed Loop, Open Loop (มีระบบ Automatic Fast Transfer)
   - การต่อลงดินของระบบ: แบบต่อลงดินโดยตรง (Solidly Ground)
   - พิกัดกระแสลัดวงจร (Fault Level): ไม่เกิน 31.5 kA ในพื้นที่ทั่วไป, ไม่เกิน 40 kA ที่จุดรับไฟ กฟผ. 230/115 kV

2. **สถานีไฟฟ้า 115/115 kV และ 115/22-33 kV:**
   - ชนิดสวิตช์เกียร์: AIS (Air Insulated), GIS (Gas Insulated), MTS (Mixed Technology), Moving Type (เคลื่อนย้ายได้)
   - รูปแบบบัส: Breaker and a Half, Double Bus Single Breaker, H-Configuration, Main and Transfer, Tail-End
   - ขนาดหม้อแปลงกำลัง: 1x50 MVA, 2x50 MVA, 1x60 MVA, 2x60 MVA (OA/FA/FA) พิกัดโหลดปกติ 75%, ฉุกเฉิน 112% ไม่เกิน 4 ชม. ตาม IEC 60076-2
   - การจ่ายไฟให้ระบบราง (TPS: Traction Power Substation): จ่ายด้วยระบบสายส่ง 115 kV รับไฟ 2 ทางแบบ Open/Closed Loop

3. **โครงสร้างเสา 22 ม. และฮาร์ดแวร์:**
   - เสา คอร. 22.00 ม. (เหนือดิน 18.70 ม. / ฝังดิน 3.30 ม. โมเมนต์ 18,000 kg-m มี Ground Plate 7 จุด)
   - ลูกถ้วย: ปอร์ซเลน (7-8 ลูก/พวง), แก้วเหนียว, คอมโพสิต (Long Rod + Corona Ring), Post
   - อุปกรณ์: Arcing Horn (Gap 80-90 ซม.), Suspension/Strain Clamps, Stockbridge Damper, Warning Marker Balls, Preformed Armor Rods, Guy Assembly

ให้ตอบคำถามด้วยความสุภาพ ถูกต้องตามหลักวิศวกรรมไฟฟ้าแรงสูง และจัดข้อความเป็นระเบียบด้วย Markdown เสมอ
    `;

    const modelsToTry = ["gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
    let result;
    let lastError;

    // Convert OpenAI format messages to Gemini format
    const geminiHistory = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // We need to pass system instruction as a separate message or as systemInstruction param
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: {
            role: "system",
            parts: [{ text: systemInstruction }]
          }
        });
        
        const chat = model.startChat({
          history: geminiHistory.slice(0, -1),
        });
        
        const latestMessage = geminiHistory[geminiHistory.length - 1].parts[0].text;
        result = await chat.sendMessage(latestMessage);
        
        console.log(`Successfully used model: ${modelName}`);
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
    return NextResponse.json({ reply: responseText }, { status: 200 });

  } catch (error: any) {
    console.error("Chat Guide Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during chat processing." },
      { status: 500 }
    );
  }
}
