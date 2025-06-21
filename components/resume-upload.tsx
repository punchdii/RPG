"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Sparkles } from "lucide-react"
import type { UserSkills } from "@/types/skills"
import { analyzeResume } from "@/lib/resume-analyzer"

interface ResumeUploadProps {
  onResumeAnalyzed: (skills: UserSkills) => void
}

export function ResumeUpload({ onResumeAnalyzed }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return

    setIsAnalyzing(true)
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const analyzedSkills = analyzeResume(resumeText)
    onResumeAnalyzed(analyzedSkills)
    setIsAnalyzing(false)
  }

  const handleDemoResume = () => {
    const demoResume = `John Doe
Software Engineer

EXPERIENCE:
- Senior Frontend Developer at TechCorp (2021-2024)
  • Built responsive web applications using React and TypeScript
  • Implemented CI/CD pipelines with GitHub Actions
  • Led a team of 4 developers on multiple projects
  • Optimized application performance resulting in 40% faster load times

- Full Stack Developer at StartupXYZ (2019-2021)
  • Developed REST APIs using Node.js and Express
  • Worked with PostgreSQL and MongoDB databases
  • Implemented user authentication and authorization
  • Collaborated with designers using Figma

SKILLS:
JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, MongoDB, Git, Docker, AWS, Figma, Project Management

EDUCATION:
Bachelor of Science in Computer Science - State University (2019)`

    setResumeText(demoResume)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <FileText className="w-6 h-6" />
            Upload Your Resume
          </CardTitle>
          <p className="text-slate-300">
            Paste your resume text below and we'll analyze your skills to generate your personalized skill tree
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[300px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleDemoResume}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Use Demo Resume
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Generate Skill Tree
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
