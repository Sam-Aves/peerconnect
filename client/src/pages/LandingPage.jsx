import { useEffect, useState } from "react";
import "./LandingPage.css";
import logo from "../assets/logo1.png";
import heroImg from "../assets/Ai-image.png";

export default function LandingPage({ onAbout, onJoin }) {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const move = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="lp-page">
      {/* BACKGROUND IMAGE */}
      <img src={heroImg} className="lp-bg-image" />

      {/* DARK OVERLAY */}
      <div className="lp-overlay" />

      {/* FLOATING GLOW */}
      <div
        className="lp-glow"
        style={{
          left: `${mouse.x}%`,
          top: `${mouse.y}%`,
        }}
      />

      {/* GLASS CARD */}
      <div className="lp-glass">
        <div className="lp-logo-wrap">
          <img src={logo} className="lp-logo" />
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
    </div>
  );
}
