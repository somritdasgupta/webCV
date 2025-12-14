"use client";

import React, { useEffect, useState } from "react";
import {
  RiTwitterXLine,
  RiLinkedinLine,
  RiShareLine,
  RiLinkM,
  RiWhatsappLine,
  RiRedditLine,
  RiCodeSSlashLine,
  RiCloseLine,
  RiSunLine,
  RiMoonLine,
  RiTabletLine,
  RiSmartphoneLine,
  RiFileCopyLine,
  RiCheckLine,
} from "react-icons/ri";
import { Toast, useToast } from "./Toast";

interface ShareButtonsProps {
  title: string;
  url: string;
  slug?: string;
}

export function ShareButtons({ title, url, slug }: ShareButtonsProps) {
  const [canShare, setCanShare] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [embedConfig, setEmbedConfig] = useState({
    orientation: "landscape", // "landscape" or "portrait"
    theme: "light",
  });
  const [windowWidth, setWindowWidth] = useState(0);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);

    // Set initial window width for desktop preview calculations
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const shareData = {
    title,
    url,
    text: `Check out this blog post: ${title}`,
  };

  // Extract slug from URL if not provided
  const postSlug = slug || url.split("/").pop() || "";
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "https://somrit.vercel.app";

  // Set dimensions based on orientation
  const getDimensions = () => {
    if (embedConfig.orientation === "landscape") {
      return { width: "700", height: "380" };
    } else {
      return { width: "450", height: "480" };
    }
  };

  const dimensions = getDimensions();
  const embedUrl = `${baseUrl}/api/embed?slug=${postSlug}&theme=${embedConfig.theme}&orientation=${embedConfig.orientation}&width=${dimensions.width}&height=${dimensions.height}`;

  const embedCode = `<iframe 
  src="${embedUrl}" 
  width="${dimensions.width}" 
  height="${dimensions.height}" 
  frameborder="0"
  scrolling="no"
  style="border-radius: 24px; max-width: 100%; backdrop-filter: blur(8px);"
  title="${title} - Blog Post Summary">
</iframe>`;

  const handleShare = async (platform?: string) => {
    try {
      if (platform === "twitter") {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareData.text
        )}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
        showToast("Opening Twitter to share", "info");
      } else if (platform === "linkedin") {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        window.open(linkedinUrl, "_blank", "noopener,noreferrer");
        showToast("Opening LinkedIn to share", "info");
      } else if (platform === "whatsapp") {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `${shareData.text} ${url}`
        )}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        showToast("Opening WhatsApp to share", "info");
      } else if (platform === "reddit") {
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(title)}`;
        window.open(redditUrl, "_blank", "noopener,noreferrer");
        showToast("Opening Reddit to share", "info");
      } else if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!", "success");
      } else if (platform === "embed") {
        setShowEmbedModal(true);
      } else {
        // Use native Web Share API if available
        if (canShare && navigator.share) {
          await navigator.share(shareData);
        } else {
          handleShare("copy");
        }
      }
    } catch (err) {
      console.error("Failed to share:", err);
      showToast("Failed to share. Please try again.", "error");
    }
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      showToast("Embed code copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy embed code:", err);
      showToast("Failed to copy embed code. Please try again.", "error");
    }
  };

  // Calculate preview dimensions based on orientation and content (Desktop only)
  const getPreviewDimensions = () => {
    // Get actual card dimensions based on orientation
    const dimensions = getDimensions();
    const cardWidth = parseInt(dimensions.width);
    const cardHeight = parseInt(dimensions.height);

    // Desktop scaling only (mobile shows code instead of preview)
    const maxWidth = 900;
    const maxHeight = 700;
    const containerPadding = 48;

    const availableWidth = maxWidth - containerPadding;
    const availableHeight = maxHeight - containerPadding;

    const scaleX = availableWidth / cardWidth;
    const scaleY = availableHeight / cardHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    return {
      width: Math.round(cardWidth * scale),
      height: Math.round(cardHeight * scale),
      scale: scale,
    };
  };

  const previewSize = getPreviewDimensions();

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm font-medium text-[var(--text-p)]">Share:</span>
          <div className="flex items-center gap-2">
          <button
            onClick={() => handleShare("twitter")}
            className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-[var(--bronzer)] hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Share on Twitter"
          >
            <RiTwitterXLine size={16} />
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-[var(--bronzer)] hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Share on LinkedIn"
          >
            <RiLinkedinLine size={16} />
          </button>
          <button
            onClick={() => handleShare("whatsapp")}
            className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Share on WhatsApp"
          >
            <RiWhatsappLine size={16} />
          </button>
          <button
            onClick={() => handleShare("reddit")}
            className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-orange-500 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Share on Reddit"
          >
            <RiRedditLine size={16} />
          </button>
          <button
            onClick={() => handleShare("copy")}
            className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-[var(--bronzer)] hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Copy link"
          >
            <RiLinkM size={16} />
          </button>
          <button
            onClick={() => handleShare("embed")}
            className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-purple-500 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Get embed code"
          >
            <RiCodeSSlashLine size={16} />
          </button>
          {canShare && (
            <button
              onClick={() => handleShare()}
              className="p-2 rounded-full bg-[var(--card-bg)] hover:bg-[var(--bronzer)] hover:text-white transition-all duration-300 hover:scale-110"
              aria-label="Share"
            >
              <RiShareLine size={16} />
            </button>
          )}
          </div>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="button-glow inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-[var(--text-secondary)] border border-[var(--nav-border)] rounded-full text-sm font-medium hover:text-[var(--text-primary)] transition-all duration-200"
        >
          <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="hidden sm:inline">Back to Top</span>
        </button>
      </div>

      {/* Clean Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
          <div className="bg-[var(--card-bg)]/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-[var(--callout-border)]/50 relative">
            {/* Close button */}
            <button
              onClick={() => setShowEmbedModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--callout-bg)]/70 transition-all duration-200 backdrop-blur-sm z-10"
              aria-label="Close modal"
            >
              <RiCloseLine size={20} className="text-[var(--text-p)]" />
            </button>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* Mobile Controls (Top) */}
              <div className="flex lg:hidden justify-center gap-3 pb-4 border-b border-[var(--callout-border)]/30">
                {/* Theme Toggle */}
                <button
                  onClick={() =>
                    setEmbedConfig((prev) => ({ ...prev, theme: "light" }))
                  }
                  className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                    embedConfig.theme === "light"
                      ? "bg-[var(--bronzer)] text-white shadow-lg"
                      : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                  }`}
                  title="Light Theme"
                >
                  <RiSunLine size={20} />
                </button>
                <button
                  onClick={() =>
                    setEmbedConfig((prev) => ({ ...prev, theme: "dark" }))
                  }
                  className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                    embedConfig.theme === "dark"
                      ? "bg-[var(--bronzer)] text-white shadow-lg"
                      : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                  }`}
                  title="Dark Theme"
                >
                  <RiMoonLine size={20} />
                </button>

                {/* Separator */}
                <div className="w-px h-12 bg-[var(--callout-border)]/30 self-center"></div>

                {/* Orientation Toggle */}
                <button
                  onClick={() =>
                    setEmbedConfig((prev) => ({
                      ...prev,
                      orientation: "landscape",
                    }))
                  }
                  className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                    embedConfig.orientation === "landscape"
                      ? "bg-[var(--bronzer)] text-white shadow-lg"
                      : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                  }`}
                  title="Landscape"
                >
                  <RiTabletLine size={20} />
                </button>
                <button
                  onClick={() =>
                    setEmbedConfig((prev) => ({
                      ...prev,
                      orientation: "portrait",
                    }))
                  }
                  className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                    embedConfig.orientation === "portrait"
                      ? "bg-[var(--bronzer)] text-white shadow-lg"
                      : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                  }`}
                  title="Portrait"
                >
                  <RiSmartphoneLine size={20} />
                </button>
              </div>

              {/* Desktop Layout: Controls Left, Preview Right */}
              <div className="hidden lg:flex gap-6 items-start">
                {/* Desktop Controls (Left Side) */}
                <div className="flex flex-col gap-4 pt-4">
                  {/* Theme Toggle */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        setEmbedConfig((prev) => ({ ...prev, theme: "light" }))
                      }
                      className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                        embedConfig.theme === "light"
                          ? "bg-[var(--bronzer)] text-white shadow-lg"
                          : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                      }`}
                      title="Light Theme"
                    >
                      <RiSunLine size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setEmbedConfig((prev) => ({ ...prev, theme: "dark" }))
                      }
                      className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                        embedConfig.theme === "dark"
                          ? "bg-[var(--bronzer)] text-white shadow-lg"
                          : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                      }`}
                      title="Dark Theme"
                    >
                      <RiMoonLine size={20} />
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="h-px w-12 bg-[var(--callout-border)]/30 self-center"></div>

                  {/* Orientation Toggle */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        setEmbedConfig((prev) => ({
                          ...prev,
                          orientation: "landscape",
                        }))
                      }
                      className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                        embedConfig.orientation === "landscape"
                          ? "bg-[var(--bronzer)] text-white shadow-lg"
                          : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                      }`}
                      title="Landscape"
                    >
                      <RiTabletLine size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setEmbedConfig((prev) => ({
                          ...prev,
                          orientation: "portrait",
                        }))
                      }
                      className={`p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                        embedConfig.orientation === "portrait"
                          ? "bg-[var(--bronzer)] text-white shadow-lg"
                          : "bg-[var(--callout-bg)]/50 border border-[var(--callout-border)]/50 text-[var(--text-p)] hover:bg-[var(--callout-bg)]"
                      }`}
                      title="Portrait"
                    >
                      <RiSmartphoneLine size={20} />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex-1">
                  <div
                    className="mx-auto overflow-hidden shadow-2xl"
                    style={{
                      width: `${previewSize.width}px`,
                      height: `${previewSize.height}px`,
                      maxWidth: "100%",
                      borderRadius: "24px",
                    }}
                  >
                    <iframe
                      src={embedUrl}
                      width={previewSize.width}
                      height={previewSize.height}
                      frameBorder="0"
                      scrolling="no"
                      style={{
                        borderRadius: "24px",
                        width: "100%",
                        height: "100%",
                        display: "block",
                        border: "none",
                        background: "transparent",
                      }}
                      title={`${title} - Blog Post Summary`}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-xs text-[var(--text-p)] opacity-60 font-mono bg-[var(--callout-bg)]/50 px-3 py-1 rounded-full">
                      {dimensions.width}×{dimensions.height}px •{" "}
                      {embedConfig.orientation}
                      {previewSize.scale < 1 &&
                        ` • ${Math.round(previewSize.scale * 100)}% scale`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile: Show Embed Code Instead of Preview */}
              <div className="lg:hidden">
                <div className="bg-[var(--callout-bg)]/30 backdrop-blur-sm rounded-xl border border-[var(--callout-border)]/50 p-4">
                  <h4 className="text-sm font-medium text-[var(--text-h)] mb-3">
                    Embed Code
                  </h4>
                  <div className="bg-[var(--callout-bg)]/50 rounded-lg p-3 text-xs font-mono text-[var(--text-p)] overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">
                      {embedCode}
                    </pre>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-xs text-[var(--text-p)] opacity-60 font-mono bg-[var(--callout-bg)]/50 px-3 py-1 rounded-full">
                      {dimensions.width}×{dimensions.height}px •{" "}
                      {embedConfig.orientation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Copy Button */}
              <div className="pt-4">
                <button
                  onClick={copyEmbedCode}
                  disabled={copied}
                  className="w-full bg-[var(--bronzer)] hover:bg-[var(--bronzer)]/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <RiCheckLine size={16} />
                  ) : (
                    <RiFileCopyLine size={16} />
                  )}
                  {copied ? "Copied!" : "Copy Embed Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast {...toast} onClose={hideToast} />
    </>
  );
}
