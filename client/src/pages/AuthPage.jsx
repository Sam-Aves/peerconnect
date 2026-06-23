import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mail, Lock, Eye, EyeOff, User, GraduationCap, MapPin,
  Search, Star, Upload, FileText, ChevronRight, ChevronLeft,
  CheckCircle, Shield, Handshake, ArrowRight, ExternalLink,
  AlertCircle, Info, 
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const FontLoader = () => {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
};

const C = {
  board:        "#021a12",
  boardFelt:    "#042C1F",
  boardMid:     "#063322",
  wood:         "#1a0d05",
  woodLight:    "#2a1608",
  pageLogin:    "#f6f1e9",
  pageReg:      "#edf4ec",
  pageLines:    "rgba(70,110,190,0.08)",
  pageMargin:   "rgba(200,55,55,0.16)",
  green:        "#2a7a4b",
  greenDark:    "#1d5c37",
  greenDeep:    "#042C1F",
  greenLight:   "rgba(42,122,75,0.13)",
  greenGlow:    "rgba(42,122,75,0.28)",
  accent:       "#34d399",
  accentDim:    "rgba(52,211,153,0.14)",
  glass:        "rgba(4,44,31,0.55)",
  glassBorder:  "rgba(52,211,153,0.18)",
  glassStrong:  "rgba(2,26,18,0.75)",
  ink:          "#1a2e1e",
  inkMid:       "#3a5842",
  inkLight:     "#6a8e73",
  inkFaint:     "#a6c2ab",
  onBoard:      "#c4e4cd",
  onBoardMid:   "#78a888",
  onBoardFaint: "#3a6647",
  error:        "#dc2626",
  errorBorder:  "rgba(220,38,38,0.35)",
  success:      "#16a34a",
  pin:          "#c0392b",
};

