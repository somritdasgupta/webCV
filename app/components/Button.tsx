import React from "react";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface ButtonProps {
  href: string;
  text: string;
  icon: "left" | "right";
}

const icons = {
  left: <FaArrowLeft className="w-4 h-4 mr-2" />,
  right: <FaArrowRight className="w-4 h-4 ml-2" />,
};

const Button: React.FC<ButtonProps> = ({ href, text, icon }) => {
  const IconComponent = icons[icon];

  return (
    <Link
      href={href}
      className="button-glow inline-flex items-center justify-center px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--nav-border)] rounded-xl font-medium hover:text-[var(--text-primary)] transition-all duration-200"
    >
      {icon === "left" && IconComponent}
      {text}
      {icon === "right" && IconComponent}
    </Link>
  );
};

export default Button;
