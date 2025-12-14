// Custom components that work with MDX
export const Callout = ({ emoji, type = "info", children }) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <div
      className={`flex items-start p-4 border rounded-lg my-4 ${styles[type]}`}
    >
      <span className="text-2xl mr-3">{emoji}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const CodeBlock = ({ language, children }) => (
  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm my-4">
    <div className="text-gray-500 text-xs mb-2">{language}</div>
    <pre>
      <code>{children}</code>
    </pre>
  </div>
);

export const InteractiveButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
  >
    {children}
  </button>
);

export const FeatureCard = ({ title, description, icon }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);
