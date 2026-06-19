# Platform Feature Inventory

This directory maintains the full, official list of features implemented on the Video Frame Labeler workspace, mapped to core user-facing and technical capabilities.

---

## 1. Unified Media Hub & procedural Frame Rendering

- **Procedural Frame Vector Generation**: Dual-mode rendering canvas. In the absence of an uploaded custom video, the application automatically processes procedural high-fidelity vector illustrations drawn recursively on HTML5 canvas representing `traffic crossroads`, `tennis sports tracking`, or `underwater deep sea ecosystems` based on the active frame.
- **Dynamic Local Media Loading**: Complete native support for HTML5 standard video files (.mp4, .webm). Users can drag-and-drop or select any custom recording. The application mounts a hidden capture context, maps timeline frames natively, and extracts keyframe frames at target timestamps.
- **Scale-Invariant Coordinates**: All bounding coordinates (x, y, width, height) and polygon coordinates (vertices list) are mapped as percentages (`0.0` to `1.0`) relative to viewport dimensions. This ensures shapes maintain positioning accuracy during container resizes.

---

## 2. Advanced AI Computer Vision Pipeline (Gemini Full-Stack)

- **Express-Side CV Inference Server**: Replaced client-side keys and mock scripts with a full-stack Node.js server using Express. Employs the modern `@google/genai` SDK with strict JSON response templates and `gemini-3.5-flash` to execute real-time image analysis.
- **Three Core Model Architectures**:
  - **YOLO26**: Formulates standard bounding boxes optimized for multi-class detection (traffic, vehicles).
  - **RF-DETR**: Core Transformer attention detection producing fine-grained tracking parameters.
  - **SAM3**: Interactive instant segmentation model that outputs full polygon lines surrounding complex specimen targets.
- **Custom Parameter Controls**: Flexible sliders regulating model confidence limits, and tag filters, providing dynamic subset processing.

---

## 3. Interactive Manual Canvas Overlay

- **Crosshair SVG Layer**: Absolute overlay layer matching canvas bounds containing crisp render boundaries of boxes and polygon nodes. Supports interactive hover highlights.
- **Segment Poly-Vector Plotting**: Manual polygon drawing tool. Users click to establish vertices, visualize connecting dashed indicators, and click "Done" to close and tag custom segment shapes.
- **Eraser Utility**: Instant subtraction tool. Clicking on any shape outline automatically deletes it from the active frame database.

---

## 4. Workflows Automation & Serialization

- **Propagate/Copy Labels Workflow**: One-click automation duplicating all labels from `frame - 1` directly into the current timestamp with safe localized ID mapping—enabling rapid item tracking across video lengths.
- **JSON Serialization (CVAT Compatible)**: Fully formatted JSON output detailing frame numbers, object class tags, confidence intervals, dimensions, and segment vertices. Supports:
  - **Export JSON**: Compiles the active project data into a downloadable offline file.
  - **Import JSON**: Uploads and repopulates the active labeling session database instantly.

---

## 5. Sleek Interface Design System & Brand Presence

- **NeuralLabel.io Branding**: Implemented custom branding centered on a premium, light-mode design system utilizing a crisp white backdrop accented with delicate slate-200 lines and soft indigo markers.
- **Inter & JetBrains Mono Fonts**: Added high-fidelity font pairings loading Google Fonts' Inter for system controls/metadata and JetBrains Mono for responsive coordinate numbers and metrics.
- **High-Contrast Dark Canvas Screen**: Uses high-contrast deep backdrops purely inside the vector frame player region for maximum focus, framed by clean slate cards with ambient shadows.

---

## 6. Dynamic Weights Manager, Batch Multiplexing & Validation Rules Rules Engine

- **Custom Weight Import & Compiler**: Users can browse and compile custom training binaries (`.pt`, `.onnx`, `.weights`). Hosts metadata records detailing Mean Average Precision metrics (mAP), epochs trained, categories registered, and file size. Allows instant hot-swapping of active validation layers.
- **Multiplex Batch Queue**: Processes multiple concurrent video clips sequentially or utilizing parallel background thread simulations. Visualizes individual loading bars, total label counts, and logs telemetry (e.g., Worker initialization, current frame index parsing, database saving).
- **Auto-Label Filter Rules Builder**: Logical rules builder to enforce data constraints. Supports high confidence cutoffs, spatial exclusion (e.g., ignoring upper celestial sky noise based on custom Y coordinates), and dynamic taxon standardizations (e.g., renaming 'Car' labels into 'Vehicle') applied automatically before DB commits.

---

## 7. Professional Dual-Workspace Screen Router, Lazy Buffer Decoder & Overhead Logistics

