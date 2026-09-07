export async function sendLinePushMessage(targetId: string, messages: any[]): Promise<{success: boolean, error?: any}> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!token) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN is not defined");
    return { success: false, error: "LINE_CHANNEL_ACCESS_TOKEN is not defined" };
  }

  if (!targetId) {
    console.error("LINE_TARGET_ID is not defined");
    return { success: false, error: "LINE_TARGET_ID is not defined" };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        to: targetId,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error sending LINE message:", errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to send LINE message:", error);
    return { success: false, error: error.message };
  }
}
