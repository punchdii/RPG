import { NextRequest, NextResponse } from "next/server"
import pdf from "pdf-parse"

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log("PDF extraction request received")
    
    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      console.log("No file provided")
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      )
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size)
      return NextResponse.json(
        { error: "File size too large. Please upload a PDF smaller than 10MB." },
        { status: 400 }
      )
    }

    if (file.type !== "application/pdf") {
      console.log("Invalid file type:", file.type)
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    console.log("Converting file to buffer...")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log("Buffer created, size:", buffer.length)

    // Extract text from PDF
    console.log("Starting PDF text extraction...")
    const data = await pdf(buffer)
    console.log("PDF extraction completed")
    console.log("Extracted text length:", data.text?.length || 0)
    console.log("First 200 characters:", data.text?.substring(0, 200))

    const text = data.text

    if (!text || text.trim().length === 0) {
      console.log("No text extracted from PDF")
      return NextResponse.json(
        { error: "No text could be extracted from the PDF. The PDF might be image-based or password protected." },
        { status: 400 }
      )
    }

    console.log("Successfully extracted text, returning response")
    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error("Error extracting PDF text:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Provide more specific error messages
    let errorMessage = "Failed to extract text from PDF"
    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF")) {
        errorMessage = "The uploaded file is not a valid PDF or is corrupted"
      } else if (error.message.includes("password")) {
        errorMessage = "The PDF is password protected. Please remove the password and try again"
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 