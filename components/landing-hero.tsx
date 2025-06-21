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
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-32 w-48 h-48 bg-orange-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-md"></div>
              </div>
              <span className="text-3xl font-bold">
                <span className="text-white">Resume</span>
                <span className="text-orange-500">Tree</span>
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                create your professional skill
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                tree with a one-click resume
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                or plain text upload
              </h1>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-50">
              <button 
                onClick={handleUploadClick}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-medium rounded-xl w-full sm:w-auto cursor-pointer border-none outline-none"
                type="button"
              >
                Upload Resume
              </button>
              <button 
                onClick={handleTextUploadClick}
                className="border-2 border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg font-medium rounded-xl w-full sm:w-auto cursor-pointer outline-none"
                type="button"
              >
                Plain Text Upload
              </button>
            </div>
          </div>

          {/* Right side - Skill tree visualization */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl backdrop-blur-sm"></div>
            <div className="relative p-8">
              {/* Skill tree mockup */}
              <div className="space-y-6">
                {/* Top level skills */}
                <div className="flex justify-center gap-8">
                  <div className="w-24 h-24 bg-slate-700 rounded-xl border border-slate-600 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                  </div>
                  <div className="w-24 h-24 bg-slate-700 rounded-xl border border-slate-600 flex items-center justify-center">
                    <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                  </div>
                </div>

                {/* Connection lines */}
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-slate-600"></div>
                </div>

                {/* Middle level skills */}
                <div className="flex justify-center gap-12">
                  <div className="w-20 h-20 bg-slate-700 rounded-xl border border-slate-600 flex items-center justify-center">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg"></div>
                  </div>
                  <div className="w-20 h-20 bg-slate-700 rounded-xl border border-slate-600 flex items-center justify-center">
                    <div className="w-6 h-6 bg-orange-500 rounded-lg"></div>
                  </div>
                </div>

                {/* More connection lines */}
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-slate-600"></div>
                </div>

                {/* Bottom level skill */}
                <div className="flex justify-center">
                  <div className="w-28 h-28 bg-slate-700 rounded-xl border border-slate-600 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 