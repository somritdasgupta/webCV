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
  "w-full h-auto transition-transform transform hover:scale-[1.02] relative bg-transparent my-8 rounded-lg";
const altTextStyles =
  "absolute bottom-2 right-2 bg-[var(--bronzer)]/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm";

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
          className="w-full h-auto bg-transparent rounded-lg shadow-sm"
          loading="lazy"
        />
      ) : (
        <NextImage
          src={src}
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          className="w-full h-auto bg-transparent rounded-lg shadow-sm"
        />
      )}
      <div className={altTextStyles}>{alt}</div>
    </div>
  );
};

export default Image;
