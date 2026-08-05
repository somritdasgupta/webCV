export interface MdxComponentDefinition {
  name: string;
  purpose: string;
  example: string;
}

export const MDX_COMPONENTS: MdxComponentDefinition[] = [
  { name: "Callout", purpose: "Emphasize a note, tip, warning, danger, or success message.", example: '<Callout type="tip" title="Key idea">\nUseful context.\n</Callout>' },
  { name: "ProsCons", purpose: "Compare benefits and drawbacks in two columns.", example: '<ProsCons pros={["Fast", "Simple"]} cons={["Limited"]} />' },
  { name: "Quote", purpose: "Render a prominent quotation with attribution.", example: '<Quote author="Author">\nQuoted text.\n</Quote>' },
  { name: "Kbd", purpose: "Render an inline keyboard key.", example: '<Kbd>Cmd</Kbd> + <Kbd>K</Kbd>' },
  { name: "LiveCode", purpose: "Add an editable React playground.", example: '<LiveCode template="react" files={{ "/App.js": `export default () => <h2>Hello</h2>` }} />' },
  { name: "Tweet", purpose: "Embed a post from X by ID.", example: '<Tweet id="1683920951807971329" />' },
  { name: "Chart", purpose: "Render line, bar, area, pie, or radar data.", example: '<Chart type="line" title="Users" data={[{ week: "W1", users: 120 }, { week: "W2", users: 180 }]} />' },
  { name: "Stats", purpose: "Show a compact grid of metrics.", example: '<Stats cols={2} items={[{ label: "Posts", value: "42", change: 8 }]} />' },
  { name: "Tabs", purpose: "Group related content into tabs.", example: '<Tabs>\n  <Tab label="npm">`npm install pkg`</Tab>\n  <Tab label="bun">`bun add pkg`</Tab>\n</Tabs>' },
  { name: "Steps", purpose: "Present a numbered walkthrough.", example: '<Steps>\n  <Step title="Install">Run the command.</Step>\n  <Step title="Configure">Set the variables.</Step>\n</Steps>' },
  { name: "Accordion", purpose: "Add collapsible sections or FAQs.", example: '<Accordion>\n  <AccordionItem title="Question?">Answer.</AccordionItem>\n</Accordion>' },
  { name: "Video", purpose: "Embed YouTube or a direct video file.", example: '<Video src="https://www.youtube.com/watch?v=VIDEO_ID" caption="Caption" />' },
  { name: "Badge", purpose: "Render an inline status label.", example: '<Badge tone="success">stable</Badge>' },
  { name: "FileTree", purpose: "Display a directory structure.", example: '<FileTree tree={[{ name: "src", type: "folder", children: [{ name: "main.tsx" }] }]} />' },
  { name: "Embed", purpose: "Embed a third-party URL or sandboxed HTML widget.", example: '<Embed src="https://codepen.io/team/codepen/pen/PNaGbb" title="Demo" height={420} />' },
];