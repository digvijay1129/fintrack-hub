export default function PlannedPage({ title, description, phase }) {
  return <section className="page-card placeholder-page">
    <span className="eyebrow">ROADMAP · {phase}</span><div className="placeholder-icon" aria-hidden="true">↗</div>
    <h2>{title}</h2><p>{description}</p>
    <div className="roadmap-note"><span className="roadmap-dot" /> This area is planned and is not represented as a working feature yet.</div>
  </section>;
}
