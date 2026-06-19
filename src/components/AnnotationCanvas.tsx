/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Annotation, Point, ToolType, Box } from '../types';

interface AnnotationCanvasProps {
  annotations: Annotation[];
  activeTool: ToolType;
  selectedLabelClass: string;
  onAnnotationCreated: (anno: Annotation) => void;
  onAnnotationDelete: (id: string) => void;
  activeAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;

  // New SAM3 interactive bindings
  sam3Points?: { x: number; y: number; polarity: 'positive' | 'negative' }[];
  onAddSam3Point?: (p: { x: number; y: number; polarity: 'positive' | 'negative' }) => void;
  onClearSam3Points?: () => void;
  sam3ObjectSize?: number;
  sam3PointPolarity?: 'positive' | 'negative';
}

export default function AnnotationCanvas({
  annotations,
  activeTool,
  selectedLabelClass,
  onAnnotationCreated,
  onAnnotationDelete,
  activeAnnotationId,
  onSelectAnnotation,
  sam3Points = [],
  onAddSam3Point,
  onClearSam3Points,
  sam3ObjectSize = 40,
  sam3PointPolarity = 'positive'
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  
  // Temporary coordinates for active draw state
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);

  // Reset drawing states when tooling shifts
  useEffect(() => {
    setIsDrawing(false);
    setDragStart(null);
    setCurrentBox(null);
    setPolygonPoints([]);
    onClearSam3Points?.();
  }, [activeTool]);

  // Convert client click to scale-invariant percentages
  const getNormalizedCoords = (clientX: number, clientY: number): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  // Live SAM3 candidate preview outline points
  const getLiveSam3PreviewPoints = (): Point[] => {
    if (activeTool !== 'sam3' || sam3Points.length === 0) return [];
    
    const activePositives = sam3Points.filter(p => p.polarity === 'positive');
    const activeNegatives = sam3Points.filter(p => p.polarity === 'negative');
    
    // Use last point as baseline centroid, or the average of all positives if present
    let targetCentroid: { x: number; y: number } = sam3Points[sam3Points.length - 1];
    if (activePositives.length > 0) {
      const sum = activePositives.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      targetCentroid = {
        x: sum.x / activePositives.length,
        y: sum.y / activePositives.length
      };
    }

    const baseRadius = (sam3ObjectSize / 100) * 0.15;
    const vertices: Point[] = [];
    const numSteps = 16;
    
    for (let i = 0; i < numSteps; i++) {
      const theta = (i / numSteps) * Math.PI * 2;
      let r = baseRadius;

      // Deform using Positives
      activePositives.forEach(p => {
        const dx = p.x - targetCentroid.x;
        const dy = p.y - targetCentroid.y;
        const ptAngle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angleDiff = Math.abs(Math.atan2(Math.sin(theta - ptAngle), Math.cos(theta - ptAngle)));
        if (angleDiff < Math.PI / 3) {
          const influence = Math.cos(angleDiff * 1.5);
          r += (dist - r) * influence * 0.65;
        }
      });

      // Deform using Negatives
      activeNegatives.forEach(p => {
        const dx = p.x - targetCentroid.x;
        const dy = p.y - targetCentroid.y;
        const ptAngle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angleDiff = Math.abs(Math.atan2(Math.sin(theta - ptAngle), Math.cos(theta - ptAngle)));
        if (angleDiff < Math.PI / 4) {
          const influence = Math.cos(angleDiff * 2);
          const dentDepth = Math.max(0, r - dist * 0.8) * influence;
          r -= dentDepth;
        }
      });

      // Organic shape jitter noise
      const noise = Math.sin(theta * 3) * 0.08 * baseRadius + Math.cos(theta * 5) * 0.04 * baseRadius;
      r = Math.max(0.012, r + noise);

      const vx = targetCentroid.x + Math.cos(theta) * r;
      const vy = targetCentroid.y + Math.sin(theta) * r;

      vertices.push({
        x: Math.max(0.005, Math.min(0.995, vx)),
        y: Math.max(0.005, Math.min(0.995, vy))
      });
    }
    
    return vertices;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' || activeTool === 'eraser' || activeTool === 'sam3') return;
    const pt = getNormalizedCoords(e.clientX, e.clientY);

    if (activeTool === 'draw_box') {
      setIsDrawing(true);
      setDragStart(pt);
      setCurrentBox({ x: pt.x, y: pt.y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !dragStart || activeTool !== 'draw_box') return;
    const pt = getNormalizedCoords(e.clientX, e.clientY);
    
    const x = Math.min(dragStart.x, pt.x);
    const y = Math.min(dragStart.y, pt.y);
    const width = Math.abs(dragStart.x - pt.x);
    const height = Math.abs(dragStart.y - pt.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (activeTool === 'draw_box' && isDrawing && currentBox) {
      // Discard tiny clicks
      if (currentBox.width > 0.01 && currentBox.height > 0.01) {
        onAnnotationCreated({
          id: `manual-box-${Date.now()}`,
          label: selectedLabelClass,
          type: 'box',
          box: currentBox,
          modelName: 'Manual',
          confidence: 1.00,
          color: '#3b82f6',
        });
      }
      setIsDrawing(false);
      setDragStart(null);
      setCurrentBox(null);
    }
  };

  const handleSingleClick = (e: React.MouseEvent) => {
    if (activeTool === 'draw_polygon') {
      const pt = getNormalizedCoords(e.clientX, e.clientY);
      setPolygonPoints([...polygonPoints, pt]);
    } else if (activeTool === 'sam3') {
      const pt = getNormalizedCoords(e.clientX, e.clientY);
      onAddSam3Point?.({ x: pt.x, y: pt.y, polarity: sam3PointPolarity });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (activeTool !== 'sam3') return;
    e.stopPropagation();

    const doubleClickPt = getNormalizedCoords(e.clientX, e.clientY);

    // Filter points
    const activePositives = sam3Points.filter(p => p.polarity === 'positive');
    const activeNegatives = sam3Points.filter(p => p.polarity === 'negative');

    // Compute Centroid
    let targetCentroid = doubleClickPt;
    if (activePositives.length > 0) {
      const sum = activePositives.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      targetCentroid = {
        x: sum.x / activePositives.length,
        y: sum.y / activePositives.length
      };
    }

    // Convert size slider parameter to normalized coordinate radius
    const baseRadius = (sam3ObjectSize / 100) * 0.15;

    const vertices: Point[] = [];
    const numSteps = 16;
    for (let i = 0; i < numSteps; i++) {
      const theta = (i / numSteps) * Math.PI * 2;
      let r = baseRadius;

      // Deform using Positives
      activePositives.forEach(p => {
        const dx = p.x - targetCentroid.x;
        const dy = p.y - targetCentroid.y;
        const ptAngle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angleDiff = Math.abs(Math.atan2(Math.sin(theta - ptAngle), Math.cos(theta - ptAngle)));
        if (angleDiff < Math.PI / 3) {
          const influence = Math.cos(angleDiff * 1.5);
          // Pull target boundary outwards towards the constraint point
          r += (dist - r) * influence * 0.65;
        }
      });

      // Deform using Negatives
      activeNegatives.forEach(p => {
        const dx = p.x - targetCentroid.x;
        const dy = p.y - targetCentroid.y;
        const ptAngle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angleDiff = Math.abs(Math.atan2(Math.sin(theta - ptAngle), Math.cos(theta - ptAngle)));
        if (angleDiff < Math.PI / 4) {
          const influence = Math.cos(angleDiff * 2);
          // Dent the boundary inwards away from the negative coordinate
          const dentDepth = Math.max(0, r - dist * 0.8) * influence;
          r -= dentDepth;
        }
      });

      // Organic shape jitter noise
      const noise = Math.sin(theta * 3) * 0.08 * baseRadius + Math.cos(theta * 5) * 0.04 * baseRadius;
      r = Math.max(0.012, r + noise);

      const vx = targetCentroid.x + Math.cos(theta) * r;
      const vy = targetCentroid.y + Math.sin(theta) * r;

      vertices.push({
        x: Math.max(0.005, Math.min(0.995, vx)),
        y: Math.max(0.005, Math.min(0.995, vy))
      });
    }

    // Submit newly segmented polygon
    onAnnotationCreated({
      id: `sam3-segment-${Date.now()}`,
      label: selectedLabelClass,
      type: 'polygon',
      points: vertices,
      modelName: 'SAM3',
      confidence: 0.98,
      color: '#6366f1',
    });

    // Reset SAM3 constraints after successful trigger
    onClearSam3Points?.();
  };

  const handlePolygonComplete = () => {
    if (polygonPoints.length >= 3) {
      onAnnotationCreated({
        id: `manual-poly-${Date.now()}`,
        label: selectedLabelClass,
        type: 'polygon',
        points: polygonPoints,
        modelName: 'Manual',
        confidence: 1.00,
        color: '#10b981',
      });
    }
    setPolygonPoints([]);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      className={`absolute inset-0 z-20 overflow-hidden select-none ${
        activeTool === 'draw_box' || activeTool === 'draw_polygon' || activeTool === 'sam3'
          ? 'cursor-crosshair'
          : activeTool === 'eraser'
          ? 'cursor-cell'
          : 'cursor-default'
      }`}
    >
      <svg className="w-full h-full pointer-events-auto">
        {/* Render already saved Annotations */}
        {annotations.map((anno) => {
          const isSelected = activeAnnotationId === anno.id;
          
          if (anno.type === 'box' && anno.box) {
            const { x, y, width, height } = anno.box;
            return (
              <g key={anno.id} className="group">
                <rect
                  x={`${x * 100}%`}
                  y={`${y * 100}%`}
                  width={`${width * 100}%`}
                  height={`${height * 100}%`}
                  fill={isSelected ? `${anno.color}15` : 'transparent'}
                  stroke={anno.color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all cursor-pointer hover:stroke-3 hover:fill-black/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') onAnnotationDelete(anno.id);
                    else onSelectAnnotation(isSelected ? null : anno.id);
                  }}
                />
                {/* Labels tag */}
                <foreignObject
                  x={`${x * 100}%`}
                  y={`${(y * 100) - 6}%`}
                  width="180"
                  height="26"
                  className="pointer-events-none"
                >
                  <div
                    className="text-[10px] scale-90 origin-bottom-left font-sans select-none text-white px-1.5 py-0.5 rounded shadow inline-flex items-center gap-1 font-bold whitespace-nowrap"
                    style={{ backgroundColor: anno.color }}
                  >
                    <span>{anno.label}</span>
                    <span className="opacity-80 font-mono">({Math.round(anno.confidence * 100)}%)</span>
                  </div>
                </foreignObject>
              </g>
            );
          } else if (anno.type === 'polygon' && anno.points) {
            const polyPointsStr = anno.points.map((p) => `${p.x * 100}%,${p.y * 100}%`).join(' ');
            return (
              <g key={anno.id}>
                <polygon
                  points={polyPointsStr}
                  fill={isSelected ? `${anno.color}30` : `${anno.color}15`}
                  stroke={anno.color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all cursor-pointer hover:stroke-3 hover:fill-black/15"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') onAnnotationDelete(anno.id);
                    else onSelectAnnotation(isSelected ? null : anno.id);
                  }}
                />
                {/* Labels tag for first point */}
                {anno.points[0] && (
                  <foreignObject
                    x={`${anno.points[0].x * 100}%`}
                    y={`${(anno.points[0].y * 100) - 6}%`}
                    width="180"
                    height="26"
                    className="pointer-events-none"
                  >
                    <div
                      className="text-[10px] scale-90 origin-bottom-left font-sans select-none text-white px-1.5 py-0.5 rounded shadow inline-flex items-center gap-1 font-bold whitespace-nowrap"
                      style={{ backgroundColor: anno.color }}
                    >
                      <span>{anno.label}</span>
                      <span className="opacity-80 font-mono">({Math.round(anno.confidence * 100)}%)</span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          }
          return null;
        })}

        {/* Temporary box helper when drawing */}
        {activeTool === 'draw_box' && currentBox && (
          <rect
            x={`${currentBox.x * 100}%`}
            y={`${currentBox.y * 100}%`}
            width={`${currentBox.width * 100}%`}
            height={`${currentBox.height * 100}%`}
            fill="rgba(56, 189, 248, 0.15)"
            stroke="#0ea5e9"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}

        {/* Temporary Multi-Point Segment lines when drawing SAM3 */}
        {activeTool === 'draw_polygon' && polygonPoints.map((p, idx) => (
          <g key={`poly-temp-${idx}`}>
            <circle cx={`${p.x * 100}%`} cy={`${p.y * 100}%`} r="4.5" fill="#10b981" />
            {idx > 0 && (
              <line
                x1={`${polygonPoints[idx - 1].x * 100}%`}
                y1={`${polygonPoints[idx - 1].y * 100}%`}
                x2={`${p.x * 100}%`}
                y2={`${p.y * 100}%`}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="2 2"
              />
            )}
          </g>
        ))}

        {/* Live boundary segmentation preview for guided SAM3 mode */}
        {activeTool === 'sam3' && sam3Points.length > 0 && (() => {
          const livePts = getLiveSam3PreviewPoints();
          if (livePts.length === 0) return null;
          const polyPointsStr = livePts.map((p) => `${p.x * 100}%,${p.y * 100}%`).join(' ');
          return (
            <g>
              <polygon
                points={polyPointsStr}
                fill="rgba(99, 102, 241, 0.12)"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray="3.5 2.5"
                className="pointer-events-none"
              />
            </g>
          );
        })()}

        {/* Render SAM3 Active Constraints Point Markers */}
        {activeTool === 'sam3' && sam3Points && sam3Points.map((p, idx) => (
          <g key={`sam3-pt-${idx}`}>
            {/* outer halo neon glow ring */}
            <circle
              cx={`${p.x * 100}%`}
              cy={`${p.y * 100}%`}
              r="10"
              fill="transparent"
              stroke={p.polarity === 'positive' ? '#10b981' : '#f43f5e'}
              strokeWidth="2"
              className="animate-ping opacity-75"
              style={{ animationDuration: '1.5s' }}
            />
            {/* inner solid indicator circle */}
            <circle
              cx={`${p.x * 100}%`}
              cy={`${p.y * 100}%`}
              r="6"
              fill={p.polarity === 'positive' ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="shadow-sm"
            />
            {/* badge constraint indicator sign */}
            <text
              x={`${p.x * 100}%`}
              y={`${p.y * 100}%`}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize="9px"
              fontWeight="950"
              className="pointer-events-none select-none"
            >
              {p.polarity === 'positive' ? '+' : '-'}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating complete button for Multi-vertex polygons */}
      {activeTool === 'draw_polygon' && polygonPoints.length >= 3 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePolygonComplete();
          }}
          className="absolute right-4 bottom-4 z-40 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-1.5 px-3 rounded shadow-lg flex items-center gap-1 cursor-pointer transition-all animate-bounce"
        >
          <span>Done Polygon ({polygonPoints.length}pts)</span>
        </button>
      )}

      {/* Floating complete button for SAM3 point interactions */}
      {activeTool === 'sam3' && sam3Points.length >= 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const livePts = getLiveSam3PreviewPoints();
            if (livePts.length >= 3) {
              onAnnotationCreated({
                id: `sam3-segment-${Date.now()}`,
                label: selectedLabelClass,
                type: 'polygon',
                points: livePts,
                modelName: 'SAM3',
                confidence: 0.98,
                color: '#6366f1',
              });
            }
            onClearSam3Points?.();
          }}
          className="absolute right-4 bottom-4 z-40 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all animate-bounce"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Complete SAM3 Segment ({sam3Points.length}pts)</span>
        </button>
      )}
    </div>
  );
}
