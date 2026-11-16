import { describe, expect, it } from "vitest";
import { buildRegistrySource } from "@/features/mcp/vite/registry-plugin";

describe("MCP tool registry generation", () => {
  it("discovers added tools in a stable filename order", () => {
    const source = buildRegistrySource([
      "create-note.ts",
      "list-notes.ts",
    ]);

    expect(source).toContain('import tool_0 from "./tools/create-note";');
    expect(source).toContain('import tool_1 from "./tools/list-notes";');
    expect(source).toContain("export default [tool_0, tool_1];");
  });
});