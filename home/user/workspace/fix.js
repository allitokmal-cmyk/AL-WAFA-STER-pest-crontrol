const fs = require('fs');
let content = fs.readFileSync('src/components/EngineeringReport.tsx', 'utf-8');

// The marker where our bad edit originated
const badLineMarker = `                                onChange={(e) => {
                                  setZoneComments((prev) => ({
                                    ...prev,
                                    [zone.id]: e.target.value,
                                  }));
                                          const pageFooterText = (`;

if(content.includes(badLineMarker)) {
    console.log("Found bad line marker. Slicing string...");
    const badStart = content.indexOf(badLineMarker);
    const goodStartContent = content.substring(0, badStart + 189); // up to the end of   [zone.id]: e.target.value, }));

    // Now we need the chunk that was removed. I will declare it here as a raw string.
    const deletedChunk = `
                                e.target.style.height = "auto";
                                e.target.style.height = \`\${e.target.scrollHeight}px\`;
                              }}
                              placeholder={t(
                                \`✍️ Write comments for \${language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)}...\`,
                                \`\${language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)} জোনের জন্য মন্তব্য লিখুন...\`,
                                \`أدخل ملاحظاتك لـ \${language === "bn" ? zone.labelBN : (language === "ar" ? zone.labelAR : zone.labelEN)}...\`
                              )}
                              className="w-full bg-[#1e293b] hover:bg-slate-900 focus:bg-slate-950 transition-all border border-slate-700 focus:border-emerald-500 text-white font-medium text-xs rounded-xl py-2.5 px-3 outline-none placeholder-slate-500 resize-none overflow-hidden min-h-[38px] active:scale-98"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-8 bg-slate-955/40 rounded-3xl border border-slate-800 font-sans">
                      <p className="text-sm text-slate-400 font-medium">{t("No active categories selected. Please add one above.", "কোনো সক্রিয় ক্যাটাগরি যুক্ত নেই, উপরে পছন্দের ক্যাটাগরি সিলেক্ট করুন।", "لا توجد تصنيفات نشطة مضافة، يرجى إضافة تصنيف من الأعلى.")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RECOMMENDATIONS EVIDENCE / CORRECTIVE ACTION PROOFS (perfectly borderless card grids) */}
              <div className="space-y-4 border-t border-slate-800 pt-6 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/40 font-sans">
                  <div className="text-left">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-350">
                      💡 {t("RECOMMENDATIONS EVIDENCE / ATTACHED PROOFS", "রিকমেন্ডেশন সংক্রান্ত প্রমাণাদি বা ছবি", "إثباتات التوصيات والإجراءات التصحيحية")}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {t("Attach photos related to recommendations or target areas being treated", "রিকমেন্ডেশন বা চিকিৎসা করা হচ্ছে এমন জায়গা বা পদক্ষেপের ছবি যোগ করুন", "أرفق صوراً للمواقع المعالجة أو التوصيات")}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1 bg-slate-950 rounded border border-slate-850 text-amber-500 font-bold h-[32px] flex items-center">
                    {t(\`Attached: \${recommendationPhotosList.length}\`, \`যোগ করা হয়েছে: \${recommendationPhotosList.length} টি\`, \`المرفقة: \${recommendationPhotosList.length}\`)}
                  </span>
                </div>

                {/* Grid layout of attached recommendation proof photographs */}
                {recommendationPhotosList.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-fadeIn">
                    {recommendationPhotosList.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-900 shadow-md transform active:scale-95 transition-all w-full"
                      >
                        <img 
                          src={item.url} 
                          alt={\`recommendation proof \${idx + 1}\`} 
                          className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-all duration-300"
                          onClick={() => setActiveZoomPhoto({ url: item.url, caption: item.caption, source: "rec", index: idx })}
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx, "rec")}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors z-10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 italic px-0.5 font-sans text-left">
                    {t("No recommendation photos captured yet", "কোনো রিকমেন্ডেশন ছবি তোলা হয়নি", "لم يتم التقاط صور لتوصيات المعالجة")}
                  </div>
                )}

                {/* RECOMMENDATIONS CAPTURE TOOLS buttons block */}
                <div className="flex items-center gap-2 pt-1 font-sans">
                  {/* Option 1: Camera */}
                  <button
                    type="button"
                    onClick={() => {
                      setLiveCamType("rec");
                      startLiveCamera("rec");
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-3 py-2.5 text-[11px] font-black rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    📷 {t("Camera", "ক্যামেরা", "كاميرا")}
                  </button>

                  {/* Option 2: File */}
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAddNewPhoto(file, "rec");
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-15"
                    />
                    <button
                      type="button"
                      className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-2.5 text-[11px] font-black rounded-xl transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      📁 {t("File", "ফাইল", "ملف")}
                    </button>
                  </div>

                  {/* Option 3: Next Slot */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategorySelectorOpen(false);
                      const defaultName = language === "bn" ? "অফিস করিডর" : "Office Corridor";
                      setNewSlotInput(defaultName);
                      setSlotToCreate({ isOpen: true, defaultVal: defaultName });
                    }}
                    className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 active:scale-95 text-indigo-400 hover:text-indigo-300 px-3 py-2.5 text-[11px] font-black rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    ⏭️ {t("Next Slot", "নেক্সট লট", "الفتحة التالية")}
                  </button>
                </div>
              </div>

              {/* SAVE & SUBMIT PRIMARY ACTIONS CTA CONTROL RAIL */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-800/60 font-sans">
                <button
                  type="button"
                  onClick={() => handleSaveReport(true)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 hover:text-slate-950 font-black text-xs sm:text-base h-16 rounded-2xl shadow-xl shadow-emerald-500/10 cursor-pointer transition-all uppercase flex items-center justify-center gap-2 text-white"
                >
                  🚀 {t("Save & Generate Live Preview", "রিপোর্ট সংরক্ষণ ও ডিরেক্ট প্রিভিউ", "حفظ وتوليد ومعاينة التقرير")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveSegment("list");
                  }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-5 h-16 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    {/* SEGMENT 3: REPORT PREVIEW PANEL */}
    {selectedReport && activeSegment === "preview" && (
      <div id="report-preview-panel" className="max-w-5xl mx-auto space-y-6 animate-fadeIn font-sans">
        {/* UPPER CONTROLLERS BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl print:hidden">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black tracking-widest text-[#10B981] uppercase font-mono bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25 animate-pulse">
              {t("LIVE REPORT VIEW", "লাইভ রিপোর্ট ওভারভিউ", "معاينة حية للمستند")}
            </span>
            <h2 className="text-xl font-black text-white leading-tight">
              {selectedReport.clientName}
            </h2>
            <p className="text-xs text-slate-450 font-mono">
              ID: {selectedReport.reportNo} | {formatDateDisplay(selectedReport.date)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
               onClick={() => {
                if (editingReportId) {
                  setActiveSegment("create");
                } else {
                  setActiveSegment("list");
                }
              }}
              className="bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none"
            >
              ⬅️ {t("Back To Editor", "এডিটর-এ ফিরুন", "العودة للمحرر")}
            </button>
            <button
              onClick={() => {
                setActiveSegment("list");
              }}
              className="bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border border-slate-800 transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none"
            >
              📋 {t("All Reports", "রিপোর্ট তালিকা", "جميع التقارير")}
            </button>
            <button
              onClick={() => handleDownloadReportDoc(selectedReport)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 hover:text-slate-950 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none shadow-md shadow-emerald-500/10 text-white"
            >
              📤 {t("Download Word", "এমএস-ওয়ার্ড (.docx) ডাউনলোড", "تحميل بصيغة ওورد")}
            </button>
            <button
              onClick={handlePrintTrigger}
              className="bg-indigo-600 hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 active:scale-95 leading-none shadow-md"
            >
              🖨️ {t("Print / PDF Creator", "প্রিন্ট এবং পিডিএফ তৈরি", "طباعة / حفظ PDF")}
            </button>
          </div>
        </div>
        {/* PRINTABLE PAGES STAGE SHEET */}
        {(() => {
          const allReportPhotos = selectedReport.photos || [];
`;

    const restOfContent = content.substring(badStart + 189);
    fs.writeFileSync('src/components/EngineeringReport.tsx', goodStartContent + deletedChunk + restOfContent, 'utf-8');
    console.log("File repaired successfully.");
} else {
    console.log("Marker not found!");
}
