export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

// Shared social links - used by both nav and footer
export const socialLinks = [
  { name: "github", href: "https://github.com/somritdasgupta", external: true },
  {
    name: "linkedin",
    href: "https://www.linkedin.com/in/somritdasgupta",
    external: true,
  },
  {
    name: "instagram",
    href: "https://www.instagram.com/somritdasgupta",
    external: true,
  },
  { name: "cv", href: "/cv", external: false },
];

// Footer links including email
export const footerLinks = [
  { href: "mailto:thesomritdasgupta@gmail.com", label: "mail" },
  { href: "https://github.com/somritdasgupta", label: "github" },
  { href: "https://www.linkedin.com/in/somritdasgupta", label: "linkedin" },
  { href: "https://www.instagram.com/somritdasgupta", label: "instagram" },
  { href: "/cv", label: "cv" },
];
