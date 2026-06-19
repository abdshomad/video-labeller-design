/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { renderMockFrame } from '../../data/mockup/frameRenderer';
import { FrameAnnotations, VideoMetadata } from '../types';
import { Film, Tag, ArrowRight } from 'lucide-react';

interface ThumbnailCanvasProps {
  videoId: string;
  frameIndex: number;
}

function ThumbnailCanvas({ videoId, frameIndex }: ThumbnailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Render the procedural frame on the canvas in the requested exact resolution
    renderMockFrame(ctx, videoId, frameIndex, 160, 90);
  }, [videoId, frameIndex]);

  return (
    <div className="relative aspect-video w-full rounded-lg bg-slate-950 border border-slate-200 overflow-hidden shadow-2xs group-hover:border-indigo-400/80 group-hover:shadow-md transition-all">
      <canvas
        ref={canvasRef}
        width={160}
        height={90}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface FilmstripViewProps {
  activeVideo: VideoMetadata;
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  fullDatabase: FrameAnnotations;
}

export default function FilmstripView({
  activeVideo,
  currentFrame,
  totalFrames,
  onFrameChange,
  fullDatabase
}: FilmstripViewProps) {
  
  // Calculate next 5 frames index. Wrap around safely so there are always exactly 5 previews.
  const nextFrames = Array.from({ length: 5 }).map((_, offset) => {
    return (currentFrame + offset + 1) % totalFrames;
  });

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-3.5 shadow-sm animate-fade-in">
      {/* Title & Metadata */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Film size={15} className="text-indigo-650" />
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Future Filmstrip Context</span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
          Next 5 Frames
        </span>
      </div>

      {/* Grid of the 5 next frames */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {nextFrames.map((frameIdx, index) => {
          const frameAnnotationsList = fullDatabase[frameIdx] || [];
          const labelsCount = frameAnnotationsList.length;
          
          // Deduplicate classes present in this frame for clean visual summary badges
          const uniqueClasses = Array.from(
            new Set(frameAnnotationsList.map((ann) => ann.label))
          );

          // Give coordinates offset hint indicator (e.g. +1, +2, +3 frames ahead)
          const offsetLabel = `+${index + 1}`;

          return (
            <button
              key={`filmstrip-frame-${frameIdx}`}
              onClick={() => onFrameChange(frameIdx)}
              className="group flex flex-col gap-2 p-1.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-left transition-all cursor-pointer select-none relative focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            >
              {/* Thumbnail frame view */}
              <ThumbnailCanvas videoId={activeVideo.id} frameIndex={frameIdx} />

              {/* Offset index bubble label */}
              <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-slate-700/30">
                {offsetLabel}
              </div>

              {/* Frame details info */}
              <div className="flex flex-col gap-1 w-full px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-950 font-mono">
                    Frame {frameIdx + 1}
                  </span>
                  {labelsCount > 0 ? (
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-55/70 border border-emerald-100 px-1 rounded-sm">
                      {labelsCount} {labelsCount === 1 ? 'obj' : 'objs'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-slate-400">
                      empty
                    </span>
                  )}
                </div>

                {/* Display unique tags propagated in this frame */}
                {uniqueClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-h-8 overflow-hidden select-none">
                    {uniqueClasses.slice(0, 3).map((cl, cIdx) => (
                      <span
                        key={`${frameIdx}-class-${cl}-${cIdx}`}
                        className="text-[8px] font-extrabold text-indigo-750 bg-indigo-50/50 border border-indigo-100/50 px-1 py-0.2 rounded-sm truncate max-w-full"
                      >
                        {cl}
                      </span>
                    ))}
                    {uniqueClasses.length > 3 && (
                      <span className="text-[7px] text-slate-400 font-bold">
                        +{uniqueClasses.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[8px] text-slate-400 italic">
                    No active tags
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Dynamic Context hint */}
      <div className="flex items-center gap-1.5 bg-indigo-50/30 border border-indigo-100/30 p-2.5 rounded-lg text-[10px] text-indigo-900 select-none">
        <ArrowRight size={11} className="text-indigo-600 animate-pulse" />
        <span>
          <strong>Protip:</strong> Click any video thumbnail frame above to switch timeline active pointer and instantly adjust label propagation vectors.
        </span>
      </div>
    </div>
  );
}
