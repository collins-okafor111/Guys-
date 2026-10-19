import React, { useEffect } from "react";
import { Mic, MicOff, Volume2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useVoiceAssistant, VoiceActionResult } from "../../hooks/useVoiceAssistant";

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (action: VoiceActionResult) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const {
    status,
    transcript,
    interimTranscript,
    audioLevel,
    errorMessage,
    startListening,
    stopListening,
    resetVoice,
  } = useVoiceAssistant((action) => {
    onExecuteCommand(action);
    setTimeout(() => {
      onClose();
    }, 900);
  });

  useEffect(() => {
    if (isOpen) {
      resetVoice();
      const timer = setTimeout(() => {
        startListening();
      }, 200);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      resetVoice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d101d] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden text-center p-6 sm:p-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#15192e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#14182e] border border-purple-900/40 flex items-center justify-center text-purple-400">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-white">Shopza Voice Search</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Speak naturally to search products, browse categories, or navigate.
        </p>

        {/* Microphone Button with Real-Time Audio Level Pulse */}
        <div className="relative my-6 flex items-center justify-center">
          {status === "listening" && (
            <>
              <div
                className="absolute rounded-full bg-purple-600/20 transition-all duration-75"
                style={{
                  width: `${100 + audioLevel * 1.2}px`,
                  height: `${100 + audioLevel * 1.2}px`,
                }}
              />
              <div
                className="absolute rounded-full bg-purple-600/30 transition-all duration-75 animate-ping opacity-40"
                style={{
                  width: "90px",
                  height: "90px",
                }}
              />
            </>
          )}

          <button
            onClick={() => {
              if (status === "listening") {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              status === "listening"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-900/50"
                : status === "processing"
                ? "bg-[#1f2549] text-white animate-pulse"
                : status === "success"
                ? "bg-emerald-600 text-white"
                : "bg-[#181d38] text-purple-300 hover:text-white hover:bg-purple-600"
            }`}
          >
            {status === "listening" ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : status === "success" ? (
              <CheckCircle2 className="w-10 h-10" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Waveform indicator */}
        {status === "listening" && (
          <div className="flex items-center justify-center gap-1.5 h-8 mb-4">
            {[40, 70, 100, 60, 90, 50, 80].map((baseHeight, i) => {
              const dynamicHeight = Math.max(8, (baseHeight * (audioLevel + 15)) / 100);
              return (
                <span
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full transition-all duration-75"
                  style={{ height: `${dynamicHeight}px` }}
                />
              );
            })}
          </div>
        )}

        {/* Live Transcript Display */}
        <div className="min-h-[70px] flex flex-col items-center justify-center bg-[#0a0c16] rounded-2xl p-4 border border-purple-900/30 mb-5">
          {status === "listening" && !transcript && !interimTranscript && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Volume2 className="w-4 h-4 animate-pulse text-purple-400" />
              <span>Listening... speak now</span>
            </div>
          )}

          {interimTranscript && (
            <p className="text-purple-300 text-xs italic font-medium">
              "{interimTranscript}..."
            </p>
          )}

          {transcript && (
            <div className="text-center">
              <p className="text-white font-bold text-sm">"{transcript}"</p>
              <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Action recognized
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-medium text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage || "An error occurred with voice capture."}</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="text-left mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Try saying:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Search wireless headphones",
              "Show Electronics",
              "Open Cart",
              "Run test suite",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  onExecuteCommand({
                    type: chip.includes("Cart")
                      ? "navigate"
                      : chip.includes("Electronics")
                      ? "category"
                      : chip.includes("test")
                      ? "navigate"
                      : "search",
                    target: chip.includes("Cart") ? "cart" : chip.includes("test") ? "test_suite" : undefined,
                    query: chip.includes("Electronics") ? "Electronics" : "wireless headphones",
                    rawText: chip,
                  });
                  onClose();
                }}
                className="text-xs px-3 py-1.5 bg-[#12162a] hover:bg-[#181d38] text-purple-200 border border-purple-900/40 rounded-lg transition-colors font-medium"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-[#15192e]"
          >
            Cancel
          </button>
          {status === "error" && (
            <button
              onClick={() => startListening()}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl shadow-xs"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
