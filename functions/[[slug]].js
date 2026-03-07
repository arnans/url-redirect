import { BILINGUAL_SLUGS } from './_bilingual-config.js';

function getCookie(request, name) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? match[1] : null;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const slug = url.pathname.replace(/^\//, '');

  // Only handle bilingual slugs; let everything else fall through to _redirects
  if (!BILINGUAL_SLUGS[slug]) {
    return context.next();
  }

  const langParam = url.searchParams.get('lang');
  const langCookie = getCookie(context.request, 'lang');
  const acceptLang = (context.request.headers.get('Accept-Language') || '').toLowerCase();

  // Priority: ?lang= param > cookie > Accept-Language > default English
  let isThai;
  if (langParam) {
    isThai = langParam === 'th';
  } else if (langCookie) {
    isThai = langCookie === 'th';
  } else {
    isThai = /\bth\b/.test(acceptLang);
  }

  const dest = isThai ? BILINGUAL_SLUGS[slug].th : BILINGUAL_SLUGS[slug].en;
  const autoLabel = isThai ? 'ไทย' : 'English';
  const switchDest = isThai ? `/${slug}?lang=en` : `/${slug}?lang=th`;
  const switchLabel = isThai ? 'Switch to English' : 'เปลี่ยนเป็นไทย';

  // If ?lang= was explicitly set, save cookie and redirect immediately (no interstitial)
  if (langParam) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': dest,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Set-Cookie': `lang=${langParam}; Path=/; SameSite=Lax; Max-Age=31536000`,
      },
    });
  }

  // Always show interstitial with auto-redirect + language switch
  const html = `<!DOCTYPE html>
<html lang="${isThai ? 'th' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Redirecting...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f0f4f8;
      color: #334155;
    }
    .card {
      text-align: center;
      background: white;
      border-radius: 16px;
      padding: 40px 48px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      max-width: 400px;
    }
    .redirecting {
      font-size: 18px;
      margin-bottom: 8px;
    }
    .lang-label {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #1e293b;
    }
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 2px;
      animation: fill 2s linear forwards;
    }
    @keyframes fill {
      from { width: 0%; }
      to { width: 100%; }
    }
    .switch {
      display: inline-block;
      padding: 10px 24px;
      background: #f1f5f9;
      color: #475569;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      transition: background 0.15s;
    }
    .switch:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="redirecting">${isThai ? 'กำลังเปิดหน้า' : 'Redirecting to'}...</div>
    <div class="lang-label">${autoLabel}</div>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <a href="${switchDest}" class="switch">${switchLabel}</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.href = ${JSON.stringify(dest)};
    }, 2000);
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
