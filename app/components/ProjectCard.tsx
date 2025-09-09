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
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <RiRocketLine className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <a
          href={project.html_url}
          className="inline-flex items-center px-6 py-3 bg-[var(--text-color)] text-[var(--bg-color)] rounded-lg font-medium hover:scale-105 transition-all duration-200 shadow-lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TbBrandGithub className="w-5 h-5 mr-2" />
          View on GitHub
        </a>

        {project.homepage && (
          <a
            href={project.homepage}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-medium hover:scale-105 transition-all duration-200 shadow-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MdRocketLaunch className="w-5 h-5 mr-2" />
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}
