import { useEffect, useState } from "react"
import JobCard from "./components/JobCard"

const API_URL = "https://ai-job-tracker-jf0a.onrender.com"

export default function App() {
  const [jobs, setJobs] = useState([])
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({ title: "", match: "all" })

  const [applications, setApplications] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [pendingJob, setPendingJob] = useState(null)

  const [query, setQuery] = useState("")
  const [aiResults, setAiResults] = useState([])

  /* ---------------- FETCH JOBS ---------------- */

  const fetchJobs = async () => {
    const res = await fetch(`${API_URL}/jobs`)
    const data = await res.json()
    setJobs(data)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  /* -------- DETECT RETURN FROM APPLY -------- */

  useEffect(() => {
    const handleFocus = () => {
      const stored = localStorage.getItem("lastAppliedJob")
      if (stored) {
        setPendingJob(JSON.parse(stored))
        setShowPopup(true)
        localStorage.removeItem("lastAppliedJob")
      }
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  /* ---------------- UPLOAD RESUME ---------------- */

  const uploadResume = async () => {
    if (!resume) return alert("Please select a resume")

    const formData = new FormData()
    formData.append("resume", resume)
    setLoading(true)

    await fetch(`${API_URL}/resume/upload`, {
      method: "POST",
      body: formData
    })

    alert("Resume uploaded successfully")
    fetchJobs()
    setLoading(false)
  }

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredJobs = jobs.filter(job => {
    if (
      filters.title &&
      !job.title.toLowerCase().includes(filters.title.toLowerCase())
    ) return false

    if (filters.match === "high" && job.matchScore < 70) return false
    if (
      filters.match === "medium" &&
      (job.matchScore < 40 || job.matchScore >= 70)
    ) return false

    return true
  })

  /* ---------------- APPLICATION LOGIC ---------------- */

  const handleApplication = (status) => {
    setApplications(prev => [
      ...prev,
      { ...pendingJob, status, date: new Date().toISOString() }
    ])
    setShowPopup(false)
    setPendingJob(null)
  }

  const updateStatus = (index, status) => {
    setApplications(prev =>
      prev.map((app, i) =>
        i === index ? { ...app, status } : app
      )
    )
  }

  /* ---------------- AI SIDEBAR ---------------- */

  const askAI = () => {
    const q = query.toLowerCase()

    if (q.includes("remote")) {
      setAiResults(jobs.filter(j => j.workMode === "Remote"))
    } else if (q.includes("highest")) {
      setAiResults([...jobs].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5))
    } else {
      setAiResults([])
    }
  }

  return (
    <div className="app-bg">
      <div className="container py-4">

        <h2 className="text-center fw-bold mb-4">
          AI Job Tracker
        </h2>

        {/* Resume Upload */}
        <div className="card mb-4">
          <div className="card-body d-flex gap-2">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={e => setResume(e.target.files[0])}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={uploadResume}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body d-flex gap-2">
            <input
              className="form-control"
              placeholder="Search job title"
              onChange={e =>
                setFilters({ ...filters, title: e.target.value })
              }
            />
            <select
              className="form-select"
              onChange={e =>
                setFilters({ ...filters, match: e.target.value })
              }
            >
              <option value="all">All Matches</option>
              <option value="high">High (&gt;70%)</option>
              <option value="medium">Medium (40–70%)</option>
            </select>
          </div>
        </div>

        {/* Jobs */}
        <h4 className="mb-3">Jobs</h4>
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}

        {/* Applications */}
        <hr className="my-5" />
        <h4>My Applications</h4>

        {applications.length === 0 && (
          <p className="text-muted">No applications yet</p>
        )}

        {applications.map((app, index) => (
          <div key={index} className="card mb-2">
            <div className="card-body">
              <strong>{app.title}</strong>
              <div className="text-muted">{app.company}</div>

              <p className="mt-2">
                Status:{" "}
                <span className={`status ${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </p>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => updateStatus(index, "Interview")}
                >
                  Interview
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => updateStatus(index, "Offer")}
                >
                  Offer
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => updateStatus(index, "Rejected")}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* AI Sidebar */}
        <hr className="my-5" />
        <h4>AI Assistant</h4>

        <div className="ai-box mb-3">
          <input
            className="form-control mb-2"
            placeholder="Ask something like: remote React jobs"
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={askAI}>
            Ask
          </button>
        </div>

        {aiResults.map(job => (
          <JobCard key={`ai-${job.id}`} job={job} />
        ))}

        {/* Popup */}
        {showPopup && pendingJob && (
  <div className="apply-overlay">
    <div className="apply-modal">

      <div className="apply-header">
        <h5>Application Check</h5>
      </div>

      <div className="apply-body">
        <p className="apply-question">
          Did you apply to
        </p>

        <p className="apply-job">
          {pendingJob.title}
        </p>

        <p className="apply-company">
          at {pendingJob.company}?
        </p>
      </div>

      <div className="apply-actions">
        <button
          className="btn btn-success"
          onClick={() => handleApplication("Applied")}
        >
          ✅ Yes, Applied
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => setShowPopup(false)}
        >
          ❌ No, Just Browsing
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={() => handleApplication("Applied Earlier")}
        >
          ⏳ Applied Earlier
        </button>
      </div>

    </div>
  </div>
)}


      </div>
    </div>
  )
}
