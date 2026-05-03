import { Seo } from "@/components/Seo";
import { cvData } from "@/lib/cvData";
import { MapPin, Mail, Globe, Github, Linkedin, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "summary", label: "Summary" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
];

const RESUME_URL = "https://rxresu.me/somritdasgupta/somrits-resume";

/**
 * CV page — rxresume-style: side nav (sticky on desktop) + paper-like document.
 * Action: Save → opens the canonical hosted resume.
 */
const CV = () => {
  const [active, setActive] = useState<string>("summary");

  // Scroll-spy: highlight the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <Seo path="/cv" title={`${cvData.header.name} — CV`} description="Resume / CV" />

      <div className="container-wide mt-6 mb-16 grid gap-8 lg:grid-cols-[200px_1fr] lg:gap-10 print:block print:m-0">
        {/* Sticky side navigation — hidden in print */}
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-24 flex flex-col gap-1">
            <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sections
            </p>
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => scrollTo(n.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  active === n.id
                    ? "bg-surface-1 text-foreground"
                    : "text-muted-foreground hover:bg-surface-1/60 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full transition-all",
                    active === n.id ? "h-4 w-1 bg-accent" : "bg-border",
                  )}
                />
                {n.label}
              </button>
            ))}

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" /> Save
              </a>
            </div>
          </div>
        </aside>

        {/* Mobile toolbar */}
        <div className="flex justify-end gap-2 lg:hidden print:hidden">
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Save
          </a>
        </div>

        <article className="cv-paper mx-auto w-full max-w-[78ch] rounded-xl border border-border bg-card px-5 py-7 shadow-elev-md sm:px-10 sm:py-12 print:my-0 print:max-w-none print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none">
        {/* Header */}
        <header className="border-b border-border pb-5">
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            {cvData.header.name}
          </h1>
          <p className="mt-1 text-base font-medium text-accent sm:text-lg">
            {cvData.header.title}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
            <li className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {cvData.header.location}
            </li>
            <li>
              <a
                href={`mailto:${cvData.header.email}`}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" /> {cvData.header.email}
              </a>
            </li>
            <li>
              <a
                href={`https://${cvData.header.website}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5" /> {cvData.header.website}
              </a>
            </li>
            <li>
              <a
                href={cvData.header.github}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </li>
            <li>
              <a
                href={cvData.header.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            </li>
          </ul>
        </header>

        <Section id="summary" title="Summary">
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
            {cvData.summary}
          </p>
        </Section>

        <Section id="skills" title="Technical Skills">
          <ul className="space-y-1.5">
            {Object.entries(cvData.skills).map(([category, skills]) => (
              <li key={category} className="text-sm sm:text-[15px]">
                <span className="font-semibold text-foreground">{category}:</span>{" "}
                <span className="text-muted-foreground">{skills.join(", ")}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="experience" title="Work Experience">
          <div className="space-y-5">
            {cvData.experience.map((exp, i) => (
              <div key={i} className="border-l-2 border-accent/60 pl-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold sm:text-lg">{exp.role}</h3>
                    <p className="text-sm font-medium text-accent">{exp.company}</p>
                  </div>
                  <span className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{exp.period}</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {exp.achievements.map((a, j) => (
                    <li key={j} className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      • {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="projects" title="Projects">
          <div className="space-y-5">
            {cvData.projects.map((p, i) => (
              <div key={i} className="border-l-2 border-accent/60 pl-4">
                <div className="mb-1">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-base font-semibold italic hover:text-accent sm:text-lg"
                  >
                    {p.name}
                  </a>
                  <p className="text-xs font-medium text-accent sm:text-sm">{p.tech}</p>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {p.description.map((d, j) => (
                    <li key={j} className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      • {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="education" title="Education">
          <div className="border-l-2 border-accent/60 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h3 className="text-base font-semibold sm:text-lg">{cvData.education.degree}</h3>
                <p className="text-sm font-medium text-accent">{cvData.education.cgpa}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">{cvData.education.institution}</p>
              </div>
              <span className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{cvData.education.period}</span>
            </div>
          </div>
        </Section>

        <Section id="certifications" title="Certifications">
          <div className="space-y-3">
            {cvData.certifications.map((c, i) => (
              <div key={i}>
                <h3 className="mb-1 text-sm font-semibold sm:text-base">{c.category}</h3>
                <ul className="ml-3 space-y-1">
                  {c.certs.map((t, j) => (
                    <li key={j} className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      • {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
        </article>
      </div>
    </>
  );
};

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mt-7 scroll-mt-24">
    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:text-xl">
      <span className="h-5 w-1.5 rounded-full bg-accent" />
      {title}
    </h2>
    {children}
  </section>
);

export default CV;