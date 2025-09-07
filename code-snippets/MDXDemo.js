import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

// Custom MDX-like component
const MDXDemo = ({ children }) => (
  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
    <div className="text-blue-700 font-semibold mb-2">📘 MDX Feature</div>
    {children}
  </div>
);

// Custom Callout component (like in your blog)
const Callout = ({ emoji, children }) => (
  <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg my-4">
    <span className="text-2xl mr-3">{emoji}</span>
    <div className="flex-1 text-yellow-800">{children}</div>
  </div>
);

export default function App() {
  const [mdxCode, setMdxCode] = useState(`# Welcome to MDX!

This is **markdown** with React components mixed in:

<MDXDemo>
  MDX allows you to write JSX directly in your markdown files!
</MDXDemo>

<Callout emoji="💡">
  **Pro tip:** You can create interactive documentation with live examples
</Callout>

## Interactive Features

- ✅ Live editing
- ✅ React components
- ✅ Syntax highlighting
- ✅ Real-time preview`);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 MDX Interactive Demo
          </h1>
          <p className="text-gray-600">
            Experience the power of MDX - Markdown with React components!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg">
              <span className="text-sm font-mono">📝 MDX Editor</span>
            </div>
            <textarea
              value={mdxCode}
              onChange={(e) => setMdxCode(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border-none resize-none focus:outline-none"
              placeholder="Type your MDX here..."
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
              <span className="text-sm font-mono">👁️ Live Preview</span>
            </div>
            <div className="p-4 h-96 overflow-y-auto prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  // Custom component renderers
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-800">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 text-gray-600">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {mdxCode}
              </ReactMarkdown>

              {/* Render custom components when found in text */}
              {mdxCode.includes("<MDXDemo>") && (
                <MDXDemo>
                  <p className="text-blue-700">
                    This is a custom React component embedded in markdown!
                  </p>
                </MDXDemo>
              )}

              {mdxCode.includes("<Callout") && (
                <Callout emoji="💡">
                  <p>
                    <strong>Pro tip:</strong> You can create interactive
                    documentation with live examples
                  </p>
                </Callout>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Try editing the MDX code on the left to see changes in real-time! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
