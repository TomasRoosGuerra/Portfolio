/* ============================================================
   projects.js — case study data (single source of truth)
   The homepage work grid + every case.html page read from here.
   To add a project: copy one object, change the fields.
   ============================================================ */

window.PROJECTS = [
  {
    slug: "tidings",
    title: "Tidings",
    year: "2024",
    role: "Product Designer",
    platform: "iOS & Android",
    impact: "+32% engagement",
    tags: ["Mobile", "UX/UI", "News"],
    cover: "assets/tidings/tidings.png",
    coverAlt: "Tidings news app interface",
    mockup: "assets/tidings/tidings-phone.png",
    mockupAlt: "Tidings mobile reading interface",
    cardDesc:
      "A news app that lets you read the way you want — sources you choose, no algorithmic feed.",
    summary:
      "News apps optimised for engagement, not clarity. Tidings hands control back to the reader: choose your sources, shape your feed, read in peace.",
    overview: {
      lead: "Existing news apps prioritised engagement over clarity. Readers were overwhelmed by endless feeds and algorithmic manipulation. Tidings gives people control over what they read and how they read it.",
      cards: [
        {
          h: "Problem",
          p: "Readers struggled with information overload, unclear sources, and a lack of control. Many felt manipulated by algorithms pushing sensational content.",
        },
        {
          h: "Solution",
          p: "A minimal interface where people choose their own sources and shape their feed. No algorithm — just news, the way you want it.",
        },
      ],
    },
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
        p: "Discovery suggests articles from selected interests — not behaviour tracking. People explore without feeling manipulated.",
      },
    ],
    features: [
      {
        h: "Source transparency",
        p: "Every article surfaces its source, date, and author. Transparency is what builds trust.",
      },
      {
        h: "Customisable feed",
        p: "Full control over feed order and categories. No hidden algorithm deciding for you.",
      },
      {
        h: "Reading modes",
        p: "List, card, and article views let people consume news their way. Reader mode strips every distraction.",
      },
      {
        h: "Offline support",
        p: "Save articles to read offline — built for commutes and weak connections.",
      },
    ],
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
    year: "2024",
    role: "UX/UI Designer",
    platform: "Web",
    impact: "+24% conversion",
    tags: ["E-commerce", "Conversion", "Web"],
    cover: "assets/brael/brael.png",
    coverAlt: "Brael e-commerce platform",
    mockup: "assets/brael/brael-erbjudande.png",
    mockupAlt: "Brael special offer page",
    cardDesc:
      "An e-commerce redesign focused on conversion — from discovery to a one-page checkout.",
    summary:
      "A storefront losing two-thirds of its carts. The redesign simplified every step from discovery to purchase — and the numbers followed.",
    overview: {
      lead: "The platform struggled with low conversion and 68% cart abandonment. Checkout was confusing and product discovery was hard. This redesign simplified the journey from discovery to purchase.",
      cards: [
        {
          h: "Challenge",
          p: "High cart abandonment, tangled navigation, unclear product information, and a poor mobile experience.",
        },
        {
          h: "Solution",
          p: "A full redesign built on clarity, trust, and ease — simpler navigation, stronger product pages, and a streamlined checkout.",
        },
      ],
    },
    ux: [
      {
        h: "Homepage & first impression",
        p: "Rebuilt to communicate value immediately — a clear hero, visible social proof, and trust signals placed up front.",
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
        p: "Zoomable imagery, size guides, reviews, and trust badges — plus a fast Buy Now path.",
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
    outcomes: {
      lead: "Improvement across every key metric — conversion up, abandonment down, and a measurably calmer path to purchase.",
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
    year: "2024",
    role: "Product Designer",
    platform: "Web",
    impact: "+18% activation",
    tags: ["Social", "Privacy", "Web"],
    cover: "assets/sharely/Sharely.png",
    coverAlt: "Sharely social platform",
    mockup: null,
    cardDesc:
      "A privacy-first social platform with granular controls and full data transparency.",
    summary:
      "Social platforms made privacy an afterthought. Sharely makes it the default — granular controls, a chronological feed, and nothing hidden.",
    overview: {
      lead: "Social platforms prioritised engagement over privacy and control. People were frustrated by data collection and algorithmic manipulation. Sharely puts them back in charge of how they share.",
      cards: [
        {
          h: "Problem",
          p: "People wanted to share, but worried about data collection, manipulation, and the difficulty of controlling who sees what.",
        },
        {
          h: "Solution",
          p: "A privacy-first platform with granular controls, no algorithmic feed, and transparent data practices — audience, visibility, and data, all in the user's hands.",
        },
      ],
    },
    ux: [
      {
        h: "Privacy configuration",
        p: "Onboarding leads with privacy. People set default visibility and choose exactly what data they share.",
      },
      {
        h: "Content creation",
        p: "Posting is simple and intentional — pick an audience, set an expiry. Privacy controls stay visible the whole time.",
      },
      {
        h: "Chronological feed",
        p: "The feed shows followed accounts in order. No ranking, no manipulation — following, muting, and filtering decide what you see.",
      },
      {
        h: "Data transparency",
        p: "A clear dashboard shows what's collected and why. A one-click export lets people take their data with them.",
      },
    ],
    features: [
      {
        h: "Granular privacy",
        p: "Per-post settings, custom audience lists, and expiry dates control exactly who sees each thing.",
      },
      {
        h: "Chronological feed",
        p: "No algorithm. The feed is ordered by time, and shaped by the people you choose.",
      },
      {
        h: "Data transparency",
        p: "A privacy dashboard plus full data export — trust built through visibility.",
      },
      {
        h: "No tracking",
        p: "No third-party tracking, no behavioural ads, no data selling. Privacy-first, end to end.",
      },
    ],
    outcomes: {
      lead: "Sharely drew in privacy-conscious users who valued the control and the transparency. Activation and retention both climbed.",
      stats: [
        { value: "+18%", label: "Activation" },
        { value: "+32%", label: "Retention" },
        { value: "92%", label: "Privacy score" },
        { value: "4.7★", label: "Rating" },
      ],
    },
  },

  {
    slug: "check-sync",
    title: "Check Sync",
    year: "2024",
    role: "Product Designer",
    platform: "Web & Desktop",
    impact: "-22% support tickets",
    tags: ["Productivity", "SaaS", "Web"],
    cover: "assets/check-sync/check-sync-cover.png",
    coverAlt: "Check Sync dashboard",
    mockup: "assets/check-sync/check-sync-mockup.png",
    mockupAlt: "Check Sync unified task interface",
    cardDesc:
      "A task tool that unifies team workflows across platforms in one synced view.",
    summary:
      "Teams scattered across task tools, switching context all day. Check Sync gives them one synced view — and far fewer dropped balls.",
    overview: {
      lead: "Teams ran on multiple task tools, creating silos and constant context switching. Check Sync syncs tasks across platforms and presents one unified view.",
      cards: [
        {
          h: "Problem",
          p: "Information silos, missed updates, and endless context switching — plus a stream of support tickets about task status.",
        },
        {
          h: "Solution",
          p: "A unified dashboard that syncs tasks in real time. Clear indicators show status, ownership, and updates; smart filtering keeps teams focused.",
        },
      ],
    },
    ux: [
      {
        h: "Platform integration",
        p: "Onboarding walks teams through connecting their task tools, with per-platform sync settings.",
      },
      {
        h: "Unified dashboard",
        p: "One dashboard for every connected platform — colour-coded sources, status badges, and a clear hierarchy.",
      },
      {
        h: "Real-time sync",
        p: "Tasks sync automatically. Changes appear instantly with status indicators, and a conflict-resolution UI settles clashes fast.",
      },
      {
        h: "Filtering & search",
        p: "Filter by platform, status, assignee, project, or tag. Saved views handle common queries; search spans every platform.",
      },
    ],
    features: [
      {
        h: "Real-time sync",
        p: "Automatic sync with clear indicators and a conflict-resolution UI — support tickets fell 22%.",
      },
      {
        h: "Unified dashboard",
        p: "Every task, every platform, one view. Less switching, more visibility.",
      },
      {
        h: "Smart filtering",
        p: "A powerful filter system with saved views keeps teams on what matters.",
      },
      {
        h: "Activity feed",
        p: "A central feed of updates across every platform — context without the tab-hopping.",
      },
    ],
    outcomes: {
      lead: "A clear lift in team productivity and a lighter support load. Teams reported better alignment and fewer missed updates.",
      stats: [
        { value: "-22%", label: "Support tickets" },
        { value: "-35%", label: "Context switch" },
        { value: "+28%", label: "Task visibility" },
        { value: "92%", label: "Satisfaction" },
      ],
    },
  },

  {
    slug: "chrome-notes",
    title: "Chrome Notes",
    year: "2024",
    role: "UI/UX Designer",
    platform: "Chrome Extension",
    impact: "50K+ users",
    tags: ["Extension", "Productivity", "Minimal"],
    cover: "assets/chrome-notes/chrome-notes-cover.png",
    coverAlt: "Chrome Notes browser extension",
    mockup: "assets/chrome-notes/chrome-notes-mockup.png",
    mockupAlt: "Chrome Notes writing interface",
    cardDesc:
      "A minimalist browser extension for capturing thoughts in under two seconds.",
    summary:
      "Note extensions were cluttered or slow. Chrome Notes is the fastest way to capture a thought without leaving the page you're on.",
    overview: {
      lead: "Existing note extensions were cluttered, slow, or needed too many clicks. Chrome Notes was built to be the fastest way to capture a thought without leaving your context.",
      cards: [
        {
          h: "Problem",
          p: "People needed quick capture while browsing, but the available tools were too complex, too slow, or broke their flow.",
        },
        {
          h: "Solution",
          p: "A minimalist extension that opens instantly on a keyboard shortcut — a clean writing surface, with light organisation through tags and folders.",
        },
      ],
    },
    ux: [
      {
        h: "Quick capture",
        p: "A shortcut opens the editor instantly — no loading, no animation. A floating panel keeps browsing uninterrupted.",
      },
      {
        h: "Writing experience",
        p: "A distraction-free surface with minimal chrome. Focus mode hides everything but the text. Markdown is supported; autosave means nothing is lost.",
      },
      {
        h: "Organisation",
        p: "Light structure through tags and folders. Add tags with #, drag to organise, and search finds notes instantly.",
      },
      {
        h: "Context capture",
        p: "One click captures the current URL, page title, or selected text — and links the note back to its source.",
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
        p: "Capture URL, title, or selection in one click — notes link straight back to the page.",
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
    year: "2024",
    role: "Product Designer",
    platform: "Web & Mobile",
    impact: "+28% retention",
    tags: ["Events", "Social", "Web"],
    cover: "assets/venga/venga-cover.png",
    coverAlt: "Venga event discovery platform",
    mockup: "assets/venga/venga-mockup.png",
    mockupAlt: "Venga event discovery interface",
    cardDesc:
      "An event discovery platform that brings every event into one personalized feed.",
    summary:
      "Event discovery was scattered across five platforms. Venga pulls it together — one personalised feed, with planning tools built in.",
    overview: {
      lead: "Event discovery was fragmented across Facebook, Eventbrite, Instagram, and local sites. Venga aggregates events from many sources, recommends what fits, and adds planning tools.",
      cards: [
        {
          h: "Problem",
          p: "Discovery was spread across platforms. People struggled to find events that matched their interests — and to coordinate with friends.",
        },
        {
          h: "Solution",
          p: "One platform that aggregates events, personalises recommendations, and folds in planning tools — all in a single place.",
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
        p: "Complete event pages — date, time, location, description, organiser, and tickets — with imagery, maps, and reviews.",
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
        p: "Personalised picks based on interests, history, and location — sharper over time.",
      },
      {
        h: "Unified aggregation",
        p: "Events from many sources in one consistent format that's easy to compare.",
      },
      {
        h: "Planning tools",
        p: "Save, list, remind, and sync to a personal calendar — a planning view holds it all.",
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
    desc: "Brand identity & visual system",
    img: "assets/burkxceed/burkxceed.png",
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
    img: "assets/tidings/tidings-phone.png",
  },
  {
    title: "Portfolio concepts",
    desc: "Early design explorations",
    img: "assets/other/portolio-design.png",
  },
];
