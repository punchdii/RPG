"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ResumeUpload } from "@/components/resume-upload"
import type { UserSkills } from "@/types/skills"

export default function UploadPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const uploadType = searchParams.get('type')

  const handleResumeAnalyzed = (skills: UserSkills) => {
    // Store the skills in sessionStorage and redirect to skill tree
    sessionStorage.setItem('userSkills', JSON.stringify(skills))
    router.push('/skill-tree')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {uploadType === 'text' ? 'Upload Resume Text' : 'Upload Your Resume'}
            </h1>
            <p className="text-slate-300 text-lg">
              {uploadType === 'text' 
                ? 'Paste your resume text below to generate your skill tree'
                : 'Upload a PDF or paste your resume text to generate your skill tree'
              }
            </p>
          </div>
          
          <ResumeUpload 
            onResumeAnalyzed={handleResumeAnalyzed}
            defaultMode={uploadType === 'text' ? 'text' : 'upload'}
          />
        </div>
      </div>
    </div>
  )
} 