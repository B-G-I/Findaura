# Find Aura — findaura.org

> **Viral Tech & Everyday Finds** · Affiliate product discovery, mobile-first, deployed on Vercel.

## 🚀 Live URL
[https://findaura.org](https://findaura.org)

---

## 📁 Project Structure

```
findaura/
├── index.html              # Main HTML shell (SEO meta, OG tags, structured data)
├── app.js                  # Modular Vanilla JS — all features
├── styles.css              # Custom CSS (Aura theme, animations, layout)
├── data/
│   └── products.json       # ← ADD NEW PRODUCTS HERE
├── vercel.json             # Vercel config (clean URLs, cache headers)
└── README.md
```

---

## ➕ Adding a New Product

1. Open `data/products.json`
2. Add a new object at the **top** of the array (highest number = shown first):

```json
{
  "id": "09",
  "title": "Your Product Title Here — Short & Descriptive",
  "category": "Gadgets",
  "image": "https://images.unsplash.com/photo-XXXXXXXX?w=600&q=80",
  "affiliateUrl": "https://s.click.aliexpress.com/e/_yourlink",
  "badge": "Viral 🔥",
  "tags": ["viral"],
  "dateAdded": "2026-11-11"
}
```

3. Commit & push to GitHub → Vercel auto-deploys in ~30 seconds.

> **Tip:** Use the built-in Admin Helper at `https://findaura.org/?admin=true` — it generates the JSON for you!

### Field Reference

| Field          | Type     | Required | Notes |
|----------------|----------|----------|-------|
| `id`           | string   | ✅        | Zero-padded e.g. `"09"`, `"10"` |
| `title`        | string   | ✅        | Shown on card, clamped to 2 lines |
| `category`     | string   | ✅        | `"Desk & Tech"`, `"Gadgets"`, `"Room Aura"`, `"Car & EDC"` |
| `image`        | string   | ✅        | Direct image URL, 600px wide min |
| `affiliateUrl` | string   | ✅        | Full affiliate deep-link |
| `badge`        | string\|null | —    | Top-right badge e.g. `"Viral 🔥"` or `"Best Seller"` |
| `tags`         | array    | —        | Use `["viral"]` to include in 🔥 Viral filter |
| `dateAdded`    | string   | —        | `YYYY-MM-DD` format |

---

## 🔗 URL Deep-Linking

Share direct product links via Instagram DMs or Stories:

```
https://findaura.org/?id=24
https://findaura.org/?p=07
```

The product is pinned to the top with a "Featured from your link" banner.

---

## 🛠 Admin Helper

Visit `https://findaura.org/?admin=true` to open the product JSON generator.  
Fill in the form → click **Generate JSON** → **Copy JSON** → paste into `data/products.json`.

---

## 🌐 Deploying to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# From the project root:
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deploys on every push.

**Cache strategy (set in `vercel.json`):**
- `products.json` → `no-cache` (always fresh)
- JS/CSS/fonts → `immutable` 1-year cache
- `index.html` → revalidates on every request

---

## ⚙️ Tech Stack

| Layer       | Choice                                      |
|-------------|---------------------------------------------|
| HTML        | Semantic HTML5, structured data (JSON-LD)   |
| Styling     | Custom CSS with CSS variables (no framework)|
| JavaScript  | Vanilla ES6+ modules, zero dependencies     |
| Data        | Static `/data/products.json`                |
| Hosting     | Vercel (static, edge CDN)                   |
| Fonts       | Plus Jakarta Sans + JetBrains Mono (Google) |
| Images      | Unsplash CDN (replace with real product images) |

---

## ✅ Feature Checklist

- [x] Mobile-first 2-column grid (3 col tablet, 4 col desktop)
- [x] Sticky smart search — `#7`, `07`, `007` all match product `07`
- [x] Exact match highlight + priority sort
- [x] URL deep-link `?id=` / `?p=` with featured banner
- [x] Category filter pills with smooth combined filtering
- [x] Newest-first sort (highest ID at top)
- [x] Lazy-loaded images with graceful fallback placeholder
- [x] Full-card clickable affiliate links
- [x] Admin helper modal at `?admin=true` with JSON copy
- [x] Privacy Policy + Terms & Disclosure modals
- [x] Affiliate disclosure footer
- [x] Zero console errors
- [x] Vercel cache headers + clean URLs
- [x] SEO meta, Open Graph, Twitter Card, JSON-LD
- [x] Instagram in-app browser compatible

---

## 📧 Contact

hello@findaura.org

