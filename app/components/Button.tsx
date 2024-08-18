import React from "react";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Importing from react-icons

interface ButtonProps {
  href: string;
  text: string;
  icon: "left" | "right"; // Props passed on and helps choose the icon to use
}

const icons = {
  left: <FaArrowLeft className="w-3 h-3 mr-1" />,
  right: <FaArrowRight className="w-3 h-3 ml-1 mt-1" />,
};

const Button: React.FC<ButtonProps> = ({ href, text, icon }) => {
  const IconComponent = icons[icon];

  return (
    <Link
      href={href}
      className="inline-flex items-center mb-4 hover:!text-[var(--bronzer)] transition-colors ease duration-600"
    >
      {icon === "left" && IconComponent}
      {text}
      {icon === "right" && IconComponent}
    </Link>
  );
};

export default Button;
