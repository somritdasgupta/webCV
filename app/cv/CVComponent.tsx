"use client";

import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cvData, sections } from "./cvData";
import { ChatInterface } from "../components/ChatInterface";

export default function CVComponent() {
  const [activeSection, setActiveSection] = useState("summary");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Show back to top button when scrolled 40%
      const scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      setShowBackToTop(scrollPercent >= 40);

      // Check if near bottom of page
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= pageHeight - 100) {
        // At bottom, activate last section
        setActiveSection("certifications");
        return;
      }

      // Check each section
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is in viewport if its top is in upper 40% of screen
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom > 0) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-(--bg-color)">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-bronzer origin-left z-50"
        style={{ scaleX }}
      />

      {/* Sidebar Navigation - Desktop */}
      <nav className="hidden lg:block fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-3">
          {sections
            .filter((section) => section.isShown)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block text-left transition-all duration-300 ${
                  activeSection === section.id
                    ? "text-bronzer font-semibold text-sm"
                    : "text-(--text-p) hover:text-(--text-color) text-xs"
                }`}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-2 h-2 rounded-full border-2 ${
                      activeSection === section.id
                        ? "bg-bronzer border-bronzer"
                        : "bg-(--text-p)/30 border-(--text-p)/30"
                    }`}
                    animate={{
                      scale: activeSection === section.id ? 1.5 : 1,
                    }}
                  />
                  <span className="hidden xl:inline">{section.label}</span>
                </div>
              </button>
            ))}
        </div>
      </nav>

      {/* Action Buttons - Right Side Desktop */}
      <nav className="hidden lg:block fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-3">
          <Link
            href="/"
            className="nav-shimmer flex items-center justify-center w-10 h-10 bg-(--nav-bg) backdrop-blur-xl border-2 border-(--nav-border) rounded-xl hover:border-bronzer hover:scale-105 transition-all text-(--text-color) shadow-lg group"
            title="Back to Home"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>

          <button
            onClick={() => setShowChat(true)}
            className="nav-shimmer flex items-center justify-center w-10 h-10 bg-(--callout-bg) backdrop-blur-xl border-2 border-(--nav-border) rounded-xl hover:scale-105 hover:border-bronzer hover:text-bronzer transition-all text-(--text-color) shadow-lg group"
            title="Chat with assistant"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          <a
            href="https://rxresu.me/somritdasgupta/somrits-resume"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-shimmer flex items-center justify-center w-10 h-10 bg-bronzer/90 backdrop-blur-xl border-2 border-bronzer rounded-xl hover:scale-105 hover:bg-bronzer transition-all text-(--bg-color) shadow-lg group"
            title="View Resume"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </a>

          {/* Back to Top - Shows after 40% scroll */}
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="nav-shimmer flex items-center justify-center w-10 h-10 bg-(--nav-bg) backdrop-blur-xl border-2 border-(--nav-border) rounded-xl hover:border-bronzer hover:scale-105 transition-all text-(--text-color) shadow-lg group"
              title="Back to Top"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </motion.button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full lg:px-16 xl:px-24 py-6 sm:py-8 lg:py-10">
        {/* Mobile Only - Back Button & Download - HIDDEN */}
        <div className="hidden justify-between items-center mb-4 gap-3 px-4 md:px-8">
          <Link
            href="/"
            className="nav-shimmer flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-(--nav-bg) backdrop-blur-xl border border-(--nav-border) rounded-xl hover:border-bronzer hover:scale-105 transition-all text-xs sm:text-sm font-medium text-(--text-color) shadow-lg"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(true)}
              className="nav-shimmer flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-(--callout-bg) backdrop-blur-xl border-2 border-(--nav-border) rounded-xl hover:border-bronzer hover:scale-105 transition-all text-xs sm:text-sm font-medium text-(--text-color) shadow-lg"
              title="Chat with assistant"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="hidden sm:inline">Chat</span>
            </button>

            <a
              href="https://rxresu.me/somritdasgupta/somrits-resume"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-shimmer flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-bronzer/90 backdrop-blur-xl border border-bronzer rounded-xl hover:scale-105 hover:bg-bronzer transition-all text-xs sm:text-sm font-semibold text-(--bg-color) shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">View Resume</span>
              <span className="sm:hidden">Resume</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Pills - HIDDEN */}
        <div className="hidden mb-6 px-4 md:px-8">
          <div className="flex flex-wrap gap-2">
            {sections
              .filter((section) => section.isShown)
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all nav-shimmer ${
                    activeSection === section.id
                      ? "bg-bronzer/90 backdrop-blur-xl border border-bronzer text-(--bg-color) shadow-lg"
                      : "bg-(--nav-bg) backdrop-blur-xl border border-(--nav-border) text-(--text-color) hover:border-bronzer shadow-md"
                  }`}
                >
                  {section.label}
                </button>
              ))}
          </div>
        </div>

        {/* CV Content - Web Version */}
        <div
          id="cv-print-content"
          className="bg-(--card-bg)/40 backdrop-blur-sm rounded-2xl border border-(--nav-border) shadow-xl p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-12"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-(--border-light) pb-6 sm:pb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-(--text-color) mb-2">
              {cvData.header.name}
            </h1>
            <p className="text-lg sm:text-xl text-bronzer font-medium mb-3 sm:mb-4">
              {cvData.header.title}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-(--text-p)">
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {cvData.header.location}
              </span>
              <span className="hidden sm:inline">•</span>
              <a
                href={`mailto:${cvData.header.email}`}
                className="hover:text-bronzer transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {cvData.header.email}
              </a>
              <span className="hidden sm:inline">•</span>
              <a
                href={`https://${cvData.header.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bronzer transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                {cvData.header.website}
              </a>
              <span className="hidden sm:inline">•</span>
              <a
                href={cvData.header.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bronzer transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>
              <span className="hidden sm:inline">•</span>
              <a
                href={cvData.header.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-bronzer transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.section
            id="summary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-color) mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-bronzer rounded-full"></span>
              Summary
            </h2>
            <p className="text-(--text-p) leading-relaxed text-sm sm:text-base">
              {cvData.summary}
            </p>
          </motion.section>

          {/* Technical Skills */}
          <motion.section
            id="skills"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-color) mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-bronzer rounded-full"></span>
              Technical Skills
            </h2>
            <ul className="space-y-2">
              {Object.entries(cvData.skills).map(([category, skills]) => (
                <li
                  key={category}
                  className="text-(--text-p) text-sm sm:text-base"
                >
                  <span className="font-semibold text-(--text-color)">
                    {category}:
                  </span>{" "}
                  {skills.join(", ")}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Work Experience */}
          <motion.section
            id="experience"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-color) mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-bronzer rounded-full"></span>
              Work Experience
            </h2>
            <div className="space-y-6">
              {cvData.experience
                .filter((exp) => exp.isShown)
                .sort((a, b) => a.order - b.order)
                .map((exp, idx) => (
                  <div
                    key={idx}
                    className="border-l-2 border-bronzer pl-4 sm:pl-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-(--text-color)">
                          {exp.role}
                        </h3>
                        <p className="text-bronzer font-medium text-sm sm:text-base">
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm text-(--text-p) mt-1 sm:mt-0">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2 mt-3">
                      {exp.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="text-(--text-p) text-xs sm:text-sm leading-relaxed"
                        >
                          • {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </motion.section>

          {/* Engineering Projects */}
          <motion.section
            id="projects"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-color) mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-bronzer rounded-full"></span>
              Projects
            </h2>
            <div className="space-y-6">
              {cvData.projects
                .filter((project) => project.isShown)
                .sort((a, b) => a.order - b.order)
                .map((project, idx) => (
                  <div
                    key={idx}
                    className="border-l-2 border-bronzer pl-4 sm:pl-6"
                  >
                    <div className="mb-2">
                      {project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base sm:text-lg font-bold text-(--text-color) hover:text-bronzer transition-colors italic"
                        >
                          {project.name}
                        </a>
                      ) : (
                        <h3 className="text-base sm:text-lg font-bold text-(--text-color)">
                          {project.name}
                        </h3>
                      )}
                      <p className="text-xs sm:text-sm text-bronzer font-medium">
                        {project.tech}
                      </p>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2 mt-3">
                      {project.description.map((desc, i) => (
                        <li
                          key={i}
                          className="text-(--text-p) text-xs sm:text-sm leading-relaxed"
                        >
                          • {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </motion.section>

          {/* Education */}
          <motion.section
            id="education"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-color) mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-bronzer rounded-full"></span>
              Education
            </h2>
            <div className="border-l-2 border-bronzer pl-4 sm:pl-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-(--text-color)">
                    {cvData.education.degree}
                  </h3>
                  <p className="text-bronzer font-medium text-sm sm:text-base">
                    {cvData.education.cgpa}
                  </p>
                  <p className="text-(--text-p) text-xs sm:text-sm">
                    {cvData.education.institution}
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-(--text-p) mt-1 sm:mt-0">
                  {cvData.education.period}
                </span>
              </div>
            </div>
          </motion.section>

          {/* Certifications */}
          <motion.section
            id="certifications"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-(--text-color) mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-bronzer rounded-full"></span>
              Certifications
            </h2>
            <div className="space-y-4">
              {cvData.certifications
                .filter((cert) => cert.isShown)
                .sort((a, b) => a.order - b.order)
                .map((cert, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-(--text-color) mb-2 text-sm sm:text-base">
                      {cert.category}
                    </h3>
                    <ul className="space-y-1 ml-4">
                      {cert.certs.map((c, i) => (
                        <li
                          key={i}
                          className="text-(--text-p) text-xs sm:text-sm"
                        >
                          •{" "}
                          {c.link ? (
                            <a
                              href={c.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-bronzer transition-colors italic"
                            >
                              {c.title}
                            </a>
                          ) : (
                            c.title
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </motion.section>
        </div>

        {/* Mobile Bottom Actions */}
        <div className="lg:hidden mt-8 px-4 md:px-8 pb-6">
          <div className="flex gap-3">
            <Link
              href="/"
              className="nav-shimmer flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-(--nav-bg) backdrop-blur-xl border-2 border-(--nav-border) rounded-xl hover:border-bronzer hover:scale-105 transition-all text-sm font-medium text-(--text-color) shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back</span>
            </Link>

            <button
              onClick={scrollToTop}
              className="nav-shimmer flex items-center justify-center px-4 py-3 bg-(--nav-bg) backdrop-blur-xl border-2 border-(--nav-border) rounded-xl hover:border-bronzer hover:scale-105 transition-all text-(--text-color) shadow-lg"
              title="Back to Top"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>

            <a
              href="https://rxresu.me/somritdasgupta/somrits-resume"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-shimmer flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bronzer/90 backdrop-blur-xl border-2 border-bronzer rounded-xl hover:scale-105 hover:bg-bronzer transition-all text-sm font-semibold text-(--bg-color) shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>View Resume</span>
            </a>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <AnimatePresence>
        {showChat && <ChatInterface onClose={() => setShowChat(false)} />}
      </AnimatePresence>
    </div>
  );
}
