import { useState, useEffect, useRef, useCallback } from "react";

export type VoiceStatus = "idle" | "listening" | "processing" | "success" | "error";

export interface VoiceActionResult {
  type: "search" | "category" | "navigate" | "dictate" | "unknown";
  query?: string;
  target?: string;
  rawText: string;
}

export function useVoiceAssistant(onAction?: (action: VoiceActionResult) => void) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage("Speech recognition is not supported in this browser. Please use Chrome, Edge, Safari, or an Android browser.");
    }
  }, []);

  // Audio visualization monitor
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err: any) {
      console.warn("Audio monitoring could not access mic stream:", err);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const parseCommand = (text: string): VoiceActionResult => {
    const lower = text.toLowerCase().trim();

    // Navigation commands
    if (lower.includes("cart") || lower.includes("open cart") || lower.includes("view cart")) {
      return { type: "navigate", target: "cart", rawText: text };
    }
    if (lower.includes("order") || lower.includes("my orders") || lower.includes("view orders")) {
      return { type: "navigate", target: "orders", rawText: text };
    }
    if (lower.includes("message") || lower.includes("chat") || lower.includes("conversations")) {
      return { type: "navigate", target: "messages", rawText: text };
    }
    if (lower.includes("dashboard") || lower.includes("seller dashboard") || lower.includes("my store")) {
      return { type: "navigate", target: "seller_dashboard", rawText: text };
    }
    if (lower.includes("test") || lower.includes("run tests") || lower.includes("test suite")) {
      return { type: "navigate", target: "test_suite", rawText: text };
    }

    // Category filter commands
    const categories = ["electronics", "fashion", "home", "beauty", "sports", "books", "crafts", "artisanal"];
    for (const cat of categories) {
      if (lower.startsWith("show ") && lower.includes(cat)) {
        return { type: "category", query: cat, rawText: text };
      }
      if (lower.startsWith("category ") && lower.includes(cat)) {
        return { type: "category", query: cat, rawText: text };
      }
    }

    // Search query extraction
    let cleanQuery = text;
    const searchPrefixes = [
      "search for ",
      "search ",
      "find ",
      "look for ",
      "show me ",
      "buy ",
      "shop for ",
    ];

    for (const prefix of searchPrefixes) {
      if (lower.startsWith(prefix)) {
        cleanQuery = text.slice(prefix.length).trim();
        break;
      }
    }

    return {
      type: "search",
      query: cleanQuery,
      rawText: text,
    };
  };

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatus("error");
      setErrorMessage("Speech recognition is not available in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    // Stale transcript reset: Clear everything immediately before starting
    setTranscript("");
    setInterimTranscript("");
    setErrorMessage("");
    setStatus("listening");

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      // Start audio waveform monitoring
      startAudioMonitoring();

      recognition.onstart = () => {
        setStatus("listening");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          const cleanFinal = final.trim();
          setTranscript(cleanFinal);
          setInterimTranscript("");
          setStatus("processing");

          const action = parseCommand(cleanFinal);
          if (onAction) {
            onAction(action);
          }
          setStatus("success");
        }
      };

      recognition.onerror = (event: any) => {
        stopAudioMonitoring();
        setStatus("error");
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions in your browser address bar.");
        } else if (event.error === "no-speech") {
          setErrorMessage("No voice was detected. Please tap the microphone and speak again.");
        } else if (event.error === "network") {
          setErrorMessage("Network issue during voice recognition. Please try typing your search.");
        } else {
          setErrorMessage(`Voice recognition error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        stopAudioMonitoring();
        setStatus((prev) => (prev === "listening" ? "idle" : prev));
      };

      recognition.start();
    } catch (err: any) {
      stopAudioMonitoring();
      setStatus("error");
      setErrorMessage(err.message || "Could not start microphone.");
    }
  }, [onAction]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopAudioMonitoring();
    setStatus("idle");
  }, []);

  const resetVoice = useCallback(() => {
    stopListening();
    setTranscript("");
    setInterimTranscript("");
    setErrorMessage("");
    setStatus("idle");
  }, [stopListening]);

  return {
    status,
    transcript,
    interimTranscript,
    errorMessage,
    audioLevel,
    isSupported,
    startListening,
    stopListening,
    resetVoice,
  };
}
