import { useState } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";

// --- Assets ---
import socialAnim from "../assets/animations/Social Networking.json";
import influencerAnim from "../assets/animations/Influencer photoshoot.json";
import hiAnim from "../assets/animations/hi.json";
import catAnim from "../assets/animations/Running Cat.json";

// --- New GIF Assets (Standard <img> tags) ---
import socialLifeGif from "../assets/animations/lifetosiciallife.gif";
import funnySocialGif from "../assets/animations/funnysocialmedia.gif";

import { 
  Zap, Sparkles, Filter, Smile, Users, Heart, 
  ShieldCheck, ArrowRight, Smartphone, Lock, Layout 
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-x-hidden no-scrollbar">
      
      {/* 1. HERO SECTION */}
  {/* 1. HERO SECTION: Welcome & Social Networking */}
      <header className="relative w-full min-h-[90vh] flex flex-col lg:flex-row items-center px-6 lg:px-20 py-12 bg-base-100 overflow-hidden">
        
        {/* HUGE BACKGROUND TEXT (Watermark Style) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  select-none pointer-events-none opacity-[0.03] text-[10vw] font-black leading-none whitespace-nowrap z-0">
          <p className="text-shadow-lg/30">VIBE MEDIA</p>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-[15%] left-[10%] w-32 h-32 bg-primary/20 blur-[60px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-secondary/20 blur-[80px] rounded-full animate-pulse delay-700"></div>

        <div className="w-full lg:w-1/2 z-10 space-y-8 text-center lg:text-left">
          {/* Tagline with Icon */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-base-200 rounded-full text-primary font-bold tracking-widest text-[10px] uppercase border border-base-content/5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The Next Gen Social Ecosystem
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85]">
            Own Your <br />
            <span className="text-vibe-gradient relative">
              Story.
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-base-content/60 max-w-lg font-medium leading-relaxed mx-auto lg:mx-0">
            A high-performance MERN playground. Secure, intentional, and built for the <span className="text-base-content font-bold underline decoration-primary decoration-2 underline-offset-4">creators of tomorrow.</span>
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
             <Link to="/signup" className="btn btn-primary btn-lg rounded-2xl font-black px-10 shadow-2xl shadow-primary/30 group">
                Join the Vibe 
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </Link>
             <div className="flex -space-x-3 items-center ml-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-base-100 bg-base-300 flex items-center justify-center text-[10px] font-bold">
                    User{i}
                  </div>
                ))}
                <span className="pl-5 text-xs font-bold opacity-50">+2k Active Creators</span>
             </div>
          </div>
        </div>

        {/* Visual Side: Multi-layered Animation */}
        <div className="w-full lg:w-1/2 flex justify-center items-center mt-16 lg:mt-0 relative">
          <div className="relative w-full max-w-xl group">
            
            {/* The Main Animation Card */}
            <div className="relative z-10 bg-base-200/50 backdrop-blur-md rounded-[3rem] p-4 border border-white/10 shadow-2xl rotate-2 group-hover:rotate-0 transition-all duration-700">
               {socialAnim && <Lottie animationData={socialAnim} className="w-full h-auto drop-shadow-2xl" />}
            </div>

            {/* Floating Mini-Card (Add your hi.json here) */}
            <div className="absolute -top-10 -right-6 lg:-right-10 z-20 w-32 h-32 bg-base-100 rounded-3xl shadow-2xl border border-primary/20 flex items-center justify-center p-2 -rotate-12 animate-bounce-slow">
               {hiAnim && <Lottie animationData={hiAnim} className="w-full h-full" />}
            </div>

        

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-vibe-gradient opacity-20 blur-[120px] -z-10"></div>
          </div>
        </div>
      </header>

      {/* 2. TECH FEATURES GRID */}
      <section className="py-24 px-6 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-vibe-gradient text-sm font-bold uppercase tracking-widest mb-2">The Stack</h2>
          <h3 className="text-4xl lg:text-5xl font-black">Performance is our Vibe.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <FeatureBox icon={<Lock className="text-secondary" />} title="Secure JWT" desc="Industry-standard authentication flow." />
          <FeatureBox icon={<ShieldCheck className="text-success" />} title="Bcrypt Safe" desc="End-to-end password encryption." />
          <FeatureBox icon={<Layout className="text-info" />} title="React UI" desc="Lightning-fast state management." />
          <FeatureBox icon={<Smartphone className="text-warning" />} title="Fully Responsive" desc="A pixel-perfect experience everywhere." />
        </div>
      </section>

      {/* 3. CREATIVE FREEDOM (Using Influencer Anim) */}
      <section className="bg-base-300 py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 transform lg:-rotate-2">
            <div className="bg-base-100 p-4 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
               {influencerAnim && <Lottie animationData={influencerAnim} className="w-full h-auto rounded-[2rem]" />}
               {/* Overlay GIF for that chaotic Gen Z energy */}
               <img src={funnySocialGif} className="absolute bottom-4 right-4 w-24 h-24 rounded-xl rotate-12 border-2 border-white shadow-lg" alt="vibe" />
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 space-y-6">
            <h3 className="text-5xl font-black leading-tight">
              Create Without <br />
              <span className="italic font-serif text-primary">Boundaries.</span>
            </h3>
            <p className="text-lg text-base-content/60 font-medium leading-relaxed">
              Our RESTful API structure ensures your content is delivered with zero friction. From secure CRUD operations to role-based access, we give you the keys to your community.
            </p>
            <div className="flex items-center gap-4 p-4 bg-base-100 rounded-3xl border border-base-content/5 shadow-sm">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">V</div>
               <p className="font-bold text-sm">Validated Environment-based config.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPEED SECTION (Replaced Broken Car with GIF) */}
      <section className="py-24 px-6 lg:px-20 flex flex-col items-center">
        <div className="max-w-5xl w-full bg-base-100 rounded-[4rem] p-10 lg:p-16 border border-base-content/5 flex flex-col lg:flex-row items-center gap-10 shadow-2xl relative">
          <div className="absolute top-4 left-10">
             {catAnim && <Lottie animationData={catAnim} className="w-20 h-20" />}
          </div>
          
          <div className="flex-1 space-y-4">
            <h4 className="text-4xl font-black italic">Life to Social Life.</h4>
            <p className="text-base-content/60 font-medium text-lg leading-relaxed">
              We bridge the gap between reality and digital expression. Our backend handles the heavy lifting so you can focus on the vibe.
            </p>
            <div className="badge badge-outline p-4 font-bold opacity-50 uppercase tracking-tighter">Fast API Response</div>
          </div>

          <div className="flex-1 w-full flex justify-center">
            <div className="relative group">
               <div className="absolute inset-0 bg-vibe-gradient opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
               <img 
                 src={socialLifeGif} 
                 alt="Social Flow" 
                 className="w-full max-w-sm rounded-3xl shadow-xl relative z-10 transform group-hover:scale-[1.02] transition-transform duration-500"
               />
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMMERSIVE FOOTER CTA */}
      <section className="h-screen bg-vibe-gradient flex flex-col items-center justify-center text-white text-center p-6 relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <img src={funnySocialGif} className="w-full h-full object-cover mix-blend-overlay grayscale" alt="bg" />
        </div>

        <div className="z-10">
          <Sparkles size={80} className="text-warning mb-6 mx-auto animate-pulse" />
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-none">VIBE <br/> NOW.</h2>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link to="/signup" className="btn btn-white btn-lg px-12 rounded-full font-black text-primary hover:scale-110 transition-transform">Get Started</Link>
            <Link to="/login" className="btn btn-ghost btn-lg text-white border-white rounded-full px-12">Login</Link>
          </div>
        </div>
        
        <footer className="absolute bottom-10 w-full px-10 flex flex-col lg:flex-row justify-between items-center gap-4 opacity-70 text-[10px] font-bold uppercase tracking-[0.3em]">
           <p>© 2026 MANISH BHUNIA - MERN STACK CREATOR</p>
           <div className="flex gap-6">
             <span>SECURE API</span>
             <span>JWT AUTH</span>
             <span>REACT FRONTEND</span>
           </div>
        </footer>
      </section>
    </div>
  );
}

function FeatureBox({ icon, title, desc }) {
  return (
    <div className="p-8 bg-base-200/50 hover:bg-base-100 rounded-[2.5rem] border border-transparent hover:border-primary/20 transition-all duration-500 group cursor-default">
      <div className="w-16 h-16 bg-base-100 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-content transition-all duration-500">
        {icon}
      </div>
      <h4 className="text-2xl font-black mb-2 tracking-tight">{title}</h4>
      <p className="text-sm text-base-content/50 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}