import ContactForm from '@/components/contact-form'

export const metadata = {
  title: 'Contact – ResumeTree',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950/30">
      <main className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-slate-900/30 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/20">
          <h1 className="text-4xl font-bold text-center mb-10">
            <span className="text-white">Contact </span>
            <span className="text-orange-500">Us</span>
          </h1>
          <ContactForm />
        </div>
      </main>
    </div>
  )
} 