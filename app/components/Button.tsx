// components/Button.tsx

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

interface ButtonProps {
  href: string;
  text: string;
  icon: "left" | "right"; // Props passed on and helps me choose the icon to use
}

const icons = {
  left: <ArrowLeftIcon className="w-3 h-3 mr-1" />,
  right: <ArrowRightIcon className="w-3 h-3 ml-1 mt-1" />,
};

const Button: React.FC<ButtonProps> = ({ href, text, icon }) => {
  const IconComponent = icons[icon];

  return (
    <Link
      href={href}
      className="inline-flex items-center mb-4 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
    >
      {icon === "left" && IconComponent}
      {text}
      {icon === "right" && IconComponent}
    </Link>
  );
};

export default Button;
