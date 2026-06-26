const fs = require('fs');
const filePath = 'src/components/EngineeringReport.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. First, find where I broke the drawingHistory button around line 3976
const brokenStartStr = '                  disabled={draw      {/* Live Webcam Capturing overlay Modal */}';
const brokenStartIdx = content.indexOf(brokenStartStr);

if (brokenStartIdx === -1) {
    console.error("Could not find the broken start index");
    process.exit(1);
}

// Revert that specific portion exactly.
const goodReplacement = `                  disabled={drawingHistory.length === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-20 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-bold leading-none">↩</span>
                </button>

                {/* REDO BUTTON */}
                <button
                  type="button"
                  title={t("Redo Drawing (↪)", "পরের ধাপে যান (↪)", "إعادة تطبيق")}
                  onClick={() => {
                    if (redoHistory.length > 0) {
                      const next = redoHistory[redoHistory.length - 1];
                      setDrawingHistory((prev) => [...prev, next]);
                      setRedoHistory((prev) => prev.slice(0, -1));
                    }
                  }}
                  disabled={redoHistory.length === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-20 cursor-pointer transition-colors"
                >
                  <span className="text-sm font-bold leading-none">↪</span>
                </button>

                {/* RESET/CLEAR CANVAS BUTTON */}
                <div className="relative">
                  <button
                    type="button"
                    title={t("Reset Canvas", "সব মুছুন", "مسح الكل")}
                    onClick={() => {
                      setShowClearCanvasConfirm((prev) => !prev);
                    }}
                    disabled={drawingHistory.length === 0}
                    className={\`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors \${
                      showClearCanvasConfirm
                        ? "bg-rose-600 text-white animate-pulse"
                        : "text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20"
                    }\`}
                  >
                    <span className="text-sm font-bold">🗑️</span>
                  </button>
                  
                  {showClearCanvasConfirm && (
                    <div className="absolute top-10 left-0 bg-slate-950 border border-rose-500/40 p-2.5 rounded-xl flex flex-col gap-2 z-50 shadow-2xl w-44 font-sans no-print">
                      <span className="text-[10px] font-bold text-slate-300">
                        {language === "bn" ? "সব ড্রয়িং মুছবেন কি?" : "Reset all drawings?"}
                      </span>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDrawingHistory([]);
                            setRedoHistory([]);
                            setShowClearCanvasConfirm(false);
                          }}
                          className="px-2 py-1 bg-rose-500 hover:bg-rose-600 font-bold rounded-lg text-[9.5px] uppercase font-mono text-white cursor-pointer"
                        >
                          {language === "bn" ? "হাঁ মুছুন" : "Reset"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearCanvasConfirm(false)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-705 font-bold rounded-lg text-[9.5px] uppercase font-mono text-slate-350 cursor-pointer"
                        >
                          {language === "bn" ? "বাতিল" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. CHOSEN WORKING INTERACTIVE RESIZABLE CANVAS CONTAINER */}
            <div className="relative flex flex-col items-center justify-center bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-3xl shadow-2xl max-w-full">
              {activeZoomPhoto.videoUrl ? (
                <div className="overflow-hidden rounded-2xl relative flex items-center justify-center bg-black border border-slate-800 shadow-xl max-w-full w-full">
                  <video 
                    src={activeZoomPhoto.videoUrl} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[70vh] rounded-2xl" 
                  />
                </div>
              ) : (
                <>
                  {/* Image preloader for rendering */}
                  {!isBgLoaded && (
                    <div className="flex flex-col items-center justify-center h-72 w-96 text-slate-500 font-bold space-y-2 font-mono">
                      <span className="w-10 h-10 border-4 border-slate-850 border-t-emerald-500 rounded-full animate-spin" />
                      <span className="text-xs uppercase">{t("Preparing Editor canvas...", "ক্যানভাস লোড হচ্ছে...", "جاري تحميل محرر الصور...")}</span>
                    </div>
                  )}

                  {/* Touch Responsive Canvas */}
                  <div 
                    className={\`overflow-hidden rounded-2xl relative flex items-center justify-center bg-slate-950/80 \${isBgLoaded ? "block" : "hidden"}\`}
                    style={{ width: canvasSize.width, height: canvasSize.height }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      onMouseDown={handlePointerDown}
                      onMouseMove={handlePointerMove}
                      onMouseUp={handlePointerUp}
                      onMouseLeave={handlePointerUp}
                      onTouchStart={handlePointerDown}
                      onTouchMove={handlePointerMove}
                      onTouchEnd={handlePointerUp}
                      className={\`w-full h-full \${activeZoomPhoto.source ? "cursor-crosshair" : "cursor-default"}\`}
                    />
                  </div>
                </>
              )}

              {/* EDITOR PROPERTY PRESETS DIALOG DIRECTLY BELOW CANVAS */}
              {!activeZoomPhoto.videoUrl && activeZoomPhoto.source && isBgLoaded && (
                <div className="w-full flex flex-col gap-3 mt-3.5 pt-3 border-t border-slate-850 animate-fadeIn">
                  
                  {/* DYNAMIC TEXT BAR / STAMP SELECTION PORTAL */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                    {/* If selected Text tool "A" */}
                    {activeTool === "text" && (
                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 w-full animate-fadeIn">
                        <span className="text-emerald-500 font-extrabold text-[10px] uppercase font-mono tracking-wider shrink-0 flex items-center gap-1">
                          <span>✍️</span> {t("TEXT BAR:", "টেক্সট বার:", "سطر النص:")}
                        </span>
                        <input
                          type="text"
                          value={activeTextToDraw}`;

