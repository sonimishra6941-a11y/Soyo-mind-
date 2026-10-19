import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  FileText,
  Eye,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { TranslationKeys, VisionAnalysisResult } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';
import { speechService } from '../../services/speech';

interface VisionCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (imageData: string, analysisSummary: string) => void;
  t: TranslationKeys;
  languageName: string;
}

export const VisionCameraModal: React.FC<VisionCameraModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  t,
  languageName,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'full' | 'ocr' | 'objects'>('full');
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start / Stop camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
      speechService.stopSpeaking();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera access required. Please allow camera permission or use photo upload.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video stream
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleCaptureAndAnalyze = async (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    const imageBase64 = captureFrame();
    if (!imageBase64) return;

    setCapturedImage(imageBase64);
    setIsScanning(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          mode: analysisMode,
          language: languageName,
        }),
      });

      const data = await res.json();
      setAnalysisResult(data);

      // Auto-read summary if active
      if (data.description) {
        speechService.speak(data.description, 1.0, 1.0, -1, () => setIsSpeaking(false));
        setIsSpeaking(true);
      }
    } catch (err) {
      setAnalysisResult({
        description: 'Unable to analyze scene right now. Please check network.',
        objects: ['Scene element'],
        detectedText: '',
        labels: ['Visual'],
        suggestedQuestions: ['What is this?'],
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetake = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
    setCapturedImage(null);
    setAnalysisResult(null);
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleToggleVoice = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else if (analysisResult?.description) {
      speechService.speak(analysisResult.description, 1.0, 1.0, -1, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handleCopyOcr = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    if (analysisResult?.detectedText) {
      navigator.clipboard.writeText(analysisResult.detectedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleSendSceneToChat = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    if (capturedImage && analysisResult) {
      const summary = `**AI Camera Vision Findings:**\n${analysisResult.description}\n\n**Detected Objects:** ${analysisResult.objects.join(', ')}\n${
        analysisResult.detectedText ? `\n**Extracted Text:**\n${analysisResult.detectedText}` : ''
      }`;
      onSendToChat(capturedImage, summary);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>{t.aiCamera}</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Vision
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Real-time Object, Scene & OCR Recognition
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
              onClose();
            }}
            className="clickable-option p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setAnalysisMode('full')}
            className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              analysisMode === 'full'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Scene & Objects</span>
          </button>

          <button
            onClick={() => setAnalysisMode('ocr')}
            className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              analysisMode === 'ocr'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>OCR Text Extractor</span>
          </button>

          <button
            onClick={() => setAnalysisMode('objects')}
            className={`clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              analysisMode === 'objects'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Plant / Animal / Object ID</span>
          </button>
        </div>

        {/* Viewfinder / Camera View */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
          {cameraError ? (
            <div className="text-center p-6 max-w-sm">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-rose-400 mb-1">{cameraError}</p>
              <p className="text-xs text-slate-400">
                Grant camera access to use real-time visual recognition.
              </p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured Scene" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />
          )}

          {/* Futuristic HUD Crosshairs & Scanning Laser overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg" />

            {/* Scanning Laser Beam */}
            {isScanning && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[bounce_2s_infinite]" />
            )}
          </div>

          {/* Switch Camera Button */}
          {!capturedImage && !cameraError && (
            <button
              onClick={toggleFacingMode}
              title="Flip Camera"
              className="clickable-option absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Vision Analysis Results Drawer / Card */}
        {analysisResult && (
          <div className="p-4 bg-slate-800/95 border-t border-slate-700/80 space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>SOYO Vision Analysis</span>
              </div>
              <button
                onClick={handleToggleVoice}
                className="clickable-option flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition-colors"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Mute' : 'Speak'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {analysisResult.description}
            </p>

            {/* Detected Objects badges */}
            {analysisResult.objects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Objects:</span>
                {analysisResult.objects.map((obj, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-medium"
                  >
                    {obj}
                  </span>
                ))}
              </div>
            )}

            {/* OCR Extracted Text */}
            {analysisResult.detectedText && analysisResult.detectedText !== 'No readable text detected' && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-start justify-between gap-2 text-xs font-mono text-slate-300">
                <div className="truncate max-w-[85%]">{analysisResult.detectedText}</div>
                <button
                  onClick={handleCopyOcr}
                  className="clickable-option p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Controls: Snapshot Button / Retake / Send to Chat */}
        <div className="p-4 bg-slate-950 flex items-center justify-between gap-3 border-t border-slate-800">
          {!capturedImage ? (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={handleCaptureAndAnalyze}
                disabled={isScanning || !!cameraError}
                className="clickable-option relative p-1 rounded-full border-4 border-emerald-500/80 hover:border-emerald-400 active:scale-95 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  {isScanning ? (
                    <Sparkles className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={handleRetake}
                className="clickable-option flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake</span>
              </button>

              <button
                onClick={handleSendSceneToChat}
                className="clickable-option flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all ml-auto"
              >
                <Send className="w-4 h-4" />
                <span>Send to SOYO Chat</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
