import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  X,
  Sparkles,
  Play,
  Pause,
  Video,
  Clapperboard,
  Palette,
  Camera,
  Layers,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Download,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { generateVideoProject } from '../services/api';
import { VideoProject, VideoScene } from '../types';

export const VideoStudioModal: React.FC = () => {
  const {
    activeVideoProject,
    setActiveVideoProject,
    setActiveModal,
    replayAudio,
  } = useAssistant();

  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [duration, setDuration] = useState('30s');
  const [isGenerating, setIsGenerating] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const styleOptions = [
    { label: 'Cinematic', desc: 'Dramatic lighting, anamorphic lens flares' },
    { label: 'Cyberpunk Sci-Fi', desc: 'Neon holograms, rain-slicked cityscapes' },
    { label: 'Tech Commercial', desc: 'Minimalist studio, sleek macro rotations' },
    { label: 'Anime / Ghibli', desc: 'Vibrant painted aesthetics, lush skies' },
    { label: 'Documentary', desc: 'Grounded realism, cinematic handheld' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const project = await generateVideoProject(topic.trim(), style, duration);
      setActiveVideoProject(project);
      setActiveSceneIdx(0);
      setIsPlaying(false);
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayScene = (idx: number) => {
    if (!activeVideoProject?.scenes[idx]) return;
    setActiveSceneIdx(idx);
    setIsPlaying(true);
    const scene = activeVideoProject.scenes[idx];
    if (scene.narration) {
      replayAudio(scene.narration);
    }
  };

  const handleCopyScript = () => {
    if (!activeVideoProject) return;
    navigator.clipboard.writeText(activeVideoProject.fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentScene: VideoScene | undefined = activeVideoProject?.scenes[activeSceneIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Nova Video Studio</h2>
              <p className="text-xs text-slate-400">AI Storyboard & Cinematic Video Production Suite</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Creation Form */}
          <form onSubmit={handleGenerate} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Prompt Video Concept
              </span>
              <div className="flex gap-1.5">
                {['15s', '30s', '60s'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      duration === d
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. First human landing on Saturn's moon Titan with futuristic rover"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            {/* Style Selector Chips */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Visual Genre</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setStyle(opt.label)}
                    className={`p-2 rounded-xl text-left border text-xs transition-all ${
                      style === opt.label
                        ? 'bg-purple-500/20 text-purple-200 border-purple-500/50'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-semibold text-[11px]">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Storyboard & Scenes...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Generate Storyboard Project
                </>
              )}
            </button>
          </form>

          {/* Active Project View */}
          {activeVideoProject && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Project Meta Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      {activeVideoProject.genre}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100">{activeVideoProject.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{activeVideoProject.summary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyScript}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Script
                  </button>
                  <button
                    onClick={() => handlePlayScene(0)}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play Reel
                  </button>
                </div>
              </div>

              {/* Cinematic Scene Preview Screen */}
              {currentScene && (
                <div className="rounded-2xl overflow-hidden border border-purple-800/40 bg-slate-950 shadow-xl">
                  {/* Virtual Viewport with Dynamic Gradient Background based on scene palette */}
                  <div
                    className="relative aspect-video flex flex-col justify-between p-4 sm:p-6 transition-all duration-700"
                    style={{
                      background: `linear-gradient(135deg, ${currentScene.colorPalette[0] || '#0f172a'}, ${currentScene.colorPalette[1] || '#1e1b4b'}, #020617)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-purple-300 border border-purple-500/30">
                        Scene {currentScene.sceneNumber}: {currentScene.title}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-300 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-purple-400" />
                        {currentScene.cameraMovement}
                      </span>
                    </div>

                    {/* Visual Prompt Description Overlay */}
                    <div className="bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-slate-800/80 max-w-xl mx-auto my-auto text-center space-y-1.5">
                      <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed italic">
                        "{currentScene.visualPrompt}"
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {currentScene.colorPalette.map((col, cIdx) => (
                          <span
                            key={cIdx}
                            className="w-3 h-3 rounded-full border border-slate-700 shadow-xs"
                            style={{ backgroundColor: col }}
                            title={col}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Subtitle / Narration Bar */}
                    <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <p className="text-xs text-purple-200 truncate">{currentScene.narration}</p>
                      </div>

                      <button
                        onClick={() => replayAudio(currentScene.narration)}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-[11px] font-bold text-white shrink-0 transition-colors"
                      >
                        Hear Voiceover
                      </button>
                    </div>
                  </div>

                  {/* Scene Navigation Strip */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                    <button
                      disabled={activeSceneIdx === 0}
                      onClick={() => handlePlayScene(activeSceneIdx - 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {activeVideoProject.scenes.map((sc, sIdx) => (
                        <button
                          key={sc.sceneNumber}
                          onClick={() => handlePlayScene(sIdx)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            activeSceneIdx === sIdx
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Scene {sc.sceneNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={activeSceneIdx === activeVideoProject.scenes.length - 1}
                      onClick={() => handlePlayScene(activeSceneIdx + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Storyboard Scene Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Scene Breakdown & Camera Notes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeVideoProject.scenes.map((scene, i) => (
                    <div
                      key={i}
                      onClick={() => handlePlayScene(i)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        activeSceneIdx === i
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-200">
                          #{scene.sceneNumber} {scene.title}
                        </span>
                        <span className="text-[10px] text-purple-400 font-mono">{scene.estimatedDuration}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{scene.visualPrompt}</p>
                      <p className="text-[11px] text-purple-300/90 font-medium italic">"{scene.narration}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
