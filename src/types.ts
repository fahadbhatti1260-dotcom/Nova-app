export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface UserMemory {
  id: string;
  category: 'personal' | 'preference' | 'relationship' | 'habit' | 'work' | 'health' | 'reminder';
  key: string;
  value: string;
  timestamp: string;
  confidence?: number;
}

export type ActionType = 
  | 'phone_alarm'
  | 'phone_timer'
  | 'phone_call'
  | 'phone_message'
  | 'phone_setting_toggle'
  | 'phone_calendar'
  | 'phone_app_launch'
  | 'camera_vision'
  | 'video_create'
  | 'youtube_search';

export interface ActionPayload {
  type: ActionType;
  title: string;
  data: Record<string, any>;
  status: 'pending' | 'executed' | 'failed';
  resultDescription?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  audioBase64?: string;
  action?: ActionPayload;
  visionImage?: string;
  memoriesUpdated?: string[];
}

export interface DeviceState {
  wifi: boolean;
  bluetooth: boolean;
  flashlight: boolean;
  dnd: boolean;
  batterySaver: boolean;
  batteryLevel: number;
  isCharging: boolean;
  volume: number; // 0-100
  brightness: number; // 0-100
  activeAlarms: { id: string; time: string; label: string; enabled: boolean }[];
  activeTimers: { id: string; durationSec: number; remainingSec: number; label: string; isRunning: boolean }[];
  calendarEvents: { id: string; title: string; time: string; date: string; location?: string }[];
  recentMessages: { id: string; contact: string; message: string; time: string }[];
}

export interface VideoScene {
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  narration: string;
  cameraMovement: string;
  estimatedDuration: string;
  colorPalette: string[];
}

export interface VideoProject {
  id: string;
  title: string;
  genre: string;
  summary: string;
  targetAudience: string;
  scenes: VideoScene[];
  fullScript: string;
  createdAt: string;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  summary?: string;
  keyTakeaways?: string[];
}

export interface VisionAnalysisResult {
  headline: string;
  detailedDescription: string;
  detectedObjects: string[];
  suggestedActions: string[];
  extractedText?: string;
  adviceOrInsight?: string;
}

export interface AppSettings {
  language: 'ur-PK' | 'en-US' | 'auto';
  voiceName: 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir';
  useGeminiTTS: boolean;
  autoSpeakResponse: boolean;
  continuousListening: boolean;
  hapticFeedback: boolean;
  speechRate: number;
  speechPitch: number;
  userName: string;
  themeColor: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  fullScreenMode: boolean;
}
