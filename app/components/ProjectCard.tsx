import { TbBrandGithub } from "react-icons/tb";
import { MdRocketLaunch } from "react-icons/md";

interface ProjectCardProps {
  project: {
    name: string;
    description: string;
    html_url: string;
    homepage?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl lg:text-2xl font-semibold text-[var(--text-color)] mb-2">
          {project.name}
        </h3>
        <p className="text-sm lg:text-base text-[var(--text-p)] leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={project.html_url}
          className="inline-flex items-center justify-center px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--nav-border)] rounded-xl font-medium hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TbBrandGithub className="w-4 h-4 mr-2" />
          View on GitHub
        </a>

        {project.homepage && (
          <a
            href={project.homepage}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MdRocketLaunch className="w-4 h-4 mr-2" />
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}
