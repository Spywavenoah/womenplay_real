import type { Express } from "express";

// ---------------------------------------------------------------------------
// Static prerender head (server-side route bake) + robots.txt / sitemap.xml
// Gives crawlers without JS the correct <title>, meta description, canonical,
// Open Graph and JSON-LD per route — the SPA still does its own client-side
// meta management for in-app navigation.
// ---------------------------------------------------------------------------

export function resolveSiteOrigin(env: NodeJS.ProcessEnv = process.env): string {
  return (env.SITE_ORIGIN || "https://womenplay.org").replace(/\/+$/, "");
}

const ROUTE_META: Record<string, { title: string; description: string; schema?: object }> = {
  "/": {
    title: "WomenPlay — Luxury Business & Leadership Community for Women",
    description:
      "WomenPLAY is an executive community and luxury accelerator empowering women to enter, fund and succeed in sport and business through summits, mentorship and board opportunities.",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "WomenPLAY",
      url: "https://womenplay.org/",
      description:
        "Exclusive community and luxury events empowering women in sport business and leadership.",
    },
  },
  "/launch": {
    title: "Launch Experience — WomenPlay",
    description:
      "Join WomenPlay's Launch Experience and become a founding member of an elite community of women for sport and business.",
  },
  "/tickets": {
    title: "Launch Tickets — WomenPlay",
    description: "Secure your Launch Experience ticket and join the exclusive WomenPlay founding community.",
  },
  "/founders": {
    title: "Founders Membership — WomenPlay",
    description: "Become a founding member of WomenPlay, an exclusive and luxurious women's leadership community.",
  },
  "/events": {
    title: "Events — WomenPlay",
    description: "Explore WomenPlay events — luxury summits, curated dinners, pitch sessions and professional board workshops.",
  },
  "/contact": {
    title: "Contact Us — WomenPlay",
    description: "Get in touch with the WomenPlay executive secretariat about membership, events and partnerships.",
  },
  "/why-choose-us": {
    title: "Why Choose Us — WomenPlay",
    description: "Discover what makes WomenPlay the premier luxury women's community for sport, business and leadership.",
  },
  "/gallery": {
    title: "Gallery — WomenPlay",
    description: "Moments from WomenPlay — luxury events, summits, mentorship and the women's leadership community.",
  },
  "/faq": {
    title: "FAQ — WomenPlay",
    description: "Frequently asked questions about WomenPlay membership, the Launch Experience and our community.",
  },
  "/sponsorship": {
    title: "Sponsorship — WomenPlay",
    description: "Partner with WomenPlay and invest in women's sport business and leadership at a luxury scale.",
  },
  "/about": {
    title: "About — WomenPlay",
    description: "Learn about WomenPlay, a community elevating women in sport business and leadership.",
  },
  "/privacy": { title: "Privacy Policy — WomenPlay", description: "WomenPlay privacy policy." },
  "/terms": { title: "Terms of Service — WomenPlay", description: "WomenPlay terms of service." },
};

export function buildHeadForPath(reqPath: string, origin: string): string {
  const clean = (reqPath || "/").split("?")[0].split("#")[0] || "/";
  const meta = ROUTE_META[clean] || ROUTE_META["/"];
  const canonical = origin + clean;
  const desc = meta.description.replace(/"/g, "&quot;");
  const title = meta.title.replace(/"/g, "&quot;");
  const schemaTags = meta.schema
    ? `<script type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g, "\\u003c")}</script>`
    : "";
  return (
    `  <title>${title}</title>\n` +
    `  <meta name="description" content="${desc}" />\n` +
    `  <link rel="canonical" href="${canonical}" />\n` +
    `  <meta property="og:type" content="website" />\n` +
    `  <meta property="og:title" content="${title}" />\n` +
    `  <meta property="og:description" content="${desc}" />\n` +
    `  <meta property="og:url" content="${canonical}" />\n` +
    `  <meta property="og:site_name" content="WomenPlay" />\n` +
    `  <meta name="twitter:card" content="summary_large_image" />\n` +
    `  <meta name="twitter:title" content="${title}" />\n` +
    `  <meta name="twitter:description" content="${desc}" />\n` +
    schemaTags
  ).trim();
}

// Public, crawlable routes (auth-gated portal/admin excluded).
const SITEMAP_ROUTES: Array<{ path: string; changefreq?: string; priority?: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/launch", changefreq: "weekly", priority: "0.9" },
  { path: "/tickets", changefreq: "weekly", priority: "0.8" },
  { path: "/founders", changefreq: "weekly", priority: "0.8" },
  { path: "/events", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/gallery", changefreq: "monthly", priority: "0.6" },
  { path: "/why-choose-us", changefreq: "monthly", priority: "0.6" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
  { path: "/sponsorship", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
];

export function robotsBody(origin: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

export function sitemapXml(origin: string): string {
  const urls = SITEMAP_ROUTES.map(
    (r) =>
      `  <url><loc>${origin}${r.path}</loc><changefreq>${r.changefreq || "monthly"}</changefreq><priority>${r.priority || "0.5"}</priority></url>`
  ).join("\n");
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    urls,
    `</urlset>`,
  ].join("\n");
}

export function registerSeoRoutes(app: Express, origin: string): void {
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(robotsBody(origin));
  });
  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml").send(sitemapXml(origin));
  });
}