export default function TeamSection({ onJoin }) {
  return (
    <section className="team-section">
      <div className="team-container">
        <div className="team-header">
          <span className="team-badge">Meet the minds</span>

          <h2 className="team-title">Our Team</h2>

          <p className="team-subtitle">
            Built by students in Chittagong who understand the struggle of
            being new.
          </p>
        </div>

        <div className="team-grid">
          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-icon founder-icon">NJ</div>
            </div>

            <h3 className="team-name">Nusrat Jahan</h3>

            <div className="team-role">Founder</div>

            <p className="team-bio">
              The idea was mine. Started PeerConnect after helping dozens of
              newcomers navigate Chittagong. Believes in the power of peer
              mentorship.
            </p>

            <div className="team-tagline">✨ Visionary & Community-first</div>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-icon tech-icon">AS</div>
            </div>

            <h3 className="team-name">Asliraf Samaylan</h3>

            <div className="team-role">Tech Lead</div>

            <p className="team-bio">
              Brings deep technical knowledge. Built the emergency system and
              chat features. Works on making the platform faster, reliable, and
              secure for every student.
            </p>

            <div className="team-tagline">⚡ Code & Infrastructure</div>
          </div>

          <div className="team-card">
            <div className="team-avatar">
              <div className="avatar-icon product-icon">SA</div>
            </div>

            <h3 className="team-name">Samiha Akter</h3>

            <div className="team-role">Product Lead</div>

            <p className="team-bio">
              Designed this platform to solve real problems students face.
              Focuses on making PeerConnect simple, trustworthy, and delightful
              to use.
            </p>

            <div className="team-tagline">🎨 Design & User Experience</div>
          </div>
        </div>

        <div className="team-hiring">
          <div className="hiring-content">
            <span className="hiring-badge">🚀 We're growing</span>

            <h3 className="hiring-title">Help us build PeerConnect</h3>

            <p className="hiring-text">
              Support more students in Chittagong and beyond. Join our mission.
            </p>

            <button className="hiring-btn" onClick={onJoin}>
              Join us
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}