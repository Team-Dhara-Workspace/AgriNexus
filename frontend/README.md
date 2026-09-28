# AgriNexus — Mobile & Web Frontend

AgriNexus is a React Native & Expo application designed to provide AI-powered agricultural advisory services to farmers. It offers real-time agronomic chat, voice conversations with AI, crop disease/pest diagnostics via computer vision, hyper-local weather alerts, and multilingual localization.

---

## Table of Contents
- [1. Technology Stack & Packages](#1-technology-stack--packages)
- [2. System Architecture & Component Communication](#2-system-architecture--component-communication)
- [3. State Management & Data Flow](#3-state-management--data-flow)
- [4. Screen Catalog](#4-screen-catalog)
- [5. API Integration & Backend Services](#5-api-integration--backend-services)
- [6. Directory Structure](#6-directory-structure)
- [7. Setup, Environment & Scripts](#7-setup-environment--scripts)

---

## 1. Technology Stack & Packages

### Core Frameworks
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `expo` | `~57.0.24` | Core Expo application runtime & native module bridge |
| `react` | `19.2.3` | UI library core |
| `react-native` | `0.86.3` | Cross-platform native component runtime |
| `react-native-web` | `^0.21.2` | Web platform compilation and DOM compatibility |
| `react-native-safe-area-context` | `^5.6.2` | Notch, home indicator, and device inset management |

### State Management & Localization
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `@reduxjs/toolkit` | `^2.12.0` | Global state management (async thunks & slices) |
| `react-redux` | `^9.3.0` | React bindings for Redux store |
| `i18next` | `^26.3.6` | Localization & translation engine |
| `react-i18next` | `^17.0.10` | React hooks & HOCs for i18n (`useTranslation`) |

### Media, Hardware & Native Capabilities
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `expo-audio` | `~57.0.5` | High-fidelity voice recording for conversational AI mode |
| `expo-speech` | `~57.0.3` | Text-to-speech engine with regional voice matching |
| `expo-image-picker` | `~57.0.19` | Camera capture & gallery picking for pest diagnostics |
| `expo-document-picker` | `~57.0.2` | Document attachment and multi-format file selection |
| `expo-location` | `~57.0.19` | GPS device location acquisition for weather |
| `expo-file-system` | `~57.0.7` | File upload/download and multipart streaming |
| `expo-font` | `~57.0.0` | Native font asset loader for vector icon sets |
| `expo-asset` | `~57.0.0` | Asset pipeline management for native bundles |
| `expo-status-bar` | `~57.0.1` | Native status bar styling controls |
| `@expo/vector-icons` | `^15.0.2` | Vector icon suites (`Feather`, `Ionicons`, `MaterialCommunityIcons`) |

### Styling & Dev Tools
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `nativewind` | `^2.0.11` | TailwindCSS compiler for React Native StyleSheet |
| `tailwindcss` | `3.3.2` | Utility-first CSS class engine |
| `typescript` | `~6.0.3` | Static type checking and compiler verification |
| `babel-preset-expo` | `~57.0.0` | Babel transpilation preset for Expo |

---

## 2. System Architecture & Component Communication

```
                     ┌──────────────────────────┐
                     │     App.tsx (Root)       │
                     │  - SafeAreaProvider      │
                     │  - Redux Store Provider  │
                     │  - Global State & Auth   │
                     └─────────────┬────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
┌─────────▼─────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│  AuthScreen.tsx   │    │ HomeScreen.tsx    │    │  ChatScreen.tsx   │
│  - User Auth      │    │ - Weather Card    │    │  - Conversational │
│  - Form Anims     │    │ - Farm Insights   │    │  - Markdown Msg   │
└───────────────────┘    │ - Quick Tools     │    └─────────┬─────────┘
                         └───────────────────┘              │
                                   │              ┌─────────▼─────────┐
                         ┌─────────▼─────────┐    │  ConvoModal.tsx   │
                         │PestDetectionScreen│    │  - Audio Stream   │
                         │ - Camera / Upload │    │  - TTS Playback   │
                         │ - YOLO AI Results │    └───────────────────┘
                         └───────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼─────────┐         ┌─────────▼─────────┐
          │   Sidebar.tsx     │         │ BottomNavbar.tsx  │
          │  - Chat Sessions  │         │  - Navigation Hub │
          │  - History Delete │         │  - Active Tabs    │
          └───────────────────┘         └───────────────────┘
```

### Component Communication Pattern

1. **Root Controller (`App.tsx`)**:
   - Manages top-level navigation via `currentScreen` state (`language`, `auth`, `home`, `chat`, `pest`, `market`, `profile`, `connect`).
   - Authenticates access: redirects unauthenticated users to `auth` if they try accessing protected screens.
   - Houses shared sidebars (`Sidebar.tsx`) and persistent navigation tabs (`BottomNavbar.tsx`).
   - Handles top-level logout synchronization with Django backend via `${BACKEND_URL}/users/logout/`.

2. **Chat & Voice Pipeline (`ChatScreen.tsx` + `ConvoModal.tsx`)**:
   - `ChatScreen` sends user prompts to `/chatbot/chat`, renders Markdown responses, and communicates active session IDs to `Sidebar`.
   - `ConvoModal` activates interactive voice mode: records audio via `expo-audio`, uploads multipart audio via `expo-file-system/legacy` to `/convo/live-chat`, and invokes regional Indian text-to-speech through `expo-speech`.

3. **Pest & Disease Diagnosis (`PestDetectionScreen.tsx`)**:
   - Captures photos or documents using `expo-image-picker` and `expo-document-picker`.
   - Builds multipart form payloads (`FormData`) and transmits them to `/disease/pest`.
   - Renders annotated YOLO bounding box images alongside remedial advisory recommendations.

---

## 3. State Management & Data Flow

### Global Redux State (`src/store/`)
* **`store.ts`**: Configures the central Redux store.
* **`slices/weatherSlice.ts`**:
  - `fetchWeather`: Asynchronous `createAsyncThunk` that prompts for location permission (`expo-location`), fetches GPS coordinates, queries OpenWeatherMap API, and normalizes telemetry data.
  - **Cache Invalidation**: Automatically evaluates `lastFetched` timestamp and only refetches if cache is older than 15 minutes (900,000 ms).

### Localization & Multi-Language (`src/locales/`)
* Managed via `i18next` with real-time dynamic switching:
  - `en` (English)
  - `ta` (Tamil — தமிழ்)
  - `te` (Telugu — తెలుగు)
  - `hi` (Hindi — हिंदी)
* Language change events (`i18n.changeLanguage('ta')`) instantly re-render UI components without requiring application restarts.

---

## 4. Screen Catalog

1. **`LanguageSelectionScreen`**: Initial on-boarding screen allowing farmers to pick their preferred native tongue.
2. **`AuthScreen`**: Animated login and registration screen with field validation and credentials handling.
3. **`HomeScreen`**: Central dashboard showcasing real-time weather, quick-action tiles, and automated farming advisory carousel insights.
4. **`ChatScreen`**: Real-time AI advisory assistant featuring session history, Markdown-rendered advice, file attachments, and live voice activation.
5. **`PestDetectionScreen`**: AI vision analysis tool for leaf, stem, or fruit disease diagnosis with camera and gallery integration.
6. **`MarketScreen`**: Market pricing and commodity trend monitoring hub.
7. **`ProfileScreen`**: Farmer profile preferences and persistent language configuration.
8. **`ConnectScreen`**: Community and expert farmer network hub.

---

## 5. API Integration & Backend Services

Dynamic IP & host configuration is managed by [`src/config.ts`](src/config.ts), dynamically adapting between web, Expo Go, and production hosts:

| Service / Feature | Endpoint | Method | Payload / Format |
| :--- | :--- | :--- | :--- |
| **Chat Advisory** | `/chatbot/chat` | `POST` | `{ query: string, session_id: string, user_id: number }` |
| **Chat Sessions** | `/chatbot/sessions?user_id={id}` | `GET` | — |
| **Session Messages** | `/chatbot/sessions/{id}/messages?user_id={id}` | `GET` | — |
| **Delete Session** | `/chatbot/sessions/{id}/delete?user_id={id}` | `DELETE` | — |
| **Live Voice Chat** | `/convo/live-chat?lang={lang}` | `POST` | `multipart/form-data` (Audio file) |
| **Pest Detection** | `/disease/pest` | `POST` | `multipart/form-data` (Image file) |
| **User Logout** | `/users/logout/` | `POST` | JSON |

---

## 6. Directory Structure

```
frontend/
├── assets/                  # App icons, splash screens, and adaptive assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNavbar.tsx # Bottom tab bar
│   │   ├── ConvoModal.tsx   # Voice AI assistant modal
│   │   └── Sidebar.tsx      # Slide-out chat history drawer
│   ├── locales/             # i18n configuration and JSON translations
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── i18n.ts
│   │   ├── ta.json
│   │   └── te.json
│   ├── screens/             # Application screen views
│   │   ├── AuthScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── ConnectScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LanguageSelectionScreen.tsx
│   │   ├── MarketScreen.tsx
│   │   ├── PestDetectionScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── store/               # Redux store and slices
│   │   ├── slices/
│   │   │   └── weatherSlice.ts
│   │   └── store.ts
│   ├── utils/               # Formatting, markdown, and weather helpers
│   │   ├── markdown.tsx
│   │   └── weather.ts
│   └── config.ts            # Backend API and network host configuration
├── App.tsx                  # Application entry point with Providers
├── app.json                 # Expo project manifest and config plugins
├── babel.config.js          # Babel presets and NativeWind plugin
├── index.ts                 # Root component registration
├── package.json             # Project dependencies and npm scripts
├── tailwind.config.js       # TailwindCSS design token config
└── tsconfig.json            # TypeScript configuration
```

---

## 7. Setup, Environment & Scripts

### Prerequisites
* Node.js (v20+ or v22+ recommended)
* npm or yarn
* Expo Go app on iOS or Android (or physical device / emulator)

### Installation
```bash
cd frontend
npm install
```

### Environment Variables (Optional `.env`)
You can define variables prefixed with `EXPO_PUBLIC_` to configure the frontend:
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_api_key
```

### Available Scripts
```bash
# Start the Expo Metro bundler
npm run start

# Run on Android device / emulator
npm run android

# Run on iOS simulator
npm run ios

# Run on Web browser
npm run web

# Validate configuration and dependencies
npx expo-doctor

# Type check the codebase
npx tsc --noEmit
```
