import { NextResponse } from 'next/server';

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

    console.log(`[WeSafe API] Starting scrape for ${reqNo}...`);

    // 1. Get Login Page
    const loginRes = await fetch('https://wesafe.pea.co.th/admin/login.aspx');
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

    let cookieStr = getCookies(loginRes.headers).join('; ');

    const authRes = await fetch('https://wesafe.pea.co.th/admin/login.aspx', {
      method: 'POST',
      body: loginData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieStr,
      },
      redirect: 'manual'
    });

    let newCookies = getCookies(authRes.headers);
    let combinedCookies = [...cookieStr.split('; '), ...newCookies].filter(Boolean).join('; ');

    if (authRes.status !== 302) {
         return NextResponse.json({ error: 'Login failed. Please check credentials.' }, { status: 401 });
    }

    const location = authRes.headers.get('location') || '';
    const chooseUrl = location.startsWith('http') ? location : 
                      location.startsWith('/') ? 'https://wesafe.pea.co.th' + location : 
                      'https://wesafe.pea.co.th/admin/' + location;

    // 3. Get Choose Page
    const chooseRes = await fetch(chooseUrl, {
        headers: { 'Cookie': combinedCookies }
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
        },
        redirect: 'manual'
    });

    let chooseCookies = getCookies(choosePostRes.headers);
    let finalCookies = [combinedCookies, ...chooseCookies].filter(Boolean).join('; ');

    // 5. Fetch detail.aspx (Initialization for the session just in case)
    const detailUrl = `https://wesafe.pea.co.th/admin/detail.aspx?WebGetReqNO=${reqNo}`;
    await fetch(detailUrl, { headers: { 'Cookie': finalCookies } });

    // 6. Fetch images from sub-checklists
    const allImages = new Set<string>();
    
    // Checklists 1 to 5 to make sure we cover everything
    for (let i = 1; i <= 5; i++) {
        const detailSubUrl = `https://wesafe.pea.co.th/admin/detailsub.aspx?WebGetReqNO=${reqNo}&WebGetCheckList=${i}`;
        const imgRes = await fetch(detailSubUrl, {
            headers: { 'Cookie': finalCookies }
        });
        const html = await imgRes.text();
        
        const imgMatches = html.match(/<img[^>]+src\s*=\s*"([^">]+)"/ig);
        if (imgMatches) {
            imgMatches.forEach(img => {
                const srcMatch = img.match(/src\s*=\s*"([^">]+)"/i);
                if (srcMatch && srcMatch[1]) {
                    // Only add .jpg / .png images from imgwesafe
                    if (srcMatch[1].includes('imgwesafe')) {
                        allImages.add(srcMatch[1]);
                    }
                }
            });
        }
    }

    const imagesArray = Array.from(allImages);
    console.log(`[WeSafe API] Found ${imagesArray.length} images for ${reqNo}`);

    return NextResponse.json({
      success: true,
      message: 'Scraping successful',
      images: imagesArray.slice(0, 4) // Return first 4 images to match UI
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape images', details: error.message },
      { status: 500 }
    );
  }
}
