import React from "react";

export function ListItem({ children }: { children: React.ReactNode }) {
  const renderChildren = (node: React.ReactNode) => {
    if (typeof node === "string") {
      return <span className="text-[var(--text-p)]">{node}</span>;
    }

    return React.Children.map(node, (child) => {
      if (React.isValidElement(child)) {
        // For strong or bold text
        if (child.type === "strong" || child.type === "b") {
          return (
            <span className="text-[var(--text-color)] font-semibold">
              {renderChildren(child.props.children)}
            </span>
          );
        }

        // For italic text
        if (child.type === "em" || child.type === "i") {
          return (
            <span className="text-[var(--text-p)] italic">
              {renderChildren(child.props.children)}
            </span>
          );
        }

        // For normal text or other elements
        return React.cloneElement(
          child,
          {},
          renderChildren(child.props.children)
        );
      }
      return child;
    });
  };

  return (
    <li className="list-outside mb-3 text-sm leading-7 text-[var(--text-p)]">
      {renderChildren(children)}
    </li>
  );
}

export function UnorderedList({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8">
      <ul className="list-outside list-disc pl-5 space-y-1">{children}</ul>
    </div>
  );
}

export function OrderedList({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8">
      <ol className="list-outside list-decimal pl-5 space-y-1">{children}</ol>
    </div>
  );
}

export const ListComponents = {
  UnorderedList,
  OrderedList,
  ListItem,
};
