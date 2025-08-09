# Portfolio Template — How to use

## Replace content
- **Name & links**: Edit `index.html` header/footer.
- **Projects**: In the "Selected Work" section, duplicate an `<article class="card">` and change images/text.
- **Photos**: Replace the 12 gallery items. Thumbnails: `*-thumb.webp` (fast). Full images: `*.webp`.
- **About**: Update copy and `assets/about.*` image.
- **CV**: Replace `assets/Your-Name-CV.pdf` or update the link.

## Assets
Place your images in `/assets`. Recommended:
- Thumbnails ~480–800px wide WebP.
- Full images ~1280–2000px WebP.
- Use descriptive alt text for accessibility + SEO.

## Build/host
- No build step required. Works as static files on GitHub Pages, Netlify, or Vercel.
- Open `index.html` in a browser to preview locally.

## Customize
- Colors, spacing, and radii are defined in `css/styles.css` under `:root`.
- Animations use `IntersectionObserver` (JS) and `transform/opacity` (CSS) only.
- Lightbox uses the native `<dialog>` element.

Enjoy!
