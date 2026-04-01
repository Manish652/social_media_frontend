import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import {
  motion,
  useScroll, useTransform, useSpring,
  useMotionValue, useInView, AnimatePresence
} from "framer-motion";

// --- Assets ---
import socialAnim      from "../assets/animations/Social Networking.json";
import influencerAnim  from "../assets/animations/Influencer photoshoot.json";
import hiAnim          from "../assets/animations/hi.json";
import catAnim         from "../assets/animations/Running Cat.json";
import socialLifeGif   from "../assets/animations/lifetosiciallife.gif";
import funnySocialGif  from "../assets/animations/funnysocialmedia.gif";

// ─── MEDIA SLOTS ──────────────────────────────────────────────────────────────
// SLOT_1 – Hero background video (optional):
//   import heroBgVideo from "../assets/videos/hero-bg.mp4";
//
// SLOT_2 – Feature/app mockup screenshot:
//   import appMockup from "../assets/images/app-mockup.png";
//   Drop into the feature tabs panel (search SLOT_2 below).
//
// SLOT_3 – Your profile / avatar photo:
   import avatarPhoto from "../assets/Img/blackcat.png";
//   Drop into the "Built By" section (search SLOT_3 below).
// ─────────────────────────────────────────────────────────────────────────────

import {
  ArrowRight, Sparkles, Lock, ShieldCheck, Layout, Smartphone,
  MessageSquare, Heart, Bell, Play, Image, BookOpen, Zap,
  Cloud, Globe, GitBranch, User, Clock, Activity, Users,
} from "lucide-react";

// ── animation variants ────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 56, filter: "blur(10px)" },
  show:   { opacity: 1, y:  0, filter: "blur(0px)",  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};
const fadeLeft  = { hidden: { opacity: 0, x: -70, filter: "blur(8px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } };
const fadeRight = { hidden: { opacity: 0, x:  70, filter: "blur(8px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } };

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ── parallax tilt card ────────────────────────────────────────────────────────
function TiltCard({ children, className = "", depth = 1 }) {
  const ref = useRef(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 130, damping: 22 });
  const sry = useSpring(ry, { stiffness: 130, damping: 22 });
  const move = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rx.set(((e.clientY - r.top  - r.height / 2) / r.height) * -16 * depth);
    ry.set(((e.clientX - r.left - r.width  / 2) / r.width ) *  16 * depth);
  };
  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }} className={className}>
      {children}
    </motion.div>
  );
}

// ── magnetic button ───────────────────────────────────────────────────────────
function MagBtn({ to, children, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} className="inline-block"
      onMouseMove={(e) => { const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width/2) * 0.3); y.set((e.clientY - r.top - r.height/2) * 0.3); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>
      <Link to={to} className={className}>{children}</Link>
    </motion.div>
  );
}

// ── count-up ──────────────────────────────────────────────────────────────────
function CountUp({ to, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let s = 0; const step = to / 55;
    const id = setInterval(() => { s += step; if (s >= to) { setN(to); clearInterval(id); } else setN(+s.toFixed(decimals)); }, 18);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// ── text scramble ─────────────────────────────────────────────────────────────
function useScramble(text, go) {
  const chars = "!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNOPQRSTUVWXYZ";
  const [d, setD] = useState(text);
  useEffect(() => {
    if (!go) return;
    let f = 0; const total = 22;
    const id = setInterval(() => {
      setD(text.split("").map((c, i) => c === " " ? " " : f / total > i / text.length ? c : chars[Math.floor(Math.random() * chars.length)]).join(""));
      f++; if (f > total + text.length) { setD(text); clearInterval(id); }
    }, 28);
    return () => clearInterval(id);
  }, [go, text]);
  return d;
}

// ── noise overlay ─────────────────────────────────────────────────────────────
const Noise = () => (
  <div className="fixed inset-0 pointer-events-none z-[9990] opacity-[0.032]"
    style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"150px" }} />
);

// ── feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    name:"Real-time Chat", icon:<MessageSquare size={18}/>, emoji:"💬",
    desc:"Private messaging powered by Socket.io — zero-latency delivery with typing indicators and read receipts.",
    bullets:["Socket.io bidirectional events","50–80 concurrent connections in testing","~150–200 messages handled per day","Instant delivery, no polling required"],
  },
  {
    name:"Posts & Reels", icon:<Play size={18}/>, emoji:"🎬",
    desc:"Share photos and short-form videos with your followers. Cloudinary handles all media processing and CDN delivery.",
    bullets:["Photo + short video support","Cloudinary signed uploads","Optimistic UI for instant feel","Smooth scroll-based reel feed"],
  },
  {
    name:"Stories", icon:<Clock size={18}/>, emoji:"⏱️",
    desc:"24-hour disappearing stories — share moments that fade, keeping the feed fresh and spontaneous.",
    bullets:["Automatic 24-hour expiry","Story ring on profile avatars","Viewer tracking per story","Sequential story playback"],
  },
  {
    name:"Notifications", icon:<Bell size={18}/>, emoji:"🔔",
    desc:"Real-time push notifications for likes, comments, follows, and messages — all delivered the instant they happen.",
    bullets:["Socket.io event-driven alerts","Like, comment, follow notifications","Notification bell with unread count","Mark all as read in one tap"],
  },
  {
    name:"Secure Auth", icon:<Lock size={18}/>, emoji:"🔐",
    desc:"JWT-based authentication with bcrypt password hashing — industry-standard security on every request.",
    bullets:["JWT access + refresh token flow","bcrypt password hashing","Protected API routes middleware","Persistent session management"],
  },
];

const TECHCARDS = [
  { icon:<Lock          className="text-secondary"/>, title:"JWT + Bcrypt",    desc:"Secure tokens and hashed passwords baked into every API request." },
  { icon:<MessageSquare className="text-success"/>,   title:"Socket.io",       desc:"Bidirectional real-time events for chat, likes, and live notifications." },
  { icon:<Cloud         className="text-info"/>,      title:"Cloudinary",      desc:"Signed uploads and optimized CDN delivery for all photos and videos." },
  { icon:<Smartphone    className="text-warning"/>,   title:"Fully Responsive",desc:"A pixel-perfect, native-feeling UI across every screen size." },
];

