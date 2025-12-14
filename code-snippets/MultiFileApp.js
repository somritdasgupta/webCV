import React, { useState } from "react";
import { formatDate, generateGreeting, randomColor } from "./utils";

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bgColor, setBgColor] = useState("bg-blue-500");
  const data = "Somrit";
  
  const refreshTime = () => {
    setCurrentTime(new Date());
    setBgColor(randomColor());
  };
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {generateGreeting(data, "day")} 👋
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome to the interactive multi-file code sandbox!
        </p>
        
        <div className={`p-4 rounded-lg ${bgColor} text-white mb-4`}>
          <p className="text-sm font-medium">Current Time:</p>
          <p className="text-lg">{formatDate(currentTime)}</p>
          <p className="text-sm">{currentTime.toLocaleTimeString()}</p>
        </div>
        
        <button 
          onClick={refreshTime}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Refresh & Change Color
        </button>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            This demo uses multiple files: <strong>App.js</strong> and <strong>utils.js</strong>. 
            Click the tabs above to explore the code!
          </p>
        </div>
      </div>
    </div>
  );
}
