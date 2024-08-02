import { promises as fs } from 'fs';  // Use promises API for async operations
import path from 'path';

type Metadata = {
  category: string;
  author: string;
  enclosure: any;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

async function parseFrontmatter(fileContent: string): Promise<{ metadata: Metadata; content: string }> {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    throw new Error("Front matter not found");
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    const value = valueArr.join(": ").trim().replace(/^['"](.*)['"]$/, "$1");
    metadata[key.trim() as keyof Metadata] = value;
  });

  return { metadata: metadata as Metadata, content };
}

async function getMDXFiles(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir)).filter((file) => path.extname(file) === ".mdx");
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

async function readMDXFile(filePath: string): Promise<{ metadata: Metadata; content: string }> {
  try {
    const rawContent = await fs.readFile(filePath, "utf-8");
    return parseFrontmatter(rawContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { metadata: {} as Metadata, content: "" };
  }
}

async function getMDXData(dir: string): Promise<{ metadata: Metadata; slug: string; content: string }[]> {
  const mdxFiles = await getMDXFiles(dir);
  return Promise.all(mdxFiles.map(async (file) => {
    const { metadata, content } = await readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));
    return { metadata, slug, content };
  }));
}

export async function getBlogPosts(): Promise<{ metadata: Metadata; slug: string; content: string }[]> {
  return getMDXData(path.join(process.cwd(), "contents"));
}

export function formatDate(date: string, includeRelative = false): string {
  const currentDate = new Date();
  let formattedDate = "";

  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }

  const targetDate = new Date(date);
  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  const fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return includeRelative ? `${fullDate} (${formattedDate})` : fullDate;
}
