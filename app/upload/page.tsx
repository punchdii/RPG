"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ResumeUpload } from "@/components/resume-upload"
import type { UserSkills } from "@/types/skills"

function UploadPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const uploadType = searchParams.get('type')

  // Check if user already has a skill tree and redirect them
  useEffect(() => {
    const checkExistingSkillTree = async () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        
        try {
          const response = await fetch('/api/get-user-skilltree', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: user.email })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.hasSkillTree) {
              console.log('✅ User already has skill tree, redirecting...')
              router.push('/skill-tree')
              return
            }
          }
        } catch (error) {
          console.error('❌ Error checking existing skill tree:', error)
        }
      }
    }

    checkExistingSkillTree()
  }, [router])

  const handleResumeAnalyzed = async (skills: UserSkills) => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        
        // Save skills to database
        console.log('💾 Saving skills to database for user:', user.email)
        const saveResponse = await fetch('/api/save-skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            skills: skills
          })
        })

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json()
          console.log('✅ Skills saved successfully:', saveResult)
        } else {
          console.error('❌ Failed to save skills to database')
        }
      }
    } catch (error) {
      console.error('❌ Error saving skills:', error)
    }

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

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-8 flex items-center justify-center">
      <div className="text-white text-lg">Loading...</div>
    </div>}>
      <UploadPageContent />
    </Suspense>
  )
} 