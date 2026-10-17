# Permissions Audit — Cue Geometry Trainer

## 1. Overview
The **Cue Geometry Trainer** application strictly complies with Google Play Store Policies and user privacy directives. The application is completely offline-first and requests **ZERO** dangerous or sensitive Android runtime permissions.

---

## 2. Manifest Permissions Table

| Permission | Present in Manifest | Required Purpose | Sensitive / Dangerous | Recommendation |
| :--- | :---: | :--- | :---: | :--- |
| `SYSTEM_ALERT_WINDOW` | **NO** | N/A (Drawing over other apps is strictly prohibited) | YES | **EXCLUDE** (Compliant) |
| `BIND_ACCESSIBILITY_SERVICE` | **NO** | N/A (App does not automate inputs or read screen) | YES | **EXCLUDE** (Compliant) |
| `QUERY_ALL_PACKAGES` | **NO** | N/A (App never inspects installed apps/packages) | YES | **EXCLUDE** (Compliant) |
| `READ_MEDIA_IMAGES` | **NO** | N/A (Uses isolated system Photo Picker) | YES | **EXCLUDE** (Compliant) |
| `READ_EXTERNAL_STORAGE` | **NO** | N/A (App runs purely in internal sandbox) | YES | **EXCLUDE** (Compliant) |
| `MANAGE_EXTERNAL_STORAGE` | **NO** | N/A (No broad file system access) | YES | **EXCLUDE** (Compliant) |
| `RECORD_AUDIO` | **NO** | N/A (App only outputs audio via TTS playback) | YES | **EXCLUDE** (Compliant) |
| `CAMERA` | **NO** | N/A (App does not access camera hardware) | YES | **EXCLUDE** (Compliant) |
| `ACCESS_FINE_LOCATION` | **NO** | N/A | YES | **EXCLUDE** (Compliant) |
| `READ_CONTACTS` | **NO** | N/A | YES | **EXCLUDE** (Compliant) |

---

## 3. Photo Picker Verification
When using the optional Image Workspace, the application relies exclusively on the standard Android Photo Picker (`ActivityResultContracts.PickVisualMedia` / file picker) which does **not** require `READ_EXTERNAL_STORAGE` or `READ_MEDIA_IMAGES`.
The selected image URI is processed strictly in-memory within the local sandbox and is completely purged when the user taps **"Delete Image & Analysis"**.

---

## 4. Policy Verdict
**AUDIT RESULT: PASS (100% Compliant)**
Zero sensitive permissions requested. Fully safe for distribution on Google Play.
