import {
  Loader2,
  Maximize, Minimize, Pause, Play,
  RotateCcw,
  Volume2, VolumeX
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";


export default function VideoPlayer({ src, className = "", poster = "" }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  const controlsTimeoutRef = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hasEnded) {
      video.currentTime = 0;
      setHasEnded(false);
    }

    if (video.paused) {
      video.play().catch(console.error);
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [hasEnded]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    video.muted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const handleTimelineMouseDown = (e) => {
    setIsDragging(true);
    updateTimelinePosition(e);
  };

  const updateTimelinePosition = (e) => {
    const video = videoRef.current;
    const timeline = timelineRef.current;
    if (!video || !timeline) return;

    const rect = timeline.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width;

    setProgress(percent * 100);
    setCurrentTime(percent * video.duration);
    video.currentTime = percent * video.duration;
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (isDragging) updateTimelinePosition(e);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'arrowright':
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'arrowleft':
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
      }
      showControlsTemporarily();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasEnded(true);
      setShowControls(true);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handleCanPlay);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    const playVideo = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        setIsPlaying(false);
      }
    };
    playVideo();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(video);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handleCanPlay);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      observer.disconnect();
    };
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isDragging) return;

    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(currentProgress);
    setCurrentTime(video.currentTime);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (!videoRef.current?.paused) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <div
      ref={containerRef}
      // UPDATE 1: Added max-h-[80vh] and aspect-video to container
      // This prevents the player from becoming taller than the screen
      className={`relative group bg-black overflow-hidden flex items-center justify-center ${className} ${isFullscreen ? "w-full h-full" : "w-full aspect-video max-h-[80vh] rounded-xl shadow-2xl"
        }`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => !videoRef.current?.paused && setShowControls(false)}
      onClick={() => {
        if (!showControls) showControlsTemporarily();
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        // UPDATE 2: Changed to 'object-contain'
        // This ensures the full video is always seen, adding black bars if needed
        className="w-full h-full object-contain"
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onClick={togglePlayPause}
        onDoubleClick={toggleFullscreen}
      />

      {/* Loading Spinner */}
      {isLoading && !hasEnded && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-lg" />
        </div>
      )}

      {/* Play/Replay Button */}
      {(!isPlaying && !isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10 animate-in fade-in duration-200">
          <button
            onClick={togglePlayPause}
            className="group/btn w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-xl"
          >
            {hasEnded ? (
              <RotateCcw className="w-8 h-8 text-white group-hover/btn:text-black transition-colors" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1 group-hover/btn:text-black transition-colors" fill="currentColor" />
            )}
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-2 px-4 transition-all duration-300 z-30 ${showControls || !isPlaying || isDragging ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <div
          className="relative h-1.5 w-full cursor-pointer group/timeline py-2"
          onMouseDown={handleTimelineMouseDown}
          ref={timelineRef}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden"></div>
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg transform transition-transform duration-100 ${isDragging || showControls ? "scale-100" : "scale-0"
              }`}
            style={{ left: `${progress}%`, marginLeft: '-6px' }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 select-none">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="text-white/90 hover:text-white hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="text-white/90 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-out">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-white bg-white/30 rounded-lg cursor-pointer appearance-none outline-none"
                />
              </div>
            </div>

            <div className="text-xs text-white/80 font-mono tracking-wider">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="text-white/90 hover:text-white hover:scale-110 transition-transform"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}