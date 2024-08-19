// Import React and MDXRemote
import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";

import {
  Image,
  BlockQuote,
  Callout,
  CustomLink,
  useFootnotes,
  Footnote,
  FootnoteList,
  FootnoteProvider,
  Iframe,
  ProConsComparison,
  Table,
  Paragraph,
  createHeading,
  CodeBlock,
  TweetComponent,
  LiveCode,
  UnorderedList,
  OrderedList,
  ListItem,
} from "./mdxComponents/types/index";

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  p: Paragraph,
  a: CustomLink,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  Image: Image,
  blockquote: BlockQuote,
  Tweet: TweetComponent,
  ProConsComparison,
  Callout,
  Footnote,
  FootnoteList,
  Table,
  Iframe,
  LiveCode,
  code: (props) => <CodeBlock {...props} inline />,
  pre: (props) => {
    const className = props.children.props.className || "";
    const matches = className.match(/language-(\w+)/);
    const language = matches ? matches[1] : "";
    const filename = props.children.props.filename || null;
    return (
      <CodeBlock className={className} language={language} filename={filename}>
        {props.children.props.children.trim()}
      </CodeBlock>
    );
  },
};

export function CustomMDX(props) {
  return (
    <FootnoteProvider>
      <MDXRemote
        {...props}
        components={{ ...components, ...(props.components || {}) }}
      />
    </FootnoteProvider>
  );
}
