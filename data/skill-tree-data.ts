import type { Skill } from "@/types/skills"

export const skillTreeData = {
  programming: [
    {
      id: "javascript",
      name: "JavaScript",
      description:
        "Master the fundamentals of JavaScript, the language of the web. Learn variables, functions, objects, and modern ES6+ features.",
      level: 1,
      category: "Programming Language",
      prerequisites: [],
      learningResources: [
        { title: "JavaScript Fundamentals", type: "Course", duration: "20 hours" },
        { title: "You Don't Know JS", type: "Book", duration: "40 hours" },
        { title: "MDN JavaScript Guide", type: "Documentation" },
      ],
      relatedSkills: ["TypeScript", "Node.js", "React"],
    },
    {
      id: "typescript",
      name: "TypeScript",
      description:
        "Add static typing to JavaScript for better code quality, IDE support, and maintainability in large applications.",
      level: 2,
      category: "Programming Language",
      prerequisites: ["JavaScript"],
      learningResources: [
        { title: "TypeScript Handbook", type: "Documentation" },
        { title: "TypeScript Deep Dive", type: "Book", duration: "30 hours" },
      ],
      relatedSkills: ["JavaScript", "React", "Angular"],
    },
    {
      id: "python",
      name: "Python",
      description:
        "Learn Python, a versatile programming language perfect for web development, data science, automation, and more.",
      level: 1,
      category: "Programming Language",
      prerequisites: [],
      learningResources: [
        { title: "Python Crash Course", type: "Book", duration: "50 hours" },
        { title: "Automate the Boring Stuff", type: "Book", duration: "30 hours" },
      ],
      relatedSkills: ["Django", "Flask", "Data Science"],
    },
    {
      id: "nodejs",
      name: "Node.js",
      description:
        "Build server-side applications with JavaScript. Learn about the event loop, modules, and building scalable network applications.",
      level: 2,
      category: "Runtime",
      prerequisites: ["JavaScript"],
      learningResources: [
        { title: "Node.js Complete Guide", type: "Course", duration: "25 hours" },
        { title: "Node.js Documentation", type: "Documentation" },
      ],
      relatedSkills: ["Express.js", "MongoDB", "REST APIs"],
    },
    {
      id: "git",
      name: "Git",
      description:
        "Master version control with Git. Learn branching, merging, rebasing, and collaborative development workflows.",
      level: 1,
      category: "Tool",
      prerequisites: [],
      learningResources: [
        { title: "Pro Git Book", type: "Book", duration: "20 hours" },
        { title: "Git Interactive Tutorial", type: "Tutorial", duration: "5 hours" },
      ],
      relatedSkills: ["GitHub", "GitLab", "DevOps"],
    },
  ] as Skill[],

  webDevelopment: [
    {
      id: "react",
      name: "React",
      description:
        "Build dynamic user interfaces with React. Learn components, hooks, state management, and modern React patterns.",
      level: 2,
      category: "Frontend Framework",
      prerequisites: ["JavaScript"],
      learningResources: [
        { title: "React Official Tutorial", type: "Tutorial", duration: "10 hours" },
        { title: "React - The Complete Guide", type: "Course", duration: "40 hours" },
      ],
      relatedSkills: ["Redux", "Next.js", "React Native"],
    },
    {
      id: "nextjs",
      name: "Next.js",
      description:
        "Build production-ready React applications with Next.js. Learn SSR, SSG, API routes, and deployment strategies.",
      level: 3,
      category: "Full-stack Framework",
      prerequisites: ["React"],
      learningResources: [
        { title: "Next.js Documentation", type: "Documentation" },
        { title: "Next.js Masterclass", type: "Course", duration: "30 hours" },
      ],
      relatedSkills: ["React", "Vercel", "API Development"],
    },
    {
      id: "html-css",
      name: "HTML & CSS",
      description:
        "Master the building blocks of the web. Learn semantic HTML, modern CSS features, flexbox, grid, and responsive design.",
      level: 1,
      category: "Web Fundamentals",
      prerequisites: [],
      learningResources: [
        { title: "HTML & CSS Complete Course", type: "Course", duration: "25 hours" },
        { title: "CSS Grid & Flexbox", type: "Tutorial", duration: "8 hours" },
      ],
      relatedSkills: ["Sass", "Tailwind CSS", "Bootstrap"],
    },
    {
      id: "tailwind",
      name: "Tailwind CSS",
      description:
        "Rapidly build modern websites with Tailwind CSS, a utility-first CSS framework for creating custom designs.",
      level: 2,
      category: "CSS Framework",
      prerequisites: ["HTML & CSS"],
      learningResources: [
        { title: "Tailwind CSS Documentation", type: "Documentation" },
        { title: "Tailwind CSS From Scratch", type: "Course", duration: "15 hours" },
      ],
      relatedSkills: ["CSS", "React", "Vue.js"],
    },
    {
      id: "rest-apis",
      name: "REST APIs",
      description:
        "Design and build RESTful APIs. Learn HTTP methods, status codes, authentication, and API best practices.",
      level: 2,
      category: "Backend",
      prerequisites: ["JavaScript"],
      learningResources: [
        { title: "REST API Design Guide", type: "Documentation" },
        { title: "Building REST APIs", type: "Course", duration: "20 hours" },
      ],
      relatedSkills: ["Node.js", "Express.js", "GraphQL"],
    },
  ] as Skill[],

  devops: [
    {
      id: "docker",
      name: "Docker",
      description:
        "Containerize applications with Docker. Learn images, containers, volumes, and multi-container applications with Docker Compose.",
      level: 2,
      category: "Containerization",
      prerequisites: ["Git"],
      learningResources: [
        { title: "Docker Mastery", type: "Course", duration: "30 hours" },
        { title: "Docker Official Documentation", type: "Documentation" },
      ],
      relatedSkills: ["Kubernetes", "CI/CD", "AWS"],
    },
    {
      id: "aws",
      name: "AWS",
      description:
        "Deploy and manage applications on Amazon Web Services. Learn EC2, S3, Lambda, RDS, and cloud architecture patterns.",
      level: 3,
      category: "Cloud Platform",
      prerequisites: ["Docker"],
      learningResources: [
        { title: "AWS Solutions Architect", type: "Course", duration: "60 hours" },
        { title: "AWS Documentation", type: "Documentation" },
      ],
      relatedSkills: ["Docker", "Kubernetes", "Terraform"],
    },
    {
      id: "cicd",
      name: "CI/CD",
      description:
        "Implement continuous integration and deployment pipelines. Learn GitHub Actions, Jenkins, and automated testing strategies.",
      level: 2,
      category: "Automation",
      prerequisites: ["Git"],
      learningResources: [
        { title: "CI/CD Pipeline Tutorial", type: "Tutorial", duration: "12 hours" },
        { title: "GitHub Actions Guide", type: "Documentation" },
      ],
      relatedSkills: ["Git", "Docker", "Testing"],
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      description:
        "Master PostgreSQL, a powerful open-source relational database. Learn SQL, indexing, performance optimization, and advanced features.",
      level: 2,
      category: "Database",
      prerequisites: [],
      learningResources: [
        { title: "PostgreSQL Tutorial", type: "Tutorial", duration: "20 hours" },
        { title: "PostgreSQL Documentation", type: "Documentation" },
      ],
      relatedSkills: ["SQL", "Database Design", "Node.js"],
    },
    {
      id: "mongodb",
      name: "MongoDB",
      description:
        "Work with MongoDB, a popular NoSQL database. Learn document modeling, aggregation, indexing, and scaling strategies.",
      level: 2,
      category: "Database",
      prerequisites: [],
      learningResources: [
        { title: "MongoDB University", type: "Course", duration: "25 hours" },
        { title: "MongoDB Manual", type: "Documentation" },
      ],
      relatedSkills: ["Node.js", "Express.js", "Mongoose"],
    },
  ] as Skill[],

  design: [
    {
      id: "figma",
      name: "Figma",
      description:
        "Design user interfaces and prototypes with Figma. Learn design systems, components, and collaborative design workflows.",
      level: 1,
      category: "Design Tool",
      prerequisites: [],
      learningResources: [
        { title: "Figma Masterclass", type: "Course", duration: "20 hours" },
        { title: "Figma Academy", type: "Tutorial", duration: "10 hours" },
      ],
      relatedSkills: ["UI Design", "UX Design", "Prototyping"],
    },
    {
      id: "ui-design",
      name: "UI Design",
      description:
        "Create beautiful and functional user interfaces. Learn color theory, typography, layout principles, and design systems.",
      level: 2,
      category: "Design",
      prerequisites: ["Figma"],
      learningResources: [
        { title: "UI Design Fundamentals", type: "Course", duration: "30 hours" },
        { title: "Design Systems Guide", type: "Book", duration: "25 hours" },
      ],
      relatedSkills: ["UX Design", "Figma", "CSS"],
    },
    {
      id: "ux-design",
      name: "UX Design",
      description:
        "Design user experiences that delight. Learn user research, information architecture, wireframing, and usability testing.",
      level: 2,
      category: "Design",
      prerequisites: ["UI Design"],
      learningResources: [
        { title: "UX Design Course", type: "Course", duration: "40 hours" },
        { title: "Don't Make Me Think", type: "Book", duration: "15 hours" },
      ],
      relatedSkills: ["UI Design", "User Research", "Prototyping"],
    },
  ] as Skill[],

  management: [
    {
      id: "project-management",
      name: "Project Management",
      description:
        "Lead projects to successful completion. Learn planning, scheduling, risk management, and team coordination strategies.",
      level: 2,
      category: "Management",
      prerequisites: [],
      learningResources: [
        { title: "Project Management Professional", type: "Course", duration: "50 hours" },
        { title: "Agile Project Management", type: "Course", duration: "25 hours" },
      ],
      relatedSkills: ["Team Leadership", "Agile", "Communication"],
    },
    {
      id: "team-leadership",
      name: "Team Leadership",
      description:
        "Lead and inspire development teams. Learn delegation, mentoring, performance management, and building high-performing teams.",
      level: 3,
      category: "Leadership",
      prerequisites: ["Project Management"],
      learningResources: [
        { title: "Technical Leadership", type: "Book", duration: "20 hours" },
        { title: "Leading Teams", type: "Course", duration: "30 hours" },
      ],
      relatedSkills: ["Project Management", "Communication", "Mentoring"],
    },
    {
      id: "agile-scrum",
      name: "Agile & Scrum",
      description:
        "Master agile methodologies and Scrum framework. Learn sprint planning, daily standups, retrospectives, and continuous improvement.",
      level: 2,
      category: "Methodology",
      prerequisites: [],
      learningResources: [
        { title: "Scrum Master Certification", type: "Course", duration: "20 hours" },
        { title: "Agile Manifesto", type: "Documentation" },
      ],
      relatedSkills: ["Project Management", "Team Leadership"],
    },
  ] as Skill[],
}
