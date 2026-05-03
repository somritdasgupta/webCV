import { AUTHOR, SITE } from "@/site.config";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="mt-32 border-t border-border/50">
      <div className="container-wide flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE.name}. Built with care.
        </p>
        <div className="flex items-center gap-4 text-muted-foreground">
          <a href={AUTHOR.links.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="transition-colors hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
          <a href={AUTHOR.links.twitter} target="_blank" rel="noreferrer noopener" aria-label="Twitter" className="transition-colors hover:text-foreground">
            <Twitter className="h-4 w-4" />
          </a>
          <a href={AUTHOR.links.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="transition-colors hover:text-foreground">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href={`mailto:${AUTHOR.email}`} aria-label="Email" className="transition-colors hover:text-foreground">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
