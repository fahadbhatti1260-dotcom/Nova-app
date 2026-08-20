import React from 'react';
import { motion } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Flashlight,
  Moon,
  BatteryCharging,
  Battery,
  Sun,
  Volume2,
  VolumeX,
  X,
  Sliders,
  AlarmClock,
  Timer as TimerIcon,
  Shield,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';

export const QuickSettingsDrawer: React.FC = () => {
  const {
    deviceState,
    toggleWifi,
    toggleBluetooth,
    toggleFlashlight,
    toggleDnd,
    toggleBatterySaver,
    setVolume,
    setBrightness,
    setActiveModal,
  } = useAssistant();

  const tiles = [
    {
      id: 'wifi',
      label: 'Internet',
      sublabel: deviceState.wifi ? 'Wi-Fi 6E' : 'Disconnected',
      active: deviceState.wifi,
      icon: deviceState.wifi ? Wifi : WifiOff,
      action: toggleWifi,
      color: 'bg-cyan-500 text-slate-950',
    },
    {
      id: 'bt',
      label: 'Bluetooth',
      sublabel: deviceState.bluetooth ? 'Pixel Buds Pro' : 'Off',
      active: deviceState.bluetooth,
      icon: deviceState.bluetooth ? Bluetooth : BluetoothOff,
      action: toggleBluetooth,
      color: 'bg-blue-500 text-slate-950',
    },
    {
      id: 'torch',
      label: 'Flashlight',
      sublabel: deviceState.flashlight ? 'Torch ON' : 'Off',
      active: deviceState.flashlight,
      icon: Flashlight,
      action: toggleFlashlight,
      color: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'dnd',
      label: 'Do Not Disturb',
      sublabel: deviceState.dnd ? 'Priority Only' : 'Off',
      active: deviceState.dnd,
      icon: Moon,
      action: toggleDnd,
      color: 'bg-purple-500 text-slate-950',
    },
    {
      id: 'saver',
      label: 'Battery Saver',
      sublabel: deviceState.batterySaver ? 'Standard Saver' : `${deviceState.batteryLevel}%`,
      active: deviceState.batterySaver,
      icon: deviceState.isCharging ? BatteryCharging : Battery,
      action: toggleBatterySaver,
      color: 'bg-emerald-500 text-slate-950',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-5 text-slate-100 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">Android Quick Settings</h3>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Setting Tiles Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={tile.action}
                className={`p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                  tile.active
                    ? `${tile.color} shadow-md`
                    : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-2 rounded-xl ${
                    tile.active ? 'bg-black/10' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{tile.label}</p>
                  <p className={`text-[10px] truncate ${tile.active ? 'opacity-80' : 'text-slate-500'}`}>
                    {tile.sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sliders (Brightness & Volume) */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          {/* Brightness */}
          <div className="flex items-center gap-3">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={deviceState.brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">
              {deviceState.brightness}%
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            {deviceState.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <input
              type="range"
              min="0"
              max="100"
              value={deviceState.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">
              {deviceState.volume}%
            </span>
          </div>
        </div>

        {/* Diagnostics Info Pill */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <Cpu className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-[10px] text-slate-400">Tensor G4 AI</p>
            <p className="text-xs font-bold text-slate-200">Optimal</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <HardDrive className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-[10px] text-slate-400">Storage</p>
            <p className="text-xs font-bold text-slate-200">128 GB Free</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[10px] text-slate-400">Security</p>
            <p className="text-xs font-bold text-emerald-400">Protected</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