- **Pristine Labelling Workspace Separator**: Divided the workspace into two highly specialized layout views. The default "Annotation Workspace" centers solely on manual marking, shapes list, and timeline speed indicators—excluding heavy configuration forms to prevent clutter. The second view, "AI Model Hub," hosts all training parameter dashboards, fine-tuning setups, and automation filters.
- **Multi-Speed Video Playback Controls**: Added smooth auto-play tick logic with speed modes (0.5x, 1.0x, 2.5x) to preview tracked objects dynamically without browser lag.
- **On-Demand Lazy Frame Decoder**: Integrated a low-overhead frame loader that processes and buffers canvas frames lazily (on-demand), avoiding pre-allocating heavy frame array payloads inside browser memory.
- **Overhead Industrial Warehouse Tracker**: Procedurally renders a high-quality top-down camera view depicting two parallel flatbed trucks at the top (left and right), two cargo pallets at the bottom (left and right), and two logistics workers carrying heavy burlap sacks upward from the pallets directly to the flatbed trucks with dynamic, synchronized coordinate mapping variables.
- **Twin-Sack Logistics Verification**: Seamlessly integrated procedural visuals with automated tracking boxes so that both workers and carried bags are detected in unison, illustrating optimized high-precision computer-vision tracking layouts for warehouse operations.

---

## 8. App Branding Update & Multi-Frame Forward Propagation Presets

- **Video Labeller.io Branding**: Revamped the application's overall nomenclature to "Video Labeller", updating `metadata.json` and workspace headers to establish the definitive product purpose.
- **Multi-Frame Forward Propagation Engine**: Introduced high-efficiency multi-frame copying presets (+10f, +20f, +50f, +100f). Users can instantly copy annotations from a previous frame and propagate them forward across block chunks of subsequent frames without manual frame-by-frame mouse tracking or key inputs.

---

## 9. Modular Workspace Sidebars, AI Auto-Labeler & Logistics Sync

- **Integrated AI Auto-Labeler**: Returned the AI `ModelSelector` directly into the right-hand sidebar of the main Annotation Workspace. Users can now instantly trigger YOLOv26, RF-DETR, or segmenter executions directly on their active frames without toggling between screens.
- **One-Tap Manual Label Suggester**: Integrated an intuitive suggestion panel listing standard classes dynamically. Users can click any preset chip to instantly register and equip that class label for drawing without typing.
- **Bottom-to-Top Sacks Logistics Video**: Refined coordinates and canvas renderer paths to depict two logistics workers traveling vertically from two wooden pallets at the bottom (left and right) up to two flatbed trucks at the top (left and right), carrying cargo sacks for optimized full-stack logistics simulation.
- **Concurrent Background Batch Auto-Labeler**: Engineered a background batch pipeline that queues and executes AI inference on all frames of the active video clip simultaneously using a single click. Includes a real-time monitor displaying parallel worker states (F1–F10) as jobs load, process, completed, or fail.

---

## 10. Interactive System Roadmap Panel & Full-Stack Markdown Editor

- **Durable Live Roadmap Synchronization**: Added full-stack `GET` and `POST` API capabilities that read and write directly to `/plan/next-enhancements.md` on the container environment.
- **Interactive Checklist Progression**: Engineered an interactive board layout showing the distinct developmental modules, letting users click status checkboxes to mark items [TODO] or [DONE] with live, computed progress gauges.
- **Bi-directional Raw Text Editor**: Provided a high-contrast monospaced text editor inside the UI so developers can directly inspect, modify, and format raw markdown before writing it securely back to the file system.
- **One-Tap Task Clipboard Copier**: Integrated a premium clipboard copying feature for each enhancement task item. Users can hover over any task card to reveal a copy shortcut that instantly formats and saves the task's progress state, unique ID, and details to the clipboard with temporary success animation feedback.

---

## 11. SAM3 Interactive AI Segmentation Tool

- **Double-Click Auto-Segmentation**: Leverages a highly physical, double-click handler on the visual canvas. Double-clicking instantly generates custom winding organic segmentation shapes at cursor coordinates.
- **Interactive Positive (+) & Negative (-) Polarities**: Allows users to single-click the canvas to define boundary constraints with positive guide-markers (green `+` signs pulling the vector boundaries) or negative exclusions (rose `-` markers denting/avoiding boundaries).
- **Adjustable Segmentation Size (Radius Slider)**: Provides on-the-fly radius sliders in the manual toolbar so developers can specify narrow or massive object bounds before triggering segment formulation.
- **Custom Guided SAM3 Live Preview Outline**: Engineered a background mathematical deformation engine that calculates and draws a live dashed indigo boundary preview and uncommitted mask on the SVG canvas *instantly* as the user clicks positive/negative anchor constraints, previewing the resulting segment before committing.
- **Floating Commit Assistant**: Provided a prominent floating segment completion action badge directly on the canvas for seamless click-to-submit workflow accessibility.

---

## 12. Frame Propagation Filmstrip Context View