// ──────────────────────────────────────────────────────────────────────────────
export default function About() {
  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0,600],  [0, -110]);
  const heroOpacity = useTransform(scrollY, [0,380],  [1, 0]);

  // global mouse parallax blobs
  const mx = useMotionValue(0), my = useMotionValue(0);
  const b1x = useSpring(useTransform(mx,[0,1],[-28,28]),{stiffness:36,damping:20});
  const b1y = useSpring(useTransform(my,[0,1],[-18,18]),{stiffness:36,damping:20});
  const b2x = useSpring(useTransform(mx,[0,1],[22,-22]),{stiffness:28,damping:18});
  const b2y = useSpring(useTransform(my,[0,1],[14,-14]),{stiffness:28,damping:18});
  useEffect(() => {
    const fn = e => { mx.set(e.clientX/window.innerWidth); my.set(e.clientY/window.innerHeight); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const [go, setGo] = useState(false);
  useEffect(() => { setTimeout(() => setGo(true), 300); }, []);
  const scrambled = useScramble("Story.", go);

  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-x-hidden no-scrollbar">
      <Noise />

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <header className="relative w-full min-h-[100vh] flex flex-col lg:flex-row items-center px-6 lg:px-20 py-12 bg-base-100 overflow-hidden">
        <motion.div className="absolute top-[10%] left-[5%] w-80 h-80 bg-primary/25 blur-[100px] rounded-full pointer-events-none" style={{x:b1x,y:b1y}}/>
        <motion.div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-secondary/20 blur-[120px] rounded-full pointer-events-none" style={{x:b2x,y:b2y}}/>
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.025] text-[13vw] font-black leading-none whitespace-nowrap z-0" style={{y:heroY}}>
          VIBE MEDIA
        </motion.div>

        {/* Left */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="w-full lg:w-1/2 z-10 space-y-8 text-center lg:text-left"
          style={{ y: heroY, opacity: heroOpacity }}>

          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-base-200 rounded-full text-primary font-bold tracking-widest text-[10px] uppercase border border-base-content/5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"/>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"/>
              </span>
              MVP · Live & Active
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85]">
            Own Your <br/>
            <motion.span className="text-vibe-gradient relative inline-block" whileHover={{ scale: 1.04 }} transition={{ type:"spring", stiffness:300 }}>
              {scrambled}
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <motion.path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4"
                  initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ duration:1.3, delay:0.8, ease:"easeInOut" }}/>
              </svg>
            </motion.span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-base-content/60 max-w-lg font-medium leading-relaxed mx-auto lg:mx-0">
            A full-stack real-time social platform — posts, reels, stories, and live chat,
            all in one{" "}
            <span className="text-base-content font-bold underline decoration-primary decoration-2 underline-offset-4">solo-built</span> MERN app.
          </motion.p>

          <motion.div variants={fadeUp} className="pt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
            <MagBtn to="/signup" className="btn btn-primary btn-lg rounded-2xl font-black px-10 shadow-2xl shadow-primary/30 group">
              <span className="flex items-center gap-2">
                Join the Vibe
                <motion.span animate={{ x:[0,5,0] }} transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }}>
                  <ArrowRight size={20}/>
                </motion.span>
              </span>
            </MagBtn>
            <div className="flex -space-x-3 items-center ml-2">
              {[1,2,3,4].map(i=>(
                <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.9+i*0.1}}
                  className="w-10 h-10 rounded-full border-2 border-base-100 bg-base-300 flex items-center justify-center text-[10px] font-bold">U{i}
                </motion.div>
              ))}
              <motion.span initial={{opacity:0}} animate={{opacity:0.5}} transition={{delay:1.5}} className="pl-5 text-xs font-bold">+2k Active Creators</motion.span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right */}
        <motion.div variants={fadeRight} initial="hidden" animate="show"
          className="w-full lg:w-1/2 flex justify-center items-center mt-16 lg:mt-0 relative">
          <TiltCard depth={1.2} className="relative w-full max-w-xl">
            <div className="relative z-10 bg-base-200/50 backdrop-blur-md rounded-[3rem] p-4 border border-white/10 shadow-2xl">
              {socialAnim && <Lottie animationData={socialAnim} className="w-full h-auto drop-shadow-2xl"/>}
            </div>
            <motion.div className="absolute -top-10 -right-6 lg:-right-10 z-20 w-32 h-32 bg-base-100 rounded-3xl shadow-2xl border border-primary/20 flex items-center justify-center p-2"
              animate={{ y:[0,-12,0], rotate:[-12,-8,-12] }} transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }}>
              {hiAnim && <Lottie animationData={hiAnim} className="w-full h-full"/>}
            </motion.div>
            <motion.div className="absolute -bottom-4 -left-4 z-20 bg-success text-success-content px-4 py-2 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2"
              animate={{ y:[0,-4,0] }} transition={{ repeat:Infinity, duration:2.5, ease:"easeInOut" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-content opacity-75"/>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-content"/>
              </span>
              LIVE NOW
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-vibe-gradient opacity-20 blur-[120px] -z-10 rounded-full"/>
          </TiltCard>
        </motion.div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
          initial={{opacity:0,y:20}} animate={{opacity:0.4,y:0}} transition={{delay:2}}>
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <motion.div className="w-[1px] h-12 bg-base-content origin-top"
            animate={{ scaleY:[1,0.2,1] }} transition={{ repeat:Infinity, duration:1.6, ease:"easeInOut" }}/>
        </motion.div>
      </header>

      {/* ══ 2. TICKER ════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden bg-primary py-4 relative z-10">
        <motion.div className="flex gap-16 whitespace-nowrap text-primary-content font-black text-sm uppercase tracking-widest"
          animate={{ x:["0%","-50%"] }} transition={{ repeat:Infinity, duration:18, ease:"linear" }}>
          {Array(8).fill(["★ SOCKET.IO REALTIME","★ CLOUDINARY CDN","★ MERN STACK","★ JWT + BCRYPT","★ VERCEL · RAILWAY · RENDER","★ REELS · STORIES · CHAT"]).flat().map((t,i)=>(
            <span key={i} className="shrink-0">{t}</span>
          ))}
        </motion.div>
      </div>

      {/* ══ 3. ABOUT ═════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage:"radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize:"32px 32px" }}/>
        <div className="max-w-7xl mx-auto">
          <Section className="flex flex-col lg:flex-row gap-20 items-center">
            <motion.div variants={fadeLeft} className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-2">
                <p className="text-primary font-black uppercase tracking-widest text-xs">About the Project</p>
                <h2 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  What is <br/><span className="text-vibe-gradient">Vibe Media?</span>
                </h2>
              </div>
              <p className="text-lg text-base-content/65 leading-relaxed font-medium">
                Vibe Media is a <strong className="text-base-content">full-stack real-time social platform</strong> designed to deliver a seamless,
                low-latency experience across every device. It combines posts, reels, stories, and private messaging
                into a single cohesive app — focusing on instant interaction and smooth performance.
              </p>
              <p className="text-lg text-base-content/65 leading-relaxed font-medium">
                Built entirely as a <strong className="text-base-content">solo project</strong>, it reflects a strong emphasis on real-world system design,
                real-time communication, and efficient media handling. Currently in{" "}
                <span className="badge badge-warning badge-sm font-bold py-2 mx-1">MVP</span>{" "}
                stage — live in testing with continuous improvements planned.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {["React","Node.js","Express","MongoDB","Socket.io","Cloudinary","Tailwind","JWT"].map(tag=>(
                  <span key={tag} className="badge badge-outline badge-lg font-bold px-4 py-3 hover:badge-primary transition-colors duration-300">{tag}</span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeRight} className="w-full lg:w-1/2">
              <TiltCard depth={0.9}>
                <div className="bg-base-200 rounded-[2.5rem] p-8 space-y-5 border border-base-content/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full"/>
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Project Snapshot</p>
                  {[
                    { label:"Type",        value:"Full-Stack Social Platform" },
                    { label:"Built By",    value:"Manish Bhunia (Solo)" },
                    { label:"Stage",       value:"MVP — Active Testing" },
                    { label:"Daily Load",  value:"~150–200 msgs / day" },
                    { label:"Concurrent",  value:"50–80 live connections" },
                    { label:"Deployed On", value:"Vercel · Railway · Render" },
                  ].map(({label,value},i)=>(
                    <motion.div key={label}
                      initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}}
                      transition={{delay:i*0.08,ease:[0.22,1,0.36,1],duration:0.55}} viewport={{once:true}}
                      className="flex items-center justify-between border-b border-base-content/[0.08] pb-4 last:border-0 last:pb-0">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-40">{label}</span>
                      <span className="font-black text-sm">{value}</span>
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ══ 4. STATS ═════════════════════════════════════════════════════════ */}
      <section className="bg-base-200 py-20 px-6 lg:px-20 relative overflow-hidden">
        <motion.div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"
          animate={{ scale:[1,1.1,1] }} transition={{ repeat:Infinity, duration:5, ease:"easeInOut" }}/>
        <Section>
          <motion.p variants={fadeUp} className="text-center text-xs font-black uppercase tracking-widest text-primary mb-3">By the numbers</motion.p>
          <motion.h3 variants={fadeUp} className="text-center text-4xl lg:text-5xl font-black mb-16">Real performance. Real scale.</motion.h3>
          <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { n:2000, s:"+",  label:"Active Creators",        icon:<Users size={20}/> },
              { n:200,  s:"/d", label:"Messages Per Day",        icon:<MessageSquare size={20}/> },
              { n:80,   s:"",   label:"Concurrent Connections",  icon:<Activity size={20}/> },
              { n:99,   s:"%",  label:"Uptime (Testing)",        icon:<Zap size={20}/> },
            ].map(({n,s,label,icon})=>(
              <motion.div key={label} variants={fadeUp} className="text-center group">
                <div className="inline-flex w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300 mx-auto">
                  {icon}
                </div>
                <div className="text-5xl lg:text-6xl font-black text-vibe-gradient tabular-nums">
                  <CountUp to={n} suffix={s}/>
                </div>
                <p className="text-xs uppercase tracking-widest opacity-45 mt-2 font-bold">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ══ 5. FEATURE TABS ══════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-primary font-black uppercase tracking-widest text-xs mb-2">Platform Features</p>
              <h3 className="text-4xl lg:text-5xl font-black">Everything you need.<br/>Nothing you don't.</h3>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-12">
              {FEATURES.map((f,i)=>(
                <button key={i} onClick={()=>setActiveFeature(i)}
                  className={`px-5 py-3 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2
                    ${activeFeature===i ? "bg-primary text-primary-content shadow-lg shadow-primary/30 scale-105" : "bg-base-200 hover:bg-base-300 opacity-60 hover:opacity-100"}`}>
                  {f.icon} {f.name}
                </button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity:0, y:30, filter:"blur(8px)" }}
                animate={{ opacity:1, y:0,  filter:"blur(0px)" }}
                exit={{    opacity:0, y:-20, filter:"blur(8px)" }}
                transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
                className="bg-base-200 rounded-[2.5rem] p-8 lg:p-12 border border-base-content/5 shadow-xl">
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                  <div className="flex-1 space-y-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-2xl">{FEATURES[activeFeature].icon}</div>
                    <h4 className="text-3xl font-black">{FEATURES[activeFeature].name}</h4>
                    <p className="text-base-content/60 text-lg leading-relaxed font-medium">{FEATURES[activeFeature].desc}</p>
                    <ul className="space-y-3">
                      {FEATURES[activeFeature].bullets.map((b,i)=>(
                        <motion.li key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                          className="flex items-start gap-3 text-sm font-medium">
                          <span className="text-primary mt-0.5 shrink-0">→</span>{b}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  {/* ── SLOT_2: replace placeholder with <img src={appMockup} className="w-full max-w-xs rounded-[2rem] shadow-xl" alt="mockup" /> ── */}
                  <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-xs aspect-[9/16] bg-base-300 rounded-[2rem] flex items-center justify-center border border-base-content/10 shadow-inner relative overflow-hidden">
                      <motion.div className="absolute inset-0 bg-vibe-gradient opacity-10"
                        animate={{ opacity:[0.05,0.18,0.05] }} transition={{ repeat:Infinity, duration:3, ease:"easeInOut" }}/>
                      <div className="text-center opacity-30 space-y-2 z-10">
                        <div className="text-5xl">{FEATURES[activeFeature].emoji}</div>
                        <p className="text-[10px] font-bold uppercase tracking-wider">App mockup<br/>(SLOT_2)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Section>
        </div>
      </section>

      {/* ══ 6. CREATIVE FREEDOM ══════════════════════════════════════════════ */}
      <section className="bg-base-300 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage:"radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize:"32px 32px" }}/>
        <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-16">
          <Section className="w-full lg:w-1/2">
            <motion.div variants={fadeLeft} className="lg:-rotate-2">
              <TiltCard depth={0.8}>
                <div className="bg-base-100 p-4 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
                  {influencerAnim && <Lottie animationData={influencerAnim} className="w-full h-auto rounded-[2rem]"/>}
                  <motion.img src={funnySocialGif} className="absolute bottom-4 right-4 w-24 h-24 rounded-xl border-2 border-white shadow-lg" alt="vibe"
                    animate={{ rotate:[12,6,12], scale:[1,1.05,1] }} transition={{ repeat:Infinity, duration:3, ease:"easeInOut" }}/>
                </div>
              </TiltCard>
            </motion.div>
          </Section>
          <Section className="w-full lg:w-1/2 space-y-6">
            <motion.h3 variants={fadeRight} className="text-5xl font-black leading-tight">
              Create Without <br/><span className="italic font-serif text-primary">Boundaries.</span>
            </motion.h3>
            <motion.p variants={fadeRight} className="text-lg text-base-content/60 font-medium leading-relaxed">
              The RESTful API is designed for zero friction — secure CRUD, optimistic UI updates for instant feel,
              and Cloudinary signed uploads so your media is always safe and fast on CDN.
            </motion.p>
            <motion.div variants={fadeRight} className="grid grid-cols-2 gap-4">
              {[
                { icon:<Cloud size={18}/>, label:"Cloudinary CDN" },
                { icon:<Zap   size={18}/>, label:"Optimistic UI" },
                { icon:<Lock  size={18}/>, label:"Signed Uploads" },
                { icon:<Globe size={18}/>, label:"Multi-device" },
              ].map(({icon,label})=>(
                <div key={label} className="flex items-center gap-3 p-4 bg-base-100 rounded-2xl border border-base-content/5 shadow-sm font-bold text-sm">
                  <span className="text-primary">{icon}</span>{label}
                </div>
              ))}
            </motion.div>
          </Section>
        </div>
      </section>

      {/* ══ 7. TECH STACK GRID ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-20">
        <Section>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-primary font-black uppercase tracking-widest text-xs mb-2">The Stack</p>
            <h3 className="text-4xl lg:text-5xl font-black">Performance is our Vibe.</h3>
          </motion.div>
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {TECHCARDS.map(c=>(
              <motion.div key={c.title} variants={fadeUp}><FeatureBox {...c}/></motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ══ 8. DEPLOYMENT STRIP ══════════════════════════════════════════════ */}
      <section className="py-16 px-6 lg:px-20 bg-base-200">
        <Section>
          <motion.div variants={fadeUp} className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Deployed On</p>
            <h4 className="text-3xl font-black">Production-grade infrastructure.</h4>
          </motion.div>
          <motion.div variants={stagger} className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {[
              { name:"Vercel",       desc:"Frontend hosting",  color:"text-base-content" },
              { name:"Railway",      desc:"Backend server",    color:"text-purple-500" },
              { name:"Render",       desc:"Socket server",     color:"text-green-500" },
              { name:"MongoDB Atlas",desc:"Cloud database",    color:"text-emerald-500" },
              { name:"Cloudinary",   desc:"Media CDN",         color:"text-blue-500" },
            ].map(({name,desc,color})=>(
              <motion.div key={name} variants={fadeUp} whileHover={{ y:-6, scale:1.04 }} transition={{ type:"spring", stiffness:300 }}
                className="px-6 py-5 bg-base-100 rounded-2xl border border-base-content/5 shadow-md text-center min-w-[140px]">
                <p className={`font-black text-lg ${color}`}>{name}</p>
                <p className="text-xs opacity-40 font-medium mt-1">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ══ 9. LIFE → SOCIAL ═════════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-20 flex flex-col items-center">
        <Section className="max-w-5xl w-full">
          <motion.div variants={fadeUp}
            className="bg-base-100 rounded-[4rem] p-10 lg:p-16 border border-base-content/5 flex flex-col lg:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 left-10">
              {catAnim && (
                <motion.div animate={{ x:[0,60,0] }} transition={{ repeat:Infinity, duration:4, ease:"easeInOut" }}>
                  <Lottie animationData={catAnim} className="w-20 h-20"/>
                </motion.div>
              )}
            </div>
            <motion.div className="absolute inset-0 bg-primary/5 rounded-[4rem] pointer-events-none"
              animate={{ opacity:[0,0.3,0] }} transition={{ repeat:Infinity, duration:4, ease:"easeInOut" }}/>
            <div className="flex-1 space-y-4 relative z-10">
              <h4 className="text-4xl font-black italic">Life to Social Life.</h4>
              <p className="text-base-content/60 font-medium text-lg leading-relaxed">
                We bridge the gap between reality and digital expression. Socket.io events, signed media uploads,
                JWT sessions — the backend handles the heavy lifting so you can focus entirely on the vibe.
              </p>
              <div className="badge badge-outline p-4 font-bold opacity-50 uppercase tracking-tighter">~50ms API Response</div>
            </div>
            <div className="flex-1 w-full flex justify-center relative z-10">
              <TiltCard depth={1.5} className="relative group w-full max-w-sm">
                <div className="absolute inset-0 bg-vibe-gradient opacity-20 blur-2xl group-hover:opacity-40 transition-opacity rounded-3xl"/>
                <motion.img src={socialLifeGif} alt="Social Flow" className="w-full rounded-3xl shadow-xl relative z-10"
                  whileHover={{ scale:1.04 }} transition={{ type:"spring", stiffness:300 }}/>
              </TiltCard>
            </div>
          </motion.div>
        </Section>
      </section>

      {/* ══ 10. BUILT BY ═════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-20 bg-base-200 relative overflow-hidden">
        <motion.div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none"/>
        <Section>
          <motion.div variants={fadeUp} className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <img src={avatarPhoto} className="w-48 h-48 rounded-full object-cover border-4 border-primary/30 shadow-2xl shrink-0" alt="Manish Bhunia" />
           

            <motion.div variants={fadeRight} className="space-y-5 text-center lg:text-left">
              <div>
                <p className="text-primary font-black uppercase tracking-widest text-xs mb-1">Solo Builder</p>
                <h3 className="text-4xl font-black">Manish Bhunia</h3>
                <p className="text-base-content/50 font-medium mt-1">Full-Stack MERN Developer</p>
              </div>
              <p className="text-lg text-base-content/65 leading-relaxed font-medium max-w-xl">
                Vibe Media is a complete solo build — from database schema to deployed infrastructure. Every line of code,
                every design decision, every Socket.io event was crafted with the goal of shipping a{" "}
                <strong className="text-base-content">real-world product</strong>, not just a portfolio piece.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {["System Design","Real-time Architecture","UI/UX","DevOps"].map(s=>(
                  <span key={s} className="badge badge-outline badge-lg font-bold px-4 py-3">{s}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Section>
      </section>

      {/* ══ 11. TESTIMONIAL MARQUEE ══════════════════════════════════════════ */}
      <section className="py-16 overflow-hidden bg-base-100 relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-base-100 to-transparent z-10"/>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-base-100 to-transparent z-10"/>
        <motion.div className="flex gap-10 whitespace-nowrap"
          animate={{ x:["-50%","0%"] }} transition={{ repeat:Infinity, duration:22, ease:"linear" }}>
          {Array(2).fill([
            { t:"Real-time feels instant. Impressive.",    a:"— Riya M." },
            { t:"The UI is fire — clean and blazing fast.", a:"— Dev K." },
            { t:"Stories + chat in one app? Love it.",     a:"— Arjun S." },
            { t:"The vibe is genuinely unmatched.",        a:"— Priya R." },
            { t:"Feels like a real production product.",   a:"— Sam W." },
            { t:"Socket.io integration is seamless.",      a:"— Neha T." },
          ]).flat().map((q,i)=>(
            <div key={i} className="shrink-0 flex items-center gap-4 px-8 py-4 bg-base-200 rounded-2xl shadow-sm border border-base-content/5">
              <div className="text-primary text-lg">★★★★★</div>
              <div>
                <p className="font-bold text-sm">{q.t}</p>
                <p className="text-xs opacity-40 font-medium mt-1">{q.a}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══ 12. FOOTER CTA ═══════════════════════════════════════════════════ */}
      <section className="h-screen bg-vibe-gradient flex flex-col items-center justify-center text-white text-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src={funnySocialGif} className="w-full h-full object-cover mix-blend-overlay grayscale" alt="bg"/>
        </div>
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130vmin] h-[130vmin] rounded-full border border-white/8 pointer-events-none"
          animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:30, ease:"linear" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full -translate-y-1/2"/>
        </motion.div>
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vmin] h-[80vmin] rounded-full border border-white/5 pointer-events-none"
          animate={{ rotate:-360 }} transition={{ repeat:Infinity, duration:20, ease:"linear" }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full translate-y-1/2"/>
        </motion.div>

        <Section className="z-10">
          <motion.div variants={fadeUp}><Sparkles size={80} className="text-warning mb-6 mx-auto animate-pulse"/></motion.div>
          <motion.h2 variants={fadeUp} className="text-7xl md:text-9xl font-black tracking-tighter mb-4 leading-none">VIBE <br/> NOW.</motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 text-lg font-medium mb-10 max-w-md mx-auto">
            Join the next-gen social platform. Real-time. Secure. Yours.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-6 flex-wrap justify-center">
            <MagBtn to="/signup" className="btn btn-white btn-lg px-12 rounded-full font-black text-primary hover:scale-110 transition-transform">Get Started</MagBtn>
            <MagBtn to="/login"  className="btn btn-ghost btn-lg text-white border-white rounded-full px-12">Login</MagBtn>
          </motion.div>
        </Section>

        <footer className="absolute bottom-10 w-full px-10 flex flex-col lg:flex-row justify-between items-center gap-4 opacity-70 text-[10px] font-bold uppercase tracking-[0.3em]">
          <p>© 2026 MANISH BHUNIA — MERN STACK CREATOR</p>
          <div className="flex gap-6"><span>SOCKET.IO</span><span>JWT AUTH</span><span>CLOUDINARY</span></div>
        </footer>
      </section>
    </div>
  );
}

// ── FEATURE BOX ───────────────────────────────────────────────────────────────
function FeatureBox({ icon, title, desc }) {
  return (
    <motion.div
      className="p-8 bg-base-200/50 hover:bg-base-100 rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all duration-500 group relative overflow-hidden"
      whileHover={{ y:-8, scale:1.02 }} transition={{ type:"spring", stiffness:300, damping:20 }}>
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{ background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.05) 50%,transparent 60%)", backgroundSize:"200% 100%" }}
        animate={{ backgroundPositionX:["-100%","200%"] }} transition={{ duration:1.2, ease:"easeInOut", repeat:Infinity, repeatDelay:0.5 }}/>
      <motion.div className="w-16 h-16 bg-base-100 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:bg-primary group-hover:text-primary-content transition-all duration-500"
        whileHover={{ rotate:[0,-8,8,0] }} transition={{ duration:0.4 }}>
        {icon}
      </motion.div>
      <h4 className="text-2xl font-black mb-2 tracking-tight">{title}</h4>
      <p className="text-sm text-base-content/50 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}