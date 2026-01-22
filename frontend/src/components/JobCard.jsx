export default function JobCard({ job }) {

  const getBadgeClass = () => {
    if (job.matchScore >= 70) return "badge badge-success"
    if (job.matchScore >= 40) return "badge badge-warning"
    return "badge badge-secondary"
  }

  const handleApply = () => {
    localStorage.setItem("lastAppliedJob", JSON.stringify(job))
    window.open(job.applyLink, "_blank")
  }

  return (
    <div className="card mb-3">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">
  <div>
    <h5 className="job-title mb-1">{job.title}</h5>

    {job.matchScore >= 70 && (
      <span className="badge bg-info me-2">
        AI Recommended
      </span>
    )}
  </div>

  <span className={getBadgeClass()}>
    {job.matchScore}% Match
  </span>
</div>


        <p className="job-meta">
          {job.company} • {job.location}
        </p>

        <p>{job.description}</p>

        {job.matchedSkills?.length > 0 && (
          <p className="small text-muted">
            <strong>Matched skills:</strong>{" "}
            {job.matchedSkills.join(", ")}
          </p>
        )}

        <div className="mt-3">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  )
}