- **Dynamic Future Filmstrip**: Added a 5-frame preview panel situated directly below the interactive timeline showing a sequential sliding window of coming frames.
- **Procedural Canvas Thumbnails**: Leverages on-the-fly procedural vector graphics to render precise preview canvas thumbnails for incoming context frames, maintaining performance and reducing RAM overhead.
- **Label & Object Density Indicators**: Inspects frames ahead to output precise object counts, tag classifications, and populated labels live.
- **Click-to-Seek Shuttle**: Supports quick-seeking by clicking on any thumbnail to immediately jump the focus window to that timeline index.

---

## 13. High-Speed Productivity Keyboard Shortcuts & Guide Panel

- **Smart Focused Keyboard Listener Hook**: Configured a global window keyDown event system in the main React application controller with key triggers filtered out dynamically if a user is actively typing descriptive labels inside input boxes or text fields.
- **Core Hotkey Triggers**: Enabled Spacebar to toggle real-time video playback auto-play loop, Escape to abort drawings or clear active SAM3 interaction anchor points, WASD/Arrows for lightning-fast timeline frame seek, and numeric keys 1-5 to swap manual canvas tools instantly.
- **Interactive Cheat-Sheet Dashboard**: Added a gorgeous modern dark HUD modal accessible via clicking is "Shortcuts" in the header or pressing raw `?` / `Ctrl+K`. It includes grouping of shortcuts, detailed utility listings, and a **Live Input Key Tester** highlighting virtual keys on-screen in real-time as physical typing is captured.

---

## 14. Video Labeller Landing Page & Media Onboarding Hub

- **Minimalist Media Selection Onboarding**: Replaced initial auto-load behavior with a highly polished onboarding landing page inspired by the premium computer vision design layout.
- **Robust Multi-source Upload Controls**: Incorporates drag-and-drop actions, local file folder selector prompts, and a real-time webcam session tool (equipped with dynamic local device access and a smart computer-vision stream simulator fallback in case of iframe camera sandbox restrictions).
- **"100 Frames Limit" Label**: Displays prominent UI layout titles reading "Upload an image or a short video" and high-impact warning notices stating "Long videos will be trimmed to 100 frames."
- **Tactile Sandbox Template Cards**: Renders a row of thumbnail-based interactive training templates at the bottom with labels, tags, and descriptive hover metrics, enabling instant loading of default environments.
- **Global Return-to-Upload Capability**: Embeds a dedicated, styled "← Uploader Screen" action inside the active workspace header bar, providing seamless bi-directional navigation.

---

## 15. Premium Interactive Onboarding Tour

- **Deeply Integrated Dual-Phase Flow**: Features a unified onboarding tour system that covers both the media uploader landing page and the active model labeling workspace panels.
- **Dynamic Spotlight Mask Backdrop**: Employs real-time `getBoundingClientRect` math coupled with a translucent SVG clip-path spotlight mask, creating a beautiful spotlight effect focusing on target elements with a pulsed glow.
- **Auto-Action Sandbox Transition Bridge**: Automatically loads the template media assets and smoothly carries the user forward when moving across steps from the onboarding landing cards into the workspace.
- **Polished Slate HUD Deck**: Employs elegant dark mode card overlays featuring stage indicators (e.g., "Step 3 / 9"), dot navigation selectors, previous/next controls, and a quick-skip shortcut.
- **Ultra-Simple Language Translation**: Upgraded information dialogs to use extremely clear, simple, human-friendly definitions so that walk-throughs are easily understood by any developer or user in under 1 minute.
- **Vibrant Viewport Target Locking & Smooth Auto-Scroller**: Hooks up smooth scroll-into-view triggers once targeted elements appear inside the viewport. The floating overlay positions itself precisely with zero flickering.

---

## 16. Intelligent Multi-Class Object Selection Wizard

- **Simple and Intuitive Target Selection**: Designed a highly simplified objects wizard which launches automatically after custom file drops, camera recordings, or selecting preset sample templates.
- **Simulated Video Upload and Processing**: Plays a satisfying progress timeline featuring two detailed sub-stages—fast file upload progress from 0% to 100%, followed by live AI pattern-scanning checks on video frames showing real-time feedback ticks.
- **Occurrence-ranked Quick-Checklist**: Scans uploaded files or template profiles to suggest candidate classes sorted strictly by general occurrence rates (highest count first). Features a clean checklist structure highlighting items found in the video.
- **Custom Tags Extender**: Provides an input field to let users key in additional custom target labels or rename existing ones.
- **Unified Workspace Initialization**: Confirms choices instantly, loading selected labels straight into the main workspace selector options and model training panels.

---

## 17. Cross-Screen Environment Toggle

- **Always-Accessible Mode Selector**: Integrated the Demo/Live environment toggle on the initial welcome screen header, aligning with the workspace hub's native mode switcher.
- **Synced Workspace Context**: Changes to environment modes propagate across screens seamlessly, ensuring state consistency regardless of active screen state.




