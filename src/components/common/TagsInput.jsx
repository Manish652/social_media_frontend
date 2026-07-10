import { useState, useEffect, useRef } from "react";
import { X, Hash } from "lucide-react";
import api from "../../api/axios.js";

export default function TagsInput({ value, onChange, placeholder = "Add tags..." }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Fetch trending tags for suggestions
    api.get("/search/trending")
      .then((res) => {
        if (res.data?.success) {
          setSuggestions(res.data.tags.map(t => t.tag));
        }
      })
      .catch(console.error);
  }, []);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = (tag) => {
    const cleanTag = tag.trim().replace(/^#/, "");
    if (cleanTag && !value.includes(cleanTag)) {
      onChange([...value, cleanTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="min-h-[56px] w-full bg-base-200 border border-base-300 rounded-2xl px-4 py-2 flex flex-wrap gap-2 items-center focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
        {value.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-sm font-medium animate-fadeIn"
          >
            <Hash size={14} />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none min-w-[120px] text-sm text-base-content placeholder:text-base-content/40 py-1 m-0 p-0 shadow-none"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (inputValue || suggestions.length > 0) && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-2xl shadow-xl overflow-hidden animate-fadeInUp">
          <div className="p-2">
            <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest px-3 py-2">
              {inputValue ? "Suggestions" : "Trending Tags"}
            </p>
            <ul className="space-y-1">
              {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => addTag(suggestion)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-base-200 text-sm font-medium text-base-content transition-colors flex items-center gap-2"
                  >
                    <span className="text-primary bg-primary/10 p-1.5 rounded-lg"><Hash size={14} /></span>
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
