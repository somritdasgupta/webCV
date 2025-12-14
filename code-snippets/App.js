import React from "react";

export default function App() {
  const data = "it's Somrit";

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Hey, {data}! 👋
        </h1>
        <p className="text-gray-600">
          Welcome to the interactive code sandbox!
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            This is a live React component running in Sandpack. Try editing the
            code to see changes in real-time!
          </p>
        </div>
      </div>
    </div>
  );
}
