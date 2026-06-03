import { useEffect, useState } from "react";
import "./Welcome.css";
import handshakeImg from "../assets/handshake.png";
import ringImg from "../assets/ring.png";
import doodleImg from "../assets/doodle.png";

export default function Welcome({ onAbout, onJoin }) {
  const [visible, setVisible] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setButtonsVisible(true), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="welcome-page">
      <div className="welcome-bg-doodle" style={{ backgroundImage: `url(${doodleImg})` }} />
      <div className="welcome-vignette" />
      {buttonsVisible && <div className="welcome-border-frame" />}

      <div className="welcome-content" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
        
        {/* Two rings in X structure */}
        <div className="welcome-logo-wrapper">
          <img src={ringImg} alt="" aria-hidden="true" className="welcome-ring-img ring-clockwise" />
          <img src={ringImg} alt="" aria-hidden="true" className="welcome-ring-img ring-anticlockwise" />
          <img src={handshakeImg} alt="PeerConnect logo" className="welcome-handshake-img" />
        </div>

        <div className="welcome-text-group">
          <h1 className="welcome-title">PeerConnect</h1>
          <p className="welcome-subtitle">Helping You Settle, Connect, and Grow</p>
        </div>

        <div className={`welcome-buttons-container ${buttonsVisible ? "visible" : ""}`}>
          <button className="welcome-btn" onClick={onAbout}>About Us</button>
          <button className="welcome-btn" onClick={onJoin}>Log In</button>
        </div>

      </div>
    </div>
  );
}