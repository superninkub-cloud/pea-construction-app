export async function sendLinePushMessage(targetId: string, messages: any[]) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!token) {
    console.error("LINE_CHANNEL_ACCESS_TOKEN is not defined");
    return false;
  }

  if (!targetId) {
    console.error("LINE_TARGET_ID is not defined");
    return false;
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
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send LINE message:", error);
    return false;
  }
}
