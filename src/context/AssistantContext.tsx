import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  ChatMessage,
  UserMemory,
  DeviceState,
  VoiceState,
  AppSettings,
  ActionPayload,
  VideoProject,
  YouTubeVideoItem,
  VisionAnalysisResult,
} from '../types';
import { sendChatMessage, requestTTS } from '../services/api';
import {
  startSpeechRecognition,
  stopSpeechRecognition,
  playTTSAudio,
  speakWithBrowserSynthesis,
  stopAudioPlayback,
  startMicVolumeMonitoring,
} from '../services/speech';

interface AssistantContextType {
  // Chat & Voice
  messages: ChatMessage[];
  voiceState: VoiceState;
  interimTranscript: string;
  micVolume: number;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  sendMessage: (text: string, visionImage?: string) => Promise<void>;
  interruptVoice: () => void;
  clearChat: () => void;
  replayAudio: (text: string) => void;

  // Memories
  memories: UserMemory[];
  addMemory: (category: UserMemory['category'], key: string, value: string) => void;
  removeMemory: (id: string) => void;
  updateMemory: (id: string, key: string, value: string) => void;

  // Device & Phone Actions
  deviceState: DeviceState;
  toggleFlashlight: () => void;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleDnd: () => void;
  toggleBatterySaver: () => void;
  setVolume: (val: number) => void;
  setBrightness: (val: number) => void;
  addAlarm: (time: string, label?: string) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  addTimer: (durationMinutes: number, label?: string) => void;
  removeTimer: (id: string) => void;
  pauseResumeTimer: (id: string) => void;
  addCalendarEvent: (title: string, date: string, time: string, location?: string) => void;
  removeCalendarEvent: (id: string) => void;
  sendMessageToContact: (contact: string, message: string) => void;
  activeCallContact: string | null;
  endCall: () => void;
  startCall: (contact: string) => void;

  // Active Modals & Views
  activeModal: 'none' | 'memory' | 'camera' | 'video_studio' | 'youtube' | 'quick_settings' | 'apps' | 'settings';
  setActiveModal: (modal: 'none' | 'memory' | 'camera' | 'video_studio' | 'youtube' | 'quick_settings' | 'apps' | 'settings') => void;

  // Video Studio State
  activeVideoProject: VideoProject | null;
  setActiveVideoProject: (project: VideoProject | null) => void;

  // YouTube Explorer State
  activeYouTubeQuery: string;
  setActiveYouTubeQuery: (query: string) => void;

  // Vision State
  cameraInitialPrompt: string;
  setCameraInitialPrompt: (prompt: string) => void;

  // App Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const defaultMemories: UserMemory[] = [
  {
    id: 'mem_1',
    category: 'personal',
    key: 'User Name',
    value: 'Fahad',
    timestamp: '2026-08-19 09:00',
  },
  {
    id: 'mem_2',
    category: 'preference',
    key: 'Language Preference',
    value: 'Urdu & English bilingual (اردو اور انگریزی)',
    timestamp: '2026-08-19 09:15',
  },
  {
    id: 'mem_3',
    category: 'work',
    key: 'Current Project',
    value: 'Android AI Assistant with Voice Actions & Multimodal Vision',
    timestamp: '2026-08-19 09:30',
  },
  {
    id: 'mem_4',
    category: 'habit',
    key: 'Daily Schedule',
    value: 'Checks alarms, morning news, and reviews calendar daily',
    timestamp: '2026-08-19 10:00',
  },
];

