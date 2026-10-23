import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share2, PlusSquare, Check } from "lucide-react";

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed app on phone)
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Check localStorage dismissal
    const isDismissed = localStorage.getItem("shopza_pwa_prompt_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }

    // Capture standard PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setTimeout(() => setDismissed(true), 4000);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("shopza_pwa_prompt_dismissed", "true");
  };

  if (isStandalone || dismissed) {
    return null;
  }

  // Show if installable via prompt OR if on iOS Safari (not in standalone)
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <div className="relative z-30 bg-gradient-to-r from-[#0C122C] via-[#0E1638] to-[#140E2D] border-b border-blue-500/30 px-3 py-2 text-xs text-white shadow-lg animate-fadeIn">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#7928CA] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-900/50">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-[12px] text-white flex items-center gap-1.5 truncate">
              <span>Install Shopza Phone App</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                Mobile View
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {installed
                ? "App installed! Open from your home screen."
                : isIos
                ? "Tap to add Shopza to your iPhone home screen"
                : "Fast 1-click install for full mobile phone experience"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {installed ? (
            <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Installed
            </span>
          ) : (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#7928CA] hover:from-[#0055D6] hover:to-[#6B21A8] text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-blue-900/50 active:scale-95 transition-all"
            >
              <Download className="w-3 h-3" />
              <span>Download App</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Safari Home Screen Guide Tooltip */}
      {showIosGuide && (
        <div className="mt-2.5 p-3 rounded-2xl bg-[#090C1D] border border-blue-400/40 text-[11px] text-slate-200 space-y-2 animate-fadeIn max-w-md mx-auto">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              How to install on iPhone / iPad:
            </span>
            <button onClick={() => setShowIosGuide(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <ol className="space-y-1 text-slate-300 list-decimal list-inside text-[11px]">
            <li>Tap the <strong className="text-white">Share</strong> button (box with upward arrow) at the bottom of Safari.</li>
            <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="inline w-3 h-3 mx-1 text-blue-400" />.</li>
            <li>Tap <strong className="text-blue-400">Add</strong> in the top right. Shopza will now open in full phone mode!</li>
          </ol>
        </div>
      )}
    </div>
  );
};
