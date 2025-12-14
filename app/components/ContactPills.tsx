"use client";

import { useState, useEffect } from "react";
import { HiMail } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function ContactPills() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const contacts = [
    {
      icon: <HiMail className="w-4 h-4" />,
      label: "thesomritdasgupta@outlook.com",
      href: "mailto:thesomritdasgupta@outlook.com",
      display: "send me an email",
    },
    {
      icon: <FaLinkedin className="w-4 h-4" />,
      label: "@somritdasgupta",
      href: "https://linkedin.com/in/somritdasgupta",
      display: "let's connect on linkedin",
    },
    {
      icon: <FaGithub className="w-4 h-4" />,
      label: "@somritdasgupta",
      href: "https://github.com/somritdasgupta",
      display: "get me on github",
    },
  ];

  return (
    <div
      className={`flex flex-col lg:flex-row gap-2 lg:gap-3 ${
        mounted ? "animate-fade-in" : "opacity-0"
      }`}
      style={{ animationDelay: "0.4s" }}
    >
      {contacts.map((contact, index) => (
        <a
          key={index}
          href={contact.href}
          target={contact.href.startsWith("http") ? "_blank" : undefined}
          rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="contact-pill group"
          aria-label={contact.label}
        >
          <span className="flex items-center gap-2">
            {contact.icon}
            <span className="text-xs sm:text-sm">{contact.display}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
