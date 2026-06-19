# Video Labeller 🎬🔍

A state-of-the-art, professional web-based video frame labeling & computer vision annotation platform. `Video Labeller` combines an intuitive manual editor with a full-stack, server-side AI inference pipeline to facilitate rapid dataset curation, target tracking, segment masking, and batch media processing.

The workspace is designed for maximum developer convenience, utilizing a high-contrast dark visual player canvas paired with a minimalist, aesthetic light-themed interface.

---

## 🚀 Key Platform Features

### 1. Dual-Workspace Workspace Separator & Advanced Timeline Controls
* **Manual vs. AI Hub Split**: The interface separates the core manual **Annotation Workspace** (focused solely on coordinate creation, shapes list, and timeline tracking) from the intensive config-driven **AI Model Hub** containing parameters, fine-tuning configurations, weights imports, and filtering rules.
* **Procedural Frame Vector Generation**: Dual-media engine. If no custom file is uploaded, the canvas procedurally renders recursive canvas graphics (`traffic crossroads`, `tennis sports tracking`, or `underwater deep sea ecosystems`) based on the active frame.
* **Standard Video File Support**: Complete drag-and-drop or file-picker support for `.mp4` and `.webm` formats. Includes a smart frame loader tracking native timelines.
* **Precision Playback controls**: Adjustable frame playback speed multipliers (`0.5x`, `1.0x`, `2.5x`) allowing fluid motion preview without memory choke.

### 2. Full-Stack AI Computer Vision Pipeline (Gemini Powered)
* **Secure CV Inference Proxy**: All AI inference is handled via a secure Express-side controller to protect standard credentials. Uses the modern `@google/genai` TypeScript SDK and the `gemini-3.5-flash` model to analyze keyframe images with strict JSON output parsing.
* **Three Model Architectures**:
  * **YOLO26**: Formulates standard bounding box boundaries optimized for core multi-class object detection.
  * **RF-DETR**: Utilizes Transformer attention mechanics to output highly precise, fine-grained object coordinates.
  * **SAM3**: Activates advanced Segment Anything attention mechanisms to draw complex outline polygons around target objects.
* **Parameter Customizer**: On-the-fly sliders for confidence limits, and tag class exclusions.

### 3. SAM3 Interactive AI Segmentation Tool
* **Winding Segmentation Polygons**: Double-clicking on the canvas automatically maps organic vector masks enclosing cursor positions.
* **Dynamic (+) & Negative (-) Polarities**: Refine boundaries by placing positive (green `+` signs pulling shape bounds) or negative (rose `-` markers pushing shape bounds) anchors.
* **Mask Preview Engine**: Live dashed indigo perimeter bounds display instantly as user places control points, allowing previewing of the mask prior to committing.

### 4. Workflow Automation & Fast Serialization
* **Multi-Frame Forward Propagation**: Fast propagation buttons (+10f, +20f, +50f, +100f) to instantly copy frame labels across blocks of oncoming frames without repetitive manual editing.
* **JSON Serialization**: Completely formatted dataset schema. Supports instant **JSON Export** to file and structured **JSON Import** to resume sessions.
* **Verification Rules Engine**: Establish data-quality gates. Filter confident tags, target specific coordinates (e.g. ignoring top celestial sky noise), and rename custom labels (e.g. mapping "truck" categories to "vehicle") automatically pre-commit.

### 5. Advanced Batch processing & Weighs Manager
* **Concurrent Background Batch Process**: Queue-based worker simulation executing parallel frame-by-frame analysis with individual worker state monitors (`F1`-`F10`), showing load, processing, success, or fail.
* **Custom Weights Importer**: High-fidelity hot-swappable layer monitoring training binaries (`.pt`, `.onnx`, `.weights`), mAP metrics, categories tracked, and total epochs.

### 6. Interactive Roadmap & Markdown Compiler
* **Durable Live Checklist Sync**: Displays developmental stages using an interactive card-layout matching `/plan/next-enhancements.md`. Checkboxes persist statuses directly to the back-end space.
* **High-contrast Markdown Editor**: A fully functional, monospaced raw text editor allowing engineers to modify the project's roadmap text in plain text directly from the dashboard.
* **Clipboard Copier**: Instant clipboard export matching task states with temporary visual feedback.

