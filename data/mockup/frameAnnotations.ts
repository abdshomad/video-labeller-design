/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FrameAnnotations, Annotation } from '../../src/types';
import { getLabelColor } from './videos';

// Traffic video coordinates generator
function generateTrafficAnnotations(): FrameAnnotations {
  const annotations: FrameAnnotations = {};
  for (let frame = 0; frame < 10; frame++) {
    const shift = frame * 0.04;
    annotations[frame] = [
      {
        id: `t-car-1-${frame}`,
        label: 'Car',
        type: 'box',
        box: { x: 0.12 + shift, y: 0.48, width: 0.24, height: 0.22 },
        confidence: 0.96 - (frame * 0.005),
        modelName: 'YOLO26',
        color: getLabelColor('Car')
      },
      {
        id: `t-ped-1-${frame}`,
        label: 'Pedestrian',
        type: 'box',
        box: { x: 0.75 - shift * 0.6, y: 0.52, width: 0.08, height: 0.32 },
        confidence: 0.91 + (frame * 0.005),
        modelName: 'YOLO26',
        color: getLabelColor('Pedestrian')
      },
      {
        id: `t-light-1-${frame}`,
        label: 'Traffic Light',
        type: 'box',
        box: { x: 0.45, y: 0.12, width: 0.06, height: 0.16 },
        confidence: 0.98,
        modelName: 'YOLO26',
        color: getLabelColor('Traffic Light')
      }
    ];
    // Add an extra cyclist later in the clip
    if (frame >= 3) {
      annotations[frame].push({
        id: `t-bike-1-${frame}`,
        label: 'Bicycle',
        type: 'box',
        box: { x: 0.05 + (frame - 3) * 0.07, y: 0.6, width: 0.12, height: 0.25 },
        confidence: 0.84,
        modelName: 'YOLO26',
        color: getLabelColor('Bicycle')
      });
    }
  }
  return annotations;
}

// Sports video coordinates generator (tennis game)
function generateSportsAnnotations(): FrameAnnotations {
  const annotations: FrameAnnotations = {};
  for (let frame = 0; frame < 10; frame++) {
    const angle = (frame * Math.PI) / 9;
    const tennisBallX = 0.25 + frame * 0.055;
    const tennisBallY = 0.65 - Math.sin(angle) * 0.45;
    annotations[frame] = [
      {
        id: `s-athlete-1-${frame}`,
        label: 'Athlete',
        type: 'box',
        box: { x: 0.15 + (frame * 0.008), y: 0.32, width: 0.18, height: 0.6 },
        confidence: 0.95,
        modelName: 'RF-DETR',
        color: getLabelColor('Athlete')
      },
      {
        id: `s-athlete-2-${frame}`,
        label: 'Athlete',
        type: 'box',
        box: { x: 0.72 - (frame * 0.005), y: 0.38, width: 0.16, height: 0.54 },
        confidence: 0.93,
        modelName: 'RF-DETR',
        color: getLabelColor('Athlete')
      },
      {
        id: `s-ball-${frame}`,
        label: 'Tennis Ball',
        type: 'box',
        box: { x: tennisBallX, y: tennisBallY, width: 0.04, height: 0.04 },
        confidence: 0.88,
        modelName: 'RF-DETR',
        color: getLabelColor('Tennis Ball')
      }
    ];
  }
  return annotations;
}

// Coral Ecosystem generator (SAM3 Segmentations represented as smooth polygons)
function generateCoralAnnotations(): FrameAnnotations {
  const annotations: FrameAnnotations = {};
  for (let frame = 0; frame < 10; frame++) {
    const wave = Math.sin(frame * 0.4) * 0.02;
    annotations[frame] = [
      {
        id: `c-turtle-${frame}`,
        label: 'Sea Turtle',
        type: 'polygon',
        points: [
          { x: 0.3 + wave, y: 0.4 },
          { x: 0.45 + wave, y: 0.32 },
          { x: 0.62 + wave, y: 0.38 },
          { x: 0.68 + wave, y: 0.55 },
          { x: 0.5 + wave, y: 0.65 },
          { x: 0.35 + wave, y: 0.58 }
        ],
        confidence: 0.92,
        modelName: 'SAM3',
        color: getLabelColor('Sea Turtle')
      },
      {
        id: `c-fish-1-${frame}`,
        label: 'Clown Fish',
        type: 'polygon',
        points: [
          { x: 0.12 - wave, y: 0.72 },
          { x: 0.22 - wave, y: 0.68 },
          { x: 0.28 - wave, y: 0.74 },
          { x: 0.24 - wave, y: 0.82 },
          { x: 0.16 - wave, y: 0.8 }
        ],
        confidence: 0.89,
        modelName: 'SAM3',
        color: getLabelColor('Clown Fish')
      }
    ];
  }
  return annotations;
}

// Top-view warehouse loading sacks coordinates generator
function generateTruckSacksAnnotations(): FrameAnnotations {
  const annotations: FrameAnnotations = {};
  for (let frame = 0; frame < 10; frame++) {
    const phaseLeft = frame / 9;
    const phaseRight = frame / 9;

    annotations[frame] = [
      {
        id: `k-truck-left-${frame}`,
        label: 'Flatbed Truck',
        type: 'box',
        box: { x: 0.10, y: 0.05, width: 0.30, height: 0.35 },
        confidence: 0.98,
        modelName: 'YOLO26',
        color: getLabelColor('Flatbed Truck')
      },
      {
        id: `k-truck-right-${frame}`,
        label: 'Flatbed Truck',
        type: 'box',
        box: { x: 0.60, y: 0.05, width: 0.30, height: 0.35 },
        confidence: 0.98,
        modelName: 'YOLO26',
        color: getLabelColor('Flatbed Truck')
      },
      {
        id: `k-pallet-left-${frame}`,
        label: 'Pallet',
        type: 'box',
        box: { x: 0.15, y: 0.75, width: 0.20, height: 0.18 },
        confidence: 0.97,
        modelName: 'YOLO26',
        color: getLabelColor('Pallet')
      },
      {
        id: `k-pallet-right-${frame}`,
        label: 'Pallet',
        type: 'box',
        box: { x: 0.65, y: 0.75, width: 0.20, height: 0.18 },
        confidence: 0.97,
        modelName: 'YOLO26',
        color: getLabelColor('Pallet')
      },
      // Left Worker carrying sack
      {
        id: `k-worker-left-${frame}`,
        label: 'Worker',
        type: 'box',
        box: { x: 0.20, y: 0.76 - phaseLeft * 0.36 - 0.075, width: 0.10, height: 0.15 },
        confidence: 0.94,
        modelName: 'YOLO26',
        color: getLabelColor('Worker')
      },
      {
        id: `k-sack-left-${frame}`,
        label: 'Cargo Sack',
        type: 'box',
        box: { x: 0.215, y: 0.76 - phaseLeft * 0.36 - 0.075 - 0.06, width: 0.07, height: 0.08 },
        confidence: 0.82,
        modelName: 'YOLO26',
        color: getLabelColor('Cargo Sack')
      },
      // Right Worker carrying sack
      {
        id: `k-worker-right-${frame}`,
        label: 'Worker',
        type: 'box',
        box: { x: 0.70, y: 0.70 - phaseRight * 0.30 - 0.075, width: 0.10, height: 0.15 },
        confidence: 0.91,
        modelName: 'YOLO26',
        color: getLabelColor('Worker')
      },
      {
        id: `k-sack-right-${frame}`,
        label: 'Cargo Sack',
        type: 'box',
        box: { x: 0.715, y: 0.70 - phaseRight * 0.30 - 0.075 - 0.06, width: 0.07, height: 0.08 },
        confidence: 0.80,
        modelName: 'YOLO26',
        color: getLabelColor('Cargo Sack')
      }
    ];
  }
  return annotations;
}

export const MOCK_VIDEOS_ANNOTATIONS: { [videoId: string]: FrameAnnotations } = {
  'traffic-01': generateTrafficAnnotations(),
  'sports-01': generateSportsAnnotations(),
  'coral-01': generateCoralAnnotations(),
  'truck-sacks-01': generateTruckSacksAnnotations()
};
