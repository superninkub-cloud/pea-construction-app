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

    const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

    const DEFAULT_HEADERS = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
    };

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
        
        // Parse old cookies - split on FIRST '=' only (values may contain '=' in base64)
        oldCookieStr.split(';').forEach(c => {
            const idx = c.trim().indexOf('=');
            if (idx > 0) {
                const k = c.trim().substring(0, idx);
                const v = c.trim().substring(idx + 1);
                if (k) cookieMap.set(k, v);
            }
        });

        // Parse new cookies - split on FIRST '=' only
        newCookiesArr.forEach(c => {
            const idx = c.trim().indexOf('=');
            if (idx > 0) {
                const k = c.trim().substring(0, idx);
                const v = c.trim().substring(idx + 1);
                if (k) cookieMap.set(k, v);
            }
        });

        return Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
    };

    let cookieStr = getCookies(loginRes.headers).join('; ');

    const authRes = await fetch('https://wesafe.pea.co.th/admin/login.aspx', {
      method: 'POST',
      body: loginData,
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieStr,
        'Origin': 'https://wesafe.pea.co.th',
        'Referer': 'https://wesafe.pea.co.th/admin/login.aspx'
      },
      redirect: 'manual'
    });

    let newCookies = getCookies(authRes.headers);
    let combinedCookies = mergeCookies(cookieStr, newCookies);

    const location = authRes.headers.get('location') || '';
    const debugSteps: string[] = [
        `login status: ${authRes.status}`,
        `login location: ${location}`,
        `login cookies received: ${newCookies.join(', ')}`,
        `combined cookies after login: ${combinedCookies.substring(0, 100)}...`
    ];

    if (authRes.status !== 302 && authRes.status !== 303) {
         return NextResponse.json({ 
             error: 'Login failed. Please check credentials.',
             debug: debugSteps
         }, { status: 401 });
    }

    const chooseUrl = location.startsWith('http') ? location : 
                      location.startsWith('/') ? 'https://wesafe.pea.co.th' + location : 
                      'https://wesafe.pea.co.th/admin/' + location;

    // 3. Get Choose Page
    const chooseRes = await fetch(chooseUrl, {
        headers: { 
            ...DEFAULT_HEADERS,
            'Cookie': combinedCookies
        }
    });
    const chooseHtml = await chooseRes.text();
    const vs2 = extractVal(chooseHtml, '__VIEWSTATE');
    const vsg2 = extractVal(chooseHtml, '__VIEWSTATEGENERATOR');
    const ev2 = extractVal(chooseHtml, '__EVENTVALIDATION');
    debugSteps.push(`choose GET status: ${chooseRes.status}, url: ${chooseUrl}`);
    debugSteps.push(`choose VIEWSTATE found: ${!!vs2}, html_len: ${chooseHtml.length}`);

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
            ...DEFAULT_HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': combinedCookies
        },
        redirect: 'manual'
    });

    let chooseCookies = getCookies(choosePostRes.headers);
    let finalCookies = mergeCookies(combinedCookies, chooseCookies);
    debugSteps.push(`choose POST status: ${choosePostRes.status}`);
    debugSteps.push(`choose POST location: ${choosePostRes.headers.get('location')}`);
    debugSteps.push(`choose POST new cookies: ${chooseCookies.join(', ')}`);
    debugSteps.push(`final cookies: ${finalCookies.substring(0, 150)}...`);

    // 5. Fetch detail.aspx (Initialization for the session just in case)
    const detailUrl = `https://wesafe.pea.co.th/admin/detail.aspx?WebGetReqNO=${reqNo}`;
    await fetch(detailUrl, { 
        headers: { 
            ...DEFAULT_HEADERS,
            'Cookie': finalCookies
        } 
    });

    // 6. Fetch images from ALL sub-checklists IN PARALLEL (much faster than sequential)
    const checklistNums = [1, 2, 3, 4, 5];
    const checklistResults = await Promise.all(
        checklistNums.map(async (i) => {
            const detailSubUrl = `https://wesafe.pea.co.th/admin/detailsub.aspx?WebGetReqNO=${reqNo}&WebGetCheckList=${i}`;
            try {
                const imgRes = await fetch(detailSubUrl, {
                    headers: {
                        ...DEFAULT_HEADERS,
                        'Cookie': finalCookies
                    }
                });
                const html = await imgRes.text();
                const urls: string[] = [];
                
                const imgMatches = html.match(/<img[^>]+src\s*=\s*"([^">]+)"/ig);
                if (imgMatches) {
                    imgMatches.forEach(img => {
                        const srcMatch = img.match(/src\s*=\s*"([^">]+)"/i);
                        if (srcMatch && srcMatch[1]) {
                            const src = srcMatch[1];
                            // Exclude logos and assets, only include actual uploaded photos
                            if (!src.includes('pea-logo') && !src.includes('assets/') && 
                                (src.includes('imgwesafe') || src.match(/\.(jpg|jpeg|png|gif)/i))) {
                                const fullUrl = src.startsWith('http') ? src :
                                                src.startsWith('/') ? 'https://wesafe.pea.co.th' + src :
                                                'https://wesafe.pea.co.th/admin/' + src;
                                urls.push(fullUrl);
                            }
                        }
                    });
                }
                return urls;
            } catch (e) {
                return [];
            }
        })
    );

    // Flatten results preserving order
    const imagesArray = checklistResults.flat().slice(0, 4);
    console.log(`[WeSafe API] Found ${imagesArray.length} images for ${reqNo}`);
    const debugInfo: string[] = [`Found ${imagesArray.length} images`];

    console.log('[WeSafe API] Image URLs:', imagesArray);

    return NextResponse.json({
      success: true,
      message: 'Scraping successful',
      images: imagesArray,
      debug: debugSteps
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape images', details: error.message },
      { status: 500 }
    );
  }
}
