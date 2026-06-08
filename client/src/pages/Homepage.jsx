import { useEffect, useState, useRef } from "react";
import "./Homepage.css";
import chittagongCityImg from "../assets/chittagong-city-new.jpg";
import feature1 from "../assets/buddy-new.webp";
import feature2 from "../assets/varified-guide.jpg";
import feature3 from "../assets/emergency-new.jpg";
import feature4 from "../assets/chat-buddy.jpg";
import newcomerImg from "../assets/newcommer.jpg";
import seniorImg from "../assets/senior.webp";
import authorityImg from "../assets/authority.webp";
import logo from "../assets/logo1.png";

export default function Homepage({ onLogout, onJoin, onBack, isGuest }) {
  const [isHero, setIsHero] = useState(true);
  const didScrollRef = useRef(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });

    // If arriving as guest (from "About Us"), scroll to #features after mount
    if (isGuest && !didScrollRef.current) {
      didScrollRef.current = true;
      setTimeout(() => {
        document
          .getElementById("features")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }

    const handleScroll = () => {
      setIsHero(window.scrollY < window.innerHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isGuest]);

  const [openFaq, setOpenFaq] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  const faqData = [
    {
      icon: "🔒",
      question: "Is my information safe and verified?",
      answer:
        "Absolutely. Every user must verify through university email and ID card. We also monitor suspicious activity to ensure safety.",
    },
    {
      icon: "🚨",
      question: "What happens in an emergency situation?",
      answer:
        "One tap on the emergency button alerts nearby friends and shares your live location instantly.",
    },
    {
      icon: "💬",
      question: "Can I message my buddy anytime?",
      answer:
        "Yes! You can chat anytime in Bengali or English and get help about housing, transport, and campus life.",
    },
    {
      icon: "⭐",
      question: "How do I become a buddy/mentor?",
      answer:
        "If you're a second-year student or higher, you can join as a mentor, earn badges, and help newcomers.",
    },
    {
      icon: "🏠",
      question: "What kind of housing help can I get?",
      answer:
        "You can find safe housing, mess info, rental guidance, and area suggestions from experienced seniors.",
    },
    {
      icon: "🌐",
      question: "Is PeerConnect only for Chittagong?",
      answer:
        "Currently yes, but we plan to expand to other major university cities in Bangladesh.",
    },
  ];

  const features = [
    {
      tag: "Core Feature",
      title: "Connect with your district buddy",
      text: "Get connect with a senior student from your home district who speaks your language and understands your background.",
      image: feature1,
    },
    {
      tag: "Security",
      title: "Verified student community",
      text: "Connect safely with verified students and seniors through university authentication.",
      image: feature2,
    },
    {
      tag: "Guidance",
      title: "One tap for help when you need it",
      text: "Alert nearby friends instantly and share your location if something feels wrong.",
      image: feature3,
    },
    {
      tag: "Support",
      title: "Real-time mentorship",
      text: "Get answers from experienced seniors whenever you need help navigating university life.",
      image: feature4,
    },
  ];

  return (
    <div className="homepage">
      {/* NAVBAR */}
      <nav className={`navbar ${!isHero ? "navbar-solid" : ""}`}>
        <a href="/" className="nav-logo">
          <img src={logo} alt="PeerConnect Logo" className="logo-img" />
          <span className="logo-text">
            Peer<span className="logo-highlight">Connect</span>
          </span>
        </a>

        <div className="nav-actions">
          {isGuest ? (
            <>
              <button className="btn btn-outline" onClick={onBack}>
                ← Back
              </button>
              <button className="btn btn-solid" onClick={onJoin}>
                Sign up
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={onLogout}>
                Log out
              </button>
              <button className="btn btn-solid" onClick={onJoin}>
                Dashboard
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <img src={chittagongCityImg} alt="Chittagong City" className="hero-img" />
        <div className="hero-overlay"></div>
        <div className="hero-content-box">
          <h1 className="hero-title">
            New City.<br />
            New Campus.<br />
            <span className="highlight">Same Community.</span>
          </h1>
          <p className="hero-description">
            Connect with experienced seniors from your hometown, discover
            trusted housing, transportation, food spots, and get the guidance
            you need to feel at home in Chattogram.
          </p>
          <div className="hero-buttons">
            {/* Explore → auth (sign up / log in) */}
            <button className="btn btn-primary" onClick={onJoin}>
              Explore
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="feature-reel">
          <div className="feature-counter">
            {currentFeature + 1} / {features.length}
          </div>
          <div className="feature-row">
            <div className="feature-image">
              <img
                src={features[currentFeature].image}
                alt={features[currentFeature].title}
              />
            </div>
            <div className="feature-content">
              <span className="feature-tag">{features[currentFeature].tag}</span>
              <h2>{features[currentFeature].title}</h2>
              <p>{features[currentFeature].text}</p>
              {currentFeature < features.length - 1 ? (
                <button
                  className="feature-btn"
                  onClick={() => setCurrentFeature(currentFeature + 1)}
                >
                  More Features →
                </button>
              ) : (
                <button
                  className="join-btn"
                  onClick={() =>
                    document
                      .getElementById("who-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section id="who-section" className="who-section">
        <h2 className="who-title">Who We Serve</h2>
        <div className="who-container">
          <div className="who-card">
            <img src={newcomerImg} alt="Newcomers" className="who-img" />
            <h3>Newcomers</h3>
            <p>
              Find housing, transport, and food guidance. Get paired with a
              senior from your district who knows Chittagong inside and out.
            </p>
          </div>
          <div className="who-card">
            <img src={seniorImg} alt="Seniors" className="who-img" />
            <h3>Seniors</h3>
            <p>
              Help juniors while earning recognition. Share guides, answer
              questions, and build trust through badges and reputation.
            </p>
          </div>
          <div className="who-card">
            <img src={authorityImg} alt="Authorities" className="who-img" />
            <h3>Authorities</h3>
            <p>
              Support student safety and well-being. Share official updates and
              manage emergency alerts across the community.
            </p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section">
        <h2 className="reviews-title">What People Say About PeerConnect</h2>
        <div className="reviews-container">
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <span className="student-tag senior">Senior Student (4th Year)</span>
            <p>
              "I've been using PeerConnect to help junior students from my
              district. It feels great guiding newcomers and making their
              university life easier."
            </p>
            <h4>- Tanvir Ahmed</h4>
          </div>
          <div className="review-card">
            <div className="stars">★★★★☆</div>
            <span className="student-tag fresher">1st Year Student</span>
            <p>
              "As a new student in Chattogram, I had no idea where to start. My
              buddy helped me find housing and settle within days."
            </p>
            <h4>- Nusrat Jahan</h4>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <span className="student-tag fresher">1st Year Student</span>
            <p>
              "PeerConnect made my transition smooth. I got guidance on
              transport, food spots, and campus life from day one."
            </p>
            <h4>- Arif Hossain</h4>
          </div>
        </div>
      </section>

      {/* IMPACT */}
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
              <div className="stat-number">800<span className="stat-plus">+</span></div>
              <div className="stat-label">Active senior buddies</div>
              <div className="stat-description">
                Experienced guides sharing knowledge and building trust
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2,400<span className="stat-plus">+</span></div>
              <div className="stat-label">Students helped</div>
              <div className="stat-description">Growing stronger every day</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">45<span className="stat-plus">+</span></div>
              <div className="stat-label">Community events held</div>
              <div className="stat-description">
                Connections made beyond screens and into real life
              </div>
            </div>
          </div>
          <div className="impact-footer">
            {/* Join the movement → auth */}
            <button className="impact-join-btn" onClick={onJoin}>
              Join the movement
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* TEAM */}
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
                chat features. Works on making the platform faster, reliable,
                and secure for every student.
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
                Focuses on making PeerConnect simple, trustworthy, and
                delightful to use.
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
              {/* Join us → auth */}
              <button className="hiring-btn" onClick={onJoin}>
                Join us
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-header">
            <span className="faq-badge">Got questions?</span>
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <p className="faq-subtitle">
              Everything you need to know about how PeerConnect works and how to
              get started.
            </p>
          </div>
          <div className="faq-grid">
            {faqData.map((faq, index) => (
              <div className="faq-item" key={index}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="faq-icon">{faq.icon}</span>
                  <h3>{faq.question}</h3>
                  <span className={`faq-arrow ${openFaq === index ? "open" : ""}`}>
                    ⌄
                  </span>
                </button>
                <div className={`faq-answer ${openFaq === index ? "open" : ""}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="faq-contact">
            <div className="contact-card">
              <span className="contact-emoji">💬</span>
              <h3>Still have questions?</h3>
              <p>
                We're here to help. Reach out to us anytime — we usually reply
                within a few hours.
              </p>
              <button
                className="contact-btn"
                onClick={() =>
                  document
                    .getElementById("contact-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Contact us
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact-section" className="contact-section">
        <div className="contact-wrapper">
          <span className="contact-badge">Get In Touch</span>
          <h2 className="contact-title">We'd Love To Hear From You</h2>
          <p className="contact-description">
            Have questions, suggestions, or need support? Reach out to the
            PeerConnect team and we'll get back to you as soon as possible.
          </p>
          <div className="contact-card-main">
            <div className="contact-icon">📧</div>
            <h3>Email Us</h3>
            <a href="mailto:peerconnect@gmail.com" className="contact-email">
              peerconnect@gmail.com
            </a>
            <p>We usually respond within 24 hours.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="footer">
        <div className="footer-container">
          <div className="footer-brand-new">
            <img src={logo} alt="PeerConnect Logo" className="footer-logo glow-logo" />
            <h2 className="footer-title">Peer<span>Connect</span></h2>
            <p className="footer-subtitle">Connect and Guide</p>
          </div>
          <div className="footer-brand">
            <h2>PeerConnect</h2>
            <p>
              Helping students feel at home in a new city through trusted
              guidance, mentorship, and community support.
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
            <p>peerconnect@gmail.com</p>
            <p>Chattogram, Bangladesh</p>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 PeerConnect. All rights reserved.
        </div>
      </footer>

      <button
        className="back-to-top"
        onClick={() => {
          if (isHero) {
            document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        {isHero ? "↓" : "↑"}
      </button>
    </div>
  );
}