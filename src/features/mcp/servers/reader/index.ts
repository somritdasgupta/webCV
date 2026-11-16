import { defineMcp } from "@lovable.dev/mcp-js";
import tools from "./tools.generated";

export default defineMcp({
  name: "somrit-webcv-mcp",
  title: "Somrit Dasgupta — Personal Site",
  version: "0.1.0",
  instructions:
    "Tools for exploring Somrit Dasgupta's personal site (somritdasgupta.in): read published blog posts, look up the author's bio and links, and inspect public GitHub activity and repositories. All data is public — no authentication required.",
  tools,
});
