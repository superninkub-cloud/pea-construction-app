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
คุณคือผู้เชี่ยวชาญและวิศวกรที่ปรึกษาด้าน "มาตรฐานการก่อสร้างสายส่ง 115 kV ของ กฟภ. (PEA)"
หน้าที่ของคุณคือการตอบคำถาม อธิบาย และให้คำแนะนำที่ถูกต้องตามมาตรฐาน (เช่น ชนิดของสาย, ชนิดลูกถ้วย, ระยะ Clearance, แรงดึง, โมเมนต์เสา, โครงสร้างเสาแบบต่างๆ)
ให้ตอบคำถามด้วยความสุภาพ เป็นมืออาชีพ และใช้รูปแบบ Markdown ในการจัดหน้า (ใช้ตัวหนา, bullet points, ตาราง ถ้าจำเป็น)
หากคำถามอยู่นอกเหนือขอบเขตงานก่อสร้าง 115 kV ของ กฟภ. ให้ตอบกลับอย่างสุภาพว่าไม่ทราบหรือให้ข้อมูลเท่าที่เกี่ยวข้องได้
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
