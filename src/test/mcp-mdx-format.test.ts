import { describe, expect, it } from "vitest";
import { buildMdx, parseFrontmatter, toDateOnly } from "@/lib/mcp-admin/mdx";
import { buildMdx as buildEditorMdx } from "@/lib/admin/frontmatter";

describe("post file format", () => {
  it("toDateOnly_strips_iso_timestamps", () => {
    expect(toDateOnly("2026-09-10T18:30:00.000Z")).toBe("2026-09-10");
    expect(toDateOnly("2026-09-10")).toBe("2026-09-10");
  });

  it("toDateOnly_rejects_invalid_dates", () => {
    expect(toDateOnly("2026-02-30")).toBeNull();
    expect(toDateOnly("not a date")).toBeNull();
  });

  it("buildMdx_emits_javascript_export_without_yaml", () => {
    const out = buildMdx(
      { title: 'Say "hi"', description: "A description long enough.", date: "2026-09-10T00:00:00.000Z", tags: ["a", "b"], readingTime: 6 },
      "Body text",
    );
    expect(out.startsWith("export const frontmatter = {\n")).toBe(true);
    expect(out).not.toMatch(/^---/m);
    expect(out).toContain('date: "2026-09-10",');
    expect(out).toContain('title: "Say \\"hi\\"",');
    expect(out).not.toContain("cover");
    expect(out).not.toContain("draft");
    expect(out).toContain("};\n\nBody text\n");
  });

  it("buildMdx_output_is_valid_javascript", () => {
    const out = buildMdx({ title: "T", description: "A description long enough.", date: "2026-09-10", tags: ["x"], readingTime: 2 }, "Body");
    const block = out.slice(0, out.indexOf("};") + 2).replace("export const frontmatter =", "return");
    expect(new Function(block)()).toEqual({ title: "T", description: "A description long enough.", date: "2026-09-10", tags: ["x"], readingTime: 2 });
  });

  it("parseFrontmatter_round_trips_and_reads_legacy_yaml", () => {
    const fm = { title: "T", description: "A description long enough.", date: "2026-09-10", tags: ["x", "y"], readingTime: 3 };
    expect(parseFrontmatter(buildMdx(fm, "Body")).data).toEqual(fm);
    const legacy = parseFrontmatter('---\ntitle: "Old"\ndate: "2026-09-10T00:00:00.000Z"\n---\n\nHi');
    expect(legacy.data).toMatchObject({ title: "Old", date: "2026-09-10" });
    expect(legacy.body).toBe("Hi");
  });

  it("editor_buildMdx_writes_date_only", () => {
    const out = buildEditorMdx({ title: "T", description: "D", date: "2026-09-10T18:38:42.191Z" }, "Body");
    expect(out).toContain('date: "2026-09-10",');
  });
});
