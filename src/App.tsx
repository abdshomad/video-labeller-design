/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ModeSwitcher from './components/ModeSwitcher';
import VideoPlayer from './components/VideoPlayer';
import ModelSelector from './components/ModelSelector';
import AnnotationCanvas from './components/AnnotationCanvas';
import AnnotationsSidebar from './components/AnnotationsSidebar';
import TimelineControl from './components/TimelineControl';
import DrawingToolbar from './components/DrawingToolbar';
import FilmstripView from './components/FilmstripView';

import { Annotation, VideoMetadata, ToolType, AppMode, ModelConfig, FrameAnnotations, AutoLabelRule, CustomModelWeight } from './types';
import { Cpu, AlertCircle, Sparkles } from 'lucide-react';
import { SAMPLE_VIDEOS, MOCK_LABELS } from '../data/mockup/videos';
import { renderMockFrame } from '../data/mockup/frameRenderer';
import { DEFAULT_AUTOLABEL_RULES } from '../data/mockup/autoLabelRules';
import {
  getFrameAnnotations,
  saveFrameAnnotations,
  copyFromPreviousFrame,
  autoLabelFrame
} from './services/api';
import AdvancedPipelineTabs from './components/AdvancedPipelineTabs';
import SampleVideosSelector from './components/SampleVideosSelector';
import { applyLabelRules } from './utils/rulesFilter';
import EnhancementPlanViewer from './components/EnhancementPlanViewer';
import KeyboardShortcutsGuide from './components/KeyboardShortcutsGuide';
import LandingPage from './components/LandingPage';
import OnboardingTour from './components/OnboardingTour';
import DetectionOnboardingModal from './components/DetectionOnboardingModal';

