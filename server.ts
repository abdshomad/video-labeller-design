/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to parse high-res base64 frames
  app.use(express.json({ limit: '10mb' }));

  // Shared server-side API client for Gemini
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY });
  });

  // Read the active platform enhancement plan
  app.get('/api/plan', async (req, res) => {
    try {
      const fs = await import('fs/promises');
      const planPath = path.join(process.cwd(), 'plan', 'next-enhancements.md');
      const data = await fs.readFile(planPath, 'utf-8');
      res.json({ content: data });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve enhancements plan file: ' + err.message });
    }
  });

  // Save changes/toggles to the platform enhancement plan file
  app.post('/api/plan', async (req, res): Promise<any> => {
    try {
      const { content } = req.body;
      if (content === undefined) {
        return res.status(400).json({ error: 'Content parameter is required.' });
      }
      const fs = await import('fs/promises');
      const planPath = path.join(process.cwd(), 'plan', 'next-enhancements.md');
      await fs.writeFile(planPath, content, 'utf-8');
      res.json({ status: 'success' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update enhancements plan file: ' + err.message });
    }
  });

  // Auto-label post endpoint using Gemini with structured JSON output
  app.post('/api/auto-label', async (req, res): Promise<any> => {
    const { image, model, classes } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please add your key in the Secrets panel.'
      });
    }

    try {
      // Decode image
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        }
      };

      const classesPrompt = classes && classes.length > 0 
        ? `Focus only on detecting: ${classes.join(', ')}.`
        : 'Focus on primary objects, humans, and significant background items.';

      const promptText = `
        You are a state-of-the-art computer vision model representing ${model}.
        Detect major objects in this video frame and provide their boundaries.
        ${classesPrompt}
        
        Rules:
        1. If model is SAM3, return type as 'polygon' and list 5-8 sequential vertices in 'points' to form a closed shape around the object (normalized 0.0 to 1.0).
        2. If model is YOLO26 or RF-DETR, return type as 'box', and provide 'box' boundaries. 'box' coords must be normalized values between 0.0 and 1.0 (relative to top-left 0,0 of the image).
        3. Assign a reasonable confidence score between 0.70 and 0.99.
      `;

      // Set up schema to enforce structured annotations
      const schema = {
        type: Type.OBJECT,
        properties: {
          annotations: {
            type: Type.ARRAY,
            description: 'List of detected annotations in the video frame.',
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: 'Class label like Car, Pedestrian, Ball, person, etc.' },
                type: { type: Type.STRING, description: '"box" or "polygon"' },
                confidence: { type: Type.NUMBER, description: 'Prediction score' },
                box: {
                  type: Type.OBJECT,
                  description: 'Bounding box coords, required only if type is "box"',
                  properties: {
                    x: { type: Type.NUMBER, description: 'Normalized top-left x (0.0 to 1.0)' },
                    y: { type: Type.NUMBER, description: 'Normalized top-left y (0.0 to 1.0)' },
                    width: { type: Type.NUMBER, description: 'Normalized width (0.0 to 1.0)' },
                    height: { type: Type.NUMBER, description: 'Normalized height (0.0 to 1.0)' },
                  }
                },
                points: {
                  type: Type.ARRAY,
                  description: 'List of point vertices forming segmentation outline, required if type is "polygon"',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER }
                    }
                  }
                }
              },
              required: ['label', 'type', 'confidence']
            }
          }
        },
        required: ['annotations']
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [imagePart, { text: promptText }],
        config: {
          systemInstruction: 'You are an advanced Computer Vision segmentation and bounding-box inference server. Provide high-precision analytical responses adhering strictly to the json schema.',
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      });

      const rawText = response.text || '{"annotations": []}';
      const resultObj = JSON.parse(rawText);
      res.json(resultObj);
    } catch (err: any) {
      console.error('Inference server failed:', err);
      res.status(500).json({ error: err.message || 'Server inference issue occurred.' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched on port ${PORT}`);
  });
}

startServer();
