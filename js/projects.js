/* ============================================================
   projects.js — case study data (single source of truth)
   The homepage work grid + every case.html page read from here.
   To add a project: copy one object, change the fields.
   ============================================================ */

window.PROJECTS = [
  {
    slug: "tidings",
    title: "Tidings",
    logo: "assets/tidings/tidings-logo.png",
    logoAlt: "Tidings wordmark",
    year: "2023",
    role: "Design",
    platform: "iOS & Android",
    impact: "+32% engagement",
    tags: ["Mobile", "UX/UI", "News"],
    cover: "assets/tidings/tidings.png",
    coverAlt: "Tidings news app interface",
    mockup: "assets/tidings/tidings-phone.jpg",
    mockupAlt: "Tidings mobile reading interface",
    devices: {
      eyebrow: "Across devices",
      title: "News on all platforms",
      body:
        "Tidings keeps the same calm reading layout on desktop, tablet, and phone. The same content, the same accent, the same hierarchy, sized for the hand or the desk.",
      images: [
        {
          src: "assets/tidings/tidings-desktop.jpg",
          alt: "Tidings on a desktop display, showing the Second Brain Reader collections panel and an article",
          caption: "Desktop. Second Brain Reader.",
        },
        {
          src: "assets/tidings/tidings-ipad.jpg",
          alt: "Tidings on iPad showing the All collections view alongside an article",
          caption: "iPad. Collections at a glance.",
        },
      ],
    },
    screens: {
      eyebrow: "Product features",
      title: "What Tidings actually does",
      body:
        "The launch slide summed up the proposition in one frame. Underneath the pitch sat a tight set of product features, each one designed to keep the reading experience calm, clear, and in the reader's hands.",
      image: {
        src: "assets/tidings/tidings-slide.jpg",
        alt: "Tidings launch presentation slide",
        caption: "Launch slide, summarising the proposition.",
      },
      list: [
        {
          h: "Reader-picked sources",
          p: "No algorithmic feed. Choose the outlets you trust and the order they appear in.",
        },
        {
          h: "One-time-read payments",
          p: "Pay only for the articles you read. No subscriptions, no paywalls between you and a single story.",
        },
        {
          h: "Distraction-free reader",
          p: "Adjustable text size, dark mode, and stripped chrome so the article is what you see.",
        },
        {
          h: "Source transparency",
          p: "Every article shows its outlet, author, date, and reading time up front.",
        },
        {
          h: "Offline reading",
          p: "Save anything for the commute or the next bad connection.",
        },
        {
          h: "AI roadmap",
          p: "A planned AI layer to summarise, cluster, and surface related coverage without hiding the source.",
        },
      ],
    },
    cardDesc:
      "AI powered news app that lets you read the way you want. Sources you choose, no algorithmic feed.",
    summary:
      "AI powered news app focused on clarity. Readers pick their sources, shape their feed, and read in peace.",
    overview: {
      lead: "Existing news apps prioritised engagement over clarity. Readers were overwhelmed by endless feeds and algorithmic manipulation. Tidings gives people control over what they read and how they read it.",
      cards: [
        {
          h: "Problem",
          p: "Readers struggled with information overload, unclear sources, and a lack of control. Many felt manipulated by algorithms pushing sensational content.",
        },
        {
          h: "Solution",
          p: "A minimal interface where people choose their own sources and shape their feed. No algorithm. Just news, the way you want it.",
        },
      ],
      research: {
        title: "User research and competitor analysis",
        image: "assets/tidings/tidings-research.jpg",
        imageAlt: "Tidings research process: User research, Synthesize Insights, Competitor Analysis, Define Opportunities, Design Solution",
        body: [
          "Core problem: users want to read articles without paywalls. Solution: a one-time-read payment model, with plans for a future AI-driven news app.",
          "Competitors analysed included Artifact, Google News, and SnapNews, with competitor formats evaluated based on user intent and use case.",
          "Interviews with 50 users informed persona development. Affinity diagrams transformed qualitative insights into quantitative patterns. Competitor reviews were also analysed to identify leverage points and market opportunities.",
        ],
      },
    },
    phases: [
      {
        eyebrow: "Process",
        title: "Sketching & wireframing",
        image: "assets/tidings/tidings-sketches.jpg",
        imageAlt: "Hand-drawn wireframes mapping the Tidings home feed, article detail, search, and user profile screens",
        body: [
          "Before any pixels, the core flows were sketched on paper. Home feed, article detail, search and discover, and user profile each got their own page so structure and hierarchy could be argued with before fidelity was added.",
          "Notes in the margin captured the constraints driving each choice: quick load times, clean UI, category filters, and a clear path from headline to read detail. The wireframes set the skeleton everything else later snapped to.",
        ],
      },
      {
        eyebrow: "Brand mark",
        title: "Building the icon and wordmark",
        image: "assets/tidings/tidings-icon-style.jpg",
        imageAlt: "Tidings brand style guide showing the geometric news-fold icon construction, wordmark grid, and combined mark variants",
        body: [
          "With flows in place, attention turned to the brand. The icon was built from a single geometric news-fold, drawn on a strict grid with measured angles (50°, 45°, 30°) so the form stayed crisp at every size, from app icon to favicon.",
          "The wordmark was set in a clean sans on its own X-height grid, then paired with the icon as a combined mark. Variants for light, dark, mono, and outline contexts kept the identity consistent without ever feeling rigid.",
        ],
      },
      {
        eyebrow: "Design system",
        title: "A shared visual language",
        image: "assets/tidings/tidings-design-system.jpg",
        imageAlt: "Tidings design system spec sheet covering typography, colour palette, core components and common patterns",
        body: [
          "With the skeleton agreed and the brand defined, the next step was a small but strict design system. Typography, colour palette, core components, and common patterns lived on a single spec so every screen pulled from the same source of truth.",
          "Choices were made with reading in mind: a neutral surface scale anchored by Synapse Black, a single teal accent for action, and pattern rules for cards, lists, and notifications so dense article content never felt noisy.",
        ],
      },
    ],
    ux: [
      {
        h: "Onboarding & source selection",
        p: "A simple flow helps readers pick trusted sources from curated categories. Sources can be added or removed at any time.",
      },
      {
        h: "Feed customisation",
        p: "A fully customisable feed with priority ordering, custom categories, and reading preferences. Clear hierarchy keeps what matters in view.",
      },
      {
        h: "Reading experience",
        p: "A clean, distraction-free reader with adjustable text size and dark mode. Every article shows its source, date, and reading time.",
      },
      {
        h: "Discovery",
        p: "Discovery suggests articles from selected interests, not behaviour tracking. People explore without feeling manipulated.",
      },
    ],
    featuresLead:
      "Three features carry most of the experience: instant AI summaries for fast triage, a knowledge dashboard for everything you've saved, and granular sub-topic mapping so the feed is exactly the slice you want. Together they turn news from a flood into a tool.",
    features: [
      {
        h: "Instant AI Summaries",
        img: "assets/tidings/tidings-aisummary.jpg",
        imgAlt: "Tidings AI Summary card showing bullet-point takeaways from an article",
      },
      {
        h: "Knowledge Dashboard",
        img: "assets/tidings/tidings-collections.jpg",
        imgAlt: "Tidings Knowledge Dashboard with folder tiles for Productivity Hacks, Green Tech and Product Management plus a monthly reading chart",
      },
      {
        h: "Granular Sub-Topic Mapping",
        img: "assets/tidings/tidings-deepdive.jpg",
        imgAlt: "Tidings Granular Sub-Topic Mapping settings with toggles for Artificial Intelligence, Venture Capital and Resource Scarcity",
      },
    ],
    gallery: {
      eyebrow: "More of the app",
      title: "A closer look",
      body:
        "Two more screens from the app: a personal insights view that tracks what you read, and the full collections library where everything saved lives.",
      images: [
        {
          src: "assets/tidings/tidings-yourinsights.jpg",
          alt: "Tidings personal insights screen tracking reading activity",
          caption: "Your insights",
          body: "A weekly read of your own habits: what you read, how much, and the topics pulling your attention. No vanity streaks, just a quiet mirror.",
          layout: "wide",
        },
        {
          src: "assets/tidings/tidings-mycollections.jpg",
          alt: "Tidings collections library showing all saved articles",
          caption: "My collections",
          body: "Everything you save lives in one library, grouped the way you think. Scroll the full stack or jump straight to a folder.",
          layout: "tall",
        },
      ],
    },
    outcomes: {
      lead: "Clear improvements in engagement and satisfaction. The focus on clarity and control resonated with readers tired of conventional news apps.",
      stats: [
        { value: "+32%", label: "Engagement" },
        { value: "4.7★", label: "App Store" },
        { value: "85%", label: "Daily active" },
        { value: "-40%", label: "Time to find" },
      ],
    },
  },

  {
    slug: "brael",
    title: "Brael",
    year: "2020",
    role: "Design",
    platform: "Web",
    impact: "+24% conversion",
    tags: ["E-commerce", "Conversion", "Web"],
    cover: "assets/brael/brael.png",
    coverAlt: "Brael e-commerce platform",
    mockup: "assets/brael/brael-erbjudande.png",
    mockupAlt: "Brael special offer page",
    images: [
      { src: "assets/brael/brael.png", alt: "Brael e-commerce platform" },
      { src: "assets/brael/brael-erbjudande.png", alt: "Brael special offer page" },
      { src: "assets/brael/brael-insida.png", alt: "Brael brochure inside spread" },
    ],
    cardDesc:
      "An e-commerce redesign focused on conversion, from discovery to a one-page checkout.",
    summary:
      "A storefront losing two-thirds of its carts. The redesign simplified every step from discovery to purchase, and the numbers followed.",
    overview: {
      lead: "The platform struggled with low conversion and 68% cart abandonment. Checkout was confusing and product discovery was hard. This redesign simplified the journey from discovery to purchase.",
      cards: [
        {
          h: "Challenge",
          p: "High cart abandonment, tangled navigation, unclear product information, and a poor mobile experience.",
        },
        {
          h: "Solution",
          p: "A full redesign built on clarity, trust, and ease. Simpler navigation, stronger product pages, and a streamlined checkout.",
        },
      ],
    },
    ux: [
      {
        h: "Homepage & first impression",
        p: "Rebuilt to communicate value immediately, with a clear hero, visible social proof, and trust signals placed up front.",
      },
      {
        h: "Product discovery",
        p: "Cleaner category navigation with real hierarchy. Search gained filters and sorting; recently viewed and recommendations were added.",
      },
      {
        h: "Product pages",
        p: "High-quality imagery, clear pricing, honest descriptions, and reviews. Size guides and shipping info live on the page itself.",
      },
      {
        h: "Checkout",
        p: "Cut from five steps to a single page with a progress indicator. Guest checkout, saved payment, and a clear shipping calculator dropped abandonment by 35%.",
      },
    ],
    features: [
      {
        h: "Streamlined checkout",
        p: "One page, one progress bar. Guest checkout and saved payment methods remove the friction.",
      },
      {
        h: "Stronger product pages",
        p: "Zoomable imagery, size guides, reviews, and trust badges, plus a fast Buy Now path.",
      },
      {
        h: "Mobile-first design",
        p: "Touch-friendly targets and a simplified checkout lifted mobile conversion by 42%.",
      },
      {
        h: "Trust & security",
        p: "Security badges, customer reviews, and a clear return policy carried through the whole journey.",
      },
    ],
    gallery: {
      eyebrow: "Print design",
      title: "Inside spread",
      body:
        "A four-panel brochure walking through why solar pays off, what Brael delivers, and how savings look over time.",
      images: [
        {
          src: "assets/brael/brael-insida.png",
          alt: "Brael brochure inside spread — four panels covering investment benefits, turnkey services, and projected savings",
          caption: "Four-panel spread",
          body:
            "Value proposition, partner quality, full-service offer, and a savings breakdown — designed to read left to right as one continuous story.",
          layout: "spread",
        },
      ],
    },
    outcomes: {
      lead: "Improvement across every key metric. Conversion up, abandonment down, and a measurably calmer path to purchase.",
      stats: [
        { value: "+24%", label: "Conversion" },
        { value: "-35%", label: "Cart abandon" },
        { value: "+42%", label: "Mobile conv." },
        { value: "-28%", label: "Checkout time" },
      ],
    },
  },

  {
    slug: "sharely",
    title: "Sharely",
    year: "2018",
    role: "Design",
    platform: "Web",
    impact: "+18% activation",
    tags: ["Music", "Sharing", "Web"],
    cover: "assets/sharely/Sharely.png",
    coverAlt: "Sharely music sharing app",
    mockup: null,
    images: [
      { src: "assets/sharely/Sharely.png", alt: "Sharely music sharing app" },
    ],
    cardDesc:
      "A music sharing app that allows for efficient transition between music platforms.",
    summary:
      "A music sharing app that allows for efficient transition between music platforms. Send a track from one service, your friend opens it on theirs.",
    overview: {
      lead: "Sharing music between people on different streaming services was painful. Sharely bridges the gap, converting links and tracks between platforms so listening continues without friction.",
      cards: [
        {
          h: "Problem",
          p: "Friends on different music platforms could not share songs cleanly. Links broke, tracks went missing, and discovery stalled at the platform boundary.",
        },
        {
          h: "Solution",
          p: "A lightweight tool that translates a song link from one platform to another, instantly. Share once, listen anywhere.",
        },
      ],
    },
    ux: [
      {
        h: "Paste and convert",
        p: "Drop in a link from Spotify, Apple Music, or YouTube Music. The app matches the track and surfaces a link on every supported platform.",
      },
      {
        h: "Personal library bridge",
        p: "Connect accounts once. Saved playlists and likes are mirrored, so cross-platform listening feels native.",
      },
      {
        h: "Share with one tap",
        p: "Generated links open in the recipient's preferred platform automatically. No menus, no fallback pages.",
      },
      {
        h: "Discovery feed",
        p: "See what friends are sharing, regardless of where they listen. Cross-platform charts and recommendations included.",
      },
    ],
    features: [
      {
        h: "Cross-platform links",
        p: "One link, every platform. The recipient's platform opens automatically.",
      },
      {
        h: "Library sync",
        p: "Mirror likes and playlists across services without re-listing tracks manually.",
      },
      {
        h: "Quick share",
        p: "Share sheet integration. Copy a track from one app, paste a universal link.",
      },
      {
        h: "No tracking",
        p: "Built without behavioural ads or third-party tracking. Music first, nothing else.",
      },
    ],
    outcomes: {
      lead: "Sharely drew in cross-platform listeners who valued the simplicity of sharing across services. Activation and retention both climbed.",
      stats: [
        { value: "+18%", label: "Activation" },
        { value: "+32%", label: "Retention" },
        { value: "92%", label: "Match accuracy" },
        { value: "4.7★", label: "Rating" },
      ],
    },
  },

  {
    slug: "check-sync",
    title: "Check Sync",
    year: "2025",
    role: "Design",
    platform: "Web & Desktop",
    impact: "-22% admin overhead",
    tags: ["Sports", "Coaching", "Web"],
    cover: "assets/check-sync/check-sync-cover.png",
    coverAlt: "Check Sync dashboard",
    mockup: "assets/check-sync/check-sync-mockup.png",
    mockupAlt: "Check Sync unified task interface",
    images: [
      { src: "assets/check-sync/check-sync-cover.png", alt: "Check Sync dashboard" },
      { src: "assets/check-sync/check-sync-mockup.png", alt: "Check Sync unified task interface" },
    ],
    cardDesc:
      "A tool that helps coaches and sports clubs track their courses, teaching, and classes.",
    summary:
      "A tool that helps coaches and sports clubs track their courses, teaching, and classes. Built for the people running training, not the people building software.",
    overview: {
      lead: "Coaches juggled spreadsheets, group chats, and notes apps to track attendance, progress, and schedules. Check Sync replaces them with one calm view built for training, not paperwork.",
      cards: [
        {
          h: "Problem",
          p: "Coaches lost time managing rosters across tools. Classes got missed, attendance was inconsistent, and reporting to clubs took hours.",
        },
        {
          h: "Solution",
          p: "A single dashboard for courses, classes, and attendance. Clubs see the big picture, coaches see today's session.",
        },
      ],
    },
    ux: [
      {
        h: "Course setup",
        p: "Create courses with recurring sessions, age groups, and skill levels in a few taps. Templates speed up the next season.",
      },
      {
        h: "Daily class view",
        p: "Today's classes surface first. Mark attendance, leave notes, and log progress without leaving the screen.",
      },
      {
        h: "Club overview",
        p: "Admins see attendance trends, coach load, and course health at a glance. Drill in when something needs attention.",
      },
      {
        h: "Communication",
        p: "Push reminders to parents and athletes from inside the app. No copy-pasting across chat groups.",
      },
    ],
    features: [
      {
        h: "Attendance tracking",
        p: "Tap to mark, tap to note. Patterns surface automatically across the season.",
      },
      {
        h: "Course planning",
        p: "Plan a term in advance with recurring sessions, then adjust on the fly.",
      },
      {
        h: "Reporting",
        p: "Club-level reports generate themselves. No more end-of-term spreadsheets.",
      },
      {
        h: "Notifications",
        p: "Parents and athletes get session reminders and changes without manual messaging.",
      },
    ],
    outcomes: {
      lead: "A clear lift in club productivity and a lighter admin load. Coaches reported better focus on the actual training.",
      stats: [
        { value: "-22%", label: "Admin time" },
        { value: "+28%", label: "Attendance" },
        { value: "92%", label: "Coach NPS" },
        { value: "4.8★", label: "Rating" },
      ],
    },
  },

  {
    slug: "chrome-notes",
    title: "Chrome Notes",
    year: "2024",
    role: "Design",
    platform: "Chrome Extension",
    impact: "50K+ users",
    tags: ["Extension", "Notes", "Productivity"],
    cover: "assets/chrome-notes/chrome-notes-cover.png",
    coverAlt: "Chrome Notes browser extension",
    mockup: "assets/chrome-notes/chrome-notes-mockup.png",
    mockupAlt: "Chrome Notes writing interface",
    images: [
      { src: "assets/chrome-notes/chrome-notes-cover.png", alt: "Chrome Notes browser extension" },
      { src: "assets/chrome-notes/chrome-notes-mockup.png", alt: "Chrome Notes writing interface" },
    ],
    cardDesc:
      "For capturing and documenting notes and structuring them fast.",
    summary:
      "For capturing and documenting notes and structuring them fast. A minimalist browser extension that opens in under 100ms.",
    overview: {
      lead: "Existing note extensions were cluttered, slow, or needed too many clicks. Chrome Notes was built to be the fastest way to capture and document a thought without leaving your context.",
      cards: [
        {
          h: "Problem",
          p: "People needed quick capture while browsing, but available tools were too complex, too slow, or broke their flow.",
        },
        {
          h: "Solution",
          p: "A minimalist extension that opens instantly on a keyboard shortcut. A clean writing surface, with light organisation through tags and folders.",
        },
      ],
    },
    ux: [
      {
        h: "Quick capture",
        p: "A shortcut opens the editor instantly. No loading, no animation. A floating panel keeps browsing uninterrupted.",
      },
      {
        h: "Writing experience",
        p: "A distraction-free surface with minimal chrome. Focus mode hides everything but the text. Markdown is supported, autosave means nothing is lost.",
      },
      {
        h: "Structure",
        p: "Light structure through tags and folders. Add tags with #, drag to organise, and search finds notes instantly.",
      },
      {
        h: "Context capture",
        p: "One click captures the current URL, page title, or selected text, then links the note back to its source.",
      },
    ],
    features: [
      {
        h: "Instant access",
        p: "Opens in under 100ms. No delay. The floating panel never breaks your browsing context.",
      },
      {
        h: "Minimal interface",
        p: "Clean, distraction-free writing. Focus mode hides every control but the text area.",
      },
      {
        h: "Simple organisation",
        p: "Tags and folders without the complexity. Drag-and-drop, plus instant search.",
      },
      {
        h: "Context capture",
        p: "Capture URL, title, or selection in one click. Notes link straight back to the page.",
      },
    ],
    outcomes: {
      lead: "Chrome Notes found traction quickly on speed and simplicity alone. People valued the minimalist approach and the instant access.",
      stats: [
        { value: "50K+", label: "Users" },
        { value: "4.8★", label: "Rating" },
        { value: "<100ms", label: "Open time" },
        { value: "94%", label: "Daily active" },
      ],
    },
  },

  {
    slug: "venga",
    title: "Venga",
    year: "2025",
    role: "Design",
    platform: "Web & Mobile",
    impact: "+28% retention",
    tags: ["Events", "Social", "Web"],
    cover: "assets/venga/venga-cover.png",
    coverAlt: "Venga event discovery platform",
    mockup: "assets/venga/venga-mockup.png",
    mockupAlt: "Venga event discovery interface",
    images: [
      { src: "assets/venga/venga-cover.png", alt: "Venga event discovery platform" },
      { src: "assets/venga/venga-mockup.png", alt: "Venga event discovery interface" },
    ],
    cardDesc:
      "An event discovery platform that brings every event into one personalized feed.",
    summary:
      "Event discovery was scattered across five platforms. Venga pulls it together into one personalised feed, with planning tools built in.",
    overview: {
      lead: "Event discovery was fragmented across Facebook, Eventbrite, Instagram, and local sites. Venga aggregates events from many sources, recommends what fits, and adds planning tools.",
      cards: [
        {
          h: "Problem",
          p: "Discovery was spread across platforms. People struggled to find events that matched their interests, and to coordinate with friends.",
        },
        {
          h: "Solution",
          p: "One platform that aggregates events, personalises recommendations, and folds in planning tools, all in a single place.",
        },
      ],
    },
    ux: [
      {
        h: "Personalised discovery",
        p: "Onboarding captures interests, location, and preferences. The home feed surfaces tailored picks; browse by category, date, or place.",
      },
      {
        h: "Event details",
        p: "Complete event pages with date, time, location, description, organiser, and tickets, plus imagery, maps, and reviews.",
      },
      {
        h: "Planning & organisation",
        p: "Save events, build lists, set reminders. Calendar sync covers Google, Apple, and Outlook.",
      },
      {
        h: "Social features",
        p: "See which friends are going, send invites, and coordinate. Group planning helps friends decide together.",
      },
    ],
    features: [
      {
        h: "Smart recommendations",
        p: "Personalised picks based on interests, history, and location. Sharper over time.",
      },
      {
        h: "Unified aggregation",
        p: "Events from many sources in one consistent format that's easy to compare.",
      },
      {
        h: "Planning tools",
        p: "Save, list, remind, and sync to a personal calendar. A planning view holds it all.",
      },
      {
        h: "Social coordination",
        p: "Friend attendance, invites, and group planning that lift engagement.",
      },
    ],
    outcomes: {
      lead: "Venga made discovery and planning genuinely easier. People found relevant events faster and planned attendance with less effort.",
      stats: [
        { value: "+28%", label: "Retention" },
        { value: "+35%", label: "Attendance" },
        { value: "-42%", label: "Time to find" },
        { value: "4.6★", label: "Rating" },
      ],
    },
  },
];

/* Visual work — branding, UI and exploration pieces for the gallery. */
window.VISUAL_WORK = [
  {
    title: "BurkXceed branding",
    desc: "Brand identity and visual system",
    img: "assets/burkxceed/burkxceed.jpg",
  },
  {
    title: "Brygg website",
    desc: "Web design for a coffee roastery",
    img: "assets/brygg/brygg-hemsida.png",
  },
  {
    title: "Chrome extension UI",
    desc: "Productivity extension interface",
    img: "assets/chrome-clipboard/chrome-clipboard.png",
  },
  {
    title: "Tidings presentation",
    desc: "App launch presentation slides",
    img: "assets/tidings/tidings-slide.jpg",
  },
  {
    title: "Tidings mobile",
    desc: "Mobile interface mockups",
    img: "assets/tidings/tidings-phone.jpg",
  },
  {
    title: "Portfolio concepts",
    desc: "Early design explorations",
    img: "assets/other/portolio-design.png",
  },
];
