/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CustomModelWeight } from '../../src/types';

export const INITIAL_MODEL_WEIGHTS: CustomModelWeight[] = [
  {
    id: 'weights-yolo-traffic',
    name: 'YOLOv26 Traffic Optimal',
    modelType: 'YOLO26',
    fileName: 'yolov26_traffic_coco_500e.pt',
    fileSize: '43.2 MB',
    epochs: 500,
    classes: ['Car', 'Pedestrian', 'Signal', 'Bicycle', 'Truck'],
    mAP: 0.925,
    createdAt: '2026-03-12',
    isActive: true
  },
  {
    id: 'weights-sam3-medical',
    name: 'SAM3 Universal Segmenter',
    modelType: 'SAM3',
    fileName: 'sam3_vit_b_decoder_200e.onnx',
    fileSize: '112.5 MB',
    epochs: 200,
    classes: ['Segment', 'Boundary', 'Highlight', 'Specimen'],
    mAP: 0.941,
    createdAt: '2026-04-20',
    isActive: false
  },
  {
    id: 'weights-rfdetr-sports',
    name: 'RF-DETR Attention Tracker',
    modelType: 'RF-DETR',
    fileName: 'rf_detr_r50_tennis_300e.bin',
    fileSize: '82.8 MB',
    epochs: 300,
    classes: ['Player', 'Racket', 'SportsBall', 'NetLine'],
    mAP: 0.898,
    createdAt: '2026-05-02',
    isActive: false
  }
];

export const MOCK_GENERIC_WEIGHTS: Partial<CustomModelWeight>[] = [
  {
    name: 'YOLOv26 Nano Mobile',
    modelType: 'YOLO26',
    fileName: 'yolov26_nano_lite.onnx',
    fileSize: '15.4 MB',
    epochs: 150,
    mAP: 0.812
  },
  {
    name: 'SAM3 Specimen Fine-Tuned',
    modelType: 'SAM3',
    fileName: 'sam3_specimen_marine.pt',
    fileSize: '148.1 MB',
    epochs: 450,
    mAP: 0.958
  }
];
