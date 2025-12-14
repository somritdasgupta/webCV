"use client";

export default function ScrollToTop() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={handleClick}
        className="button-glow inline-flex items-center justify-center px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--nav-border)] rounded-xl font-medium hover:text-[var(--text-primary)] transition-all duration-200"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        Back to Top
      </button>
    </div>
  );
}
