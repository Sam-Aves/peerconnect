export default function Footer({ logo }) {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand-new">
          <img
            src={logo}
            alt="PeerConnect Logo"
            className="footer-logo glow-logo"
          />

          <h2 className="footer-title">
            Peer<span>Connect</span>
          </h2>

          <p className="footer-subtitle">
            Connect. Guide. Belong.
          </p>
        </div>

        <div className="footer-brand">
          <h2>About PeerConnect</h2>

          <p>
            PeerConnect helps newcomers connect with experienced students,
            find trusted guidance, and feel supported in a new city.
          </p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>

          <a href="#features">Features</a>
          <a href="#who-section">Who We Serve</a>
          <a href="#contact-section">Contact</a>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>

          <p>Email: peerconnect@gmail.com</p>
          <p>Chittagong, Bangladesh</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 PeerConnect. All rights reserved.</p>
      </div>
    </footer>
  );
}