import "./App.css";
import { VideoPlayer } from "./VideoPlayer";
import { isSafari } from "./isSafari";

function App() {
  const mockVideoData = {
    hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    dashUrl: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
  };

  const videoType = isSafari() ? "hls" : "dash";

  return (
    <VideoPlayer
      hlsUrl={mockVideoData.hlsUrl}
      dashUrl={mockVideoData.dashUrl}
      type={videoType}
    />
  );
}

export default App;
