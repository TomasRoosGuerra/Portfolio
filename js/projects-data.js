// projects-data.js - JSON-based project storage
const projectsData = {
  projects: [
    {
      id: "tidings",
      title: "Tidings",
      description:
        "A news consumption app that lets you read the way you want. Built with React Native and designed for clarity.",
      category: "mobile-app",
      imageUrl: "assets/tidings/tidings.png",
      createdAt: "2024-01-15",
      published: true,
      tags: ["React Native", "UI/UX", "News", "Mobile App"],
      caseStudyUrl: "tidings-page.html",
      role: "Product Designer",
      impact: "+32% engagement",
    },
    {
      id: "brael",
      title: "Brael",
      description:
        "E-commerce platform redesign focusing on conversion optimization and user experience improvements.",
      category: "web-design",
      imageUrl: "assets/brael/brael.png",
      createdAt: "2024-02-20",
      published: true,
      tags: ["E-commerce", "Conversion", "UI/UX", "Web Design"],
      caseStudyUrl: "brael-page.html",
      role: "UX/UI Designer",
      impact: "+24% conversion",
    },
    {
      id: "sharely",
      title: "Sharely",
      description:
        "Social sharing platform with focus on privacy and user control. Designed for the modern web.",
      category: "web-design",
      imageUrl: "assets/sharely/Sharely.png",
      createdAt: "2024-03-10",
      published: true,
      tags: ["Social", "Privacy", "Web App", "UI/UX"],
      caseStudyUrl: "sharely-page.html",
      role: "Product Designer",
      impact: "+18% activation",
    },
    {
      id: "check-sync",
      title: "Check Sync",
      description:
        "Task synchronization tool that helps teams stay aligned across platforms. Streamlined workflow design for productivity.",
      category: "web-design",
      imageUrl: "assets/check-sync/check-sync-cover.png",
      createdAt: "2024-04-05",
      published: true,
      tags: ["Productivity", "SaaS", "UI/UX", "Web App"],
      caseStudyUrl: "check-sync-page.html",
      role: "Product Designer",
      impact: "-22% support tickets",
    },
    {
      id: "chrome-notes",
      title: "Chrome Notes",
      description:
        "Browser extension for quick note-taking and organization. Minimalist design that stays out of your way.",
      category: "ui-ux",
      imageUrl: "assets/chrome-notes/chrome-notes-cover.png",
      createdAt: "2024-05-12",
      published: true,
      tags: ["Chrome Extension", "Productivity", "UI/UX", "Minimalist"],
      caseStudyUrl: "chrome-notes-page.html",
      role: "UI/UX Designer",
      impact: "50K+ users",
    },
    {
      id: "venga",
      title: "Venga",
      description:
        "Event discovery and planning platform. Designed to make finding and organizing events effortless.",
      category: "web-design",
      imageUrl: "assets/venga/venga-cover.png",
      createdAt: "2024-06-18",
      published: true,
      tags: ["Events", "Web App", "UI/UX", "Social"],
      caseStudyUrl: "venga-page.html",
      role: "Product Designer",
      impact: "+28% user retention",
    },
  ],

  designs: [
    {
      id: "burkxceed",
      title: "BurkXceed Branding",
      description: "Brand identity and visual system for a tech startup",
      imageUrl: "assets/burkxceed/burkxceed.png",
      category: "branding",
    },
    {
      id: "brygg-hemsida",
      title: "Brygg Website",
      description: "Website design for a local coffee roastery",
      imageUrl: "assets/brygg/brygg-hemsida.png",
      category: "web-design",
    },
    {
      id: "chrome-clipboard",
      title: "Chrome Extension UI",
      description: "Interface design for a productivity Chrome extension",
      imageUrl: "assets/chrome-clipboard/chrome-clipboard.png",
      category: "ui-ux",
    },
    {
      id: "tidings-slide",
      title: "Tidings Presentation",
      description: "Presentation slides for the Tidings app launch",
      imageUrl: "assets/tidings/tidings-slide.jpg",
      category: "presentation",
    },
    {
      id: "tidings-phone",
      title: "Tidings Mobile",
      description: "Mobile interface mockups for the Tidings app",
      imageUrl: "assets/tidings/tidings-phone.png",
      category: "mobile-app",
    },
    {
      id: "portolio-design",
      title: "Portfolio Concepts",
      description: "Early design explorations for this portfolio",
      imageUrl: "assets/other/portolio-design.png",
      category: "web-design",
    },
  ],
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = projectsData;
} else {
  window.projectsData = projectsData;
}
