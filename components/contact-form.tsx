"use client"

import { useState, FormEvent, useRef } from "react"

export default function ContactForm() {
  const [status, setStatus] = useState<string | null>(null)
  const [showLink, setShowLink] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    setStatus("sending")
    const res = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      form.reset()
      setStatus("sent")
    } else {
      setStatus("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <input
          name="name"
          required
          placeholder="Your name"
          className="w-full rounded-md bg-white/90 border-0 p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
        <input
          name="subject"
          required
          placeholder="Subject"
          className="w-full rounded-md bg-white/90 border-0 p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Your message"
          className="w-full rounded-md bg-white/90 border-0 p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
      </div>

      {/* Hidden inputs */}
      {showLink && (
        <input
          name="link"
          type="url"
          placeholder="Paste a link"
          className="w-full rounded-md bg-white/90 border-0 p-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
      )}

      <input
        ref={fileInputRef}
        name="attachments"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Action row */}
      <div className="flex gap-4">
        <button
          type="button"
          aria-label="Upload Images"
          onClick={() => fileInputRef.current?.click()}
          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-md transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6"
          >
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={showLink ? "Remove Link" : "Add Link"}
          onClick={() => setShowLink((prev) => !prev)}
          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-md transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      </div>

      <button
        type="submit"
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Send"}
      </button>

      {status === "sent" && <p className="text-green-400">Message sent successfully!</p>}
      {status === "error" && <p className="text-red-400">Something went wrong. Please try again.</p>}
    </form>
  )
} 