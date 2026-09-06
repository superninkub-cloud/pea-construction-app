import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // LINE sends an array of events
    if (body.events && body.events.length > 0) {
      for (const event of body.events) {
        if (event.type === 'message' && event.message.type === 'text') {
          const text = event.message.text;
          const source = event.source;

          // If someone types "ทดสอบ", reply with their Group ID or User ID
          if (text === 'ทดสอบ') {
            const replyToken = event.replyToken;
            let targetId = '';
            
            if (source.type === 'group') {
              targetId = source.groupId;
            } else if (source.type === 'room') {
              targetId = source.roomId;
            } else {
              targetId = source.userId;
            }

            // Reply back
            const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
            if (token) {
              await fetch("https://api.line.me/v2/bot/message/reply", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  replyToken: replyToken,
                  messages: [
                    {
                      type: 'text',
                      text: `การเชื่อมต่อสำเร็จ!\nนำรหัสนี้ไปใส่ใน .env.local ตรง LINE_TARGET_ID\n\nรหัสของคุณคือ:\n${targetId}`
                    }
                  ]
                })
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error in LINE Webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
