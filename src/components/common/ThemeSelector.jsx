import { useTheme } from "../../context/ThemeContext.jsx";
import { Palette, Check } from "lucide-react";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  // Gen-Z "Vibe" Mapping
  const getGenZVibe = (val) => {
    const vibes = {
      light: "Clean",
      dark: "Midnight",
      cupcake: "Soft",
      bumblebee: "Electric",
      emerald: "Nature",
      corporate: "Office",
      synthwave: "Neon",
      retro: "Vintage",
      cyberpunk: "Glitch",
      valentine: "Love",
      halloween: "Spooky",
      garden: "Zen",
      forest: "Deep",
      aqua: "Ocean",
      lofi: "Chill",
      pastel: "Candy",
      fantasy: "Magic",
      wireframe: "Draft",
      black: "Void",
      luxury: "Rich",
      dracula: "Vamp",
      cmyk: "Print",
      autumn: "Cozy",
      business: "Suit",
      acid: "Toxic",
      lemonade: "Sour",
      night: "Shadow",
      coffee: "Caffeine",
      winter: "Cold",
      dim: "Muted",
      nord: "Arctic",
      sunset: "Golden"
    };
    return vibes[val] || val;
  };

  const themeOptions = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", 
    "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", 
    "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", 
    "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", 
    "winter", "dim", "nord", "sunset"
  ];

  return (
    <div className="dropdown dropdown-end">
      {/* Trigger Button - Responsive Labeling */}
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-ghost hover:bg-base-200 transition-all duration-300 gap-2 px-2 md:px-4 rounded-xl border border-transparent hover:border-primary/20"
      >
        <div className="relative">
          <Palette className="w-5 h-5 text-primary" />
         
        </div>
        
       
      </div>

      {/* Dropdown Panel - Responsive Width & Height */}
      <div
        tabIndex={0}
        className="dropdown-content z-[50] mt-4 p-3 shadow-2xl bg-base-200/90 backdrop-blur-md text-base-content rounded-[2rem] w-[85vw] sm:w-80 max-h-[60vh] overflow-y-auto border border-white/10 ring-1 ring-black/5"
      >
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <h3 className="font-black italic text-lg tracking-tighter">SELECT VIBE</h3>
            <span className="badge badge-primary badge-sm font-bold uppercase text-[8px]">{themeOptions.length} Flavors</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {themeOptions.map((val) => (
            <button
              key={val}
              className={`group overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 ${
                theme === val ? "ring-2 ring-primary ring-offset-2 ring-offset-base-200" : ""
              }`}
              data-theme={val}
              onClick={() => setTheme(val)}
            >
              <div className="bg-base-100 text-base-content w-full cursor-pointer py-3 px-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Active Checkmark */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${theme === val ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                        {theme === val ? <Check className="w-3 h-3" strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-base-content/20" />}
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-tight leading-none">
                        {getGenZVibe(val)}
                        </span>
                        <span className="text-[10px] opacity-40 font-bold uppercase">{val}</span>
                    </div>
                  </div>

                  {/* Color Swatch Pill */}
                  <div className="flex gap-1 bg-base-200 p-1.5 rounded-full shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}