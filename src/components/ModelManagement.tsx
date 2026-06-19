/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomModelWeight, DetectionModel } from '../types';
import { INITIAL_MODEL_WEIGHTS } from '../../data/mockup/modelWeights';
import { Upload, HardDrive, ShieldCheck, CheckCircle2, Cpu, HelpCircle, Plus, Info } from 'lucide-react';

interface ModelManagementProps {
  onWeightsActivated: (weight: CustomModelWeight) => void;
  activeWeightId: string | null;
}

export default function ModelManagement({ onWeightsActivated, activeWeightId }: ModelManagementProps) {
  const [weightsList, setWeightsList] = useState<CustomModelWeight[]>(INITIAL_MODEL_WEIGHTS);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New weight metadata form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<DetectionModel>('YOLO26');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [epochs, setEpochs] = useState<number>(300);
  const [classesInput, setClassesInput] = useState<string>('Car, Person, Motorbike');
  const [mapInput, setMapInput] = useState<string>('0.91');

  const activeWeight = weightsList.find(w => w.id === activeWeightId) || weightsList.find(w => w.isActive);

  const handleWeightToggle = (id: string) => {
    const updated = weightsList.map((w) => {
      const match = w.id === id;
      if (match) {
        onWeightsActivated(w);
      }
      return { ...w, isActive: match };
    });
    setWeightsList(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile(e.target.files[0]);
      if (!newName) {
        const cleanName = e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleAddWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate active binary weight loading progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 105) {
          clearInterval(interval);
          const mockId = `custom-weights-${Date.now()}`;
          const newWeightItem: CustomModelWeight = {
            id: mockId,
            name: newName,
            modelType: newType,
            fileName: newFile ? newFile.name : `${newName.toLowerCase().replace(/\s+/g, '_')}.bin`,
            fileSize: newFile ? `${(newFile.size / (1024 * 1024)).toFixed(1)} MB` : '45.0 MB',
            epochs: Number(epochs),
            classes: classesInput.split(',').map(c => c.trim()).filter(Boolean),
            mAP: parseFloat(mapInput) || 0.90,
            createdAt: new Date().toISOString().split('T')[0],
            isActive: false
          };

          setWeightsList(prevList => [...prevList, newWeightItem]);
          setIsUploading(false);
          setShowUploadForm(false);
          // Auto active
          handleWeightToggle(mockId);
          // Reset form
          setNewName('');
          setNewFile(null);
          return 0;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <HardDrive size={18} className="text-indigo-600 animate-pulse" />
          <h2 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">Neural Weights Config</h2>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-650 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-all cursor-pointer"
        >
          <Plus size={12} />
          <span>Upload Weights</span>
        </button>
      </div>

      {showUploadForm ? (
        <form onSubmit={handleAddWeights} className="space-y-3 bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1">
            <span className="font-bold text-slate-700">Import Custom Model Weights</span>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="text-slate-400 hover:text-slate-650"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Architecture Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as DetectionModel)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-medium text-slate-700 focus:border-indigo-500"
              >
                <option value="YOLO26">Custom YOLO26 Fine-Tuned Model</option>
                <option value="RF-DETR">Custom RF-DETR Fine-Tuned Model</option>
                <option value="SAM3">Custom SAM3 Segmentation Model</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Attach Model File (.pt / .onnx / .bin)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pt,.bin,.onnx,.weights,.pb"
                className="w-full text-[11px] text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Model Name</label>
            <input
              type="text"
              required
              placeholder="e.g. YOLOv26 Traffic FineTune"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Epochs Run</label>
              <input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-semibold focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Target mAP (0-1.0)</label>
              <input
                type="text"
                value={mapInput}
                onChange={(e) => setMapInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-mono focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Classes (Comma-separated)</label>
            <input
              type="text"
              placeholder="Car, Pedestrian, Bicycle, Cat"
              value={classesInput}
              onChange={(e) => setClassesInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none text-[11px] focus:border-indigo-500"
            />
          </div>

          {isUploading && (
            <div className="space-y-1 py-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Reading tensor values...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1 bg-slate-200 rounded overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${Math.min(uploadProgress, 100)}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-2 px-3 rounded text-xs cursor-pointer shadow-sm disabled:opacity-50 transition-all"
          >
            <Upload size={13} />
            <span>Parse & Compile Weights</span>
          </button>
        </form>
      ) : (
        <div className="space-y-2.5">
          {weightsList.map((weight) => {
            const isActive = weight.isActive || weight.id === activeWeightId;
            return (
              <div
                key={weight.id}
                onClick={() => handleWeightToggle(weight.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-indigo-50/70 border-indigo-305 text-indigo-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu size={14} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                    <span className="font-bold text-slate-700 text-xs leading-none">{weight.name}</span>
                  </div>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] bg-indigo-600 text-white font-semibold py-0.5 px-2 rounded-full leading-none">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{weight.fileName} • {weight.fileSize}</span>
                  <span className="text-slate-650 bg-slate-200/60 px-1 py-0.5 rounded">mAP: <b>{(weight.mAP * 100).toFixed(1)}%</b></span>
                </div>

                <div className="flex flex-wrap gap-1 mt-0.5">
                  {weight.classes.map((cls, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-indigo-200/50 text-indigo-800' : 'bg-white text-slate-500 border border-slate-200'
                      }`}
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* active weights metrics */}
      {activeWeight && (
        <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-start gap-2.5">
          <Info size={15} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700 block mb-0.5">Active Weights Node Layer:</span>
            Synthesized with {activeWeight.epochs} training epochs. This local weights binary injects <b>{activeWeight.classes.length}</b> standardized entity nodes into the active segment overlay layer.
          </div>
        </div>
      )}
    </div>
  );
}
