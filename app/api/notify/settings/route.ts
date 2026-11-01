import { NextResponse } from 'next/server';
import { getLineNotificationSetting, setLineNotificationSetting, isAdminCha } from '../../../../lib/notifySettings';

export async function GET() {
  try {
    const setting = await getLineNotificationSetting();
    return NextResponse.json({
      success: true,
      enabled: setting.enabled,
      updated_at: setting.updated_at,
      updated_by: setting.updated_by
    });
  } catch (error: any) {
    console.error('Error fetching LINE notification setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enabled, adminKey } = body;

    // ตรวจสอบสิทธิ์ว่าใช่ admin Cha16072534 หรือไม่
    if (!isAdminCha(adminKey)) {
      return NextResponse.json(
        { 
          error: 'สิทธิ์ไม่ถูกต้อง: เฉพาะ user admin Cha16072534 เท่านั้นที่มีสิทธิ์เปิดหรือปิดการแจ้งเตือน LINE' 
        },
        { status: 403 }
      );
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'ค่า enabled ต้องเป็น boolean (true หรือ false)' },
        { status: 400 }
      );
    }

    const result = await setLineNotificationSetting(enabled, 'Cha16072534');

    if (!result.success) {
      return NextResponse.json(
        { error: 'ไม่สามารถบันทึกการตั้งค่าได้', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enabled: result.setting.enabled,
      updated_at: result.setting.updated_at,
      updated_by: result.setting.updated_by,
      message: enabled
        ? 'เปิดการแจ้งเตือนผ่าน LINE เรียบร้อยแล้ว'
        : 'ปิดการแจ้งเตือนผ่าน LINE เรียบร้อยแล้ว'
    });
  } catch (error: any) {
    console.error('Error updating LINE notification setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
