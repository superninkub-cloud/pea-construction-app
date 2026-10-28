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

    // แจ้งเตือนผ่าน LINE เฉพาะเมื่อมีการอัพเดทสถานะงานก่อสร้าง เท่านั้น (job_status หรือ photo_upload)
    if (type !== 'job_status' && type !== 'photo_upload') {
      return NextResponse.json({ 
        success: true, 
        message: `Notification for '${type}' is disabled. Only construction status updates are sent to LINE.` 
      });
    }

    let messages: any[] = [];

    if (type === 'job_status') {
       const { wbs, status, project_name, remarks } = payload;
       let text = `📢 [อัพเดทสถานะงาน]\n📌 งาน: ${wbs}\n📑 ชื่อ: ${project_name || '-'}\n🔄 สถานะ: ${status || '-'}`;
       if (remarks) {
         text += `\n📝 ความคืบหน้า: ${remarks}`;
       }
       messages = [
         {
           type: 'text',
           text: text
         }
       ];
    } else if (type === 'photo_upload') {
       const { wbs, project_name, image_url, image_count } = payload;
       const countLabel = image_count && Number(image_count) > 1 ? ` (${image_count} รูป)` : '';
       messages = [
         {
           type: 'text',
           text: `📸 [อัพโหลดรูปถ่าย${countLabel}]\n📌 งาน: ${wbs}\n📑 ชื่อ: ${project_name || '-'}`
         },
         {
           type: 'image',
           originalContentUrl: image_url,
           previewImageUrl: image_url
         }
       ];
    }

    const result = await sendLinePushMessage(targetId, messages);

    if (result && result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send line message', details: result?.error }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in notify API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
