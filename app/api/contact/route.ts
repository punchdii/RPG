import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const link = formData.get('link') as string | null
    const attachments: nodemailer.Attachment[] = []

    const files = formData.getAll('attachments') as File[]
    for (const file of files) {
      if (file.size === 0) continue
      const buffer = Buffer.from(await file.arrayBuffer())
      attachments.push({
        filename: file.name,
        content: buffer,
        contentType: file.type,
      })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const emailBody = `${message}\n\nFrom: ${name}${link ? `\nLink: ${link}` : ''}`

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'soheil.chavo@gmail.com',
      subject,
      text: emailBody,
      attachments,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 