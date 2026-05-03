/**
 * Single source of truth for the /cv page.
 * Edit here — page renders from this object.
 */

export const cvData = {
  header: {
    name: "Somrit Dasgupta",
    title: "Software Engineer",
    location: "Kolkata, IN",
    email: "thesomritdasgupta@gmail.com",
    website: "somritdasgupta.in",
    github: "https://github.com/somritdasgupta",
    linkedin: "https://www.linkedin.com/in/somritdasgupta",
  },

  summary:
    "Software Engineer who builds backend systems and AI tools that run in the cloud. I take projects from the initial idea all the way to a working application, making sure they're secure and handle data properly. I work with AWS services to build AI systems using tools like LangGraph and AWS Bedrock, and I create tools that help other developers. I also contribute to open-source projects, building and sharing tools that solve real problems for people.",

  skills: {
    "Generative AI": [
      "AWS Bedrock (Knowledge Bases/Agents/Guardrails)",
      "OpenAI/Gemini SDKs",
      "LangGraph",
      "HuggingFace",
    ],
    "AWS Infrastructure": [
      "AWS Lambda",
      "Amazon S3",
      "DynamoDB",
      "Amazon OpenSearch (Vector DB)",
      "App Runner",
    ],
    "Backend & Data": [
      "Python",
      "Node.js",
      "Go",
      "SQL (PostgreSQL)",
      "WebSockets",
      "Prisma",
    ],
    "CI/CD": ["Docker", "GitHub Actions", "Linux Shell Scripting", "AWS CDK"],
  } as Record<string, string[]>,

  experience: [
    {
      role: "System Engineer",
      company: "Tata Consultancy Services (TCS)",
      period: "April 2025 – Present",
      achievements: [
        "Automated Workflows: Built Python-based tools that handle daily system audits, reducing manual tasks by 40%.",
        "Cloud Support: Managed business data flows within Oracle Fusion Cloud, ensuring information stayed correct across global systems.",
        "Stability: Monitored backend server health to maintain 99.9% uptime for enterprise-level applications.",
      ],
    },
  ],

  projects: [
    {
      name: "aiDe",
      tech: "Local AI Browser Tool",
      link: "https://github.com/somritdasgupta/aide",
      description: [
        "Built a browser extension that lets users run AI models on their own hardware instead of paying for cloud APIs.",
        "Added a feature that lets the AI search the web for current facts before it answers, which fixed the problem of outdated answers.",
        "Used TypeScript to build a sidebar that works on any website, so users don't have to keep switching tabs to use AI.",
      ],
    },
    {
      name: "typeGuard",
      tech: "Fast Data Checker",
      link: "https://github.com/somritdasgupta/typeguard",
      description: [
        "Created a small tool for TypeScript developers to check if the data their app receives is actually correct.",
        "Designed it without using any extra libraries to keep it under 3KB, much faster and lighter than the standard tools.",
        "Made sure the tool automatically understands the code's data types so developers don't have to write the same code twice.",
      ],
    },
    {
      name: "paperpaste",
      tech: "Encrypted Content Syncing Platform",
      link: "https://paperpaste.vercel.app",
      description: [
        "Built an app to send text and files between a phone and a computer without using a middleman like email or Slack.",
        "Used End-to-End Encryption so data is scrambled before it leaves the device — no one, not even the server, can read it.",
        "Set up a quick pairing system so devices can find each other and sync instantly without a permanent account or password.",
      ],
    },
    {
      name: "queFork",
      tech: "API Testing Platform",
      link: "https://quefork.vercel.app",
      description: [
        "Made a web tool for testing how apps talk to servers, specifically for live features like chat or stock updates (WebSockets).",
        "Built it so it runs entirely in the browser without needing an install — start testing in seconds.",
        "Added a live log that shows data as it moves back and forth, making it easier to see exactly where a connection is breaking.",
      ],
    },
    {
      name: "cogent-x",
      tech: "Private AI Search",
      link: "https://cogent-x.vercel.app",
      description: [
        "Built a system that lets a user upload documentation URLs which the backend scrapes to build a knowledge base, then ask questions about them.",
        "Programmed it to read the documents first and only use those facts for answers, which stops the AI from making things up.",
        "Kept the document searching local so private information stays on the user's machine and isn't used to train public AI models.",
      ],
    },
  ],

  education: {
    degree: "B.Tech in Computer Science & Engineering",
    cgpa: "9.1 CGPA",
    institution: "Maulana Abul Kalam Azad University of Technology",
    period: "2020 – 2024",
  },

  certifications: [
    {
      category: "Recent & Core Certifications",
      certs: [
        "Azure Fundamentals (AZ-900) – Microsoft, December 2025.",
        "LangGraph: Deep Agents – LangChain, December 2025.",
        "OCI Generative AI Professional – Oracle, August 2025.",
        "Generative AI Fundamentals – Databricks, August 2025.",
        "GitHub Foundations – GitHub, February 2025.",
      ],
    },
    {
      category: "Specialized AI & Business Certifications",
      certs: [
        "Oracle Fusion AI Agent Studio Foundations – July 2025.",
        "Oracle Fusion Cloud ERP Process Essentials – August 2025.",
      ],
    },
    {
      category: "Foundational Certifications",
      certs: [
        "SQL (Advanced) – HackerRank, August 2023.",
        "JavaScript Algorithms and Data Structures – freeCodeCamp, August 2023.",
        "Endpoint Security – Cisco, August 2023.",
      ],
    },
  ],
};