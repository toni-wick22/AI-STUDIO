# Feature Matrix — Cue Geometry Trainer

| Requested Feature | Implementation Status | Functional Description |
| :--- | :---: | :--- |
| **Manual Training Table** | **COMPLETE** | Regulation 2:1 ratio top-down table, mahogany rails, pearl diamonds, 6 regulation pockets, customizable cloth themes. |
| **Manual Ball Management** | **COMPLETE** | Add balls (1-15), delete selected balls, smooth drag-and-drop repositioning with boundary clamping within playable cushions. |
| **Direct Shot Geometry** | **COMPLETE** | Computes ghost-ball contact point at exactly distance $2R$ along target-to-pocket vector. |
| **Cut Angle & Fraction** | **COMPLETE** | Degrees $0^\circ$ to $90^\circ$ calculated with ball fraction classification (Full, 3/4, 1/2 at 30°, 1/4, Thin). |
| **90-Degree Tangent Line** | **COMPLETE** | Stun shot deflection vector perpendicular to line of centers at impact. |
| **30-Degree Follow Rule** | **COMPLETE** | Natural rolling cue ball curve visualization labeled as educational approximation. |
| **Collision Corridor Detection** | **COMPLETE** | Ray-circle segment intersection detects intermediate balls blocking cue path or pocket line. |
| **1-Cushion Bank Shots** | **COMPLETE** | Mathematical mirror reflection method across table cushions to calculate precise rail bounce point. |
| **2-Cushion Bank Shots** | **COMPLETE** | Double mirror reflection calculation across two perpendicular cushions. |
| **Kick Shot Geometry** | **COMPLETE** | Cushion rebound path for cue ball to escape snookers and strike ghost ball. |
| **Three-Line Learning Mode** | **COMPLETE** | Toggle displays Aim line (white), Target line (yellow), and 90° Stun Tangent line (cyan) simultaneously. |
| **Visual Customization** | **COMPLETE** | Adjustable line thickness (1.5px to 5px), cloth colors (*Green, Blue, Charcoal, Burgundy*), diamond grid toggle. |
| **Shot Animation Simulator** | **COMPLETE** | "Simulate Shot" animates cue ball impact on ghost spot, target ball travel to pocket, and cue ball stun deflection. |
| **Curriculum & Lessons** | **COMPLETE** | 5 comprehensive lessons with detailed physics, key rules, and "Load Drill onto Table" buttons. |
| **Text-to-Speech (TTS)** | **COMPLETE** | Audio narration of lessons and coaching advice powered by `gemini-3.8-flash-tts` with offline Web Speech fallback. |
| **Optional Image Workspace** | **COMPLETE** | Sandboxed single-image file picker with 4-corner perspective calibration and "Delete Image & Analysis" button. |
| **Privacy & Compliance Screen** | **COMPLETE** | Explains zero tracking, local processing, and includes a "Purge Local Storage" button. |
| **Prohibited Permissions Audit** | **COMPLETE** | Zero sensitive permissions in manifest (`SYSTEM_ALERT_WINDOW`, `ACCESSIBILITY`, broad storage, camera, mic). |
| **Interactive Test Runner** | **COMPLETE** | Built-in UI and JVM unit test suite running 16 automated tests covering math, collisions, and permissions. |
| **Optional AI Coach (Gemini)** | **COMPLETE** | Multi-turn chat with Professor Cue gated by explicit user consent, model switcher, and table context analysis. |
| **Diagram Generator** | **COMPLETE** | Educational high-res diagram generator with affordances for 1K, 2K, and 4K resolution options. |
| **Native Android Project Export**| **COMPLETE** | Kotlin, Jetpack Compose, MVVM StateFlow source code and AndroidManifest.xml ready for Android Studio. |
