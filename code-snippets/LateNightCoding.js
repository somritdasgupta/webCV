import React, { useState, useEffect } from "react";

// Mock commit data with better variety
const generateCommits = () => [
  {
    time: "23:45",
    message: "Fix responsive navigation bug",
    type: "fix",
    files: 3,
  },
  {
    time: "00:12",
    message: "Add dark mode toggle functionality",
    type: "feature",
    files: 2,
  },
  {
    time: "00:38",
    message: "Refactor API service layer",
    type: "refactor",
    files: 5,
  },
  {
    time: "01:05",
    message: "Optimize bundle size with lazy loading",
    type: "perf",
    files: 4,
  },
  {
    time: "01:23",
    message: "Update documentation for new features",
    type: "docs",
    files: 1,
  },
  {
    time: "01:47",
    message: "Fix memory leak in WebSocket connection",
    type: "fix",
    files: 2,
  },
  {
    time: "02:15",
    message: "Implement user authentication flow",
    type: "feat",
    files: 6,
  },
];

const CommitTypeIcon = ({ type }) => {
  const icons = {
    fix: { icon: "🐛", color: "text-red-500", bg: "bg-red-50" },
    feature: { icon: "✨", color: "text-blue-500", bg: "bg-blue-50" },
    refactor: { icon: "♻️", color: "text-yellow-500", bg: "bg-yellow-50" },
    perf: { icon: "⚡", color: "text-green-500", bg: "bg-green-50" },
    docs: { icon: "📝", color: "text-purple-500", bg: "bg-purple-50" },
    feat: { icon: "🎉", color: "text-pink-500", bg: "bg-pink-50" },
  };
  const config = icons[type] || icons.feat;

  return (
    <div
      className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}
    >
      <span className="text-lg">{config.icon}</span>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, gradient }) => (
  <div className={`p-6 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm opacity-90">{title}</div>
        {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
      </div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  </div>
);

const ProgressBar = ({ label, value, maxValue, color = "blue" }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{label}</span>
        <span>
          {value}/{maxValue}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${colors[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commits, setCommits] = useState([]);
  const [coffeeCount, setCoffeeCount] = useState(3);
  const [linesOfCode, setLinesOfCode] = useState(247);
  const [commitMessage, setCommitMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate loading commits with animation
    const loadCommits = () => {
      const allCommits = generateCommits();
      allCommits.forEach((commit, index) => {
        setTimeout(() => {
          setCommits((prev) => [...prev, commit]);
          setLinesOfCode((prev) => prev + Math.floor(Math.random() * 50) + 20);
        }, index * 800);
      });
    };
    loadCommits();
  }, []);

  const addCommit = () => {
    if (!commitMessage.trim()) return;

    const newCommit = {
      time: currentTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      message: commitMessage,
      type: "feat",
      files: Math.floor(Math.random() * 5) + 1,
    };

    setCommits((prev) => [...prev, newCommit]);
    setCommitMessage("");
    setLinesOfCode((prev) => prev + Math.floor(Math.random() * 30) + 15);
  };

  const timeDisplay = currentTime.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const isLateNight =
    currentTime.getHours() >= 22 || currentTime.getHours() <= 6;
  const productivity = Math.min((commits.length / 7) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl md:text-6xl font-mono font-bold mb-4 text-gray-800">
            {timeDisplay}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-700">
            {isLateNight
              ? "🌙 Late Night Dev Session"
              : "☀️ Daytime Development"}
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            {isLateNight
              ? "The quiet hours when the best code is born"
              : "Productive daylight coding session"}
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Lines of Code"
            value={linesOfCode.toLocaleString()}
            subtitle="Tonight's progress"
            icon="💻"
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Commits"
            value={commits.length}
            subtitle="Git history"
            icon="📝"
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="Coffee Consumed"
            value={coffeeCount}
            subtitle="Fuel level"
            icon="☕"
            gradient="from-amber-500 to-orange-500"
          />
          <StatCard
            title="Focus Level"
            value={`${Math.round(productivity)}%`}
            subtitle="Peak performance"
            icon="🎯"
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Progress Tracking */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Session Progress
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ProgressBar
                label="Commits Goal"
                value={commits.length}
                maxValue={10}
                color="green"
              />
              <ProgressBar
                label="Code Quality"
                value={8}
                maxValue={10}
                color="blue"
              />
              <ProgressBar
                label="Energy Level"
                value={Math.max(10 - coffeeCount, 3)}
                maxValue={10}
                color="purple"
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {productivity < 30 ? "🌱" : productivity < 70 ? "🔥" : "🚀"}
                </div>
                <div className="text-lg font-semibold text-gray-700">
                  {productivity < 30 && "Getting Started"}
                  {productivity >= 30 && productivity < 70 && "In The Zone"}
                  {productivity >= 70 && "Unstoppable"}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Keep the momentum going!
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Commit Input */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💾</span>
                New Commit
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCommit()}
                  placeholder="What did you build?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addCommit}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Commit & Push 🚀
                </button>
              </div>
            </div>

            {/* Coffee Counter */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">☕</span>
                Fuel Station
              </h3>
              <div className="text-center">
                <div className="text-3xl mb-2">{coffeeCount} cups</div>
                <div className="text-sm text-gray-500 mb-4">
                  {coffeeCount < 3 && "Need more caffeine!"}
                  {coffeeCount >= 3 && coffeeCount < 6 && "Perfect fuel level"}
                  {coffeeCount >= 6 && "Might be too much... 😅"}
                </div>
                <button
                  onClick={() => setCoffeeCount((c) => c + 1)}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Brew Another ☕
                </button>
              </div>
            </div>
          </div>

          {/* Commit History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📚</span>
                Commit History ({commits.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {commits.map((commit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <CommitTypeIcon type={commit.type} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {commit.message}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span>{commit.time}</span>
                        <span>{commit.files} files changed</span>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                          {commit.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {commits.length === 0 && (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-4xl mb-4">🤔</div>
                    <p>No commits yet... but the night is young!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>
            ✨ Remember: The best code often comes from the quiet hours of
            focused work
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
