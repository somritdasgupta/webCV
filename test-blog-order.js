const fs = require("fs/promises");
const path = require("path");

async function parseFrontmatter(fileContent) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    throw new Error("Front matter not found");
  }

  const frontMatterBlock = match[1];
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr
      .join(": ")
      .trim()
      .replace(/^['"](.*)['"]$/, "$1");
    metadata[key.trim()] = value;
  });

  return metadata;
}

async function getMDXFiles(dir) {
  try {
    return (await fs.readdir(dir)).filter(
      (file) => path.extname(file) === ".mdx"
    );
  } catch (error) {
    return [];
  }
}

async function readMDXFile(filePath) {
  try {
    const rawContent = await fs.readFile(filePath, "utf-8");
    return parseFrontmatter(rawContent);
  } catch (error) {
    return {};
  }
}

async function getBlogPosts() {
  const dir = path.join(process.cwd(), "contents");
  const mdxFiles = await getMDXFiles(dir);
  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const metadata = await readMDXFile(path.join(dir, file));
      const slug = path.basename(file, path.extname(file));
      return { metadata, slug };
    })
  );

  // Sort posts by publishedAt date in descending order (newest first)
  return posts.sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt);
    const dateB = new Date(b.metadata.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });
}

async function main() {
  console.log("Testing blog post ordering...\n");
  const posts = await getBlogPosts();

  console.log("Posts in order:");
  posts.forEach((post, index) => {
    console.log(
      `${index + 1}. ${post.metadata.title} (${post.metadata.publishedAt})`
    );
  });
}

main().catch(console.error);
