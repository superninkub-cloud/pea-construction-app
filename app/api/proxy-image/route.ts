// No imports needed - using native Web API Response

// Lightweight proxy to fetch WeSafe images bypassing CORS
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imgUrl = searchParams.get('url');

  if (!imgUrl || !imgUrl.startsWith('https://wesafe.pea.co.th/')) {
    return new Response('Invalid URL', { status: 400 });
  }

  try {
    const response = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://wesafe.pea.co.th/'
      }
    });

    if (!response.ok) {
      return new Response(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    const rawContentType = response.headers.get('content-type') || 'image/jpeg';
    const contentType = rawContentType.split(';')[0].trim();

    // Stream the response body directly
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    return new Response(`Proxy error: ${error.message}`, { status: 500 });
  }
}
