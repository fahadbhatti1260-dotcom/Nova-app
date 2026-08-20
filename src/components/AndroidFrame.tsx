import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wifi,
  BatteryCharging,
  Battery,
  Signal,
  Sliders,
  Brain,
  Grid,
  Settings,
  Send,
  Camera,
  Play,
  Film,
  Flashlight,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Globe,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { ChatFeed } from './ChatFeed';
import { VoiceOrb } from './VoiceOrb';

export const AndroidFrame: React.FC = () => {
  const {
    voiceState,
    micVolume,
    isListening,
    startListening,
    stopListening,
    interruptVoice,
    sendMessage,
    clearChat,
    deviceState,
    toggleFlashlight,
    memories,
    setActiveModal,
    settings,
    updateSettings,
  } = useAssistant();

  const [inputText, setInputText] = useState('');

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleOrbClick = () => {
    if (voiceState === 'speaking') {
      interruptVoice();
    } else if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const isUrdu = settings.language === 'ur-PK';

  const toggleLanguage = () => {
    updateSettings({
      language: isUrdu ? 'en-US' : 'ur-PK',
    });
  };

  return (
    <div
      className={`min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4 text-slate-100 selection:bg-cyan-500 selection:text-white transition-all`}
      id="android-assistant-root"
    >
      {/* Device Frame */}
      <div
        className={`w-full h-screen sm:h-[840px] ${
          settings.fullScreenMode
            ? 'sm:max-w-4xl sm:h-[92vh] sm:rounded-3xl'
            : 'sm:max-w-[420px] sm:rounded-[44px]'
        } bg-slate-950 border-0 sm:border-8 border-slate-900 shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300`}
      >
        {/* Android Status Bar */}
        <div className="pt-2 px-5 pb-1 bg-slate-950 flex items-center justify-between text-xs font-semibold text-slate-300 select-none z-20">
          <span className="font-mono text-[11px]">{currentTime}</span>

          {/* Camera Hole Punch */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-900/60" />
          </div>

          <div className="flex items-center gap-1.5">
            {deviceState.dnd && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" title="DND on" />
            )}
            <Signal className="w-3.5 h-3.5" />
            {deviceState.wifi && <Wifi className="w-3.5 h-3.5 text-cyan-400" />}
            <div className="flex items-center gap-0.5 text-[10px] font-mono">
              <span>{deviceState.batteryLevel}%</span>
              {deviceState.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Battery className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </div>

        {/* Android System Header & Assistant Controls */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-900 backdrop-blur-md flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-100">Nova</h1>
                <button
                  onClick={toggleLanguage}
                  className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 flex items-center gap-1 transition-colors"
                  title="Toggle language (Urdu / English)"
                >
                  <Globe className="w-2.5 h-2.5" />
                  {isUrdu ? 'اردو' : 'EN'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                {voiceState === 'listening'
                  ? isUrdu
                    ? 'سن رہی ہوں (Listening)...'
                    : 'Listening to speech...'
                  : voiceState === 'speaking'
                  ? isUrdu
                    ? 'بول رہی ہوں (Speaking)...'
                    : 'Speaking response...'
                  : voiceState === 'processing'
                  ? 'Thinking...'
                  : isUrdu
                  ? 'تیار ہے (Web Speech Active)'
                  : 'Ready (Web Speech Active)'}
              </p>
            </div>
          </div>

          {/* Header Quick Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Quick Settings pull-down */}
            <button
              onClick={() => setActiveModal('quick_settings')}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Android Quick Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Memory Vault Button with counter badge */}
            <button
              onClick={() => setActiveModal('memory')}
              className="relative p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Memory Vault"
            >
              <Brain className="w-4 h-4 text-emerald-400" />
              {memories.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950 flex items-center justify-center shadow-xs">
                  {memories.length}
                </span>
              )}
            </button>

            {/* App Drawer */}
            <button
              onClick={() => setActiveModal('apps')}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="App Drawer"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveModal('settings')}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Assistant Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Frame Expand/Collapse Toggle */}
            <button
              onClick={() => updateSettings({ fullScreenMode: !settings.fullScreenMode })}
              className="hidden sm:inline-flex p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              title={settings.fullScreenMode ? 'Phone Frame View' : 'Full Screen View'}
            >
              {settings.fullScreenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        <ChatFeed />

        {/* Bottom Control Dock & Voice Orb */}
        <div className="p-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/80 border-t border-slate-900 backdrop-blur-lg flex flex-col items-center gap-2.5 z-20">
          {/* Quick Action Shortcut Pills */}
          <div className="w-full flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveModal('camera')}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-cyan-300 border border-slate-800 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Camera className="w-3 h-3" />
              {isUrdu ? 'کیمرہ' : 'Camera'}
            </button>

            <button
              onClick={() => setActiveModal('video_studio')}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-purple-300 border border-slate-800 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Film className="w-3 h-3" />
              {isUrdu ? 'ویڈیو اسٹوڈیو' : 'Video Studio'}
            </button>

            <button
              onClick={() => setActiveModal('youtube')}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] font-medium text-red-300 border border-slate-800 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              {isUrdu ? 'یوٹیوب' : 'YouTube'}
            </button>

            <button
              onClick={toggleFlashlight}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border flex items-center gap-1 shrink-0 transition-all ${
                deviceState.flashlight
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Flashlight className="w-3 h-3" />
              {isUrdu ? 'ٹارچ' : 'Torch'}
            </button>

            <button
              onClick={clearChat}
              className="p-1 rounded-xl bg-slate-900/80 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-800 shrink-0 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Central Voice Orb & Dynamic Visualizer */}
          <VoiceOrb
            state={voiceState}
            volumeLevel={micVolume}
            onClick={handleOrbClick}
            themeColor={settings.themeColor}
          />

          {/* Text Input Bar Fallback */}
          <form onSubmit={handleTextSubmit} className="w-full relative flex items-center gap-1.5 mt-0.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isUrdu ? "اردو یا انگلش میں بولیں یا لکھیں..." : "Ask Nova anything or tap voice..."}
              className="w-full pl-4 pr-10 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              dir="auto"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Android Navigation Gesture Bar */}
          <div className="w-full flex items-center justify-center pt-1">
            <div className="w-28 h-1 rounded-full bg-slate-700/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
