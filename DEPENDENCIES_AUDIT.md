# Dependencies Audit — Cue Geometry Trainer

## 1. Overview
This audit examines all dependencies used in both the native Android application and the full-stack web simulator preview to assess network access, telemetry, data collection, and security risks.

---

## 2. Native Android Dependencies (`app/build.gradle.kts`)

| Dependency | Version | Purpose | Network Access | Data Collection Risk | Required |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `androidx.core:core-ktx` | `1.15.0` | Core Android Kotlin extensions | NO | NONE | YES |
| `androidx.lifecycle:lifecycle-runtime-ktx` | `2.8.7` | Android Lifecycle & Coroutines | NO | NONE | YES |
| `androidx.lifecycle:lifecycle-viewmodel-compose` | `2.8.7` | Compose ViewModel integration | NO | NONE | YES |
| `androidx.activity:activity-compose` | `1.9.3` | Activity Compose entrypoint | NO | NONE | YES |
| `androidx.compose:compose-bom` | `2024.11.00` | Jetpack Compose Bill of Materials | NO | NONE | YES |
| `androidx.compose.ui:ui` | BOM | Core UI declarative rendering | NO | NONE | YES |
| `androidx.compose.ui:ui-graphics` | BOM | Canvas & Vector2D drawing | NO | NONE | YES |
| `androidx.compose.material3:material3` | BOM | Material 3 UI design components | NO | NONE | YES |
| `junit:junit` | `4.13.2` | Local JVM unit tests for geometry | NO | NONE | YES (test) |
| `androidx.test.ext:junit` | `1.2.1` | AndroidX test instrumentation | NO | NONE | YES (test) |
| `androidx.test.espresso:espresso-core` | `3.6.1` | UI gesture verification | NO | NONE | YES (test) |

---

## 3. Web Environment Dependencies (`package.json`)

| Dependency | Version | Purpose | Network Access | Data Collection Risk | Required |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `react` / `react-dom` | `^19.0.1` | SPA rendering engine | NO | NONE | YES |
| `vite` | `^8.3.0` | Development server & bundler | Local only | NONE | YES |
| `express` | `^4.21.2` | Server proxy for optional AI | Localhost :3000 | NONE | YES |
| `@google/genai` | `^2.4.0` | Server-side Gemini AI SDK | Outbound to Google API (with consent) | User prompt only | Optional |
| `lucide-react` | `^0.546.0` | SVG icons | NO | NONE | YES |
| `motion` | `^12.23.24` | Animation utilities | NO | NONE | YES |
| `tailwindcss` | `^4.3.3` | Styling framework | NO | NONE | YES |

---

## 4. Third-Party Trackers & SDKs
- **Advertising SDKs**: NONE (0 ads)
- **Analytics SDKs**: NONE (0 telemetry)
- **External Gaming SDKs**: NONE (0 third-party integrations)

## 5. Audit Conclusion
**VERDICT: PASS**
No advertising, tracking, or unauthorized telemetry libraries are included.
