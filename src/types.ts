/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number; // Normalized (0.0 to 1.0)
  y: number; // Normalized (0.0 to 1.0)
}

export interface Box {
  x: number;      // Normalized (0.0 to 1.0)
  y: number;      // Normalized (0.0 to 1.0)
  width: number;  // Normalized (0.0 to 1.0)
  height: number; // Normalized (0.0 to 1.0)
}

export type AnnotationType = 'box' | 'polygon';

export interface Annotation {
  id: string;
  label: string;
  type: AnnotationType;
  box?: Box;
  points?: Point[];
  confidence?: number;
  modelName: string; // 'Manual', 'YOLO26', 'RF-DETR', 'SAM3'
  color: string;
}

export interface FrameAnnotations {
  [frameNumber: number]: Annotation[];
}

export interface VideoMetadata {
  id: string;
  title: string;
  duration: number; // in seconds
  fps: number;
  frameCount: number;
  thumbnailUrl: string;
  videoUrl?: string; // optional, can load remote or uploaded file
  description: string;
  tags: string[];
}

export type DetectionModel = 'YOLO26' | 'RF-DETR' | 'SAM3';

export interface ModelConfig {
  model: DetectionModel;
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
  selectedClasses: string[];
}

export type ToolType = 'select' | 'draw_box' | 'draw_polygon' | 'eraser' | 'sam3';

export type AppMode = 'demo' | 'live';

// Model Weights Management Interfaces
export interface CustomModelWeight {
  id: string;
  name: string;
  modelType: DetectionModel;
  fileName: string;
  fileSize: string;
  epochs: number;
  classes: string[];
  mAP: number; // Mean Average Precision
  createdAt: string;
  isActive: boolean;
}

// Batch Processing Interfaces
export interface BatchProcessItem {
  videoId: string;
  title: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number; // percentage
  frameCount: number;
  labelsCreated: number;
}

export interface BatchConfig {
  mode: 'sequential' | 'parallel';
  autoSave: boolean;
  clearExisting: boolean;
}

// Auto-Label Rules Engine Interfaces
export type RuleConditionType = 'class_filter' | 'confidence_threshold' | 'spatial_filtering' | 'auto_relabel';

export interface AutoLabelRule {
  id: string;
  name: string;
  isEnabled: boolean;
  type: RuleConditionType;
  classMatch?: string; // target class, or 'all'
  value?: number;      // e.g. min confidence
  relabelTarget?: string; // target class for auto_relabel
  spatialArea?: {
    minY?: number;
    maxY?: number;
    minX?: number;
    maxX?: number;
  };
}
