import Fastify from "fastify"
import cors from "@fastify/cors"
import multipart from "@fastify/multipart"
import pdf from "pdf-parse/lib/pdf-parse.js"
import { jobs } from "./jobs.js"

/* ---------------- SERVER ---------------- */

const fastify = Fastify({ logger: true })

await fastify.register(cors, { origin: true })
await fastify.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

/* ---------------- STATE (IN-MEMORY) ---------------- */

let resumeText = ""

/* ---------------- HELPERS ---------------- */

// Convert text into normalized tokens
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // remove punctuation
    .split(/\s+/)
    .filter(Boolean)
}

// Match job skills with resume tokens
function calculateMatch(job) {
  if (!resumeText) {
    return { matchScore: 0, matchedSkills: [] }
  }

  const resumeTokens = tokenize(resumeText)
  const matchedSkills = []

  for (const skill of job.skills) {
    const skillTokens = tokenize(skill)

    // Skill matches if all its words exist in resume
    const isMatch = skillTokens.every(token =>
      resumeTokens.includes(token)
    )

    if (isMatch) {
      matchedSkills.push(skill)
    }
  }

  const matchScore = job.skills.length
    ? Math.round((matchedSkills.length / job.skills.length) * 100)
    : 0

  return { matchScore, matchedSkills }
}

/* ---------------- ROUTES ---------------- */

// Health check
fastify.get("/", async () => {
  return { status: "Server running 🚀" }
})

// Resume upload (PDF / TXT)
fastify.post("/resume/upload", async (req, reply) => {
  try {
    let filePart = null

    for await (const part of req.parts()) {
      if (part.type === "file") {
        filePart = part
        break
      }
    }

    if (!filePart) {
      return reply.code(400).send({ error: "No file uploaded" })
    }

    // Read file into buffer
    const chunks = []
    for await (const chunk of filePart.file) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Handle PDF
    if (filePart.mimetype === "application/pdf") {
      let parsedText = ""

      try {
        const parsed = await pdf(buffer)
        parsedText = parsed.text || ""
      } catch {
        parsedText = ""
      }

      if (!parsedText || parsedText.trim().length < 30) {
        return reply.code(400).send({
          error: "Unreadable PDF. Upload a text-based PDF or TXT file."
        })
      }

      resumeText = parsedText
    }

    // Handle TXT
    else if (filePart.mimetype === "text/plain") {
      resumeText = buffer.toString("utf-8")
    }

    else {
      return reply.code(400).send({ error: "Unsupported file type" })
    }

    return reply.send({
      message: "Resume uploaded successfully"
    })

  } catch (err) {
    console.error("UPLOAD ERROR:", err)
    return reply.code(500).send({ error: "Server error" })
  }
})

// Jobs with matching
fastify.get("/jobs", async () => {
  return jobs.map(job => ({
    ...job,
    ...calculateMatch(job)
  }))
})

/* ---------------- START SERVER ---------------- */

await fastify.listen({ port: 3000, host: "127.0.0.1" })
console.log("🚀 Server running on http://localhost:3000")
