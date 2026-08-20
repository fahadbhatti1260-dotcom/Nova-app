import React from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  X,
  Volume2,
  User,
  Palette,
  Smartphone,
  Check,
  Globe,
  Gauge,
  Zap,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { AppSettings } from '../types';

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings, setActiveModal, replayAudio } = useAssistant();

  const languages: { id: AppSettings['language']; label: string; desc: string }[] = [
    { id: 'ur-PK', label: 'اردو (Urdu - Pakistan)', desc: 'Fast native Urdu voice & speech recognition' },
    { id: 'en-US', label: 'English (US)', desc: 'Fast English voice & speech recognition' },
    { id: 'auto', label: 'خودکار (Auto-Detect)', desc: 'Auto switches based on spoken or typed language' },
  ];

  const voices: { id: AppSettings['voiceName']; name: string; desc: string }[] = [
    { id: 'Zephyr', name: 'Zephyr', desc: 'Calm, crisp, warm tone' },
    { id: 'Kore', name: 'Kore', desc: 'Bright, cheerful, energetic voice' },
    { id: 'Puck', name: 'Puck', desc: 'Engaging, playful, friendly cadence' },
    { id: 'Fenrir', name: 'Fenrir', desc: 'Deep, resonant, authoritative voice' },
  ];

  const themes: { id: AppSettings['themeColor']; label: string; colorClass: string }[] = [
    { id: 'cyan', label: 'Android Cyan', colorClass: 'bg-cyan-500' },
    { id: 'purple', label: 'Indigo Velvet', colorClass: 'bg-purple-500' },
    { id: 'emerald', label: 'Emerald Forest', colorClass: 'bg-emerald-500' },
    { id: 'amber', label: 'Cyber Amber', colorClass: 'bg-amber-500' },
    { id: 'rose', label: 'Sunset Rose', colorClass: 'bg-rose-500' },
  ];

  const testVoice = (lang: AppSettings['language']) => {
    updateSettings({ language: lang });
    if (lang === 'ur-PK') {
      replayAudio('السلام علیکم، میں نووا ہوں۔ میں اردو میں تیز ترین رفتار سے بول سکتی ہوں۔');
    } else {
      replayAudio("Hello! I'm Nova, your Android AI assistant.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Nova Assistant Settings</h3>
              <p className="text-xs text-slate-400">Urdu & English Web Speech & Voice Actions</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Primary Assistant Language (زبان)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-cyan-400" /> Zero Delay
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => testVoice(l.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  settings.language === l.id
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-xs'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold">{l.label}</span>
                  {settings.language === l.id && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* User Identity */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Your Name / Nickname
          </label>
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="Your name"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Speech Speed & Pitch Controls */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Browser Web Speech Speed & Pitch
            </span>
            <span className="text-xs text-cyan-400 font-mono font-bold">{settings.speechRate || 1.05}x</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 w-16">Speed:</span>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={settings.speechRate || 1.05}
                onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Voice Tone Model
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {voices.map((v) => (
              <button
                key={v.id}
                onClick={() => updateSettings({ voiceName: v.id })}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  settings.voiceName === v.id
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-xs'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{v.name}</span>
                  {settings.voiceName === v.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Behavior Toggles */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 divide-y divide-slate-800/80">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-semibold text-slate-200">Auto-Speak Responses</p>
              <p className="text-[10px] text-slate-400">Nova automatically reads answers out loud instantly</p>
            </div>
            <button
              onClick={() => updateSettings({ autoSpeakResponse: !settings.autoSpeakResponse })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoSpeakResponse ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSpeakResponse ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Theme Accents */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            Material You Theme Accent
          </label>
          <div className="flex gap-2">
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => updateSettings({ themeColor: th.id })}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                  settings.themeColor === th.id
                    ? 'border-white/80 bg-slate-800 shadow-md scale-105'
                    : 'border-slate-800 bg-slate-950/60 opacity-60 hover:opacity-100'
                }`}
                title={th.label}
              >
                <span className={`w-4 h-4 rounded-full ${th.colorClass}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Full-Screen Viewport Mode
            </p>
            <p className="text-[10px] text-slate-400">Expand assistant outside the Android chassis</p>
          </div>
          <button
            onClick={() => updateSettings({ fullScreenMode: !settings.fullScreenMode })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.fullScreenMode ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.fullScreenMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
