import type { NavView } from "./components/Header";

// Every page has its own URL path so each link can live on its own page.
export const VIEW_PATHS: Record<NavView, string> = {
  home: "/",
  portal: "/portal",
  admin: "/admin",
  privacy: "/privacy",
  terms: "/terms",
  sponsorship: "/sponsorship",
  faq: "/faq",
  profile: "/about",
  gallery: "/gallery",
  whychooseus: "/why-choose-us",
  launch: "/launch",
  tickets: "/tickets",
  founders: "/founders",
  events: "/events",
  contact: "/contact",
  volunteer: "/volunteer",
};

export function pathToView(path: string): NavView | null {
  for (const [view, p] of Object.entries(VIEW_PATHS) as [NavView, string][]) {
    if (path === p) return view;
  }
  return null;
}