const UNI_DOMAINS = {
  "IIUC":                     ["iiuc.ac.bd","student.iiuc.ac.bd"],
  "BUET":                     ["buet.ac.bd","student.buet.ac.bd"],
  "BRAC University":          ["bracu.ac.bd","g.bracu.ac.bd"],
  "Dhaka University":         ["du.ac.bd","student.du.ac.bd"],
  "NSTU":                     ["nstu.ac.bd","student.nstu.ac.bd"],
  "East West University":     ["ewubd.edu","student.ewubd.edu"],
  "AUST":                     ["aust.edu","student.aust.edu"],
  "Jahangirnagar University": ["ju.ac.bd","student.ju.ac.bd"],
  "RUET":                     ["ruet.ac.bd","student.ruet.ac.bd"],
  "Chandpur Medical College":  ["cmc.edu.bd"],
  "Other":                    [],
};
const DISTRICTS = ["Dhaka","Chittagong","Sylhet","Rajshahi","Khulna","Barisal","Rangpur","Mymensingh","Cox's Bazar","Feni","Noakhali","Comilla","Brahmanbaria","Chandpur","Natore","Sandwip","Other"];
const UNIVERSITIES = Object.keys(UNI_DOMAINS);
const VALID_TYPES = ["image/jpeg","image/png","image/webp","application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024;

function pwStr(pw) {
  let s=0;
  if(pw.length>=8) s++;
  if(/[A-Z]/.test(pw)) s++;
  if(/[0-9]/.test(pw)) s++;
  if(/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_COLOR = ["","#ef4444","#f97316","#eab308","#22c55e"];
const STR_LABEL = ["","Weak","Fair","Good","Strong"];

const StickyNote = ({ text, color, rot, top, left, pinColor, width=110 }) => (
  <div style={{
    position:"absolute", top, left, zIndex:2,
    transform:`rotate(${rot}deg)`,
    filter:"drop-shadow(3px 6px 14px rgba(0,0,0,0.6))",
    width,
  }}>
    <div style={{
      position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
      width:20, height:20, borderRadius:"50%",
      background:`radial-gradient(circle at 35% 30%, ${pinColor==="blue"?"#3b82f6":pinColor==="purple"?"#8b5cf6":pinColor==="green"?"#22c55e":pinColor==="orange"?"#f97316":"#ef4444"}, ${pinColor==="blue"?"#1d4ed8":pinColor==="purple"?"#6d28d9":pinColor==="green"?"#15803d":pinColor==="orange"?"#c2410c":"#b91c1c"})`,
      boxShadow:"0 3px 8px rgba(0,0,0,0.5)",
    }}/>
    <div style={{ position:"absolute", top:7, left:"50%", transform:"translateX(-50%)", width:3, height:12, background:"linear-gradient(#aaa,#666)", borderRadius:"0 0 2px 2px" }}/>
    <div style={{ background:color, padding:"14px 11px 12px", borderRadius:"1px 1px 2px 2px", marginTop:4, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:"20px 0 0 0", background:"repeating-linear-gradient(transparent,transparent 14px,rgba(100,149,237,0.14) 14px,rgba(100,149,237,0.14) 15px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, right:0, width:14, height:14,
        background:`linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.12) 50%)`,
        borderTop:"1px solid rgba(0,0,0,0.08)", borderLeft:"1px solid rgba(0,0,0,0.08)"
      }}/>
      <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, fontWeight:500, color:"#1a2e22", margin:0, lineHeight:1.55, position:"relative", zIndex:1 }}>{text}</p>
    </div>
  </div>
);

function PaperField({ label, hint, icon:Icon, type="text", value, onChange, placeholder, error, right }) {
  const [foc,setFoc]=useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <label style={{ display:"flex", alignItems:"center", gap:5,
          fontFamily:"'DM Sans', sans-serif", fontSize:12, fontWeight:700,
          color: C.inkMid, letterSpacing:"0.02em", textTransform:"uppercase"
        }}>
          {Icon && <Icon size={12} strokeWidth={2.3} color={C.inkLight}/>}
          {label}
        </label>
        {hint && <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color:C.inkLight, fontStyle:"italic" }}>{hint}</span>}
      </div>
      <div style={{ position:"relative" }}>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{
            width:"100%", boxSizing:"border-box",
            padding:"10px 36px 10px 10px",
            background: foc ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
            border:`1.5px solid ${error?C.errorBorder:foc?C.green:"rgba(26,46,30,0.2)"}`,
            borderRadius:6, outline:"none",
            fontFamily:"'DM Sans', sans-serif", fontSize:13, color:C.ink,
            transition:"all 0.2s",
            boxShadow: foc ? `0 0 0 3px ${C.greenLight}, inset 0 1px 3px rgba(0,0,0,0.06)` : "inset 0 1px 3px rgba(0,0,0,0.05)",
          }}
        />
        {right && <div style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}>{right}</div>}
      </div>
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
          <AlertCircle size={11} color={C.error} strokeWidth={2.5}/>
          <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color:C.error }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function PaperSelect({ label, icon:Icon, value, onChange, options, error }) {
  const [foc,setFoc]=useState(false);
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"flex", alignItems:"center", gap:5,
        fontFamily:"'DM Sans', sans-serif", fontSize:12, fontWeight:700,
        color:C.inkMid, letterSpacing:"0.02em", textTransform:"uppercase", marginBottom:4
      }}>
        {Icon && <Icon size={12} strokeWidth={2.3} color={C.inkLight}/>}
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <select value={value} onChange={onChange}
          onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
          style={{
            width:"100%", boxSizing:"border-box", padding:"10px 30px 10px 10px",
            background: foc?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.6)",
            border:`1.5px solid ${error?C.errorBorder:foc?C.green:"rgba(26,46,30,0.2)"}`,
            borderRadius:6, outline:"none", appearance:"none", cursor:"pointer",
            fontFamily:"'DM Sans', sans-serif", fontSize:13,
            color:value?C.ink:"rgba(26,46,30,0.4)",
            boxShadow:"inset 0 1px 3px rgba(0,0,0,0.05)",
            transition:"all 0.2s",
          }}>
          <option value="">Select…</option>
          {options.map(o=><option key={o} value={o} style={{color:C.ink}}>{o}</option>)}
        </select>
        <ChevronRight size={13} color={C.inkLight} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%) rotate(90deg)", pointerEvents:"none" }}/>
      </div>
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
          <AlertCircle size={11} color={C.error} strokeWidth={2.5}/>
          <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color:C.error }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function InkBtn({ children, onClick, disabled, loading, secondary }) {
  const [h,setH]=useState(false);
  if(secondary) return (
    <button onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ flex:1, padding:"10px 14px", borderRadius:7, cursor:"pointer",
        border:`1.5px solid rgba(26,46,30,0.2)`,
        background: h?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.4)",
        fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:700,
        color:C.inkMid, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        transition:"all 0.18s",
      }}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} disabled={disabled||loading}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        width:"100%", padding:"12px 20px", borderRadius:7, border:"none",
        cursor: disabled||loading?"not-allowed":"pointer",
        background: disabled||loading ? `rgba(42,122,75,0.5)` : h?C.greenDark:C.green,
        color:"#fff", fontFamily:"'DM Sans', sans-serif", fontSize:15, fontWeight:700,
        display:"flex", alignItems:"center", justifyContent:"center", gap:7,
        boxShadow: !disabled&&!loading ? (h?"0 6px 20px rgba(42,122,75,0.45)":"0 3px 12px rgba(42,122,75,0.3)") : "none",
        transform: !disabled&&!loading&&h ? "translateY(-1px)" : "none",
        transition:"all 0.18s", letterSpacing:"-0.01em",
      }}>
      {loading
        ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite"/></path></svg>{loading}</>
        : children}
    </button>
  );
}

const StepDots = ({ n, cur }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:18 }}>
    {Array.from({length:n}).map((_,i)=>(
      <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width: i===cur?28:20, height:20, borderRadius:10,
          background: i<cur ? C.green : i===cur ? C.green : "rgba(26,46,30,0.12)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.3s",
          boxShadow: i===cur ? "0 2px 8px rgba(42,122,75,0.3)" : "none",
        }}>
          {i<cur
            ? <CheckCircle size={12} color="#fff" strokeWidth={2.5}/>
            : <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:10, fontWeight:700, color: i===cur?"#fff":C.inkFaint }}>{i+1}</span>
          }
        </div>
        {i<n-1 && <div style={{ width:20, height:1.5, background: i<cur?C.green:"rgba(26,46,30,0.12)", borderRadius:1, transition:"background 0.3s" }}/>}
      </div>
    ))}
  </div>
);

