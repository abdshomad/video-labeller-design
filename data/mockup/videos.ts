/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VideoMetadata, FrameAnnotations } from '../../src/types';

export const SAMPLE_VIDEOS: VideoMetadata[] = [
  {
    id: 'traffic-01',
    title: 'Smart Crossing & Autonomous Traffic',
    duration: 10,
    fps: 1,
    frameCount: 10,
    thumbnailUrl: '🚗',
    description: 'Urban intersection footage monitoring pedestrian flows, multi-class vehicles, and crosswalk markers for autonomous driving systems.',
    tags: ['Autonomous Driving', 'Pedestrians', 'YOLO26']
  },
  {
    id: 'sports-01',
    title: 'Sports Tracking Arena',
    duration: 10,
    fps: 1,
    frameCount: 10,
    thumbnailUrl: '🎾',
    description: 'High-speed track camera analyzing athlete kinematics, equipment tracking (balls, rackets), and trajectory segmentation.',
    tags: ['Sports Analytics', 'Object Tracking', 'RF-DETR']
  },
  {
    id: 'coral-01',
    title: 'Deep Ocean Ecosystem Study',
    duration: 10,
    fps: 1,
    frameCount: 10,
    thumbnailUrl: '🐟',
    description: 'Submersible documentation of marine species, featuring SAM3 high-fidelity mask contours on fish, turtles, and coral structures.',
    tags: ['Marine Biology', 'SAM3 Segmentation', 'Instance Segmentation']
  },
  {
    id: 'truck-sacks-01',
    title: 'Worker Loading Sacks to Trucks (Top View)',
    duration: 10,
    fps: 1,
    frameCount: 10,
    thumbnailUrl: '📦',
    description: 'Overhead industrial camera footage analyzing warehouse logisitics, worker posture, heavy cargo sacks handling, and freight truck utilization ratios.',
    tags: ['Industrial Logistics', 'Acreage Monitor', 'Sack Count']
  }
];

export const MOCK_LABELS = {
  'traffic-01': ['Car', 'Pedestrian', 'Traffic Light', 'Bicycle', 'Truck'],
  'sports-01': ['Athlete', 'Tennis Ball', 'Racket', 'Net', 'Sneakers'],
  'coral-01': ['Sea Turtle', 'Clown Fish', 'Anemone', 'Coral Reef', 'Jellyfish'],
  'truck-sacks-01': ['Worker', 'Cargo Sack', 'Flatbed Truck', 'Loading Zone', 'Pallet']
};

export const COLOR_PALETTE = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1'  // Indigo
];

// Helper to get random color
export function getLabelColor(label: string, index: number = 0): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash + index) % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
}
