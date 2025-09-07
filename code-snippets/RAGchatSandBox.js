import React, { useState, useRef, useEffect } from "react";

// Demo knowledge base documents
const DEMO_DOCUMENTS = [
  {
    id: "react-hooks",
    title: "React Hooks Guide",
    type: "Documentation",
    icon: "💻",
    content:
      "React Hooks are functions that let you use state and other React features in functional components. Key hooks include useState, useEffect, useContext, and useReducer.",
  },
  {
    id: "nextjs-routing",
    title: "Next.js App Router",
    type: "Framework",
    icon: "🌐",
    content:
      "Next.js App Router provides file-system based routing with the app/ directory. Create dynamic routes using [id] syntax and layouts with layout.js files.",
  },
  {
    id: "typescript-types",
    title: "TypeScript Type System",
    type: "Language",
    icon: "⚡",
    content:
      "TypeScript extends JavaScript with static types. It includes basic types, advanced types like unions and generics, and utility types like Partial<T>.",
  },
  {
    id: "js-async",
    title: "JavaScript Async Programming",
    type: "Concepts",
    icon: "📄",
    content:
      "JavaScript async programming uses Promises and async/await. Promises represent eventual completion of operations with then/catch methods.",
  },
];

const SUGGESTED_QUESTIONS = [
  "How do React hooks work?",
  "What's new in Next.js App Router?",
  "Explain TypeScript generics",
  "How does JavaScript async/await work?",
];

