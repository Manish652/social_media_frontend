import React from 'react';
import Lottie from 'lottie-react';

const PostUploadProgress = ({ uploadProgress, runningCat }) => {
  if (!uploadProgress) return null;

  return (
   <div className="w-full px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress container */}
        <div className="relative w-full h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 p-4 shadow-sm">
          
          {/* Animated background shimmer */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>

          {/* Road track */}
          <div className="relative w-full h-full flex items-center">
            {/* Progress bar background */}
            <div className="absolute left-0 right-0 h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
              {/* Animated progress fill */}
              <div 
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-full transition-all duration-300 shadow-lg"
                style={{ 
                  width: `${Math.min(100, parseInt(uploadProgress) || 0)}%`,
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                }}
              />
            </div>

            {/* Running cat container */}
            <div className="absolute z-10 w-full h-full left-0 top-0">
              <div className="relative w-full h-full animate-cat-run">
                <div className="absolute top-1/2 -translate-y-1/2">
                  {/* Glow effect behind cat */}
                  <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl animate-pulse" />
                  
                  {/* Cat animation */}
                  <Lottie
                    animationData={runningCat}
                    loop
                    className="w-16 h-16 relative z-10 drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress text and percentage */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600 animate-fade-in">
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
              {uploadProgress}
            </span>     
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostUploadProgress;