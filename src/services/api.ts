/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Annotation, FrameAnnotations, DetectionModel } from '../types';
import { MOCK_VIDEOS_ANNOTATIONS } from '../../data/mockup/frameAnnotations';
import { getLabelColor } from '../../data/mockup/videos';

// In-memory session database to store user custom modifications
const localDatabase: { [videoId: string]: FrameAnnotations } = JSON.parse(
  JSON.stringify(MOCK_VIDEOS_ANNOTATIONS)
);

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('API server down');
    return await res.json();
  } catch {
    return { status: 'error', hasApiKey: false };
  }
}

// Fetch all annotations for a specific video and mode
export function getFrameAnnotations(videoId: string, mode: 'demo' | 'live'): FrameAnnotations {
  // Always return local session DB, initialized with mockups
  if (!localDatabase[videoId]) {
    localDatabase[videoId] = {};
  }
  return localDatabase[videoId];
}

// Update single frame annotations
export function saveFrameAnnotations(videoId: string, frame: number, annotations: Annotation[]) {
  if (!localDatabase[videoId]) {
    localDatabase[videoId] = {};
  }
  localDatabase[videoId][frame] = annotations;
}

// Propagate labels from previous frame: "Auto-label from previous frame"
export function copyFromPreviousFrame(
  videoId: string,
  currentFrame: number
): Annotation[] {
  if (currentFrame <= 0) return [];
  const db = getFrameAnnotations(videoId, 'demo');
  const previousAnnotations = db[currentFrame - 1] || [];

  // Map to new IDs to prevent duplication conflicts while remaining fully editable
  const duplicated: Annotation[] = previousAnnotations.map((anno) => ({
    ...anno,
    id: `${anno.modelName.toLowerCase()}-${anno.label.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  }));

  saveFrameAnnotations(videoId, currentFrame, duplicated);
  return duplicated;
}

// Perform AI Auto-Labelling
export async function autoLabelFrame(
  imageBlockBase64: string,
  model: DetectionModel,
  classes: string[],
  activeVideoId: string,
  frame: number,
  mode: 'demo' | 'live'
): Promise<Annotation[]> {
  if (mode === 'demo') {
    // Generate/Simulate predictions using sample DB
    await new Promise((resolve) => setTimeout(resolve, 800)); // smooth user simulation
    const originalMock = MOCK_VIDEOS_ANNOTATIONS[activeVideoId]?.[frame] || [];
    
    // Filter by model characteristics
    const matched = originalMock.map((anno, index) => {
      // Simulate SAM3 doing polygons, others doing boxes
      const type = model === 'SAM3' ? 'polygon' : 'box';
      const annotation: Annotation = {
        id: `demo-${model.toLowerCase()}-${index}-${Date.now()}`,
        label: anno.label,
        type: type,
        modelName: model,
        confidence: Number((0.85 + Math.random() * 0.13).toFixed(2)),
        color: getLabelColor(anno.label, index),
      };

      if (type === 'box') {
        annotation.box = anno.box || { x: 0.2, y: 0.2, width: 0.3, height: 0.3 };
      } else {
        annotation.points = anno.points || [
          { x: 0.2, y: 0.2 },
          { x: 0.5, y: 0.2 },
          { x: 0.4, y: 0.6 }
        ];
      }
      return annotation;
    });

    saveFrameAnnotations(activeVideoId, frame, matched);
    return matched;
  } else {
    // Live Mode: trigger server-side Gemini CV pipeline
    const response = await fetch('/api/auto-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBlockBase64, model, classes }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || 'Server CV model inference failed');
    }

    const data = await response.json();
    const serverAnnos: Annotation[] = (data.annotations || []).map((anno: any, index: number) => {
      const label = anno.label || 'Object';
      const color = getLabelColor(label, index);
      return {
        id: `live-${model.toLowerCase()}-${index}-${Date.now()}`,
        label,
        type: anno.type === 'polygon' ? 'polygon' : 'box',
        box: anno.box,
        points: anno.points,
        confidence: anno.confidence || 0.90,
        modelName: model,
        color
      };
    });

    saveFrameAnnotations(activeVideoId, frame, serverAnnos);
    return serverAnnos;
  }
}

// Fetch platform roadmap and future enhancement plan (reads next-enhancements.md)
export async function fetchPlatformPlan(): Promise<string> {
  try {
    const res = await fetch('/api/plan');
    if (!res.ok) throw new Error('Failed to fetch plan from server');
    const data = await res.json();
    return data.content || '';
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

// Save platform roadmap changes back to next-enhancements.md
export async function savePlatformPlan(content: string): Promise<boolean> {
  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to save plan to server');
    const data = await res.json();
    return data.status === 'success';
  } catch (err: any) {
    console.error(err);
    return false;
  }
}
