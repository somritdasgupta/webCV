export interface MdxComponentProp {
  name: string;
  type: string;
  description: string;
  values?: string[];
  required?: boolean;
}

export interface MdxComponentDefinition {
  name: string;
  category: "emphasis" | "data" | "layout" | "media" | "code" | "inline";
  purpose: string;
  props: MdxComponentProp[];
  example: string;
}

/**
 * Catalogue of MDX components the blog renderer supports.
 *
 * The shape is deliberately documentation-grade: an assistant reads props and a
 * working example, so it can compose valid MDX without a trial commit.
 */
export const MDX_COMPONENTS: MdxComponentDefinition[] = [
  {
    name: "Callout",
    category: "emphasis",
    purpose: "Highlight a note, tip, warning, danger, or success message.",
    props: [
      { name: "type", type: "enum", description: "Visual style and colour.", values: ["note", "tip", "warning", "danger", "success"] },
      { name: "title", type: "string", description: "Short heading shown above the content." },
    ],
    example: '<Callout type="tip" title="Key idea">\nUseful context.\n</Callout>',
  },
  {
    name: "ProsCons",
    category: "layout",
    purpose: "Compare benefits and drawbacks in two columns.",
    props: [
      { name: "pros", type: "string[]", description: "Benefit lines.", required: true },
      { name: "cons", type: "string[]", description: "Drawback lines.", required: true },
    ],
    example: '<ProsCons pros={["Fast", "Simple"]} cons={["Limited"]} />',
  },
  {
    name: "Quote",
    category: "emphasis",
    purpose: "Render a prominent quotation with attribution.",
    props: [{ name: "author", type: "string", description: "Attribution line." }],
    example: '<Quote author="Author">\nQuoted text.\n</Quote>',
  },
  {
    name: "Kbd",
    category: "inline",
    purpose: "Render an inline keyboard key.",
    props: [],
    example: "<Kbd>Cmd</Kbd> + <Kbd>K</Kbd>",
  },
  {
    name: "LiveCode",
    category: "code",
    purpose: "Embed an editable React playground.",
    props: [
      { name: "template", type: "string", description: "Sandbox template, typically \"react\"." },
      { name: "files", type: "object", description: "Map of file path to file contents.", required: true },
    ],
    example: '<LiveCode template="react" files={{ "/App.js": `export default () => <h2>Hello</h2>` }} />',
  },
  {
    name: "Tweet",
    category: "media",
    purpose: "Embed a post from X by its numeric ID.",
    props: [{ name: "id", type: "string", description: "Post ID.", required: true }],
    example: '<Tweet id="1683920951807971329" />',
  },
  {
    name: "Chart",
    category: "data",
    purpose: "Render line, bar, area, pie, or radar data.",
    props: [
      { name: "type", type: "enum", description: "Chart form.", values: ["line", "bar", "area", "pie", "radar"], required: true },
      { name: "title", type: "string", description: "Chart heading." },
      { name: "data", type: "object[]", description: "Row objects keyed by axis and series names.", required: true },
    ],
    example: '<Chart type="line" title="Users" data={[{ week: "W1", users: 120 }, { week: "W2", users: 180 }]} />',
  },
  {
    name: "Stats",
    category: "data",
    purpose: "Show a compact grid of metrics.",
    props: [
      { name: "cols", type: "number", description: "Column count." },
      { name: "items", type: "object[]", description: "Entries of label, value, and optional change.", required: true },
    ],
    example: '<Stats cols={2} items={[{ label: "Posts", value: "42", change: 8 }]} />',
  },
  {
    name: "Tabs",
    category: "layout",
    purpose: "Group related content, typically per language or package manager.",
    props: [{ name: "label", type: "string", description: "Set on each child Tab.", required: true }],
    example: '<Tabs>\n  <Tab label="npm">`npm install pkg`</Tab>\n  <Tab label="bun">`bun add pkg`</Tab>\n</Tabs>',
  },
  {
    name: "Steps",
    category: "layout",
    purpose: "Present a numbered walkthrough.",
    props: [{ name: "title", type: "string", description: "Set on each child Step.", required: true }],
    example: '<Steps>\n  <Step title="Install">Run the command.</Step>\n  <Step title="Configure">Set the variables.</Step>\n</Steps>',
  },
  {
    name: "Accordion",
    category: "layout",
    purpose: "Add collapsible sections or a FAQ block.",
    props: [{ name: "title", type: "string", description: "Set on each child AccordionItem.", required: true }],
    example: '<Accordion>\n  <AccordionItem title="Question?">Answer.</AccordionItem>\n</Accordion>',
  },
  {
    name: "Video",
    category: "media",
    purpose: "Embed a YouTube video or a direct video file.",
    props: [
      { name: "src", type: "string", description: "Video URL.", required: true },
      { name: "caption", type: "string", description: "Caption below the player." },
    ],
    example: '<Video src="https://www.youtube.com/watch?v=VIDEO_ID" caption="Caption" />',
  },
  {
    name: "Badge",
    category: "inline",
    purpose: "Render an inline status label.",
    props: [{ name: "tone", type: "enum", description: "Colour tone.", values: ["default", "success", "warning", "danger"] }],
    example: '<Badge tone="success">stable</Badge>',
  },
  {
    name: "FileTree",
    category: "layout",
    purpose: "Display a directory structure.",
    props: [{ name: "tree", type: "object[]", description: "Nodes of name, type, and children.", required: true }],
    example: '<FileTree tree={[{ name: "src", type: "folder", children: [{ name: "main.tsx" }] }]} />',
  },
  {
    name: "Embed",
    category: "media",
    purpose: "Embed a third-party URL or sandboxed HTML widget.",
    props: [
      { name: "src", type: "string", description: "URL to embed.", required: true },
      { name: "title", type: "string", description: "Accessible frame title." },
      { name: "height", type: "number", description: "Frame height in pixels." },
    ],
    example: '<Embed src="https://codepen.io/team/codepen/pen/PNaGbb" title="Demo" height={420} />',
  },
];

export const MDX_BEST_PRACTICES = [
  "Use Callout for warnings and key takeaways rather than bold paragraphs.",
  "Use Tabs to group the same instruction across package managers or languages.",
  "Use Chart or Stats when a claim is numeric; keep raw tables for reference data.",
  "Use LiveCode only for short, self-contained React examples.",
  "Open with a plain paragraph before the first component so previews read well.",
];
