/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Upload, Film, AlertCircle, Play, Pause, Square } from 'lucide-react';
import { VideoMetadata } from '../types';
import { renderMockFrame } from '../../data/mockup/frameRenderer';

interface VideoPlayerProps {
  activeVideo: VideoMetadata;
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  onVideoUpload: (file: File) => void;
  uploadedVideoUrl: string | null;
  // Callback providing raw frame base64 so model can parse it
  onCaptureFrame: (canvas: HTMLCanvasElement) => void;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
}

export default function VideoPlayer({
  activeVideo,
  currentFrame,
  totalFrames,
  onFrameChange,
  onVideoUpload,
  uploadedVideoUrl,
  onCaptureFrame,
  isPlaying: externalIsPlaying,
  onPlayingChange
}: VideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const setIsPlaying = onPlayingChange || setInternalIsPlaying;
  const [playSpeed, setPlaySpeed] = useState<number>(300); // ms per frame (300ms = ~3.3 fps)

  // Procedural fallback or real video layout rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (uploadedVideoUrl && videoRef.current) {
      // If native file loaded, draw active video frame to canvas
      const drawVideoFrame = () => {
        if (!videoRef.current || !canvas) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        onCaptureFrame(canvas); // update parent snapshot
      };
      
      const seekAndDraw = () => {
        if (!videoRef.current) return;
        // Map currentFrame (e.g. 0-9) to video duration percentage
        const fraction = currentFrame / Math.max(1, totalFrames - 1);
        videoRef.current.currentTime = fraction * videoRef.current.duration;
      };

      videoRef.current.onseeked = drawVideoFrame;
      seekAndDraw();
    } else {
      // Procedural Vector Frame Rendering for Demo
      renderMockFrame(ctx, activeVideo.id, currentFrame, canvas.width, canvas.height);
      onCaptureFrame(canvas); // update parent snaps
    }
  }, [currentFrame, activeVideo.id, uploadedVideoUrl, totalFrames]);

  // Video looping playback logic - utilizes a ref to always keep active callback fresh
  const frameChangeRef = useRef(onFrameChange);
  useEffect(() => {
    frameChangeRef.current = onFrameChange;
  }, [onFrameChange]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onFrameChange((currentFrame + 1) % totalFrames);
    }, playSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, totalFrames, currentFrame, onFrameChange]);

  // Drag and drop mechanics
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoUpload(file);
      setIsPlaying(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoUpload(file);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Frame view and Overlay Area */}
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative group bg-slate-900 aspect-video flex items-center justify-center border-b border-slate-200 cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          width={854}
          height={480}
          className="w-full h-full max-w-full max-h-full object-contain"
          id="drawing-canvas-viewport"
        />

        {/* Hidden video node for uploading context */}
        {uploadedVideoUrl && (
          <video
            ref={videoRef}
            src={uploadedVideoUrl}
            className="hidden"
            muted
            playsInline
          />
        )}

        {/* Lazy Frame indicator floating overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-indigo-900/80 border border-indigo-700/50 px-2 py-1 rounded-md text-[10px] text-indigo-200 backdrop-blur select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Lazy Frame Decoder</span>
        </div>

        {/* Floating Upload Drag helper */}
        {!uploadedVideoUrl && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur pointer-events-none">
            <Upload size={14} className="text-indigo-400" />
            <span>Drop local .mp4 to load custom streams</span>
          </div>
        )}
      </div>

      {/* Playback & Upload strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3 bg-white border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-650 hover:bg-indigo-700'
            }`}
            title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          {/* Speed Selector */}
          <div className="flex bg-slate-100 text-slate-600 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setPlaySpeed(600)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                playSpeed === 600 ? 'bg-white text-slate-850 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              0.5x
            </button>
            <button
              onClick={() => setPlaySpeed(300)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                playSpeed === 300 ? 'bg-white text-slate-850 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => setPlaySpeed(120)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                playSpeed === 120 ? 'bg-white text-slate-850 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              2.5x
            </button>
          </div>
          
          <div className="text-xs text-slate-500 font-medium select-none flex items-center gap-1.5">
            <span>Frame</span>
            <span className="font-mono text-slate-800 font-extrabold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded text-xs select-all">
              {currentFrame + 1}
            </span>
            <span>of</span>
            <span className="font-mono text-slate-600 font-bold">{totalFrames}</span>
          </div>
        </div>

        {/* Lazy Loading explanation and Upload trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-dashed border-slate-200" title="Frame buffer loaded on demand, preventing RAM overhead">
            <AlertCircle size={11} className="text-slate-400" />
            <span>On-Demand Lazy Allocations</span>
          </div>

          {/* Upload Trigger */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-700 font-semibold transition-all cursor-pointer shadow-2xs">
            <Upload size={13} className="text-indigo-650" />
            <span>Upload Custom (.mp4)</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
