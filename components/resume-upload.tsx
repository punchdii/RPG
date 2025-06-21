"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Sparkles, File, X } from "lucide-react"
import type { UserSkills } from "@/types/skills"
import { analyzeResume } from "@/lib/resume-analyzer"

interface ResumeUploadProps {
  onResumeAnalyzed: (skills: UserSkills) => void
  defaultMode?: 'upload' | 'text'
}

export function ResumeUpload({ onResumeAnalyzed, defaultMode = 'upload' }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessingPdf, setIsProcessingPdf] = useState(false)
  const [currentMode, setCurrentMode] = useState<'upload' | 'text'>(defaultMode)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setUploadedFile(null)
    setIsProcessingPdf(false)
  }

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file")
      return
    }

    setUploadedFile(file)
    setIsProcessingPdf(true)
    
    try {
      const formData = new FormData()
      formData.append("pdf", file)

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        setResumeText(text)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to extract text from PDF")
      }
    } catch (error) {
      console.error("Error extracting PDF text:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to extract text from PDF. Please try again or paste the text manually."
      alert(errorMessage)
      setUploadedFile(null)
    } finally {
      setIsProcessingPdf(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setResumeText("")
    setIsProcessingPdf(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <FileText className="w-6 h-6" />
            {currentMode === 'upload' ? 'Upload Your Resume' : 'Enter Resume Text'}
          </CardTitle>
          <p className="text-slate-400">
            {currentMode === 'upload' 
              ? 'Upload a PDF file or switch to text input below'
              : 'Paste your resume text below to analyze your skills'
            }
          </p>
          
          {/* Mode switcher */}
          <div className="flex justify-center mt-4">
            <div className="bg-slate-700/50 rounded-lg p-1 flex">
              <button
                onClick={() => setCurrentMode('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'upload'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF Upload
              </button>
              <button
                onClick={() => setCurrentMode('text')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === 'text'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Text Input
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentMode === 'upload' && (
            /* PDF Upload Section */
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-orange-400 bg-orange-900/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <File className="w-10 h-10 text-green-400" />
                    <div className="text-left">
                      <p className="text-white font-medium text-lg">{uploadedFile.name}</p>
                      <p className="text-slate-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {isProcessingPdf && (
                        <p className="text-orange-400 text-sm flex items-center gap-2 mt-1">
                          <Sparkles className="w-4 h-4 animate-spin" />
                          Extracting text from PDF...
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={removeFile}
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white ml-4"
                      disabled={isProcessingPdf}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-slate-400" />
                    <div>
                      <p className="text-white text-lg mb-2">
                        Drag and drop your PDF here, or{" "}
                        <button
                          onClick={handleUploadClick}
                          className="text-orange-400 hover:text-orange-300 underline font-medium"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-slate-400">Supports PDF files up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Text Input Section */}
          {(currentMode === 'text' || resumeText) && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-white block">
                {currentMode === 'upload' ? 'Extracted text:' : 'Resume text:'}
              </label>
              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[400px] bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 text-sm"
                readOnly={isProcessingPdf}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={handleDemoResume}
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600 px-6 py-3"
            >
              Use Demo Resume
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || isAnalyzing || isProcessingPdf}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Resume...
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
