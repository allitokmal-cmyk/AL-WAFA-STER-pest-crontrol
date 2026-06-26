const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the setTimeout in startLiveCamera
const target1 = `      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);

      // Find the html video element and bind
      setTimeout(() => {
        const videoEl = document.getElementById("live-viewfinder") as HTMLVideoElement | null;
        if (videoEl) {
          videoEl.srcObject = stream;
        }
      }, 150);`;

const replacement1 = `      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);
      // Removed setTimeout. The binding is now handled securely inside a useEffect!`;

content = content.replace(target1, replacement1);

// Replace the fallback setTimeout as well
const target1_fallback = `        setActiveStream(fallbackStream);
        setTimeout(() => {
          const videoEl = document.getElementById("live-viewfinder") as HTMLVideoElement | null;
          if (videoEl) {
            videoEl.srcObject = fallbackStream;
          }
        }, 150);`;

const replacement1_fallback = `        setActiveStream(fallbackStream);
        // Removed setTimeout. The binding is now handled securely inside a useEffect!`;

content = content.replace(target1_fallback, replacement1_fallback);

// Insert useEffect hooks for the video element to bind stream immediately when it appears
const insertHookTarget = `  // Start the device camera`;
const insertHookReplacement = `
  // Bind camera stream reliably when activeStream is available and video element renders
  useEffect(() => {
    if (isLiveCamOpen && activeStream) {
      const videoEl = document.getElementById("live-viewfinder") as HTMLVideoElement | null;
      if (videoEl && !videoEl.srcObject) {
        videoEl.srcObject = activeStream;
        videoEl.play().catch((err) => console.error("Video play error:", err));
      }
    }
  }, [isLiveCamOpen, activeStream]);

  // Start the device camera`;

content = content.replace(insertHookTarget, insertHookReplacement);

// Fix onClick={captureLivePhoto}
content = content.replace(/onClick=\{captureLivePhoto\}/g, 'onClick={() => captureLivePhoto()}');

// Fix captureLivePhoto to wait a bit so user can see it flashed, and remove auto-download which is buggy on mobile
const targetCapture = `      // Device Storage Auto-Save: Automatically trigger physical browser download of captured photo
      try {
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const zoneNameForFile = liveCamType === "work" ? (activeCaptureZone || "Area") : "Recommendation";
        link.href = dataUrl;
        link.download = \`AlWafaStar-Evidence-\${zoneNameForFile.replace(/\\s+/g, "_")}-\${timestamp}.jpg\`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Auto-download of captured image failed:", err);
      }

      // Add camera action visual confirmation count/flash
      setCameraActiveCount((c) => c + 1);
      
      // Temporarily flash overlay green for feedback
      const flashEl = document.getElementById("camera-flash-overlay");
      if (flashEl) {
        flashEl.classList.remove("opacity-0");
        flashEl.classList.add("opacity-50");
        setTimeout(() => {
          flashEl.classList.remove("opacity-50");
          flashEl.classList.add("opacity-0");
        }, 150);
      }

      // Automatically finish and close the live feed so user does not need to click Done manually
      setTimeout(() => {
        handleCloseLiveCamera();
      }, 160);`;

const replacementCapture = `      // Device Storage Auto-Save removed for mobile iframe safety.
      // Photo is now safely inside the system!

      // Add camera action visual confirmation count/flash
      setCameraActiveCount((c) => c + 1);
      
      // Temporarily flash overlay white/green for feedback
      const flashEl = document.getElementById("camera-flash-overlay");
      if (flashEl) {
        flashEl.classList.remove("opacity-0");
        flashEl.classList.add("opacity-80", "bg-emerald-400"); // stronger flash
        setTimeout(() => {
          flashEl.classList.remove("opacity-80", "bg-emerald-400");
          flashEl.classList.add("opacity-0", "bg-white");
        }, 300);
      }

      // Provide better feedback and close after a slightly longer delay so the user understands the photo was taken!
      setTimeout(() => {
        handleCloseLiveCamera();
      }, 600);`;


content = content.replace(targetCapture, replacementCapture);

fs.writeFileSync(filePath, content);
console.log("Transform applied!");
