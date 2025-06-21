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
          className="w-full rounded-md bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
        <input
          name="subject"
          required
          placeholder="Subject"
          className="w-full rounded-md bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Your message"
          className="w-full rounded-md bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
        />
      </div>

      {/* Hidden inputs */}
      {showLink && (
        <input
          name="link"
          type="url"
          placeholder="Paste a link"
          className="w-full rounded-md bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600"
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
          className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-md"
        >
          <img src="/ImageUpload.png" alt="Upload images" className="w-6 h-6" />
        </button>
        <button
          type="button"
          aria-label={showLink ? "Remove Link" : "Add Link"}
          onClick={() => setShowLink((prev) => !prev)}
          className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-md"
        >
          <img src="/Link.png" alt="Link" className="w-6 h-6" />
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