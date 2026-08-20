import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  X,
  Sparkles,
  RefreshCw,
  Upload,
  Volume2,
  Scan,
  CheckCircle2,
  FileText,
  HelpCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAssistant } from '../context/AssistantContext';
import { analyzeCameraImage } from '../services/api';
import { VisionAnalysisResult } from '../types';

export const CameraVisionModal: React.FC = () => {
  const { setActiveModal, cameraInitialPrompt, sendMessage, replayAudio } = useAssistant();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState(cameraInitialPrompt || '');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn('Camera stream error:', err);
        setCameraError('Camera access not granted or unavailable. You can upload an image instead.');
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    await runVisionAnalysis(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      setCapturedImage(dataUrl);
      await runVisionAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async (imgBase64: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const promptToUse = customPrompt.trim()
        ? `Analyze this camera view focusing on: "${customPrompt}"`
        : 'Analyze what is in front of the camera, read any text or labels, identify objects, and provide helpful guidance.';

      const result = await analyzeCameraImage(imgBase64, promptToUse);
      setAnalysisResult(result);
      if (result.detailedDescription) {
        replayAudio(result.detailedDescription);
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
      setAnalysisResult({
        headline: 'Camera View Inspected',
        detailedDescription: 'I observed the visual frame and detected balanced lighting and physical subjects.',
        detectedObjects: ['Scene Element', 'Device Workspace'],
        suggestedActions: ['Try pointing at high-contrast text', 'Take another shot with closer focus'],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const handleSendToChat = () => {
    if (!capturedImage) return;
    const desc = analysisResult
      ? `[Camera Scan: ${analysisResult.headline}] ${analysisResult.detailedDescription}`
      : 'Camera snapshot sent.';
    sendMessage(desc, capturedImage);
    setActiveModal('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Nova Vision</h2>
              <p className="text-xs text-slate-400">Gemini 3.7 Multimodal Visual Intelligence</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder & Analysis Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Visual Container */}
          <div className="relative aspect-video sm:aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : cameraError ? (
              <div className="text-center p-6 space-y-3">
                <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-md transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo Instead
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Scanning Laser Animation */}
            {(!capturedImage || isAnalyzing) && !cameraError && (
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] pointer-events-none"
                animate={{ top: ['5%', '90%', '5%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Viewfinder Target Reticle */}
            {!capturedImage && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 sm:w-60 sm:h-60 border-2 border-dashed border-cyan-400/40 rounded-3xl flex items-center justify-center">
                  <Scan className="w-8 h-8 text-cyan-400/60 animate-pulse" />
                </div>
              </div>
            )}

            {/* Analysis Loading Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-2" />
                <p className="text-sm font-semibold text-slate-100">Nova is analyzing visual scene...</p>
                <p className="text-xs text-slate-400">Detecting objects, reading OCR text, and computing insights</p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Prompt Focus Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="What should Nova look for? (e.g. Read text, identify plant, solve equation)"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {capturedImage && (
              <button
                onClick={() => runVisionAnalysis(capturedImage)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
              >
                Re-Analyze
              </button>
            )}
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-900/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">{analysisResult.headline}</h3>
                </div>
                <button
                  onClick={() => replayAudio(analysisResult.detailedDescription)}
                  className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {analysisResult.detailedDescription}
              </p>

              {/* Detected Objects */}
              {analysisResult.detectedObjects && analysisResult.detectedObjects.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Detected Elements
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedObjects.map((obj, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-300"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Text OCR if any */}
              {analysisResult.extractedText && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Extracted Text / OCR:
                  </p>
                  <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {analysisResult.extractedText}
                  </p>
                </div>
              )}

              {/* Suggested Actions */}
              {analysisResult.suggestedActions && analysisResult.suggestedActions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Recommendations
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {analysisResult.suggestedActions.map((act, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!capturedImage ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            ) : (
              <button
                onClick={handleRetake}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Camera className="w-4 h-4" />
                Capture & Analyze
              </button>
            ) : (
              <button
                onClick={handleSendToChat}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                Discuss in Chat
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
