"use client";

import NextImage from "next/image";
import React, { useState, useEffect } from "react";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const commonStyles =
  "w-full h-auto rounded-lg shadow-md transition-transform transform hover:scale-105 relative bg-white";
const altTextStyles =
  "absolute bottom-0 right-0 bg-[var(--bronzer)]/60 text-white text-xs italic p-0.5 rounded-tl-lg rounded-br-lg";

const Image: React.FC<ImageProps> = ({ src, alt, width, height }) => {
  const [imgDimensions, setImgDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!width || !height) {
      const img = document.createElement("img");
      img.src = src;
      img.onload = () => {
        setImgDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
    }
  }, [src, width, height]);

  const isExternal = src.startsWith("http") || src.startsWith("//");
  const finalWidth = width || imgDimensions?.width || 900;
  const finalHeight = height || imgDimensions?.height || 600;

  return (
    <div className={commonStyles}>
      {isExternal ? (
        <img
          src={src}
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          className="w-full h-auto rounded-lg bg-white"
          loading="lazy"
        />
      ) : (
        <NextImage
          src={src}
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          className="w-full h-auto rounded-lg bg-white"
        />
      )}
      <div className={altTextStyles}>{alt}</div>
    </div>
  );
};

export default Image;