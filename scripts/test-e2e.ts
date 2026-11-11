import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function request(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  } = {}
) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else if (contentType.includes('text') || contentType.includes('xml')) {
    data = await res.text();
  } else {
    data = await res.arrayBuffer();
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
  };
}

async function runTests() {
  console.log('🧪 Starting End-to-End Verification Suite for FMKAL Vehicle Contact System...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(
      health.status === 200 && health.data?.status === 'ok',
      'Health Check Endpoint (/api/health)',
      `Status: ${health.data?.status}`
    );

    // 2. Direct Visit Privacy Protection (Lock Screen on /)
    const directHome = await request('/');
    assert(
      directHome.status === 200 &&
        typeof directHome.data === 'string' &&
        directHome.data.includes('차량 실물 QR 코드를'),
      'Direct Visit QR Gate Protection (/)',
      'Direct visits without QR scan show private lock screen'
    );
    assert(
      typeof directHome.data === 'string' && directHome.data.includes('FMKAL'),
      'Public Lock Screen Branding',
      'Contains FMKAL branding'
    );

    // 3. QR Scan Visit (/car?src=qr)
    const qrScannedPage = await request('/car?src=qr');
    assert(
      qrScannedPage.status === 200 &&
        typeof qrScannedPage.data === 'string' &&
        qrScannedPage.data.includes('차량 연락 센터') &&
        qrScannedPage.data.includes('WhatsApp'),
      'QR Scan Authorized Contact Page (/car?src=qr)',
      'Loaded contact channels successfully upon QR scan'
    );

    // 4. Analytics Event Tracking
    const trackEvent = await request('/api/track', {
      method: 'POST',
      body: { event: 'click_whatsapp', source: 'qr' },
    });
    assert(
      trackEvent.status === 200 && trackEvent.data?.success === true,
      'Analytics Event Tracking (/api/track)',
      'click_whatsapp recorded'
    );

    const trackQr = await request('/api/track', {
      method: 'POST',
      body: { event: 'qr_scan', source: 'qr' },
    });
    assert(
      trackQr.status === 200 && trackQr.data?.success === true,
      'QR Scan Event Tracking (/api/track)',
      'qr_scan recorded'
    );

    // 5. Admin Authentication - Invalid Password Check
    const badLogin = await request('/api/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'wrongpassword999' },
    });
    assert(
      badLogin.status === 401,
      'Admin Auth Rejection',
      'Rejected invalid credentials with 401'
    );

    // 6. Admin Authentication - Valid Login
    const goodLogin = await request('/api/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'admin1234!' },
    });
    assert(
      goodLogin.status === 200 && goodLogin.data?.success === true,
      'Admin Auth Success',
      `Welcome ${goodLogin.data?.user?.username}`
    );

    // Extract cookie
    const setCookie = goodLogin.headers.get('set-cookie') || '';
    const tokenMatch = setCookie.match(/fmkal_admin_token=([^;]+)/);
    const cookieHeader = tokenMatch ? `fmkal_admin_token=${tokenMatch[1]}` : '';

    // 7. Verify Admin Session (/api/admin/me)
    const sessionRes = await request('/api/admin/me', {
      headers: { Cookie: cookieHeader },
    });
    assert(
      sessionRes.status === 200 && sessionRes.data?.authenticated === true,
      'Admin Session Verification (/api/admin/me)',
      `Authenticated as ${sessionRes.data?.user?.username}`
    );

    // 8. Fetch Admin Settings (/api/admin/settings)
    const settingsRes = await request('/api/admin/settings', {
      headers: { Cookie: cookieHeader },
    });
    assert(
      settingsRes.status === 200 && settingsRes.data?.carModel.includes('Kia Ray'),
      'Fetch Vehicle Settings (/api/admin/settings)',
      `Car: ${settingsRes.data?.carModel}`
    );

    // 9. Update Admin Settings
    const updateRes = await request('/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader },
      body: {
        phoneNumber: '010-9876-5432',
        whatsAppNumber: '+82 10-9876-5432',
        kakaoTalkUrl: 'https://open.kakao.com/o/sFMKAL',
        status: 'available',
        statusText: '연락 가능 · 통화 및 메시지 환영',
      },
    });
    assert(
      updateRes.status === 200 &&
        updateRes.data?.phoneNumber === '010-9876-5432' &&
        updateRes.data?.kakaoTalkUrl === 'https://open.kakao.com/o/sFMKAL',
      'Update Vehicle Settings (/api/admin/settings)',
      `Phone: ${updateRes.data?.phoneNumber}, Kakao: ${updateRes.data?.kakaoTalkUrl}`
    );

    // 10. Fetch Analytics Dashboard Summary
    const analyticsRes = await request('/api/admin/analytics', {
      headers: { Cookie: cookieHeader },
    });
    assert(
      analyticsRes.status === 200 &&
        analyticsRes.data?.totalVisits >= 0 &&
        analyticsRes.data?.clicks?.whatsapp >= 1,
      'Analytics Dashboard Data (/api/admin/analytics)',
      `Total Clicks: ${analyticsRes.data?.totalClicks}, WhatsApp: ${analyticsRes.data?.clicks?.whatsapp}`
    );

    // 11. QR Code Generation - JSON Format
    const qrJson = await request('/api/admin/qr?format=json&size=512');
    assert(
      qrJson.status === 200 &&
        typeof qrJson.data?.dataUrl === 'string' &&
        qrJson.data?.dataUrl.startsWith('data:image/png;base64,'),
      'QR Code JSON/DataURL Generation (/api/admin/qr?format=json)',
      `Target: ${qrJson.data?.targetUrl}`
    );

    // 12. QR Code Generation - SVG Format
    const qrSvg = await request('/api/admin/qr?format=svg&ec=H');
    assert(
      qrSvg.status === 200 &&
        typeof qrSvg.data === 'string' &&
        qrSvg.data.includes('<svg'),
      'QR Code High-Error-Correction SVG Generation (/api/admin/qr?format=svg)',
      'Valid scalable SVG output'
    );

    // 13. QR Code Generation - High-Res PNG Format (2048px)
    const qrPng = await request('/api/admin/qr?format=png&size=2048&download=true');
    assert(
      qrPng.status === 200 &&
        qrPng.headers.get('content-type')?.includes('image/png') &&
        qrPng.data instanceof ArrayBuffer &&
        qrPng.data.byteLength > 5000,
      'High-Resolution 2048px PNG QR Generation (/api/admin/qr?format=png)',
      `Size: ${(qrPng.data.byteLength / 1024).toFixed(1)} KB`
    );

    // 14. Admin Logout
    const logoutRes = await request('/api/admin/logout', {
      method: 'POST',
      headers: { Cookie: cookieHeader },
    });
    assert(
      logoutRes.status === 200 && Boolean(logoutRes.data?.success),
      'Admin Logout (/api/admin/logout)',
      'Cookie invalidated'
    );

    // 15. Search Engine Crawler Blocking (robots.txt)
    const robotsRes = await request('/robots.txt');
    assert(
      robotsRes.status === 200 &&
        typeof robotsRes.data === 'string' &&
        robotsRes.data.includes('Disallow: /'),
      'Search Engine Exclusion (/robots.txt)',
      'All crawlers blocked with Disallow: /'
    );

    // 16. Anti-Indexing HTTP Header (X-Robots-Tag)
    const homeRes = await request('/');
    const xRobots = homeRes.headers.get('x-robots-tag') || '';
    assert(
      xRobots.includes('noindex') && xRobots.includes('nofollow'),
      'HTTP Anti-Indexing Header (X-Robots-Tag)',
      `Header: ${xRobots}`
    );

    console.log(`\n========================================`);
    console.log(`🏁 TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
