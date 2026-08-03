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

// ✅ lucide icons replacing all emojis from faqData
import {
  ShieldCheck,
  Siren,
  MessageCircle,
  Star,
  Home,
  Globe,
} from "lucide-react";

export default function Homepage({ onLogout, onJoin, onBack, isGuest }) {
  const [isHero, setIsHero] = useState(true);
  const didScrollRef = useRef(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });

    const handleScroll = () => {
      setIsHero(window.scrollY < window.innerHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isGuest]);

  const [openFaq, setOpenFaq] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  // ✅ icon field is now a lucide component, not an emoji string
  const faqData = [
    {
      icon: ShieldCheck,
      question: "Is my information safe and verified?",
      answer:
        "Absolutely. Every user must verify through university email and ID card. We also monitor suspicious activity to ensure safety.",
    },
    {
      icon: Siren,
      question: "What happens in an emergency situation?",
      answer:
        "One tap on the emergency button alerts nearby friends and shares your live location instantly.",
    },
    {
      icon: MessageCircle,
      question: "Can I message my buddy anytime?",
      answer:
        "Yes! You can chat anytime in Bengali or English and get help about housing, transport, and campus life.",
    },
    {
      icon: Star,
      question: "How do I become a buddy/mentor?",
      answer:
        "If you're a second-year student or higher, you can join as a mentor, earn badges, and help newcomers.",
    },
    {
      icon: Home,
      question: "What kind of housing help can I get?",
      answer:
        "You can find safe housing, mess info, rental guidance, and area suggestions from experienced seniors.",
    },
    {
      icon: Globe,
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
      <HomeNavbar
        logo={logo}
        isHero={isHero}
        isGuest={isGuest}
        onBack={onBack}
        onJoin={onJoin}
        onLogout={onLogout}
      />

      <HeroSection chittagongCityImg={chittagongCityImg} onJoin={onJoin} />

      <FeaturesSection
        features={features}
        currentFeature={currentFeature}
        setCurrentFeature={setCurrentFeature}
      />

      <WhoSection
        newcomerImg={newcomerImg}
        seniorImg={seniorImg}
        authorityImg={authorityImg}
      />

      <ReviewsSection />

      <ImpactSection onJoin={onJoin} />

      <TeamSection onJoin={onJoin} />

      <FAQSection
        faqData={faqData}
        openFaq={openFaq}
        setOpenFaq={setOpenFaq}
      />

      <ContactSection />

      <Footer logo={logo} />

      <BackToTopButton />
    </div>
  );
}
