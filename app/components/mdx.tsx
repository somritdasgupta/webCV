import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import React from "react";
import { TweetComponent } from "./tweet";
import { LiveCode } from "./sandpack";
import dynamic from "next/dynamic";
import { FootnoteProvider } from "./FootnoteContext";

function Callout(props) {
  return (
    <div className="callout-container flex items-center p-8 mt-2 mb-2 rounded-lg">
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
          <div key={pro} className="flex font-medium items-baseline mb-4">
            <div className="h-4 w-4 mr-2">
              <svg className="h-5 w-4 text-emerald-500" viewBox="0 0 24 24">
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </g>
              </svg>
            </div>
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
          <div key={con} className="flex font-medium items-baseline mb-4">
            <div className="h-4 w-4 mr-2">
              <svg className="h-5 w-4 text-red-400" viewBox="0 0 20 20">
                <g
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </g>
              </svg>
            </div>
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
    <div className="pro-cons-container">
      <ProsCard pros={pros} />
      <ConsCard cons={cons} />
    </div>
  );
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
      className="rounded-lg border-2 border-gray-300 shadow-lg transition-transform transform hover:scale-105"
      {...props}
    />
  );
}

function Code({ children, ...props }) {
  let codeHTML = highlight(children);
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

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

function Iframe({ src }) {
  const iframeStyle = {
    width: "100%",
    height: "600px",
    borderRadius: "12px", // Slightly larger border radius for a more modern look
    border: "2px solid #1E90FF", // Brighter blue color
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Adding a subtle shadow for depth
    display: "block", // Ensures no inline spacing issues
    margin: "0 auto", // Centers the iframe horizontally
  };

  return (
    <iframe
      src={src}
      loading="lazy"
      style={iframeStyle}
      allow="web-share; clipboard-write"
      title="Embedded content" // Provides a title for accessibility
    />
  );
}

// Dynamically import components
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
  code: Code,
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
