import { useEffect, useState } from "react";
import "./LandingPage.css";
import logo from "../assets/logo1.png";
import heroImg from "../assets/Ai-image.png";

import LandingBackground from "../components/LandingBackground";
import LandingCard from "../components/LandingCard";

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
      <LandingBackground heroImg={heroImg} mouse={mouse} />

      <LandingCard logo={logo} onAbout={onAbout} onJoin={onJoin} />
    </div>
  );
}