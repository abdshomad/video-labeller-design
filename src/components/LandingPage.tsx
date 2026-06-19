/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, HelpCircle, Globe2, Bell, LogIn, ChevronRight, X, Sparkles, Database, Cpu } from 'lucide-react';
import { VideoMetadata, AppMode } from '../types';

interface LandingPageProps {
  videos: VideoMetadata[];
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onSelectVideo: (video: VideoMetadata) => void;
  onVideoUpload: (file: File) => void;
  userEmail?: string;
  onStartTour?: () => void;
}

export default function LandingPage({
  videos,
  mode,
  onModeChange,
  onSelectVideo,
  onVideoUpload,
  userEmail = 'abd.shomad@gmail.com',
  onStartTour
}: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Webcam & Simulator states
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Notifications mock data
  const notifications = [
    { id: 1, text: '👋 Welcome to Video Labeller!', time: 'Just now' },
    { id: 2, text: '⚡ WebGPU local decoders accelerated.', time: '10 mins ago' },
    { id: 3, text: '🧠 YOLOv26 and Segment Anything 3 online.', time: '1 hour ago' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('image/'))) {
      onVideoUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoUpload(file);
    }
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  // Webcam actions
  const openWebcam = async () => {
    setShowWebcamModal(true);
    setWebcamError(null);
    setIsSimulated(false);
    setIsWebcamActive(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Real device webcam access blocked, launching simulator instead:", err);
      setIsSimulated(true);
      setIsWebcamActive(true);
    }
  };

  const closeWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowWebcamModal(false);
    setIsWebcamActive(false);
  };

  // Draw simulation frame if active
  useEffect(() => {
    if (!isSimulated || !showWebcamModal) return;
    let animId: number;
    let t = 0;

    const renderSimulation = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      t += 0.05;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw horizontal raster lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw grid scanner
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.beginPath();
      const pulseY = (Math.sin(t) + 1) * 0.5 * canvas.height;
      ctx.moveTo(0, pulseY);
      ctx.lineTo(canvas.width, pulseY);
      ctx.stroke();

      // Camera focal boxes
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 80, 440, 320);

      // Mock traffic simulator overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText('WEBCAM INFERENCE FEED SIMULATOR', 120, 115);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '11px "JetBrains Mono", sans-serif';
      ctx.fillText('DETECTING TARGET CLASSIFICATIONS...', 120, 140);

      // Simulating a bounded car block
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(180, 180 + Math.sin(t) * 15, 120, 80);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(180, 180 + Math.sin(t) * 15 - 18, 65, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('Autonomous', 185, 180 + Math.sin(t) * 15 - 5);

      // Simulating a pedestrian walking
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(410 + Math.cos(t) * 10, 200, 50, 110);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(410 + Math.cos(t) * 10, 200 - 18, 55, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('Worker (94%)', 412 + Math.cos(t) * 10, 200 - 5);

      animId = requestAnimationFrame(renderSimulation);
    };

    renderSimulation();
    return () => cancelAnimationFrame(animId);
  }, [isSimulated, showWebcamModal]);

  const captureFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isSimulated && videoRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
    }

    // Convert frame capture to pseudo-file to launch workspace
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'webcam_capture.jpg', { type: 'image/jpeg' });
        onVideoUpload(file);
        closeWebcam();
      }
    }, 'image/jpeg');
  };

  return (
    <div className="flex bg-[#fcfcfd] flex-col min-h-screen text-slate-800 font-sans leading-relaxed selection:bg-violet-100">
      
      {/* Video Labeller Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#e4e4e7] bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-indigo-600 font-extrabold text-[17px] tracking-tight hover:opacity-90 select-none cursor-default">
            Video <span className="text-indigo-650 font-bold font-mono tracking-wider bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs">LABELLER</span>
          </span>
          <HelpCircle size={15} className="text-slate-400 cursor-help transition-colors hover:text-slate-600" />
        </div>

        {/* Right side navigation utilities matching screenshot */}
        <div className="flex items-center gap-3.5">
          {/* Environment Mode Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => onModeChange('demo')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                mode === 'demo'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-205/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database size={11} className="shrink-0" />
              <span>Demo</span>
            </button>

            <button
              onClick={() => onModeChange('live')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                mode === 'live'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-750'
              }`}
            >
              <Cpu size={11} className="shrink-0" />
              <span>Live</span>
            </button>
          </div>

          {/* Public Toggle (Interactive) */}
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold cursor-pointer ${
              isPublic
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-3xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title="Toggle workspace public sharing visibility"
          >
            <Globe2 size={13} className={isPublic ? 'animate-pulse' : ''} />
            <span>{isPublic ? 'Public' : 'Private'}</span>
          </button>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer relative"
            >
              <Bell size={14} />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-600" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 animate-fade-in text-xs">
                <h4 className="font-bold text-slate-700 border-b border-slate-100 pb-1.5 mb-2">Workspace Notifications</h4>
                <div className="flex flex-col gap-2">
                  {notifications.map(n => (
                    <div key={n.id} className="text-[11px] text-slate-600 flex flex-col">
                      <span className="font-semibold text-slate-800">{n.text}</span>
                      <span className="text-[9px] text-slate-400">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Status Profile */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3.5">
            <div className="h-6.5 w-6.5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-[10px] uppercase select-none">
              {userEmail.charAt(0)}
            </div>
            <span className="text-xs font-bold text-slate-600 hidden sm:inline" title={userEmail}>
              {userEmail}
            </span>
          </div>
        </div>
      </header>

      {/* Main landing container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-5xl mx-auto w-full text-center">
        
        {/* Hero Headline and tagline matching layout */}
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl sm:text-[42px] font-black tracking-tight text-slate-900 leading-[1.12] mb-3">
            Build a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">Computer Vision Model</span> in Minutes
          </h1>
          <p className="text-slate-500 text-[14px] sm:text-[15px] font-medium max-w-xl mx-auto leading-relaxed">
            Start small and we'll help improve it as your data grows. Drag, drop or use coordinates preset models to tag frame classes.
          </p>
        </div>

        {/* Central interactive Drag and Drop Card */}
        <div
          id="media-dropzone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`w-full max-w-[760px] bg-white border-2 border-dashed ${
            isDragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-[#d4d4d8]'
          } rounded-[18px] p-10 py-12 transition-all shadow-3xs relative flex flex-col items-center justify-center`}
        >
          {/* Centered central icon */}
          <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-3xs mb-5 transition-transform hover:scale-105">
            <Upload size={22} className="text-[#3f3f46] animate-bounce" />
          </div>

          <h2 className="text-[#18181b] text-lg font-black tracking-tight mb-2.5">
            Upload an image or a short video
          </h2>
          <p className="text-slate-400 text-xs font-medium mb-6">
            Long videos will be trimmed to 100 frames.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleChooseFiles}
              className="flex items-center gap-2 bg-[#18181b] hover:bg-slate-900 text-white text-xs font-black px-5 py-3 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Upload size={13} />
              <span>Choose files</span>
            </button>
            <button
              id="use-webcam-btn"
              onClick={openWebcam}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-[#d4d4d8] text-xs font-bold px-5 py-3 rounded-lg shadow-3xs transition-all cursor-pointer"
            >
              <Camera size={13} className="text-[#3f3f46]" />
              <span>Use webcam</span>
            </button>

            {onStartTour && (
              <button
                type="button"
                onClick={onStartTour}
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-250 text-xs font-black px-5 py-3 rounded-lg shadow-3xs transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Sparkles size={13} className="text-indigo-600 animate-pulse" />
                <span>Take visual tour</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Bottom gallery list matching screenshot style */}
        <div id="sample-datasets-gallery" className="mt-14 w-full text-left">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
            <h3 className="text-[11px] font-black font-sans uppercase tracking-widest text-[#71717a] ml-1">
              Sample Datasets to Demo
            </h3>
            <span className="text-[10px] text-indigo-500 font-extrabold flex items-center gap-1 cursor-default select-none">
              Instant GPU Sandbox <ChevronRight size={11} />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => onSelectVideo(vid)}
                className="group flex flex-col bg-white border border-[#e4e4e7] hover:border-indigo-400 rounded-xl overflow-hidden cursor-pointer shadow-3xs transition-all hover:translate-y-[-2px] hover:shadow-2xs"
              >
                {/* Simulated colorful header box representing video */}
                <div className="aspect-[1.8] bg-slate-50 border-b border-slate-150 flex items-center justify-center text-4xl select-none group-hover:bg-indigo-50/40 transition-colors relative">
                  <span>{vid.thumbnailUrl}</span>
                  <div className="absolute bottom-2.5 right-2 rounded bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wider">
                    {vid.frameCount} FRAMES
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <span className="text-xs font-black text-slate-800 line-clamp-1 mb-1" title={vid.title}>
                    {vid.title}
                  </span>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                    {vid.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {vid.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold text-slate-500 bg-slate-100/80 rounded px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Webcam overlay module */}
      {showWebcamModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Camera size={13} className="text-indigo-600 animate-pulse" />
                <span>Webcam Capture Console</span>
              </h3>
              <button
                onClick={closeWebcam}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center">
              <div className="relative bg-slate-950 aspect-video w-full rounded-xl overflow-hidden border border-slate-800 mb-4 flex items-center justify-center">
                
                {/* Live physical video if supported */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isSimulated ? 'hidden' : ''}`}
                  muted
                  playsInline
                />

                {/* Simulated Canvas view if local device access is restricted */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className={`w-full h-full object-contain ${!isSimulated ? 'hidden' : ''}`}
                />

                {!isWebcamActive && !webcamError && (
                  <span className="text-[11px] text-slate-500 font-mono tracking-wider animate-pulse">
                    INITIALIZING CAMERA CONNECTION...
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between w-full gap-3">
                <p className="text-[10px] text-slate-500 max-w-[280px]">
                  {isSimulated 
                    ? 'Premium sandbox simulation environment. Click capture to extract custom image frames.'
                    : 'Extract an exact video keyframe to submit directly to YOLOv26 networks.'}
                </p>
                <button
                  onClick={captureFrame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4.5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera size={13} />
                  <span>Capture Frame</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
