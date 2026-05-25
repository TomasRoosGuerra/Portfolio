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

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.
