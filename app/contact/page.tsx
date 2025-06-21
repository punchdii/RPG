import ContactForm from '@/components/contact-form'

export const metadata = {
  title: 'Contact – ResumeTree',
}

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-white mb-10 text-center">Contact Us</h1>
      <ContactForm />
    </main>
  )
} 