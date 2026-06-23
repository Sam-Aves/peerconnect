export default function ImpactSection({ onJoin }) {
  return (
    <section className="impact-section">
      <div className="impact-container">
        <div className="impact-header">
          <span className="impact-badge">Real Impact, Real Change</span>

          <h2 className="impact-title">
            PeerConnect is building something{" "}
            <span className="impact-highlight">real</span> in Chittagong
          </h2>

          <p className="impact-subtitle">
            These numbers show what happens when students help students. Real
            people finding housing, routes, and belonging.
          </p>
        </div>

        <div className="impact-stats-grid">
          <div className="stat-card">
            <div className="stat-number">64</div>

            <div className="stat-label">Districts connected</div>

            <div className="stat-description">
              Students from every corner of Bangladesh finding their way
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              800<span className="stat-plus">+</span>
            </div>

            <div className="stat-label">Active senior buddies</div>

            <div className="stat-description">
              Experienced guides sharing knowledge and building trust
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              2,400<span className="stat-plus">+</span>
            </div>

            <div className="stat-label">Students helped</div>

            <div className="stat-description">Growing stronger every day</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              45<span className="stat-plus">+</span>
            </div>

            <div className="stat-label">Community events held</div>

            <div className="stat-description">
              Connections made beyond screens and into real life
            </div>
          </div>
        </div>

        <div className="impact-footer">
          <button className="impact-join-btn" onClick={onJoin}>
            Join the movement
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}