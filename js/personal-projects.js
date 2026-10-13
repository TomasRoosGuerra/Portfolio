/* ============================================================
   personal-projects.js — side projects I design and build myself
   The homepage "Personal projects" section reads from here.
   To add one: copy an object, change the fields, drop the
   images into assets/personal/<slug>/.
   Image `fit: "contain"` keeps tall phone shots uncropped.
   ============================================================ */

window.PERSONAL_PROJECTS = [
  {
    slug: "learnswedishfast",
    title: "LearnSwedishFast",
    year: "2026",
    kind: "Web app · Language learning",
    url: "https://learnswedishfast.com",
    urlLabel: "learnswedishfast.com",
    summary:
      "A free game for learning the 1,000 most-used Swedish words, the ones that cover about 80% of everyday speech.",
    body: [
      "Vocabulary apps tend to feel like homework. I wanted learning Swedish to feel like playing, so every word is drilled through short game rounds instead of lists.",
      "A spaced-repetition engine (SM-2) decides which words come back and when. Progress lives in the browser so anyone can start without an account, and sign-in only adds sync.",
    ],
    highlights: [
      "Several game modes: an arcade shooter, a falling word wall, flashcards and short reading texts",
      "A word database with mastery stats and filtering for all 982 words",
      "Own illustrated mascot and a bold, friendly visual system that works from phone to desktop",
    ],
    stack: ["Next.js", "React", "TypeScript", "Prisma", "Stripe"],
    images: [
      { src: "assets/personal/learnswedishfast/home.jpg", alt: "LearnSwedishFast landing page with the blueberry mascot in front of a Swedish castle" },
      { src: "assets/personal/learnswedishfast/arcade.jpg", alt: "Arcade game mode: shoot the English word that matches the Swedish one" },
      { src: "assets/personal/learnswedishfast/words.jpg", alt: "Swedish word list with mastery progress and filters" },
      { src: "assets/personal/learnswedishfast/mobile.jpg", alt: "LearnSwedishFast on a phone with bottom tab navigation", fit: "contain" },
    ],
  },

  {
    slug: "showmeyouarereal",
    title: "Show Me You Are Real",
    year: "2026",
    kind: "Web app · Trust & identity",
    url: "https://showmeyouarereal.com",
    urlLabel: "showmeyouarereal.com",
    summary:
      "A quick check that the person on the other end of a chat is a real, live human, and the person they say they are.",
    body: [
      "Deepfakes and fake profiles make it hard to trust someone you have only met online. Here you send an invite through the chat you already use. The other person does four head moves that you pick live, and you get a stamp of their face. Then it is all deleted.",
      "Face matching runs on your own phone, not on a server, and nothing about a face is stored. I documented the design system and every screen state so the product stays consistent as it grows.",
    ],
    highlights: [
      "Live challenge-response liveness check with face matching in the browser",
      "Passkey and BankID sign-in for people who want a verified badge",
      "A page that renders all 63 UI states in English and Swedish for design review",
    ],
    stack: ["JavaScript", "face-api.js", "WebAuthn", "Netlify Functions", "Supabase"],
    images: [
      { src: "assets/personal/showmeyouarereal/home.jpg", alt: "Show Me You Are Real start card: Ask someone to show they're real" },
      { src: "assets/personal/showmeyouarereal/states.jpg", alt: "Design review page showing every screen state side by side" },
      { src: "assets/personal/showmeyouarereal/mobile.jpg", alt: "Show Me You Are Real on a phone", fit: "contain" },
      { src: "assets/personal/showmeyouarereal/sections.jpg", alt: "How it works and help sections on alternating dark and blush surfaces" },
    ],
  },

  {
    slug: "shikolo",
    title: "Shikolo",
    year: "2026",
    kind: "Website · Luxury e-commerce",
    url: "https://shikolo.studio",
    urlLabel: "shikolo.studio",
    summary:
      "A one-product store for a hand-stitched calfskin bag, made in an edition of five.",
    body: [
      "When only five bags exist, the site has to feel like a gallery, not a shop. Big serif type, warm paper tones and a lot of space let the object carry the page.",
      "As you scroll, the bag turns in 3D. I modelled the scene in three.js and baked it into an image sequence from 36 angles and 5 heights, so it looks rich but loads fast on any phone.",
    ],
    highlights: [
      "Art direction and product imagery, from studio stills to lifestyle shots",
      "A 3D turntable you control by scrolling, served at three quality levels",
      "Editorial product page with materials, size and edition details",
    ],
    stack: ["HTML", "CSS", "JavaScript", "three.js", "Netlify"],
    images: [
      { src: "assets/personal/shikolo/hero.jpg", alt: "SHIKOLO wordmark in large spaced serif type on black" },
      { src: "assets/personal/shikolo/bag-3d.jpg", alt: "The bag rendered in 3D on a paper-white page" },
      { src: "assets/personal/shikolo/product.jpg", alt: "Product page with the bag, price and material details" },
      { src: "assets/personal/shikolo/still.jpg", alt: "Studio still of the bag on a stone plinth", fit: "contain" },
      { src: "assets/personal/shikolo/carried.jpg", alt: "The bag carried on a sunlit city street" },
      { src: "assets/personal/shikolo/stitch.jpg", alt: "Close-up of the hand saddle-stitching" },
    ],
  },

  {
    slug: "skogsmulle",
    title: "Skogsmulle",
    year: "2026",
    kind: "Website · Children's stories",
    url: "https://skogsmulle.netlify.app",
    urlLabel: "skogsmulle.netlify.app",
    summary:
      "A home for Swedish bedtime stories about Skogsmulle and friends, for children aged 3 to 12.",
    body: [
      "It started as ink sketches of a small forest creature and his friends. I developed them into a full cast in a soft watercolour style and built a website around them.",
      "Parents can filter stories by age and theme, read them with Skogsmulle songs playing, and share them. Authors get a simple editor with drafts and undo.",
    ],
    highlights: [
      "Character design from first sketches to a finished cast",
      "A calm palette with forest greens and paper tones",
      "A writing tool for authors and a separate, findable page for each story",
    ],
    stack: ["HTML", "CSS", "JavaScript", "Firebase", "Netlify"],
    images: [
      { src: "assets/personal/skogsmulle/home.jpg", alt: "Skogsmulle homepage with a watercolour illustration of Mulle by the sea" },
      { src: "assets/personal/skogsmulle/sketches.jpg", alt: "First ink sketches of the Skogsmulle characters" },
      { src: "assets/personal/skogsmulle/characters.jpg", alt: "The finished watercolour cast of characters, labelled by name" },
      { src: "assets/personal/skogsmulle/mulle-doris.jpg", alt: "Mulle and Doris the duck in an autumn forest" },
    ],
  },

  {
    slug: "martingale",
    title: "Martingale Analyzer",
    year: "2026",
    kind: "Tool · Data visualisation",
    summary:
      "A simulator that shows how risky a trading strategy really is, before you put money on it.",
    body: [
      "Martingale strategies look safe until a long losing streak wipes out the account. The analyzer simulates a strategy a thousand times and shows the whole range of outcomes, not only the average.",
      "The design job was to make dense numbers easy to read: one plain-language verdict at the top, then the key figures, then charts and tables for anyone who wants to look deeper.",
    ],
    highlights: [
      "Simulates 1,000 runs with fees, spread and slippage",
      "Clear charts of final results and sample paths, with losing runs shown in red",
      "Losing-streak odds and a table that suggests the best position size for each hit rate",
    ],
    stack: ["HTML", "CSS", "JavaScript", "Monte Carlo"],
    images: [
      { src: "assets/personal/martingale/dashboard.jpg", alt: "Martingale Analyzer dashboard with risk verdict, outcome histogram and equity curves" },
      { src: "assets/personal/martingale/mobile.jpg", alt: "Martingale Analyzer inputs on a phone", fit: "contain" },
    ],
  },
];
