import React from "react";
import InputEmoji from "react-input-emoji";

const VibeInputEditor = ({
  value,
  onChange,
  placeholder = "What's happening?",
  height = "150px",
  width = "100%",
  fontSize = 18,
  borderRadius = 24,
  borderHidden = false, // New Prop
}) => {
  return (
    <div 
      className={`vibe-editor-container ${borderHidden ? 'border-none-mode' : ''}`}
      style={{ 
        "--custom-height": height, 
        "--custom-width": width 
      }}
    >
      <InputEmoji
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme="auto"
        fontSize={fontSize}
        fontFamily="inherit"
        borderRadius={borderRadius}
        background="transparent" // Set to transparent for that clean look
        borderColor={borderHidden ? "transparent" : "var(--b3)"} 
      />

      <style>{`
        .vibe-editor-container {
          width: var(--custom-width) !important;
        }

        /* Hide borders and shadows if borderHidden is true */
        .border-none-mode .react-input-emoji--wrapper {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .vibe-editor-container .react-input-emoji--container {
          min-height: var(--custom-height) !important;
          align-items: flex-start !important;
          padding-top: 10px !important;
        }

        .vibe-editor-container .react-input-emoji--input {
          min-height: calc(var(--custom-height) - 30px) !important;
          max-height: 400px;
          overflow-y: auto !important;
          /* Remove the inner focus border/outline */
          outline: none !important; 
        }

        .vibe-editor-container .react-input-emoji--button {
          margin-top: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default VibeInputEditor;