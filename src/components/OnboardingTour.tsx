/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

export interface TourStep {
  title: string;
  sub: string;
  description: string;
  selector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  phase: 'landing' | 'workspace';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Video Labeller! 👋",
    sub: "Quick Start Guide",
    description: "This app helps you draw boxes around objects in videos. Let us show you around in 1 minute!",
    position: "center",
    phase: "landing"
  },
  {
    title: "Upload Your Content",
    sub: "Drag or select files",
    description: "Drop your own short video or photo here to begin. Long videos will be automatically trimmed to the first 100 frames to keep the app fast.",
    selector: "#media-dropzone",
    position: "bottom",
    phase: "landing"
  },
  {
    title: "Try the Camera",
    sub: "Record instantly",
    description: "Click here to record live from your camera. If your browser blocks it, we will load a fun traffic camera simulator to test with.",
    selector: "#use-webcam-btn",
    position: "bottom",
    phase: "landing"
  },
  {
    title: "Or Choose a Demo Preset",
    sub: "Ready-made examples",
    description: "No video? Simply click any of these preloaded examples (like Warehouse flow, Highway traffic, or Sports) to try the workspace!",
    selector: "#sample-datasets-gallery",
    position: "top",
    phase: "landing"
  },
  {
    title: "Your Sandbox Editor",
    sub: "Drawing board",
    description: "This is your main screen. You can view sequence frames or simply click and drag to draw boxes around cars, boxes, or people.",
    selector: "#annotation-canvas",
    position: "bottom",
    phase: "workspace"
  },
  {
    title: "Play and Seek Control",
    sub: "Video timeline bar",
    description: "Play, pause, or slide back-and-forth between frames using this simple bar below your canvas.",
    selector: "#timeline-controls-bar",
    position: "top",
    phase: "workspace"
  },
  {
    title: "Drawing Tools",
    sub: "Boxes and paintbrushes",
    description: "Switch your tools here. Draw rectangular boxes, use the magic paintbrush tool, or click to add custom label labels.",
    selector: "#drawing-tools-toolbar",
    position: "left",
    phase: "workspace"
  },
  {
    title: "Smart Predict Box",
    sub: "Automatic labeling helper",
    description: "Want to save time? Click the Smart Predict keys here to let our smart system search for and label frames for you instantly!",
    selector: "#model-selector-container",
    position: "left",
    phase: "workspace"
  },
  {
    title: "Check and Export Settings",
    sub: "Rules and tab sheets",
    description: "Switch screens anytime at the top bar to review your label statistics, adjust guidelines, or export your final files.",
    selector: "#workspace-tabs",
    position: "bottom",
    phase: "workspace"
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  activePhase: 'landing' | 'workspace';
  onForceLoadSample: () => void;
}

