const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add Lucide icons
content = content.replace("  Video,", "  Video,\n  Flashlight,\n  FlashlightOff,");

// Add flashlight states
const statesTarget = `  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);`;
const statesReplacement = `  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraHasFlashlight, setCameraHasFlashlight] = useState(false);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);`;
content = content.replace(statesTarget, statesReplacement);

// Add toggle function
const toggleTarget = `  const toggleLiveVideoRecording = () => {`;
const toggleReplacement = `  const toggleFlashlight = async () => {
    if (!activeStream) return;
    const track = activeStream.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isFlashlightOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any]
        });
        setIsFlashlightOn(nextState);
      } catch (err) {
        console.error("Flashlight toggle error:", err);
      }
    }
  };

  const toggleLiveVideoRecording = () => {`;
content = content.replace(toggleTarget, toggleReplacement);

// Hook torch logic in startLiveCamera main
const startTarget = `      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);`;
const startReplacement = `      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);
      setIsFlashlightOn(false);
      
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === "function") {
        const caps = track.getCapabilities() as any;
        setCameraHasFlashlight(!!caps.torch);
      } else {
        setCameraHasFlashlight(false);
      }`;
content = content.replace(startTarget, startReplacement);

// Hook torch logic in startLiveCamera fallback
const fallbackTarget = `        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setActiveStream(fallbackStream);`;
const fallbackReplacement = `        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setActiveStream(fallbackStream);
        setIsFlashlightOn(false);
        const fbTrack = fallbackStream.getVideoTracks()[0];
        if (fbTrack && typeof fbTrack.getCapabilities === "function") {
          const caps = fbTrack.getCapabilities() as any;
          setCameraHasFlashlight(!!caps.torch);
        } else {
          setCameraHasFlashlight(false);
        }`;
content = content.replace(fallbackTarget, fallbackReplacement);

// Add flashlight button to UI
const uiTarget = `            {/* Optional facing mode switcher (rear vs front) */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition cursor-pointer"
            >
              🔄
            </button>`;
const uiReplacement = `            {/* Optional facing mode switcher and Flashlight */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition cursor-pointer"
                title={language === "bn" ? "ক্যামেরা ঘোরান" : "Toggle Camera"}
              >
                🔄
              </button>
              {cameraHasFlashlight && (
                <button
                  type="button"
                  onClick={toggleFlashlight}
                  className={\`w-12 h-12 flex items-center justify-center rounded-full transition cursor-pointer \${isFlashlightOn ? 'bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-slate-800 hover:bg-slate-700 text-white'}\`}
                  title={language === "bn" ? "ফ্ল্যাশ লাইট" : "Flashlight"}
                >
                  {isFlashlightOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
                </button>
              )}
            </div>`;
content = content.replace(uiTarget, uiReplacement);

fs.writeFileSync(filePath, content);
console.log("Success");
