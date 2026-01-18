export const cvData = {
  // ============================================
  // HEADER & CONTACT INFO
  // ============================================
  header: {
    name: "Somrit Dasgupta",
    title: "Software Engineer",
    location: "Kolkata, IN",
    email: "thesomritdasgupta@gmail.com",
    website: "somritdasgupta.in",
    github: "https://github.com/somritdasgupta",
    linkedin: "https://www.linkedin.com/in/somritdasgupta",
  },

  // ============================================
  // PROFESSIONAL SUMMARY
  // ============================================
  summary:
    "Software Engineer who builds backend systems and AI tools that run in the cloud. I take projects from the initial idea all the way to a working application, making sure they're secure and handle data properly. I work with AWS services to build AI systems using tools like LangGraph and AWS Bedrock, and I create tools that help other developers. I also contribute to open-source projects, building and sharing tools that solve real problems for people.",

  // ============================================
  // TECHNICAL SKILLS
  // ============================================
  skills: {
    "AI Ecosystem": [
      "AWS Bedrock (Knowledge Bases, Agents, Guardrails)",
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
      "Drizzle ORM",
    ],
    DevOps: ["Docker", "GitHub Actions (CI/CD)", "Linux", "AWS CDK"],
  },

  // ============================================
  // WORK EXPERIENCE
  // To add: Copy a role object and fill in details
  // To remove: Delete the entire object
  // To reorder: Change the order property (1, 2, 3, etc)
  // To show/hide: Set isShown to true or false
  // ============================================
  experience: [
    {
      order: 1,
      isShown: true,
      role: "System Engineer",
      company: "Tata Consultancy Services (TCS)",
      period: "April 2025 – Present",
      achievements: [
        "Automated Workflows: Built Python-based tools that handle daily system audits, reducing manual tasks by 40%.",
        "Cloud Support: Managed business data flows within Oracle Fusion Cloud, ensuring information stayed correct across global systems.",
        "Stability: Monitored backend server health to maintain 99.9% uptime for enterprise-level applications.",
      ],
    },
    // Add more roles here like:
    // {
    //   order: 2,
    //   isShown: true,
    //   role: "Role Name",
    //   company: "Company Name",
    //   period: "Start – End",
    //   achievements: [
    //     "Achievement 1",
    //     "Achievement 2",
    //   ],
    // },
  ],

  // ============================================
  // PROJECTS
  // To add: Copy a project object and fill in details
  // To remove: Delete the entire object
  // To reorder: Change the order property (1, 2, 3, etc)
  // To show/hide: Set isShown to true or false
  // ============================================
  projects: [
    {
      order: 1,
      isShown: true,
      name: "aiDe",
      tech: "Local AI Browser Tool",
      link: "https://github.com/somritdasgupta/aide",
      description: [
        "Built a browser extension that lets users run AI models on their own hardware instead of paying for cloud APIs.",
        "Added a feature that lets the AI search the web for current facts before it answers, which fixed the problem of the AI giving outdated information.",
        "Used TypeScript to build a sidebar that works on any website, so users don't have to keep switching tabs to use AI.",
      ],
    },
    {
      order: 2,
      isShown: true,
      name: "typeGuard",
      tech: "Fast Data Checker",
      link: "https://github.com/somritdasgupta/typeguard",
      description: [
        "Created a small tool for TypeScript developers to check if the data their app receives is actually correct.",
        "Designed it without using any extra libraries to keep it under 3KB, making it much faster and lighter than the standard tools most people use.",
        "Made sure the tool automatically understands the code's data types so that developers don't have to write the same code twice.",
      ],
    },
    {
      order: 3,
      isShown: true,
      name: "paperpaste",
      tech: "Encrypted Content Syncing Platform",
      link: "https://paperpaste.in",
      description: [
        "Built an app to send text and files between a phone and a computer without using a middleman like email or Slack.",
        "Used End-to-End Encryption so that the data is scrambled before it leaves the device, meaning no one—not even the server—can read it.",
        "Set up a quick pairing system so devices can find each other and sync instantly without needing a permanent account or password.",
      ],
    },
    {
      order: 4,
      isShown: true,
      name: "queFork",
      tech: "API Testing Platform",
      link: "https://quefork.dev",
      description: [
        "Made a web tool for testing how apps talk to servers, specifically for 'live' features like chat or stock updates (WebSockets).",
        "Built it so it runs entirely in the browser without needing an install, which helps developers start testing their code in seconds.",
        "Added a live log that shows data as it moves back and forth, making it easier to see exactly where a connection is breaking.",
      ],
    },
    {
      order: 5,
      isShown: true,
      name: "cogent-x",
      tech: "Private AI Search",
      link: "https://cogent-x.vercel.app",
      description: [
        "Built a system that lets a user upload their own documentation URL links which the backend scrapes and build the knowledge base on and ask questions about them.",
        "Programmed it to 'read' the documents first and only use those facts for its answers, which stops the AI from making things up.",
        "Kept the document searching local so that private information stays on the user's machine and isn't used to train public AI models.",
      ],
    },
    // Add more projects here like:
    // {
    //   order: 6,
    //   isShown: true,
    //   name: "Project Name",
    //   tech: "Technology/Type",
    //   description: [
    //     "Description point 1",
    //     "Description point 2",
    //   ],
    // },
  ],

  // ============================================
  // EDUCATION
  // ============================================
  education: {
    degree: "B.Tech in Computer Science & Engineering",
    cgpa: "9.1 CGPA",
    institution: "Maulana Abul Kalam Azad University of Technology",
    period: "2020 – 2024",
  },

  // ============================================
  // CERTIFICATIONS
  // To add: Add a new certification object to the certs array
  // To remove: Delete the certification object
  // To reorder: Change the order property (1, 2, 3, etc)
  // To show/hide: Set isShown to true or false
  // Link is optional - include it if the cert has an online credential
  // ============================================
  certifications: [
    {
      order: 1,
      isShown: true,
      category: "Recent & Core Certifications",
      certs: [
        {
          title:
            "Azure Fundamentals (AZ-900) – Issued by Microsoft in December 2025.",
          link: undefined, // Optional - add link if available
        },
        {
          title:
            "LangGraph: Deep Agents – Issued by LangChain in December 2025.",
          link: undefined,
        },
        {
          title:
            "OCI Generative AI Professional – Issued by Oracle in August 2025.",
          link: undefined,
        },
        {
          title:
            "Generative AI Fundamentals – Issued by Databricks in August 2025.",
          link: undefined,
        },
        {
          title: "GitHub Foundations – Issued by GitHub in February 2025.",
          link: undefined,
        },
      ],
    },
    {
      order: 2,
      isShown: true,
      category: "Specialized AI & Business Certifications",
      certs: [
        {
          title: "Oracle Fusion AI Agent Studio Foundations – July 2025.",
          link: undefined,
        },
        {
          title: "Oracle Fusion Cloud ERP Process Essentials – August 2025.",
          link: undefined,
        },
      ],
    },
    {
      order: 3,
      isShown: true,
      category: "Foundational Certifications",
      certs: [
        {
          title: "SQL (Advanced) – Issued by HackerRank in August 2023.",
          link: undefined,
        },
        {
          title:
            "JavaScript Algorithms and Data Structures – Issued by freeCodeCamp in August 2023.",
          link: undefined,
        },
        {
          title: "Endpoint Security – Issued by Cisco in August 2023.",
          link: undefined,
        },
      ],
    },
  ],
};

export const sections = [
  { id: "summary", label: "Summary", order: 1, isShown: true },
  { id: "skills", label: "Skills", order: 2, isShown: true },
  { id: "experience", label: "Experience", order: 3, isShown: true },
  { id: "projects", label: "Projects", order: 4, isShown: true },
  { id: "education", label: "Education", order: 5, isShown: true },
  { id: "certifications", label: "Certifications", order: 6, isShown: true },
];
