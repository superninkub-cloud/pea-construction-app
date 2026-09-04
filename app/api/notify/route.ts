import { NextResponse } from 'next/server';
import { sendLinePushMessage } from '../../../lib/line';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body;
    const targetId = process.env.LINE_TARGET_ID;

    if (!targetId) {
      return NextResponse.json({ error: 'LINE_TARGET_ID is not set in env' }, { status: 500 });
    }

    let messages: any[] = [];

    if (type === 'gas_report') {
      const { license_plate, driver_name, fuel_liters, fuel_cost, usage_date } = payload;
      
      const dateStr = new Date(usage_date).toLocaleDateString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      });

      const messageText = `⛽ [แจ้งเตือน] มีรายงานน้ำมันใหม่!\n` +
                          `🚗 ทะเบียน: ${license_plate}\n` +
                          `👨‍🔧 ผู้ขับขี่: ${driver_name}\n` +
                          `📅 วันที่: ${dateStr}\n` +
                          `💧 จำนวน: ${fuel_liters || '-'} ลิตร\n` +
                          `💰 ยอดเงิน: ${fuel_cost || '-'} บาท`;

      messages = [
        {
          type: 'text',
          text: messageText
        }
      ];
    } else if (type === 'job_status') {
       const { wbs, status, project_name } = payload;
       messages = [
         {
           type: 'text',
           text: `📢 [อัพเดทสถานะงาน]\n📌 งาน: ${wbs}\n📑 ชื่อ: ${project_name || '-'}\n🔄 สถานะ: ${status}`
         }
       ];
    } else if (type === 'photo_upload') {
       const { wbs, project_name, image_url } = payload;
       messages = [
         {
           type: 'text',
           text: `📸 [อัพโหลดรูปถ่าย]\n📌 งาน: ${wbs}\n📑 ชื่อ: ${project_name || '-'}`
         },
         {
           type: 'image',
           originalContentUrl: image_url,
           previewImageUrl: image_url
         }
       ];
    } else {
      return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    const success = await sendLinePushMessage(targetId, messages);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send line message' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in notify API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
