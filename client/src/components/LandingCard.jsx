export default function LandingCard({ logo, onAbout, onJoin }) {
  return (
    <div className="lp-glass">
      <div className="lp-logo-wrap">
        <img src={logo} className="lp-logo" alt="PeerConnect logo" />
      </div>

      <h1>
        Peer<span>Connect</span>
      </h1>

      <p className="tagline">Connect. Guide. Belong.</p>

      <p className="desc">
        A trusted student community helping newcomers find mentors, guidance,
        and real connections in a new city.
      </p>

      <div className="lp-buttons">
        <button onClick={onAbout}>About Us</button>

        <button className="primary" onClick={onJoin}>
          Get Started
        </button>
      </div>
    </div>
  );
}