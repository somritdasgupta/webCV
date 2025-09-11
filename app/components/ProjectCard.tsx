import { TbBrandGithub } from "react-icons/tb";
import { MdRocketLaunch } from "react-icons/md";
import { RiRocketLine } from "react-icons/ri";

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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[var(--text-color)] mb-3">
            {project.name}
          </h3>
          <p className="text-lg text-[var(--text-p)] leading-relaxed">
            {project.description}
          </p>
        </div>
        <div className="ml-6 flex-shrink-0">
          <div className="w-12 h-12 border border-[var(--callout-border)] rounded-lg flex items-center justify-center">
            <RiRocketLine className="w-6 h-6 text-[var(--text-color)]" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={project.html_url}
          className="inline-flex items-center px-4 py-2 text-[var(--text-color)] border border-[var(--callout-border)] rounded-lg font-medium hover:bg-[var(--callout-bg)] transition-all duration-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TbBrandGithub className="w-4 h-4 mr-2" />
          View on GitHub
        </a>

        {project.homepage && (
          <a
            href={project.homepage}
            className="inline-flex items-center px-4 py-2 bg-[var(--text-color)] text-[var(--bg-color)] rounded-lg font-medium hover:opacity-80 transition-all duration-200"
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
