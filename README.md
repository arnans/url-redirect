# d.gogoboard.org — URL Redirect Service

URL redirect service for GoGo Board books and resources. Maps short URLs like `d.gogoboard.org/ch3-jump-game` to actual destination URLs. Since books are printed, this service lets us update where links point to without changing the printed content.

## How It Works

This repo is deployed on Cloudflare Pages. There are two redirect mechanisms:

1. **Bilingual links** — Handled by `functions/[[slug]].js`. Shows a 2-second interstitial page that auto-redirects to the detected language (EN or TH) with a visible switch link. Language preference is saved in a cookie. Configured in `functions/_bilingual-config.js`.

2. **Regular links** — Handled by the `_redirects` file. Simple static redirects to game sites, Scratch projects, etc.

Deployments are automatic — push to `main` and the site updates in about 30 seconds.

## Repo Structure

```
_redirects                      Static redirects (games, external links)
404.html                        Error page for unmatched paths
functions/_bilingual-config.js  EN/TH URL mapping for bilingual links
functions/[[slug]].js           Language detection function
README.md                       This file
```

## How to Add a New Redirect

### Option A: Bilingual link (GitHub markdown with EN + TH versions)

Add an entry to `functions/_bilingual-config.js`:

```js
'my-guide': {
  en: 'https://github.com/arnans/cs1-public/blob/main/my-guide.md',
  th: 'https://github.com/arnans/cs1-public/blob/main/my-guide-th.md',
},
```

Every visit shows a 2-second interstitial with a language switch link. Language detection priority: `?lang=` param > cookie > `Accept-Language` header > English default. Clicking the switch link saves the preference in a cookie.

### Option B: Regular link (single destination)

Add a line to `_redirects`:

```
/ch4-model-demo   https://github.com/some-repo/some-file  302
```

Format: `/short-path   https://destination-url   302`

- Use `302` (temporary redirect) so browsers don't cache the destination. This allows changing where the link points to later.
- Lines starting with `#` are comments.

### Step 2: Use the short URL in print materials

Write the short URL where readers need to access it:

```
d.gogoboard.org/ch4-model-demo
```

### Step 3: Push to GitHub

```
git add _redirects functions/
git commit -m "Add redirect"
git push
```

The site auto-deploys. Test the new link at `https://d.gogoboard.org/ch4-model-demo`.

## How to Change a Destination

Edit the destination URL in `_redirects` and push. No changes needed in printed materials.

```
# Before
/ch3-jump-game    https://scratch.mit.edu/projects/1283891863  302

# After
/ch3-jump-game    https://scratch.mit.edu/projects/9999999999  302
```

## Naming Convention

- Format: `/chNN-short-label`
- All lowercase, hyphens between words
- Prefix with chapter number when the link is chapter-specific
- Keep labels short — readers may type these from a printed book

Examples: `/ch2-pacman`, `/ch3-jump-game`, `/ch3-race-game`

## How This Service Was Set Up

### Cloudflare Pages project

1. **Cloudflare Dashboard** > **Workers & Pages** > **Create** > **Pages** > **Connect to Git**
2. Selected the `arnans/url-redirect` GitHub repository (private repo — works fine)
3. Settings:
   - **Production branch:** `main`
   - **Build command:** *(empty — no build step)*
   - **Build output directory:** `/`
4. Deployed to `<project-name>.pages.dev`

### Custom domain

1. In the Pages project > **Custom domains** > **Set up a custom domain**
2. Entered `d.gogoboard.org`
3. Cloudflare auto-created the CNAME DNS record (since `gogoboard.org` is already managed in Cloudflare)
4. SSL certificate is automatic

## How to Modify Settings

All settings are in the **Cloudflare Dashboard**:

1. Go to **Workers & Pages** in the left sidebar
2. Click on the Pages project name
3. Go to **Settings** to change:
   - **Build configuration** — branch, build command, output directory
   - **Custom domains** — add, remove, or change the domain
   - **Environment variables** — not used, but available if needed
4. Go to **Deployments** to:
   - View deploy history
   - Roll back to a previous deployment
   - Manually trigger a new deployment

## Limits

- **Maximum 2,000 static redirects** in the `_redirects` file
- Each redirect rule must be under **1,000 characters**
- **302 vs 301:** We use 302 (temporary) so browsers always check for the latest destination. Use 301 (permanent) only for URLs you are certain will never change — browsers cache 301 redirects aggressively.
- Cloudflare Pages reference: https://developers.cloudflare.com/pages/configuration/redirects/
