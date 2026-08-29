import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    // For Vercel Cron, you can check process.env.CRON_SECRET if configured.
    // For manual testing we might allow it or require a token. 
    // Here we'll just allow it for demonstration purposes.

    // 1. Fetch data
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*");

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json({ error: "Failed to fetch project data" }, { status: 500 });
    }

    // 2. Analyze data to find alerts
    const pendingTeco = projects.filter(p => 
      p.check1 && p.check2 && p.check3 && p.check4 && p.check5 && !p.check6 && p.status !== 'F4'
    );
    const missingWire = projects.filter(p => p.check1 && !p.check2);
    
    // Check if there are any alerts at all
    if (pendingTeco.length === 0 && missingWire.length === 0) {
      return NextResponse.json({ message: "No alerts to send today." });
    }

    // 3. Construct Message
    let message = `\n🚨 [แจ้งเตือนประจำวันจาก PEA Construction App]\n`;
    
    if (pendingTeco.length > 0) {
      message += `\n⚠️ มี ${pendingTeco.length} โครงการที่เอกสารครบ รอ TECO:\n`;
      pendingTeco.slice(0, 5).forEach(p => {
        message += `- ${p.wbs} (${p.supervisor})\n`;
      });
      if (pendingTeco.length > 5) message += `- และอื่นๆ อีก ${pendingTeco.length - 5} โครงการ\n`;
    }

    if (missingWire.length > 0) {
      message += `\n⚠️ มี ${missingWire.length} โครงการที่ก่อสร้างเสร็จแต่ยังไม่คืนเศษสาย:\n`;
      missingWire.slice(0, 5).forEach(p => {
        message += `- ${p.wbs} (${p.supervisor})\n`;
      });
      if (missingWire.length > 5) message += `- และอื่นๆ อีก ${missingWire.length - 5} โครงการ\n`;
    }

    message += `\nกรุณาเข้าสู่ระบบเพื่อตรวจสอบรายละเอียดเพิ่มเติม`;

    // 4. Send to LINE Notify
    const lineToken = process.env.LINE_NOTIFY_TOKEN;
    if (!lineToken) {
      return NextResponse.json({ error: "LINE_NOTIFY_TOKEN is not configured in environment variables" }, { status: 500 });
    }

    const lineResponse = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${lineToken}`
      },
      body: new URLSearchParams({ message: message })
    });

    if (!lineResponse.ok) {
      const errorText = await lineResponse.text();
      console.error("LINE Notify failed:", errorText);
      return NextResponse.json({ error: "Failed to send LINE notification", details: errorText }, { status: 500 });
    }

    return NextResponse.json({ message: "Notification sent successfully", details: message });

  } catch (error) {
    console.error("Error in daily alerts API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