export default function OnboardingTour({
  isOpen,
  onClose,
  activePhase,
  onForceLoadSample
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tourRef = useRef<HTMLDivElement>(null);
  const lastScrolledSelectorRef = useRef<string | null>(null);

  const currentStepData = TOUR_STEPS[currentStep];

  // Auto-scroll highlighted section into viewport center safely once it mounts
  useEffect(() => {
    if (!isOpen) {
      lastScrolledSelectorRef.current = null;
      return;
    }

    const targetSelector = currentStepData?.selector;
    if (!targetSelector) return;

    const tryScroll = () => {
      if (lastScrolledSelectorRef.current === targetSelector) return;
      const element = document.querySelector(targetSelector);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        lastScrolledSelectorRef.current = targetSelector;
      }
    };

    tryScroll();
    const interval = setInterval(tryScroll, 250);
    return () => clearInterval(interval);
  }, [currentStep, isOpen, currentStepData]);

  // Logic to track active visual elements in viewport
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const locateElement = () => {
      if (!currentStepData.selector) {
        setTargetRect(null);
        return;
      }

      const element = document.querySelector(currentStepData.selector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    locateElement();

    // Setup periodic polling to track size alterations smoothly
    const interval = setInterval(locateElement, 150);
    window.addEventListener('resize', locateElement);
    window.addEventListener('scroll', locateElement);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', locateElement);
      window.removeEventListener('scroll', locateElement);
    };
  }, [isOpen, currentStep]);

  // Sync index phases
  useEffect(() => {
    if (!isOpen) return;
    const isStepForLanding = currentStepData?.phase === 'landing';
    const isCurrentlyLanding = activePhase === 'landing';

    // Auto adapt current steps range when phase mismatches
    if (isStepForLanding && !isCurrentlyLanding) {
      // workspace active but on landing step, forward to first workspace step
      const firstWIdx = TOUR_STEPS.findIndex(s => s.phase === 'workspace');
      if (firstWIdx !== -1) setCurrentStep(firstWIdx);
    } else if (!isStepForLanding && isCurrentlyLanding) {
      // landing active but on workspace step, backward to first landing step
      setCurrentStep(0);
    }
  }, [activePhase, isOpen, currentStepData]);

  if (!isOpen || !currentStepData) return null;

  const totalSteps = TOUR_STEPS.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStepData = TOUR_STEPS[currentStep + 1];
      
      // Auto transition bridge
      if (currentStepData.phase === 'landing' && nextStepData.phase === 'workspace' && activePhase === 'landing') {
        onForceLoadSample();
      }
      
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentSelectorIsVisible = !!targetRect;

  // Compute position of the guide dialog card body relative to target selection or fallback center
  const getDialogStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100
      };
    }

    const margin = 14;
    const { top, left, width, height } = targetRect;
    const computedStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 100
    };

    switch (currentStepData.position) {
      case 'top':
        computedStyle.bottom = `${window.innerHeight - top + margin}px`;
        computedStyle.left = `${left + width / 2}px`;
        computedStyle.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        computedStyle.top = `${top + height + margin}px`;
        computedStyle.left = `${left + width / 2}px`;
        computedStyle.transform = 'translateX(-50%)';
        break;
      case 'left':
        computedStyle.top = `${top + height / 2}px`;
        computedStyle.right = `${window.innerWidth - left + margin}px`;
        computedStyle.transform = 'translateY(-50%)';
        break;
      case 'right':
        computedStyle.top = `${top + height / 2}px`;
        computedStyle.left = `${left + width + margin}px`;
        computedStyle.transform = 'translateY(-50%)';
        break;
      default:
        computedStyle.top = '50%';
        computedStyle.left = '50%';
        computedStyle.transform = 'translate(-50%, -50%)';
    }

    return computedStyle;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      
      {/* Interactive darkened SVG overlay backdrop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ zIndex: 90 }}>
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 5}
                y={targetRect.top - 5}
                width={targetRect.width + 10}
                height={targetRect.height + 10}
                rx={10}
                ry={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(8, 10, 24, 0.45)"
          className="backdrop-blur-[1px] transition-all duration-300"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Floating Spotlight border highlighting the targeted selector */}
      {targetRect && (
        <div
          className="fixed border-2 border-indigo-500 rounded-xl transition-all duration-300 animate-pulse pointer-events-none"
          style={{
            top: targetRect.top - 7,
            left: targetRect.left - 7,
            width: targetRect.width + 14,
            height: targetRect.height + 14,
            zIndex: 95,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0), 0 0 15px rgba(99, 102, 241, 0.6)'
          }}
        />
      )}

      {/* High-fidelity dialog Card block */}
      <div
        ref={tourRef}
        style={getDialogStyle()}
        className="w-[340px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 pointer-events-auto flex flex-col gap-4 animate-fade-in text-white transition-all duration-300"
      >
        {/* Card Header block */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
              <Sparkles size={10} className="animate-spin" />
              <span>{currentStepData.sub}</span>
            </span>
            <h4 className="text-[14px] font-black tracking-tight leading-snug">
              {currentStepData.title}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Skip onboarding tour"
          >
            <X size={15} />
          </button>
        </div>

        {/* Description / Content Body block */}
        <p className="text-slate-300 text-xs font-medium leading-relaxed">
          {currentStepData.description}
        </p>

        {/* Actions navigation footers */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3.5 mt-1">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono tracking-wider text-slate-400">
              {currentStep + 1} / {totalSteps}
            </span>
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-2 rounded-full transition-all ${
                    i === currentStep ? 'bg-indigo-500 w-3' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 transition-all cursor-pointer"
                title="Back to prior tour step"
              >
                <ChevronLeft size={13} />
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>{currentStep === totalSteps - 1 ? 'Finish tour' : 'Next step'}</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
