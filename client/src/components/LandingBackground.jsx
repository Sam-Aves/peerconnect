export default function LandingBackground({ heroImg, mouse }) {
  return (
    <>
      <img src={heroImg} className="lp-bg-image" alt="PeerConnect background" />

      <div className="lp-overlay" />

      <div
        className="lp-glow"
        style={{ left: `${mouse.x}%`, top: `${mouse.y}%` }}
      />
    </>
  );
}
