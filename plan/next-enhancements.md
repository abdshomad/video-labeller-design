# Future Enhancement Plan

This file manages the current development plan, active tasks, and historical implementations. Each main module lists exactly 3 innovative future enhancements marked with statuses `[TODO]` or `[DONE]`.

---

## 1. AI Inference Pipeline Modules

- **1.1**: [DONE] Implement a batch auto-labeling pipeline that triggers inference for ALL frames in the background simultaneously using a single click.
- **1.2**: [TODO] Add real-time confidence scores and IOU metrics visualization indicators in the drawing view dynamically as AI executes.
- **1.3**: [DONE] Introduce custom SAM3 point-guidance (positive/negative points) where clicks on the canvas guide the segmentation mask outline live.

---

## 2. Interactive SVG Canvas & Precision Tools

- **2.1**: [TODO] Add scale anchors on bounding box boundaries to let users resize or drag-shift existing annotations directly with the cursor.
- **2.2**: [TODO] Implement a smart polygon line simplify function (Ramer-Douglas-Peucker algorithm) to reduce dense vertices output for SAM3.
- **2.3**: [TODO] Build a zoom-and-pan magnifying viewport indicator to aid precise manual coordinate alignment of tiny background animals.

---

## 3. Data Integration & Frame Management

- **3.1**: [TODO] Implement COCO annotation schema and YOLO txt coordinate schema output options in the serialization export.
- **3.2**: [DONE] Build an interactive keyboard shortcuts guide panel (e.g. Space to play/pause, ESC to cancel draw, WASD for frame navigation).
- **3.3**: [TODO] Add a custom keyframe interpolation engine that automatically interpolates bounding box positions between two set keyframes linearly, eliminating manual frame-by-frame drag adjustments.