// Where does the bad insertion end? 
// It ends right before `onChange={(e) => setActiveTextToDraw(e.target.value)}`
const endStr = `                value={activeTextToDraw}`;
const endIdx = content.indexOf(endStr, brokenStartIdx);

let correctedContent = content.substring(0, brokenStartIdx) + goodReplacement + content.substring(endIdx + endStr.length);

// Now apply our new Fullscreen Camera modal at the RIGHT place.
// Wait, the new modal needs to be placed at the bottom where the old modal was correctly.
// Let's replace the whole old modal.
const modalStartStr = `      {/* Live Webcam Capturing overlay Modal */}`;
// we need to find it close to the end... wait, earlier it was around line 4235 limit.
// Let's find it.
const modalIdx = correctedContent.lastIndexOf(modalStartStr);
const nextSectionStr = `      {/* SEGMENT 6: NOTIFICATIONS / TOASTS */}`;
const nextSectionIdx = correctedContent.indexOf(nextSectionStr, modalIdx);

const newModal = `      {/* Live Webcam Capturing overlay Modal */}
      {isLiveCamOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-slate-950 select-none print:hidden overflow-hidden">
          
          {/* Camera Header Banner */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-slate-950/80 to-transparent">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
                {language === "bn" ? "লাইভ ক্যামেরা ক্যাপচার" : "LIVE CAMERA CAPTURER"}
              </h4>
            </div>
            
            <button
              type="button"
              onClick={handleCloseLiveCamera}
              className="p-2 bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-full transition cursor-pointer backdrop-blur"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Captured count counter */}
          <div className="absolute top-14 right-4 z-10">
            <span className="text-[10px] font-mono px-2.5 py-1.5 bg-emerald-500/20 backdrop-blur border border-emerald-500/50 text-emerald-400 rounded-lg font-bold shadow-lg">
              {language === "bn" ? \`নতুন ছবি: \${cameraActiveCount} টি\` : \`Added index: \${cameraActiveCount}\`}
            </span>
          </div>

          {/* Error Banner if any */}
          {cameraError ? (
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 z-20 bg-rose-500/20 backdrop-blur border border-rose-500/30 text-rose-300 text-xs py-4 px-5 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
              <span className="text-center font-bold">⚠️ {cameraError}</span>
              <button 
                onClick={() => startLiveCamera(liveCamType, facingMode)} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer transition"
              >
                {language === "bn" ? "পুনরায় চেষ্টা" : "Retry"}
              </button>
            </div>
          ) : null}

          {/* Live streaming Viewfinder (Takes available relative space) */}
          <div className="relative flex-1 w-full bg-black flex items-center justify-center">
            <video 
              id="live-viewfinder" 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />

            {/* Recording Indicator */}
            {isRecordingVideo && (
              <div className="absolute top-24 right-4 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-rose-500/50 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-rose-400 font-mono text-[11px] font-bold uppercase tracking-widest">{recordingDuration}s</span>
              </div>
            )}

            {/* Grid lines helper like professional DSLRs */}
            <div className="absolute inset-0 pointer-events-none opacity-20 border-t border-b border-dashed border-white/50 flex justify-between mix-blend-overlay">
              <div className="h-full border-l border-r border-dashed border-white/50 w-1/3" />
              <div className="h-full border-r border-dashed border-white/50 w-1/3" />
            </div>

            {/* Flash feedback overlay */}
            <div 
              id="camera-flash-overlay" 
              className="absolute inset-0 bg-white opacity-0 transition-opacity duration-150 pointer-events-none z-10"
            />

            {/* Helper badge */}
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-950/60 backdrop-blur border border-white/10 text-[10px] uppercase font-mono px-3 py-1.5 rounded-full text-slate-300 shadow-lg tracking-wider">
              {liveCamType === "work" 
                ? (language === "bn" ? "কার্যের প্রমাণ" : "Work-Evidence") 
                : (language === "bn" ? "রিকমেন্ডেশন" : "Recommendation")}
            </span>
          </div>

          {/* Controlling Tools and Shutter (Bottom Panel) */}
          <div className="relative z-10 bg-slate-950 pb-safe pt-4 px-6 mb-8 flex justify-between items-center w-full min-h-[100px]">
            {/* Optional facing mode switcher (rear vs front) */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-full transition cursor-pointer"
            >
              🔄
            </button>

            {/* BIG SHUTTER BUTTONS */}
            <div className="flex justify-center items-center gap-6">
              {/* Video Button */}
              <button
                type="button"
                onClick={toggleLiveVideoRecording}
                className={\`w-14 h-14 rounded-full bg-slate-900 border-2 \${isRecordingVideo ? "border-rose-500 animate-pulse" : "border-slate-600"} flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer\`}
                title={language === "bn" ? (isRecordingVideo ? "ভিডিও বন্ধ করুন" : "ভিডিও শুরু করুন") : (isRecordingVideo ? "Stop Video" : "Record Video")}
              >
                <div className={\`w-8 h-8 flex items-center justify-center transition-all \${isRecordingVideo ? "rounded bg-rose-600" : "rounded-full bg-slate-700 hover:bg-slate-600"} text-white\`}>
                  <Video className={\`w-4 h-4 text-white \${isRecordingVideo ? "animate-bounce" : ""}\`} />
                </div>
              </button>

              {/* Photo Button */}
              <button
                type="button"
                onClick={captureLivePhoto}
                className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg outline-none"
                title={language === "bn" ? "ছবি তুলুন" : "Capture Photo Frame"}
              >
                <div className="w-16 h-16 rounded-full bg-white transition hover:bg-slate-100 items-center justify-center shadow-inner" />
              </button>
            </div>

            {/* Phantom div to balance the space */}
            <div className="w-12 h-12" />
          </div>

          {/* Micro instructional helper */}
          <div className="absolute bottom-2 w-full text-center pb-2">
            <p className="text-[10px] text-emerald-400 font-bold opacity-80">
              {language === "bn" 
                ? "💡 ছবি তোলার সাথে সাথেই সেটি যুক্ত হয়ে ক্যামেরা স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে!"
                : "💡 Snapping a photo will instantly capture and close the camera for you!"}
            </p>
          </div>
        </div>
      )}
`;

correctedContent = correctedContent.substring(0, modalIdx) + newModal + correctedContent.substring(nextSectionIdx);

fs.writeFileSync(filePath, correctedContent);
console.log("Fixed!");
