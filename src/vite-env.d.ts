/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  export const frontmatter: {
    title: string;
    description: string;
    date: string;
    tags?: string[];
    cover?: string;
    draft?: boolean;
    readingTime?: number;
  };
  const Component: ComponentType;
  export default Component;
}
