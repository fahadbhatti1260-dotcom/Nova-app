import { ChatMessage, UserMemory, DeviceState, VisionAnalysisResult, VideoProject, YouTubeVideoItem, ActionPayload } from '../types';

export interface ChatResponse {
  reply: string;
  action: ActionPayload | null;
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[],
  memories: UserMemory[],
  deviceState: DeviceState
): Promise<ChatResponse> {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory,
      memories,
      deviceState,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send message to Nova');
  }

  return res.json();
}

export async function requestTTS(text: string, voiceName: string): Promise<{ audioBase64: string | null; sampleRate?: number }> {
  try {
    const res = await fetch('/api/assistant/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });
    if (!res.ok) return { audioBase64: null };
    return res.json();
  } catch (err) {
    console.warn('TTS request error:', err);
    return { audioBase64: null };
  }
}

export async function analyzeCameraImage(
  imageBase64: string,
  prompt?: string
): Promise<VisionAnalysisResult> {
  const res = await fetch('/api/assistant/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt }),
  });

  if (!res.ok) {
    throw new Error('Failed to analyze camera image');
  }

  return res.json();
}

export async function generateVideoProject(
  topic: string,
  style: string,
  duration: string
): Promise<VideoProject> {
  const res = await fetch('/api/assistant/video-studio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, style, duration }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate video project');
  }

  return res.json();
}

export async function searchYouTubeVideos(
  query: string,
  focus?: string
): Promise<{ videos: YouTubeVideoItem[] }> {
  const res = await fetch('/api/assistant/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, focus }),
  });

  if (!res.ok) {
    throw new Error('Failed to search YouTube');
  }

  return res.json();
}
