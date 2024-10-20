// src/VideoPlayer.js

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import dashjs from "dashjs";

export const VideoPlayer = ({
  hlsUrl,
  dashUrl,
  type,
}: {
  hlsUrl: string;
  dashUrl: string;
  type: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // Volume ranges from 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // State to track mute/unmute
  const [isLoading, setIsLoading] = useState(false); // State to track loading/buffering
  const [hls, setHls] = useState<Hls | null>(null);
  const [dashPlayer, setDashPlayer] = useState<dashjs.MediaPlayerClass | null>(
    null
  );

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      if (type === "hls" && Hls.isSupported()) {
        const hlsInstance = new Hls();
        hlsInstance.loadSource(hlsUrl);
        hlsInstance.attachMedia(videoElement);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play();
          setIsPlaying(true);
        });
        hlsInstance.on(Hls.Events.BUFFER_APPENDED, () => {
          console.log("Buffer appended");
        });
        setHls(hlsInstance);
      } else if (type === "dash") {
        const dashInstance = dashjs.MediaPlayer().create();
        dashInstance.initialize(videoElement, dashUrl, true);
        setDashPlayer(dashInstance);
      }

      // Update duration when metadata is loaded
      videoElement.addEventListener("loadedmetadata", () => {
        setDuration(videoElement.duration);
      });

      // Update current time
      const timeUpdateHandler = () => {
        setCurrentTime(videoElement.currentTime);
      };

      // Detect loading/buffering events
      const waitingHandler = () => {
        setIsLoading(true);
      };

      const playingHandler = () => {
        setIsLoading(false);
      };

      videoElement.addEventListener("timeupdate", timeUpdateHandler);
      videoElement.addEventListener("waiting", waitingHandler);
      videoElement.addEventListener("playing", playingHandler);

      return () => {
        if (hls) {
          hls.destroy();
        } else if (dashPlayer) {
          dashPlayer.destroy();
        }
        videoElement.removeEventListener("timeupdate", timeUpdateHandler);
        videoElement.removeEventListener("waiting", waitingHandler);
        videoElement.removeEventListener("playing", playingHandler);
      };
    }
  }, [hlsUrl, dashUrl, type]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration; // Assuming the input value is from 0 to 100
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleMuteUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="video-player-container">
      <video muted autoPlay ref={videoRef} controls style={{ width: "100%" }} />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      <div className="controls-panel">
        <button onClick={handlePlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button onClick={handleMuteUnmute}>
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <label>
          Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={isMuted}
          />
        </label>

        <label>
          Seek:
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100}
            onChange={handleSeek}
          />
        </label>

        <span>
          {Math.floor(currentTime)} / {Math.floor(duration)} seconds
        </span>
      </div>
    </div>
  );
};
