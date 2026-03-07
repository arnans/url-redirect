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
  let isThai;
  if (langParam) {
    isThai = langParam === 'th';
  } else {
    const acceptLang = (context.request.headers.get('Accept-Language') || '').toLowerCase();
    isThai = /\bth\b/.test(acceptLang);
  }

  const dest = isThai ? BILINGUAL_SLUGS[slug].th : BILINGUAL_SLUGS[slug].en;
  return Response.redirect(dest, 302);
}
