import React from 'react';
import {
  AlarmClock,
  Timer as TimerIcon,
  Phone,
  MessageSquare,
  Sliders,
  Calendar,
  ExternalLink,
  Camera,
  Film,
  Play,
  CheckCircle2,
  Trash2,
  Pause,
  Sun,
  Volume2,
  Wifi,
  Bluetooth,
  Flashlight,
  Video,
} from 'lucide-react';
import { ActionPayload } from '../types';
import { useAssistant } from '../context/AssistantContext';

interface ActionCardProps {
  action: ActionPayload;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const {
    deviceState,
    toggleAlarm,
    removeAlarm,
    pauseResumeTimer,
    removeTimer,
    toggleFlashlight,
    toggleWifi,
    toggleBluetooth,
    startCall,
    setActiveModal,
    setActiveYouTubeQuery,
  } = useAssistant();

  switch (action.type) {
    case 'phone_alarm': {
      const alarmTime = action.data.time || '07:00 AM';
      const alarmLabel = action.data.label || 'Alarm';
      const matchedAlarm = deviceState.activeAlarms.find((a) => a.time === alarmTime) || {
        id: 'temp',
        time: alarmTime,
        label: alarmLabel,
        enabled: true,
      };

      return (
        <div className="mt-2.5 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlarmClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-100">{alarmTime}</p>
                <p className="text-xs text-slate-400">{alarmLabel} • Android Clock</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAlarm(matchedAlarm.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  matchedAlarm.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    matchedAlarm.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'phone_timer': {
      const timerLabel = action.data.label || 'Timer';
      const durationMin = action.data.durationMinutes || 1;
      const matchedTimer = deviceState.activeTimers[deviceState.activeTimers.length - 1];
      const remaining = matchedTimer ? matchedTimer.remainingSec : Math.round(durationMin * 60);

      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-950/60 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                <TimerIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-mono font-bold tracking-wider text-cyan-300">{formatted}</p>
                <p className="text-xs text-slate-400">{timerLabel} • Running</p>
              </div>
            </div>

            {matchedTimer && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => pauseResumeTimer(matchedTimer.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title={matchedTimer.isRunning ? 'Pause' : 'Resume'}
                >
                  {matchedTimer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeTimer(matchedTimer.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/50 text-red-400 transition-colors"
                  title="Cancel Timer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'phone_call': {
      const contactName = action.data.contact || 'Unknown Contact';

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-900/40 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                {contactName[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">{contactName}</p>
                <p className="text-xs text-emerald-400/90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Initiating Phone Call
                </p>
              </div>
            </div>

            <button
              onClick={() => startCall(contactName)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Open Call
            </button>
          </div>
        </div>
      );
    }

    case 'phone_message': {
      const { contact, message } = action.data;

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-blue-900/40 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200">SMS to {contact}</span>
                <span className="text-[10px] text-blue-400/90 bg-blue-500/10 px-2 py-0.5 rounded-full">Sent</span>
              </div>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                "{message}"
              </p>
            </div>
          </div>
        </div>
      );
    }

    case 'phone_setting_toggle': {
      const { setting } = action.data;

      return (
        <div className="mt-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              {setting === 'flashlight' && <Flashlight className="w-4 h-4" />}
              {setting === 'wifi' && <Wifi className="w-4 h-4" />}
              {setting === 'bluetooth' && <Bluetooth className="w-4 h-4" />}
              {setting === 'volume' && <Volume2 className="w-4 h-4" />}
              {setting === 'brightness' && <Sun className="w-4 h-4" />}
              {!['flashlight', 'wifi', 'bluetooth', 'volume', 'brightness'].includes(setting) && (
                <Sliders className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200 capitalize">{action.title}</p>
              <p className="text-[10px] text-slate-400">{action.resultDescription || 'Setting updated'}</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
            Done
          </span>
        </div>
      );
    }

    case 'phone_calendar': {
      const { title, date, time, location } = action.data;

      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-900/40 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-100">{title}</p>
              <p className="text-xs text-indigo-300 mt-0.5">
                📅 {date} at {time}
              </p>
              {location && <p className="text-[11px] text-slate-400 mt-0.5">📍 {location}</p>}
            </div>
          </div>
        </div>
      );
    }

    case 'youtube_search': {
      return (
        <div className="mt-2.5 p-3 rounded-2xl bg-red-950/30 border border-red-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400">
              <Play className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">YouTube Search</p>
              <p className="text-[11px] text-slate-400">"{action.data.query}"</p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveYouTubeQuery(action.data.query || '');
              setActiveModal('youtube');
            }}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Videos
          </button>
        </div>
      );
    }

    case 'video_create': {
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-300">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-200">Video Studio Ready</p>
                <p className="text-[11px] text-slate-300">Topic: "{action.data.topic}"</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('video_studio')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              Open Studio
            </button>
          </div>
        </div>
      );
    }

    case 'camera_vision': {
      return (
        <div className="mt-2.5 p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-200">Camera Vision Analysis</p>
              <p className="text-[11px] text-slate-400">{action.data.focusArea || 'Visual scanner'}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('camera')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            Launch Camera
          </button>
        </div>
      );
    }

    case 'phone_app_launch': {
      return (
        <div className="mt-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">{action.title}</p>
              <p className="text-[10px] text-slate-400">Android Application</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('apps')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
          >
            View Apps
          </button>
        </div>
      );
    }

    default:
      return null;
  }
};
