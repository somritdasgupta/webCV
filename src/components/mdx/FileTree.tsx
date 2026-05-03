import { File, Folder } from "lucide-react";
import { ReactNode } from "react";

interface Node {
  name: string;
  type?: "file" | "folder";
  children?: Node[];
  note?: string;
}

const Row = ({ node, depth }: { node: Node; depth: number }) => {
  const isFolder = node.type === "folder" || !!node.children?.length;
  const Icon = isFolder ? Folder : File;
  return (
    <>
      <div
        className="flex items-center gap-2 py-1 text-sm"
        style={{ paddingLeft: depth * 16 }}
      >
        <Icon className={isFolder ? "h-4 w-4 text-accent" : "h-4 w-4 text-muted-foreground"} />
        <span className={isFolder ? "font-medium text-foreground" : "text-foreground/90"}>
          {node.name}
        </span>
        {node.note && (
          <span className="text-xs text-muted-foreground">— {node.note}</span>
        )}
      </div>
      {node.children?.map((c, i) => (
        <Row key={`${c.name}-${i}`} node={c} depth={depth + 1} />
      ))}
    </>
  );
};

export interface FileTreeProps {
  tree: Node[];
  caption?: ReactNode;
}

export const FileTree = ({ tree, caption }: FileTreeProps) => (
  <figure className="my-6 rounded-xl border border-border bg-card/40 p-3">
    {tree.map((n, i) => (
      <Row key={`${n.name}-${i}`} node={n} depth={0} />
    ))}
    {caption && (
      <figcaption className="mt-2 px-1 text-xs text-muted-foreground">{caption}</figcaption>
    )}
  </figure>
);