const RAGchatSandBox = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm a RAG (Retrieval-Augmented Generation) chatbot. I can answer questions using the knowledge base documents. Try asking me about React, Next.js, TypeScript, or JavaScript!",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleDocumentSelection = (doc) => {
    setSelectedDocuments((prev) => {
      const isSelected = prev.some((d) => d.id === doc.id);
      if (isSelected) {
        return prev.filter((d) => d.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };

  const simulateRAGResponse = (question) => {
    const keywords = question.toLowerCase();
    let relevantDocs =
      selectedDocuments.length > 0 ? selectedDocuments : DEMO_DOCUMENTS;

    let response = "Based on the knowledge base, ";

    if (keywords.includes("hook") || keywords.includes("react")) {
      const reactDoc = relevantDocs.find((doc) => doc.id === "react-hooks");
      if (reactDoc) {
        response +=
          "React Hooks are functions that let you use state and other React features in functional components. Key hooks include useState for state management and useEffect for side effects.";
      } else {
        response +=
          "I'd need access to the React documentation to provide detailed information about React hooks.";
      }
    } else if (keywords.includes("next") || keywords.includes("routing")) {
      const nextDoc = relevantDocs.find((doc) => doc.id === "nextjs-routing");
      if (nextDoc) {
        response +=
          "Next.js App Router uses file-system based routing with the app/ directory. You can create dynamic routes using [id] syntax.";
      } else {
        response +=
          "I'd need access to the Next.js documentation to explain routing concepts.";
      }
    } else if (keywords.includes("typescript") || keywords.includes("type")) {
      const tsDoc = relevantDocs.find((doc) => doc.id === "typescript-types");
      if (tsDoc) {
        response +=
          "TypeScript extends JavaScript with static types. It includes basic types and advanced features like generics and utility types.";
      } else {
        response +=
          "I'd need access to TypeScript documentation to explain the type system.";
      }
    } else if (keywords.includes("async") || keywords.includes("promise")) {
      const jsDoc = relevantDocs.find((doc) => doc.id === "js-async");
      if (jsDoc) {
        response +=
          "JavaScript async programming uses Promises and async/await. Promises represent eventual completion of operations.";
      } else {
        response +=
          "I'd need access to JavaScript async programming documentation.";
      }
    } else {
      response +=
        "I can help you with questions about React, Next.js, TypeScript, and JavaScript. Try selecting some documents or ask a more specific question!";
    }

    return response;
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    setTimeout(() => {
      const response = simulateRAGResponse(userMessage);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "28px" }}>🗄️</span>
          RAG Chat Sandbox
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#64748b",
            marginBottom: "20px",
          }}
        >
          Interactive demonstration of Retrieval-Augmented Generation. Select
          documents to enhance AI responses.
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: "20px",
          background: "white",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "12px 20px",
            border: "none",
            background: activeTab === "chat" ? "#eff6ff" : "transparent",
            color: activeTab === "chat" ? "#2563eb" : "#64748b",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            borderBottom: activeTab === "chat" ? "2px solid #2563eb" : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>💬</span>
          Chat Interface
        </button>
        <button
          onClick={() => setActiveTab("knowledge")}
          style={{
            padding: "12px 20px",
            border: "none",
            background: activeTab === "knowledge" ? "#eff6ff" : "transparent",
            color: activeTab === "knowledge" ? "#2563eb" : "#64748b",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            borderBottom:
              activeTab === "knowledge" ? "2px solid #2563eb" : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📖</span>
          Knowledge Base
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
      >
        {/* Chat Interface */}
        <div style={{ display: activeTab === "knowledge" ? "none" : "block" }}>
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                padding: "20px",
                color: "white",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                Chat with RAG Assistant
              </h2>
              <p
                style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.8 }}
              >
                🗄️ {selectedDocuments.length} documents selected
              </p>
            </div>

            {/* Messages */}
            <div
              style={{
                height: "350px",
                overflowY: "auto",
                padding: "20px",
                background: "#f8fafc",
              }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    marginBottom: "12px",
                    borderRadius: "8px",
                    background: message.isUser
                      ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                      : "#ffffff",
                    marginLeft: message.isUser ? "20px" : "0",
                    marginRight: message.isUser ? "0" : "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: message.isUser ? "#2563eb" : "#64748b",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {message.isUser ? "👤" : "🤖"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "4px",
                      }}
                    >
                      {message.isUser ? "You" : "RAG Assistant"}
                    </div>
                    <p
                      style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}
                    >
                      {message.text}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    marginBottom: "12px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    marginRight: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#64748b",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    🤖
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "4px",
                      }}
                    >
                      RAG Assistant
                    </div>
                    <p style={{ margin: 0, fontSize: "14px" }}>Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid #e2e8f0",
                background: "white",
                display: "flex",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about React, Next.js, TypeScript, or JavaScript..."
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  padding: "12px 20px",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                }}
              >
                <span>➤</span>
                Send
              </button>
            </div>
          </div>

          {/* Suggested Questions */}
          <div
            style={{
              marginTop: "20px",
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              <span style={{ marginRight: "8px" }}>💡</span>
              Suggested Questions
            </h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#eff6ff";
                    e.target.style.borderColor = "#93c5fd";
                    e.target.style.color = "#1e40af";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.color = "#374151";
                  }}
                >
                  💭 {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div style={{ display: activeTab === "chat" ? "none" : "block" }}>
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                padding: "20px",
                color: "white",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                <span style={{ marginRight: "8px" }}>📖</span>
                Knowledge Base
              </h2>
              <p
                style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.8 }}
              >
                Click documents to include in context
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                maxHeight: "350px",
                overflowY: "auto",
              }}
            >
              {DEMO_DOCUMENTS.map((doc) => {
                const isSelected = selectedDocuments.some(
                  (d) => d.id === doc.id
                );
                return (
                  <div
                    key={doc.id}
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      border: `2px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isSelected ? "#eff6ff" : "white",
                      transition: "all 0.2s",
                    }}
                    onClick={() => toggleDocumentSelection(doc)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.borderColor = "#93c5fd";
                        e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>{doc.icon}</span>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          {doc.title}
                        </h3>
                        <p
                          style={{
                            margin: "2px 0 0 0",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {doc.type}
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#64748b",
                        lineHeight: "1.4",
                      }}
                    >
                      {doc.content.slice(0, 100)}...
                    </p>
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "4px 8px",
                        background: isSelected ? "#dbeafe" : "#f1f5f9",
                        color: isSelected ? "#1e40af" : "#64748b",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "500",
                        display: "inline-block",
                      }}
                    >
                      {isSelected ? "✓ Selected" : "Click to select"}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedDocuments.length > 0 && (
              <div
                style={{
                  padding: "20px",
                  borderTop: "1px solid #e2e8f0",
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px 0",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#1e40af",
                  }}
                >
                  📋 Selected Documents ({selectedDocuments.length})
                </h3>
                {selectedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px",
                      background: "white",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      fontSize: "14px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <span>{doc.icon}</span>
                    <span style={{ fontWeight: "600", color: "#1e40af" }}>
                      {doc.title}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      ({doc.type})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div
        style={{
          marginTop: "30px",
          background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #bfdbfe",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px 0",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1e40af",
          }}
        >
          <span style={{ marginRight: "8px" }}>💬</span>
          How RAG Works
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
              🔍 1. Retrieval
            </h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Search through knowledge base documents to find relevant
              information.
            </p>
          </div>
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
              📝 2. Augmentation
            </h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Add retrieved documents to the context of your question.
            </p>
          </div>
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>
              ✨ 3. Generation
            </h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Generate responses using both your question and retrieved
              information.
            </p>
          </div>
        </div>
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            background: "#fef3c7",
            borderRadius: "6px",
            border: "1px solid #f59e0b",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "#92400e" }}>
            💡 <strong>Try this:</strong> Select different documents and ask the
            same question to see how context affects responses!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RAGchatSandBox;
