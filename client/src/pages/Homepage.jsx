import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import HomeNavbar from "../components/HomeNavbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import WhoSection from "../components/WhoSection";
import ReviewsSection from "../components/ReviewsSection";
import ImpactSection from "../components/ImpactSection";
import TeamSection from "../components/TeamSection";
import FAQSection from "../components/FAQSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import BackToTopButton from "../components/BackToTopButton";

// isGuest is the one prop still passed explicitly, from App.jsx's route
// definition (<Homepage isGuest /> on /about) - it's a per-route display
// flag, not something to derive from auth state, since a logged-in admin
// could still land on /about and should see the same guest-flavored copy.
// onLogout/onJoin/onBack used to be threaded down from App.jsx's go()
// state machine - now Homepage gets them itself from router + auth context.
export default function Homepage({ isGuest: forceGuest }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  // /about always passes isGuest explicitly (forceGuest), so visiting the
  // marketing page never depends on login state. Anywhere Homepage is
  // reached without that explicit flag, fall back to real auth state:
  // logged-in users see the member navbar (Log out / Dashboard), everyone
  // else sees the guest navbar (Back / Sign up).
  const isGuest = forceGuest ?? !isAuthenticated;
  const [isHero, setIsHero] = useState(true);
  const didScrollRef = useRef(false);

  const handleJoin = () => navigate("/auth");
  const handleBack = () => navigate("/");
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

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
      <HomeNavbar
  logo={logo}
  isHero={isHero}
  isGuest={isGuest}
  onBack={handleBack}
  onJoin={handleJoin}
  onLogout={handleLogout}
/>

      {/* HERO */}
      <HeroSection chittagongCityImg={chittagongCityImg} onJoin={handleJoin} />

      {/* FEATURES */}
      <FeaturesSection
  features={features}
  currentFeature={currentFeature}
  setCurrentFeature={setCurrentFeature}
/>

      {/* WHO WE SERVE */}
      <WhoSection
  newcomerImg={newcomerImg}
  seniorImg={seniorImg}
  authorityImg={authorityImg}
/>

      {/* REVIEWS */}
     <ReviewsSection />

      {/* IMPACT */}
      <ImpactSection onJoin={handleJoin} />

      {/* TEAM */}
      <TeamSection onJoin={handleJoin} />

      {/* FAQ */}
      <FAQSection
  faqData={faqData}
  openFaq={openFaq}
  setOpenFaq={setOpenFaq}
/>

      {/* CONTACT */}
      <ContactSection />

      {/* FOOTER */}
      <Footer logo={logo} />

     <BackToTopButton />
    </div>
  );
}