const defaultDeviceState: DeviceState = {
  wifi: true,
  bluetooth: true,
  flashlight: false,
  dnd: false,
  batterySaver: false,
  batteryLevel: 92,
  isCharging: true,
  volume: 85,
  brightness: 80,
  activeAlarms: [
    { id: 'al_1', time: '07:00 AM', label: 'صبح کا الارم', enabled: true },
    { id: 'al_2', time: '08:30 AM', label: 'Team Standup', enabled: false },
  ],
  activeTimers: [],
  calendarEvents: [
    { id: 'cal_1', title: 'Product Review & AI Architecture', date: 'Today', time: '2:00 PM', location: 'Google Meet' },
    { id: 'cal_2', title: 'Gym & Cardio', date: 'Today', time: '6:30 PM', location: 'Fitness Hub' },
  ],
  recentMessages: [
    { id: 'msg_1', contact: 'Sarah', message: 'Hey! Are we still on for lunch tomorrow?', time: '10:15 AM' },
    { id: 'msg_2', contact: 'Ali', message: 'Nova prototype looks incredible!', time: '09:45 AM' },
  ],
};

const defaultSettings: AppSettings = {
  language: 'ur-PK',
  voiceName: 'Zephyr',
  useGeminiTTS: false, // Default to ultra-fast zero-latency browser Web Speech API
  autoSpeakResponse: true,
  continuousListening: false,
  hapticFeedback: true,
  speechRate: 1.05,
  speechPitch: 1.0,
  userName: 'Fahad',
  themeColor: 'cyan',
  fullScreenMode: false,
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nova_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome_1',
        sender: 'assistant',
        text: "السلام علیکم فہد! میں نووا ہوں، آپ کا ذاتی اینڈرائیڈ AI اسسٹنٹ۔ میں اردو اور انگلش دونوں میں فوراً آواز کے ساتھ جواب دینے کے لیے تیار ہوں۔ بتائیے میں کیا مدد کر سکتی ہوں؟",
        timestamp: '10:45 AM',
      },
    ];
  });

  const [memories, setMemories] = useState<UserMemory[]>(() => {
    const saved = localStorage.getItem('nova_user_memories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultMemories;
  });

  const [deviceState, setDeviceState] = useState<DeviceState>(() => {
    const saved = localStorage.getItem('nova_device_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultDeviceState;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nova_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultSettings;
  });

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeCallContact, setActiveCallContact] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<'none' | 'memory' | 'camera' | 'video_studio' | 'youtube' | 'quick_settings' | 'apps' | 'settings'>('none');
  const [activeVideoProject, setActiveVideoProject] = useState<VideoProject | null>(null);
  const [activeYouTubeQuery, setActiveYouTubeQuery] = useState<string>('');
  const [cameraInitialPrompt, setCameraInitialPrompt] = useState<string>('');

  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const stopMicMonitoringRef = useRef<(() => void) | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('nova_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('nova_user_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('nova_device_state', JSON.stringify(deviceState));
  }, [deviceState]);

  useEffect(() => {
    localStorage.setItem('nova_app_settings', JSON.stringify(settings));
  }, [settings]);

  // Timers countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceState((prev) => {
        if (!prev.activeTimers.some((t) => t.isRunning && t.remainingSec > 0)) {
          return prev;
        }

        const updated = prev.activeTimers.map((timer) => {
          if (timer.isRunning && timer.remainingSec > 0) {
            const nextSec = timer.remainingSec - 1;
            if (nextSec === 0) {
              // Timer finished!
              if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);
              // Push notification message
              setMessages((m) => [
                ...m,
                {
                  id: 'timer_done_' + Date.now(),
                  sender: 'system',
                  text: `⏰ ٹائمر مکمل ہو گیا: ${timer.label || `${timer.durationSec / 60} منٹ`}!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
            return { ...timer, remainingSec: nextSec };
          }
          return timer;
        });

        return { ...prev, activeTimers: updated };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Voice Speaking Helper using fast Web Speech API
  const speakResponse = useCallback(
    async (text: string) => {
      setVoiceState('speaking');

      // Fast path: Web Speech API (zero delay)
      if (!settings.useGeminiTTS) {
        speakWithBrowserSynthesis(
          text,
          () => {
            setVoiceState('idle');
          },
          settings.language,
          settings.speechRate || 1.05,
          settings.speechPitch || 1.0
        );
        return;
      }

      // Optional remote TTS
      try {
        const ttsResult = await requestTTS(text, settings.voiceName);
        if (ttsResult.audioBase64) {
          await playTTSAudio(ttsResult.audioBase64, ttsResult.sampleRate || 24000, () => {
            setVoiceState('idle');
          });
          return;
        }
      } catch (e) {
        console.warn('TTS request error, using browser speech synthesis');
      }

      speakWithBrowserSynthesis(
        text,
        () => {
          setVoiceState('idle');
        },
        settings.language,
        settings.speechRate || 1.05,
        settings.speechPitch || 1.0
      );
    },
    [settings.useGeminiTTS, settings.voiceName, settings.language, settings.speechRate, settings.speechPitch]
  );

  // Send Message Logic
  const sendMessage = useCallback(
    async (text: string, visionImage?: string) => {
      if (!text.trim() && !visionImage) return;

      stopAudioPlayback();
      setVoiceState('processing');

      const userMsgId = 'msg_' + Date.now();
      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visionImage,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInterimTranscript('');

      try {
        const chatRes = await sendChatMessage(text, messages, memories, deviceState);

        const assistantMsgId = 'msg_' + (Date.now() + 1);
        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          sender: 'assistant',
          text: chatRes.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: chatRes.action || undefined,
        };

        // Execute action effects on deviceState if applicable
        if (chatRes.action) {
          const action = chatRes.action;
          if (action.type === 'phone_alarm' && action.data.time) {
            setDeviceState((prev) => ({
              ...prev,
              activeAlarms: [
                ...prev.activeAlarms,
                { id: 'al_' + Date.now(), time: action.data.time, label: action.data.label || 'Alarm', enabled: true },
              ],
            }));
          } else if (action.type === 'phone_timer' && action.data.durationMinutes) {
            const sec = Math.round(action.data.durationMinutes * 60);
            setDeviceState((prev) => ({
              ...prev,
              activeTimers: [
                ...prev.activeTimers,
                { id: 'tm_' + Date.now(), durationSec: sec, remainingSec: sec, label: action.data.label || 'Timer', isRunning: true },
              ],
            }));
          } else if (action.type === 'phone_setting_toggle') {
            const { setting, state, value, memorySaved } = action.data;
            if (setting) {
              setDeviceState((prev) => {
                const next = { ...prev };
                if (setting === 'flashlight') next.flashlight = state !== undefined ? state : !next.flashlight;
                if (setting === 'wifi') next.wifi = state !== undefined ? state : !next.wifi;
                if (setting === 'bluetooth') next.bluetooth = state !== undefined ? state : !next.bluetooth;
                if (setting === 'dnd') next.dnd = state !== undefined ? state : !next.dnd;
                if (setting === 'batterySaver') next.batterySaver = state !== undefined ? state : !next.batterySaver;
                if (setting === 'volume' && value !== undefined) next.volume = Math.max(0, Math.min(100, value));
                if (setting === 'brightness' && value !== undefined) next.brightness = Math.max(0, Math.min(100, value));
                return next;
              });
            }
            if (memorySaved) {
              const newMem: UserMemory = {
                id: 'mem_' + Date.now(),
                category: memorySaved.category || 'personal',
                key: memorySaved.key,
                value: memorySaved.value,
                timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              };
              setMemories((m) => [...m.filter((item) => item.key !== memorySaved.key), newMem]);
            }
          } else if (action.type === 'phone_call' && action.data.contact) {
            setActiveCallContact(action.data.contact);
          } else if (action.type === 'phone_message' && action.data.contact) {
            setDeviceState((prev) => ({
              ...prev,
              recentMessages: [
                {
                  id: 'msg_' + Date.now(),
                  contact: action.data.contact,
                  message: action.data.message,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev.recentMessages,
              ],
            }));
          } else if (action.type === 'phone_calendar' && action.data.title) {
            setDeviceState((prev) => ({
              ...prev,
              calendarEvents: [
                ...prev.calendarEvents,
                {
                  id: 'cal_' + Date.now(),
                  title: action.data.title,
                  date: action.data.date || 'Today',
                  time: action.data.time || '12:00 PM',
                  location: action.data.location,
                },
              ],
            }));
          } else if (action.type === 'camera_vision') {
            setCameraInitialPrompt(action.data.focusArea || '');
            setActiveModal('camera');
          } else if (action.type === 'video_create') {
            setActiveModal('video_studio');
          } else if (action.type === 'youtube_search') {
            setActiveYouTubeQuery(action.data.query || '');
            setActiveModal('youtube');
          } else if (action.type === 'phone_app_launch') {
            const app = action.data.appName?.toLowerCase() || '';
            if (app.includes('camera')) setActiveModal('camera');
            else if (app.includes('youtube')) setActiveModal('youtube');
            else if (app.includes('setting')) setActiveModal('quick_settings');
            else if (app.includes('memory') || app.includes('note')) setActiveModal('memory');
            else setActiveModal('apps');
          }
        }

        setMessages((prev) => [...prev, assistantMsg]);

        // Speak aloud immediately without delay
        if (settings.autoSpeakResponse && chatRes.reply) {
          speakResponse(chatRes.reply);
        } else {
          setVoiceState('idle');
        }
      } catch (err: any) {
        console.error('Send message error:', err);
        setVoiceState('idle');
        const fallbackText = "میں نے آپ کی بات سمجھ لی ہے۔ کیا آپ دوبارہ فرما سکتے ہیں؟";
        setMessages((prev) => [
          ...prev,
          {
            id: 'err_' + Date.now(),
            sender: 'assistant',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (settings.autoSpeakResponse) {
          speakResponse(fallbackText);
        }
      }
    },
    [messages, memories, deviceState, settings.autoSpeakResponse, speakResponse]
  );

  // Start Listening using Urdu / preferred language
  const startListening = useCallback(() => {
    stopAudioPlayback();
    setVoiceState('listening');
    setIsListening(true);
    setInterimTranscript('');

    // Start mic level tracking
    startMicVolumeMonitoring((level) => {
      setMicVolume(level);
    }).then((stopMic) => {
      stopMicMonitoringRef.current = stopMic;
    });

    const stopRec = startSpeechRecognition(
      (transcript, isFinal) => {
        setInterimTranscript(transcript);
        if (isFinal && transcript.trim()) {
          stopListening();
          sendMessage(transcript.trim());
        }
      },
      (error) => {
        console.warn('Recognition error:', error);
        stopListening();
        setVoiceState('idle');
      },
      () => {
        setIsListening(false);
      },
      settings.language
    );

    stopRecognitionRef.current = stopRec;
  }, [sendMessage, settings.language]);

  // Stop Listening
  const stopListening = useCallback(() => {
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current();
      stopRecognitionRef.current = null;
    }
    if (stopMicMonitoringRef.current) {
      stopMicMonitoringRef.current();
      stopMicMonitoringRef.current = null;
    }
    stopSpeechRecognition();
    setIsListening(false);
    setMicVolume(0);
    if (voiceState === 'listening') {
      setVoiceState('idle');
    }
  }, [voiceState]);

  // Interrupt Nova Voice
  const interruptVoice = useCallback(() => {
    stopAudioPlayback();
    stopListening();
    setVoiceState('idle');
  }, [stopListening]);

  // Clear Chat
  const clearChat = () => {
    stopAudioPlayback();
    setMessages([
      {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        text: 'چیٹ ہسٹری صاف کر دی گئی ہے۔ بتائیے اب میں کیا کروں؟',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Replay Audio
  const replayAudio = (text: string) => {
    speakResponse(text);
  };

  // Memory Handlers
  const addMemory = (category: UserMemory['category'], key: string, value: string) => {
    const newMem: UserMemory = {
      id: 'mem_' + Date.now(),
      category,
      key,
      value,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const removeMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMemory = (id: string, key: string, value: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, key, value, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') } : m))
    );
  };

  // Device Action Handlers
  const toggleFlashlight = () => setDeviceState((p) => ({ ...p, flashlight: !p.flashlight }));
  const toggleWifi = () => setDeviceState((p) => ({ ...p, wifi: !p.wifi }));
  const toggleBluetooth = () => setDeviceState((p) => ({ ...p, bluetooth: !p.bluetooth }));
  const toggleDnd = () => setDeviceState((p) => ({ ...p, dnd: !p.dnd }));
  const toggleBatterySaver = () => setDeviceState((p) => ({ ...p, batterySaver: !p.batterySaver }));
  const setVolume = (val: number) => setDeviceState((p) => ({ ...p, volume: val }));
  const setBrightness = (val: number) => setDeviceState((p) => ({ ...p, brightness: val }));

  const addAlarm = (time: string, label: string = 'Alarm') => {
    setDeviceState((p) => ({
      ...p,
      activeAlarms: [...p.activeAlarms, { id: 'al_' + Date.now(), time, label, enabled: true }],
    }));
  };

  const removeAlarm = (id: string) => {
    setDeviceState((p) => ({ ...p, activeAlarms: p.activeAlarms.filter((a) => a.id !== id) }));
  };

  const toggleAlarm = (id: string) => {
    setDeviceState((p) => ({
      ...p,
      activeAlarms: p.activeAlarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    }));
  };

  const addTimer = (durationMinutes: number, label: string = 'Timer') => {
    const sec = Math.round(durationMinutes * 60);
    setDeviceState((p) => ({
      ...p,
      activeTimers: [
        ...p.activeTimers,
        { id: 'tm_' + Date.now(), durationSec: sec, remainingSec: sec, label, isRunning: true },
      ],
    }));
  };

  const removeTimer = (id: string) => {
    setDeviceState((p) => ({ ...p, activeTimers: p.activeTimers.filter((t) => t.id !== id) }));
  };

  const pauseResumeTimer = (id: string) => {
    setDeviceState((p) => ({
      ...p,
      activeTimers: p.activeTimers.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t)),
    }));
  };

  const addCalendarEvent = (title: string, date: string, time: string, location?: string) => {
    setDeviceState((p) => ({
      ...p,
      calendarEvents: [...p.calendarEvents, { id: 'cal_' + Date.now(), title, date, time, location }],
    }));
  };

  const removeCalendarEvent = (id: string) => {
    setDeviceState((p) => ({ ...p, calendarEvents: p.calendarEvents.filter((c) => c.id !== id) }));
  };

  const sendMessageToContact = (contact: string, message: string) => {
    setDeviceState((p) => ({
      ...p,
      recentMessages: [
        {
          id: 'msg_' + Date.now(),
          contact,
          message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...p.recentMessages,
      ],
    }));
  };

  const startCall = (contact: string) => {
    setActiveCallContact(contact);
  };

  const endCall = () => {
    setActiveCallContact(null);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AssistantContext.Provider
      value={{
        messages,
        voiceState,
        interimTranscript,
        micVolume,
        isListening,
        startListening,
        stopListening,
        sendMessage,
        interruptVoice,
        clearChat,
        replayAudio,
        memories,
        addMemory,
        removeMemory,
        updateMemory,
        deviceState,
        toggleFlashlight,
        toggleWifi,
        toggleBluetooth,
        toggleDnd,
        toggleBatterySaver,
        setVolume,
        setBrightness,
        addAlarm,
        removeAlarm,
        toggleAlarm,
        addTimer,
        removeTimer,
        pauseResumeTimer,
        addCalendarEvent,
        removeCalendarEvent,
        sendMessageToContact,
        activeCallContact,
        startCall,
        endCall,
        activeModal,
        setActiveModal,
        activeVideoProject,
        setActiveVideoProject,
        activeYouTubeQuery,
        setActiveYouTubeQuery,
        cameraInitialPrompt,
        setCameraInitialPrompt,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