### 7. Unified Media Onboarding, Keyboard Hotkeys & Tour
* **Media Onboarding Landing Page**: Drag-and-drop cards, webcam stream capabilities, sample templates, and a 100-frame video limit warning banner.
* **Interactive Spotlight Tour**: Translucent SVG clip-path spotlight that highlights UI features dynamically with scroll-into-view viewport locking.
* **Keyboard Shortcuts Guide Panel**: Toggle real-time play (`Space`), cancel drawings (`ESC`), navigate (`WASD` / Arrow keys), and swap canvas tools (`1`-`5`) instantly. Offers a **Virtual Live Tester Key Indicator** highlighting keys on-screen as you press them.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **React 19 & TypeScript** | Client application structure & reliable state engine |
| **Styles** | **Tailwind CSS v4** | Modular layouts, slate-200 lines, and bespoke responsive theme |
| **Animations** | **Motion (`motion/react`)** | Fluid transitions, tour highlights, and modal HUD deck fades |
| **Backend** | **Node.js + Express** | Proxy APIs, roadmap IO sync, and AI CV inference proxies |
| **AI Integration**| **`@google/genai` (SDK v2)** | Multi-modal frame analysis and interactive segment outline |
| **Module Bundler**| **Vite + esbuild** | Fast dev server, and single CJS package compiler for production |

---

## 📁 Key File Structure

```text
├── server.ts                       # Complete Express full-stack proxy & file APIs
├── package.json                    # Dependencies, custom compilers, and build scripts
├── vite.config.ts                  # Configuration for client SPA & Vite dev middlewares
├── plan/
│   └── next-enhancements.md        # Sync target for interactive progression map
├── docs/
│   └── feature-list.md             # Standard feature reference list
├── data/
│   └── mockup/                     # Offline datasets representing simulated systems
│       ├── autoLabelRules.ts
│       ├── batchData.ts
│       ├── frameAnnotations.ts
│       └── videos.ts
├── src/
│   ├── App.tsx                     # Main React coordinator
│   ├── main.tsx                    # React client mounting context
│   ├── index.css                   # Global Tailwind CSS imports & custom typography
│   ├── types.ts                    # Global TypeScript configurations and schemas
│   ├── services/
│   │   └── api.ts                  # Fetch API client routing to Express proxy
│   └── components/                 # Extracted modular elements
│       ├── DynamicFutureFilmstrip.tsx
│       ├── AdvancedPipelineTabs.tsx
│       ├── AnnotationCanvas.tsx
│       ├── KeyboardShortcutsGuide.tsx
│       ├── OnboardingTour.tsx
│       └── ...
```

---

## 💻 Developer Setup Guide

### Environment Variables (.env)
Create a `.env` file in the project root containing your Gemini API credentials (never expose these variables to the browser context):

```env
# Secure backend keys - do not add VITE_ prefixes
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation
Populate the environment dependency folders:
```bash
npm install
```

### Running the Development Environment
Launches the full-stack system locally. The server automatically launches Express on port `3000` and configures the `Vite` middleware wrapper in development mode to bundle assets dynamically:
```bash
npm run dev
```

### Production Compilation & Deployment
To prepare the system for optimal performance or container deployment:
1. **Compilation**: Bundles the client files to `/dist` and compiles the backend TS server into a single, self-contained CommonJS (`dist/server.cjs`) file using `esbuild`. This bypasses strict ESM import errors and optimizes boot times:
   ```bash
   npm run build
   ```
2. **Execute Deployment Server**:
   ```bash
   npm run start
   ```

---

## 🔒 Security & Client Protection
This application follows the **server-proxy architecture** recommendation. It intercepts all computer vision requests and interacts with the Google GenAI endpoints solely on the Node.js Express server (`server.ts`).

* The Client SPA never accesses `process.env.GEMINI_API_KEY` directly.
* Security risks regarding client-side API key exposure in browser DevTools are eliminated.
* Intercepts and parses AI responses on the server, enforcing type-safe JSON returns back to the client annotation hooks.
