export interface NavLinkItem {
  label: string;
  href: string;
}

export const HEADER_NAV_LINKS: NavLinkItem[] = [
  {
    label: "Calculator",
    href: "/calculator",
  },
  {
    label: "Tools",
    href: "/tools",
  },
  {
    label: "Methodology",
    href: "/methodology",
  },
  {
    label: "About",
    href: "/about",
  },
];

export const FOOTER_LINKS: NavLinkItem[] = [
  { label: "Calculator", href: "/calculator" },
  { label: "Tools", href: "/tools" },
  { label: "Methodology", href: "/methodology" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];
