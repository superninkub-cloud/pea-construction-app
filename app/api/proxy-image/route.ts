import { NextResponse } from 'next/server';

// Lightweight proxy to fetch WeSafe images bypassing CORS
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imgUrl = searchParams.get('url');

  if (!imgUrl || !imgUrl.startsWith('https://wesafe.pea.co.th/')) {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  try {
    const response = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://wesafe.pea.co.th/'
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    const rawContentType = response.headers.get('content-type') || 'image/jpeg';
    const contentType = rawContentType.split(';')[0].trim();

    // Convert ArrayBuffer → Buffer (Node.js) → ReadableStream for response
    const arrayBuffer = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(nodeBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    return new NextResponse(`Proxy error: ${error.message}`, { status: 500 });
  }
}
