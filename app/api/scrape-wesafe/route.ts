import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow up to 60 seconds for Vercel

function extractVal(html: string, name: string) {
    const regex = new RegExp(`name="${name}"\\s+(?:id="${name}"\\s+)?value="([^"]*)"`);
    const match = html.match(regex);
    return match ? match[1] : '';
}

export async function POST(req: Request) {
  try {
    const { url, username, password } = await req.json();

    if (!url || !username || !password) {
      return NextResponse.json({ error: 'URL, username, and password are required' }, { status: 400 });
    }

    // Extract Request NO from URL
    const urlObj = new URL(url);
    const reqNo = urlObj.searchParams.get('WebGetReqNO');
    if (!reqNo) {
        return NextResponse.json({ error: 'Invalid URL format. Missing WebGetReqNO.' }, { status: 400 });
    }

    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';

    console.log(`[WeSafe API] Starting scrape for ${reqNo}...`);

    // 1. Get Login Page
    const loginRes = await fetch('https://wesafe.pea.co.th/admin/login.aspx', {
        headers: { 'User-Agent': USER_AGENT }
    });
    if (!loginRes.ok) throw new Error('Failed to load login page');
    const loginHtml = await loginRes.text();
    
    const viewState = extractVal(loginHtml, '__VIEWSTATE');
    const viewStateGen = extractVal(loginHtml, '__VIEWSTATEGENERATOR');
    const eventValidation = extractVal(loginHtml, '__EVENTVALIDATION');

    // 2. Post Login
    const loginData = new URLSearchParams();
    loginData.append('__VIEWSTATE', viewState);
    loginData.append('__VIEWSTATEGENERATOR', viewStateGen);
    loginData.append('__EVENTVALIDATION', eventValidation);
    loginData.append('TextBox1', username);
    loginData.append('TextBox2', password);
    loginData.append('Button1', 'Login');

    const getCookies = (headers: Headers) => {
        const setCookies = headers.getSetCookie ? headers.getSetCookie() : [];
        return setCookies.map(c => c.split(';')[0].trim());
    };

    const mergeCookies = (oldCookieStr: string, newCookiesArr: string[]) => {
        const cookieMap = new Map<string, string>();
        
        // Parse old
        oldCookieStr.split(';').forEach(c => {
            const [k, v] = c.trim().split('=');
            if (k && v) cookieMap.set(k, v);
        });

        // Parse new
        newCookiesArr.forEach(c => {
            const [k, v] = c.trim().split('=');
            if (k && v) cookieMap.set(k, v);
        });

        return Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    };

    let cookieStr = getCookies(loginRes.headers).join('; ');

    const authRes = await fetch('https://wesafe.pea.co.th/admin/login.aspx', {
      method: 'POST',
      body: loginData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieStr,
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Origin': 'https://wesafe.pea.co.th',
        'Referer': 'https://wesafe.pea.co.th/admin/login.aspx'
      },
      redirect: 'manual'
    });

    let newCookies = getCookies(authRes.headers);
    let combinedCookies = mergeCookies(cookieStr, newCookies);

    const location = authRes.headers.get('location') || '';

    if (authRes.status !== 302 && authRes.status !== 303) {
         return NextResponse.json({ 
             error: 'Login failed. Please check credentials.',
             debug: {
                 status: authRes.status,
                 cookieSent: cookieStr,
                 cookieReceived: newCookies,
                 location: location
             }
         }, { status: 401 });
    }

    const chooseUrl = location.startsWith('http') ? location : 
                      location.startsWith('/') ? 'https://wesafe.pea.co.th' + location : 
                      'https://wesafe.pea.co.th/admin/' + location;

    // 3. Get Choose Page
    const chooseRes = await fetch(chooseUrl, {
        headers: { 
            'Cookie': combinedCookies,
            'User-Agent': USER_AGENT
        }
    });
    const chooseHtml = await chooseRes.text();
    const vs2 = extractVal(chooseHtml, '__VIEWSTATE');
    const vsg2 = extractVal(chooseHtml, '__VIEWSTATEGENERATOR');
    const ev2 = extractVal(chooseHtml, '__EVENTVALIDATION');

    // 4. Post Choose Page (Select Operation and Maintenance)
    const chooseData = new URLSearchParams();
    chooseData.append('__VIEWSTATE', vs2);
    chooseData.append('__VIEWSTATEGENERATOR', vsg2);
    chooseData.append('__EVENTVALIDATION', ev2);
    chooseData.append('one', 'RadioButton2');
    chooseData.append('Button1', 'เลือก');

    const choosePostRes = await fetch(chooseUrl, {
        method: 'POST',
        body: chooseData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': combinedCookies,
            'User-Agent': USER_AGENT
        },
        redirect: 'manual'
    });

    let chooseCookies = getCookies(choosePostRes.headers);
    let finalCookies = mergeCookies(combinedCookies, chooseCookies);

    // 5. Fetch detail.aspx (Initialization for the session just in case)
    const detailUrl = `https://wesafe.pea.co.th/admin/detail.aspx?WebGetReqNO=${reqNo}`;
    await fetch(detailUrl, { 
        headers: { 
            'Cookie': finalCookies,
            'User-Agent': USER_AGENT
        } 
    });

    // 6. Fetch images from sub-checklists
    const allImages = new Set<string>();
    const debugInfo: string[] = [];
    
    // Checklists 1 to 5 to make sure we cover everything
    for (let i = 1; i <= 5; i++) {
        const detailSubUrl = `https://wesafe.pea.co.th/admin/detailsub.aspx?WebGetReqNO=${reqNo}&WebGetCheckList=${i}`;
        const imgRes = await fetch(detailSubUrl, {
            headers: { 
                'Cookie': finalCookies,
                'User-Agent': USER_AGENT
            }
        });
        const html = await imgRes.text();
        
        debugInfo.push(`CheckList ${i}: status=${imgRes.status}, html_len=${html.length}`);
        
        const imgMatches = html.match(/<img[^>]+src\s*=\s*"([^">]+)"/ig);
        if (imgMatches) {
            debugInfo.push(`CheckList ${i}: found ${imgMatches.length} img tags`);
            imgMatches.forEach(img => {
                const srcMatch = img.match(/src\s*=\s*"([^">]+)"/i);
                if (srcMatch && srcMatch[1]) {
                    const src = srcMatch[1];
                    debugInfo.push(`  src: ${src}`);
                    // Handle both absolute and relative paths
                    if (src.includes('imgwesafe') || src.match(/\.(jpg|jpeg|png|gif)/i)) {
                        const fullUrl = src.startsWith('http') ? src : 
                                        src.startsWith('/') ? 'https://wesafe.pea.co.th' + src :
                                        'https://wesafe.pea.co.th/admin/' + src;
                        allImages.add(fullUrl);
                    }
                }
            });
        } else {
            debugInfo.push(`CheckList ${i}: no img tags found`);
        }
    }

    const imagesArray = Array.from(allImages).slice(0, 4);
    console.log(`[WeSafe API] Found ${imagesArray.length} images for ${reqNo}`);
    console.log('[WeSafe API] Debug:', debugInfo);

    console.log('[WeSafe API] Image URLs:', imagesArray);

    return NextResponse.json({
      success: true,
      message: 'Scraping successful',
      images: imagesArray,
      debug: debugInfo
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape images', details: error.message },
      { status: 500 }
    );
  }
}
