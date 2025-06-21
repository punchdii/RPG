export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-transparent backdrop-blur-sm text-gray-400 text-center text-sm py-6 mt-8">
      © {year} ResumeTree. All rights reserved. Built with Next.js &amp; Tailwind CSS.
    </footer>
  )
} 