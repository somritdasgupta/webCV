import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import React from "react";
import { TweetComponent } from "./tweet";
import { LiveCode } from "./sandpack";
import dynamic from "next/dynamic";
import { FootnoteProvider } from "./FootnoteContext";
import { CodeBlock } from "./CodeBlock";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

function Paragraph({ children }) {
  return <p className="mb-4">{children}</p>;
}

function BlockQuote({ children }) {
  return <blockquote className="p-0.5">{children}</blockquote>;
}

function CustomLink(props) {
  let href = props.href;

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
  return (
    <Image
      alt={props.alt}
      className="rounded-lg border-2 border-slate-800 shadow-md transition-transform transform hover:scale-105"
      {...props}
    />
  );
}

function Iframe({ src }) {
  return (
    <iframe
      src={src}
      loading="lazy"
      allow="web-share; clipboard-write"
      title="Embedded content"
      className="w-full h-[600px] rounded-lg border-2 border-[aquamarine] shadow-md block mx-auto"
    />
  );
}

function Callout(props) {
  return (
    <div className="callout-container flex items-center pl-8 pr-8 mt-8 mb-8 shadow-md rounded-lg">
      <div className="emoji-container text-sm mr-3">{props.emoji}</div>
      <div className="text-container flex-1 text-sm">{props.children}</div>
    </div>
  );
}

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

// ProsCard Component
function ProsCard({ pros }) {
  return (
    <div className="pros-card">
      <div className="mt-4 ml-4">
        {pros.map((pro) => (
          <div key={pro} className="flex font-medium items-center mb-4">
            <FiCheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
            <span>{pro}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ConsCard Component
function ConsCard({ cons }) {
  return (
    <div className="cons-card">
      <div className="mt-4 ml-4">
        {cons.map((con) => (
          <div key={con} className="flex font-medium items-center mb-4">
            <FiXCircle className="h-4 w-4 mr-2 text-red-400" />
            <span>{con}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Container Component
function ProConsComparison({ pros, cons }) {
  return (
    <div className="pro-cons-container shadow-md">
      <ProsCard pros={pros} />
      <ConsCard cons={cons} />
    </div>
  );
}

const Footnote = dynamic(
  () => import("../components/Footnote").then((mod) => mod.Footnote),
  { ssr: false }
);
const FootnoteList = dynamic(
  () => import("../components/FootnoteList").then((mod) => mod.FootnoteList),
  { ssr: false }
);

let components = {
  Image: RoundedImage,
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  p: Paragraph,
  ProsCard,
  ConsCard,
  ProConsComparison,
  a: CustomLink,
  BlockQuote,
  Callout,
  Footnote,
  FootnoteList,
  StaticTweet: TweetComponent,
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
  LiveCode,
  Table,
  Iframe,
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