const PaperCallout = ({ children, warn }) => (
  <div style={{ display:"flex", gap:8, alignItems:"flex-start",
    background: warn ? "rgba(234,179,8,0.1)" : "rgba(42,122,75,0.09)",
    border:`1px solid ${warn?"rgba(234,179,8,0.3)":"rgba(42,122,75,0.22)"}`,
    borderRadius:7, padding:"9px 11px", marginBottom:14,
  }}>
    <Info size={13} color={warn?"#ca8a04":C.green} strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}/>
    <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.inkMid, margin:0, lineHeight:1.6 }}>{children}</p>
  </div>
);

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────
// FIX: onAuthSuccess prop added so it can be called after successful login
function LoginPage({ onSwitch, onAuthSuccess, onBack }) {
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [ok,setOk]=useState(false);
  const [serverError,setServerError]=useState("");

  const validate=()=>{
    const e={};
    if(!email.trim()) e.email="Email is required";
    else if(!/\S+@\S+\.\S+/.test(email)) e.email="Enter a valid email";
    else if(!email.includes(".ac.bd")&&!email.includes(".edu")) e.email="Use your university email (.ac.bd or .edu)";
    if(!pw) e.pw="Password is required";
    return e;
  };

  const submit=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setServerError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);
      setOk(true);

      // FIX: actually navigate to home after showing success tick
      setTimeout(() => {
        onAuthSuccess();
      }, 900);

    } catch (err) {
      setServerError("Cannot reach server. Make sure the backend is running on port 5000.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:22, paddingBottom:16, borderBottom:"1px dashed rgba(26,46,30,0.15)" }}>
        <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, fontWeight:700, color:C.inkLight, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 4px" }}>PeerConnect · Sign in</p>
        <h2 style={{ fontFamily:"'Fraunces', serif", fontSize:28, fontWeight:900, color:C.ink, margin:0, lineHeight:1.05, letterSpacing:"-0.02em" }}>Welcome back</h2>
        <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, color:C.inkMid, margin:"5px 0 0" }}>Your district buddy is waiting for you.</p>
      </div>

      <PaperCallout>Sign in with your university email address.</PaperCallout>

      {serverError && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:8,
          background:"rgba(220,38,38,0.08)", border:`1px solid ${C.errorBorder}`,
          borderRadius:7, padding:"9px 11px", marginBottom:14,
        }}>
          <AlertCircle size={13} color={C.error} strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}/>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.error, margin:0, lineHeight:1.6 }}>{serverError}</p>
        </div>
      )}

      <PaperField label="University email" icon={Mail} type="email"
        value={email} onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:""}));setServerError("");}}
        placeholder="yourname@iiuc.ac.bd" error={errors.email}/>

      <PaperField label="Password" icon={Lock}
        type={showPw?"text":"password"}
        value={pw} onChange={e=>{setPw(e.target.value);setErrors(p=>({...p,pw:""}));setServerError("");}}
        placeholder="Your password" error={errors.pw}
        right={
          <button onClick={()=>setShowPw(p=>!p)} style={{ background:"none",border:"none",cursor:"pointer",color:C.inkLight,padding:0,display:"flex" }}>
            {showPw?<EyeOff size={14} strokeWidth={2}/>:<Eye size={14} strokeWidth={2}/>}
          </button>
        }
      />

      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18, marginTop:-8, alignItems:"center" }}>
        {/* FIX: onBack wired to "← Landing" link so users can return without signing in */}
        <button
          onClick={onBack}
          style={{ background:"none", border:"none", cursor:"pointer", padding:0,
            fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.inkFaint,
            display:"flex", alignItems:"center", gap:3 }}>
          <ChevronLeft size={12}/> Back
        </button>
        {/* FIX: "Forgot password?" placeholder — alert until backend route exists */}
        <button
          onClick={() => alert("Password reset coming soon. Contact your admin for now.")}
          style={{ background:"none", border:"none", cursor:"pointer", padding:0,
            fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.green, fontWeight:600 }}>
          Forgot password?
        </button>
      </div>

      {ok
        ? <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            padding:"13px", borderRadius:7,
            background:"rgba(22,163,74,0.1)", border:"1px solid rgba(22,163,74,0.3)" }}>
            <CheckCircle size={16} color={C.success} strokeWidth={2.5}/>
            <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:700, color:C.success }}>Signed in successfully</span>
          </div>
        : <InkBtn onClick={submit} loading={loading?"Signing in…":null}>
            Sign in <ArrowRight size={15}/>
          </InkBtn>
      }

      <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0" }}>
        <div style={{ flex:1, height:1, background:"rgba(26,46,30,0.1)" }}/>
        <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color:C.inkFaint, fontStyle:"italic" }}>or</span>
        <div style={{ flex:1, height:1, background:"rgba(26,46,30,0.1)" }}/>
      </div>

      <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, color:C.inkMid, textAlign:"center", margin:0 }}>
        New student?{" "}
        <button onClick={onSwitch} style={{ background:"none",border:"none",color:C.green,fontFamily:"'DM Sans', sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",padding:0,textDecoration:"underline" }}>
          Create your account
        </button>
      </p>
      <div style={{ textAlign:"center", marginTop:8 }}>
        <a href="/admin/login" style={{ display:"inline-flex",alignItems:"center",gap:4,fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.inkFaint,textDecoration:"none" }}>
          Admin portal <ExternalLink size={10}/>
        </a>
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ─────────────────────────────────────────────────────────────
function RegisterPage({ onSwitch }) {
  const [step,setStep]=useState(0);
  const [d,setD]=useState({name:"",uni:"",district:"",role:"",email:"",pw:"",cpw:"",file:null});
  const [errors,setErrors]=useState({});
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [fileErr,setFileErr]=useState("");
  const [preview,setPreview]=useState(null);
  const [serverError,setServerError]=useState("");
  const fileRef=useRef();
  const str=pwStr(d.pw);
  const set=(f,v)=>setD(p=>({...p,[f]:v}));

  const emailErr=(email,uni)=>{
    if(!email.trim()) return "Email is required";
    if(!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email";
    if(!email.includes(".ac.bd")&&!email.includes(".edu")) return "Must be a university email (.ac.bd or .edu)";
    const allowed=UNI_DOMAINS[uni];
    if(allowed&&allowed.length>0){
      const domain=email.split("@")[1]?.toLowerCase();
      if(!allowed.some(d=>domain===d||domain?.endsWith("."+d)))
        return `Use your ${allowed[0]} email for ${uni}`;
    }
    return "";
  };

  const handleFile=(file)=>{
    setFileErr("");
    if(!file) return;
    if(!VALID_TYPES.includes(file.type)){setFileErr("Only JPG, PNG, WebP or PDF accepted");return;}
    if(file.size>MAX_SIZE){setFileErr("File must be under 5 MB");return;}
    set("file",file);
    if(file.type.startsWith("image/")){
      const r=new FileReader();
      r.onload=e=>setPreview(e.target.result);
      r.readAsDataURL(file);
    } else setPreview("pdf");
  };

  const validate=()=>{
    const e={};
    if(step===0){
      if(!d.name.trim()) e.name="Full name required";
      else if(d.name.trim().split(" ").length<2) e.name="Enter your full name";
      if(!d.uni) e.uni="Select your university";
      if(!d.district) e.district="Select your home district";
      if(!d.role) e.role="Select your role";
    }
    if(step===1){
      const ee=emailErr(d.email,d.uni);
      if(ee) e.email=ee;
      if(!d.pw||d.pw.length<8) e.pw="Minimum 8 characters";
      else if(pwStr(d.pw)<2) e.pw="Too weak — add uppercase or numbers";
      if(d.pw!==d.cpw) e.cpw="Passwords don't match";
    }
    if(step===2){
      if(!d.file) e.file="Student ID is required";
      if(fileErr) e.file=fileErr;
    }
    return e;
  };

  const next=async()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    setErrors({});
    setServerError("");

    if(step<2){setStep(s=>s+1);return;}

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:       d.name,
          university: d.uni,
          district:   d.district,
          role:       d.role,
          email:      d.email,
          password:   d.pw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setDone(true);

    } catch (err) {
      setServerError("Cannot reach server. Make sure the backend is running on port 5000.");
      setLoading(false);
    }
  };

  if(done) return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <div style={{ width:64,height:64,borderRadius:"50%",
        background:`linear-gradient(135deg,${C.green},#34d399)`,
        display:"flex",alignItems:"center",justifyContent:"center",
        margin:"0 auto 18px",boxShadow:"0 8px 28px rgba(42,122,75,0.35)" }}>
        <CheckCircle size={30} color="#fff" strokeWidth={2}/>
      </div>
      <h3 style={{ fontFamily:"'Fraunces', serif",fontSize:26,fontWeight:900,color:C.ink,margin:"0 0 8px",letterSpacing:"-0.02em" }}>Application submitted</h3>
      <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:13,color:C.inkMid,lineHeight:1.75,marginBottom:22 }}>
        Welcome, <strong style={{color:C.green}}>{d.name}</strong>.<br/>
        We'll verify your student ID and email <strong>{d.email}</strong> within 24 hours.
      </p>
      <InkBtn onClick={onSwitch}><ChevronLeft size={15}/> Back to sign in</InkBtn>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom:18, paddingBottom:14, borderBottom:"1px dashed rgba(26,46,30,0.15)" }}>
        <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,fontWeight:700,color:C.inkLight,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 4px" }}>PeerConnect · New account</p>
        <h2 style={{ fontFamily:"'Fraunces', serif",fontSize:26,fontWeight:900,color:C.ink,margin:0,lineHeight:1.05,letterSpacing:"-0.02em" }}>
          {["About you","Your account","Verify identity"][step]}
        </h2>
        <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:13,color:C.inkMid,margin:"4px 0 0" }}>
          {["Tell us who you are","Secure your account","Prove you're a student"][step]}
        </p>
      </div>

      <StepDots n={3} cur={step}/>

      {step===0 && <>
        <PaperField label="Full name" icon={User}
          value={d.name} onChange={e=>{set("name",e.target.value);setErrors(p=>({...p,name:""}));}}
          placeholder="As it appears on your student ID" hint="As on student ID" error={errors.name}/>
        <PaperSelect label="University" icon={GraduationCap}
          value={d.uni} onChange={e=>{set("uni",e.target.value);set("email","");setErrors(p=>({...p,uni:"",email:""}));}}
          options={UNIVERSITIES} error={errors.uni}/>
        <PaperSelect label="Home district" icon={MapPin}
          value={d.district} onChange={e=>{set("district",e.target.value);setErrors(p=>({...p,district:""}));}}
          options={DISTRICTS} error={errors.district}/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block",fontFamily:"'DM Sans', sans-serif",fontSize:12,fontWeight:700,color:C.inkMid,letterSpacing:"0.02em",textTransform:"uppercase",marginBottom:8 }}>I want to join as</label>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
            {[
              {val:"seeker", Icon:Search, title:"Newcomer", sub:"I need guidance"},
              {val:"helper", Icon:Handshake, title:"Buddy", sub:"I offer guidance"},
              {val:"both", Icon:Star, title:"Both", sub:"Help & be helped"},
            ].map(({val,Icon,title,sub})=>(
              <button key={val} onClick={()=>{set("role",val);setErrors(p=>({...p,role:""}));}}
                style={{
                  padding:"11px 7px",
                  border:`1.5px solid ${d.role===val?C.green:"rgba(26,46,30,0.18)"}`,
                  borderRadius:8,
                  background: d.role===val?"rgba(42,122,75,0.1)":"rgba(255,255,255,0.45)",
                  cursor:"pointer",textAlign:"center",transition:"all 0.18s",
                  boxShadow: d.role===val?"0 2px 8px rgba(42,122,75,0.2)":"none",
                }}>
                <Icon size={18} color={d.role===val?C.green:C.inkLight} strokeWidth={1.8} style={{ margin:"0 auto 5px",display:"block" }}/>
                <div style={{ fontFamily:"'DM Sans', sans-serif",fontSize:12,fontWeight:700,color:d.role===val?C.green:C.inkMid }}>{title}</div>
                <div style={{ fontFamily:"'DM Sans', sans-serif",fontSize:10,color:C.inkLight,marginTop:2 }}>{sub}</div>
              </button>
            ))}
          </div>
          {errors.role&&<div style={{ display:"flex",alignItems:"center",gap:4,marginTop:5 }}>
            <AlertCircle size={11} color={C.error} strokeWidth={2.5}/>
            <span style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.error }}>{errors.role}</span>
          </div>}
        </div>
      </>}

      {step===1 && <>
        <PaperCallout>
          {d.uni&&UNI_DOMAINS[d.uni]?.length>0
            ?`For ${d.uni}, use your ${UNI_DOMAINS[d.uni][0]} email.`
            :"Use your official university email (.ac.bd or .edu)."}
        </PaperCallout>

        {serverError && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:8,
            background:"rgba(220,38,38,0.08)", border:`1px solid ${C.errorBorder}`,
            borderRadius:7, padding:"9px 11px", marginBottom:14,
          }}>
            <AlertCircle size={13} color={C.error} strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}/>
            <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.error, margin:0, lineHeight:1.6 }}>{serverError}</p>
          </div>
        )}

        <PaperField label="University email" icon={Mail} type="email"
          value={d.email} onChange={e=>{set("email",e.target.value);setErrors(p=>({...p,email:""}));setServerError("");}}
          placeholder={d.uni&&UNI_DOMAINS[d.uni]?.[0]?`yourname@${UNI_DOMAINS[d.uni][0]}`:"yourname@university.ac.bd"}
          error={errors.email}/>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block",fontFamily:"'DM Sans', sans-serif",fontSize:12,fontWeight:700,color:C.inkMid,letterSpacing:"0.02em",textTransform:"uppercase",marginBottom:4 }}>Password</label>
          <div style={{ position:"relative" }}>
            <input type={showPw?"text":"password"} value={d.pw}
              onChange={e=>{set("pw",e.target.value);setErrors(p=>({...p,pw:""}));}}
              placeholder="Minimum 8 characters"
              style={{ width:"100%",boxSizing:"border-box",padding:"10px 36px 10px 10px",background:"rgba(255,255,255,0.6)",border:`1.5px solid ${errors.pw?C.errorBorder:"rgba(26,46,30,0.2)"}`,borderRadius:6,outline:"none",fontFamily:"'DM Sans', sans-serif",fontSize:13,color:C.ink,boxShadow:"inset 0 1px 3px rgba(0,0,0,0.05)" }}/>
            <button onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.inkLight,padding:0,display:"flex" }}>
              {showPw?<EyeOff size={14} strokeWidth={2}/>:<Eye size={14} strokeWidth={2}/>}
            </button>
          </div>
          {d.pw&&<div style={{ marginTop:6 }}>
            <div style={{ display:"flex",gap:3,marginBottom:3 }}>
              {[1,2,3,4].map(i=><div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=str?STR_COLOR[str]:"rgba(26,46,30,0.12)",transition:"background 0.3s" }}/>)}
            </div>
            <span style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,fontWeight:700,color:STR_COLOR[str] }}>{STR_LABEL[str]}</span>
          </div>}
          {errors.pw&&<div style={{ display:"flex",alignItems:"center",gap:4,marginTop:4 }}>
            <AlertCircle size={11} color={C.error} strokeWidth={2.5}/>
            <span style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.error }}>{errors.pw}</span>
          </div>}
        </div>
        <PaperField label="Confirm password" icon={Lock} type="password"
          value={d.cpw} onChange={e=>{set("cpw",e.target.value);setErrors(p=>({...p,cpw:""}));}}
          placeholder="Repeat password" error={errors.cpw}/>
        <div style={{ display:"flex",alignItems:"flex-start",gap:8,background:"rgba(42,122,75,0.08)",border:"1px solid rgba(42,122,75,0.2)",borderRadius:7,padding:"9px 11px" }}>
          <Shield size={13} color={C.green} strokeWidth={2} style={{ flexShrink:0,marginTop:1 }}/>
          <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:12,color:C.inkMid,margin:0,lineHeight:1.6 }}>Your data is encrypted. We never share your information without consent.</p>
        </div>
      </>}

      {step===2 && <>
        <PaperCallout warn>Only JPG, PNG, WebP, or PDF accepted. Max 5 MB. Incorrect file types will be rejected.</PaperCallout>

        {serverError && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:8,
            background:"rgba(220,38,38,0.08)", border:`1px solid ${C.errorBorder}`,
            borderRadius:7, padding:"9px 11px", marginBottom:14,
          }}>
            <AlertCircle size={13} color={C.error} strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}/>
            <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.error, margin:0, lineHeight:1.6 }}>{serverError}</p>
          </div>
        )}

        <div onClick={()=>fileRef.current.click()} style={{
          border:`2px dashed ${fileErr||errors.file?C.errorBorder:d.file?C.green:"rgba(26,46,30,0.22)"}`,
          borderRadius:9, padding:"18px 14px", textAlign:"center", cursor:"pointer",
          background:d.file?"rgba(42,122,75,0.07)":"rgba(255,255,255,0.3)",
          marginBottom:8, transition:"all 0.2s",
        }}>
          {preview==="pdf" ? <>
            <FileText size={30} color={C.green} strokeWidth={1.5} style={{ margin:"0 auto 8px",display:"block" }}/>
            <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:13,fontWeight:700,color:C.green,margin:"0 0 3px" }}>{d.file.name}</p>
            <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.inkLight,margin:0 }}>{(d.file.size/1024).toFixed(0)} KB · Click to replace</p>
          </> : preview ? <>
            <img src={preview} alt="ID preview" style={{ maxHeight:110,maxWidth:"100%",borderRadius:6,objectFit:"cover",marginBottom:8,border:"1px solid rgba(42,122,75,0.2)" }}/>
            <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.inkMid,margin:0 }}>{d.file.name} · {(d.file.size/1024).toFixed(0)} KB · Click to replace</p>
          </> : <>
            <Upload size={28} color={C.inkLight} strokeWidth={1.5} style={{ margin:"0 auto 8px",display:"block" }}/>
            <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:13,fontWeight:600,color:C.inkMid,margin:"0 0 3px" }}>Upload your student ID</p>
            <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.inkLight,margin:0 }}>JPG, PNG, WebP or PDF · max 5 MB</p>
          </>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
        {(fileErr||errors.file)&&<div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:12 }}>
          <AlertCircle size={11} color={C.error} strokeWidth={2.5}/>
          <span style={{ fontFamily:"'DM Sans', sans-serif",fontSize:11,color:C.error }}>{fileErr||errors.file}</span>
        </div>}
        <div style={{ background:"rgba(255,255,255,0.35)",border:"1px solid rgba(26,46,30,0.13)",borderRadius:8,padding:"12px 14px" }}>
          <p style={{ fontFamily:"'DM Sans', sans-serif",fontSize:10,fontWeight:700,color:C.inkLight,textTransform:"uppercase",letterSpacing:"0.07em",margin:"0 0 10px" }}>Review</p>
          {[["Name",d.name],["University",d.uni],["District",d.district],["Role",d.role],["Email",d.email],["Student ID",d.file?.name]].map(([k,v])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",fontFamily:"'DM Sans', sans-serif",fontSize:12,marginBottom:7,paddingBottom:7,borderBottom:"1px solid rgba(26,46,30,0.08)" }}>
              <span style={{ fontWeight:700,color:C.inkMid }}>{k}</span>
              <span style={{ color:v?C.ink:C.inkFaint,maxWidth:"58%",textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{v||"—"}</span>
            </div>
          ))}
        </div>
      </>}

      <div style={{ display:"flex",gap:8,marginTop:18 }}>
        {step>0&&<InkBtn secondary onClick={()=>{setStep(s=>s-1);setServerError("");}}><ChevronLeft size={14}/> Back</InkBtn>}
        <div style={{ flex:2 }}>
          <InkBtn onClick={next} loading={loading?"Submitting…":null}>
            {step===2?<><CheckCircle size={15}/> Submit</>:<>Continue <ChevronRight size={15}/></>}
          </InkBtn>
        </div>
      </div>
      {step===0&&<p style={{ textAlign:"center",fontFamily:"'DM Sans', sans-serif",fontSize:13,color:C.inkMid,marginTop:14 }}>
        Already a member?{" "}
        <button onClick={onSwitch} style={{ background:"none",border:"none",color:C.green,fontFamily:"'DM Sans', sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",padding:0,textDecoration:"underline" }}>Sign in</button>
      </p>}
    </div>
  );
}

