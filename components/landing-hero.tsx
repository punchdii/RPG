"use client"

import { Button } from "@/components/ui/button"

export function LandingHero() {
  const handleUploadClick = () => {
    console.log('Upload button clicked!')
    window.location.href = '/upload'
  }

  const handleTextUploadClick = () => {
    console.log('Text upload button clicked!')
    window.location.href = '/upload?type=text'
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 -z-10"></div>
      
      {/* Background decorative elements - keeping for additional visual interest */}
      <div className="absolute inset-0 overflow-hidden -z-20">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-32 w-48 h-48 bg-orange-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left side - Content */}
          <div className="space-y-10 ml-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/Logo.png" 
                alt="ResumeTree Logo" 
                className="w-12 h-12"
              />
              <span className="text-3xl font-bold">
                <span className="text-white">Resume</span>
                <span className="text-orange-500">Tree</span>
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
            <h1 
            className="max-w-3xl text-5xl lg:text-6xl font-bold text-white"
            style={{ lineHeight: "1.3" }}
              >
                Create your Professional Skill Tree with a One-Click Resume or Plain Text Upload
              </h1>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-50">
              {/* Gradient outline wrapper */}
              <div className="relative w-full sm:w-auto group">
                {/* Gradient border: black (top) -> white (bottom) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-black via-gray-700 to-white p-[2px]" />
                {/* Actual button */}
                <button
                  onClick={handleUploadClick}
                  type="button"
                  className="relative z-10 w-full sm:w-auto rounded-full bg-orange-600 hover:bg-orange-500 text-white px-5 py-6 text-2xl font-light tracking-wide shadow-md"
                >
                  Upload Resume
                </button>
              </div>
              <button 
                onClick={handleTextUploadClick}
                className="relative z-10 w-full sm:w-auto rounded-full bg-gray-600 hover:bg-gray-500 text-white px-5 py-6 text-2xl font-light tracking-wide shadow-md"
                type="button"
              >
                Plain Text Upload
              </button>
            </div>
          </div>

            {/* Right side - Skill tree visualization */}
          <div className="relative mx-auto w-96 h-96 lg:w-[500px] lg:h-[500px]">
              <img 
                src="/SkillTree.png?v=2" 
                alt="Professional Skill Tree Visualization" 
                className="w-full h-full object-contain"
              />
          </div>
        </div>
      </div>
    </div>
  )
} 