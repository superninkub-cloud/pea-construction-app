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
    const wbs = formData.get("wbs") as string | null;
    const projectName = formData.get("projectName") as string | null;
    const scrapData = formData.get("scrapData") as string | null;
    const promptOverride = formData.get("prompt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Parse PDF text using unpdf (Vercel edge friendly)
    const pdfBuffer = new Uint8Array(arrayBuffer);
    const pdf = await getDocumentProxy(pdfBuffer);
    const { text: extractedText } = await extractText(pdf, { mergePages: true });

    let scrapContext = "";
    if (scrapData && scrapData !== "[]" && scrapData !== "") {
      scrapContext = `
ข้อมูลพัสดุประเภทเศษสายไฟที่ต้องคืนตามฐานข้อมูลของงานนี้คือ:
${scrapData}

ข้อควรระวัง: ให้เปรียบเทียบว่ายอดเศษสายที่แสดงในตาราง PDF ตรงกับข้อมูลในฐานข้อมูลของเราหรือไม่ 
(ถ้ามี ให้ระบุว่าพบยอดคืนเศษสายในระบบเป็นเท่าไหร่ และใน PDF เป็นเท่าไหร่ ตรงกันหรือไม่)
`;
    }

    const defaultPrompt = `
คุณคือผู้เชี่ยวชาญระดับสูงด้านการตรวจสอบระบบ SAP งานก่อสร้างและปิดงาน (TECO) ของ กฟภ. (PEA) 
หน้าที่ของคุณคือวิเคราะห์ข้อมูลที่สกัดมาจากเอกสาร ZPSR018 อย่างละเอียดและแม่นยำที่สุด

จงสรุปผลการตรวจสอบความสมบูรณ์และข้อผิดพลาดจากรายงาน ZPSR018 โดยใช้รูปแบบ Markdown ที่สวยงาม ทันสมัย และแยกหัวข้อชัดเจน ดังนี้:

### 📑 รายงานสถานะความพร้อมปิดงานจาก ZPSR018 (TECO Readiness)
**รหัสโครงการ (WBS):** \`${wbs || "-"}\`
**ชื่อโครงการ:** ${projectName || "-"}
---

#### 📊 สรุปผลการตรวจสอบภาพรวม (Executive Summary)
(สรุปสั้นๆ ว่าเอกสาร ZPSR018 ฉบับนี้แสดงให้เห็นว่าโครงการพร้อมปิดงานหรือไม่ มีจุดบกพร่องตรงไหนบ้าง)

#### 🔍 วิเคราะห์ความสมบูรณ์และข้อผิดพลาด (Detailed Inspection)
(วิเคราะห์ตามหัวข้อต่อไปนี้ โดยอ้างอิงจากข้อมูลที่มีใน ZPSR018 เท่านั้น ใช้สัญลักษณ์ ✅ สำหรับสิ่งที่ถูกต้อง/สมบูรณ์ และ ❌ สำหรับข้อผิดพลาด/ยังไม่สมบูรณ์)

**1. 💰 งบประมาณและค่าใช้จ่ายจริง (Budget vs Actual Cost)**
- ตรวจสอบว่า "รวมค่าใช้จ่ายจริง" (Actual Cost) เกิน "งบประมาณที่ได้รับจัดสรร" (Budget) หรือไม่
- (ถ้าเกิน ให้ระบุเป็นข้อผิดพลาด ❌)

**2. 📦 ยอดผูกพันคงค้าง (Open Commitments / PR & PO)**
- ตรวจสอบว่ามียอด "ภาระผูกพัน" (Commitment) คงเหลือในรายงานหรือไม่
- (ถ้ามียอด > 0 แสดงว่ามี PR/PO ค้างรับของหรือค้างจ่ายเงิน ให้ระบุเป็นข้อผิดพลาด ❌)

**3. 🛠️ การเบิก-จ่ายพัสดุเข้างาน (Material Issues)**
- ตรวจสอบยอดรวมของพัสดุเข้างานว่ามีการตั้งเบิกและจ่ายของเรียบร้อยหรือไม่ (ถ้าเอกสารมีการแสดงยอดค้างจ่าย ให้ระบุ ❌)
${scrapContext ? `\n**4. ♻️ การคืนเศษสายไฟ/วัสดุ (Scrap Return)**\n- ${scrapContext}` : ""}

**5. 👷 ค่าแรงและค่าใช้จ่ายอื่นๆ (Labor & Misc. Costs)**
- ตรวจสอบว่ามีการบันทึกยอด ค่าแรง, ค่าขนส่ง หรือค่าควบคุมงาน หรือไม่
- (หากเป็น 0 ทั้งหมด อาจเป็นข้อสังเกตว่าลืมลงค่าแรงหรือไม่ ⚠️)

---
#### 💡 ข้อเสนอแนะเพื่อแก้ไขข้อผิดพลาด (Actionable Recommendations)
(ให้คำแนะนำว่า หากมีข้อ ❌ จะต้องไปเคลียร์ข้อมูลที่ไหนในระบบ SAP เพื่อให้ ZPSR018 สมบูรณ์และกด TECO ได้)
    `;

    const prompt = promptOverride || defaultPrompt;

    const modelsToTry = ["gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
    let result;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([
          `ข้อมูลจากเอกสาร PDF:\n${extractedText}\n\n`,
          prompt,
        ]);
        console.log(`Successfully used model: ${modelName}`);
        break; // Success!
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        // If it's not a 503 Service Unavailable or 429 Too Many Requests, stop trying
        if (!err.message?.includes("503") && !err.message?.includes("429") && err.status !== 503 && err.status !== 429) {
          break;
        }
      }
    }

    if (!result) {
      throw lastError || new Error("All AI models are currently overloaded. Please try again later.");
    }

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
