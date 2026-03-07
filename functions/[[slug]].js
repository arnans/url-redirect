import { BILINGUAL_SLUGS } from './_bilingual-config.js';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const slug = url.pathname.replace(/^\//, '');

  // Only handle bilingual slugs; let everything else fall through to _redirects
  if (!BILINGUAL_SLUGS[slug]) {
    return context.next();
  }

  // Manual override via ?lang=th or ?lang=en
  const langParam = url.searchParams.get('lang');
  const acceptLang = (context.request.headers.get('Accept-Language') || '').toLowerCase();
  let isThai;
  if (langParam) {
    isThai = langParam === 'th';
  } else {
    isThai = /\bth\b/.test(acceptLang);
  }

  const dest = isThai ? BILINGUAL_SLUGS[slug].th : BILINGUAL_SLUGS[slug].en;

  // Debug mode: add ?debug=1 to see what the function detects
  if (url.searchParams.get('debug')) {
    return new Response(JSON.stringify({
      slug,
      acceptLang,
      langParam,
      isThai,
      dest,
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': dest,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
