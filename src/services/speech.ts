// Speech Recognition & Audio Synthesis Service (Urdu & English Web Speech API)

let recognitionInstance: any = null;
let activeAudioSource: AudioBufferSourceNode | null = null;
let audioCtx: AudioContext | null = null;
let micAudioCtx: AudioContext | null = null;
let micAnalyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices cache
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

// Detect if string contains Urdu / Arabic script
export function isUrduText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export function startSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  language: 'ur-PK' | 'en-US' | 'auto' = 'ur-PK'
): () => void {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser.');
    return () => {};
  }

  try {
    if (recognitionInstance) {
      try {
        recognitionInstance.abort();
      } catch (e) {
        // ignore
      }
      recognitionInstance = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Set language: Urdu (Pakistan) by default or user preference
    recognition.lang = language === 'auto' ? 'ur-PK' : language;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      const err = event.error;
      // Benign errors that happen during regular speech pauses or abortion
      if (err === 'no-speech' || err === 'aborted') {
        return;
      }
      console.warn('Speech recognition warning:', err);
      onError(err);
    };

    recognition.onend = () => {
      onEnd();
      recognitionInstance = null;
    };

    recognition.start();
    recognitionInstance = recognition;

    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch (e) {
          // ignore
        }
        recognitionInstance = null;
      }
    };
  } catch (err: any) {
    console.warn('Speech recognition start failed:', err);
    onError(err.message || 'Failed to start speech recognition');
    return () => {};
  }
}

export function stopSpeechRecognition() {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (e) {
      try {
        recognitionInstance.abort();
      } catch (e2) {
        // ignore
      }
    }
    recognitionInstance = null;
  }
}

// Fast Web Speech Synthesis for Urdu & English with Zero Delay
export function speakWithBrowserSynthesis(
  text: string,
  onEnded?: () => void,
  preferredLanguage: 'ur-PK' | 'en-US' | 'auto' = 'ur-PK',
  rate: number = 1.05,
  pitch: number = 1.0
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnded) onEnded();
    return;
  }

  // Cancel any active speech immediately to prevent delay or speech queue overlap
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }

  const cleanText = text
    .replace(/[*_#`~>]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!cleanText) {
    if (onEnded) onEnded();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = Math.max(0.8, Math.min(1.4, rate));
  utterance.pitch = Math.max(0.8, Math.min(1.3, pitch));

  const containsUrdu = isUrduText(cleanText);
  const isUrdu = preferredLanguage === 'ur-PK' || (preferredLanguage === 'auto' && containsUrdu) || containsUrdu;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();

  if (isUrdu) {
    utterance.lang = 'ur-PK';
    // Find best Urdu, Hindi, or South Asian phonetic voice for natural pronunciation
    const urduVoice =
      voices.find((v) => v.lang === 'ur-PK' || v.lang.startsWith('ur')) ||
      voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi')) ||
      voices.find((v) => /urdu|pakistan|hindi/i.test(v.name)) ||
      voices.find((v) => v.lang === 'ar-SA' || v.lang.startsWith('ar')) ||
      voices[0];

    if (urduVoice) {
      utterance.voice = urduVoice;
    }
  } else {
    utterance.lang = 'en-US';
    const englishVoice =
      voices.find((v) => v.lang === 'en-US' || v.lang.startsWith('en')) ||
      voices[0];

    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  }

  let endedCalled = false;
  const finish = () => {
    if (!endedCalled) {
      endedCalled = true;
      if (onEnded) onEnded();
    }
  };

  utterance.onend = finish;
  utterance.onerror = (e) => {
    console.warn('Speech synthesis utterance warning:', e);
    finish();
  };

  // Immediate dispatch for zero-latency instant playback
  window.speechSynthesis.speak(utterance);
}

// Play Raw PCM or Remote TTS Audio if configured
export async function playTTSAudio(
  base64Data: string,
  sampleRate: number = 24000,
  onEnded?: () => void
): Promise<void> {
  stopAudioPlayback();

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass({ sampleRate });
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const buffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
    buffer.getChannelData(0).set(float32Array);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    source.onended = () => {
      activeAudioSource = null;
      if (onEnded) onEnded();
    };

    activeAudioSource = source;
    source.start(0);
  } catch (err) {
    console.error('Failed to play TTS audio buffer:', err);
    if (onEnded) onEnded();
  }
}

export function stopAudioPlayback() {
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
      activeAudioSource.disconnect();
    } catch (e) {
      // ignore
    }
    activeAudioSource = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
}

// Microphone Level Analyser for Live Voice Visualizer
export async function startMicVolumeMonitoring(
  onLevel: (level: number) => void
): Promise<() => void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream = stream;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    micAudioCtx = new AudioContextClass();
    const source = micAudioCtx.createMediaStreamSource(stream);
    micAnalyser = micAudioCtx.createAnalyser();
    micAnalyser.fftSize = 64;
    micAnalyser.smoothingTimeConstant = 0.8;
    source.connect(micAnalyser);

    const bufferLength = micAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const checkLevel = () => {
      if (!micAnalyser) return;
      micAnalyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalized = Math.min(1, average / 100);
      onLevel(normalized);
      animationFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
        micStream = null;
      }
      if (micAudioCtx) {
        micAudioCtx.close().catch(() => {});
        micAudioCtx = null;
      }
      micAnalyser = null;
    };
  } catch (err) {
    console.warn('Microphone level monitoring not available:', err);
    return () => {};
  }
}
