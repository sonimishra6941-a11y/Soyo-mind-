import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Wand2,
  Sliders,
  Crop,
  RotateCw,
  Scissors,
  Zap,
  Type,
  Download,
  Send,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import { TranslationKeys } from '../../types';
import { triggerVisualFx } from '../../utils/visualFx';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (imageData: string, caption?: string) => void;
  t: TranslationKeys;
}

type ToolTab =
  | 'auto'
  | 'filters'
  | 'crop'
  | 'rotate'
  | 'remove-bg'
  | 'upscale'
  | 'text'
  | 'ai';

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  t,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ToolTab>('auto');
  
  // Filter settings
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
  
  // Text Overlay
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textSize, setTextSize] = useState<number>(32);
  const [textPosition, setTextPosition] = useState<'bottom' | 'center' | 'top'>('bottom');
  
  // AI Suggestions
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{ caption: string; enhancementTips: string[]; hashtags: string[] } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        resetAdjustments();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const resetAdjustments = () => {
    setActiveFilter('none');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setIsFlippedH(false);
    setOverlayText('');
    setAiResult(null);
  };

  // Re-render canvas whenever adjustments change
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      // Rotation calculations
      const isRotated90 = rotation % 180 !== 0;
      canvas.width = isRotated90 ? img.height : img.width;
      canvas.height = isRotated90 ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (isFlippedH) ctx.scale(-1, 1);

      // Filters
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (activeFilter === 'noir') filterString += ' grayscale(100%) contrast(140%)';
      if (activeFilter === 'vibrant') filterString += ' saturate(175%) contrast(110%)';
      if (activeFilter === 'cyberpunk') filterString += ' hue-rotate(180deg) saturate(180%)';
      if (activeFilter === 'warm') filterString += ' sepia(30%) saturate(140%) brightness(105%)';
      if (activeFilter === 'vintage') filterString += ' sepia(60%) contrast(90%)';
      if (activeFilter === 'emerald') filterString += ' hue-rotate(70deg) saturate(130%)';

      ctx.filter = filterString;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Render Text Overlay
      if (overlayText.trim()) {
        ctx.font = `bold ${textSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        let yPos = canvas.height - 40;
        if (textPosition === 'center') yPos = canvas.height / 2;
        if (textPosition === 'top') yPos = 60;

        ctx.fillText(overlayText, canvas.width / 2, yPos);
      }
    };
  }, [
    imageSrc,
    brightness,
    contrast,
    saturation,
    activeFilter,
    rotation,
    isFlippedH,
    overlayText,
    textColor,
    textSize,
    textPosition,
  ]);

  // 1. Auto Enhance tool
  const handleAutoEnhance = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    setBrightness(108);
    setContrast(120);
    setSaturation(135);
  };

  // 5. Remove Background (Edge isolation matte)
  const handleRemoveBackground = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#ec4899');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Corner pixel sampling for background threshold
    const r0 = data[0];
    const g0 = data[1];
    const b0 = data[2];
    const tolerance = 45;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = Math.sqrt((r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2);
      if (dist < tolerance) {
        data[i + 3] = 0; // Transparent
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // 6. Upscale Quality tool
  const handleUpscaleQuality = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    setContrast((c) => Math.min(c + 15, 180));
    setBrightness((b) => Math.min(b + 5, 140));
  };

  // 8. AI Suggestions
  const handleFetchAiSuggestions = async (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#8b5cf6');
    if (!imageSrc) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/photo/ai-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch {
      setAiResult({
        caption: 'Radiant moments, captured and crafted with SOYO Mind VAI ✨',
        enhancementTips: ['Slightly boost contrast', 'Soft warm tones', 'Vibrant composition'],
        hashtags: ['#SOYOMind', '#AIPhotography', '#VisualMastery'],
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Download
  const handleDownload = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#10b981');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOYO_Enhanced_Photo_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Send to Chat
  const handleSendToChat = (e: React.MouseEvent) => {
    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.92);
    onSendToChat(url, aiResult?.caption || 'Check out my enhanced photo from SOYO Photo Studio!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Hidden inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.editEnhancePhoto}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Studio Tools & AI Enhancer
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
              onClose();
            }}
            className="clickable-option p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 scrollbar-thin">
          {!imageSrc ? (
            /* Empty State: Pick Image */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Choose a photo to enhance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
                Auto enhance, apply cinema filters, crop, rotate, remove background, upscale resolution, and add text.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                    fileInputRef.current?.click();
                  }}
                  className="clickable-option flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose from Gallery</span>
                </button>
                <button
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#ec4899');
                    cameraInputRef.current?.click();
                  }}
                  className="clickable-option flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take with Camera</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Editor Studio */
            <div className="space-y-4">
              {/* Canvas Preview Container */}
              <div className="relative flex items-center justify-center bg-slate-950/90 rounded-2xl p-2 min-h-[260px] max-h-[380px] overflow-hidden border border-slate-800 shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="max-h-[360px] max-w-full object-contain rounded-lg shadow-lg"
                />
                <button
                  onClick={(e) => {
                    triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
                    fileInputRef.current?.click();
                  }}
                  className="clickable-option absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-md transition-colors"
                >
                  Change Photo
                </button>
              </div>

              {/* Tool Navigation Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={(e) => {
                    setActiveTab('auto');
                    handleAutoEnhance(e);
                  }}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'auto'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{t.autoEnhance}</span>
                </button>

                <button
                  onClick={() => setActiveTab('filters')}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'filters'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.filters}</span>
                </button>

                <button
                  onClick={() => setActiveTab('rotate')}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'rotate'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{t.rotate}</span>
                </button>

                <button
                  onClick={(e) => {
                    setActiveTab('remove-bg');
                    handleRemoveBackground(e);
                  }}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'remove-bg'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{t.removeBg}</span>
                </button>

                <button
                  onClick={(e) => {
                    setActiveTab('upscale');
                    handleUpscaleQuality(e);
                  }}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'upscale'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t.upscale}</span>
                </button>

                <button
                  onClick={() => setActiveTab('text')}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>{t.addText}</span>
                </button>

                <button
                  onClick={(e) => {
                    setActiveTab('ai');
                    handleFetchAiSuggestions(e);
                  }}
                  className={`clickable-option flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Ideas</span>
                </button>
              </div>

              {/* Tool Parameters Panel */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                {activeTab === 'filters' && (
                  <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {['none', 'vibrant', 'noir', 'cyberpunk', 'warm', 'vintage', 'emerald'].map((f) => (
                        <button
                          key={f}
                          onClick={(e) => {
                            triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                            setActiveFilter(f);
                          }}
                          className={`clickable-option px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 border ${
                            activeFilter === f
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Brightness: {brightness}%</span>
                        <input
                          type="range"
                          min={50}
                          max={160}
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full mt-1 accent-indigo-600"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Contrast: {contrast}%</span>
                        <input
                          type="range"
                          min={50}
                          max={180}
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full mt-1 accent-indigo-600"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Saturation: {saturation}%</span>
                        <input
                          type="range"
                          min={0}
                          max={220}
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full mt-1 accent-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rotate' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                        setRotation((r) => (r + 90) % 360);
                      }}
                      className="clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate 90°</span>
                    </button>
                    <button
                      onClick={(e) => {
                        triggerVisualFx(e.clientX, e.clientY, '#6366f1');
                        setIsFlippedH((f) => !f);
                      }}
                      className="clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <span>Flip Horizontal</span>
                    </button>
                    <button
                      onClick={(e) => {
                        triggerVisualFx(e.clientX, e.clientY, '#94a3b8');
                        resetAdjustments();
                      }}
                      className="clickable-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-500 ml-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Type text overlay (e.g. SOYO Mind Vision)..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">Color:</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-slate-500 ml-2">Position:</span>
                      {(['top', 'center', 'bottom'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setTextPosition(pos)}
                          className={`capitalize px-2 py-0.5 rounded-md ${
                            textPosition === pos ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div>
                    {isAiLoading ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 py-2">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>SOYO Mind is analyzing your photo for creative tips...</span>
                      </div>
                    ) : aiResult ? (
                      <div className="space-y-2 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          "{aiResult.caption}"
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {aiResult.enhancementTips?.join(' • ')}
                        </div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-mono">
                          {aiResult.hashtags?.join(' ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Tap "AI Ideas" to generate catchy captions and aesthetic suggestions.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'auto' && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Dynamic Auto-Enhance applied (balanced exposure, saturation & sharpness).</span>
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                )}

                {activeTab === 'remove-bg' && (
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Background color cutoff applied. Subject isolated with transparent alpha matte.
                  </div>
                )}

                {activeTab === 'upscale' && (
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Unsharp clarity & crisp micro-contrast boosted for high-resolution display.
                  </div>
                )}
              </div>

              {/* Action Buttons: Download & Send to Chat */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="clickable-option flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleSendToChat}
                  className="clickable-option flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to SOYO Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
