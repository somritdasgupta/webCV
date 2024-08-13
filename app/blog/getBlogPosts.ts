import fs from "fs/promises";
import path from "path";

type Metadata = {
  category: string;
  author: string;
  enclosure: any;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  tags?: string[];
};

async function parseFrontmatter(
  fileContent: string
): Promise<{ metadata: Metadata; content: string }> {
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
    let value = valueArr
      .join(": ")
      .trim()
      .replace(/^['"](.*)['"]$/, "$1");

    if (key.trim() === "tags") {
      metadata[key.trim() as keyof Metadata] = value
        .slice(1, -1)
        .split(",")
        .map((tags) => tags.trim());
    } else {
      metadata[key.trim() as keyof Metadata] = value;
    }
  });

  return { metadata: metadata as Metadata, content };
}

async function getMDXFiles(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir)).filter(
      (file) => path.extname(file) === ".mdx"
    );
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

async function readMDXFile(
  filePath: string
): Promise<{ metadata: Metadata; content: string }> {
  try {
    const rawContent = await fs.readFile(filePath, "utf-8");
    return parseFrontmatter(rawContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { metadata: {} as Metadata, content: "" };
  }
}

export async function getBlogPosts(): Promise<
  { metadata: Metadata; slug: string; content: string }[]
> {
  const dir = path.join(process.cwd(), "contents");
  const mdxFiles = await getMDXFiles(dir);
  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const { metadata, content } = await readMDXFile(path.join(dir, file));
      const slug = path.basename(file, path.extname(file));
      return { metadata, slug, content };
    })
  );
  return posts;
}
