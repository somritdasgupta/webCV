import Link from "next/link";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="mb-8">
      <SocialLinks variant="footer" />
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} somritdasgupta
      </p>
    </footer>
  );
}
