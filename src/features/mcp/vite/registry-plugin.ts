import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

const registries = [
  {
    directory: "src/features/mcp/servers/reader/tools",
    output: "src/features/mcp/servers/reader/tools.generated.ts",
  },
  {
    directory: "src/features/mcp/servers/admin/tools",
    output: "src/features/mcp/servers/admin/tools.generated.ts",
  },
] as const;

const normalize = (file: string) => file.split(path.sep).join("/");

export function buildRegistrySource(files: string[]): string {
  const sortedFiles = [...files].sort();
  const imports = sortedFiles.map(
    (file, index) => `import tool_${index} from "./tools/${file.replace(/\.ts$/, "")}";`,
  );
  const tools = sortedFiles.map((_, index) => `tool_${index}`).join(", ");
  return `// Generated from the tool files in this folder. Do not edit.\n${imports.join("\n")}\n\nexport default [${tools}];\n`;
}

function registrySource(root: string, directory: string): string {
  const absoluteDirectory = path.resolve(root, directory);
  const files = readdirSync(absoluteDirectory)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".generated.ts"))
    .sort();
  return buildRegistrySource(files);
}

function writeRegistries(root: string): void {
  for (const registry of registries) {
    const output = path.resolve(root, registry.output);
    const next = registrySource(root, registry.directory);
    if (!existsSync(output) || readFileSync(output, "utf8") !== next) {
      writeFileSync(output, next, "utf8");
    }
  }
}

function watchToolFolders(server: ViteDevServer, root: string): void {
  const toolFolders = registries.map(({ directory }) => normalize(path.resolve(root, directory)));
  server.watcher.add(toolFolders);
  const handleChange = (file: string) => {
    const normalized = normalize(file);
    if (!toolFolders.some((folder) => normalized.startsWith(`${folder}/`))) return;
    try {
      writeRegistries(root);
    } catch (error) {
      server.config.logger.error(
        `[mcp] Could not regenerate tool registries: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  server.watcher.on("add", handleChange);
  server.watcher.on("unlink", handleChange);
  server.watcher.once("close", () => {
    server.watcher.off("add", handleChange);
    server.watcher.off("unlink", handleChange);
  });
}

export function mcpRegistryPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: "webcv-mcp-tool-registries",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
      writeRegistries(root);
    },
    configureServer(server) {
      watchToolFolders(server, root);
    },
  };
}