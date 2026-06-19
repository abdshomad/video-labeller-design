/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Draw procedural vector art to represent video frames
export function renderMockFrame(
  ctx: CanvasRenderingContext2D,
  videoId: string,
  frame: number,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  if (videoId === 'traffic-01') {
    // Road crossing background
    ctx.fillStyle = '#1e293b'; // slate dark road
    ctx.fillRect(0, 0, width, height);

    // Crosswalk markers
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, height * 0.45, width, height * 0.3);
    ctx.fillStyle = '#e2e8f0';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(width * 0.12 + i * (width * 0.1), height * 0.48, width * 0.04, height * 0.24);
    }

    // Road lanes
    ctx.strokeStyle = '#fef08a'; // yellow dashed lines
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    ctx.lineTo(width, height * 0.2);
    ctx.moveTo(0, height * 0.82);
    ctx.lineTo(width, height * 0.82);
    ctx.stroke();
    ctx.setLineDash([]);

    // Drawing Traffic Car
    const carShift = frame * (width * 0.04);
    ctx.fillStyle = '#ef4444'; // Red Car
    ctx.beginPath();
    ctx.roundRect(width * 0.1 + carShift, height * 0.43, width * 0.2, height * 0.12, 12);
    ctx.fill();
    // Car windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(width * 0.2 + carShift, height * 0.44, width * 0.08, height * 0.04);

    // Walking pedestrian representation
    const pedShift = frame * (width * 0.024);
    ctx.fillStyle = '#10b981'; // Green Pedestrian
    const pedX = width * 0.78 - pedShift;
    const pedY = height * 0.58;
    ctx.beginPath();
    ctx.arc(pedX, pedY - 12, 8, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.fillRect(pedX - 4, pedY, 8, 30); // Body

    // Overhead Traffic Light pole
    ctx.fillStyle = '#64748b';
    ctx.fillRect(width * 0.45, 10, 10, height * 0.16);
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(width * 0.43, height * 0.08, 25, 50, 4);
    ctx.fill();
    // Active lights (change state at frame 5)
    ctx.fillStyle = frame < 5 ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.arc(width * 0.45, height * 0.1 + 8, 5, 0, Math.PI * 2);
    ctx.fill();

  } else if (videoId === 'sports-01') {
    // Green Tennis Court
    ctx.fillStyle = '#15803d'; // green grass
    ctx.fillRect(0, 0, width, height);

    // White lanes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(width * 0.1, height * 0.15, width * 0.8, height * 0.7);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.15);
    ctx.lineTo(width * 0.5, height * 0.85); // net middle line
    ctx.stroke();

    // The Net
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.12);
    ctx.lineTo(width * 0.5, height * 0.88);
    ctx.stroke();

    // Racket and ball
    const angle = (frame * Math.PI) / 9;
    const ballX = width * 0.22 + frame * (width * 0.056);
    const ballY = height * 0.65 - Math.sin(angle) * (height * 0.4);

    // Ball
    ctx.fillStyle = '#a3e635'; // Neon tennis yellow
    ctx.beginPath();
    ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Active Athletes
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(width * 0.2 + (frame * 3), height * 0.4, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(width * 0.76 - (frame * 2), height * 0.48, 14, 0, Math.PI * 2);
    ctx.fill();

  } else if (videoId === 'coral-01') {
    // Ambient Deep Ocean
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#0284c7');
    oceanGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Seabed structures & Coral Reefs
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.ellipse(width * 0.8, height * 0.9, 120, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const bubbleOff = Math.sin(frame * 0.8) * 15;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(width * 0.3 + i * 140 + bubbleOff, height * 0.8 - (frame * 35) - (i * 40), 6 + i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating Sea Turtle
    const wave = Math.sin(frame * 0.4) * 14;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(width * 0.46 + wave, height * 0.46, 25, 0, Math.PI * 2); // Shell
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(width * 0.38 + wave, height * 0.42, 10, 0, Math.PI * 2); // Head
    ctx.fill();

    // Colorful Clown Fish
    ctx.fillStyle = '#f97316'; // Orange body
    const fishX = width * 0.2 - wave;
    const fishY = height * 0.74;
    ctx.beginPath();
    ctx.ellipse(fishX, fishY, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // White stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fishX - 4, fishY - 9, 6, 18);
  } else if (videoId === 'truck-sacks-01') {
    // Top view warehouse concrete floor background
    ctx.fillStyle = '#f8fafc'; // Clean concrete-white floor (slate-50)
    ctx.fillRect(0, 0, width, height);

    // Concrete grid seams (makes it look like a real warehouse bay)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    // Draw horizontal grid lines
    for (let gY = height * 0.2; gY < height; gY += height * 0.2) {
      ctx.beginPath();
      ctx.moveTo(0, gY);
      ctx.lineTo(width, gY);
      ctx.stroke();
    }
    // Draw vertical center grid line
    ctx.beginPath();
    ctx.moveTo(width * 0.5, 0);
    ctx.lineTo(width * 0.5, height);
    ctx.stroke();

    // Helper to draw a Flatbed Truck (Top-View)
    const drawTruck = (tX: number, tY: number, tW: number, tH: number, color: string) => {
      // 1. Truck Bed Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.fillRect(tX + 4, tY + 4, tW, tH);

      // 2. Chassis / Tires
      ctx.fillStyle = '#0f172a'; // tires deep slate
      ctx.fillRect(tX - 8, tY + tH * 0.2, 8, 20);
      ctx.fillRect(tX + tW, tY + tH * 0.2, 8, 20);
      ctx.fillRect(tX - 8, tY + tH * 0.7, 8, 20);
      ctx.fillRect(tX + tW, tY + tH * 0.7, 8, 20);

      // 3. Cabin (front shell of truck, top-view, at the top)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(tX + tW * 0.1, tY, tW * 0.8, tH * 0.25, [8, 8, 2, 2]);
      ctx.fill();

      // Windshield (glass top-view)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(tX + tW * 0.2, tY + tH * 0.05, tW * 0.6, tH * 0.08, 2);
      ctx.fill();

      // Side mirrors
      ctx.fillStyle = '#475569';
      ctx.fillRect(tX + tW * 0.05, tY + tH * 0.12, 5, 8);
      ctx.fillRect(tX + tW * 0.9, tY + tH * 0.12, 5, 8);

      // 4. Flatbed Cargo Area / Box Walls
      ctx.fillStyle = '#e2e8f0'; // metallic bed walls
      ctx.fillRect(tX, tY + tH * 0.25, tW, tH * 0.75);

      ctx.fillStyle = '#78350f'; // wood slats container floor
      ctx.fillRect(tX + 4, tY + tH * 0.27, tW - 8, tH * 0.71);

      // Wood plank groove patterns
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      for (let s = tX + 16; s < tX + tW - 8; s += 16) {
        ctx.beginPath();
        ctx.moveTo(s, tY + tH * 0.27);
        ctx.lineTo(s, tY + tH * 0.98);
        ctx.stroke();
      }

      // 5. Pre-loaded burlap cargo sacks inside the truck bed
      ctx.fillStyle = '#ca8a04'; // amber burlap shade
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1;
      
      // Sacks placed neatly
      ctx.beginPath();
      ctx.roundRect(tX + tW * 0.15, tY + tH * 0.35, tW * 0.25, tH * 0.12, 4);
      ctx.roundRect(tX + tW * 0.55, tY + tH * 0.38, tW * 0.28, tH * 0.12, 4);
      ctx.roundRect(tX + tW * 0.35, tY + tH * 0.50, tW * 0.26, tH * 0.12, 4);
      ctx.fill();
      ctx.stroke();
    };

    // Draw Left Truck (Top-Left Position)
    drawTruck(width * 0.10, height * 0.05, width * 0.30, height * 0.35, '#2563eb'); // Royal Blue Truck

    // Draw Right Truck (Top-Right Position)
    drawTruck(width * 0.60, height * 0.05, width * 0.30, height * 0.35, '#dc2626'); // Crimson Red Truck


    // Helper to draw a Cargo Pallet (Bottom-View)
    const drawPallet = (pX: number, pY: number, pW: number, pH: number) => {
      // Pallet Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
      ctx.fillRect(pX + 3, pY + 3, pW, pH);

      // Wooden base
      ctx.fillStyle = '#b45309'; // brown pallet rim
      ctx.fillRect(pX, pY, pW, pH);

      // Horizontal slats
      ctx.fillStyle = '#d97706'; // lighter wood slates
      for (let sY = pY + 14; sY < pY + pH; sY += 15) {
        ctx.fillRect(pX + 2, sY, pW - 4, 6);
      }

      // Burlap cargo sacks resting on the pallet
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1;
      
      // Left stack, right stack, cross stack
      ctx.beginPath();
      ctx.roundRect(pX + pW * 0.10, pY + pH * 0.15, pW * 0.35, pH * 0.30, 3);
      ctx.roundRect(pX + pW * 0.52, pY + pH * 0.20, pW * 0.38, pH * 0.32, 3);
      ctx.roundRect(pX + pW * 0.25, pY + pH * 0.55, pW * 0.50, pH * 0.30, 3);
      ctx.fill();
      ctx.stroke();
    };

    // Draw Left Pallet (Bottom-Left Position, below left truck)
    drawPallet(width * 0.15, height * 0.75, width * 0.20, height * 0.18);

    // Draw Right Pallet (Bottom-Right Position, below right truck)
    drawPallet(width * 0.65, height * 0.75, width * 0.20, height * 0.18);


    // Helper to draw a logistics worker with safety apparel carrying a sack
    const drawWorker = (wX: number, wY: number, sX: number, sY: number, shirtColor: string) => {
      // 1. Draw worker shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.ellipse(wX + 2, wY + 3, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Vest / Torso
      ctx.fillStyle = '#f97316'; // Orange high-visibility vest
      ctx.beginPath();
      ctx.ellipse(wX, wY, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner colored shirt sleeve parts
      ctx.fillStyle = shirtColor;
      ctx.fillRect(wX - 18, wY - 3, 4, 6);
      ctx.fillRect(wX + 14, wY - 3, 4, 6);

      // Reflective safety stripes on the vest
      ctx.fillStyle = '#ffffff'; // White reflective striping
      ctx.fillRect(wX - 8, wY - 4, 2, 8);
      ctx.fillRect(wX + 6, wY - 4, 2, 8);

      // 3. Worker Safety Helmet (Head, top-view)
      ctx.fillStyle = '#facc15'; // Bright yellow helmet
      ctx.beginPath();
      ctx.arc(wX, wY, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Helmet seam lines
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(wX, wY, 6.5, -Math.PI / 4, Math.PI * 1.25);
      ctx.stroke();

      // 4. Burlap sack carried in front (above the worker's head from top-view)
      ctx.fillStyle = '#a16207'; // golden-brown heavy burlap
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(sX - 11, sY - 6, 22, 12, 3);
      ctx.fill();
      ctx.stroke();

      // Draw hands/arms holding the sack
      ctx.strokeStyle = '#fed7aa'; // light skin tone
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(wX - 12, wY);
      ctx.lineTo(sX - 7, sY + 3);
      ctx.moveTo(wX + 12, wY);
      ctx.lineTo(sX + 7, sY + 3);
      ctx.stroke();
    };

    // Worker Left Animation (Walking from bottom-left pallet to top-left truck)
    const phaseLeft = frame / 9;
    const worker1X = width * 0.25; // Centered with left pallet / truck path
    const worker1Y = height * (0.76 - phaseLeft * 0.36);
    const sack1X = worker1X;
    const sack1Y = worker1Y - 15;

    drawWorker(worker1X, worker1Y, sack1X, sack1Y, '#1d4ed8'); // Left worker wearing navy blue sleeve

    // Worker Right Animation (Walking from bottom-right pallet to top-right truck)
    const phaseRight = frame / 9;
    const worker2X = width * 0.75; // Centered with right pallet / truck path
    const worker2Y = height * (0.70 - phaseRight * 0.30);
    const sack2X = worker2X;
    const sack2Y = worker2Y - 15;

    drawWorker(worker2X, worker2Y, sack2X, sack2Y, '#047857'); // Right worker wearing forest green sleeve
  }
}
