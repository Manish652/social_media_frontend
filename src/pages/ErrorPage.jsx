import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { Home, ArrowLeft, RefreshCcw } from "lucide-react";

<<<<<<< HEAD
=======
// You can use any 404 / Error Lottie JSON here
// Suggestion: https://lottiefiles.com/animations/404-astronaut-Lp79Vf0vM9
>>>>>>> 4bd4cdd5bb72c68fb8c5b04b6dc216d8ceb7235f
import errorAnimation from "../assets/animations/Error 404.json";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-6 overflow-hidden relative">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="max-w-2xl w-full text-center z-10">
        
        {/* Lottie Animation Container */}
        <div className="w-full max-w-md mx-auto mb-8 transform hover:scale-105 transition-transform duration-500">
          <Lottie 
            animationData={errorAnimation} 
            loop={true} 
            className="drop-shadow-[0_0_50px_rgba(168,85,247,0.4)]"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-4 animate-fadeInUp">
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter">
            4<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">0</span>4
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-200">
            Lost in the Vibe-space?
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg">
            The page you're looking for has drifted into another galaxy. Let's get you back to the signal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp delay-200">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-[0_10px_40px_rgba(124,58,237,0.3)] hover:shadow-purple-500/40 hover:scale-105 transition-all active:scale-95"
          >
            <Home size={20} />
            Teleport Home
          </button>
        </div>

        {/* Refresh Link */}
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 text-slate-500 hover:text-purple-400 flex items-center gap-2 mx-auto transition-colors text-sm font-medium"
        >
          <RefreshCcw size={14} />
          Try refreshing the page
        </button>
      </div>

      {/* Floating Particles (Optional CSS Animation) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-float"
            style={{
              width: Math.random() * 4 + 'px',
              height: Math.random() * 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: (Math.random() * 5 + 5) + 's',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}