export default function App() {
  const [activeVideo, setActiveVideo] = useState<VideoMetadata>(SAMPLE_VIDEOS[0]);
  const [isMediaLoaded, setIsMediaLoaded] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [mode, setMode] = useState<AppMode>('demo');
  const [activeScreen, setActiveScreen] = useState<'labeling' | 'models' | 'plan'>('labeling');
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ [frame: number]: 'idle' | 'processing' | 'completed' | 'failed' } | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  
  // SAM3 Interactive States
  const [sam3Points, setSam3Points] = useState<{ x: number; y: number; polarity: 'positive' | 'negative' }[]>([]);
  const [sam3ObjectSize, setSam3ObjectSize] = useState<number>(45);
  const [sam3PointPolarity, setSam3PointPolarity] = useState<'positive' | 'negative'>('positive');
  
  // Custom uploaded file reference
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [showDetectionModal, setShowDetectionModal] = useState<boolean>(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [pendingVideoMeta, setPendingVideoMeta] = useState<VideoMetadata | null>(null);
  const [onboardedVideoClasses, setOnboardedVideoClasses] = useState<{[videoId: string]: string[]}>({});

  // Active snapshot canvas holder
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

  // Label Management
  const [availableClasses, setAvailableClasses] = useState<string[]>(MOCK_LABELS[SAMPLE_VIDEOS[0].id]);
  const [selectedLabelClass, setSelectedLabelClass] = useState<string>(MOCK_LABELS[SAMPLE_VIDEOS[0].id][0]);

  // Model weight files & active auto-label filters state
  const [activeWeightId, setActiveWeightId] = useState<string | null>(null);
  const [activeRules, setActiveRules] = useState<AutoLabelRule[]>(DEFAULT_AUTOLABEL_RULES);

  const handleWeightsActivated = (weight: CustomModelWeight) => {
    setActiveWeightId(weight.id);
    setAvailableClasses(weight.classes);
    setSelectedLabelClass(weight.classes[0]);
    setModelConfig(prev => ({ ...prev, model: weight.modelType, selectedClasses: weight.classes }));
  };

  const handleBatchCompleted = (results: { [videoId: string]: number }) => {
    const totalCount = Object.values(results).reduce((s, c) => s + c, 0);
    alert(`Batch Inference Complete!\n\nSynthesized annotation sets across ${Object.keys(results).length} video streams.\nTotal saved: ${totalCount}`);
  };

  // Model parameters configuration
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model: 'YOLO26',
    confidenceThreshold: 0.50,
    iouThreshold: 0.45,
    maxDetections: 10,
    selectedClasses: MOCK_LABELS[SAMPLE_VIDEOS[0].id]
  });

  // Highlighted element selection
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  // Session state DB
  const [fullDatabase, setFullDatabase] = useState<FrameAnnotations>(getFrameAnnotations(SAMPLE_VIDEOS[0].id, mode));
  const activeAnnotations = fullDatabase[currentFrame] || [];

  // Re-sync class list and DB when active video changes
  useEffect(() => {
    const defaultClasses = onboardedVideoClasses[activeVideo.id] || MOCK_LABELS[activeVideo.id] || ['Vehicle', 'Person', 'Signal'];
    setAvailableClasses(defaultClasses);
    setSelectedLabelClass(defaultClasses[0]);
    setCurrentFrame(0);
    if (!activeVideo.id.startsWith('uploaded-')) {
      setUploadedVideoUrl(null);
    }
    setFullDatabase({ ...getFrameAnnotations(activeVideo.id, mode) });
    setModelConfig((prev) => ({ ...prev, selectedClasses: defaultClasses }));
  }, [activeVideo, mode, onboardedVideoClasses]);

  // Clear SAM3 constraints when switching frames or active video stream
  useEffect(() => {
    setSam3Points([]);
  }, [currentFrame, activeVideo]);

  // Real Global Keyboard Shortcuts Event Handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkey activations while typing tag labels or entering input details
      const activeEl = document.activeElement;
      if (activeEl) {
        const tag = activeEl.tagName.toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true') {
          return;
        }
      }

      const key = e.key.toUpperCase();

      // Spacebar to Play / Pause Video Playback stream
      if (e.key === ' ') {
        e.preventDefault(); // stop web browser viewport viewport scrolls
        setIsPlaying(prev => !prev);
        return;
      }

      // ESC hook to abort current segment / clean SAM3 interactive markings
      if (e.key === 'Escape') {
        setSam3Points([]);
        return;
      }

      // Frame Seek Navigation (WASD / Arrow Keys mapping)
      if (key === 'A' || key === 'W' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentFrame(prev => Math.max(0, prev - 1));
        return;
      }
      if (key === 'D' || key === 'S' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentFrame(prev => Math.min(activeVideo.frameCount - 1, prev + 1));
        return;
      }

      // Toolbar Mode Swapping (Hotkeys Numeric 1 to 5)
      if (e.key === '1') {
        setActiveTool('select');
        return;
      }
      if (e.key === '2') {
        setActiveTool('draw_box');
        return;
      }
      if (e.key === '3') {
        setActiveTool('draw_polygon');
        return;
      }
      if (e.key === '4') {
        setActiveTool('sam3');
        return;
      }
      if (e.key === '5') {
        setActiveTool('eraser');
        return;
      }

      // Toggle cheat sheet view mapping with '?' or 'k' / 'K'
      if (e.key === '?' || (key === 'K' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeVideo.frameCount]);

  const handleAnnotationCreated = (anno: Annotation) => {
    const updated = [...activeAnnotations, anno];
    saveFrameAnnotations(activeVideo.id, currentFrame, updated);
    setFullDatabase({ ...fullDatabase, [currentFrame]: updated });
    setActiveAnnotationId(anno.id);
  };

  const handleAnnotationDelete = (id: string) => {
    const updated = activeAnnotations.filter((anno) => anno.id !== id);
    saveFrameAnnotations(activeVideo.id, currentFrame, updated);
    setFullDatabase({ ...fullDatabase, [currentFrame]: updated });
    if (activeAnnotationId === id) setActiveAnnotationId(null);
  };

  const handleCopyPrevious = (count: number = 1) => {
    if (currentFrame <= 0) {
      return alert('Frame 1 has no previous frame to copy coordinates from.');
    }
    const db = getFrameAnnotations(activeVideo.id, mode);
    const prevAnnos = db[currentFrame - 1] || [];
    if (prevAnnos.length === 0) {
      return alert(`Previous Frame ${currentFrame} has no annotations to copy.`);
    }

    const nextDatabase = { ...fullDatabase };
    const maxFrames = activeVideo.frameCount;
    let copiedTotal = 0;

    for (let offset = 0; offset < count; offset++) {
      const targetFrame = currentFrame + offset;
      if (targetFrame >= maxFrames) break;

      // Map to new IDs to prevent duplication conflicts while remaining fully editable
      const duplicated: Annotation[] = prevAnnos.map((anno) => ({
        ...anno,
        id: `${anno.modelName.toLowerCase()}-${anno.label.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}-${targetFrame}`,
      }));

      nextDatabase[targetFrame] = duplicated;
      saveFrameAnnotations(activeVideo.id, targetFrame, duplicated);
      copiedTotal++;
    }

    setFullDatabase(nextDatabase);
    if (count > 1) {
      alert(`Propagated annotations from frame ${currentFrame} into ${copiedTotal} frames forward (Frames ${currentFrame + 1} to ${currentFrame + copiedTotal}).`);
    }
  };

  const handleClearFrame = () => {
    saveFrameAnnotations(activeVideo.id, currentFrame, []);
    setFullDatabase({ ...fullDatabase, [currentFrame]: [] });
    setActiveAnnotationId(null);
  };

  const handleCustomVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    
    const customMeta: VideoMetadata = {
      id: `uploaded-${Date.now()}`,
      title: file.name,
      duration: 10,
      fps: 1,
      frameCount: 10,
      thumbnailUrl: file.type.startsWith('image/') ? '🖼️' : '📁',
      description: `Custom uploaded file: ${file.name}. Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
      tags: ['Custom Upload', file.type.startsWith('image/') ? 'Image Data' : 'Video Data']
    };
    
    setPendingVideoMeta(customMeta);
    setPendingUploadFile(file);
    setShowDetectionModal(true);
  };

  const handleSelectSampleVideo = (vid: VideoMetadata) => {
    setPendingVideoMeta(vid);
    setPendingUploadFile(null);
    setShowDetectionModal(true);
  };

  const handleOnboardingConfirm = (selectedClasses: string[]) => {
    if (pendingVideoMeta) {
      setOnboardedVideoClasses(prev => ({
        ...prev,
        [pendingVideoMeta.id]: selectedClasses
      }));
      setActiveVideo(pendingVideoMeta);
      setIsMediaLoaded(true);
    }
    setShowDetectionModal(false);
    setPendingVideoMeta(null);
    setPendingUploadFile(null);
  };

  const handleOnboardingCancel = () => {
    setShowDetectionModal(false);
    setPendingVideoMeta(null);
    setPendingUploadFile(null);
  };

  const handleAutoLabelInference = async () => {
    if (!activeCanvas) {
      alert('Canvas viewport is not ready.');
      return;
    }
    setIsProcessing(true);
    try {
      const base64Image = activeCanvas.toDataURL('image/jpeg', 0.85);
      const predicted = await autoLabelFrame(
        base64Image,
        modelConfig.model,
        modelConfig.selectedClasses,
        activeVideo.id,
        currentFrame,
        mode
      );

      // Run prediction output through active filter rules!
      const filtered = applyLabelRules(predicted, activeRules);

      setFullDatabase({ ...fullDatabase, [currentFrame]: filtered });
      saveFrameAnnotations(activeVideo.id, currentFrame, filtered);
    } catch (err: any) {
      alert(`Model Inference Failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchAutoLabelAllFrames = async () => {
    setIsProcessing(true);
    const totalFrames = activeVideo.frameCount;
    
    // Initialize parallel background status markers for All 10 video frames
    const initialProgress: { [frame: number]: 'idle' | 'processing' | 'completed' | 'failed' } = {};
    for (let f = 0; f < totalFrames; f++) {
      initialProgress[f] = 'processing';
    }
    setBatchProgress(initialProgress);

    try {
      // Dispatch simultaneous background inference requests
      const promises = Array.from({ length: totalFrames }).map(async (_, f) => {
        try {
          // Generate offscreen canvas representation to fetch Base64 matching current frame index timestamp
          const offscreen = document.createElement('canvas');
          offscreen.width = 854;
          offscreen.height = 480;
          const ctx = offscreen.getContext('2d');
          
          if (ctx) {
            if (uploadedVideoUrl && activeCanvas) {
              // Copy contents of active user canvas reference as dynamic fallback
              ctx.drawImage(activeCanvas, 0, 0);
            } else {
              // Draw procedural frames instantly in background parallel decoder simulation thread
              renderMockFrame(ctx, activeVideo.id, f, offscreen.width, offscreen.height);
            }
          }
          const base64Image = offscreen.toDataURL('image/jpeg', 0.85);

          const predicted = await autoLabelFrame(
            base64Image,
            modelConfig.model,
            modelConfig.selectedClasses,
            activeVideo.id,
            f,
            mode
          );

          // Feed predicted output arrays through the active model configuration filters
          const filtered = applyLabelRules(predicted, activeRules);
          
          // Save frame records directly back to database store index sequentially
          saveFrameAnnotations(activeVideo.id, f, filtered);
          
          setBatchProgress(prev => prev ? { ...prev, [f]: 'completed' } : null);
          return { frame: f, annotations: filtered };
        } catch (err) {
          console.error(`Dynamic background decoder worker on Frame ${f} failed:`, err);
          setBatchProgress(prev => prev ? { ...prev, [f]: 'failed' } : null);
          return { frame: f, annotations: [] };
        }
      });

      const results = await Promise.all(promises);
      
      // Bulk merge predicted annotations back into active application rendering db state simultaneously
      const nextDatabase = { ...fullDatabase };
      results.forEach((res) => {
        nextDatabase[res.frame] = res.annotations;
      });
      setFullDatabase(nextDatabase);
    } catch (err: any) {
      alert(`Simultaneous background batch processor halt: ${err.message}`);
    } finally {
      setIsProcessing(false);
      // Retain completed states for user visualization, then dismiss grid after 4 seconds
      setTimeout(() => {
        setBatchProgress(null);
      }, 4000);
    }
  };

  if (!isMediaLoaded) {
    return (
      <>
        <LandingPage
          videos={SAMPLE_VIDEOS}
          mode={mode}
          onModeChange={setMode}
          onSelectVideo={handleSelectSampleVideo}
          onVideoUpload={handleCustomVideoUpload}
          onStartTour={() => setIsTourOpen(true)}
        />
        <OnboardingTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          activePhase="landing"
          onForceLoadSample={() => {
            setActiveVideo(SAMPLE_VIDEOS[0]);
            setIsMediaLoaded(true);
          }}
        />
        <DetectionOnboardingModal
          isOpen={showDetectionModal}
          fileName={pendingVideoMeta?.title || ''}
          onConfirm={handleOnboardingConfirm}
          onCancel={handleOnboardingCancel}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100">
      {/* Dynamic Header with Primary Workspace Screen Switcher */}
      <ModeSwitcher
        mode={mode}
        onModeChange={setMode}
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onReturnToLanding={() => setIsMediaLoaded(false)}
      />

      {activeScreen === 'labeling' ? (
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left interactive workspace: Video frame player, canvas overlay, timeline navigation */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div id="annotation-canvas" className="relative">
              <VideoPlayer
                activeVideo={activeVideo}
                currentFrame={currentFrame}
                totalFrames={activeVideo.frameCount}
                onFrameChange={setCurrentFrame}
                onVideoUpload={handleCustomVideoUpload}
                uploadedVideoUrl={uploadedVideoUrl}
                onCaptureFrame={setActiveCanvas}
                isPlaying={isPlaying}
                onPlayingChange={setIsPlaying}
              />
              
              {/* Overlay Annotator Drawing Canvas */}
              <AnnotationCanvas
                annotations={activeAnnotations}
                activeTool={activeTool}
                selectedLabelClass={selectedLabelClass}
                onAnnotationCreated={handleAnnotationCreated}
                onAnnotationDelete={handleAnnotationDelete}
                activeAnnotationId={activeAnnotationId}
                onSelectAnnotation={setActiveAnnotationId}
                sam3Points={sam3Points}
                onAddSam3Point={(pt) => setSam3Points([...sam3Points, pt])}
                onClearSam3Points={() => setSam3Points([])}
                sam3ObjectSize={sam3ObjectSize}
                sam3PointPolarity={sam3PointPolarity}
              />
            </div>

            <div id="timeline-controls-bar">
              <TimelineControl
                currentFrame={currentFrame}
                totalFrames={activeVideo.frameCount}
                onFrameChange={setCurrentFrame}
                fullDatabase={fullDatabase}
              />
            </div>

            <FilmstripView
              activeVideo={activeVideo}
              currentFrame={currentFrame}
              totalFrames={activeVideo.frameCount}
              onFrameChange={setCurrentFrame}
              fullDatabase={fullDatabase}
            />

            <SampleVideosSelector
              videos={SAMPLE_VIDEOS}
              activeVideoId={activeVideo.id}
              onSelectVideo={handleSelectSampleVideo}
            />
          </div>

          {/* Right sidebar toolbox: auto labelling, manual actions, class lists & annotations */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div id="model-selector-container">
              <ModelSelector
                config={modelConfig}
                onConfigChange={setModelConfig}
                onAutoLabel={handleAutoLabelInference}
                onBatchAutoLabel={handleBatchAutoLabelAllFrames}
                batchProgress={batchProgress}
                onCopyPrevious={handleCopyPrevious}
                onClearAnnotations={handleClearFrame}
                isProcessing={isProcessing}
                availableClasses={availableClasses}
                showWorkspaceActions={false}
              />
            </div>

            <div id="drawing-tools-toolbar">
              <DrawingToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                selectedLabelClass={selectedLabelClass}
                onLabelClassChange={setSelectedLabelClass}
                availableClasses={availableClasses}
                onAddNewClass={(cls) => {
                  if (cls && !availableClasses.includes(cls)) {
                    setAvailableClasses([...availableClasses, cls]);
                  }
                }}
                sam3ObjectSize={sam3ObjectSize}
                onSam3ObjectSizeChange={setSam3ObjectSize}
                sam3PointPolarity={sam3PointPolarity}
                onSam3PointPolarityChange={setSam3PointPolarity}
                sam3PointsCount={sam3Points.length}
                onClearSam3Points={() => setSam3Points([])}
              />
            </div>

            <AnnotationsSidebar
              activeVideoId={activeVideo.id}
              annotations={activeAnnotations}
              activeAnnotationId={activeAnnotationId}
              onSelectAnnotation={setActiveAnnotationId}
              onAnnotationDelete={handleAnnotationDelete}
              fullDatabase={fullDatabase}
              onImportDatabase={setFullDatabase}
              onCopyPrevious={handleCopyPrevious}
              onClearAnnotations={handleClearFrame}
              currentFrame={currentFrame}
            />
          </div>
        </main>
      ) : activeScreen === 'models' ? (
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* AI Model Management and pipeline screen */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 text-indigo-800 font-extrabold opacity-30 select-none text-9xl">AI</div>
              <h2 className="text-lg font-bold font-sans tracking-tight mb-1 flex items-center gap-2">
                <Cpu size={18} className="text-indigo-400" />
                Developer Model Tuning & Pipeline Hub
              </h2>
              <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
                Configure fine-tuned YOLOv26 or RF-DETR networks. Upload customized local weights binaries directly, parallel-run pipeline queue worker threads on whole video directories, or code verification filter regulations instantly.
              </p>
            </div>

            <AdvancedPipelineTabs
              onWeightsActivated={handleWeightsActivated}
              activeWeightId={activeWeightId}
              onBatchCompleted={handleBatchCompleted}
              onRulesChanged={setActiveRules}
              availableClasses={availableClasses}
              availableSampleClips={SAMPLE_VIDEOS}
            />
          </div>

          {/* Model Hub active pipelines parameters & settings */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ModelSelector
              config={modelConfig}
              onConfigChange={setModelConfig}
              onAutoLabel={handleAutoLabelInference}
              onBatchAutoLabel={handleBatchAutoLabelAllFrames}
              batchProgress={batchProgress}
              onCopyPrevious={handleCopyPrevious}
              onClearAnnotations={handleClearFrame}
              isProcessing={isProcessing}
              availableClasses={availableClasses}
              showWorkspaceActions={false}
            />

            {/* Performance status card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">GPU Acceleration Node</span>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-800">16 Tensor Cores Online</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Local on-demand sandboxed execution. WebGPU-supported decoders compile layers automatically on-canvas when active. Zero upload latency.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <EnhancementPlanViewer />
      )}

      {/* Global Hotkeys Modal cheating sheet */}
      <KeyboardShortcutsGuide
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        activePhase="workspace"
        onForceLoadSample={() => {}}
      />
    </div>
  );
}
