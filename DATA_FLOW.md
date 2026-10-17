# Data Flow & Privacy Architecture — Cue Geometry Trainer

## 1. Local Offline Architecture

```
+-------------------------------------------------------------------+
|                        LOCAL DEVICE SANDBOX                       |
|                                                                   |
|   +-----------------------+           +-----------------------+   |
|   |   Table Simulator     | <-------> | Geometry Engine       |   |
|   |  - Drag & Drop Balls  |           |  - Ghost Ball (2R)    |   |
|   |  - 6 Regulation Pockets|          |  - Cut Angle / Fraction|  |
|   |  - Cushion Rails      |           |  - Tangent Stun 90°   |   |
|   +-----------------------+           |  - Mirror Reflection  |   |
|              ^                        +-----------------------+   |
|              |                                                    |
|              v                                                    |
|   +-----------------------+           +-----------------------+   |
|   | Local In-Memory State |           | Image Workspace       |   |
|   |  - Vector2D coords    |           |  - Single Photo Picker|   |
|   |  - Visual preferences |           |  - 4-Corner Quad Pins |   |
|   |  - Saved Drills       |           |  - 100% In-Memory     |   |
|   +-----------------------+           +-----------------------+   |
|              |                                    |               |
|              v                                    v               |
|   +-----------------------------------------------------------+   |
|   |                 PURGE LOCAL DATA BUTTON                   |   |
|   |           Immediately deletes all in-memory state         |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

---

## 2. Optional AI Data Flow (Gated by Explicit User Consent)

```
   [User taps "Enable AI Coach"]
                |
                v
   +---------------------------------------+
   | Clear Disclosure Dialog               |
   | - Informs what data is sent           |
   | - Confirms NO images are uploaded     |
   | - Explicit Consent Granted            |
   +---------------------------------------+
                |
                v (Only when enabled by user)
   +---------------------------------------+
   | Client Request                        |
   | Data: Prompt + (Cut Angle, Distance)  |
   +---------------------------------------+
                |
                v (HTTPS to App Server Proxy)
   +---------------------------------------+
   | Express Server / Gemini Proxy Route   |
   | - GEMINI_API_KEY stored securely      |
   | - Never exposed to client APK/bundle  |
   +---------------------------------------+
                |
                v
   +---------------------------------------+
   | Google Gemini AI Service              |
   | - gemini-3.8-flash / 3.8-flash-tts    |
   +---------------------------------------+
```

---

## 3. Data Safety Summary
- **Personal Data Stored**: None
- **Location Data Collected**: None
- **Contacts / Phonebook Accessed**: None
- **Device Identifiers**: None
- **Imported Photos**: Kept strictly in device memory sandbox. Never sent over the network.
- **Data Deletion**: Complete deletion via "Purge Local Storage" and "Delete Image & Analysis".
