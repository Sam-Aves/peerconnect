export default function ContactSection() {
  return (
    <section id="contact-section" className="contact-section">
      <div className="contact-wrapper">
        <span className="contact-badge">Contact</span>

        <h2 className="contact-title">Get in touch with PeerConnect</h2>

        <p className="contact-description">
          Have questions, suggestions, or want to collaborate? Reach out to us.
          We are building PeerConnect to make student life safer and easier.
        </p>

        <div className="contact-card-main">
          <div className="contact-icon">📩</div>

          <h3>Email us</h3>

          <a href="mailto:peerconnect@gmail.com" className="contact-email">
            peerconnect@gmail.com
          </a>

          <p>
            We usually respond within 24 hours. Your feedback helps us improve
            the platform for students.
          </p>
        </div>
      </div>
    </section>
  );
}