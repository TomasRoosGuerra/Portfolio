# Publishing guide

Everything on the site is data-driven. You never hand-build a page — you add
one entry to one file.

## Add a blog post  ·  ~1 minute

1. Open **`js/posts.js`**.
2. Copy the existing post block and paste it as the **first** item in the list.
3. Change the fields and write the `body` in Markdown:

```js
{
  slug: "my-new-post",            // becomes post.html?p=my-new-post
  title: "My new post",
  date: "2026-06-01",             // YYYY-MM-DD
  kicker: "Design",               // small label above the title
  readingTime: "3 min read",
  cover: "assets/Articles/my-new-post/hero.png",
  coverAlt: "Describe the cover image",
  excerpt: "One sentence shown in the list on the homepage.",
  body: `
Write the article here in **Markdown**.

## A heading

A paragraph with *emphasis*, a [link](https://example.com), and a list:

- first point
- second point
`,
},
```

4. Put the cover image at `assets/Articles/<slug>/hero.png`.
5. Save. The homepage **Writing** list and the post page update automatically.

### Markdown you can use in `body`

`## Heading` · `### Subheading` · `**bold**` · `*italic*` · `` `code` `` ·
`[link](url)` · `![alt](image.png)` · `- bullet list` · `1. numbered list` ·
`> quote` · `---` horizontal rule · fenced ```code blocks```.

## Add a project / case study

1. Open **`js/projects.js`**.
2. Copy one project object, change the fields (`slug`, `title`, copy, stats…).
3. Drop the images into `assets/<slug>/`.
4. Save. It appears in the homepage **Work** grid and at `case.html?p=<slug>`.

## Add a personal project  ·  ~2 minutes

1. Open **`js/personal-projects.js`**.
2. Copy one project object and change the fields (`title`, `summary`, `body`,
   `highlights`, `stack`, `url`, `images`).
3. Drop the screenshots into `assets/personal/<slug>/`. Add `fit: "contain"`
   to an image so a tall phone screenshot isn't cropped.
4. Save. It appears in the homepage **Projects** section.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## The hero 3D  ·  `js/gl/`

The homepage hero runs one WebGL canvas. You almost never need to touch it,
but if you do:

- **`js/gl/core.js`** — the only renderer, RAF loop, resize handler, device
  tier and pointer smoothing on the site. Nothing else may create a canvas.
- **`js/gl/theme.js`** — reads `--bg` and `--accent` from `css/theme.css`.
  Change the accent token and the 3D follows. Never hard-code a colour in a
  shader.
- **`js/gl/noise.js`** — the GLSL noise every layer shares.
- **`js/gl/layers/*.js`** — one file per visual element. A layer is just
  `{ scene, camera, update(state), resize(state), dispose() }`; `state` carries
  time, pointer, scroll progress and quality. To add an effect, write a layer
  and `.add()` it in `js/hero-3d.js` — nothing else changes.
- **`js/scroll.js`** — the only scroll listener. Subscribe to it; don't add
  `window.addEventListener("scroll", …)` anywhere else.

Scroll choreography lives in the hero stage: `#hero-stage` is `190vh` tall and
the hero sticks inside it (`css/theme.css`). That overhang is what drives the
camera. The pin is off below 901px and under `prefers-reduced-motion`, where
the scene renders a single static frame instead.

three.js is pinned in the `<script type="importmap">` block in `index.html`.
No build step, no `node_modules`.
