import type { Skill } from "@/types/skills"

export const skillTreeData = {
  software: [
    {
      id: "typescript",
      name: "TypeScript",
      description: "Write clean and professional TypeScript code",
      prerequisites: [],
      category: "Software",
    },
    {
      id: "reactjs",
      name: "React.js",
      description: "Ability to use React.js to create basic web applications",
      prerequisites: ["typescript"],
      category: "Software",
    },
    {
      id: "webdev",
      name: "WebDev",
      description: "Basic Web Development and design skills",
      prerequisites: ["reactjs"],
      category: "Software",
    },
    {
      id: "3d-animation",
      name: "3d Animation",
      description: "Create 3d animations with the Unity editor",
      prerequisites: [],
      category: "Software",
    },
    {
      id: "unity-engine",
      name: "Unity Engine",
      description: "Ability to create games using the Unity Engine",
      prerequisites: ["3d-animation"],
      category: "Software",
    },
    {
      id: "gamedev",
      name: "GameDev",
      description: "Basic Game Development and design skills",
      prerequisites: ["unity-engine", "csharp"],
      category: "Software",
    },
    {
      id: "csharp-oop",
      name: "C# OOP",
      description: "Follow OOP paradigm with C# scripts",
      prerequisites: [],
      category: "Software",
    },
    {
      id: "csharp",
      name: "C#",
      description: "Coding ability in C# creating .NET applications",
      prerequisites: ["csharp-oop"],
      category: "Software",
    }
  ] as Skill[],

  hardware: [
    {
      id: "follow-schematic",
      name: "Follow Schematic",
      description: "Ability to design a PCB from a schematic",
      prerequisites: [],
      category: "Hardware",
    },
    {
      id: "kicad",
      name: "KiCad",
      description: "Ability to design PCBs with KiCad",
      prerequisites: ["follow-schematic"],
      category: "Hardware",
    },
    {
      id: "pcb-design",
      name: "PCB Design",
      description: "Ability to design PCBs in various softwares",
      prerequisites: ["kicad"],
      category: "Hardware",
    }
  ] as Skill[],

  categories: [
    {
      id: "software",
      name: "Software",
      description: "Software development skills",
      prerequisites: ["webdev", "gamedev"],
      category: "Category",
    },
    {
      id: "hardware",
      name: "Hardware",
      description: "Hardware development skills",
      prerequisites: ["pcb-design"],
      category: "Category",
    }
  ] as Skill[]
};