function Notebook({ mode, children, pageColor, flipping, flipDir }) {
  return (
    <div style={{ position:"relative", width:420, perspective:1200 }}>
      {/* Spine */}
      <div style={{
        position:"absolute", left:-18, top:6, bottom:-6, width:18,
        background:"linear-gradient(90deg,#1a5c2e,#2a7a4b,#1a5c2e)",
        borderRadius:"4px 0 0 4px",
        boxShadow:"-4px 4px 16px rgba(0,0,0,0.6)",
        zIndex:5,
      }}>
        {[14,28,42,56,70,84,98,112,126,140].map(top=>(
          <div key={top} style={{ position:"absolute", top, left:-4, width:26, height:12, borderRadius:6,
            background:"linear-gradient(90deg,#bbb,#888,#bbb)", border:"1px solid #666",
            boxShadow:"0 2px 4px rgba(0,0,0,0.4)"
          }}/>
        ))}
      </div>
      {/* Back page */}
      <div style={{
        position:"absolute", inset:0,
        background: mode==="login" ? C.pageReg : C.pageLogin,
        borderRadius:"0 8px 8px 0",
        boxShadow:"4px 4px 20px rgba(0,0,0,0.3)",
        transform:"translateX(3px) translateY(3px)",
        zIndex:1,
      }}/>
      {/* Active page */}
      <div style={{
        position:"relative", zIndex:10,
        background: pageColor,
        borderRadius:"0 8px 8px 0",
        boxShadow:"6px 8px 30px rgba(0,0,0,0.5), -2px 0 8px rgba(0,0,0,0.15)",
        transformOrigin:"left center",
        animation: flipping ? `pageFlip${flipDir} 0.55s cubic-bezier(0.645,0.045,0.355,1.000) forwards` : "none",
        overflow:"hidden",
        minHeight:500,
      }}>
        <div style={{ position:"absolute", inset:"60px 0 0 0",
          background:`repeating-linear-gradient(transparent, transparent 30px, ${C.pageLines} 30px, ${C.pageLines} 31px)`,
          pointerEvents:"none", zIndex:0,
        }}/>
        <div style={{ position:"absolute", top:0, bottom:0, left:52, width:1.5,
          background:C.pageMargin, pointerEvents:"none", zIndex:0,
        }}/>
        <div style={{ position:"absolute", bottom:0, right:0, width:40, height:40,
          background:"linear-gradient(135deg,transparent 50%,rgba(0,0,0,0.08) 50%)",
          zIndex:0,
        }}/>
        <div style={{ position:"absolute", bottom:14, right:20, fontFamily:"'DM Sans', sans-serif",
          fontSize:11, color:C.inkFaint, fontStyle:"italic", zIndex:1 }}>
          {mode==="login" ? "pg. 1" : "pg. 2"}
        </div>
        <div style={{ position:"relative", zIndex:1, padding:"28px 28px 36px 40px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage({ onAuthSuccess, onBack }) {
  const [mode, setMode] = useState("login");
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("Out");
  const [displayed, setDisplayed] = useState("login");

  const switchTo = (next) => {
    if (flipping || next === mode) return;
    setFlipDir("Out");
    setFlipping(true);
    setTimeout(() => {
      setMode(next);
      setDisplayed(next);
      setFlipDir("In");
      setTimeout(() => { setFlipping(false); }, 560);
    }, 320);
  };

  const pageColor = displayed === "login" ? C.pageLogin : C.pageReg;

  return (
    <>
      <FontLoader />
      <div style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse at 18% 28%, rgba(42,122,75,0.1) 0%, transparent 48%),
          radial-gradient(ellipse at 82% 72%, rgba(52,211,153,0.05) 0%, transparent 42%),
          repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(42,122,75,0.03) 38px, rgba(42,122,75,0.03) 39px),
          repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(42,122,75,0.02) 38px, rgba(42,122,75,0.02) 39px),
          linear-gradient(155deg, #0a1c12 0%, #071510 55%, #0d2318 100%)
        `,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 20px",
        position: "relative", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Wooden frame */}
        <div style={{ position:"absolute", inset:0,
          border:"22px solid #1c0f07",
          boxShadow:`0 0 0 3px #2e1a0d, 0 0 0 5px #1c0f07,
                     inset 0 0 80px rgba(0,0,0,0.35),
                     0 30px 100px rgba(0,0,0,0.8)`,
          pointerEvents:"none", zIndex:20,
        }}/>
        {/* Corner screws */}
        {[[28,28],[28,"calc(100% - 50px)"],["calc(100% - 50px)",28],["calc(100% - 50px)","calc(100% - 50px)"]].map(([t,l],i)=>(
          <div key={i} style={{ position:"absolute", top:t, left:l, width:14, height:14,
            borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,#888,#444)",
            boxShadow:"0 2px 4px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15)",
            zIndex:21, pointerEvents:"none",
          }}>
            <div style={{ position:"absolute", top:"50%", left:"20%", right:"20%", height:1.5, background:"rgba(0,0,0,0.5)", transform:"translateY(-50%)" }}/>
          </div>
        ))}

        <div style={{ position:"absolute", inset:22, pointerEvents:"none",
          boxShadow:"inset 0 0 100px rgba(0,0,0,0.5)", zIndex:0,
        }}/>

        {/* Floating sticky notes */}
        <StickyNote text="Need roommate near IIUC campus" color="#fef9c3" rot={-7} top="7%" left="2.5%" pinColor="red" width={114}/>
        <StickyNote text="Free CSE tutoring for freshers!" color="#dbeafe" rot={5} top="6%" left="72%" pinColor="blue" width={118}/>
        <StickyNote text="Study group for finals — DM me" color="#d1fae5" rot={7} top="74%" left="72%" pinColor="green" width={112}/>
        <StickyNote text="Lost: blue umbrella near library" color="#ede9fe" rot={-5} top="74%" left="2.5%" pinColor="purple" width={110}/>
        <StickyNote text="Which bus goes to GEC Circle?" color="#fce7f3" rot={-6} top="41%" left="0.5%" pinColor="red" width={108}/>
        <StickyNote text="Halal spots near campus" color="#fef3c7" rot={5} top="39%" left="77%" pinColor="orange" width={105}/>

        {/* String lines */}
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1 }}>
          <line x1="8%" y1="14%" x2="32%" y2="47%" stroke="rgba(90,62,40,0.4)" strokeWidth="1" strokeDasharray="4 3"/>
          <line x1="77%" y1="11%" x2="62%" y2="46%" stroke="rgba(90,62,40,0.35)" strokeWidth="1" strokeDasharray="4 3"/>
          <line x1="6%" y1="73%" x2="28%" y2="57%" stroke="rgba(90,62,40,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
          <line x1="77%" y1="76%" x2="62%" y2="57%" stroke="rgba(90,62,40,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
        </svg>

        {/* Tabs + Notebook */}
        <div style={{ position:"relative", zIndex:12 }}>
          <div style={{ display:"flex", gap:0, marginBottom:0, position:"relative", zIndex:13 }}>
            {[["login","Sign in"],["register","Create account"]].map(([key,label])=>{
              const active = mode===key;
              return (
                <button key={key} onClick={()=>switchTo(key)}
                  style={{
                    padding:"10px 24px",
                    borderRadius: active ? "10px 10px 0 0" : "8px 8px 0 0",
                    border:"none", cursor:"pointer",
                    background: active
                      ? (key==="login" ? C.pageLogin : C.pageReg)
                      : "rgba(10,28,18,0.6)",
                    color: active ? C.inkMid : C.onBoardFaint,
                    fontFamily:"'DM Sans', sans-serif", fontSize:14, fontWeight:700,
                    transition:"all 0.25s",
                    boxShadow: active ? "0 -4px 12px rgba(0,0,0,0.3)" : "none",
                    borderBottom: active ? `2px solid ${key==="login"?C.pageLogin:C.pageReg}` : "none",
                    marginBottom: active ? -1 : 0,
                    position:"relative", zIndex: active ? 14 : 12,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <Notebook mode={displayed} pageColor={pageColor} flipping={flipping} flipDir={flipDir}>
            <div style={{
              opacity: flipping ? 0 : 1,
              transform: flipping ? "translateY(6px)" : "translateY(0)",
              transition: flipping ? "none" : "opacity 0.3s ease 0.12s, transform 0.3s ease 0.12s",
            }}>
              {/* FIX: pass onAuthSuccess and onBack down to LoginPage */}
              {displayed==="login"
                ? <LoginPage
                    onSwitch={() => switchTo("register")}
                    onAuthSuccess={onAuthSuccess}
                    onBack={onBack}
                  />
                : <RegisterPage onSwitch={() => switchTo("login")} />
              }
            </div>
          </Notebook>
        </div>

        {/* Bottom tagline */}
        <div style={{ position:"absolute", bottom:30, left:"50%", transform:"translateX(-50%)", whiteSpace:"nowrap", zIndex:15 }}>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontSize:12, color:C.onBoardFaint, margin:0, letterSpacing:"0.04em" }}>
            Connect · Guide · Belong — your home away from home
          </p>
        </div>

      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; overflow-x: hidden; margin: 0; }
        input::placeholder { color: rgba(26,46,30,0.35); font-family: 'DM Sans', sans-serif; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(255,255,255,0.85) inset !important;
          -webkit-text-fill-color: #1a2e1e !important;
        }
        select option { background: #f5f0e8; color: #1a2e1e; }
        button:focus { outline: none; }
        @keyframes pageFlipOut {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(-88deg); }
        }
        @keyframes pageFlipIn {
          0%   { transform: rotateY(-88deg); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </>
  );
}