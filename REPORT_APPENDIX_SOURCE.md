# Report Appendix: Source Code

This appendix contains the main human-authored source files for the Offline Telemedicine PWA project. Generated artifacts such as `build/`, `static/`, and dependencies in `node_modules/` are excluded.

---

## File: `package.json`
```json
{
  "name": "offline-telemedicine-pwa",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://harinim-h.github.io/offline-telemedicine-pwa",
  "dependencies": {
    "@supabase/supabase-js": "^2.97.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^13.5.0",
    "cra-template-pwa": "^2.0.0",
    "firebase": "^12.8.0",
    "i18next": "^25.8.3",
    "idb": "^8.0.3",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-i18next": "^16.5.4",
    "react-router-dom": "^7.13.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build",
    "test": "react-scripts test",
    "translate:locales": "node scripts/translate-locales.mjs",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "gh-pages": "^6.3.0"
  }
}
```

---

## File: `README.md`
```md
# Offline Telemedicine PWA

Offline-first multilingual telemedicine web app built with React.

## Main Features

- Patient, doctor, admin, and pharmacy flows
- Offline-capable local storage using IndexedDB
- Cloud-backed data with Supabase
- Appointment booking and consultation queue
- Text consultation and video consultation
- Pharmacy medicine availability
- Symptom checker with on-device/offline behavior
- Multilingual UI with English, Tamil, Hindi, and Malayalam

## Tech Stack

- React
- React Router
- i18next / react-i18next
- IndexedDB via `idb`
- Supabase
- Firebase

## AI Methodology

The Symptom Checker now uses a hybrid AI approach:

- `Naive Bayes` classifier for symptom-text to condition-category prediction
- `Decision Tree` model for severity/risk stratification (`low`, `medium`, `high`)
- Optional `OpenAI` enhancement when online; local models remain primary and offline-capable

Primary implementation files:

- `src/services/clinicalModels.js`
- `src/components/OfflineSymptomChecker.js`
- `src/services/aiSymptomService.js`

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` from `.env.example`

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
REACT_APP_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
LIBRETRANSLATE_URL=http://127.0.0.1:5000/translate
LIBRETRANSLATE_API_KEY=
REACT_APP_TURN_URLS=turn:your-turn-server.com:3478?transport=udp,turn:your-turn-server.com:3478?transport=tcp
REACT_APP_TURN_USERNAME=your_turn_username
REACT_APP_TURN_CREDENTIAL=your_turn_password
```

3. Start the app

```bash
npm start
```

## Useful Commands

```bash
npm start
npm test
npm run build
npm run translate:locales
```

## Multilingual Workflow

Locale files are stored in:

- `src/locales/en.json`
- `src/locales/ta.json`
- `src/locales/hi.json`
- `src/locales/ml.json`

The app uses local JSON files at runtime, so language switching stays fast and offline-friendly.

## Free Translation Workflow

This project includes a helper script:

```bash
npm run translate:locales
```

Script location:

- `scripts/translate-locales.mjs`

What it does:

- reads `src/locales/en.json`
- checks `ta.json`, `hi.json`, and `ml.json`
- fills only missing translation keys
- keeps existing translations untouched

You can also target one language:

```bash
npm run translate:locales -- ta
npm run translate:locales -- hi
npm run translate:locales -- ml
```

## LibreTranslate

Recommended free translator for this project:

- LibreTranslate

Set the endpoint in `.env`:

```env
LIBRETRANSLATE_URL=http://127.0.0.1:5000/translate
LIBRETRANSLATE_API_KEY=
```

Important:

- Use machine translation to generate draft translations
- Review medical wording manually before keeping it
- Keep the app runtime based on local JSON, not live translation requests

## Testing

Run tests:

```bash
npx react-scripts test --runInBand
```

`--runInBand` is useful in restricted environments where Jest worker processes may fail.

## Video Call Across Different Networks

For reliable video/audio across different networks, configure a TURN server in `.env`:

- `REACT_APP_TURN_URLS` (comma-separated TURN URLs)
- `REACT_APP_TURN_USERNAME`
- `REACT_APP_TURN_CREDENTIAL`

Without TURN, WebRTC may fail on strict NAT/mobile networks even if both users are online.

## Current Direction

The project is being improved around:

- full multilingual coverage
- offline-first behavior
- cleaner role-based flows
- demo and submission readiness
```

---

## File: `firestore.rules`
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Demo mode rules for this app (no Firebase Auth in app code yet).
    // Use stricter rules before production.

    match /users/{userId} {
      allow read, write: if true;
    }

    match /appointments/{appointmentId} {
      allow read, write: if true;
    }

    match /consultRooms/{roomId} {
      allow read, write: if true;

      match /doctorCandidates/{candidateId} {
        allow read, write: if true;
      }

      match /patientCandidates/{candidateId} {
        allow read, write: if true;
      }
    }

    match /appointmentChats/{appointmentId} {
      allow read, write: if true;

      match /messages/{messageId} {
        allow read, write: if true;
      }
    }
  }
}
```

---

## File: `supabase-schema.sql`
```sql
-- Run this in Supabase SQL Editor for your project.

create table if not exists public.users (
  id bigint generated by default as identity primary key,
  name text not null,
  age integer,
  mobile text not null unique,
  role text not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id bigint generated by default as identity primary key,
  name text not null,
  age text,
  condition text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id bigint generated by default as identity primary key,
  patient_name text not null,
  patient_mobile text not null,
  doctor_id text not null,
  doctor_name text not null,
  doctor_specialty text,
  date text not null,
  time text not null,
  symptoms text,
  token_no integer,
  status text not null default 'booked',
  consult_type text default '',
  consult_code text default '',
  code_shared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id bigint generated by default as identity primary key,
  appointment_id text not null,
  text text not null,
  sender_role text not null,
  sender_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pharmacies (
  id bigint generated by default as identity primary key,
  name text not null,
  area text,
  phone text,
  owner_email text not null unique,
  owner_password text not null,
  medicines jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.messages enable row level security;
alter table public.pharmacies enable row level security;

drop policy if exists "public users read/write" on public.users;
create policy "public users read/write"
on public.users
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public patients read/write" on public.patients;
create policy "public patients read/write"
on public.patients
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public appointments read/write" on public.appointments;
create policy "public appointments read/write"
on public.appointments
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public messages read/write" on public.messages;
create policy "public messages read/write"
on public.messages
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public pharmacies read/write" on public.pharmacies;
create policy "public pharmacies read/write"
on public.pharmacies
for all
to anon, authenticated
using (true)
with check (true);
```

---

## File: `scripts\translate-locales.mjs`
```mjs
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "src", "locales");
const SOURCE_LOCALE = "en";

const SOURCE_LANGUAGE_CODE = "en";
const TARGET_LANGUAGE_CODES = {
  ta: "ta",
  hi: "hi",
  ml: "ml"
};

const endpoint = String(
  process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000/translate"
).trim();
const apiKey = String(process.env.LIBRETRANSLATE_API_KEY || "").trim();

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function shouldTranslate(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getNestedValue(obj, keyPath) {
  return keyPath.reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, keyPath, value) {
  let cursor = obj;
  for (let i = 0; i < keyPath.length - 1; i += 1) {
    const key = keyPath[i];
    if (!isPlainObject(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[keyPath[keyPath.length - 1]] = value;
}

function collectStringPaths(obj, basePath = []) {
  const paths = [];
  for (const [key, value] of Object.entries(obj)) {
    const nextPath = [...basePath, key];
    if (shouldTranslate(value)) {
      paths.push(nextPath);
      continue;
    }
    if (isPlainObject(value)) {
      paths.push(...collectStringPaths(value, nextPath));
    }
  }
  return paths;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  const formatted = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, formatted, "utf8");
}

async function translateText(text, targetLanguage) {
  const payload = {
    q: text,
    source: SOURCE_LANGUAGE_CODE,
    target: targetLanguage,
    format: "text"
  };

  if (apiKey) {
    payload.api_key = apiKey;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation request failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return String(result.translatedText || "").trim();
}

async function translateLocale(targetLocale) {
  const sourcePath = path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`);
  const targetPath = path.join(LOCALES_DIR, `${targetLocale}.json`);
  const sourceJson = await readJson(sourcePath);
  const targetJson = await readJson(targetPath);
  const targetLanguage = TARGET_LANGUAGE_CODES[targetLocale];

  if (!targetLanguage) {
    throw new Error(`Unsupported target locale: ${targetLocale}`);
  }

  const sourcePaths = collectStringPaths(sourceJson);
  let translatedCount = 0;

  for (const keyPath of sourcePaths) {
    const sourceValue = getNestedValue(sourceJson, keyPath);
    const existingValue = getNestedValue(targetJson, keyPath);
    if (!shouldTranslate(sourceValue)) {
      continue;
    }
    if (shouldTranslate(existingValue)) {
      continue;
    }

    const translatedText = await translateText(sourceValue, targetLanguage);
    if (!translatedText) {
      continue;
    }
    setNestedValue(targetJson, keyPath, translatedText);
    translatedCount += 1;
    console.log(`[${targetLocale}] ${keyPath.join(".")}`);
  }

  await writeJson(targetPath, targetJson);
  console.log(`Finished ${targetLocale}: ${translatedCount} new translations.`);
}

async function main() {
  const requestedLocales = process.argv.slice(2);
  const locales =
    requestedLocales.length > 0
      ? requestedLocales
      : Object.keys(TARGET_LANGUAGE_CODES);

  console.log(`Using LibreTranslate endpoint: ${endpoint}`);
  for (const locale of locales) {
    await translateLocale(locale);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
```

---

## File: `src\index.css`
```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

---

## File: `src\i18n.js`
```js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import ml from "./locales/ml.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      ml: { translation: ml }
    },
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    },

    // ðŸ”¥ THIS IS THE MISSING PIECE
    react: {
      useSuspense: false
    }
  });

export default i18n;
```

---

## File: `src\App.js`
```js
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddPatient from "./pages/AddPatient";
import DoctorPatients from "./pages/DoctorPatients";
import PharmacyAvailability from "./pages/PharmacyAvailability";
import Consultation from "./pages/Consultation";
import Appointments from "./pages/Appointments";
import Chat from "./pages/Chat";
import Symptoms from "./pages/Symptoms";
import Profile from "./pages/Profile";
import DoctorAvailability from "./pages/DoctorAvailability";
import PatientHome from "./homepages/PatientHome";
import DoctorHome from "./homepages/DoctorHome";
import AdminHome from "./homepages/AdminHome";
import DoctorAnalytics from "./pages/DoctorAnalytics";
import AdminAnalytics from "./pages/AdminAnalytics";
import VoiceNavigator from "./components/VoiceNavigator";

function App() {
  const location = useLocation();
  const role = sessionStorage.getItem("role");

  // Hide navbar on login page
  const hideNavbar = location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />} />

        <Route path="/doctor/add-patient" element={<AddPatient />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />

        <Route path="/pharmacy" element={<PharmacyAvailability />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/doctor-availability" element={<DoctorAvailability />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/consult" element={<Consultation />} />
        <Route path="/patient-home" element={<PatientHome />} />
        <Route path="/doctor-home" element={<DoctorHome />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/doctor-analytics" element={<DoctorAnalytics />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      {!hideNavbar && role === "patient" && <VoiceNavigator />}
    </>
  );
}

export default App;
```

---

## File: `src\App.css`
```css
.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## File: `src\App.test.js`
```js
test("basic test setup works", () => {
  expect(true).toBe(true);
});
```

---

## File: `src\firebase.js`
```js
// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ðŸ”¹ Your Firebase configuration
// (Copy EXACTLY from Firebase Console â†’ Project settings)
const firebaseConfig = {
  apiKey: "AIzaSyCkF7vnpw_U7lASQ2wiC2YhlaL_LcEVkto",
  authDomain: "offline-telemedicine-pwa.firebaseapp.com",
  projectId: "offline-telemedicine-pwa",
  storageBucket: "offline-telemedicine-pwa.firebasestorage.app",
  messagingSenderId: "157619316543",
  appId: "1:157619316543:web:29da9321dbc34d8d66d58a"
};

// ðŸ”¹ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ðŸ”¹ Initialize Firestore
export const db = getFirestore(app);

```

---

## File: `public\service-worker.js`
```js
/* eslint-disable no-restricted-globals */

const CACHE_NAME = "telemed-cache-v2";
const CORE_FILES = [
  "/offline-telemedicine-pwa/",
  "/offline-telemedicine-pwa/index.html",
  "/offline-telemedicine-pwa/manifest.json",
  "/offline-telemedicine-pwa/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/offline-telemedicine-pwa/index.html", responseCopy);
          });
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          return (
            cachedResponse ||
            caches.match("/offline-telemedicine-pwa/index.html")
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) =>
          caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
        )
        .catch(() => caches.match("/offline-telemedicine-pwa/index.html"));
    })
  );
});
```

---

## File: `public\robots.txt`
```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
```

---

## File: `public\manifest.json`
```json
{
  "short_name": "TeleMed",
  "name": "Offline Telemedicine App",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff"
}
```

---

## File: `public\logo512.png`
```png
‰PNG

   
IHDR         Ã¦$È   xPLTE   aÚûaÚûaÚû^ßÿaÛûaÚû`ÛübÛÿaÚûaÛüaÛûaÛú`ÛüaÛûaÚûcÚÿaÚúaÚûaÛúaÚûaÚþaÚû_ÛÿbÛøaÛüaÚûaÛûaÚúaÚûaÛûaÛú`ÙùaÚüaÚúaÛûaÚûaÛüaÛüaÚû³9˜Æ   'tRNS öèÃ	Óª›´LŽ+Uyà
e:3î"ÛË»¢‡@o&_jDtZ”YMýu  $ÐIDATxÚìÁ    € ý©©              ˜]{]N¢ ¼!("ª€ mõ¼ÿ¶ñO;Zo	âd¿GÈž™MÎ„1ÆcŒ1Æcì2_ìû¤ŠƒÃ6ùº5½ õ±ª7^éFª Y¬ˆ]’E•JñW*ãAÓ«ð—};Ã)BÆ‘Oìœ]"qtæô2šºe"ñ/¡öœS²¾Æe²ZÒd…ù¼ÀD°#ö[\É>h‚Â¼ÁõÔël´1„Çñ¿lü¡Áæ%±£÷7K«é<ô¡ÀíDOì‡–¸ZÐdy;Õ|ø–ÜÍ«Bz®p[à~bO®ó[<DšžG‰Ém¡ÄÃTGÏÑ)<N9]
¬70¡Žh|K	#äôË-kÊ†È±# ç 8S™ÿ7ÙÑx´‚AÒÑ-ð6ƒQÍŠÆQ¶0kNNj`Z[’}Y%`Ú–t€y¢ÊÈ²Üƒ9g+¼œlêf°¢˜N¯=’µ€%õŠl	[ØR“c$ìißÈŠÁƒ=	9å6y™§%lN}(ìjvd–¿…eò‹½;ÛBÂ <a" €,Z—ªýßÿ
{zÑž.‰$¿ðBG˜$3²H€^NÛ¹ÁÑõŒÂRšÒ¾Å™¦»gï.iè–è±ˆÃm3öx‰ñ¯ûš~Ê“mÊÖ%4oƒ¡²à±÷èIÚá•Ìž
A/øÂ¢Ùæ:ãæÿþŒ_É'q¼`M…P9gKREÚ
}˜ÿû³Sì‘Ü9ƒ”cË# ƒè¥ëÁ7¼¸J|Ð_ó_zâ÷êcŠoêÜŠÞò`P–¥)!ãŽïÖGå;ÊÊ-q(;ÆïŸ‚ÜÈ	d¾‘²} e§œFŠ¨TšÈ!á“ÂivB®!ƒ¢v¯9ûc›Š†¨3H,¸ïm*9ƒ˜Séë&{ÐpM5ìKDiõvxŽ)ÊgPÃk(.¡&Œh¸
ÄØúëÝI·Â«j²bè/¤æÔÐ¹±­\‰„Æ¹PÂ¾jhWàÉÔõ0GZ¹ÄNú«t‚\ù¨hcÏ‡XDëæB,1P§ç_UƒTEù wÜì|Tz
£ó
T”ñtÝŠaDïÉ ÄiÕvºÖ¿‰;ÑÙ@ÔAA{Öõ2dë>âòUì½TdPðÅ£·EVVˆ—Áê
ü†^x2ôsš·°a|¯7õ3ôsÎ$µ19Ùekáy@ª9ñÉCôc7ó8ú¹WšJißB÷,}=6’ôÏp­i`_À TÑtêÓÈT0ÉôÔ˜ÉÝ¬K#o½m‰^nD¹—Æ›x#ëžfš£+½Ú«dƒBÎ¹ÓÄ:ˆ”´ZÝij)z•gúÍ‚zU#ßÇz;…9„rš\Ñ¢ÛÒ/¡ÎìOnk[è˜[øæzíÔ—YAD–5
GFË vL1©«]•‚"-Z»FµïÈ·õå±ùóõîii¥.*HÀÐk€{Mk*ûWOV×ZBÈ#mRôqq½EZ›¤Öz¹ÔÑü/.ñ¦À#}»–þ%0–:º‡Aä+­›cHbÎ1^y'½:›æFÖ3UA¦«½’fDN´JÉ\/¼-Ã(<'Ý66Åº’vI†BÒï‘ŒVi7ß¢7ê0ØØB„Ñ*Æ~šOYL&6U……³Ö@~ÃNAFTZçÔÐ`Þ„çu~Efx6Í‰à3}ÅŠºˆLaYØÅ¸qçž‰q.—w“[fÑÔXö]¯–ƒóoÃøµ·óG¬ü¥Ýßs´hh¬³€`¯] XÐÀ^‘­[ÂlÄçÂîm,ê
YÂ”ü3C§!“N°fZ\¾€â‡‚¡W‘Aáüy¨)õüÐ8Pà×dÎÆž È!t&cªlywù~±> ö¤Ÿü®âÙ5>@†xîosþ<ÎdÇ ßHæ ÿi ,ù€¹ ñ—…ì~àN&|Á`7’û,ÿ³ ¸,öN‹à;{w¶äª
„¸%vÌ¾ccŒ×~ÿ7L&ëIeBH›ù®RIU’cÔRÿ’Ìõ>æp»×9;ûY
ÖE!Êå…Ð”ëvÔ*Vj—Y	¨fï¨¯Sm'þÏv–½õS2ÚXëˆsÂ¤·×Ýdìh{°±JË™¨ôÍÓªËÇ-¤d49­±èá˜pºGàƒRíR2ºØ+ô]BŽsâ’#Ž ¨Tìh_@§ÿž´œðœþáZëeÄpG;ƒ^ø#¨ÓP¾üw¯•r÷´7°Ò½¾¶xüâˆ(3°ÎÏÿD7Ý{á
þÌGP¬3Ìð[ð‘BÍÇ¾æäþz²ÊdÐÇïPøH™Þ×]:o\qLj¤{º7ªÑZñfdf›ç†#Š”¨ötƒ´©skÏnôp„eÂ¯~ö…ˆ ²°×Y:ýAaoGÝ`€VßŸÖ
{pÄ°vÔ0´=ZW±ãKwW€î¨¤ñ”¨ŒNêÝXo!hâŽZ /MK.E6c¢y 5 4ìi%à¡i%ÈX°ùÛ×bÿ×jøL¡žß»³(éûÐy{ÀeOºŽ¿qM Ù^Á£Aú¡æüJWx[",øËGœ©U
«cd;ÄˆY+‚rt¢^†ú•oOB
×P]­a²“ótê”ÏRfq=Žx‚4åê§æhV©¾2"'r¶úÝôlô÷”Y¡Íµ !Ìàh).{Ê}ÉïÄ·åùaèh:ûº:˜™=h8À“¹œ|UZ{ð¹
üŽ§¾ ˆ]uå„8º«4ÀCá4 i‘‰är[Êm"ç…¸³Y ³¶JT OÙ©â$¸ïi[Ðèô*SÜ°›<»ûaz‹ªóË±¿x§/ÆñwÆ×_}ý½Îqœs]Ògxïó`°-U·h‘Àçê•Åî‚Z‘üÖÅ6§Vµ¼šX¨Y›¼åuúk£²7B˜Ã=­:ƒ¢vÔèªô>˜ ÊÜÂEºd…‚Ìæžž»S‹«+Žö!
óDÖµ±Oød‡Å‹ÁfFÝ±ÀÍ¡Ç.
à—î+ø§ë‚šÚÍÒƒ·G~\ëÒÌ]0Í4á“åBU`é?cƒ=5œ‡_Â(cOC'
X†ð|¢ø¦èéü€…ì,ö'‹ñ#¸‚oXÝ%3¿{îj[ØßžŒ™]:?Še?z~uÛßBð—t*pŸÜ«Ó<÷ß²œk söXcíúæê|ØƒÿÔ‹þ¬=Ö€ÌÒ‡š}ä½m±71Î~ƒ;º)àWþøÓŽŽ‰þÕŒÈáÓ…øƒÀÇ+ñ›Ÿo7¥Þ„ÝBÿæá/»:è_wç­š:ºQÇ‡–~Þÿ“
ûú‘±PÓïÖöI·Öñ+üç/öN§ÓñØ¶Åþ7íðÃ~fhÔŽZ†×9çèvõû¼qkàV×Mùaú¨Žíãu#Þ½z‡ Fñáqõ³Á™Ü ó¯5"ÝGÔCÕ¢^=(Ó£^ÔyóîpÈå]¦ÒÔÍªxW¾GP	BÕßÀf¶ÈDQ‘ÓõCn£|ÅÑ®Â ¼Õº)29ÐÜ/Ž’[á¼[XÜ÷P²Âx¥½;ÙPª@±ódñQÞo
~§7ºM´¾´(õ¾žú%Y,PÎB–Ö„¹~$9×HÏïQ
d2§üG'ÍMþû$ åÂÿú1³›Ô›·ý‰¡DIijFžZc¦:šûû®‡#JÒ^¶\&—eˆí¯ïžÅZ»›~øHú‡¤Ì#¶zš¼[Q9ÑéFð0P€Œô¹¡”WéØžAÂz¯e&Lh²D I…,…jÿLp1{kÙÁÜÖˆòÅm¬%‡Hº(ƒ±¥…å(ù2¥«oª
–\)‘"~ÖO qP–&$tqº3²ÐD_&î´… éPOüì¾ÖÌVø‡h”Ç`]å DÄä8_bwíeÈÀ(¥òrXO"üõ[b#¨ˆÙS÷BChƒ|l¡ Ç…•¤T´Å€%ò=>‘…Ö Yf»)k;DGB&¬ ·PD[#Si*X† /VæcGy1PD‚ne'×Ë&>‡L(Žs‚ØBu`…ì["üŒ t2+"òíçð¯¿uY%
¬À%"u 5ý›*kã¥€ã\ôq=Î­Èü¹‚UÜêÀ†/Éšl¡¡OÐ£vdÄYú¹‘.#K \“’çÌ^rÿsŸŸ«ðJÐÀ§³[<.|ƒÎÌx+K <+Â4™×JîädªIª¹ÎBœ|ÖiùØÎîÀu°šÃÜ:°™9‹ÉçöX”JœÃºÔÀÎJ"ÐeÐ²Ì	3X’›µ—ÀÌÇßîaDBæŒö6UògÎL
‘HÖœÁh@‘ž"¿â\ŠuÅZæÒû/Û÷fõ…KÖXjØªA‰ùµQSÒc€±ÕcµØCS;#ÎVÂ¤«…ü:¤s
äføÀÁEî1à¹&qzáþÇý„Ü¬ 4Lþ¼ø¼Žo±œJ5ïŸÜC^$©*qÅo?à1ö”‰+‡üîû}>”jêÀï „ï´¦œº@Â‘/ø/·uÃ³mü±ìÊ¯¥×_Àš—¾FN†’¸GäcR–R)wö¢:¬èe1†âƒÂ™päÄÙùÐ¤bUÅ×jX|‘?—¥p2™ãã+IÚ¨Ja“$ð	ò02i×g£Í÷Š%%Ìcòl[¶®0“ó
Q±¼
m™\.°ØyÄ!ˆð8VF{Y;’E.ñÜ
˜!WÎ½—ú%…1ò8h)ÿId‚+Ççf!ClÂ·B]kýÄÓdUo.1#‚Xä 6‹’É·âUN07TF¬ž¬J!{K³ë ppš•)ÈÕ•ŒSðƒ3_8©¤|PÄZ/HA\~Äiž„ì;¹(é¦EÓ±«¸

862ò‡‰ß:©a‰Qø8k!ãËÁ&•ð§ºB}àMVkÂz>—q;œd«ªÿh¨ê"Iì§>×RÇáŽ	SAg|6õÔÑ¦q@@ŠS<»æ¼êÎÀËÑsìh8‘
²˜3ÞÅê§TÂ£3[ñèØsæ]²™.Ò/côœ3ÿ¡!Å	©àahl'Wm®ò6ZZÝ€iàB6pÊ‘%ùcú …{’|„¶¼S„ä#Q¯×â. ‹9À©C†»˜-L]y-ÚÈ¼ß“ö Å:‚Ÿ%¨§Ãz™oi²NÑ>kyý—Ç/è–®E(ÅuétÃ OC¢±ö¤Mz“ ö¹%Ó{½	€{Î’²žJ­¹­'pr©Æ´{œ^ºäR"þöŒÖ¾*úIpidTN´Éî8S ÐkÖRšg!5H–SaHXˆ.Vòm\Q"¸¤SL¹Êvñ'¡Èf• _…Lâ‹À5E‰ZS|J£÷d3÷¸ô³; ÛÑJ«³J)¸?’Ó²…Í “a‚ò+jà‘£˜¥Í§#ò«@	ó„lÙ’/ã˜€¡üGÑCÉ^ò§ž%ˆ_ÿ6<9V
ªPäEMÎŒ–lÄê?Ú,1É~rb”9 ¯‹ž€xí‘!¯”©-ÑíôÁ:×q’_ 
ÊGj¹ƒ5Aæ7öîkÉu (Hõj5«Zî^üÿ&™d&“di‘HÉ{sžovËb@‚kÔGÏ¡ Z4 )õZÜBÅ´jD;¶Q;–ôŽh€C»§IÁ¨Ez†L˜U4”±ó3q¥œÏ0ÌGYcÛÁ°„r Ðˆ–²
%Ãºƒzü©'Më	gaàh„C¸¤å`ÜC=”oxwD:½¢!ÝÐ‚y¾òòÓÙð&®˜n ¸£!1Ý/0š5jžj;£ lðpÁ øË§—}l˜cÐá¿·áNVÚ~@C²ÀV6tLmI—‹"V
QäÌESÅéwó&§ÚHæ‹f>;¢sz5}†ØQ«dž¡
ÉÒ‰ÊÉezÈŠ,§H)¬Wl‰höM9Sª5–Ô<Ùj~T-à;èÚ–˜¦€6Acž4é­lÉTò©è[3äÎ4¦%)vÀšPå¤h-ZøXsy[³y 1!ÉpŸÁüV¬’C{
†‡(#4& ˜Ð<°ˆãw2…A‹E>Eò|BcN /ÜÁ šUo*W¬q9
<?oHPä
ö4
#@M¦¯báî§­:¦þWè¹*k€ž.lMŸºÚ. E¡¦ [R•gêš¯Ô¯ä:Àâ ¥ÌÆ:ÝÝ•Fu¾qkvŸ&|þDc2•ï!$üJ•v®¬ ;Ž4Õ £1©ÚrvónÇn£4œÛX-ÑÛwEc
¥Öö±À›Z9Ê}Û‹SåÐrP ¶ÏŒjËºzÓÐå‹ª"<4d";ç’€
•ê7É·lÏëà‚$}¡!9YQZã‚€…¯”¹ªËð˜WÓåfhHEwÐ­óbåÒÆ›øDŽq'Dª! C3˜Ò °}Uà <uL˜Œ3-d¸,ÞvQžK8ƒi³Æ
4Òûêmõ¦÷T6”ôJ•`ó“
8:³'ïÀ¬e$®GX§? ØO²­@4ß(t#Rà«Ä 6?!êô(É7Ú¹F´Áø
ˆu‚€b0iÖ|!Ûdã¢$O:GnÐ ì¯«^Ú×\$›|àeÝ6[–Ú€ýeà™¡ÈI;ÆÎ`ŠGýv‰\êÃY†T…®+š…°
Ì¨è_Ä‰]è%]ÀŒºA¡`ÕeáMFˆÔW…†
’\Í¦!ö£)_7êÜPŒÅ`@ÁddîH*61ðT`@Õ Øsí&še@¯DM·A,À_Ù8ÌÞÕ+1[ÝûæÊ(ÛÜÐ?ªÄþ5ìH0—Y©¶»Q9O»?Û«¡§ÑZß^Iÿ.ý~:¡y%§H%ª]ÃÛgÄüµeÍ¾ëB‹ˆ¨uä‘ã;C
”D]UkIíöŠ•“w=÷ÞBûC²ÜL“Xøžk3Sg†štíˆs‡»…KÜÎ73¾¸@EÜUµg(PY<"Àk¯„8ˆ#“œz&hÓsÞÕpÈ€du}èÝâi ï]þâd8ÁÒ( Ùð«ðð=Vš½òù61ñI­µ{¡Ê·¿³ÙŒÐ«Á÷¡nÓ±èh2
Ÿêqñ®Á^ ©àï‡Á`( ôõû_‹¥
.hJs£…o5§;pBún¦«Ü\É}ÌÍô(}0\…°Rþ~n|äR
jâ5AUócé—¾RçëN3\Ò\`ïýêØ=,jj™B‚„¦³´¬a•7pÌpÙX›è—,/ãkýƒÇôU›érø=3‘\I³ç%$hkŸî@Òu)P‘W‚i9få6äá`wf¸ìN”\ã%õé%Of
ƒŠœ¡–Uµ§Ë³Ä4½U”4ÑTïL{"4—ÉL
.¨è}”„D5ÄHOÐR9vÔÖeD=eø²—*ÌAM vêA–Ò^å@XvôQFó È1Ñ¾5_‰#—de=(êŽmŠÂFn9“¥»™¡ŒC
:¥°¤5•Ô²¥g”•õ{÷òÇ î$Ùä"%:$Öµ¥8¡åª]6$7”MMÆ Á­ò‰áóÃ¥-j/å®ì@…{á(ÇwÊ%ñ¼[_
I‡Ù=ÐTÔ·ÙÎ>8~ûª]Ð4JºËúF‘sù8¡3GIl×öTxÉ—
?as¥üø®-éÚL×o‡ÊbIR¾¤ï0òdSöu\áN±iÕ&eyW –£4¤+ö ¾Jÿ6ö¥R¹X®Ø¤Ci_.Ð«”çÄ°¤V]D»è¿òT©+ÔŽhTÊcÑE¨À+]x«U¸Åîºƒ‹—¿å¨^˜´JÜÜÒCÎL¹3TÐ$Wø©¯Xò˜Ã†JÅ5x©‘¸&
ª˜Á ~B%ãM¹(S¬¸b=l¦ãŠ×	„Ê»GDÅ¤T2TÂÛ^0š¨ÉÝ6¿zûrfRº…¸o9*a-ú¨h,ù¯ÂW?¯–ÁF*™TçŒþÃÍ&TäÕ`CÆQó²—¼Ô×Û¼+ÂWeƒ_uÀPËÁ’ð„Ê†ö*SlÄ
£/_`”þzº_Ú¨ÌéÁžjDuãó¸˜ä*ï7ïl&“¥äÝ7¿}î¡ºCvÝ8jpÊþÔ¨0ÞöˆPçÜÒñ}âàxqPË]°­˜ê˜î! <tŠ¤=%…2qt’‡àéK9…°…ÞG=Îåø¥Kq?Á€7Rª åýÓA=N[9¨‰iå°™À²@wIZ#­Ã¶ô‘R­ýÚ•`ÕEšp1	Jˆç.l,óÌAÿ¤gs‹ÜEJ‹=­øeóÇÿ‡l@"_°$ÚGDxFýK$Ò´ìÕO ^sã¬IWÄo›;Ø‘rÀõ˜»æC‚-ÞªJL×ãí®ÿâ	WNe
¼íËÃrý;¥û[àáj‡}ÌýÿVŸ Ú‡«·ÊÀŠ+Ó»‰£¾ø	x7Ø«kÀs’¬dë´ £ÞŽ#½}9H#:Ãž…-G"Í4gGAC´-'§Z Ï‡!¤°wîËA:<š³þ)ÞtHåûj¥Ùq¤3<7?!ç:7HÊ;åq(XFÛÞ	Œ2!€¢*‡!©)ƒÏá–#RãSr?‡Á€ËB aU&Ñ©ñö¦Ð8Á3NnD!Ÿ Nñ3p8þå×}ùÿVÜ&4Ë~N`DësëxñÐ²	šÑ²æô€—Î­ºƒ15Ú5ÝvñSûíaI~Ïu_ ™0=gežœhÑxùMŸŒâå3´Ž{ÎäIû,_ñ¹¾öaËÜ.ìÓú¿îùüuŠ¦q`hŸóüà‰ÿ{næ3Ükøà¿s¦?Dþôgü7š=|Dt.·ç“ã>ŽÿûEŸþ_bÿ'ÄÊ4ïdø?±Ý•yÐKðb¿ë_æàÿpŸ÷Ø±‹uönEðÓ¥ø¿78üt7ü–÷‹
ƒèÎêŸ½Ÿ©ë -Oü%ŒÉííì¾[Æw—¥†ñìüè¡€MíÃ}{Jx†ŸÍeKÕœî9~d¼ÐnWø[¼“cÎ–Uø­ËJiÛŸô+ð‚Ë¹€êð[~¶‹Â%?]u9yøÙØxºT®JÇ´ý×}¯rÂo¹ âV÷`üÈuŸæìªþUì÷Ø	Oï’§>~ÎÇÌ	C4—U§Ù8?­iÜUåíyRhœ ÏRSýŠ±À+Eß5ÎƒiØÕ´À.Ï!¨pÅX`FxÑcWg—Ùßv}ÐŒþ\Æu:¼_0#Üâ·
X!¬³g€Ö·s«œvÙÅ,_·iÕÍK{JÛ]Dóáæ™:ÕíŽ(Æ½7ªµ£‡a@±C«wuõõoìÝéºÚ àì›ÑDcâq·ö»ÿ;lûto³@Å÷wOÏñ‘†-\uYõø†¾ùžï}‹³¯V_?VßÜ³,»å¹Þ.SW
zÜ­z])ZÅªs
—äÊw´YÓëº£U­<ÙpOÒ.êóv"ëRhÃ4ÜÜ=‘¤’AyŠC×„ø²|´ÙÑ46ÝŽ$%ÌÑí¨6;êD/Ë“™ŸåÅèÆk’áèÈÜ-­;
`ŠS¡tóÜ‰þ#‡¦âÚv*OƒsÐÍ—Z¬j©CÕ˜Ó G‹­ÎD¤c°\ ªÔF–%ÝÑŠ&£G6ÁpAJ,Û.zºDè¨âÃJà:èæÐ”NuÁÓ!Ðúü@7¾y°š{Ò”bË²Â´	hRÛÝ¼%
©†¦õù1½¨\Ë…Ø”=ÄÍÐcEÓr»ö+/JS«—=êU°ÞŸZnÕy`­kÉs@Õèm¤C“s:–Å¯©@«&,Â±ô”, »í­
ÄhEÓÛ6ãVr‘Èi˜«^´RÔUß|wfcÎ…@sò«U×Ã*+ž=šP~é
™U¥¢>ëÜóTè±sé«j—VE‚|­§ß¾dRw™ ÚóÑOô’­vé¡G  `%)bUJH£wº;¯%
ò9zÜInS(iNŒ!
ô¨HÏ¢:1®ö³Ï³¶zø¤ŽcQNP(s)@G‹ŸX( ŽKêDÅ‚Ï3Ü†öÑƒE"ÇMH
]*ÑŠT{¶Y9<JÖgjõWeÌrÔUC|uÇÓ¡ 0+H©Z½F³0¡EyC´lù™ô¹ZW‹ª„dó,x=òdÞòý´z¹–aÝ›²u›½GOªežæJª0’ã’j±E‰á‹Ù.Âí1Š·%åŽæ{;×¤^iQ×€mö¤ÁÖƒ4V’©õ  Â’XL­Þà) Õr2êð O9 (]CÆŠ:¼À“ *˜‰ýÏï@ºÜD}¦nïð¬€î´§ïð´€®æµo}¯|Ò¨2$ üÍU-1# ü[aÑ ¨ `@’N7‹ªÅžŒ(†ã'#ê´Út¨8@>KÔ„†6ådó§À»þd@ûæ•E•ãÙ»¤mÓÂ ´°('°@+Ò¦n &rI—­è¥3ö”C”³%M‹îlæM€Ä55éÍþ^Ôg;ëŽg)¼ -´iè%±ƒ^$±
yWŠ”ÔÌyq}üÃ”íàüûœ¹Ê¡lŒá»¤ÚÆ€P„>û™ŽÓã8!)V˜Ô¦š'œ1üfØRðnÑYÑJ¦ÂüÃt,+´*é%Å3Ä½—>J¾Uµ‚Sýó]íáQ!©ãY$Zj/‹sð†ÿI^2Ì¦8×<ÉV²iãa ;‘"éüY©Z}hÝ„†DK±(¿$%.V…ºÊ…cI*”9†øÂi"MJ*hu§uE«#)pe’ÐOû™öƒžU»@¢bè"žÖÝ_%,ð·4µ%¬Úhl—~Ìeé 7pƒ	y²"žlÛ[aÐú8"_¤¢i%˜ý¶œfŽE@í`PžŽ:2rj
ÏVô²Vd\ØÈc¾p‡AlAÓ©ÑîL/ëÕwÂHê _þÖ€sžpSdQBà\ñ˜¿¬1,¡.	†±+MÄ±¬utÏéW¥ññg+ê¶böQÓ6fÜNÔk…2.Ãø‘úÃXåÒãö-ºGý–:°ÛP¿Í¼‚ÖÀ¢v1¿xŠÞ{nÅ `ïÒwÁ–Ãº(À7(¹7ñ‰Dœ b}¥‡8°*ð§RÅ¸?GÁo$æÈ!Â»=v.bQ¿¨á
lCc-Ù‰ÿŠ!Ñ™ÆŠ¸›>‹dê)àÊ!ä³+÷gŠ	64Ê
v¾ˆRt(hŒ¬v'9ñBXÒ,~·ÃtñàØƒ/%YõbXµ°ªoøŸ®“hŽwè0INŸû‚Ø!”_ZTêo[†I¢AOùõž˜CjÙö6ÝJ
ø†D-¯9Díê	ºù7ä~ÀÚ%à7gtÉkr>¬!,¡G¬„5‹­ð÷oeø§è¡àÞˆËô˜Ôƒ8¶Š˜R¤r6%:ñŒúÝö¥òº	dðÏÅè|Õü%{F·ˆÆ²¸ñg<£)¤ðý½ëCl>›S¥vF%z°dC-ÒkÄ ÇinYN’Õô¯[À€÷0|g·(–ô‹›f‡Y<£éäñ`‘i½ÝnÎÅý13:Õ™ d’;~~äpŒâ‡4%÷€©Xøiµò˜¦–:PŠYüÃ*%KRàÂ!ËÄV…fH”qRRc›`
ó÷M0ÁŠðu˜v1ø~<èJ!)•åPáBÖ	9dL–£¥&ÿØèbt†*&æÅ¤C@‚q½*Íx–—ÿßÊâLëUi+¦ÃO.õ1x4/Ù#LÈ
á—4+"L#¯É^×‰¾þ%‰0rxö>ÿ¥ydå'—frNô±$»•Ùe4§P0;Íâ4p‰ÄKyÑ‘æ¶¼z‹[‘:èÄ0J¾0äõYÌ„#ëçµ‰ Ï7ééqWd5&}€¹Å¤8WãžÍÉnM  l÷ÌßþwáI4uÍ»ØüíuôåÁÝÐoÿ;7N<‘Ìñ·6Ë‹¿F·Ü?=Å©yWGï0ÿÆÅhÅ'¿Á¿˜ç/nÏub²‰OIä­ñw‚OGÛÃ>bÜ4^-A°’jqÍÊçúêÿânësY”eýÄŸáííííK{pH     èÿk_˜                  n]Çíâ–îÜ    IEND®B`‚
```

---

## File: `public\logo192.png`
```png
‰PNG

   
IHDR   À   À   eœ5   ‡PLTE   dÚûaÚüaÛüaÚüaÛüaÚûaÛüaÚûaÚüaÛüaÚüaÚüaÛüaÚüaÚüaÚûaÚûaÚûaÚü`ÚûaÚûaÛûaÚüaÚüaÚüaÚüaÚû`ÚûaÚûaÛüaÚüaÛüaÚûaÛüaÚûaÚûaÛûaÚûaÚûfèÿaÜþcßÿeãÿhëÿHÕÆ”   'tRNS û#ö,àØë_“€¬ñœEÀÐLn?Xå³4Qg¹ytÊ:¤Å‡ŒŒ!Í  äIDATxÚì[ér›0.l.;>ðÇiÐÁû?_-,ñ)•±È·ý‘ÍL'¤ÕÞ«Ýíoø†oø†oø†oø†oø*x-üéF?ä·Ÿ¿&®?BíY>€ÅÛMOqœ¾çÀì8ür¶ŠÓã1ÍO‹—'“ ¼ë<¬è
xå›å—hÀ>Þ[òžqª@LÒÅ) ÚÝ‘×¼"7¨˜¨é$ÝŒ€º/÷ÇIÄkÊ*¢·âTÌwÏ¢ ˆOŒV¤B8¥áO_¾îüYI¨¸.® e¯Ï0ç5SH
÷‚|Ü®ã/Þe8=vbuü\5ºÔ«ºÊ}7rùÁl.hÕµOO p'8?ià3	ÁO‡-È—ã”›Ç×6 
CS ä3uÒqHc6I Û)(¸¶¢Žík ÕLV¦ È#¡±Ô,<ÏçÑ„×Ÿt™pz„ÝÓž¨±!°¡YQæyZÊÔC:Ç’a	x¥D“Å»‘|´\¿éMÀQ¬46b.ŒO9åQ¼XÞÞúŒ«wt3¤€~Þ0žÍŒþêÌ¥@ŽKÀdÿ[T¤ršåkÏÊ³@íOÏX6$J”’®›‰Ð,5ƒ¡ÙF¾±#ˆ0Ž_o“¥™Iy†‰‰ÙS¬à*>mß²K9%Ìm½9äWÖŒ°VJ“¤uXøæCc¸àÕp+ä"òîÅ¦õœò–‚ª>ûò)>x©!"#s3‰ÜÞdÀ'òõÐœ4{”Ÿ¶H˜n¡â„fPïúŽ	#™ïäÃî8CžbÆó† "¹ãÝ÷‘£\@œË´F½ù PŸÆMulávû&Š ìý2á·½Ón~ÖP#šËgÒLËš°¢“K¢À7C°æÊIOÍ­--¾À£’úèI)@•`'ù™KOY Ø‰2r?ÐCÛ
C(®Æ8ÞÂ7ù‘›M|68ñÒy½Ð­¿ËDÐ*U:R‹ŠºÜŠ7í¤GÇÎWú.mT#t’	ý;‰[³Ï‚<)©Ž®åëWÎÛS3ý›ö?ÜkS…&ìàˆ1Ä)[x£ uûPG–Œ`<d:ñþ!Æk-ç?¿ôZ¸R~4„©
•H°/¸å;uéõ[7Uár;˜€Î]…$oççqßÿBÜLg²˜€µ¨z­ØÀÖXå¼µÉ°1ÅÆýTÌ@ÐWpk¦ðŒÿ
°™€›×}1é¹îí¿ àê´&¦mÜÊU©ÿˆ$ÀíƒBJ AÍ:Á¯£BÃ1’‰3
ôõV´yÑ\¾êiÄ<ó‡v£L±æ­ÇÆ©Ž¤N.ø=ÿŠ}:2g:€3Ç2t4N°v€@6|*›ƒ>ÿEê“¬fà2ôoR	$s¸Òwkq{û=Þ–Fº¢ÇØ›ku‚dnPPuQ¨Aç	–Nô}Lr±y$ˆ/Žå¹" ÄÃAËZ¨t; }ØPQÉÂíãõ¥fXHûÜÈ¼¶B8îÕ·ð~ýÜÈ>% ®…àNÜ]Àn€ïõw°MQwù9wbº£¨ ÏùŠÏP¸c»øÚ[/'`Ï¿›‚ÀâG®8Ö­mÀÅwâá»4¸’‰®@à);éð‚^Ô‡Ú^/9UZÜòzÛz^Ãc ŸŒ½¥?–°ÛÉýåÒ[ê¥¦<<»ú¤K‹ÃÃY à¯iP±h¯0lM&Y@ˆT¹Š È&“(k_W{ 6Šì"¸ÐÖ
ï­Q6=ÅeW0.8çÀ¯ ðšUaqÌ“ézù£Ð.hñqy¥Qý%¶ŠWÎÒ[ËÕ ÕøÅßê(”kXãÕÌ÷t«gW±gõŒè¢iíí“4Ê­©PóÕW@-aÍY”&û†Š
*ÈÃ°Ìw>üC^¢aºûànB¤8jD—•Ÿ+)‡Ïèñy…Pì©¨f{£Ïr¹­tƒ¦¾AsL{Äw°Ÿ:*núu°á-8ˆå´àwYÈ*Û:‚+ÆCn	Àþ>õê˜¿<”åÆÝ´·x//ñÏÓaºÙ/f³Ùz}ýg±ßL¯Iœ§ósˆmX§		š•‡åR€æãþ’ašÄ ytNëš£…TzÎÂCI†xMù]2£4K7#'
næ†‚òßPh«$<æ‡CÀ*4¨oÙ[HæPÒœp%€`:ÍaãÏ@…9"¶ñØA‚k®p_VT˜hæÓÓ~,7Ïiß1T·GFÃÅ)-2Ñ{’­:n<ÐðUÝ9ªcÀ•ïÉÂ÷t¢MÕSd0®6’&¸½ôø‹¤ÜÞÃTQ­0Vñ¥ãŸBúû€¢ž–©š™¿ îÛ3GñD§UË-'ÈC€TÐm‚ÑŠÞÇ
?k>‘v¥•×7æm>´F êÓ_‰ÔÕ·iˆ¿iÿD5fXÃäÔO
hW‡”ÿ~z’^çjycÅEU ' ö€›—~øSß:ã4 z’
ãEÁ=[üN15GP2_ù?F™ê” nÝ»Î0bQ}*ºšÄô¨çbárÏ3E³sñy)/N¾|¥OË²¥½ÌqSûjnŽÄóHuÞ<ñ_Ï¼Q%Ø‚È_\$È×û°®Œe¼Îòµ6ÙÕo3CÊ‚»Ë-ê¡¥Pëx¨B¢÷ÞëUë|Rƒ„ªžlœs©^l(¿Ôð¤†ÓU:¬ªjmo†_º
0¤þ©Þžæ‘4ÆåkDÅ§AÁ›uMj`êŠPZL= ss\êîwB€–Ðh¤NcAk—g€;·bÚ´”àHu´{T[Ô$·Ø ¹=w†SŽÖpû‡ü=ÜnÃ÷|ÚX0á×ÊÎûl
S)De
ãÛçÆd[8µÐB‡æhÛànî5+ƒ&{nòë „±ª|-)(ìŠ¦ñÂ6!`„ÑÎ™©„VÆd[r7™··V¸sX0=Ê$¤FE	ÁŽ53š(]´s²ªA*ú¡fB{JL¶Y|S^óÇLTÕ}±Ú	o`%=ÚaÊï¨ëÜªE‚_*=BíÚvÍÆè-Ù!H3]KÃžÖþ0S@0åçýxLDaLŒŽ:“ƒB@Ð¹;Ú€ÁÂY Ý­?)1@rS«"€‘ÖcZYH½˜Q‚(ÖAÁr^W (p–m½FKziÚ j-«-ößí
xÐ›ó\8‡ý<C²•#§~Å8G	·y«×dùýS?Ó{èüºðç˜Œ¡þ}·5J8{0Ù¶ÐÎB¬ë €ÁZtŠ°ƒ¹ò‡åÁŠ]z1?µ÷Tæh˜F$µs}èàc…×Þ«›…V‚èq)yW:duíÒt%‚“§«"	ôý‘kEò©s¨êœMVdËtÃÈúçH Ç\£* zèLÕÚgÛ1)	ZÙ½¼¶F[	­í°%Ñ§,»®6€¹‹€òÞÿy€]öh±xWRWØÎè s–“íà°D mt ’(Øæ â~“y˜ÂEC-À<¥íˆ…Ý`N´€m”î±*f ÂéxJ[°ïþÃ±/};Èè@ò §Ö¯¯„l—O¯ï(íjà7LÒÜ*ÔÑ ¿‚-tgÅ¯öÎt;mˆÂE˜ÅìKØ’°Æ’ì÷¾ÖXð„‘iD—s˜m°-YšÑèÎÑÎq­¥©šm×má©ö ”çÉL^ãÞH£¯<2H¶²v™Ñaa‚)§/ƒf&U|:ˆ­géÀÕst€=/ƒ·Q—„‡)+i‡ a
¯ÌZeŠÅvø ÖV÷øãÍYsH8MY…x†½‰MÁv]~£5ìèH(ÜxËú	
IÛ…î3î–Y/xPÀ}îôËâtV—©›Z	îáRákÓ®ÈÑ°1»ÅíoÈs£‹e„É,º©ÂÚn-ËLÙýLC³¥D£n¥æÄÂ¶¹(Ÿ¡ßJ¦i,4¯íõ¢«ðÖ˜n™f¬5 Ç
àœä(^°	k_`rE¾´HZô—“àzû!f÷'À*…íßÇZÜ€¶ œGr]P¥µSÁ¤êë›šÚ.¹ºÉ°b¯F3j¡ØªïHL^¯}ããôâ„Œ>+tÁÂõ
¾²Ü0’Ñd }îxnúd«Z$;PHÁPò*Î‡>‡M.ñdV³æ¤6hëÀ	³
8'JA+	CìwÌF •¥M›LOw	óçí>U-ø¿HÁõ#eA
 (¢è#ð:Þêy5“˜–‘Tg÷ ö<™j/+v2l@Ôò‘æy¿ÙSq¬zÍ-õ‡‘$Py3ÀQmƒu!Ÿ½ˆE¾ÚK¿n>ÀÀÜ°öãÄ‡ªo³ÙU¬.T\à|øí¢ŽR;* ™ÞD>MŒîŠî,ý€õŽ´hæ1è„ããGÛ!¡†üþtÑãÍVä›Y!²Âú'tAßSÓÆg±CùØ!îYÕ°C‹´5ÔRå¯˜ å­8ýE)ý«&ë®ð…~Dr º°ªÉ¦½ÈÈ&Ìè†£Š5€‚³+³X}=U<fP~aÃQ.Ï€äªËî"É‘’::{b_)]«ºÕ¦»é\(|";D¬ï®ÊõtºŽ’øüù2îâ”éÂæõÔø*yË]±èKîµ½¿RÜÜ^Ÿ¸*4èdzØ‹ßÇAƒ|pÔjôø®rÃ¼c¤²ÙÈ“°#;kò—…­Hà‹ *xí^Non•”%¬°AƒÍ/ƒÏnOñ>Q¯ƒ»Ys¬"!´$Máºÿ¾™Tx¡%ÁAâ‰Bf8ÔdöÞ_‡é¼á	•zý7šÿ[Ä¿B¡¸õÁÃQ½Q·3¯.#Å†
¾¥½$dŸÐßeuÞÙ®{ê¢^L=Zý>ý•Õð«§¾åUÞy"¥Z
ÔÇ%$ª¨`¡¤LàÀŸ·>]~˜;ß¬Î9Þ†±ÔTo¥qÈ~gÚÞêÕI­V9I­6©Ö7ƒekÕé|[«:¸’¦åwÛÏ0Ô–ý…*¢ÏGˆ!x‹ ×Fó—üú/ìõ¡LÚ_.¢ï«°Û2`üu0ûþ®U†·n8ìJºê¸€ËGëmŽU¶þh¸Î>DÁÅ>ŽNÜLÕÝ·šju›â<#¾ÛÚžÄÁh;ßÙHÕæÐ$éŽ¢Þúúhz‘)¢ø–ú¾”¢ñº?d;<ïYLxÀàË•ú²Ó…¦î¥Šîé„Ê4:ánÛ×+§rÊá}¦³EÃjoËUÿcÔtLûŽ‹œçªÄ*hŒ^ÛÓq½† Üá9@ø’g©Uß:šå@IKñ¿¸S¯Ö®Þ¦kE¬}	‘©-ºh@?9%ƒŽ7iÞLë}úKÞß[­åx6ËP$nÁ…ÖF˜·Âå´{¶C/óÒÎ‡6-3I°‹=«OÁíÇ@\÷3KÉ¡Éœî<aÅEF’-ÿ•þÈèvêh6Ì‹maœýD£âÙiGz”2“ Éê..ÿ²p«U
 m3Å=T¾Z‚¡àµp0ïÖ}g°»|A¡
i‚²;ŽÊMïV´[*YÜä4SPû
Œ]šáU†”*t¢O8x7ýÀØAÈ³FÊS­E'³ü‘PhêƒDnJ8™ðZXóP†Eœjdf¾H:(ë2nU_h^¦$R2ë]¢Õ·U(éµb*eƒ 3Ý¦È¸¥:*Áb°SD–þKT±p7îŸ:¿7åP/E¤Éwð²ÜŽGFÒF”^–ºðåŸè@FÒ>ö Rö?ÑAin¤ŠÃð?u íA~‰sù·t`RÒ
aKç¢Iœú;V¨<9–¤ºøl
uKõ ú¾<j%^•#hï¥º [ÖJRÓý¯ÄBI"w{BÙærœTÊuþaw…9Ñ_AŸƒ¸G ËéN{/²Eõ«u‰yžÚ¯tDpMg©:R~;°rÕC}•†ûõ¹9+ïÄ«Ö±€CìQÐ.µq[ìŸ‚³BÅÓ‹òýM¯(@µÿ™Xan˜!Îš¡¹:š§š—ü
çu¼&È¨žš¹Åsë¬™@†›+GXpÖQ¦~yÔtºX˜g¶5Sÿ&©Ö$kq"µ÷==dÍN»Ž¤€š„Â^ã¢åØuÁÚ>.Bc[8Ó˜eS*©;4Ñ>H'jSâÂ‚µ¼×™#ñ€!°š¿ùˆã\C­â£Œø
 ýÕ·€Üª^õ’7;s˜>Ã—û“â¸-àb“³&Ä'µ-¢m±búœyõ8/
-žå×Ù4™x±<þu2îjÄBÎšq¨¶LÌ§K£%ËË‘vBÇ£ö´ÕZµ‡¡<£	©ö•ûŽ´wÛöþ«ÛŒµxø¡|ƒ8÷dK™H}ÁÜ½Ý\i¯*˜$É©Œ²‚Þ]Rˆ
B8Ê0•=Ö‘)Cƒz”@ÑG *Ý,„Å<Ú¬H“âé] èóè³É´«ewîÅG›
¹° HÏ=èR™0ÏÈ\ì«ß8\–I¸cñ,~¹ÈmP2ÃëjiBážã}é$°Wô`ÒiÊ½êŒ¯Ñ~’)q“m¶_ñã•þ«Œâc*ãxÿ1j,Í]·3~ùÊ \Rö?vëõp»šQÐè‘Bõ¬I
wÙÃã¦õ(3?}ûN²þSÂ“Ÿò”§<å)OyÊSþkù	Ëÿ2Ê$§€    IEND®B`‚
```

---

## File: `public\index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>
```

---

## File: `public\favicon.ico`
```ico
         ã  F          )         9  5  @@     °  n  ‰PNG

   
IHDR         (-S   äPLTE""""""""""""""""""2PX=r€)7;*:>H¤-BGEˆš8do5Xb6[eK™®Kš¯1MU9gs3S\I“§:gt'03@{‹V¹ÔT´ÏA}V»Ö@y‰6\fH’¦-CII”¨Eˆ›+;@7_i7_jFŠJ–«K›°H£-BHaÚû,@FCƒ”L³&.0W½ÙN£ºI“¨$)+B‘J•ªR¯È?v†>s>u„S±Ê=qP©ÁP¨ÀP§¿,?D4U^%+-M ¶K˜®%+,2OX+<ALœ²#&&D†˜%,.I•©vôTö   tRNSIæçJäeÀe¦   ©IDATxMŽµZEA„ÿÙ³	îî%R¡ïßáTThÇG…»,Á®Å=²Òîmífímnf’A–$â‡>!¦gºôHg½EßÜµ}	Ý»ý‡º¼kdú§¯Jo—™Î3æL"J¹ ›ÌÕüQ‡$âçÄ¼ffµ,é€5i9ÌŸ¯H¨/mB†‡wÍÜw;D
Ø+&‚W«ª¹¨Dôo@Ê´RI©ÐB¡om.Û³À    IEND®B`‚‰PNG

   
IHDR         ×©ÍÊ  ePLTE""""""""""""""""""""""""2RZN¢¹J–«3R[J—¬)59YÁÞ0KS4W`Q«ÄLœ²%+-0JR)6::gtC‚“"##?v†U·Ñ?w†<n{&-/YÂß=q:iuBA}A{ŒB‘/IPP§¿=q€K™®_ÔóL³$();lzR¯ÉaÚûI“¨ZÆã3U^1MU3T]ZÅâI“§X¿ÜF‹ž-BGP¨À6[e,@E5ZdO§¿-BHX¿Û+=AW¾Ú,@FW¼ØQªÃ?v…W¼×+<A@yˆ"#$\Ìê4Wa\ÌëS²Ì$(*.EL^ÑñVºÕ6]h#$%GŽ¡#&';jwV¹Ô-CIL›±ZÄá^Ðï>u„S°Ê/HNM ·_Õõ\ËéM ¶8doD…—D†˜>tƒ+=B[Èæ,>C>t‚<o}@y‰0LS.EKT´Î$'(%,.A~ŽW½ÙC’%+,\ÊèC!ä   tRNS‘íîˆ‰œG¾Ö  OIDATxl‰ÃB¶Q…Ÿu´ß_È³<Ë¦Ýveê²óa6AÎ¾Œûv¢{@Î E' Þd IÕ!çží  ðC—ÔT‹þg  1ÂE(ÏñSQsâi
Ä…Zÿ·V¹ Ð)ég!‰ªhÎùtéº-i}˜µµ<Õ?¶lBZaÄ´4{DÓâŒ»_e8¥yÇ­À3ž)Ÿ¥?°f;8.ã¤tÌ=å;	:ã52fKZìlù¨ØšÍ9.ž#ƒÒAÁqÌúÛ®£Vÿ`=$¬Â?_¶¾®ÔqMç.ïJ$
?^q÷ñíÛï.},‚ìsæÝ_TttÔ¾ 1#‰/(ì—-[è`è`ÌÚïÅðZd5’Ž™›?ÎebZ¿Þˆi.Ûæ™ìqÎ„+1°}ÂŒ5ù  ïçd¨G•Ïø    IEND®B`‚‰PNG

   
IHDR           D¤ŠÆ  APLTE   """""""""""""""""""""""""""2RZVºÖ_ÔôU·Ñ=r€$()'25]ÎíCƒ•0LS<o}XÀÜX¿Û0JQ=p~D„–<n{VºÕE‡™8do_ÔóEˆšF‹žH‘¥9dp_ÕõH¤I“¨FŒŸ6[e`Ö÷`×øL³/GM_ÓòU¸Ó'02P©Á/IPPªÂX¿Ü&/1;ly3R[`ØøGŽ¡T³Í\ÌêaÚû1OW"##Q«ÄaÙúR®Ç=q€`Öö.EL+=ATµÐ-CIK˜®#&'C‚“^ÐïI”¨&.04U^^Ñð@yˆZÇä$(*[Éç^Ññ,?DR¯É"#$1NV1MTD…—>u„;kxG R¯È/HN&-/@y‰>s>t‚@zŠ]ÍìP¨À$'(D†—]Ïî<n|0JRU·Ò×\¼   	tRNS %­ñ'ïó(ò~ÑÝè  žIDATx“šC1F_Ý¿MmÛ¶4¶m{ÿ˜¤n†çáÓ	®A$–à$b‘ Heø™TãWÄÂh•šh´:PtZ
Q«0@.`€Þ`4™-V`³Zì&‡A#ÁébkÝÄãñúØ>.''ø`C$FØÏ	‘(±x"6Xác”TÚéL§@Iù;d d-¹|¾P,È”9¡R­ÕÍf3¢¿F½VmMíX§ÚíÍç@Y˜7ÎõºÕN¬=—ŽåÈÊªu
}Ö¬«+‘e‡aiq ¤Ö76­íÝ=h
ûZìíîl›ë‡}á¨Ê±¥[F«I9A¹k9¥ÖëäŒ3¢Ã9Î¡óžqB~Øáb¸ÃåU_¸^Ü [·ôw†ý{z‡v‡z‡Ù(Š£(Š£(þ›†Šfòq”ÉG–Éïkñ”ÏçŠY¾ÿªfäòÇ~à:*4ÓQ\O>Ÿ‘ ‡¼<×“úW£éÍZ|Þ‹Å7“ñ•ïjTÔäãn”½»¢®`$Hð+ò¿GOñûð*èx‹•ø¥X*|”^ÿd    IEND®B`‚‰PNG

   
IHDR   @   @   ·ì  :PLTE   """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""%+-@y‰W¼×`×ø^ÑñS²ÌC‚“,>C*8<XÁÝaÚûaÙùMŸµ+<AaÙúXÀÜ#%%TµÐLž´=q>u„K›°`ÖöA}L›±8do=r€%+,@yˆ^ÐïS²Ë)59=q€P©ÁU·Ò"#$PªÂ\Êè0JQQªÃ"##U·Ñ#&&_Ôô>t‚>s`Øø_Ôó5Yc1OW5Zd1NV+=B1MU+;@/GM\Ìê*;?3S\)8<2RZ_Õõ+=A]Ïî,@F,@E&-/0KS7alO¦¾9dp8amB~EˆšP¨ÀN¢¹'023T]]Îí?x‡3U^Cƒ•6\gU¸Ó&.0D„–7_iR­ÆH‘¥I”¨M ¶$(*?v…ZÆãX¿Ü-AG#$%[Éç8co[ÈæW½ÙC’'25?v†8bn%*+Lœ²N£º2PX)7;=p~(58^ÒòP§¿4WaQ«ÄT´Ï0JRQ¬ÅT´ÎI“¨6]hR¯ÉT³Í0LSF‹9eqEˆ›E‰œ9gsFŠCƒ”#&'\Ëé`Ö÷&/16\fB‘A{ŒR®Ç]Íì(47%,.*:>*9=9fr:gt7^iU¶Ð?w†ZÇäX¿Û^ÑðQ­ÅH£)6:V¹Ô'034U^E‡™.EL.FMK™®@zŠS×   tRNS *Ž×øÖ”ý˜	»½•+üùóÔ,ØúôÀ=V  IDATx¤ËµC! ÐïŠ–‡C|ÿãÚ^yR]ÕMÛáO]ßÔÕÝ0NÈ2ÍËí¿"ªª¢(0Vã(ÀY%PDT-~(m¬ó!âKÞY£~´•üIÒf{³ÛÞáa¼§§ô3—ÕOp&”Ð¤‰¡ xŽ÷#Ÿj­ôÚ¶mméòc)]m¤’‡É)Æ§gfçhk²ñÎÒ ægg¦Ç™šìÐ+X€ÅêuiyV×ª·k«°²\[ü:,Ø6ØÜjÄ²
;»"»;°×XùþÛfÁáÇÍûý“SÎÎÏÏ8=Þo¾;æèÐ(ƒ‹öÓ¥BkÔeûÍ\7p+mîîáþNÚ<ÀQðOÒæùô³´y‚g»ttÐëo•ý½£ŸìVð»Òäsýü¬™ø”&_ðaüïV~à·Ö?­*8àQ ;8¥Á,¸¤‚f¥“1Üx¤†×§ñŸ*œøÑA¯Ôð°a#±³¶¦#ŠnP‘i+¼¶CÈ,ˆÆèäÍ_áNbÑá‚Ã¸ç •HŽB*ÚÒ¦ L( ^<ñÃ‚L6pJ¾P”É¥Ž©¢%"“R,ä9Èe3eRËa1(
¢ßqÇ8ÙŽ´ŠmKË±mÆ¶mÛü·yi!èÎªYÏuë ÀÏ_Àï?i÷ˆý+òŠÄA|ù{‘˜´?¿_En).JËD¤<€
©¬¢Z\Ts©R*(	¯©JŠ…uX/
4J9š¡5·DEµ4kÇ4‡&i¥V4Ú¡®Ð¯†vsf:àg,¢èBC»î$¶ºÍùî‡á–@ôŠI_?<‘!^ŠÈàÓ½ÇöäõB‘%Làw±FD1ŠÁ¨(F€±øH˜%0Æ±¿ÅØ„(¢0ˆÅÄ'Åæ—N.0u„@íY‡PWìIüaNâKš™Ä?ðÓµŒ=Žeœv/c—±ŒÓ0c0÷2Êë:ˆ06R-uÒÄ­\QÌ¶ää´¼µ6R#
ÆFš³6Òñ·rÕ­ìu˜æmâðÂž‡Iñi~ –Åü ÃsPþ"± óŸ¼
eiyå£ËPšàãÊò’§¡œÝÒ,S]U¦ºV…ªÖ”©®Z¦êoëë·xzã™âÆSnm¬{ÚºwaÙ„Ï…Å»´Ýõ(mg/®þå½À¿¼ûŒ[§b³µq¶Å&Õ¯¹$ñzÈŠ‹H>aÌKT1/æø1O‚‰0¾.hÍ‡YþAÓö£
-ê>Û‹º«¢XÕ¢î}ß¨ëÛÑ;ÃöN´ØvÅýÎ¸ÿ1 ë×ÄO@&v/Äþ_—ö\ôÇ\í.™½+0”;!fÊ¦´Ó%Â JY·O”ÂŽ'/Å]_Š;ßÀ'"&Nªn	aQ^ ”cx¦AáÒ    IEND®B`‚
```

---

## File: `src\reportWebVitals.js`
```js
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
```

---

## File: `src\firebaseTest.js`
```js
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const test = async () => {
  const snap = await getDocs(collection(db, "users"));
  console.log(
    "Firestore users:",
    snap.docs.map((d) => d.data())
  );
};

test();
```

---

## File: `src\logo.svg`
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3"><g fill="#61DAFB"><path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/><circle cx="420.9" cy="296.5" r="45.7"/><path d="M520.5 78.1z"/></g></svg>
```

---

## File: `src\setupTests.js`
```js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
```

---

## File: `src\supabaseClient.js`
```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

---

## File: `src\index.js`
```js
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import "./i18n";
import reportWebVitals from "./reportWebVitals";

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .then((reg) => console.log("SW registered:", reg))
      .catch((err) => console.log("SW failed:", err));
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
```

---

## File: `src\utils\db.js`
```js
import { openDB } from "idb";

export const dbPromise = openDB("telemedicine-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("appointments")) {
      db.createObjectStore("appointments", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});
```

---

## File: `src\utils\speech.js`
```js
export const LANGUAGE_MAP = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
  ml: "ml-IN"
};

export function getSpeechLang(lang) {
  return LANGUAGE_MAP[String(lang || "").toLowerCase()] || "en-US";
}

function pickVoice(langCode) {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices() || [];
  if (voices.length === 0) return null;

  const target = String(langCode || "en-US").toLowerCase();
  const base = target.split("-")[0];

  return (
    voices.find((v) => String(v.lang || "").toLowerCase() === target) ||
    voices.find((v) => String(v.lang || "").toLowerCase().startsWith(`${base}-`)) ||
    voices.find((v) => String(v.lang || "").toLowerCase().startsWith(base)) ||
    voices.find((v) => String(v.default).toLowerCase() === "true") ||
    voices[0]
  );
}

function buildUtterance(message, langCode) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = langCode;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voice = pickVoice(langCode);
  if (voice) utterance.voice = voice;
  return utterance;
}

export function speakText(text, lang) {
  if (!("speechSynthesis" in window)) return;
  const message = String(text || "").trim();
  if (!message) return;
  const langCode = getSpeechLang(lang);
  const synth = window.speechSynthesis;

  synth.cancel();
  synth.resume();

  const speakNow = () => {
    const utterance = buildUtterance(message, langCode);
    synth.speak(utterance);
  };

  if ((synth.getVoices() || []).length > 0) {
    speakNow();
    return;
  }

  let didSpeak = false;
  const onVoicesChanged = () => {
    if (didSpeak) return;
    didSpeak = true;
    synth.removeEventListener("voiceschanged", onVoicesChanged);
    speakNow();
  };

  synth.addEventListener("voiceschanged", onVoicesChanged);
  setTimeout(() => {
    if (didSpeak) return;
    didSpeak = true;
    synth.removeEventListener("voiceschanged", onVoicesChanged);
    speakNow();
  }, 250);
}
```

---

## File: `src\homepages\PatientHome.js`
```js
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SpeakableText from "../components/SpeakableText";

function getCardSpeakText(label, description) {
  const cleanLabel = String(label || "").trim();
  const cleanDescription = String(description || "").trim();

  if (!cleanDescription) return cleanLabel;

  const labelLower = cleanLabel.toLowerCase();
  const descriptionLower = cleanDescription.toLowerCase();

  if (descriptionLower === labelLower) {
    return cleanDescription;
  }

  if (descriptionLower.startsWith(`${labelLower}.`)) {
    return cleanDescription.slice(cleanLabel.length + 1).trim();
  }

  if (descriptionLower.startsWith(`${labelLower} `)) {
    return cleanDescription.slice(cleanLabel.length).trim();
  }

  return cleanDescription;
}

export default function PatientHome() {
  const user = JSON.parse(sessionStorage.getItem("userData"));
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: "ðŸ“…",
      label: t("nav.appointments"),
      description: t("book_appointment_desc"),
      route: "/appointments"
    },
    {
      icon: "ðŸ©º",
      label: t("nav.symptoms"),
      description: t("symptom_checker_desc"),
      route: "/symptoms"
    },
    {
      icon: "ðŸŽ¥",
      label: t("nav.consultation"),
      description: t("consultation_desc"),
      route: "/consult"
    },
    {
      icon: "ðŸ‘¨â€âš•ï¸",
      label: t("nav.doctors"),
      description: t("doctors_desc"),
      route: "/doctor-availability"
    },
    {
      icon: "ðŸ‘¤",
      label: t("nav.profile"),
      description: t("profile_title"),
      route: "/profile"
    }
  ];

  return (
    <div style={page}>
      <SpeakableText
        as="h2"
        text={`${t("welcome")}, ${user?.name || t("patient")}`}
        style={title}
        wrapperStyle={{ display: "flex", marginBottom: 6 }}
      />
      <SpeakableText
        as="p"
        text={t("patient_home_hint")}
        style={hint}
        wrapperStyle={{ display: "flex", marginBottom: 20 }}
      />

      <div style={actionGrid}>
        {quickActions.map((item) => (
          <div key={item.route} style={actionCard}>
            <button
              type="button"
              onClick={() => navigate(item.route)}
              style={actionButton}
              aria-label={`${item.label}. ${getCardSpeakText(item.label, item.description)}`}
            >
              <span style={actionIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span style={actionLabel}>{item.label}</span>
            </button>
            <SpeakableText
              text={getCardSpeakText(item.label, item.description)}
              wrapperStyle={actionSpeakWrap}
              buttonStyle={actionSpeakButton}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const page = {
  padding: 18,
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #dff7f3 0%, #e6f7ff 42%, #eef2ff 100%)"
};

const title = {
  color: "#0f2027",
  marginBottom: 6,
  fontSize: 34
};

const hint = {
  marginTop: 0,
  marginBottom: 20,
  fontSize: 20,
  color: "#164e63",
  fontWeight: 600
};

const actionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14
};

const actionCard = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: 8
};

const actionButton = {
  color: "#1b1b1b",
  border: "1px solid #d3dde2",
  borderRadius: 22,
  minHeight: 170,
  width: "100%",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  boxShadow: "0 8px 14px rgba(0,0,0,0.1)",
  cursor: "pointer",
  padding: 16,
  textAlign: "center"
};

const actionIcon = {
  width: 62,
  height: 62,
  borderRadius: 999,
  border: "2px solid #9bb2bf",
  display: "grid",
  placeItems: "center",
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1
};

const actionLabel = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: 0.3,
  textAlign: "center"
};

const actionSpeakWrap = {
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  background: "rgba(255,255,255,0.72)",
  border: "1px solid #d3dde2",
  borderRadius: 14,
  padding: "8px 10px"
};

const actionSpeakButton = {
  width: 38,
  height: 38,
  fontSize: 16,
  flexShrink: 0
};
```

---

## File: `src\homepages\DoctorHome.js`
```js
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function DoctorHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={page}>
      <h2 style={title}>{t("welcome_doctor")} </h2>

      {/* Shortcut Cards */}
      <div style={grid}>
        <div style={card} onClick={() => navigate("/doctor/add-patient")}>
          <h4>{t("add_patient_title")}</h4>
          <p>{t("add_patient_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/appointments")}>
          <h4>{t("appointments_title")}</h4>
          <p>{t("appointments_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/doctor/patients")}>
          <h4>{t("view_patients_title")}</h4>
          <p>{t("view_patients_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/pharmacy")}>
          <h4>{t("pharmacy")}</h4>
          <p>{t("pharmacy_title")}</p>
        </div>

        <div style={card} onClick={() => navigate("/doctor-analytics")}>
          <h4>{t("home_analytics_title")}</h4>
          <p>{t("home_analytics_desc")}</p>
        </div>

        <div style={card} onClick={() => navigate("/consult")}>
          <h4>{t("video_call_card_title")}</h4>
          <p>{t("video_call_card_desc")}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 20
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16
};

const card = {
  background: "linear-gradient(135deg, #203a43, #2c5364)",
  color: "#ffffff",
  padding: 22,
  borderRadius: 14,
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  cursor: "pointer"
};
```

---

## File: `src\homepages\AdminHome.js`
```js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getAllAppointmentsCloud,
  getAllPatientRecordsCloud,
  updateAppointmentCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import { addDoctorCredential, getAllDoctors } from "../services/localData";

const DEFAULT_DOCTORS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    specialty: "General Medicine",
    email: "doctor@gmail.com"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    specialty: "Dermatology",
    email: "anjali@gmail.com"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    specialty: "Pediatrics",
    email: "arun@gmail.com"
  }
];

function mergeDoctorLists(base, extra) {
  const map = new Map();
  (base || []).forEach((doc) => {
    const key = doc.email || doc.id;
    if (key) map.set(String(key), doc);
  });
  (extra || []).forEach((doc) => {
    const key = doc.email || doc.id;
    if (!key) return;
    const existing = map.get(String(key));
    map.set(String(key), { ...existing, ...doc });
  });
  return Array.from(map.values());
}

export default function AdminHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorList, setDoctorList] = useState(DEFAULT_DOCTORS);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "General Medicine"
  });
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState("");

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      try {
        const localDoctors = await getAllDoctors();
        if (!active) return;
        setDoctorList(mergeDoctorLists(DEFAULT_DOCTORS, localDoctors));
      } catch {
        if (active) setDoctorList(DEFAULT_DOCTORS);
      }
    }

    loadDoctors();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!hasSupabase || !isOnline) {
        if (active) {
          setPatients([]);
          setAppointments([]);
          setLoading(false);
        }
        return;
      }

      try {
        const [p, a] = await Promise.all([
          getAllPatientRecordsCloud(),
          getAllAppointmentsCloud()
        ]);
        if (!active) return;
        setPatients(p);
        setAppointments(a);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const timer = setInterval(loadData, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOnline]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaysAppointments = appointments.filter((a) => a.date === today);
    const activeConsults = appointments.filter(
      (a) => a.status === "in_consultation"
    );
    const completed = appointments.filter((a) => a.status === "completed");

    return {
      patients: patients.length,
      doctors: doctorList.length,
      today: todaysAppointments.length,
      active: activeConsults.length,
      completed: completed.length
    };
  }, [patients, appointments, doctorList]);

  const doctorLoad = useMemo(() => {
    const map = {};
    doctorList.forEach((d) => {
      map[d.id] = { name: d.name, total: 0, active: 0 };
    });
    appointments.forEach((a) => {
      if (!map[a.doctorId]) {
        map[a.doctorId] = {
          name: a.doctorName || a.doctorId || t("doctor", "Doctor"),
          total: 0,
          active: 0
        };
      }
      map[a.doctorId].total += 1;
      if (a.status === "in_consultation") map[a.doctorId].active += 1;
    });
    return Object.values(map);
  }, [appointments, doctorList, t]);

  function handleDoctorChange(e) {
    setDoctorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    setDoctorMessage("");
    setDoctorSaving(true);
    try {
      const created = await addDoctorCredential(doctorForm);
      setDoctorList((prev) => mergeDoctorLists(prev, [created]));
      setDoctorForm({
        name: "",
        email: "",
        password: "",
        specialty: "General Medicine"
      });
      setDoctorMessage(t("admin_doctor_created_success", "Doctor added successfully."));
    } catch (error) {
      const msg = String(error?.message || "");
      if (msg.includes("doctor-already-exists")) {
        setDoctorMessage(t("admin_doctor_exists", "Doctor already exists."));
      } else if (msg.includes("doctor-email-required")) {
        setDoctorMessage(t("admin_doctor_email_required", "Doctor email is required."));
      } else {
        setDoctorMessage(
          t("admin_doctor_create_failed", "Unable to add doctor. Please check details.")
        );
      }
    } finally {
      setDoctorSaving(false);
    }
  }

  async function forceComplete(id) {
    if (!hasSupabase || !isOnline) {
      alert(t("admin_cloud_connection_required"));
      return;
    }
    await updateAppointmentCloud(id, { status: "completed" });
  }

  return (
    <div style={page}>
      <h2 style={title}>{t("admin_dashboard")}</h2>

      {!hasSupabase && (
        <p style={notice}>{t("admin_not_configured")}</p>
      )}
      {hasSupabase && !isOnline && (
        <p style={notice}>{t("admin_offline_paused")}</p>
      )}

      <div style={grid}>
        <MetricCard label={t("admin_total_patients_short")} value={stats.patients} />
        <MetricCard label={t("admin_doctors_short")} value={stats.doctors} />
        <MetricCard label={t("admin_appointments_today_short")} value={stats.today} />
        <MetricCard label={t("admin_active_consults")} value={stats.active} />
        <MetricCard label={t("admin_completed_cases")} value={stats.completed} />
      </div>

      <Section title={t("admin_operational_controls")}>
        <div style={actions}>
          <button style={btn} onClick={() => navigate("/admin-analytics")}>
            {t("admin_analytics_button")}
          </button>
          <button style={btn} onClick={() => navigate("/appointments")}>
            {t("admin_open_appointment_queue")}
          </button>
          <button style={btn} onClick={() => navigate("/doctor/patients")}>
            {t("admin_view_patient_records")}
          </button>
          <button style={btn} onClick={() => navigate("/pharmacy")}>
            {t("admin_pharmacy_monitor")}
          </button>
        </div>
      </Section>

      <Section title={t("admin_add_doctor_title", "Add Doctor Login")}>
        <p style={hint}>
          {t(
            "admin_add_doctor_desc",
            "Create credentials for new doctors so they can log in and appear in booking lists."
          )}
        </p>
        <form style={formGrid} onSubmit={handleDoctorSubmit}>
          <label style={label}>
            {t("admin_doctor_name", "Doctor Name")}
            <input
              name="name"
              value={doctorForm.name}
              onChange={handleDoctorChange}
              style={input}
              required
            />
          </label>
          <label style={label}>
            {t("admin_doctor_email", "Email")}
            <input
              name="email"
              type="email"
              value={doctorForm.email}
              onChange={handleDoctorChange}
              style={input}
              required
            />
          </label>
          <label style={label}>
            {t("admin_doctor_password", "Password")}
            <input
              name="password"
              type="text"
              value={doctorForm.password}
              onChange={handleDoctorChange}
              style={input}
              required
            />
          </label>
          <label style={label}>
            {t("admin_doctor_specialty", "Specialty")}
            <input
              name="specialty"
              value={doctorForm.specialty}
              onChange={handleDoctorChange}
              style={input}
              placeholder={t("admin_doctor_specialty_placeholder", "General Medicine")}
            />
          </label>
          <button style={btn} type="submit" disabled={doctorSaving}>
            {doctorSaving
              ? t("admin_doctor_creating", "Saving...")
              : t("admin_doctor_create", "Add Doctor")}
          </button>
          {doctorMessage && <span style={hint}>{doctorMessage}</span>}
        </form>
      </Section>

      <Section title={t("admin_doctor_list_title", "Doctor Logins")}>
        {doctorList.length === 0 && (
          <p style={hint}>{t("admin_doctor_list_empty", "No doctors found yet.")}</p>
        )}
        {doctorList.map((doc) => (
          <div key={doc.email || doc.id} style={listItem}>
            <strong>{doc.name}</strong>
            <div style={rowSub}>
              {t("admin_doctor_email", "Email")}: {doc.email || "-"} |{" "}
              {t("admin_doctor_specialty", "Specialty")}: {doc.specialty || "-"}
            </div>
            <div style={rowSub}>
              {t("admin_doctor_password", "Password")}: {doc.password || "-"} |{" "}
              {t("admin_doctor_id", "ID")}: {doc.id || "-"}
            </div>
          </div>
        ))}
      </Section>

      <Section title={t("admin_doctor_workload")}>
        {doctorLoad.map((d) => (
          <ListItem
            key={d.name}
            text={t("admin_doctor_workload_item", {
              name: d.name,
              total: d.total,
              active: d.active
            })}
          />
        ))}
      </Section>

      <Section title={t("admin_live_appointment_monitor")}>
        {loading && <p>{t("loading")}</p>}
        {!loading && appointments.length === 0 && <p>{t("admin_no_appointments_found")}</p>}
        {!loading &&
          appointments.slice(0, 10).map((a) => (
            <div key={a.id} style={panel}>
              <div style={row}>
                <strong>
                  {a.patientName} -> {t(`doctor_${a.doctorId?.split("_")[1]}`, a.doctorName)}
                </strong>
                <span>{t(`appointments_status_${a.status || "booked"}`)}</span>
              </div>
              <div style={rowSub}>
                {a.date} {a.time} | {t("appointments_code")}: {a.tokenNo || "-"}
              </div>
              <div style={rowSub}>{t("appointments_symptoms")}: {a.symptoms || "-"}</div>
              <div style={actions}>
                {a.consultCode && <code>{a.consultCode}</code>}
                {a.status !== "completed" && (
                  <button style={btnSmall} onClick={() => forceComplete(a.id)}>
                    {t("admin_force_complete")}
                  </button>
                )}
              </div>
            </div>
          ))}
      </Section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={card}>
      <div style={metricValue}>{value}</div>
      <div style={metricLabel}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function ListItem({ text }) {
  return <div style={listItem}>{text}</div>;
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 14
};

const notice = {
  background: "#fff3cd",
  color: "#704f00",
  border: "1px solid #ffe08a",
  borderRadius: 10,
  padding: 10
};

const hint = {
  color: "#38535d",
  fontSize: 13,
  marginBottom: 10
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 10,
  alignItems: "end",
  marginBottom: 8
};

const label = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14
};

const input = {
  border: "1px solid #b9cfd6",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 14
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12
};

const card = {
  background: "linear-gradient(135deg, #203a43, #2c5364)",
  color: "#ffffff",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};

const metricValue = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1.1
};

const metricLabel = {
  opacity: 0.9,
  marginTop: 6,
  fontSize: 13
};

const sectionTitle = {
  color: "#203a43",
  marginBottom: 8
};

const listItem = {
  background: "#ffffff",
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
};

const actions = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center"
};

const btn = {
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer",
  background: "#2c5364",
  color: "#fff"
};

const btnSmall = {
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  background: "#ad2e2e",
  color: "#fff"
};

const panel = {
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  padding: 12,
  marginBottom: 10
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10
};

const rowSub = {
  fontSize: 13,
  color: "#38535d",
  marginTop: 4
};
```

---

## File: `src\firebase\firebaseConfig.js`
```js
// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// ðŸ”¹ Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCkF7vnpw_U7lASQ2wiC2YhlaL_LcEVkto",
  authDomain: "offline-telemedicine-pwa.firebaseapp.com",
  projectId: "offline-telemedicine-pwa",
  storageBucket: "offline-telemedicine-pwa.firebasestorage.app",
  messagingSenderId: "157619316543",
  appId: "1:157619316543:web:29da9321dbc34d8d66d58a"
};

// ðŸ”¹ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ðŸ”¹ Initialize Firestore
const db = getFirestore(app);

// ðŸ”¥ Enable OFFLINE persistence (IndexedDB)
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("âœ… Firestore offline persistence enabled");
  })
  .catch((err) => {
    console.log("âŒ Persistence error:", err.code);
  });

// ðŸ”¹ Export database
export { db };
```

---

## File: `src\components\AppointmentForm.js`
```js
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { dbPromise } from "../utils/db";

export default function AppointmentForm() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const saveAppointment = async () => {
    const db = await dbPromise;
    await db.add("appointments", {
      name,
      date,
      reason,
      createdAt: new Date(),
      synced: false,
    });

    alert(t("appointment_form_saved_offline"));
    setName("");
    setDate("");
    setReason("");
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>{t("appointment_form_title")}</h3>

      <input
        placeholder={t("patient_name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder={t("appointment_list_reason")}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br /><br />

      <button onClick={saveAppointment}>
        {t("appointment_form_title")}
      </button>
    </div>
  );
}
```

---

## File: `src\components\AppointmentList.js`
```js
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { dbPromise } from "../utils/db";

export default function AppointmentList() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const db = await dbPromise;
    const data = await db.getAll("appointments");
    setAppointments(data);
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>
        {role === "patient"
          ? t("appointment_list_all")
          : t("appointment_list_patient")}
      </h3>

      {appointments.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: 8,
            padding: 8,
            background:
              role === "patient" ? "#f9f9f9" : "#eef5ff",
          }}
        >
          <strong>{a.patientName}</strong>
          <div>{t("appointments_date")}: {a.date}</div>
          <div>{t("appointments_time")}: {a.time}</div>

          {(role === "doctor" || role === "admin") && (
            <div>{t("appointment_list_reason")}: {a.reason}</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## File: `src\db\db.js`
```js
import { openDB } from "idb";

const DB_NAME = "telemedDB";
const DB_VERSION = 1;
const STORE_NAME = "patients";

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("name", "name", { unique: false });
      }
    },
  });
};

export const addPatient = async (patient) => {
  const db = await initDB();
  await db.add(STORE_NAME, patient);
};

export const getAllPatients = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};
```

---

## File: `src\components\Navbar.js`
```js
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const location = useLocation();
  const role = sessionStorage.getItem("role");
  const { t } = useTranslation();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [open, setOpen] = useState(false);

  /* ---------- Screen Resize ---------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // âŒ Hide navbar on login
  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  return (
    <header style={styles.header}>
      <div style={styles.logo}>ðŸ©º</div>

      {/* ðŸ“± MOBILE MENU BUTTON */}
      {isMobile && (
        <button
          type="button"
          style={styles.menuBtn}
          onClick={() => setOpen(!open)}
          aria-label={t("nav_toggle_menu")}
        >
          â˜°
        </button>
      )}

      {/* ðŸ’» DESKTOP NAV */}
      {!isMobile && (
        <nav style={styles.nav}>
          <MenuLinks role={role} t={t} />
        </nav>
      )}

      {/* ðŸ“± MOBILE NAV */}
      {isMobile && open && (
        <div style={styles.mobileMenu}>
          <MenuLinks
            role={role}
            t={t}
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </header>
  );
}

/* ---------- MENU LINKS ---------- */

function MenuLinks({ role, t, onClick }) {
  return (
    <>
      {role === "patient" && (
        <>
          <NavItem to="/patient-home" label={t("nav.home")} onClick={onClick} />
          <NavItem to="/appointments" label={t("nav.appointments")} onClick={onClick} />
          <NavItem to="/symptoms" label={t("nav.symptoms")} onClick={onClick} />
          <NavItem to="/doctor-availability" label={t("nav.doctors")} onClick={onClick} />
          <NavItem to="/profile" label={t("nav.profile")} onClick={onClick} />
        </>
      )}

      {role === "doctor" && (
        <>
          <NavItem to="/doctor-home" label={t("nav.home")} onClick={onClick} />
          <NavItem to="/appointments" label={t("nav.appointments")} onClick={onClick} />
          <NavItem to="/doctor/add-patient" label={t("add_patient_title")} onClick={onClick} />
          <NavItem to="/doctor/patients" label={t("doctor_patients_title")} onClick={onClick} />
          <NavItem to="/doctor-analytics" label={t("nav.analytics")} onClick={onClick} />
          <NavItem to="/pharmacy" label={t("nav.pharmacy")} onClick={onClick} />
        </>
      )}

      {role === "admin" && (
        <>
          <NavItem to="/admin-home" label={t("nav.dashboard")} onClick={onClick} />
          <NavItem to="/admin-analytics" label={t("nav.analytics")} onClick={onClick} />
          <NavItem to="/appointments" label={t("nav.appointments")} onClick={onClick} />
          <NavItem to="/doctor/patients" label={t("nav.users")} onClick={onClick} />
          <NavItem to="/pharmacy" label={t("nav.pharmacy")} onClick={onClick} />
          <NavItem to="/admin-home" label={t("nav.settings")} onClick={onClick} />
        </>
      )}

      {role === "pharmacy" && (
        <>
          <NavItem to="/pharmacy" label={t("nav.pharmacy")} onClick={onClick} />
        </>
      )}
    </>
  );
}

/* ---------- NAV ITEM ---------- */

function NavItem({ to, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        ...styles.link,
        background: active
          ? "rgba(255,255,255,0.35)"
          : "rgba(255,255,255,0.15)",
        fontWeight: active ? "600" : "400"
      }}
    >
      {label}
    </Link>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff"
  },

  logo: {
    fontSize: 18,
    fontWeight: 700
  },

  nav: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 13,
    padding: "6px 12px",
    borderRadius: 16
  },

  /* ðŸ“± Mobile */
  menuBtn: {
    fontSize: 22,
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer"
  },

  mobileMenu: {
    position: "absolute",
    top: "60px",
    left: 0,
    right: 0,
    background: "linear-gradient(180deg, #203a43, #2c5364)",
    display: "flex",
    flexDirection: "column",
    padding: 12,
    gap: 8
  }
};
```

---

## File: `src\components\PatientList.js`
```js
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllPatientRecordsCloud } from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

function PatientList() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      if (!hasSupabase || !navigator.onLine) {
        setPatients([]);
        return;
      }
      const data = await getAllPatientRecordsCloud();
      if (!active) return;
      setPatients(data);
    }

    loadPatients();
    const timer = setInterval(loadPatients, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div style={container}>
      <h3 style={title}>{t("patient_list")}</h3>

      {patients.length === 0 ? (
        <p style={empty}>{t("no_patients")}</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>{t("name")}</th>
                <th style={th}>{t("age")}</th>
                <th style={th}>{t("condition")}</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p, index) => (
                <tr key={p.id}>
                  <td style={td}>{index + 1}</td>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.age}</td>
                  <td style={td}>{p.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientList;

/* ---------- Styles ---------- */

const container = {
  padding: 10
};

const title = {
  marginBottom: 14,
  color: "#203a43"
};

const empty = {
  opacity: 0.7
};

/* âœ… NEW: Scroll container */
const tableWrap = {
  maxHeight: "55vh",
  overflowY: "auto",
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#ffffff"
};

const th = {
  position: "sticky",     // ðŸ‘ˆ header always visible
  top: 0,
  background: "#203a43",
  color: "#ffffff",
  padding: 12,
  textAlign: "left",
  zIndex: 1
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e0e0e0"
};
```

---

## File: `src\components\PatientForm.js`
```js
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { addPatientRecordCloud } from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function PatientForm({ onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    age: "",
    condition: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasSupabase || !navigator.onLine) {
      alert(t("appointments_cloud_required_online"));
      return;
    }
    await addPatientRecordCloud(form);

    alert(t("patient_added_success"));
    onClose();
  };

  return (
    <div>
      <h3>{t("add_patient_title")}</h3>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder={t("patient_name")}
          value={form.name}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="age"
          placeholder={t("patient_age")}
          value={form.age}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="condition"
          placeholder={t("patient_condition")}
          value={form.condition}
          onChange={handleChange}
          required
          style={input}
        />

        <button type="submit" style={btn}>
          {t("save_patient")}
        </button>
      </form>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const btn = {
  width: "100%",
  marginTop: 14,
  padding: 12,
  background: "#203a43",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};
```

---

## File: `src\components\OfflineSymptomChecker.js`
```js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { analyzeSymptomsWithAI } from "../services/aiSymptomService";
import { buildClinicalAIResult } from "../services/clinicalModels";
import { useTranslation } from "react-i18next";
import SpeakableText from "./SpeakableText";
import { getSpeechLang, speakText as speakTextGlobal } from "../utils/speech";

const HISTORY_KEY = "offline_symptom_checks_v1";

const SYMPTOM_RULES = [
  {
    keywords: ["fever", "high temperature", "chills", "body pain", "fatigue"],
    diseaseKey: "symptom_rule_viral_fever_disease",
    naturalRemedyKey: "symptom_rule_viral_fever_remedy",
    doctorAdviceKey: "symptom_rule_viral_fever_advice",
    severity: "moderate"
  },
  {
    keywords: ["cold", "cough", "sore throat", "runny nose", "sneezing", "blocked nose"],
    diseaseKey: "symptom_rule_cold_disease",
    naturalRemedyKey: "symptom_rule_cold_remedy",
    doctorAdviceKey: "symptom_rule_cold_advice",
    severity: "mild"
  },
  {
    keywords: ["headache", "migraine", "light sensitivity", "nausea", "one side pain"],
    diseaseKey: "symptom_rule_headache_disease",
    naturalRemedyKey: "symptom_rule_headache_remedy",
    doctorAdviceKey: "symptom_rule_headache_advice",
    severity: "mild"
  },
  {
    keywords: ["stomach pain", "vomit", "diarrhea", "food poisoning", "loose motion", "abdominal pain"],
    diseaseKey: "symptom_rule_gastro_disease",
    naturalRemedyKey: "symptom_rule_gastro_remedy",
    doctorAdviceKey: "symptom_rule_gastro_advice",
    severity: "moderate"
  },
  {
    keywords: ["rash", "itching", "red patch", "skin allergy", "hives", "skin redness"],
    diseaseKey: "symptom_rule_skin_disease",
    naturalRemedyKey: "symptom_rule_skin_remedy",
    doctorAdviceKey: "symptom_rule_skin_advice",
    severity: "mild"
  },
  {
    keywords: ["chest pain", "breathless", "shortness of breath", "tight chest", "left arm pain"],
    diseaseKey: "symptom_rule_cardio_disease",
    naturalRemedyKey: "symptom_rule_cardio_remedy",
    doctorAdviceKey: "symptom_rule_cardio_advice",
    severity: "high"
  }
];

const RED_FLAG_KEYWORDS = [
  "severe chest pain",
  "shortness of breath",
  "breathing difficulty",
  "fainted",
  "confusion",
  "unconscious",
  "blood vomiting",
  "blood in stool",
  "high fever 103",
  "seizure",
  "stroke"
];

const CONDITION_LABEL_KEY = {
  viral_fever: "condition_viral_fever",
  cold_cough: "condition_cold_cough",
  migraine_headache: "condition_migraine_headache",
  gastro_issue: "condition_gastro_issue",
  skin_allergy: "condition_skin_allergy",
  cardio_respiratory: "condition_cardio_respiratory"
};

function formatConditionLabel(label, t) {
  const key = String(label || "").trim();
  if (!key) return t("condition_general_non_specific", "General non-specific symptoms");
  const translationKey = CONDITION_LABEL_KEY[key];
  if (translationKey) return t(translationKey);
  return key.replace(/_/g, " ");
}

export default function OfflineSymptomChecker() {
  const { i18n, t } = useTranslation();
  const [symptomText, setSymptomText] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [imageConfidence, setImageConfidence] = useState("low");
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [engine, setEngine] = useState("on-device-ai");
  const recognitionRef = useRef(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const onlineStatus = navigator.onLine ? t("video_call_online") : t("video_call_offline");
  const statusColor = navigator.onLine ? "#0d8f56" : "#b23a3a";
  const symptomSummary = useMemo(() => history.slice(0, 3), [history]);
  const speechLang = useMemo(() => {
    return getSpeechLang(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function speakText(message) {
    speakTextGlobal(message, i18n.language);
  }

  function startSymptomVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("symptom_voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setSymptomText((prev) => `${prev} ${transcript}`.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  function scoreText(text) {
    const input = String(text || "").toLowerCase().trim();
    if (!input) return [];
    return SYMPTOM_RULES.map((rule) => {
      let score = 0;
      for (const word of rule.keywords) {
        if (input.includes(word)) score += 1;
      }
      return { ...rule, score };
    })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  function translateRule(rule) {
    return {
      ...rule,
      disease: t(rule.diseaseKey),
      naturalRemedy: t(rule.naturalRemedyKey),
      doctorAdvice: t(rule.doctorAdviceKey)
    };
  }

  function hasRedFlag(text) {
    const input = String(text || "").toLowerCase().trim();
    return RED_FLAG_KEYWORDS.some((word) => input.includes(word));
  }

  function buildOfflineDiagnosis(text) {
    const ranked = scoreText(text);
    const top = ranked[0];
    const redFlag = hasRedFlag(text) || top?.severity === "high";

    if (!top) {
      return {
        disease: t("symptom_generic_disease"),
        naturalRemedy: t("symptom_generic_remedy"),
        doctorAdvice: t("symptom_generic_advice"),
        confidence: "low",
        serious: false,
        redFlags: []
      };
    }

    const localizedTop = translateRule(top);
    const confidence = top.score >= 3 ? "high" : top.score === 2 ? "medium" : "low";
    return {
      disease: localizedTop.disease,
      naturalRemedy: localizedTop.naturalRemedy,
      doctorAdvice: redFlag
        ? t("symptom_serious_pattern_advice")
        : localizedTop.doctorAdvice,
      confidence,
      serious: redFlag,
      redFlags: redFlag ? [t("symptom_potential_emergency_pattern")] : []
    };
  }

  async function analyzeImage(file) {
    if (!file) return { hint: t("symptom_no_image_uploaded") };
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setImageDataUrl(String(dataUrl));
    setImageName(file.name || "uploaded-image");

    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = String(dataUrl);
    });

    const canvas = document.createElement("canvas");
    const width = 100;
    const ratio = image.width ? image.height / image.width : 1;
    const height = Math.max(50, Math.floor(width * ratio));
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height).data;

    let r = 0;
    let g = 0;
    let b = 0;
    const pixels = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    const avgR = r / pixels;
    const avgG = g / pixels;
    const avgB = b / pixels;
    const rednessScore = avgR - (avgG + avgB) / 2;
    const brightness = (avgR + avgG + avgB) / 3;
    const fileName = String(file.name || "").toLowerCase();

    if (fileName.includes("rash") || fileName.includes("skin")) {
      return { hint: t("symptom_image_hint_skin_name"), confidence: "medium" };
    }
    if (rednessScore > 18) {
      return { hint: t("symptom_image_hint_red_tone"), confidence: "low" };
    }
    if (brightness < 70) {
      return { hint: t("symptom_image_hint_dark"), confidence: "low" };
    }
    return { hint: t("symptom_image_hint_none"), confidence: "low" };
  }

  async function runChecker() {
    if (!symptomText.trim() && !imageDataUrl) {
      alert(t("symptom_enter_text_or_image"));
      return;
    }
    setIsAnalyzing(true);
    try {
      const offline = buildOfflineDiagnosis(symptomText);
      const clinicalAI = buildClinicalAIResult({
        symptomText,
        age: patientAge
      });
      const initialDisease = formatConditionLabel(clinicalAI.label, t);
      const localizedRemedy = t(`symptom_rule_${clinicalAI.label}_remedy`, {
        defaultValue: clinicalAI.naturalRemedy || offline.naturalRemedy
      });
      const localizedAdvice = t(`symptom_rule_${clinicalAI.label}_advice`, {
        defaultValue: clinicalAI.doctorAdvice || offline.doctorAdvice
      });
      const localizedTreeReason = t(`symptom_risk_reason_${clinicalAI.riskLevel}`, {
        defaultValue: clinicalAI.treeReason || ""
      });
      const localizedTreeRisk = t(`symptom_risk_value_${clinicalAI.riskLevel}`, {
        defaultValue: clinicalAI.riskLevel
      });

      let output = {
        issue: initialDisease,
        disease: initialDisease,
        naturalRemedy: localizedRemedy,
        doctorAdvice: localizedAdvice,
        advice: `${localizedRemedy} ${localizedAdvice}`.trim(),
        confidence: clinicalAI.confidence || offline.confidence,
        serious: Boolean(clinicalAI.emergency) || offline.serious,
        redFlags:
          clinicalAI.emergency
            ? [t("symptom_potential_emergency_pattern")]
            : offline.redFlags || [],
        naiveBayesLabel: clinicalAI.label,
        naiveBayesProbabilities: clinicalAI.probabilities || {},
        decisionTreeRisk: localizedTreeRisk,
        decisionTreeReason: localizedTreeReason,
        imageHint: imageHint || "",
        imageConfidence,
        createdAt: Date.now()
      };

      try {
        const ai = await analyzeSymptomsWithAI({
          symptomText,
          imageDataUrl,
          language: i18n.language
        });
        const finalNaturalRemedy = ai.naturalRemedy || output.naturalRemedy;
        const finalDoctorAdvice = ai.doctorAdvice || output.doctorAdvice;
        output = {
          ...output,
          issue: output.issue,
          disease: output.disease,
          naturalRemedy: finalNaturalRemedy,
          doctorAdvice: finalDoctorAdvice,
          advice: ai.advice || `${finalNaturalRemedy} ${finalDoctorAdvice}`.trim(),
          confidence: ai.confidence || output.confidence,
          serious: Boolean(ai.serious) || output.serious,
          redFlags: ai.redFlags || output.redFlags || [],
          imageHint: imageHint || "",
          imageConfidence,
          createdAt: Date.now()
        };
        setEngine("ai+local-models");
      } catch {
        setEngine("on-device-ai");
      }

      const nextHistory = [output, ...history].slice(0, 20);
      setResult(output);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      const voiceSummary = `${t("symptom_voice_issue_prefix")} ${output.issue || output.disease || t("symptom_not_clear")}. ${t("symptom_voice_remedy_prefix")} ${output.naturalRemedy || t("symptom_none")}. ${t("symptom_voice_advice_prefix")} ${output.doctorAdvice || t("symptom_consult_if_needed")}.`;
      speakText(voiceSummary);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAnalyzing(true);
      const imageResult = await analyzeImage(file);
      setImageHint(imageResult.hint);
      setImageConfidence(imageResult.confidence || "low");
    } catch {
      alert(t("symptom_unable_process_image"));
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div style={checkerBox}>
      <p style={{ ...statusPill, background: statusColor }}>{onlineStatus} {t("status_mode")}</p>
      <textarea
        placeholder={t("symptom_text_placeholder")}
        value={symptomText}
        onChange={(e) => setSymptomText(e.target.value)}
        style={textArea}
      />
      <input
        type="number"
        min="0"
        max="120"
        placeholder={t("symptom_age_placeholder")}
        value={patientAge}
        onChange={(e) => setPatientAge(e.target.value)}
        style={ageInput}
      />
      <div style={voiceRow}>
        <button
          type="button"
          style={{ ...voiceBtn, background: isListening ? "#dc2626" : "#0f766e" }}
          onClick={startSymptomVoiceInput}
        >
          {isListening ? t("voice_listening") : t("symptom_speak_button")}
        </button>
        <button
          type="button"
          style={voiceBtn}
          onClick={() => {
            if (!result) return;
            speakText(
              `${t("symptom_voice_issue_prefix")} ${result.issue || result.disease || t("symptom_not_clear")}. ${t("symptom_voice_remedy_prefix")} ${result.naturalRemedy || t("symptom_none")}. ${t("symptom_voice_advice_prefix")} ${result.doctorAdvice || t("symptom_consult_if_needed")}.`
            );
          }}
          disabled={!result}
        >
          {t("symptom_read_result")}
        </button>
      </div>
      <div style={uploadRow}>
        <input type="file" accept="image/*" onChange={onImageChange} />
        {imageName ? <span style={smallText}>{t("symptom_image_label")}: {imageName}</span> : null}
      </div>
      {imageDataUrl ? <img src={imageDataUrl} alt="symptom upload" style={preview} /> : null}
      <button style={checkBtn} onClick={runChecker} disabled={isAnalyzing}>
        {isAnalyzing ? t("symptom_analyzing") : t("symptom_check_offline")}
      </button>

      {result ? (
        <div style={resultCard}>
          <SpeakableText as="h4" text={t("symptom_result")} style={{ margin: "0 0 8px" }} wrapperStyle={{ display: "flex" }} />
          <p style={resultText}><strong>{t("symptom_risk_level")}:</strong> {result.decisionTreeRisk || t("symptom_risk_value_low")}</p>
          <p style={resultText}><strong>{t("symptom_safety_note")}:</strong> {result.decisionTreeReason || "-"}</p>
          <p style={resultText}><strong>{t("symptom_probable_disease")}:</strong> {result.disease || result.issue || "-"}</p>
          <p style={resultText}><strong>{t("symptom_natural_remedy")}:</strong> {result.naturalRemedy || "-"}</p>
          <p style={resultText}><strong>{t("symptom_doctor_guidance")}:</strong> {result.doctorAdvice || "-"}</p>
          <p style={resultText}><strong>{t("symptom_confidence")}:</strong> {t(`symptom_confidence_${result.confidence || "low"}`)}</p>
          {result.serious ? <p style={seriousText}>{t("symptom_serious_detected")}</p> : null}
          {Array.isArray(result.redFlags) && result.redFlags.length > 0 ? (
            <p style={resultText}><strong>{t("symptom_red_flags")}:</strong> {result.redFlags.join(", ")}</p>
          ) : null}
          {result.imageHint ? (
            <p style={resultText}>
              <strong>{t("symptom_image_hint")}:</strong> {result.imageHint} ({result.imageConfidence || "low"} {t("symptom_confidence")})
            </p>
          ) : null}
          <SpeakableText
            as="p"
            text={t("symptom_emergency_warning")}
            style={warningText}
            wrapperStyle={{ display: "flex" }}
          />
        </div>
      ) : null}

      {symptomSummary.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <SpeakableText
            as="h4"
            text={t("symptom_recent_checks")}
            style={{ margin: "0 0 8px", color: "#203a43" }}
            wrapperStyle={{ display: "flex" }}
          />
          {symptomSummary.map((item) => (
            <div key={item.createdAt} style={historyItem}>
              <strong>{item.issue}</strong>
              <p style={{ margin: "4px 0" }}>{item.advice}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const statusPill = {
  display: "inline-block",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 20,
  fontWeight: 600,
  marginBottom: 10
};

const checkerBox = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
};

const checkerMeta = {
  marginTop: 0,
  fontSize: 13,
  color: "#32535d"
};

const textArea = {
  width: "100%",
  minHeight: 110,
  resize: "vertical",
  borderRadius: 10,
  border: "1px solid #b7cdd3",
  padding: 10,
  fontSize: 14
};

const ageInput = {
  width: "100%",
  marginTop: 10,
  borderRadius: 10,
  border: "1px solid #b7cdd3",
  padding: 10,
  fontSize: 14
};

const uploadRow = {
  marginTop: 10,
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap"
};

const voiceRow = {
  marginTop: 10,
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};

const voiceBtn = {
  minHeight: 52,
  minWidth: 160,
  border: "none",
  borderRadius: 12,
  background: "#0f766e",
  color: "#fff",
  fontWeight: 700,
  fontSize: 18,
  padding: "10px 14px",
  cursor: "pointer"
};

const smallText = {
  fontSize: 12,
  color: "#355b66"
};

const preview = {
  marginTop: 10,
  width: "100%",
  maxHeight: 240,
  objectFit: "cover",
  borderRadius: 10,
  border: "1px solid #d4e5ea"
};

const checkBtn = {
  marginTop: 12,
  border: "none",
  background: "#1f6f8b",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600
};

const resultCard = {
  marginTop: 12,
  border: "1px solid #c9e0e6",
  background: "#f3fcff",
  borderRadius: 10,
  padding: 12
};

const resultText = {
  margin: "6px 0",
  color: "#163e49"
};

const warningText = {
  margin: "8px 0 0",
  color: "#9b2c2c",
  fontWeight: 600,
  fontSize: 13
};

const seriousText = {
  margin: "8px 0 0",
  color: "#b00020",
  fontWeight: 700
};

const historyItem = {
  border: "1px solid #d2e6ec",
  borderRadius: 8,
  padding: 10,
  marginBottom: 8,
  background: "#ffffff"
};
```

---

## File: `src\components\ShortcutCard.js`
```js
export default function ShortcutCard({ title, desc, onClick }) {
  return (
    <div style={card} onClick={onClick}>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

const card = {
  background: "#0f2027",
  color: "#e0f7fa",
  padding: 20,
  borderRadius: 14,
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  transition: "transform 0.2s",
};
```

---

## File: `src\components\PatientVoiceAssistant.js`
```js
import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSpeechLang, speakText } from "../utils/speech";

const UI_BY_LANG = {
  en: {
    hints: {
      "/patient-home": "Home screen. Say book appointment, doctor, medicine, emergency, or symptoms.",
      "/appointments": "Appointments screen. Say home, book appointment, doctor, or emergency.",
      "/symptoms": "Symptoms screen. You can speak your symptoms.",
      "/consult": "Consultation screen. Say home, doctor, or emergency.",
      "/chat": "Text consultation. Say home, doctor, or emergency.",
      "/pharmacy": "Pharmacy screen. Say medicine or home."
    },
    fallbackHint: "Say home, book appointment, doctor, medicine, emergency, or symptoms.",
    openingPrefix: "Opening",
    notRecognized: "Command not recognized. Try saying home, book appointment, doctor, medicine, emergency, or symptoms.",
    couldntHear: "I could not hear clearly. Please try again.",
    unsupported: "Voice input is not supported on this device.",
    speakLabel: "Speak",
    listeningLabel: "Listening..."
  },
  ta: {
    hints: {
      "/patient-home": "\u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1. \u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd, \u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd, \u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1, \u0b85\u0bb5\u0b9a\u0bb0\u0bae\u0bcd, \u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bb2\u0bbe\u0bae\u0bcd.",
      "/appointments": "\u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd \u0baa\u0b95\u0bcd\u0b95\u0bae\u0bcd. \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1, \u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd, \u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd, \u0b85\u0bb5\u0b9a\u0bb0\u0bae\u0bcd \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bb2\u0bbe\u0bae\u0bcd.",
      "/symptoms": "\u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf \u0baa\u0b95\u0bcd\u0b95\u0bae\u0bcd. \u0b89\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf\u0b95\u0bb3\u0bc8 \u0baa\u0bc7\u0b9a\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd.",
      "/consult": "\u0b86\u0bb2\u0bcb\u0b9a\u0ba9\u0bc8 \u0baa\u0b95\u0bcd\u0b95\u0bae\u0bcd. \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1, \u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b85\u0bb5\u0b9a\u0bb0\u0bae\u0bcd \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bb2\u0bbe\u0bae\u0bcd.",
      "/chat": "\u0b9a\u0bbe\u0b9f\u0bcd \u0baa\u0b95\u0bcd\u0b95\u0bae\u0bcd. \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1 \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bb2\u0bbe\u0bae\u0bcd.",
      "/pharmacy": "\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0b95\u0bae\u0bcd \u0baa\u0b95\u0bcd\u0b95\u0bae\u0bcd. \u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1 \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bb2\u0bbe\u0bae\u0bcd."
    },
    fallbackHint: "\u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1, \u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd, \u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd, \u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1, \u0b85\u0bb5\u0b9a\u0bb0\u0bae\u0bcd, \u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd.",
    openingPrefix: "\u0ba4\u0bbf\u0bb1\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1",
    notRecognized: "\u0b95\u0b9f\u0bcd\u0b9f\u0bb3\u0bc8 \u0baa\u0bc1\u0bb0\u0bbf\u0baf\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1, \u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd, \u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd, \u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1, \u0b85\u0bb5\u0b9a\u0bb0\u0bae\u0bcd, \u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd.",
    couldntHear: "\u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba4\u0bc6\u0bb3\u0bbf\u0bb5\u0bbe\u0b95 \u0b95\u0bc7\u0b9f\u0bcd\u0b95\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bae\u0bc0\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd \u0bae\u0bc1\u0baf\u0bb1\u0bcd\u0b9a\u0bbf\u0b95\u0bcd\u0b95\u0bb5\u0bc1\u0bae\u0bcd.",
    unsupported: "\u0b87\u0ba8\u0bcd\u0ba4 \u0b9a\u0bbe\u0ba4\u0ba9\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0b95\u0b9f\u0bcd\u0b9f\u0bb3\u0bc8 \u0b86\u0ba4\u0bb0\u0bb5\u0bc1 \u0b87\u0bb2\u0bcd\u0bb2\u0bc8.",
    speakLabel: "\u0baa\u0bc7\u0b9a\u0bc1",
    listeningLabel: "\u0b95\u0bc7\u0b9f\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1..."
  },
  hi: {
    hints: {
      "/patient-home": "\u0939\u094b\u092e \u0938\u094d\u0915\u094d\u0930\u0940\u0928. \u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f, \u0921\u0949\u0915\u094d\u091f\u0930, \u0926\u0935\u093e, \u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u092f\u093e \u0932\u0915\u094d\u0937\u0923 \u092c\u094b\u0932\u0947\u0902.",
      "/appointments": "\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f \u0938\u094d\u0915\u094d\u0930\u0940\u0928. \u0939\u094b\u092e, \u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f, \u0921\u0949\u0915\u094d\u091f\u0930 \u092f\u093e \u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u092c\u094b\u0932\u0947\u0902.",
      "/symptoms": "\u0932\u0915\u094d\u0937\u0923 \u0938\u094d\u0915\u094d\u0930\u0940\u0928. \u0905\u092a\u0928\u0947 \u0932\u0915\u094d\u0937\u0923 \u092c\u094b\u0932\u093f\u090f.",
      "/consult": "\u092a\u0930\u093e\u092e\u0930\u094d\u0936 \u0938\u094d\u0915\u094d\u0930\u0940\u0928. \u0939\u094b\u092e, \u0921\u0949\u0915\u094d\u091f\u0930 \u092f\u093e \u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u092c\u094b\u0932\u0947\u0902.",
      "/chat": "\u091a\u0948\u091f \u0938\u094d\u0915\u094d\u0930\u0940\u0928. \u0939\u094b\u092e \u092f\u093e \u0921\u0949\u0915\u094d\u091f\u0930 \u092c\u094b\u0932\u0947\u0902.",
      "/pharmacy": "\u092b\u093e\u0930\u094d\u092e\u0947\u0938\u0940 \u0938\u094d\u0915\u094d\u0930\u0940\u0928. \u0926\u0935\u093e \u092f\u093e \u0939\u094b\u092e \u092c\u094b\u0932\u0947\u0902."
    },
    fallbackHint: "\u0939\u094b\u092e, \u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f, \u0921\u0949\u0915\u094d\u091f\u0930, \u0926\u0935\u093e, \u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u092f\u093e \u0932\u0915\u094d\u0937\u0923 \u092c\u094b\u0932\u0947\u0902.",
    openingPrefix: "\u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0948",
    notRecognized: "\u0915\u092e\u093e\u0902\u0921 \u0938\u092e\u091d \u0928\u0939\u0940\u0902 \u0906\u092f\u093e. \u0939\u094b\u092e, \u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f, \u0921\u0949\u0915\u094d\u091f\u0930, \u0926\u0935\u093e, \u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u092f\u093e \u0932\u0915\u094d\u0937\u0923 \u092c\u094b\u0932\u0947\u0902.",
    couldntHear: "\u092e\u0941\u091d\u0947 \u0906\u0935\u093e\u091c \u0938\u093e\u092b \u0928\u0939\u0940\u0902 \u0938\u0941\u0928\u093e\u0908 \u0926\u0940. \u0915\u0943\u092a\u092f\u093e \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902.",
    unsupported: "\u0907\u0938 \u0921\u093f\u0935\u093e\u0907\u0938 \u092e\u0947\u0902 \u0935\u0949\u0907\u0938 \u0907\u0928\u092a\u0941\u091f \u0938\u092a\u094b\u0930\u094d\u091f \u0928\u0939\u0940\u0902 \u0939\u0948.",
    speakLabel: "\u092c\u094b\u0932\u0947\u0902",
    listeningLabel: "\u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0948..."
  },
  ml: {
    hints: {
      "/patient-home": "\u0d39\u0d4b\u0d02 \u0d38\u0d4d\u0d15\u0d4d\u0d30\u0d40\u0d7b. \u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c, \u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d, \u0d05\u0d1f\u0d3f\u0d2f\u0d28\u0d4d\u0d24\u0d30\u0d02, \u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02 \u0d0e\u0d28\u0d4d\u0d28\u0d3f\u0d35 \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
      "/appointments": "\u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d \u0d38\u0d4d\u0d15\u0d4d\u0d30\u0d40\u0d7b. \u0d39\u0d4b\u0d02, \u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c, \u0d05\u0d1f\u0d3f\u0d2f\u0d28\u0d4d\u0d24\u0d30\u0d02 \u0d0e\u0d28\u0d4d\u0d28\u0d3f\u0d35 \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
      "/symptoms": "\u0d32\u0d15\u0d4d\u0d37\u0d23 \u0d38\u0d4d\u0d15\u0d4d\u0d30\u0d40\u0d7b. \u0d28\u0d3f\u0d99\u0d4d\u0d99\u0d33\u0d41\u0d1f\u0d46 \u0d32\u0d15\u0d4d\u0d37\u0d23\u0d19\u0d4d\u0d19\u0d7e \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
      "/consult": "\u0d15\u0d7a\u0d38\u0d7d\u0d1f\u0d4d\u0d1f\u0d47\u0d37\u0d7b \u0d38\u0d4d\u0d15\u0d4d\u0d30\u0d40\u0d7b. \u0d39\u0d4b\u0d02, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d05\u0d1f\u0d3f\u0d2f\u0d28\u0d4d\u0d24\u0d30\u0d02 \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
      "/chat": "\u0d1a\u0d3e\u0d31\u0d4d\u0d31\u0d4d \u0d38\u0d4d\u0d15\u0d4d\u0d30\u0d40\u0d7b. \u0d39\u0d4b\u0d02 \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
      "/pharmacy": "\u0d2b\u0d3e\u0d7c\u0d2e\u0d38\u0d3f \u0d38\u0d4d\u0d15\u0d4d\u0d30\u0d40\u0d7b. \u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d39\u0d4b\u0d02 \u0d2a\u0d31\u0d2f\u0d41\u0d15."
    },
    fallbackHint: "\u0d39\u0d4b\u0d02, \u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c, \u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d, \u0d05\u0d1f\u0d3f\u0d2f\u0d28\u0d4d\u0d24\u0d30\u0d02, \u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02 \u0d0e\u0d28\u0d4d\u0d28\u0d3f\u0d35 \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
    openingPrefix: "\u0d24\u0d41\u0d31\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d41",
    notRecognized: "\u0d15\u0d2e\u0d3e\u0d23\u0d4d\u0d21\u0d4d \u0d24\u0d3f\u0d30\u0d3f\u0d1a\u0d4d\u0d1a\u0d31\u0d3f\u0d2f\u0d3e\u0d7b \u0d15\u0d34\u0d3f\u0d9e\u0d4d\u0d9e\u0d3f\u0d32\u0d4d\u0d32. \u0d39\u0d4b\u0d02, \u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c, \u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d, \u0d05\u0d1f\u0d3f\u0d2f\u0d28\u0d4d\u0d24\u0d30\u0d02, \u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02 \u0d0e\u0d28\u0d4d\u0d28\u0d3f\u0d35 \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
    couldntHear: "\u0d15\u0d41\u0d30\u0d7d \u0d35\u0d4d\u0d2f\u0d15\u0d4d\u0d24\u0d2e\u0d3e\u0d2f\u0d3f \u0d15\u0d47\u0d7e\u0d15\u0d4d\u0d15\u0d3e\u0d7b \u0d15\u0d34\u0d3f\u0d9e\u0d4d\u0d9e\u0d3f\u0d32\u0d4d\u0d32. \u0d26\u0d2f\u0d35\u0d3e\u0d2f\u0d3f \u0d35\u0d40\u0d23\u0d4d\u0d1f\u0d41\u0d02 \u0d36\u0d4d\u0d30\u0d2e\u0d3f\u0d15\u0d4d\u0d15\u0d41\u0d15.",
    unsupported: "\u0d08 \u0d21\u0d3f\u0d35\u0d48\u0d38\u0d3f\u0d7d \u0d35\u0d4b\u0d2f\u0d4d\u0d38\u0d4d \u0d07\u0d7b\u0d2a\u0d41\u0d1f\u0d4d \u0d2a\u0d3f\u0d28\u0d4d\u0d24\u0d41\u0d23\u0d2f\u0d4d\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d3f\u0d32\u0d4d\u0d32.",
    speakLabel: "\u0d2a\u0d31\u0d2f\u0d41\u0d15",
    listeningLabel: "\u0d15\u0d47\u0d7e\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d41..."
  }
};

const COMMANDS_BY_LANG = {
  en: {
    appointments: ["book", "bok", "appoint", "appointment", "appointent", "token"],
    consult: ["doctor", "talk", "consult", "consultation"],
    pharmacy: ["medicine", "medicines", "pharmacy"],
    symptoms: ["symptom", "symptoms"],
    emergency: ["emergency", "urgent", "help", "sos"],
    home: ["home", "main"]
  },
  ta: {
    appointments: ["\u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd", "\u0ba8\u0bbf\u0baf\u0bae\u0ba9\u0bae\u0bcd", "\u0b9f\u0bcb\u0b95\u0bcd\u0b95\u0ba9\u0bcd", "\u0baa\u0bc1\u0b95\u0bcd", "\u0baa\u0ba4\u0bbf\u0bb5\u0bc1"],
    consult: ["\u0b9f\u0bbe\u0b95\u0bcd\u0b9f\u0bb0\u0bcd", "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd", "\u0b86\u0bb2\u0bcb\u0b9a\u0ba9\u0bc8", "\u0b95\u0ba9\u0bcd\u0b9a\u0bb2\u0bcd\u0b9f\u0bcd", "\u0baa\u0bc7\u0b9a"],
    pharmacy: ["\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1", "\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0b95\u0bae\u0bcd", "\u0baa\u0bbe\u0bb0\u0bcd\u0bae\u0b9a\u0bbf"],
    symptoms: ["\u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf", "\u0b9a\u0bbf\u0bae\u0bcd\u0baa\u0bcd\u0b9f\u0bae\u0bcd", "\u0b95\u0bbe\u0baf\u0bcd\u0b9a\u0bcd\u0b9a\u0bb2\u0bcd", "\u0b87\u0bb0\u0bc1\u0bae\u0bb2\u0bcd"],
    emergency: ["\u0b85\u0bb5\u0b9a\u0bb0\u0bae\u0bcd", "\u0b8e\u0bae\u0bb0\u0bcd\u0b9c\u0bc6\u0ba9\u0bcd\u0b9a\u0bbf", "\u0b89\u0ba4\u0bb5\u0bbf", "sos"],
    home: ["\u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1", "\u0bb9\u0bcb\u0bae\u0bcd", "\u0bb5\u0bc0\u0b9f\u0bc1"]
  },
  hi: {
    appointments: ["\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f", "\u0928\u093f\u092f\u0941\u0915\u094d\u0924\u093f", "\u092c\u0941\u0915", "\u091f\u094b\u0915\u0928"],
    consult: ["\u0921\u0949\u0915\u094d\u091f\u0930", "\u092a\u0930\u093e\u092e\u0930\u094d\u0936", "\u0938\u0932\u093e\u0939"],
    pharmacy: ["\u0926\u0935\u093e", "\u092e\u0947\u0921\u093f\u0938\u093f\u0928", "\u092b\u093e\u0930\u094d\u092e\u0947\u0938\u0940"],
    symptoms: ["\u0932\u0915\u094d\u0937\u0923", "\u0938\u093f\u0902\u092a\u094d\u091f\u092e"],
    emergency: ["\u0906\u092a\u093e\u0924\u0915\u093e\u0932", "\u0907\u092e\u0930\u091c\u0947\u0902\u0938\u0940", "\u092e\u0926\u0926"],
    home: ["\u0939\u094b\u092e", "\u0918\u0930", "\u092e\u0941\u0916\u094d\u092f"]
  },
  ml: {
    appointments: ["\u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d", "\u0d2c\u0d41\u0d15\u0d4d", "\u0d1f\u0d4b\u0d15\u0d4d\u0d15\u0d7a"],
    consult: ["\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c", "\u0d15\u0d7a\u0d38\u0d7d\u0d1f\u0d4d\u0d1f\u0d47\u0d37\u0d7b", "\u0d06\u0d32\u0d4b\u0d1a\u0d28"],
    pharmacy: ["\u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d", "\u0d2b\u0d3e\u0d7c\u0d2e\u0d38\u0d3f"],
    symptoms: ["\u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02"],
    emergency: ["\u0d05\u0d1f\u0d3f\u0d2f\u0d28\u0d4d\u0d24\u0d30\u0d02", "\u0d0e\u0d2e\u0d7c\u0d1c\u0d7b\u0d38\u0d3f", "\u0d38\u0d39\u0d3e\u0d2f\u0d02"],
    home: ["\u0d39\u0d4b\u0d02", "\u0d35\u0d40\u0d1f\u0d4d", "\u0d2e\u0d41\u0d16\u0d2a\u0d4d\u0d2a\u0d41"]
  }
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[.,!?;:/\\|()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PatientVoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const lang = String(i18n.language || "en").toLowerCase();
  const activeLang = ["ta", "hi", "ml", "en"].includes(lang) ? lang : "en";
  const langCode = useMemo(() => getSpeechLang(i18n.language), [i18n.language]);
  const localized = useMemo(() => UI_BY_LANG[activeLang] || UI_BY_LANG.en, [activeLang]);
  const words = useMemo(() => COMMANDS_BY_LANG[activeLang] || COMMANDS_BY_LANG.en, [activeLang]);

  const commandRoutes = useMemo(
    () => [
      { route: "/appointments", words: words.appointments },
      { route: "/consult", words: words.consult },
      { route: "/pharmacy", words: words.pharmacy },
      { route: "/symptoms", words: words.symptoms },
      { route: "/consult", words: words.emergency },
      { route: "/patient-home", words: words.home }
    ],
    [words]
  );

  function routeFromSpeech(rawText) {
    const text = normalize(rawText);
    if (!text) return "";
    for (const cmd of commandRoutes) {
      for (const phrase of cmd.words) {
        const key = normalize(phrase);
        if (key && text.includes(key)) return cmd.route;
      }
    }
    return "";
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speakText(localized.unsupported, i18n.language);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      const nextRoute = routeFromSpeech(transcript);
      if (nextRoute) {
        speakText(`${localized.openingPrefix} ${nextRoute.replace("/", "").replace("-", " ")}`, i18n.language);
        navigate(nextRoute);
      } else {
        speakText(localized.notRecognized, i18n.language);
      }
    };

    recognition.onerror = () => {
      speakText(localized.couldntHear, i18n.language);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  function onSpeakClick() {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const hint = localized.hints[location.pathname] || localized.fallbackHint;
    speakText(hint, i18n.language);
    startListening();
  }

  return (
    <button type="button" onClick={onSpeakClick} style={fabButton}>
      {isListening ? localized.listeningLabel : localized.speakLabel}
    </button>
  );
}

const fabButton = {
  position: "fixed",
  right: 16,
  bottom: 16,
  zIndex: 1200,
  minWidth: 120,
  minHeight: 64,
  border: "none",
  borderRadius: 999,
  background: "#0f766e",
  color: "#ffffff",
  fontSize: 24,
  fontWeight: 700,
  boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
  cursor: "pointer"
};
```

---

## File: `src\components\SpeakableText.js`
```js
import React from "react";
import { useTranslation } from "react-i18next";
import { speakText } from "../utils/speech";

export default function SpeakableText({
  text,
  as = "span",
  style,
  wrapperStyle,
  buttonStyle
}) {
  const { i18n, t } = useTranslation();
  const Tag = as;
  const role = sessionStorage.getItem("role");

  return (
    <span style={{ ...wrap, ...wrapperStyle }}>
      <Tag style={style}>{text}</Tag>
      {role === "patient" && (
        <button
          type="button"
          onClick={() => speakText(text, i18n.language)}
          aria-label={t("read_aloud")}
          style={{ ...iconBtn, ...buttonStyle }}
        >
          ðŸ”Š
        </button>
      )}
    </span>
  );
}

const wrap = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8
};

const iconBtn = {
  border: "1px solid #c7d4dc",
  borderRadius: 999,
  background: "#ffffff",
  cursor: "pointer",
  width: 30,
  height: 30,
  fontSize: 14,
  lineHeight: 1
};
```

---

## File: `src\components\VoiceNavigator.js`
```js
import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSpeechLang, speakText } from "../utils/speech";

const UI_COPY = {
  en: {
    buttonIdle: "Speak Nav",
    buttonBusy: "Listening...",
    unsupported: "Voice navigation is not supported on this device.",
    notRecognized:
      "I could not match that page. Try saying home, appointments, symptoms, doctors, profile, analytics, pharmacy, chat, or consultation.",
    couldntHear: "I could not hear clearly. Please try again.",
    openingPrefix: "Opening",
    pagePrefix: "Voice navigation"
  },
  hi: {
    buttonIdle: "\u092c\u094b\u0932\u0915\u0930 \u0916\u094b\u0932\u0947\u0902",
    buttonBusy: "\u0938\u0941\u0928 \u0930\u0939\u093e \u0939\u0948...",
    unsupported:
      "\u0907\u0938 \u0921\u093f\u0935\u093e\u0907\u0938 \u092a\u0930 \u0935\u0949\u0907\u0938 \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928 \u0938\u092a\u094b\u0930\u094d\u091f \u0928\u0939\u0940\u0902 \u0939\u0948.",
    notRecognized:
      "\u092e\u0948\u0902 \u0909\u0938 \u092a\u0947\u091c \u0915\u094b \u092a\u0939\u091a\u093e\u0928 \u0928\u0939\u0940\u0902 \u092a\u093e\u092f\u093e. \u0939\u094b\u092e, \u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f, \u0932\u0915\u094d\u0937\u0923, \u0921\u0949\u0915\u094d\u091f\u0930, \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932, \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938, \u092b\u093e\u0930\u094d\u092e\u0947\u0938\u0940, \u091a\u0948\u091f \u092f\u093e \u0915\u0902\u0938\u0932\u094d\u091f\u0947\u0936\u0928 \u092c\u094b\u0932\u0947\u0902.",
    couldntHear:
      "\u092e\u0941\u091d\u0947 \u0906\u0935\u093e\u091c \u0938\u093e\u092b \u0928\u0939\u0940\u0902 \u0938\u0941\u0928\u093e\u0908 \u0926\u0940. \u0915\u0943\u092a\u092f\u093e \u092b\u093f\u0930 \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902.",
    openingPrefix: "\u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0948",
    pagePrefix: "\u0935\u0949\u0907\u0938 \u0928\u0947\u0935\u093f\u0917\u0947\u0936\u0928"
  },
  ta: {
    buttonIdle: "\u0baa\u0bc7\u0b9a\u0bbf \u0ba4\u0bbf\u0bb1",
    buttonBusy: "\u0b95\u0bc7\u0b9f\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1...",
    unsupported:
      "\u0b87\u0ba8\u0bcd\u0ba4 \u0b9a\u0bbe\u0ba4\u0ba9\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba8\u0bc7\u0bb5\u0bbf\u0b95\u0bc7\u0b9a\u0ba9\u0bcd \u0b86\u0ba4\u0bb0\u0bb5\u0bc1 \u0b87\u0bb2\u0bcd\u0bb2\u0bc8.",
    notRecognized:
      "\u0b85\u0ba8\u0bcd\u0ba4 \u0baa\u0b95\u0bcd\u0b95\u0ba4\u0bcd\u0ba4\u0bc8 \u0b95\u0ba3\u0bcd\u0b9f\u0bb1\u0bbf\u0baf \u0bae\u0bc1\u0b9f\u0bbf\u0baf\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1, \u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd, \u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf, \u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd, \u0b9a\u0bc1\u0baf\u0bb5\u0bbf\u0bb5\u0bb0\u0bae\u0bcd, \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1, \u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0b95\u0bae\u0bcd, \u0b9a\u0bbe\u0b9f\u0bcd \u0b85\u0bb2\u0bcd\u0bb2\u0ba4\u0bc1 \u0b86\u0bb2\u0bcb\u0b9a\u0ba9\u0bc8 \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1 \u0b9a\u0bca\u0bb2\u0bcd\u0bb2\u0bc1\u0b99\u0bcd\u0b95\u0bb3\u0bcd.",
    couldntHear:
      "\u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba4\u0bc6\u0bb3\u0bbf\u0bb5\u0bbe\u0b95 \u0b95\u0bc7\u0b9f\u0bcd\u0b95\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8. \u0bae\u0bc0\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd \u0bae\u0bc1\u0baf\u0bb1\u0bcd\u0b9a\u0bbf\u0b95\u0bcd\u0b95\u0bb5\u0bc1\u0bae\u0bcd.",
    openingPrefix: "\u0ba4\u0bbf\u0bb1\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1",
    pagePrefix: "\u0b95\u0bc1\u0bb0\u0bb2\u0bcd \u0ba8\u0bc7\u0bb5\u0bbf\u0b95\u0bc7\u0b9a\u0ba9\u0bcd"
  },
  ml: {
    buttonIdle: "\u0d2a\u0d31\u0d1e\u0d4d\u0d1e\u0d4d \u0d24\u0d41\u0d31\u0d15\u0d4d\u0d15\u0d41\u0d15",
    buttonBusy: "\u0d15\u0d47\u0d7e\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d41...",
    unsupported:
      "\u0d08 \u0d21\u0d3f\u0d35\u0d48\u0d38\u0d3f\u0d7d \u0d35\u0d4b\u0d2f\u0d4d\u0d38\u0d4d \u0d28\u0d3e\u0d35\u0d3f\u0d17\u0d47\u0d37\u0d7b \u0d2a\u0d3f\u0d28\u0d4d\u0d24\u0d41\u0d23\u0d2f\u0d4d\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d3f\u0d32\u0d4d\u0d32.",
    notRecognized:
      "\u0d06 \u0d2a\u0d47\u0d1c\u0d4d \u0d24\u0d3f\u0d30\u0d3f\u0d1a\u0d4d\u0d1a\u0d31\u0d3f\u0d2f\u0d3e\u0d7b \u0d15\u0d34\u0d3f\u0d9e\u0d4d\u0d9e\u0d3f\u0d32\u0d4d\u0d32. \u0d39\u0d4b\u0d02, \u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d, \u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02, \u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c, \u0d2a\u0d4d\u0d30\u0d4a\u0d2b\u0d48\u0d7d, \u0d05\u0d28\u0d3e\u0d32\u0d3f\u0d31\u0d3f\u0d15\u0d4d\u0d38\u0d4d, \u0d2b\u0d3e\u0d7c\u0d2e\u0d38\u0d3f, \u0d1a\u0d3e\u0d31\u0d4d\u0d31\u0d4d \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d15\u0d7a\u0d7b\u0d38\u0d7d\u0d1f\u0d4d\u0d1f\u0d47\u0d37\u0d7b \u0d2a\u0d31\u0d2f\u0d41\u0d15.",
    couldntHear:
      "\u0d15\u0d41\u0d30\u0d7d \u0d35\u0d4d\u0d2f\u0d15\u0d4d\u0d24\u0d2e\u0d3e\u0d2f\u0d3f \u0d15\u0d47\u0d7e\u0d15\u0d4d\u0d15\u0d3e\u0d7b \u0d15\u0d34\u0d3f\u0d9e\u0d4d\u0d9e\u0d3f\u0d32\u0d4d\u0d32. \u0d26\u0d2f\u0d35\u0d3e\u0d2f\u0d3f \u0d35\u0d40\u0d23\u0d4d\u0d1f\u0d41\u0d02 \u0d36\u0d4d\u0d30\u0d2e\u0d3f\u0d15\u0d4d\u0d15\u0d41\u0d15.",
    openingPrefix: "\u0d24\u0d41\u0d31\u0d15\u0d4d\u0d15\u0d41\u0d28\u0d4d\u0d28\u0d41",
    pagePrefix: "\u0d35\u0d4b\u0d2f\u0d4d\u0d38\u0d4d \u0d28\u0d3e\u0d35\u0d3f\u0d17\u0d47\u0d37\u0d7b"
  }
};

const BASE_ALIASES = {
  "/patient-home": [
    "home",
    "dashboard",
    "\u0939\u094b\u092e",
    "\u0918\u0930",
    "\u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1",
    "\u0bb5\u0bc0\u0b9f\u0bc1",
    "\u0d39\u0d4b\u0d02",
    "\u0d35\u0d40\u0d1f\u0d4d"
  ],
  "/doctor-home": [
    "doctor home",
    "doctor dashboard",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u0939\u094b\u092e",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0b9f\u0bbe\u0bb7\u0bcd\u0baa\u0bcb\u0bb0\u0bcd\u0b9f\u0bc1",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d39\u0d4b\u0d02",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d21\u0d3e\u0d37\u0d4d\u0d2c\u0d4b\u0d7c\u0d21\u0d4d"
  ],
  "/admin-home": [
    "admin home",
    "admin dashboard",
    "\u090f\u0921\u092e\u093f\u0928 \u0939\u094b\u092e",
    "\u090f\u0921\u092e\u093f\u0928 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
    "\u0ba8\u0bbf\u0bb0\u0bcd\u0bb5\u0bbe\u0b95 \u0bae\u0bc1\u0b95\u0baa\u0bcd\u0baa\u0bc1",
    "\u0ba8\u0bbf\u0bb0\u0bcd\u0bb5\u0bbe\u0b95 \u0b9f\u0bbe\u0bb7\u0bcd\u0baa\u0bcb\u0bb0\u0bcd\u0b9f\u0bc1",
    "\u0d05\u0d21\u0d4d\u0d2e\u0d3f\u0d7b \u0d39\u0d4b\u0d02",
    "\u0d05\u0d21\u0d4d\u0d2e\u0d3f\u0d7b \u0d21\u0d3e\u0d37\u0d4d\u0d2c\u0d4b\u0d7c\u0d21\u0d4d"
  ],
  "/appointments": [
    "appointment",
    "appointments",
    "book appointment",
    "token",
    "queue",
    "\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f",
    "\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f\u094d\u0938",
    "\u091f\u094b\u0915\u0928",
    "\u0b85\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bbf\u0ba9\u0bcd\u0bae\u0bc6\u0ba3\u0bcd\u0b9f\u0bcd",
    "\u0ba8\u0bbf\u0baf\u0bae\u0ba9\u0bae\u0bcd",
    "\u0b9f\u0bcb\u0b95\u0bcd\u0b95\u0ba9\u0bcd",
    "\u0d05\u0d2a\u0d4d\u0d2a\u0d4b\u0d2f\u0d3f\u0d7b\u0d1f\u0d4d\u0d2e\u0d46\u0d28\u0d4d\u0d31\u0d4d",
    "\u0d1f\u0d4b\u0d15\u0d4d\u0d15\u0d7a\u0d7b"
  ],
  "/symptoms": [
    "symptom",
    "symptoms",
    "checker",
    "\u0932\u0915\u094d\u0937\u0923",
    "\u0938\u093f\u0902\u092a\u094d\u091f\u092e",
    "\u0b85\u0bb1\u0bbf\u0b95\u0bc1\u0bb1\u0bbf",
    "\u0b9a\u0bbf\u0bae\u0bcd\u0baa\u0bcd\u0b9f\u0bae\u0bcd",
    "\u0d32\u0d15\u0d4d\u0d37\u0d23\u0d02"
  ],
  "/doctor-availability": [
    "doctor",
    "doctors",
    "doctor availability",
    "availability",
    "\u0921\u0949\u0915\u094d\u091f\u0930",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u0909\u092a\u0932\u092c\u094d\u0927\u0924\u093e",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0b95\u0bbf\u0b9f\u0bc8\u0baa\u0bcd\u0baa\u0bc1",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d32\u0d2d\u0d4d\u0d2f\u0d24"
  ],
  "/profile": [
    "profile",
    "my profile",
    "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
    "\u0b9a\u0bc1\u0baf\u0bb5\u0bbf\u0bb5\u0bb0\u0bae\u0bcd",
    "\u0d2a\u0d4d\u0d30\u0d4a\u0d2b\u0d48\u0d7d"
  ],
  "/pharmacy": [
    "pharmacy",
    "medicine",
    "medicines",
    "\u092b\u093e\u0930\u094d\u092e\u0947\u0938\u0940",
    "\u0926\u0935\u093e",
    "\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0b95\u0bae\u0bcd",
    "\u0bae\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1",
    "\u0d2b\u0d3e\u0d7c\u0d2e\u0d38\u0d3f",
    "\u0d2e\u0d30\u0d41\u0d28\u0d4d\u0d28\u0d4d"
  ],
  "/consult": [
    "consult",
    "consultation",
    "video call",
    "call doctor",
    "\u0915\u0902\u0938\u0932\u094d\u091f\u0947\u0936\u0928",
    "\u092a\u0930\u093e\u092e\u0930\u094d\u0936",
    "\u0935\u0940\u0921\u093f\u092f\u094b \u0915\u0949\u0932",
    "\u0b86\u0bb2\u0bcb\u0b9a\u0ba9\u0bc8",
    "\u0bb5\u0bc0\u0b9f\u0bbf\u0baf\u0bcb \u0b95\u0bbe\u0bb2\u0bcd",
    "\u0d15\u0d7a\u0d7b\u0d38\u0d7d\u0d1f\u0d4d\u0d1f\u0d47\u0d37\u0d7b",
    "\u0d35\u0d40\u0d21\u0d3f\u0d2f\u0d4b \u0d15\u0d4b\u0d7e"
  ],
  "/chat": [
    "chat",
    "text consultation",
    "message",
    "\u091a\u0948\u091f",
    "\u0938\u0902\u0926\u0947\u0936",
    "\u0b9a\u0bbe\u0b9f\u0bcd",
    "\u0b9a\u0bc6\u0baf\u0bcd\u0ba4\u0bbf",
    "\u0d1a\u0d3e\u0d31\u0d4d\u0d31\u0d4d",
    "\u0d38\u0d28\u0d4d\u0d26\u0d47\u0d36\u0d02"
  ],
  "/doctor/add-patient": [
    "add patient",
    "new patient",
    "\u092e\u0930\u0940\u091c \u091c\u094b\u0921\u093c\u0947\u0902",
    "\u0928\u092f\u093e \u092e\u0930\u0940\u091c",
    "\u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bbf\u0baf\u0bc8 \u0b9a\u0bc7\u0bb0\u0bcd\u0b95\u0bcd\u0b95",
    "\u0baa\u0bc1\u0ba4\u0bbf\u0baf \u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bbf",
    "\u0d30\u0d4b\u0d17\u0d3f\u0d2f\u0d46 \u0d1a\u0d47\u0d7c\u0d15\u0d4d\u0d15\u0d41\u0d15",
    "\u0d2a\u0d41\u0d24\u0d3f\u0d2f \u0d30\u0d4b\u0d17\u0d3f"
  ],
  "/doctor/patients": [
    "patients",
    "patient list",
    "patient records",
    "users",
    "\u092e\u0930\u0940\u091c",
    "\u092e\u0930\u0940\u091c \u0938\u0942\u091a\u0940",
    "\u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e",
    "\u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bb0\u0bcd",
    "\u0ba8\u0bcb\u0baf\u0bbe\u0bb3\u0bb0\u0bcd \u0baa\u0b9f\u0bcd\u0b9f\u0bbf\u0baf\u0bb2\u0bcd",
    "\u0baa\u0baf\u0ba9\u0bb0\u0bcd\u0b95\u0bb3\u0bcd",
    "\u0d30\u0d4b\u0d17\u0d3f",
    "\u0d30\u0d4b\u0d17\u0d3f \u0d2a\u0d1f\u0d4d\u0d1f\u0d3f\u0d15",
    "\u0d09\u0d2a\u0d2f\u0d4b\u0d15\u0d4d\u0d24\u0d3e\u0d15\u0d4d\u0d15\u0d7e"
  ],
  "/doctor-analytics": [
    "doctor analytics",
    "analytics",
    "reports",
    "\u0921\u0949\u0915\u094d\u091f\u0930 \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
    "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923",
    "\u0bae\u0bb0\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bb5\u0bb0\u0bcd \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0d21\u0d4b\u0d15\u0d4d\u0d1f\u0d7c \u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02",
    "\u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02"
  ],
  "/admin-analytics": [
    "admin analytics",
    "platform analytics",
    "analytics",
    "reports",
    "\u090f\u0921\u092e\u093f\u0928 \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
    "\u0935\u093f\u0936\u094d\u0932\u0947\u0937\u0923",
    "\u0ba8\u0bbf\u0bb0\u0bcd\u0bb5\u0bbe\u0b95 \u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0baa\u0b95\u0bc1\u0baa\u0bcd\u0baa\u0bbe\u0baf\u0bcd\u0bb5\u0bc1",
    "\u0d05\u0d21\u0d4d\u0d2e\u0d3f\u0d7b \u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02",
    "\u0d35\u0d3f\u0d36\u0d15\u0d32\u0d28\u0d02"
  ]
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getHomeRoute(role) {
  if (role === "doctor") return "/doctor-home";
  if (role === "admin") return "/admin-home";
  if (role === "pharmacy") return "/pharmacy";
  return "/patient-home";
}

function getPageName(path, role) {
  const names = {
    "/patient-home": "home",
    "/doctor-home": "doctor home",
    "/admin-home": "admin home",
    "/appointments": "appointments",
    "/symptoms": "symptoms",
    "/doctor-availability": "doctor availability",
    "/profile": "profile",
    "/pharmacy": "pharmacy",
    "/consult": "consultation",
    "/chat": "chat",
    "/doctor/add-patient": "add patient",
    "/doctor/patients": "patient records",
    "/doctor-analytics": "doctor analytics",
    "/admin-analytics": "admin analytics"
  };

  if (path === "/patient-home" || path === "/doctor-home" || path === "/admin-home") {
    return names[getHomeRoute(role)];
  }

  return names[path] || "page";
}

export default function VoiceNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const role = sessionStorage.getItem("role");
  const activeLang = ["en", "hi", "ta", "ml"].includes(i18n.language)
    ? i18n.language
    : String(i18n.language || "en").split("-")[0].toLowerCase();
  const copy = UI_COPY[activeLang] || UI_COPY.en;

  const routes = useMemo(() => {
    const homeRoute = getHomeRoute(role);
    const commonEntries = [
      {
        route: homeRoute,
        aliases: [
          t("nav.home"),
          t("nav.dashboard"),
          ...(BASE_ALIASES[homeRoute] || [])
        ]
      },
      {
        route: "/appointments",
        aliases: [t("nav.appointments"), t("appointments_page_title"), ...(BASE_ALIASES["/appointments"] || [])]
      },
      {
        route: "/symptoms",
        aliases: [t("nav.symptoms"), t("symptom_checker_title"), ...(BASE_ALIASES["/symptoms"] || [])]
      },
      {
        route: "/doctor-availability",
        aliases: [t("nav.doctors"), t("doctor_availability_title"), ...(BASE_ALIASES["/doctor-availability"] || [])]
      },
      {
        route: "/profile",
        aliases: [t("nav.profile"), t("profile_title"), ...(BASE_ALIASES["/profile"] || [])]
      },
      {
        route: "/pharmacy",
        aliases: [t("nav.pharmacy"), t("pharmacy_title"), ...(BASE_ALIASES["/pharmacy"] || [])]
      },
      {
        route: "/consult",
        aliases: [t("nav.consultation"), t("consultation_title"), t("video_call_title"), ...(BASE_ALIASES["/consult"] || [])]
      },
      {
        route: "/chat",
        aliases: [t("chat_title"), ...(BASE_ALIASES["/chat"] || [])]
      },
      {
        route: "/doctor/add-patient",
        aliases: [t("add_patient_title"), ...(BASE_ALIASES["/doctor/add-patient"] || [])]
      },
      {
        route: "/doctor/patients",
        aliases: [t("doctor_patients_title"), t("view_patients_title"), t("nav.users"), ...(BASE_ALIASES["/doctor/patients"] || [])]
      },
      {
        route: "/doctor-analytics",
        aliases: [t("doctor_analytics_title"), t("nav.analytics"), ...(BASE_ALIASES["/doctor-analytics"] || [])]
      },
      {
        route: "/admin-analytics",
        aliases: [t("admin_analytics_title"), t("nav.analytics"), ...(BASE_ALIASES["/admin-analytics"] || [])]
      }
    ];

    const routesByRole = {
      patient: [
        homeRoute,
        "/appointments",
        "/symptoms",
        "/doctor-availability",
        "/profile",
        "/pharmacy",
        "/consult",
        "/chat"
      ],
      doctor: [
        homeRoute,
        "/appointments",
        "/pharmacy",
        "/consult",
        "/chat",
        "/doctor/add-patient",
        "/doctor/patients",
        "/doctor-analytics"
      ],
      admin: [homeRoute, "/admin-analytics", "/appointments", "/doctor/patients", "/pharmacy"],
      pharmacy: [homeRoute]
    };

    const allowedRoutes = routesByRole[role] || routesByRole.patient;

    return commonEntries
      .filter((entry) => allowedRoutes.includes(entry.route))
      .map((entry) => ({
      route: entry.route,
      aliases: Array.from(
        new Set(
          entry.aliases
            .map(normalize)
            .filter(Boolean)
        )
      ).sort((a, b) => b.length - a.length)
      }));
  }, [role, t]);

  const availableCommands = useMemo(
    () =>
      routes
        .filter((entry) => entry.route !== location.pathname)
        .flatMap((entry) => entry.aliases.map((alias) => ({ route: entry.route, alias })))
        .sort((a, b) => b.alias.length - a.alias.length),
    [location.pathname, routes]
  );

  function findRoute(rawText) {
    const text = normalize(rawText);
    if (!text) return "";

    for (const command of availableCommands) {
      if (text.includes(command.alias)) {
        return command.route;
      }
    }

    return "";
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speakText(copy.unsupported, i18n.language);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang(i18n.language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcripts = Array.from(event?.results?.[0] || []).map(
        (result) => result.transcript || ""
      );

      const nextRoute = transcripts.map(findRoute).find(Boolean);
      if (nextRoute) {
        speakText(
          `${copy.openingPrefix} ${getPageName(nextRoute, role)}`,
          i18n.language
        );
        navigate(nextRoute);
        return;
      }

      speakText(copy.notRecognized, i18n.language);
    };

    recognition.onerror = () => {
      speakText(copy.couldntHear, i18n.language);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.start();
  }

  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (isListening) {
          stopListening();
          return;
        }

        startListening();
      }}
      style={fabButton}
      aria-label={copy.pagePrefix}
      title={copy.pagePrefix}
    >
      {isListening ? copy.buttonBusy : copy.buttonIdle}
    </button>
  );
}

const fabButton = {
  position: "fixed",
  right: 16,
  bottom: 16,
  zIndex: 1200,
  minWidth: 128,
  minHeight: 58,
  border: "none",
  borderRadius: 999,
  background: "linear-gradient(135deg, #0f766e, #155e75)",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 700,
  boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
  cursor: "pointer",
  padding: "12px 18px"
};
```

---

## File: `src\pages\Appointments.js`
```js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SpeakableText from "../components/SpeakableText";
import { getSpeechLang } from "../utils/speech";
import { translateChatTextWithMeta } from "../services/translationService";
import {
  createAppointmentCloud,
  getAllAppointmentsCloud,
  getAppointmentsForDoctorCloud,
  getAppointmentsForPatientCloud,
  updateAppointmentCloud
} from "../services/cloudData";
import {
  createAppointment,
  deleteAppointmentById,
  getAllDoctors,
  getAllAppointments,
  getAppointmentsForDoctor,
  getAppointmentsForPatient,
  updateAppointmentById
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";

const DEFAULT_DOCTORS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    specialty: "General Medicine",
    email: "doctor@gmail.com"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    specialty: "Dermatology",
    email: "anjali@gmail.com"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    specialty: "Pediatrics",
    email: "arun@gmail.com"
  }
];
const AVG_CONSULT_MINUTES = 12;

function mergeDoctorLists(base, extra) {
  const map = new Map();
  (base || []).forEach((doc) => {
    const key = doc.email || doc.id;
    if (key) map.set(String(key), doc);
  });
  (extra || []).forEach((doc) => {
    const key = doc.email || doc.id;
    if (!key) return;
    const existing = map.get(String(key));
    map.set(String(key), { ...existing, ...doc });
  });
  return Array.from(map.values());
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const aMs = Number(a?.createdAt || 0);
    const bMs = Number(b?.createdAt || 0);
    return bMs - aMs;
  });
}

function sortQueueBySchedule(items) {
  return [...items].sort((a, b) => {
    const aSlot = new Date(`${a?.date || ""}T${a?.time || "00:00"}`).getTime();
    const bSlot = new Date(`${b?.date || ""}T${b?.time || "00:00"}`).getTime();

    const aValid = Number.isFinite(aSlot);
    const bValid = Number.isFinite(bSlot);
    if (aValid && bValid && aSlot !== bSlot) return aSlot - bSlot;
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;

    const aCreated = Number(a?.createdAt || 0);
    const bCreated = Number(b?.createdAt || 0);
    if (aCreated !== bCreated) return aCreated - bCreated;

    const aToken = Number(a?.tokenNo || 0);
    const bToken = Number(b?.tokenNo || 0);
    return aToken - bToken;
  });
}

function dedupeAppointments(items) {
  const map = new Map();
  for (const appt of items || []) {
    const cloudKey =
      appt?.cloudId !== undefined && appt?.cloudId !== null
        ? `cloud:${String(appt.cloudId)}`
        : "";
    const fallbackKey = `local:${String(appt?.patientMobile || "").trim()}|${String(
      appt?.doctorId || ""
    ).trim()}|${String(appt?.date || "").trim()}|${String(appt?.time || "").trim()}|${String(
      appt?.symptoms || ""
    ).trim()}`;
    const key = cloudKey || fallbackKey;

    const prev = map.get(key);
    if (!prev) {
      map.set(key, appt);
      continue;
    }

    const prevUpdated = Number(prev?.updatedAt || prev?.createdAt || 0);
    const nextUpdated = Number(appt?.updatedAt || appt?.createdAt || 0);
    if (nextUpdated >= prevUpdated) {
      map.set(key, appt);
    }
  }

  return [...map.values()];
}

function generateConsultCode(doctorId) {
  const short = doctorId.replace("doc_", "").slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${short}-${rand}`;
}

function sameAppointment(a, b) {
  return (
    String(a?.patientMobile || "").trim() === String(b?.patientMobile || "").trim() &&
    String(a?.doctorId || "").trim() === String(b?.doctorId || "").trim() &&
    String(a?.date || "").trim() === String(b?.date || "").trim() &&
    String(a?.time || "").trim() === String(b?.time || "").trim() &&
    String(a?.symptoms || "").trim() === String(b?.symptoms || "").trim()
  );
}

function generateTokenNo(existingAppointments, doctorId, date) {
  const active = (existingAppointments || []).filter((a) => {
    const status = String(a?.status || "").toLowerCase();
    return (
      String(a?.doctorId || "") === String(doctorId || "") &&
      String(a?.date || "") === String(date || "") &&
      status !== "cancelled" &&
      status !== "completed"
    );
  });

  // Collapse obvious duplicate rows from earlier sync bugs.
  const uniqueBySlot = new Map();
  for (const a of active) {
    const key = [
      String(a?.patientMobile || "").trim(),
      String(a?.doctorId || "").trim(),
      String(a?.date || "").trim(),
      String(a?.time || "").trim()
    ].join("|");
    if (!uniqueBySlot.has(key)) uniqueBySlot.set(key, a);
  }

  return uniqueBySlot.size + 1;
}

function getChatAppointmentId(appt) {
  return appt?.cloudId || appt?.id;
}

function isQueueActiveStatus(status) {
  const value = String(status || "").toLowerCase();
  return value !== "completed" && value !== "cancelled";
}

export default function Appointments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);
  const userLanguage =
    sessionStorage.getItem("userLanguage") ||
    localStorage.getItem("language") ||
    "en";
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);

  const activeDoctor = useMemo(() => {
    if (role !== "doctor") return null;
    const email = (user?.email || "").toLowerCase();
    return doctors.find((d) => d.email === email) || doctors[0];
  }, [role, user, doctors]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSymptomListening, setIsSymptomListening] = useState(false);
  const [translatedSymptoms, setTranslatedSymptoms] = useState({});
  const [bookForm, setBookForm] = useState({
    doctorId: DEFAULT_DOCTORS[0].id,
    date: "",
    time: "",
    symptoms: ""
  });
  const patientMobile = String(
    user?.mobile || sessionStorage.getItem("patientMobile") || ""
  ).trim();
  const patientName = String(user?.name || "Patient").trim();
  const shouldUseCloud = hasSupabase && isOnline;

  async function resolveCloudAppointmentId(appt) {
    if (!appt) return null;
    if (appt.cloudId) return appt.cloudId;
    if (!shouldUseCloud) return null;

    try {
      const cloudList = await getAllAppointmentsCloud();
      const matched = (cloudList || []).find((c) => sameAppointment(appt, c));
      if (!matched) return null;

      if (appt.id !== undefined && appt.id !== null) {
        try {
          await updateAppointmentById(appt.id, {
            cloudId: matched.id,
            syncStatus: "synced"
          });
        } catch {
          // non-fatal; resolution is still usable for chat navigation
        }
      }
      return matched.id;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      try {
        const localDoctors = await getAllDoctors();
        const merged = mergeDoctorLists(DEFAULT_DOCTORS, localDoctors);
        if (!active) return;
        setDoctors(merged);
        setBookForm((prev) => {
          if (merged.some((d) => d.id === prev.doctorId)) return prev;
          return { ...prev, doctorId: merged[0]?.id || prev.doctorId };
        });
      } catch {
        if (active) setDoctors(DEFAULT_DOCTORS);
      }
    }

    loadDoctors();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function getLocalAppointmentsForRole() {
      if (role === "patient") {
        return getAppointmentsForPatient(patientMobile, patientName);
      }
      if (role === "doctor") {
        return getAppointmentsForDoctor(activeDoctor?.id || "");
      }
      return getAllAppointments();
    }

    async function syncPendingAppointmentsToCloud() {
      if (!shouldUseCloud) return;
      const allLocal = await getAllAppointments();
      const pending = allLocal.filter(
        (a) => !a.cloudId && String(a.syncStatus || "") === "pending_create"
      );

      for (const localAppt of pending) {
        const payload = {
          patientName: localAppt.patientName,
          patientMobile: localAppt.patientMobile,
          doctorId: localAppt.doctorId,
          doctorName: localAppt.doctorName,
          doctorSpecialty: localAppt.doctorSpecialty,
          date: localAppt.date,
          time: localAppt.time,
          symptoms: localAppt.symptoms,
          tokenNo: localAppt.tokenNo,
          status: localAppt.status || "booked",
          consultType: localAppt.consultType || "",
          consultCode: localAppt.consultCode || ""
        };

        try {
          const cloudCreated = await createAppointmentCloud(payload);
          await updateAppointmentById(localAppt.id, {
            ...cloudCreated,
            cloudId: cloudCreated.id,
            syncStatus: "synced"
          });
        } catch (error) {
          console.warn("Pending appointment sync failed", error);
        }
      }

      const pendingUpdates = allLocal.filter(
        (a) =>
          (a.cloudId || a.id) &&
          String(a.syncStatus || "") === "pending_update"
      );

      for (const localAppt of pendingUpdates) {
        try {
          const updated = await updateAppointmentCloud(
            localAppt.cloudId || localAppt.id,
            {
              status: localAppt.status,
              consultType: localAppt.consultType,
              consultCode: localAppt.consultCode,
              codeSharedAt: localAppt.codeSharedAt
            }
          );
          await updateAppointmentById(localAppt.id, {
            ...updated,
            cloudId: updated.id,
            syncStatus: "synced"
          });
        } catch (error) {
          console.warn("Pending appointment update sync failed", error);
        }
      }
    }

    async function mergeCloudAppointments(cloudAppointments) {
      const localAll = await getAllAppointments();
      for (const cloudAppt of cloudAppointments) {
        const byCloudId = localAll.find(
          (a) =>
            a.cloudId !== undefined &&
            a.cloudId !== null &&
            String(a.cloudId) === String(cloudAppt.id)
        );

        if (byCloudId) {
          await updateAppointmentById(byCloudId.id, {
            ...cloudAppt,
            cloudId: cloudAppt.id,
            syncStatus: "synced"
          });
          continue;
        }

        const likelySame = localAll.find((a) => !a.cloudId && sameAppointment(a, cloudAppt));
        if (likelySame) {
          await updateAppointmentById(likelySame.id, {
            ...cloudAppt,
            cloudId: cloudAppt.id,
            syncStatus: "synced"
          });
          continue;
        }

        const { id: _cloudRowId, ...restCloud } = cloudAppt;
        await createAppointment({
          ...restCloud,
          cloudId: cloudAppt.id,
          syncStatus: "synced"
        });
      }
    }

    async function pruneDeletedCloudAppointments(cloudAppointments) {
      if (!shouldUseCloud) return;
      const cloudIds = new Set(
        (cloudAppointments || []).map((a) => String(a?.id || "")).filter(Boolean)
      );
      const localAll = await getAllAppointments();

      const toDelete = localAll.filter((a) => {
        const cloudId = a?.cloudId;
        if (cloudId === undefined || cloudId === null || String(cloudId) === "") {
          return false; // local-only rows should not be auto-removed
        }
        const syncStatus = String(a?.syncStatus || "");
        if (syncStatus && syncStatus !== "synced") {
          return false; // keep unsynced local edits
        }
        return !cloudIds.has(String(cloudId));
      });

      for (const row of toDelete) {
        await deleteAppointmentById(row.id);
      }
    }

    async function loadAppointments() {
      try {
        const localNow = await getLocalAppointmentsForRole();
        if (active) setAppointments(sortByCreatedAtDesc(dedupeAppointments(localNow)));

        if (shouldUseCloud) {
          await syncPendingAppointmentsToCloud();

          let cloudData = [];
          if (role === "patient") {
            cloudData = await getAppointmentsForPatientCloud(patientMobile, patientName);
          } else if (role === "doctor") {
            cloudData = await getAppointmentsForDoctorCloud(activeDoctor?.id || "");
          } else {
            cloudData = await getAllAppointmentsCloud();
          }

          await pruneDeletedCloudAppointments(cloudData);
          await mergeCloudAppointments(cloudData);
          const mergedLocal = await getLocalAppointmentsForRole();
          if (active) setAppointments(sortByCreatedAtDesc(dedupeAppointments(mergedLocal)));
        }
      } catch (error) {
        console.warn("Load appointments failed", error);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    loadAppointments();
    const timer = setInterval(loadAppointments, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [role, activeDoctor, patientMobile, patientName, shouldUseCloud]);

  useEffect(() => {
    let active = true;

    async function translateSymptoms() {
      if (role !== "doctor") {
        if (active) setTranslatedSymptoms({});
        return;
      }
      const targetLang = userLanguage;
      const next = {};
      for (const appt of appointments || []) {
        const raw = String(appt?.symptoms || "").trim();
        if (!raw) continue;
        const key = String(
          appt?.cloudId ??
            appt?.id ??
            `${appt?.patientMobile || ""}-${appt?.date || ""}-${appt?.time || ""}`
        );
        if (!key) continue;
        try {
          const result = await translateChatTextWithMeta(raw, targetLang);
          next[key] = result.text || raw;
        } catch {
          next[key] = raw;
        }
      }
      if (active) {
        setTranslatedSymptoms((prev) => ({ ...prev, ...next }));
      }
    }

    translateSymptoms();
    return () => {
      active = false;
    };
  }, [role, appointments, userLanguage]);

  async function bookToken(e) {
    e.preventDefault();
    const selectedDoctor = doctors.find((d) => d.id === bookForm.doctorId);
    if (!selectedDoctor) return;

    if (!bookForm.date || !bookForm.time || !bookForm.symptoms.trim()) {
      alert(t("appointments_fill_date_time_symptoms"));
      return;
    }
    if (!patientMobile) {
      alert(t("appointments_patient_mobile_missing"));
      return;
    }
    setSaving(true);
    try {
      const allLocal = await getAllAppointments();
      const tokenNo = generateTokenNo(
        allLocal,
        selectedDoctor.id,
        bookForm.date
      );

      const payload = {
        patientName,
        patientMobile,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        date: bookForm.date,
        time: bookForm.time,
        symptoms: bookForm.symptoms.trim(),
        tokenNo,
        status: "booked",
        consultType: "",
        consultCode: ""
      };

      const localId = await createAppointment({
        ...payload,
        syncStatus: "pending_create"
      });

      if (shouldUseCloud) {
        try {
          const cloudCreated = await createAppointmentCloud(payload);
          await updateAppointmentById(localId, {
            ...cloudCreated,
            cloudId: cloudCreated.id,
            syncStatus: "synced"
          });
        } catch (error) {
          await updateAppointmentById(localId, { syncStatus: "pending_create" });
          console.warn("Cloud booking failed, kept local pending.", error);
        }
      }

      setBookForm((prev) => ({ ...prev, date: "", time: "", symptoms: "" }));
      alert(
        shouldUseCloud
          ? t("appointments_token_booked_success")
          : t("appointments_token_saved_offline")
      );
    } catch (error) {
      alert(`${t("appointments_booking_failed_prefix")} ${error?.message || t("unknown_error")}`);
    } finally {
      setSaving(false);
    }
  }

  function startSymptomVoiceTyping() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("symptom_voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang(
      sessionStorage.getItem("userLanguage") ||
        localStorage.getItem("language") ||
        "en"
    );
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsSymptomListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setBookForm((prev) => ({
          ...prev,
          symptoms: `${prev.symptoms} ${transcript}`.trim()
        }));
      }
    };

    recognition.onerror = () => {
      setIsSymptomListening(false);
    };

    recognition.onend = () => {
      setIsSymptomListening(false);
    };

    recognition.start();
  }

  async function markTextConsult(appt) {
    try {
      if (!shouldUseCloud) {
        await updateAppointmentById(appt.id, {
          status: "in_consultation",
          consultType: "text",
          consultCode: "",
          syncStatus: appt.cloudId ? "pending_update" : appt.syncStatus || "pending_create"
        });
        navigate(`/chat?appointmentId=${encodeURIComponent(appt.id)}`);
        return;
      }
      const cloudAppointmentId =
        (await resolveCloudAppointmentId(appt)) || appt.cloudId || appt.id;
      if (!cloudAppointmentId) {
        alert(t("appointments_unable_start_text"));
        return;
      }
      const updates = {
        status: "in_consultation",
        consultType: "text",
        consultCode: ""
      };
      await updateAppointmentCloud(cloudAppointmentId, updates);
      navigate(`/chat?appointmentId=${encodeURIComponent(cloudAppointmentId)}`);
    } catch {
      alert(t("appointments_unable_start_text"));
    }
  }

  async function openTextConsult(appt) {
    if (!shouldUseCloud) {
      navigate(`/chat?appointmentId=${encodeURIComponent(appt.id)}`);
      return;
    }
    const cloudAppointmentId =
      (await resolveCloudAppointmentId(appt)) || appt.cloudId || appt.id;
    if (!cloudAppointmentId) {
      alert(t("appointments_unable_start_text"));
      return;
    }
    navigate(`/chat?appointmentId=${encodeURIComponent(cloudAppointmentId)}`);
  }

  async function cancelToken(appt) {
    if (String(appt?.status || "").toLowerCase() !== "booked") {
      alert("Only booked tokens can be cancelled.");
      return;
    }

    try {
      if (shouldUseCloud && (appt.cloudId || appt.id)) {
        const updated = await updateAppointmentCloud(appt.cloudId || appt.id, {
          status: "cancelled"
        });
        await updateAppointmentById(appt.id, {
          ...updated,
          cloudId: updated.id,
          syncStatus: "synced"
        });
      } else {
        await updateAppointmentById(appt.id, {
          status: "cancelled",
          syncStatus: appt.cloudId ? "pending_update" : appt.syncStatus || "pending_create"
        });
      }
    } catch {
      alert(t("appointments_booking_failed_prefix"));
    }
  }

  async function markVideoConsult(appt) {
    try {
      if (!shouldUseCloud) {
        alert(t("appointments_cloud_required_online"));
        return;
      }
      const code = generateConsultCode(appt.doctorId);
      const updates = {
        status: "in_consultation",
        consultType: "video",
        consultCode: code,
        codeSharedAt: Date.now()
      };
      await updateAppointmentCloud(appt.cloudId || appt.id, updates);
      navigate(`/consult?code=${encodeURIComponent(code)}`);
    } catch {
      alert(t("appointments_unable_start_video"));
    }
  }

  async function completeConsult(appt) {
    try {
      if (shouldUseCloud && (appt.cloudId || appt.id)) {
        const updated = await updateAppointmentCloud(appt.cloudId || appt.id, {
          status: "completed"
        });
        await updateAppointmentById(appt.id, {
          ...updated,
          cloudId: updated.id,
          syncStatus: "synced"
        });
        return;
      }

      await updateAppointmentById(appt.id, {
        status: "completed",
        syncStatus: appt.cloudId ? "pending_update" : appt.syncStatus || "pending_create"
      });
    } catch {
      alert(t("appointments_unable_mark_completed"));
    }
  }

  async function shareCode(appt) {
    try {
      if (!shouldUseCloud) {
        alert(t("appointments_cloud_required_online"));
        return;
      }

      const finalCode =
        appt.consultCode || generateConsultCode(appt.doctorId || "doc");
      const updatePayload = {
        consultType: "video",
        consultCode: finalCode,
        codeSharedAt: Date.now()
      };

      // Keep already-completed cases untouched; otherwise move to in_consultation.
      if (String(appt.status || "").toLowerCase() !== "completed") {
        updatePayload.status = "in_consultation";
      }

      await updateAppointmentCloud(appt.cloudId || appt.id, updatePayload);

      const message = `Doctor call code for ${appt.patientName}: ${finalCode}`;
      if (navigator.share) {
        await navigator.share({
          title: "Telemedicine Consultation Code",
          text: message
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(finalCode);
        alert(t("appointments_code_copied"));
      } else {
        alert(`${t("appointments_share_this_code")} ${finalCode}`);
      }
    } catch {
      alert(t("appointments_unable_share_code"));
    }
  }

  function getQueueInfoForAppointment(appt) {
    const token = Number(appt?.tokenNo || 0);
    if (!token || !appt?.doctorId || !appt?.date) return null;

    const queueForDay = (appointments || [])
      .filter(
        (item) =>
          String(item?.doctorId || "") === String(appt.doctorId || "") &&
          String(item?.date || "") === String(appt.date || "") &&
          isQueueActiveStatus(item?.status)
      )
      .sort((a, b) => Number(a?.tokenNo || 0) - Number(b?.tokenNo || 0));

    const queueActive = isQueueActiveStatus(appt?.status);
    if (!queueActive || queueForDay.length === 0) return null;

    const peopleAhead = queueForDay.filter(
      (item) => Number(item?.tokenNo || 0) < token
    ).length;
    const position = peopleAhead + 1;
    const etaMinutes = peopleAhead * AVG_CONSULT_MINUTES;

    return { position, peopleAhead, etaMinutes };
  }

  function renderPatientView() {
    return (
      <>
        {!shouldUseCloud && (
          <section style={styles.section}>
            <SpeakableText
              as="p"
              text={t("appointments_offline_mode_active")}
              style={styles.meta}
              wrapperStyle={{ display: "flex" }}
            />
          </section>
        )}
        <section style={styles.section}>
          <SpeakableText
            as="h3"
            text={t("appointments_book_title")}
            style={styles.sectionTitle}
            wrapperStyle={{ display: "flex" }}
          />
          <form onSubmit={bookToken} style={styles.formGrid}>
            <label style={styles.label}>
              {t("appointments_select_doctor")}
              <select
                value={bookForm.doctorId}
                onChange={(e) => setBookForm((p) => ({ ...p, doctorId: e.target.value }))}
                style={styles.input}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t(`doctor_${d.id.split("_")[1]}`, d.name)} - {t(`specialty_${d.specialty.toLowerCase().replace(/\s+/g, "_")}`, d.specialty)}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.label}>
              {t("appointments_date")}
              <input
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm((p) => ({ ...p, date: e.target.value }))}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              {t("appointments_time")}
              <input
                type="time"
                value={bookForm.time}
                onChange={(e) => setBookForm((p) => ({ ...p, time: e.target.value }))}
                style={styles.input}
              />
            </label>
            <label style={styles.labelFull}>
              {t("appointments_symptoms_issue")}
              <textarea
                value={bookForm.symptoms}
                onChange={(e) => setBookForm((p) => ({ ...p, symptoms: e.target.value }))}
                style={{ ...styles.input, minHeight: 90 }}
              />
              <button
                type="button"
                style={styles.voiceBtn}
                onClick={startSymptomVoiceTyping}
              >
                {isSymptomListening ? t("voice_listening") : t("symptom_speak_button")}
              </button>
            </label>
            <button style={styles.primaryBtn} disabled={saving} type="submit">
              {saving ? t("appointments_booking") : t("appointments_book_token")}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <SpeakableText
            as="h3"
            text={t("appointments_my_tokens")}
            style={styles.sectionTitle}
            wrapperStyle={{ display: "flex" }}
          />
          {loading && <p>{t("loading")}</p>}
          {!loading && appointments.length === 0 && <p>{t("appointments_none")}</p>}
          {!loading &&
            appointments.map((a) => (
              <div style={styles.card} key={a.id}>
                <strong>
                  {t("appointments_token_prefix")} #{a.tokenNo || "-"} | {t(`doctor_${a.doctorId?.split("_")[1]}`, a.doctorName)}
                </strong>
                <p style={styles.meta}>{t("appointments_date")}: {a.date} | {t("appointments_time")}: {a.time}</p>
                <p style={styles.meta}>{t("appointments_status")}: {a.status || t("appointments_booked")}</p>
                {(() => {
                  const queueInfo = getQueueInfoForAppointment(a);
                  if (!queueInfo) return null;
                  return (
                    <div style={styles.queueInfo}>
                      <p style={styles.queueText}>
                        {t("appointments_queue_position_today", "Today's Queue Position")}: #{queueInfo.position}
                      </p>
                      <p style={styles.queueText}>
                        {t("appointments_people_ahead", "People Ahead")}: {queueInfo.peopleAhead}
                      </p>
                      <p style={styles.queueText}>
                        {t("appointments_estimated_wait", "Estimated Wait")}: {queueInfo.etaMinutes} {t("minutes", "min")}
                      </p>
                    </div>
                  );
                })()}
                {a.syncStatus === "pending_create" && (
                  <p style={styles.meta}>{t("appointments_sync_pending")}</p>
                )}
                <p style={styles.meta}>{t("appointments_symptoms")}: {a.symptoms}</p>
                {a.consultType === "video" && a.consultCode && (
                  <div style={styles.actions}>
                    <span style={styles.code}>{t("appointments_code")}: {a.consultCode}</span>
                    <button
                      style={styles.secondaryBtn}
                      onClick={() => navigate(`/consult?code=${encodeURIComponent(a.consultCode)}`)}
                    >
                      {t("appointments_join_video")}
                    </button>
                  </div>
                )}
                {a.consultType === "text" && (
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => openTextConsult(a)}
                  >
                    {t("appointments_open_text_consultation")}
                  </button>
                )}
                {String(a.status || "").toLowerCase() === "booked" && (
                  <button
                    style={styles.dangerBtn}
                    onClick={() => cancelToken(a)}
                  >
                    Cancel Token
                  </button>
                )}
              </div>
            ))}
        </section>
      </>
    );
  }

  function renderDoctorView() {
    const queueTitle = `${t("appointments_patient_queue")}${activeDoctor ? ` - ${t(`doctor_${activeDoctor.id?.split("_")[1]}`, activeDoctor.name)}` : ""}`.trim();
    const notConsulted = sortQueueBySchedule(
      appointments.filter(
        (a) => String(a.status || "").toLowerCase() !== "completed"
      )
    );
    const consulted = sortQueueBySchedule(
      appointments.filter(
        (a) => String(a.status || "").toLowerCase() === "completed"
      )
    );

    const renderDoctorCard = (a) => (
      <div style={styles.card} key={a.id}>
        <strong>
          {a.patientName} ({a.patientMobile}) | {t("appointments_token_prefix")} #{a.tokenNo || "-"}
        </strong>
        <p style={styles.meta}>
          {t("appointments_time")}: {a.date} {a.time}
        </p>
        <p style={styles.meta}>
          {t("appointments_symptoms")}:{" "}
          {translatedSymptoms[
            String(
              a?.cloudId ??
                a?.id ??
                `${a?.patientMobile || ""}-${a?.date || ""}-${a?.time || ""}`
            )
          ] || a.symptoms}
        </p>
        <p style={styles.meta}>{t("appointments_status")}: {a.status || t("appointments_booked")}</p>
        <div style={styles.actions}>
          <button style={styles.secondaryBtn} onClick={() => markTextConsult(a)}>
            {t("appointments_text_consult")}
          </button>
          <button style={styles.secondaryBtn} onClick={() => markVideoConsult(a)}>
            {t("appointments_video_consult_code")}
          </button>
          <button style={styles.secondaryBtn} onClick={() => shareCode(a)}>
            {t("appointments_share_code")}
          </button>
          {String(a.status || "").toLowerCase() !== "completed" && (
            <button style={styles.dangerBtn} onClick={() => completeConsult(a)}>
              {t("appointments_mark_completed")}
            </button>
          )}
        </div>
        {a.consultType === "video" && a.consultCode && (
          <p style={styles.code}>
            {t("appointments_patient_code")}: {a.consultCode}
            {a.codeSharedAt ? ` | ${t("appointments_shared")}` : ""}
          </p>
        )}
      </div>
    );

    return (
      <section style={styles.section}>
        <SpeakableText
          as="h3"
          text={queueTitle}
          style={styles.sectionTitle}
          wrapperStyle={{ display: "flex" }}
        />
        {loading && <p>{t("loading")}</p>}
        {!loading && appointments.length === 0 && <p>{t("appointments_no_patients_queue")}</p>}
        {!loading && appointments.length > 0 && (
          <div style={styles.doctorSplit}>
            <div style={styles.doctorColumn}>
              <h4 style={styles.subHeader}>{t("appointments_not_consulted")}</h4>
              {notConsulted.length === 0 && (
                <p style={styles.doctorEmpty}>{t("appointments_no_pending_consultations")}</p>
              )}
              {notConsulted.map(renderDoctorCard)}
            </div>

            <div style={styles.doctorColumn}>
              <h4 style={styles.subHeader}>{t("appointments_consulted")}</h4>
              {consulted.length === 0 && (
                <p style={styles.doctorEmpty}>{t("appointments_no_completed_consultations")}</p>
              )}
              {consulted.map(renderDoctorCard)}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("appointments_page_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex", marginBottom: 16 }}
      />
      {role === "patient" ? renderPatientView() : renderDoctorView()}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#e0f7fa",
    padding: 24
  },
  title: {
    marginTop: 0,
    marginBottom: 16,
    color: "#0f2027"
  },
  section: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
    marginBottom: 14
  },
  sectionTitle: {
    marginTop: 0,
    color: "#203a43"
  },
  subHeader: {
    margin: "14px 0 8px",
    color: "#1f4855"
  },
  doctorSplit: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 14,
    alignItems: "start"
  },
  doctorColumn: {
    background: "#f4fbfd",
    border: "1px solid #d5e8ee",
    borderRadius: 10,
    padding: 10
  },
  doctorEmpty: {
    margin: "6px 0 10px",
    color: "#4a6570"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14
  },
  labelFull: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    gridColumn: "1 / -1"
  },
  input: {
    border: "1px solid #b9cfd6",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14
  },
  card: {
    border: "1px solid #d0e0e6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    background: "#f8fdff"
  },
  queueInfo: {
    margin: "8px 0",
    background: "#eef8f3",
    border: "1px solid #cfe5d8",
    borderRadius: 8,
    padding: "8px 10px"
  },
  queueText: {
    margin: "2px 0",
    color: "#1f4f39",
    fontSize: 13,
    fontWeight: 600
  },
  meta: {
    margin: "4px 0",
    color: "#2f4a53",
    fontSize: 14
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8
  },
  code: {
    fontWeight: 700,
    color: "#0d3f4e",
    margin: "8px 0 0"
  },
  primaryBtn: {
    border: "none",
    background: "#0d8f56",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    width: "fit-content"
  },
  voiceBtn: {
    border: "none",
    background: "#0f766e",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    width: "fit-content",
    marginTop: 8
  },
  secondaryBtn: {
    border: "none",
    background: "#2c5364",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer"
  },
  dangerBtn: {
    border: "none",
    background: "#b23a3a",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer"
  }
};
```

---

## File: `src\pages\AdminAnalytics.js`
```js
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllAppointmentsCloud,
  getAllPatientRecordsCloud,
  getPharmaciesCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import { getAllAppointments, getAllPatientRecords } from "../services/localData";

const DOCTORS = [
  { id: "doc_kumar", name: "Dr. Kumar" },
  { id: "doc_anjali", name: "Dr. Anjali" },
  { id: "doc_arun", name: "Dr. Arun" }
];

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [localAppointments, localPatients] = await Promise.all([
          getAllAppointments(),
          getAllPatientRecords()
        ]);
        if (!active) return;
        setAppointments(localAppointments);
        setPatients(localPatients);
        setPharmacies([]);

        if (hasSupabase && isOnline) {
          const [cloudAppointments, cloudPatients, cloudPharmacies] = await Promise.all([
            getAllAppointmentsCloud(),
            getAllPatientRecordsCloud(),
            getPharmaciesCloud()
          ]);
          if (!active) return;
          setAppointments(cloudAppointments);
          setPatients(cloudPatients);
          setPharmacies(cloudPharmacies);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const timer = setInterval(loadData, 6000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOnline]);

  const stats = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed").length;
    const pending = appointments.filter((a) => a.status !== "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = appointments.filter((a) => String(a.date) === today).length;
    return {
      patients: patients.length,
      appointments: appointments.length,
      completed,
      pending,
      cancelled,
      todayCount,
      doctors: DOCTORS.length,
      pharmacies: pharmacies.length
    };
  }, [appointments, patients, pharmacies]);

  const doctorLoad = useMemo(() => {
    const map = {};
    DOCTORS.forEach((doctor) => {
      map[doctor.id] = { name: doctor.name, total: 0, completed: 0 };
    });

    appointments.forEach((a) => {
      if (!map[a.doctorId]) return;
      map[a.doctorId].total += 1;
      if (a.status === "completed") map[a.doctorId].completed += 1;
    });

    return Object.values(map);
  }, [appointments]);

  const pharmacyStock = useMemo(() => {
    return pharmacies
      .map((p) => {
        const medicineMap = p?.medicines || {};
        const totalUnits = Object.values(medicineMap).reduce(
          (sum, value) => sum + Number(value || 0),
          0
        );
        return {
          id: p.id,
          name: p.name,
          medicinesCount: Object.keys(medicineMap).length,
          totalUnits
        };
      })
      .sort((a, b) => b.totalUnits - a.totalUnits);
  }, [pharmacies]);

  return (
    <div style={page}>
      <h2 style={title}>{t("admin_analytics_title")}</h2>
      <p style={subTitle}>{t("admin_analytics_subtitle")}</p>
      {!isOnline && (
        <p style={notice}>{t("admin_offline_paused")}</p>
      )}

      <div style={metrics}>
        <StatCard label={t("admin_analytics_total_patients")} value={stats.patients} />
        <StatCard label={t("admin_analytics_total_appointments")} value={stats.appointments} />
        <StatCard label={t("admin_analytics_today_appointments")} value={stats.todayCount} />
        <StatCard label={t("admin_analytics_pending_cases")} value={stats.pending} />
        <StatCard label={t("admin_analytics_completed_cases")} value={stats.completed} />
        <StatCard label={t("admin_analytics_cancelled_cases")} value={stats.cancelled} />
        <StatCard label={t("admin_analytics_total_doctors")} value={stats.doctors} />
        <StatCard label={t("admin_analytics_total_pharmacies")} value={stats.pharmacies} />
      </div>

      <section style={section}>
        <h3 style={sectionTitle}>{t("admin_analytics_doctor_workload")}</h3>
        {loading ? (
          <p>{t("loading")}</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>{t("admin_analytics_table_doctor")}</th>
                  <th style={th}>{t("admin_analytics_table_appointments")}</th>
                  <th style={th}>{t("admin_analytics_table_completed")}</th>
                  <th style={th}>{t("admin_analytics_table_completion_rate")}</th>
                </tr>
              </thead>
              <tbody>
                {doctorLoad.map((row) => {
                  const completion = row.total ? Math.round((row.completed / row.total) * 100) : 0;
                  return (
                    <tr key={row.name}>
                      <td style={td}>{row.name}</td>
                      <td style={td}>{row.total}</td>
                      <td style={td}>{row.completed}</td>
                      <td style={td}>{completion}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={section}>
        <h3 style={sectionTitle}>{t("admin_analytics_pharmacy_stock_summary")}</h3>
        {pharmacyStock.length === 0 ? (
          <p>{t("admin_analytics_no_pharmacy_stock_data")}</p>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>{t("admin_analytics_table_pharmacy")}</th>
                  <th style={th}>{t("admin_analytics_table_medicines_listed")}</th>
                  <th style={th}>{t("admin_analytics_table_total_units")}</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyStock.map((row) => (
                  <tr key={row.id}>
                    <td style={td}>{row.name}</td>
                    <td style={td}>{row.medicinesCount}</td>
                    <td style={td}>{row.totalUnits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  color: "#38545d",
  marginTop: 0,
  marginBottom: 14
};

const notice = {
  background: "#fff7e0",
  border: "1px solid #edd8a0",
  color: "#6b5408",
  borderRadius: 10,
  padding: "10px 12px"
};

const metrics = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12
};

const statCard = {
  background: "linear-gradient(145deg, #203a43, #2f6071)",
  color: "#fff",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 8px 16px rgba(0,0,0,0.18)"
};

const statValue = {
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1.1
};

const statLabel = {
  fontSize: 13,
  marginTop: 4
};

const section = {
  marginTop: 18,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
  padding: 14
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 12,
  color: "#203a43"
};

const tableWrap = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 480
};

const th = {
  textAlign: "left",
  borderBottom: "1px solid #d7e4ea",
  background: "#eef5f8",
  color: "#1f4755",
  padding: "10px 12px"
};

const td = {
  borderBottom: "1px solid #edf3f6",
  color: "#2c4a54",
  padding: "10px 12px"
};
```

---

## File: `src\pages\AddPatient.js`
```js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { addPatientRecordCloud } from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function AddPatient() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("");
  const [additionalData, setAdditionalData] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!String(name || "").trim() || !String(age || "").trim() || !String(condition || "").trim()) {
        setMsg(t("add_patient_required_fields"));
        return;
      }
      if (!hasSupabase || !navigator.onLine) {
        setMsg(t("appointments_cloud_required_online"));
        return;
      }
      await addPatientRecordCloud({
        name,
        age,
        condition,
        additionalData
      });

      setMsg(t("patient_added_success"));
      setTimeout(() => navigate("/doctor/patients"), 1000);
    } catch (error) {
      const raw = String(error?.message || "").trim();
      const lowered = raw.toLowerCase();
      if (lowered.includes("row-level security") || String(error?.code || "") === "42501") {
        setMsg(t("add_patient_permission_denied"));
      } else if (lowered.includes("relation") || lowered.includes("patients")) {
        setMsg(t("add_patient_table_missing"));
      } else {
        setMsg(raw ? `${t("add_patient_unable_prefix")} ${raw}` : t("add_patient_error"));
      }
    }
  };

  return (
    <div style={page}>
      <div style={container}>
        <h2 style={title}>{t("add_patient_title")}</h2>
        <p style={subTitle}>{t("add_patient_subtitle")}</p>

        <form onSubmit={handleSubmit} style={card}>
          <div style={grid}>
            <label style={field}>
              <span style={label}>{t("name")}</span>
              <input
                placeholder={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={input}
              />
            </label>

            <label style={field}>
              <span style={label}>{t("age")}</span>
              <input
                placeholder={t("age")}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={input}
              />
            </label>

            <label style={{ ...field, gridColumn: "1 / -1" }}>
              <span style={label}>{t("condition")}</span>
              <input
                placeholder={t("condition")}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={input}
              />
            </label>

            <label style={{ ...field, gridColumn: "1 / -1" }}>
              <span style={label}>{t("additional_data_label")}</span>
              <textarea
                placeholder={t("additional_data_label")}
                value={additionalData}
                onChange={(e) => setAdditionalData(e.target.value)}
                style={{ ...input, minHeight: 110, resize: "vertical" }}
              />
            </label>
          </div>

          <button style={btn}>{t("save_patient")}</button>
          {msg ? <p style={msgStyle}>{msg}</p> : null}
        </form>
      </div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const container = {
  maxWidth: 980,
  margin: "0 auto"
};

const title = {
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  marginTop: 0,
  marginBottom: 18,
  color: "#365662"
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12
};

const field = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const label = {
  color: "#254851",
  fontSize: 13,
  fontWeight: 600
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc"
};

const btn = {
  width: "fit-content",
  marginTop: 12,
  padding: 12,
  background: "#203a43",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const msgStyle = {
  marginTop: 10,
  color: "#20444f"
};
```

---

## File: `src\pages\Chat.js`
```js
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  addChatMessageCloud,
  getAppointmentByIdCloud,
  getChatMessagesCloud,
  getPharmaciesCloud
} from "../services/cloudData";
import {
  addChatMessage,
  getAppointmentById,
  getChatMessages
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";
import SpeakableText from "../components/SpeakableText";
import { getSpeechLang } from "../utils/speech";
import { translateChatTextWithMeta } from "../services/translationService";

const PRESCRIPTION_PREFIX = "[PRESCRIPTION]";
const IMAGE_PREFIX = "[IMAGE]";

function parseImageMessage(rawText) {
  const text = String(rawText || "").trim();
  if (!text.startsWith(IMAGE_PREFIX)) return "";
  return text.slice(IMAGE_PREFIX.length).trim();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl, maxSide = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height && width > maxSide) {
        height = Math.round((height * maxSide) / width);
        width = maxSide;
      } else if (height >= width && height > maxSide) {
        width = Math.round((width * maxSide) / height);
        height = maxSide;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas-context-failed"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = dataUrl;
  });
}

function parsePrescriptionMessage(rawText) {
  const text = String(rawText || "").trim();
  if (!text.startsWith(PRESCRIPTION_PREFIX)) return null;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pickup = (label) => {
    const row = lines.find((line) => line.startsWith(`${label}:`));
    return row ? row.slice(label.length + 1).trim() : "";
  };

  const medsStart = lines.findIndex((line) => line === "Medicines:");
  const notesStart = lines.findIndex((line) => line.startsWith("Notes:"));
  const medicines =
    medsStart >= 0
      ? lines
          .slice(medsStart + 1, notesStart >= 0 ? notesStart : undefined)
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2).trim())
      : [];

  return {
    patientName: pickup("Patient Name"),
    patientMobile: pickup("Patient Mobile"),
    doctorName: pickup("Doctor Name"),
    issuedAt: pickup("Issued At"),
    appointmentId: pickup("Appointment Id"),
    pharmacyOwnerEmail: pickup("Pharmacy Owner Email"),
    medicines,
    notes: pickup("Notes")
  };
}

function buildPrescriptionMessage({
  appointmentId,
  patientName,
  patientMobile,
  doctorName,
  pharmacyOwnerEmail,
  medicines,
  notes
}) {
  const medsLines = (medicines || [])
    .map((m) => String(m || "").trim())
    .filter(Boolean)
    .map((m) => `- ${m}`)
    .join("\n");

  return [
    PRESCRIPTION_PREFIX,
    `Patient Name: ${String(patientName || "").trim() || "-"}`,
    `Patient Mobile: ${String(patientMobile || "").trim() || "-"}`,
    `Doctor Name: ${String(doctorName || "").trim() || "-"}`,
    `Issued At: ${new Date().toLocaleString()}`,
    `Appointment Id: ${String(appointmentId || "").trim() || "-"}`,
    `Pharmacy Owner Email: ${String(pharmacyOwnerEmail || "").trim() || "ALL"}`,
    "Medicines:",
    medsLines || "- No medicines listed",
    `Notes: ${String(notes || "").trim() || "Take medicines as prescribed by doctor."}`,
    "Share With: Patient and Pharmacy"
  ].join("\n");
}

export default function Chat() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") || "";
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const [messages, setMessages] = useState([]);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [translationStatus, setTranslationStatus] = useState("");
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appointmentMeta, setAppointmentMeta] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescriptionPharmacies, setPrescriptionPharmacies] = useState([]);
  const [selectedPharmacyOwnerEmail, setSelectedPharmacyOwnerEmail] = useState("ALL");
  const [isSendingPrescription, setIsSendingPrescription] = useState(false);
  const imageInputRef = useRef(null);
  const shouldUseCloud = hasSupabase && isOnline;
  const targetLanguage = String(
    sessionStorage.getItem("userLanguage") ||
      localStorage.getItem("language") ||
      i18n.language ||
      "en"
  )
    .split("-")[0]
    .toLowerCase();

  useEffect(() => {
    // Keep UI and translation target aligned with login-selected language.
    if (i18n.language !== targetLanguage) {
      i18n.changeLanguage(targetLanguage);
    }
  }, [i18n, targetLanguage]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!appointmentId) return undefined;
    let active = true;

    async function loadMessages() {
      const data = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      if (!active) return;
      setMessages(data);
    }

    loadMessages();
    const timer = setInterval(loadMessages, 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [appointmentId, shouldUseCloud]);

  useEffect(() => {
    if (role !== "doctor") return undefined;
    let active = true;

    async function loadPharmaciesForPrescription() {
      if (!shouldUseCloud) {
        if (active) setPrescriptionPharmacies([]);
        return;
      }
      try {
        const list = await getPharmaciesCloud();
        if (!active) return;
        setPrescriptionPharmacies(list || []);
      } catch {
        if (active) setPrescriptionPharmacies([]);
      }
    }

    loadPharmaciesForPrescription();
    return () => {
      active = false;
    };
  }, [role, shouldUseCloud]);

  useEffect(() => {
    if (!appointmentId) return undefined;
    let active = true;

    async function loadAppointmentMeta() {
      try {
        const info = shouldUseCloud
          ? await getAppointmentByIdCloud(appointmentId)
          : await getAppointmentById(appointmentId);
        if (!active) return;
        setAppointmentMeta(info || null);
      } catch {
        if (active) setAppointmentMeta(null);
      }
    }

    loadAppointmentMeta();
    return () => {
      active = false;
    };
  }, [appointmentId, shouldUseCloud]);

  useEffect(() => {
    let active = true;

    async function translateIncomingMessages() {
      const nextTranslations = {};
      let lastProvider = "";

      for (const message of messages) {
        const originalText = String(message?.text || "").trim();
        if (!originalText) {
          nextTranslations[message.id] = "";
          continue;
        }

        if (parsePrescriptionMessage(originalText)) {
          nextTranslations[message.id] = originalText;
          continue;
        }
        if (parseImageMessage(originalText)) {
          nextTranslations[message.id] = originalText;
          continue;
        }

        const translated = await translateChatTextWithMeta(
          originalText,
          targetLanguage
        );
        nextTranslations[message.id] = translated.text;
        if (translated.provider) lastProvider = translated.provider;
      }

      if (!active) return;
      setTranslatedMessages(nextTranslations);
      setTranslationStatus(lastProvider ? `Translation: ${lastProvider}` : "");
    }

    translateIncomingMessages();

    return () => {
      active = false;
    };
  }, [i18n.language, messages, role, targetLanguage]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!appointmentId || !text.trim()) return;

    try {
      const payload = {
        text: text.trim(),
        senderRole: role,
        senderName: user?.name || (role === "doctor" ? t("doctor") : t("patient"))
      };
      if (shouldUseCloud) {
        await addChatMessageCloud(appointmentId, payload);
      } else {
        await addChatMessage(appointmentId, payload);
      }

      const refreshed = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      setMessages(refreshed);
      setText("");
    } catch {
      alert(t("chat_unable_send"));
    }
  }

  async function sendImageFile(file) {
    if (!file || !appointmentId) return;
    if (!String(file.type || "").startsWith("image/")) {
      alert(t("chat_image_only", "Please choose an image file."));
      return;
    }

    setIsImageUploading(true);
    try {
      const originalDataUrl = await readFileAsDataUrl(file);
      let compressedDataUrl = await compressImageDataUrl(originalDataUrl);
      if (compressedDataUrl.length > 800000) {
        compressedDataUrl = await compressImageDataUrl(originalDataUrl, 700, 0.58);
      }

      const payload = {
        text: `${IMAGE_PREFIX}${compressedDataUrl}`,
        senderRole: role,
        senderName: user?.name || (role === "doctor" ? t("doctor") : t("patient"))
      };

      if (shouldUseCloud) {
        await addChatMessageCloud(appointmentId, payload);
      } else {
        await addChatMessage(appointmentId, payload);
      }

      const refreshed = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      setMessages(refreshed);
    } catch {
      alert(t("chat_image_upload_failed", "Unable to upload image right now."));
    } finally {
      setIsImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function onSelectImage(e) {
    const file = e?.target?.files?.[0];
    if (!file) return;
    sendImageFile(file);
  }

  async function sendPrescription() {
    if (role !== "doctor" || !appointmentId) return;

    const lines = prescriptionMedicines
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      alert(t("chat_prescription_medicine_required", "Please enter at least one medicine line."));
      return;
    }

    const payload = {
      text: buildPrescriptionMessage({
        appointmentId,
        patientName: appointmentMeta?.patientName || "Patient",
        patientMobile: appointmentMeta?.patientMobile || "-",
        doctorName: user?.name || t("doctor"),
        pharmacyOwnerEmail: selectedPharmacyOwnerEmail,
        medicines: lines,
        notes: prescriptionNotes
      }),
      senderRole: role,
      senderName: user?.name || t("doctor")
    };

    setIsSendingPrescription(true);
    try {
      if (shouldUseCloud) {
        await addChatMessageCloud(appointmentId, payload);
      } else {
        await addChatMessage(appointmentId, payload);
      }

      const refreshed = shouldUseCloud
        ? await getChatMessagesCloud(appointmentId)
        : await getChatMessages(appointmentId);
      setMessages(refreshed);
      setPrescriptionMedicines("");
      setPrescriptionNotes("");
      setSelectedPharmacyOwnerEmail("ALL");
      setShowPrescriptionForm(false);
    } catch {
      alert(t("chat_prescription_send_failed", "Unable to send prescription right now."));
    } finally {
      setIsSendingPrescription(false);
    }
  }

  function startVoiceTyping() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("symptom_voice_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang(i18n.language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        setText((prev) => `${prev} ${transcript}`.trim());
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  if (!appointmentId) {
    return (
      <div style={styles.page}>
        <SpeakableText
          as="h2"
          text={t("chat_title")}
          style={styles.title}
          wrapperStyle={{ display: "flex" }}
        />
        <SpeakableText
          as="p"
          text={t("chat_invalid_consultation")}
          wrapperStyle={{ display: "flex" }}
        />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("chat_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex" }}
      />
      {!shouldUseCloud && hasSupabase && (
        <SpeakableText
          as="p"
          text={t("chat_offline_message")}
          style={styles.empty}
          wrapperStyle={{ display: "flex" }}
        />
      )}
      {translationStatus && (
        <p style={styles.translationStatus}>{translationStatus}</p>
      )}
      <div style={styles.chatBox}>
        {messages.length === 0 && (
          <SpeakableText
            as="p"
            text={t("chat_no_messages")}
            style={styles.empty}
            wrapperStyle={{ display: "flex" }}
          />
        )}
        {messages.map((m) => {
          const mine = m.senderRole === role;
          const rawText = translatedMessages[m.id] || m.text;
          const imageSrc = parseImageMessage(rawText);
          const prescription = parsePrescriptionMessage(rawText);
          return (
            <div key={m.id} style={{ ...styles.msg, ...(mine ? styles.mine : styles.theirs) }}>
              <div style={styles.meta}>
                {m.senderName} ({m.senderRole})
              </div>
              {imageSrc ? (
                <div style={styles.imageMessageWrap}>
                  <img src={imageSrc} alt={t("chat_image_alt", "Shared symptom")} style={styles.imageMsg} />
                </div>
              ) : prescription ? (
                <div style={styles.prescriptionMsg}>
                  <div style={styles.rxTitle}>{t("chat_prescription_title", "Doctor Prescription")}</div>
                  <div style={styles.rxMeta}>
                    {t("chat_prescription_patient_label", "Patient")}: {prescription.patientName || "-"}
                    {" | "}
                    {t("mobile", "Mobile")}: {prescription.patientMobile || "-"}
                  </div>
                  <div style={styles.rxMeta}>
                    {t("doctor", "Doctor")}: {prescription.doctorName || "-"}
                  </div>
                  <div style={styles.rxMeta}>
                    {t("chat_prescription_pharmacy_owner", "Pharmacy Owner")}: {prescription.pharmacyOwnerEmail || "ALL"}
                  </div>
                  <div style={styles.rxListTitle}>{t("chat_prescription_medicines", "Medicines")}</div>
                  {prescription.medicines.length === 0 ? (
                    <div style={styles.rxLine}>-</div>
                  ) : (
                    prescription.medicines.map((line, idx) => (
                      <div key={`${m.id}_rx_${idx}`} style={styles.rxLine}>
                        {idx + 1}. {line}
                      </div>
                    ))
                  )}
                  {prescription.notes && (
                    <div style={styles.rxNotes}>
                      {t("chat_prescription_notes", "Notes")}: {prescription.notes}
                    </div>
                  )}
                </div>
              ) : (
                <SpeakableText text={rawText} />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} style={styles.form}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat_type_message")}
          style={styles.input}
        />
        {role === "patient" && (
          <button
            type="button"
            style={styles.voiceBtn}
            onClick={startVoiceTyping}
          >
            {isListening ? t("voice_listening") : t("chat_speak_message")}
          </button>
        )}
        <button style={styles.button} type="submit">
          {t("chat_send")}
        </button>
        <button
          type="button"
          style={styles.imageBtn}
          onClick={() => imageInputRef.current?.click()}
          disabled={isImageUploading}
        >
          {isImageUploading
            ? t("please_wait")
            : t("chat_upload_image", "Upload Photo")}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={onSelectImage}
        />
      </form>

      {role === "doctor" && (
        <div style={styles.prescriptionCard}>
          <div style={styles.prescriptionHeader}>
            <strong>{t("chat_prescription_title", "Doctor Prescription")}</strong>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => setShowPrescriptionForm((prev) => !prev)}
            >
              {showPrescriptionForm
                ? t("chat_prescription_hide_form", "Hide Form")
                : t("chat_prescription_open_form", "Create Prescription")}
            </button>
          </div>
          {showPrescriptionForm && (
            <div style={styles.prescriptionForm}>
              <p style={styles.prescriptionMeta}>
                {t("chat_prescription_patient_label", "Patient")}: {appointmentMeta?.patientName || "-"} | {" "}
                {t("mobile", "Mobile")}: {appointmentMeta?.patientMobile || "-"}
              </p>
              <textarea
                value={prescriptionMedicines}
                onChange={(e) => setPrescriptionMedicines(e.target.value)}
                placeholder={t(
                  "chat_prescription_medicines_placeholder",
                  "One medicine per line, e.g. Paracetamol 650mg - 1-0-1 after food for 3 days"
                )}
                style={styles.textArea}
              />
              <label style={styles.prescriptionLabel}>
                {t("chat_prescription_select_pharmacy", "Send to Pharmacy Owner")}
              </label>
              <select
                value={selectedPharmacyOwnerEmail}
                onChange={(e) => setSelectedPharmacyOwnerEmail(e.target.value)}
                style={styles.input}
              >
                <option value="ALL">
                  {t("chat_prescription_all_pharmacies", "All Pharmacy Owners")}
                </option>
                {prescriptionPharmacies.map((p) => (
                  <option key={p.id} value={String(p.ownerEmail || "").toLowerCase()}>
                    {p.name} ({String(p.ownerEmail || "").toLowerCase()})
                  </option>
                ))}
              </select>
              <textarea
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder={t(
                  "chat_prescription_notes_placeholder",
                  "Optional notes for patient and pharmacy"
                )}
                style={{ ...styles.textArea, minHeight: 74 }}
              />
              <button
                type="button"
                style={styles.button}
                onClick={sendPrescription}
                disabled={isSendingPrescription}
              >
                {isSendingPrescription
                  ? t("please_wait")
                  : t("chat_prescription_send", "Send Prescription")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#e0f7fa",
    padding: 24
  },
  title: {
    marginTop: 0,
    color: "#0f2027"
  },
  chatBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    minHeight: 320,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  empty: {
    color: "#5b7480"
  },
  translationStatus: {
    margin: "0 0 10px",
    color: "#3d5a66",
    fontSize: 12
  },
  msg: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: "8px 10px",
    marginBottom: 8
  },
  mine: {
    marginLeft: "auto",
    background: "#2c5364",
    color: "#fff"
  },
  theirs: {
    marginRight: "auto",
    background: "#edf4f7",
    color: "#0d2430"
  },
  meta: {
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 2
  },
  form: {
    marginTop: 12,
    display: "flex",
    gap: 8
  },
  input: {
    flex: 1,
    border: "1px solid #b8cfd8",
    borderRadius: 8,
    padding: "10px 12px"
  },
  button: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#203a43",
    color: "#fff",
    cursor: "pointer"
  },
  voiceBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#0f766e",
    color: "#fff",
    cursor: "pointer"
  },
  imageBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#1f4f5f",
    color: "#fff",
    cursor: "pointer"
  },
  secondaryBtn: {
    border: "1px solid #a6c0cb",
    borderRadius: 8,
    padding: "8px 12px",
    background: "#f4fbfe",
    color: "#1f4b5d",
    cursor: "pointer"
  },
  prescriptionCard: {
    marginTop: 14,
    background: "#fff",
    border: "1px solid #d0e4ec",
    borderRadius: 12,
    padding: 12
  },
  prescriptionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  prescriptionForm: {
    marginTop: 10,
    display: "grid",
    gap: 8
  },
  prescriptionMeta: {
    margin: 0,
    color: "#355664",
    fontSize: 13
  },
  prescriptionLabel: {
    margin: "2px 0 0",
    color: "#355664",
    fontSize: 13,
    fontWeight: 600
  },
  textArea: {
    width: "100%",
    border: "1px solid #b8cfd8",
    borderRadius: 8,
    padding: "10px 12px",
    minHeight: 110,
    resize: "vertical"
  },
  prescriptionMsg: {
    display: "grid",
    gap: 4
  },
  rxTitle: {
    fontWeight: 700
  },
  rxMeta: {
    fontSize: 12,
    opacity: 0.92
  },
  rxListTitle: {
    marginTop: 4,
    fontWeight: 600
  },
  rxLine: {
    fontSize: 14
  },
  rxNotes: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: "italic"
  },
  imageMessageWrap: {
    marginTop: 6
  },
  imageMsg: {
    maxWidth: "100%",
    borderRadius: 10,
    display: "block",
    border: "1px solid rgba(255,255,255,0.25)"
  }
};
```

---

## File: `src\pages\Consultation.js`
```js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import SpeakableText from "../components/SpeakableText";
import { hasSupabase, supabase } from "../supabaseClient";

const CALL_KEY = "telemedicine_call_room";

function buildIceServers() {
  const servers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ];

  const turnUrlsRaw = String(process.env.REACT_APP_TURN_URLS || "").trim();
  const turnUsername = String(process.env.REACT_APP_TURN_USERNAME || "").trim();
  const turnCredential = String(process.env.REACT_APP_TURN_CREDENTIAL || "").trim();

  const turnUrls = turnUrlsRaw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (turnUrls.length > 0 && turnUsername && turnCredential) {
    servers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential
    });
  }

  return servers;
}

const RTC_CONFIG = {
  iceServers: buildIceServers()
};

function buildJitsiUrl(code) {
  const room = String(code || "").trim().toUpperCase();
  return `https://meet.jit.si/${encodeURIComponent(room)}#config.prejoinPageEnabled=false`;
}

function channelNameForRoom(roomCode) {
  return `consult-room-${roomCode.replace(/[^A-Z0-9-]/g, "")}`;
}

export default function Consultation() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const codeFromUrl = (searchParams.get("code") || "").trim().toUpperCase();
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const [roomCode, setRoomCode] = useState(
    codeFromUrl || localStorage.getItem(CALL_KEY) || ""
  );
  const [inCall, setInCall] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [status, setStatus] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [jitsiUrl, setJitsiUrl] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const channelRef = useRef(null);
  const activeRoomCodeRef = useRef("");
  const activeSessionIdRef = useRef("");
  const participantIdRef = useRef(
    `${role}_${Math.random().toString(36).slice(2, 10)}`
  );
  const offerRetryRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const candidateBacklogBySessionRef = useRef({});

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      teardownCall(false);
    };
  }, []);

  useEffect(() => {
    if (!codeFromUrl) return;
    setRoomCode(codeFromUrl);
    localStorage.setItem(CALL_KEY, codeFromUrl);
    setJitsiUrl(buildJitsiUrl(codeFromUrl));
    setInCall(true);
    setStatus("Connected in-app. Waiting for the other participant.");
  }, [codeFromUrl]);

  async function prepareMedia() {
    if (localStreamRef.current) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError(t("video_call_not_supported"));
      return false;
    }

    try {
      setIsPreparing(true);
      setPermissionError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      return true;
    } catch {
      setPermissionError(t("video_call_permission_error"));
      return false;
    } finally {
      setIsPreparing(false);
    }
  }

  function stopOfferRetry() {
    if (offerRetryRef.current) {
      clearInterval(offerRetryRef.current);
      offerRetryRef.current = null;
    }
  }

  function closeSignalChannel() {
    stopOfferRetry();
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  function clearPeerConnection() {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
    candidateBacklogBySessionRef.current = {};
  }

  function clearMedia() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }

  async function sendSignal(payload) {
    if (!channelRef.current) return false;
    const response = await channelRef.current.send({
      type: "broadcast",
      event: "signal",
      payload: {
        ...payload,
        senderId: participantIdRef.current,
        roomCode: activeRoomCodeRef.current,
        sentAt: Date.now()
      }
    });
    return response === "ok";
  }

  function stashCandidate(sessionId, candidate) {
    if (!sessionId || !candidate) return;
    if (!candidateBacklogBySessionRef.current[sessionId]) {
      candidateBacklogBySessionRef.current[sessionId] = [];
    }
    candidateBacklogBySessionRef.current[sessionId].push(candidate);
  }

  function moveBacklogToPending(sessionId) {
    if (!sessionId) return;
    const queued = candidateBacklogBySessionRef.current[sessionId] || [];
    if (queued.length > 0) {
      pendingCandidatesRef.current.push(...queued);
    }
    delete candidateBacklogBySessionRef.current[sessionId];
  }

  async function flushPendingCandidates() {
    const connection = peerConnectionRef.current;
    if (!connection || !connection.remoteDescription) return;

    const pending = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of pending) {
      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore malformed or duplicate candidate
      }
    }
  }

  function setupPeerConnection() {
    const connection = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = connection;

    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

    localStreamRef.current.getTracks().forEach((track) => {
      connection.addTrack(track, localStreamRef.current);
    });

    connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      if (remoteVideoRef.current) {
        remoteVideoRef.current.play().catch(() => {});
      }
      setRemoteJoined(true);
      setStatus(t("video_call_connected"));
    };

    connection.onicecandidate = async (event) => {
      if (!event.candidate || !activeSessionIdRef.current) return;
      await sendSignal({
        type: "candidate",
        senderRole: role,
        sessionId: activeSessionIdRef.current,
        candidate: event.candidate.toJSON()
      });
    };

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;
      if (state === "connected") {
        setStatus(t("video_call_connected"));
      } else if (state === "failed" || state === "disconnected") {
        setStatus(t("video_call_connection_failed"));
      } else if (state === "connecting") {
        setStatus(t("video_call_connecting"));
      }
    };

    return connection;
  }

  async function startDoctorOfferBroadcast(connection, cleanCode) {
    const sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    activeSessionIdRef.current = sessionId;

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    const offerPayload = {
      type: "offer",
      senderRole: "doctor",
      sessionId,
      offer: { type: offer.type, sdp: offer.sdp }
    };

    await sendSignal(offerPayload);
    stopOfferRetry();
    offerRetryRef.current = setInterval(() => {
      if (!peerConnectionRef.current?.currentRemoteDescription) {
        sendSignal(offerPayload);
      } else {
        stopOfferRetry();
      }
    }, 2000);

    setStatus(t("video_call_waiting"));
    setInCall(true);
    activeRoomCodeRef.current = cleanCode;
  }

  async function handleIncomingSignal(payload) {
    if (!payload) return;
    if (payload.senderId && payload.senderId === participantIdRef.current) return;
    if (payload.roomCode !== activeRoomCodeRef.current) return;

    const connection = peerConnectionRef.current;
    if (!connection) return;

    if (payload.type === "offer" && role !== "doctor") {
      if (connection.currentRemoteDescription) return;
      activeSessionIdRef.current = payload.sessionId;
      moveBacklogToPending(payload.sessionId);
      await connection.setRemoteDescription(
        new RTCSessionDescription(payload.offer)
      );
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      await sendSignal({
        type: "answer",
        senderRole: role,
        sessionId: payload.sessionId,
        answer: { type: answer.type, sdp: answer.sdp }
      });
      await flushPendingCandidates();
      setStatus(t("video_call_waiting"));
      setInCall(true);
      return;
    }

    if (
      payload.type === "answer" &&
      role === "doctor" &&
      payload.sessionId === activeSessionIdRef.current &&
      !connection.currentRemoteDescription
    ) {
      await connection.setRemoteDescription(
        new RTCSessionDescription(payload.answer)
      );
      stopOfferRetry();
      await flushPendingCandidates();
      setStatus(t("video_call_waiting"));
      return;
    }

    if (payload.type === "candidate") {
      if (!payload.sessionId || !payload.candidate) return;

      if (!activeSessionIdRef.current) {
        stashCandidate(payload.sessionId, payload.candidate);
        return;
      }

      if (payload.sessionId !== activeSessionIdRef.current) {
        stashCandidate(payload.sessionId, payload.candidate);
        return;
      }

      if (connection.remoteDescription) {
        try {
          await connection.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // ignore malformed or duplicate candidate
        }
      } else {
        pendingCandidatesRef.current.push(payload.candidate);
      }
      return;
    }

    if (
      payload.type === "end" &&
      payload.sessionId &&
      payload.sessionId === activeSessionIdRef.current
    ) {
      teardownCall(false);
      setStatus(t("video_call_ended"));
    }
  }

  async function subscribeToRoom(cleanCode) {
    if (!hasSupabase || !supabase || !isOnline) {
      setStatus(t("video_call_cloud_required"));
      return false;
    }

    closeSignalChannel();

    return new Promise((resolve) => {
      const channel = supabase.channel(channelNameForRoom(cleanCode), {
        config: { broadcast: { self: false } }
      });
      channelRef.current = channel;
      activeRoomCodeRef.current = cleanCode;

      channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
        try {
          await handleIncomingSignal(payload);
        } catch {
          setStatus(t("video_call_start_error"));
        }
      });

      channel.subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          resolve(true);
        } else if (
          subscribeStatus === "CLOSED" ||
          subscribeStatus === "CHANNEL_ERROR" ||
          subscribeStatus === "TIMED_OUT"
        ) {
          setStatus(t("video_call_room_connect_error"));
          resolve(false);
        }
      });
    });
  }

  async function startCall() {
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setStatus(t("video_call_enter_room"));
      return;
    }

    localStorage.setItem(CALL_KEY, cleanCode);
    setRoomCode(cleanCode);
    setJitsiUrl(buildJitsiUrl(cleanCode));
    setInCall(true);
    setStatus("Connected in-app. Waiting for the other participant.");
  }

  function toggleAudio() {
    if (!localStreamRef.current) return;
    const next = !micOn;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;
    const next = !cameraOn;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCameraOn(next);
  }

  function teardownCall(markEnded) {
    const sessionId = activeSessionIdRef.current;

    if (markEnded && sessionId) {
      sendSignal({
        type: "end",
        senderRole: role,
        sessionId
      });
    }

    closeSignalChannel();
    clearPeerConnection();
    clearMedia();

    setInCall(false);
    setCameraOn(true);
    setMicOn(true);
    setRemoteJoined(false);
    setIsJoiningRoom(false);
    activeSessionIdRef.current = "";
    activeRoomCodeRef.current = "";
    setPermissionError("");
  }

  function endCall() {
    if (jitsiUrl) {
      setJitsiUrl("");
      setInCall(false);
      setStatus(t("video_call_ended"));
      return;
    }
    teardownCall(true);
    setStatus(t("video_call_ended"));
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <SpeakableText
          as="h2"
          text={t("video_call_title")}
          style={styles.title}
          wrapperStyle={{ display: "flex" }}
        />
        <span style={{ ...styles.badge, background: isOnline ? "#1f8b4c" : "#a61f2b" }}>
          {isOnline ? t("video_call_online") : t("video_call_offline")}
        </span>
      </div>

      <SpeakableText
        as="p"
        text={role === "doctor" ? t("video_call_doctor_hint") : t("video_call_patient_hint")}
        style={styles.subtitle}
        wrapperStyle={{ display: "flex", marginBottom: 18 }}
      />

      <div style={styles.card}>
        <label style={styles.label}>{t("video_call_room_code")}</label>
        <div style={styles.row}>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder={t("video_call_room_placeholder")}
            style={styles.input}
          />
        </div>
        <p style={styles.smallText}>
          {t("video_call_signed_as")} <strong>{user?.name || t(role)}</strong>
        </p>
      </div>

      {jitsiUrl ? (
        <div style={styles.jitsiWrap}>
          <iframe
            title="telemedicine-jitsi-call"
            src={jitsiUrl}
            style={styles.jitsiFrame}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen
          />
        </div>
      ) : (
        <div style={styles.videoGrid}>
          <div style={styles.videoBox}>
            <p style={styles.videoLabel}>{t("video_call_you")}</p>
            <div style={styles.remoteWrap}>
              <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
              {!cameraOn && (
                <div style={styles.localVideoOffOverlay}>
                  {t("video_call_camera_muted_status")}
                </div>
              )}
            </div>
            <div style={styles.mediaStatusRow}>
              <span style={micOn ? styles.statusChipOn : styles.statusChipOff}>
                {micOn ? t("video_call_mic_live_status") : t("video_call_mic_muted_status")}
              </span>
              <span style={cameraOn ? styles.statusChipOn : styles.statusChipOff}>
                {cameraOn ? t("video_call_camera_live_status") : t("video_call_camera_muted_status")}
              </span>
            </div>
          </div>

          <div style={styles.videoBox}>
            <p style={styles.videoLabel}>{t("video_call_remote")}</p>
            <div style={styles.remoteWrap}>
              <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
              {!remoteJoined && (
                <div style={styles.remotePlaceholder}>
                  {role === "doctor" && inCall
                    ? t("video_call_waiting")
                    : !remoteJoined && inCall
                      ? t("video_call_waiting_host")
                      : t("video_call_remote_idle")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {permissionError && (
        <SpeakableText
          as="p"
          text={permissionError}
          style={styles.error}
          wrapperStyle={{ display: "flex", marginTop: 12 }}
        />
      )}
      {status && (
        <SpeakableText
          as="p"
          text={status}
          style={styles.status}
          wrapperStyle={{ display: "flex", marginTop: 12 }}
        />
      )}

      <div style={styles.controls}>
        {!inCall ? (
          <button
            type="button"
            style={styles.primaryBtn}
            onClick={startCall}
            disabled={isPreparing || isJoiningRoom}
          >
            {isPreparing || isJoiningRoom
              ? t("video_call_connecting")
              : t("video_call_join")}
          </button>
        ) : jitsiUrl ? (
          <div style={styles.controlBar}>
            <button type="button" style={styles.dangerBtn} onClick={endCall}>
              <span style={styles.controlTitle}>{t("video_call_end")}</span>
              <span style={styles.controlMeta}>Close in-app call</span>
            </button>
          </div>
        ) : (
          <div style={styles.controlBar}>
            <button
              type="button"
              style={micOn ? styles.controlBtn : styles.controlBtnMuted}
              onClick={toggleAudio}
              aria-pressed={!micOn}
            >
              <span style={styles.controlTitle}>
                {micOn ? t("video_call_mute") : t("video_call_unmute")}
              </span>
              <span style={styles.controlMeta}>
                {micOn ? t("video_call_mic_live_status") : t("video_call_mic_muted_status")}
              </span>
            </button>
            <button
              type="button"
              style={cameraOn ? styles.controlBtn : styles.controlBtnMuted}
              onClick={toggleVideo}
              aria-pressed={!cameraOn}
            >
              <span style={styles.controlTitle}>
                {cameraOn ? t("video_call_camera_off") : t("video_call_camera_on")}
              </span>
              <span style={styles.controlMeta}>
                {cameraOn ? t("video_call_camera_live_status") : t("video_call_camera_muted_status")}
              </span>
            </button>
            <button type="button" style={styles.dangerBtn} onClick={endCall}>
              <span style={styles.controlTitle}>{t("video_call_end")}</span>
              <span style={styles.controlMeta}>{t("video_call_leave_status")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background: "#e0f7fa"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  },
  title: {
    color: "#0f2027",
    margin: 0
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: "#304d58"
  },
  badge: {
    color: "#fff",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    marginBottom: 16
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: 600
  },
  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  input: {
    flex: 1,
    minWidth: 180,
    border: "1px solid #c2d7dd",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    textTransform: "uppercase"
  },
  smallText: {
    marginTop: 10,
    marginBottom: 0,
    color: "#36525a",
    fontSize: 14
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14
  },
  jitsiWrap: {
    width: "100%",
    background: "#ffffff",
    borderRadius: 12,
    padding: 8,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  jitsiFrame: {
    width: "100%",
    height: "72vh",
    border: "none",
    borderRadius: 10,
    background: "#0f2027"
  },
  videoBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  videoLabel: {
    marginTop: 0,
    marginBottom: 8,
    fontWeight: 600,
    color: "#203a43"
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    background: "#0f2027",
    objectFit: "cover"
  },
  remoteWrap: {
    position: "relative"
  },
  remotePlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#dfe9ec",
    background: "rgba(15, 32, 39, 0.7)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14
  },
  localVideoOffOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#f7fbfc",
    background: "rgba(15, 32, 39, 0.78)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontWeight: 600
  },
  mediaStatusRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10
  },
  statusChipOn: {
    display: "inline-flex",
    alignItems: "center",
    background: "#e8f6ef",
    color: "#1f7a45",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600
  },
  statusChipOff: {
    display: "inline-flex",
    alignItems: "center",
    background: "#fdecee",
    color: "#b3261e",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600
  },
  controls: {
    marginTop: 18
  },
  controlBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    width: "100%"
  },
  primaryBtn: {
    background: "#00796b",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 15,
    cursor: "pointer"
  },
  secondaryBtn: {
    background: "#edf7f8",
    color: "#18444b",
    border: "1px solid #b9d7dc",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 15,
    cursor: "pointer"
  },
  controlBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#edf7f8",
    color: "#18444b",
    border: "1px solid #b9d7dc",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    cursor: "pointer"
  },
  controlBtnMuted: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#fff1f1",
    color: "#8f1d1d",
    border: "1px solid #f1b7b7",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    cursor: "pointer"
  },
  dangerBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 15,
    cursor: "pointer"
  },
  controlTitle: {
    fontWeight: 700
  },
  controlMeta: {
    fontSize: 12,
    opacity: 0.85
  },
  error: {
    color: "#a61f2b",
    fontWeight: 600
  },
  status: {
    color: "#1b4f59",
    fontWeight: 600
  }
};
```

---

## File: `src\roles\DoctorDashboard.js`
```js
import { useTranslation } from "react-i18next";

export default function DoctorDashboard() {
  const { t } = useTranslation();
  return <h2>{t("doctor_analytics_title")}</h2>;
}
```

---

## File: `src\roles\AdminDashboard.js`
```js
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  return <h2>{t("admin_dashboard")}</h2>;
}
```

---

## File: `src\pages\DoctorAnalytics.js`
```js
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAppointmentsForDoctorCloud
} from "../services/cloudData";
import { getAppointmentsForDoctor } from "../services/localData";
import { hasSupabase } from "../supabaseClient";

const DOCTORS = [
  { id: "doc_kumar", name: "Dr. Kumar", email: "doctor@gmail.com" },
  { id: "doc_anjali", name: "Dr. Anjali", email: "anjali@gmail.com" },
  { id: "doc_arun", name: "Dr. Arun", email: "arun@gmail.com" }
];

function parseSymptoms(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[,\n;/]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function DoctorAnalytics() {
  const { t } = useTranslation();
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const doctor = useMemo(() => {
    const email = String(user?.email || "").toLowerCase();
    return DOCTORS.find((d) => d.email === email) || DOCTORS[0];
  }, [user]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const local = await getAppointmentsForDoctor(doctor.id);
        if (!active) return;
        setAppointments(local);

        if (hasSupabase && isOnline) {
          const cloud = await getAppointmentsForDoctorCloud(doctor.id);
          if (!active) return;
          setAppointments(cloud);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const timer = setInterval(loadData, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [doctor.id, isOnline]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const pending = appointments.filter((a) => a.status !== "completed").length;
    const video = appointments.filter((a) => a.consultType === "video").length;
    const text = appointments.filter((a) => a.consultType === "text").length;
    return { total, completed, pending, video, text };
  }, [appointments]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const labels = [];
    const byDay = {};

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      byDay[key] = 0;
    }

    appointments.forEach((a) => {
      const key = String(a?.date || "");
      if (byDay[key] !== undefined) byDay[key] += 1;
    });

    return labels.map((day) => ({ day, count: byDay[day] }));
  }, [appointments]);

  const symptomLeaders = useMemo(() => {
    const counter = {};
    appointments.forEach((a) => {
      parseSymptoms(a?.symptoms).forEach((symptom) => {
        counter[symptom] = (counter[symptom] || 0) + 1;
      });
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [appointments]);

  const maxWeekCount = Math.max(1, ...weeklyData.map((w) => w.count));

  return (
    <div style={page}>
      <h2 style={title}>{t("doctor_analytics_title")}</h2>
      <p style={subTitle}>
        {doctor.name} - {t("doctor_analytics_subtitle")}
      </p>
      {!isOnline && (
        <p style={notice}>{t("doctor_availability_offline")}</p>
      )}

      <div style={metrics}>
        <StatCard label={t("doctor_analytics_total_appointments")} value={stats.total} />
        <StatCard label={t("doctor_analytics_pending")} value={stats.pending} />
        <StatCard label={t("doctor_analytics_completed")} value={stats.completed} />
        <StatCard label={t("doctor_analytics_video_consults")} value={stats.video} />
        <StatCard label={t("doctor_analytics_text_consults")} value={stats.text} />
      </div>

      <div style={section}>
        <h3 style={sectionTitle}>{t("doctor_analytics_last7days")}</h3>
        {loading ? (
          <p>{t("loading")}</p>
        ) : (
          weeklyData.map((row) => (
            <div key={row.day} style={barRow}>
              <div style={barLabel}>{row.day.slice(5)}</div>
              <div style={barTrack}>
                <div
                  style={{
                    ...barFill,
                    width: `${(row.count / maxWeekCount) * 100}%`
                  }}
                />
              </div>
              <div style={barValue}>{row.count}</div>
            </div>
          ))
        )}
      </div>

      <div style={section}>
        <h3 style={sectionTitle}>{t("doctor_analytics_top_symptoms")}</h3>
        {symptomLeaders.length === 0 ? (
          <p>{t("doctor_analytics_no_symptom_data")}</p>
        ) : (
          symptomLeaders.map(([symptom, count]) => (
            <div key={symptom} style={listRow}>
              <span style={chip}>{symptom}</span>
              <strong>{count}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  marginTop: 0,
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  color: "#37545f",
  marginTop: 0,
  marginBottom: 14
};

const notice = {
  background: "#fff7e0",
  border: "1px solid #edd8a0",
  color: "#6b5408",
  borderRadius: 10,
  padding: "10px 12px"
};

const metrics = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12
};

const statCard = {
  background: "linear-gradient(145deg, #1f4959, #2f6276)",
  color: "#fff",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 8px 16px rgba(0,0,0,0.18)"
};

const statValue = {
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 700
};

const statLabel = {
  fontSize: 13,
  marginTop: 4,
  opacity: 0.92
};

const section = {
  marginTop: 18,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
  padding: 14
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 12,
  color: "#203a43"
};

const barRow = {
  display: "grid",
  gridTemplateColumns: "58px 1fr 32px",
  alignItems: "center",
  gap: 10,
  marginBottom: 8
};

const barLabel = {
  fontSize: 13,
  color: "#33505b"
};

const barTrack = {
  background: "#ecf4f8",
  height: 12,
  borderRadius: 8,
  overflow: "hidden"
};

const barFill = {
  height: "100%",
  background: "linear-gradient(90deg, #2d8f8f, #4ab17f)",
  borderRadius: 8
};

const barValue = {
  textAlign: "right",
  color: "#1f4a57",
  fontWeight: 700
};

const listRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e8f0f4",
  padding: "8px 0"
};

const chip = {
  background: "#eef6f9",
  color: "#1f4a57",
  borderRadius: 20,
  padding: "4px 10px",
  fontSize: 13
};
```

---

## File: `src\roles\PatientDashboard.js`
```js
import AppointmentForm from "../components/AppointmentForm";
import AppointmentList from "../components/AppointmentList";

export default function PatientDashboard() {
  return (
    <>
      <AppointmentForm />
      <AppointmentList />
    </>
  );
}
```

---

## File: `src\pages\Home.js`
```js
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { i18n } = useTranslation(); // ensures language is initialized
  const role = sessionStorage.getItem("role");

  // ðŸ” Load saved language on refresh
  const savedLang = localStorage.getItem("language");
  if (savedLang && i18n.language !== savedLang) {
    i18n.changeLanguage(savedLang);
  }

  // ðŸ” Not logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // ðŸŽ¯ Role-based redirection
  if (role === "patient") {
    return <Navigate to="/patient-home" replace />;
  }

  if (role === "doctor") {
    return <Navigate to="/doctor-home" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin-home" replace />;
  }

  if (role === "pharmacy") {
    return <Navigate to="/pharmacy" replace />;
  }

  // âŒ Fallback
  return <Navigate to="/login" replace />;
}
```

---

## File: `src\pages\DoctorPatients.js`
```js
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  deletePatientRecordCloud,
  getAllPatientRecordsCloud,
  updatePatientRecordCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";

export default function DoctorPatients() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    condition: "",
    additionalData: ""
  });
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      if (!hasSupabase || !navigator.onLine) {
        setPatients([]);
        setMsg(t("doctor_patients_internet_required"));
        return;
      }
      const data = await getAllPatientRecordsCloud();
      setPatients(data);
      setMsg("");
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const key = String(filterText || "").trim().toLowerCase();
    if (!key) return patients;
    return patients.filter((p) => {
      const name = String(p?.name || "").toLowerCase();
      const age = String(p?.age || "").toLowerCase();
      const condition = String(p?.condition || "").toLowerCase();
      const additional = String(p?.additionalData || "").toLowerCase();
      return (
        name.includes(key) ||
        age.includes(key) ||
        condition.includes(key) ||
        additional.includes(key)
      );
    });
  }, [patients, filterText]);

  function startEdit(patient) {
    setEditingId(patient.id);
    setEditForm({
      name: patient.name || "",
      age: patient.age || "",
      condition: patient.condition || "",
      additionalData: patient.additionalData || ""
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", age: "", condition: "", additionalData: "" });
  }

  async function saveEdit(patientId) {
    try {
      if (!String(editForm.name || "").trim()) {
        setMsg(t("doctor_patients_name_required"));
        return;
      }
      setBusyId(patientId);
      const updated = await updatePatientRecordCloud(patientId, editForm);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? updated : p))
      );
      setMsg(t("doctor_patients_updated"));
      cancelEdit();
    } catch (error) {
      setMsg(`${t("doctor_patients_update_failed_prefix")} ${String(error?.message || "")}`);
    } finally {
      setBusyId(null);
    }
  }

  async function removePatient(patientId) {
    const confirmed = window.confirm(
      t("doctor_patients_delete_confirm")
    );
    if (!confirmed) return;
    try {
      setBusyId(patientId);
      await deletePatientRecordCloud(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
      setMsg(t("doctor_patients_deleted"));
    } catch (error) {
      setMsg(`${t("doctor_patients_delete_failed_prefix")} ${String(error?.message || "")}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div style={page}>
      <div style={container}>
        <h2 style={title}>{t("doctor_patients_title")}</h2>
        <p style={subTitle}>{t("doctor_patients_subtitle")}</p>
        <div style={filterRow}>
          <input
            style={filterInput}
            placeholder={t("doctor_patients_filter_placeholder")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        {msg ? <p style={msgStyle}>{msg}</p> : null}

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>{t("name")}</th>
                <th style={th}>{t("age")}</th>
                <th style={th}>{t("condition")}</th>
                <th style={th}>{t("additional_data_label")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td style={emptyTd} colSpan={5}>{t("doctor_patients_no_records")}</td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id}>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.age}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, age: e.target.value }))
                          }
                        />
                      ) : (
                        p.age
                      )}
                    </td>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.condition}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, condition: e.target.value }))
                          }
                        />
                      ) : (
                        p.condition
                      )}
                    </td>
                    <td style={td}>
                      {editingId === p.id ? (
                        <input
                          style={editInput}
                          value={editForm.additionalData}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              additionalData: e.target.value
                            }))
                          }
                        />
                      ) : (
                        p.additionalData || "-"
                      )}
                    </td>
                    <td style={td}>
                      <div style={actionRow}>
                        {editingId === p.id ? (
                          <>
                            <button
                              style={saveBtn}
                              onClick={() => saveEdit(p.id)}
                              disabled={busyId === p.id}
                              type="button"
                            >
                              {t("save")}
                            </button>
                            <button
                              style={cancelBtn}
                              onClick={cancelEdit}
                              disabled={busyId === p.id}
                              type="button"
                            >
                              {t("cancel")}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              style={editBtn}
                              onClick={() => startEdit(p)}
                              type="button"
                            >
                              {t("common_edit")}
                            </button>
                            <button
                              style={deleteBtn}
                              onClick={() => removePatient(p.id)}
                              disabled={busyId === p.id}
                              type="button"
                            >
                              {t("doctor_patients_delete")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const container = {
  maxWidth: 980,
  margin: "0 auto"
};

const title = {
  color: "#0f2027",
  marginBottom: 6
};

const subTitle = {
  marginTop: 0,
  marginBottom: 18,
  color: "#365662"
};

const filterRow = {
  marginBottom: 10
};

const filterInput = {
  width: "100%",
  border: "1px solid #c2d5dc",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14
};

const msgStyle = {
  marginTop: 0,
  marginBottom: 12,
  color: "#2f5661",
  background: "#edf7fa",
  border: "1px solid #d2e6ec",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13
};

const tableWrap = {
  background: "#fff",
  borderRadius: 12,
  padding: 10,
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  overflowX: "auto"
};

const table = {
  width: "100%",
  background: "#fff",
  borderCollapse: "collapse",
  minWidth: 760
};

const th = {
  background: "#203a43",
  color: "#fff",
  textAlign: "left",
  padding: 10
};

const td = {
  borderBottom: "1px solid #e2ecef",
  padding: 10,
  verticalAlign: "top"
};

const editInput = {
  width: "100%",
  border: "1px solid #c7d9df",
  borderRadius: 6,
  padding: "8px 10px",
  fontSize: 13
};

const actionRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap"
};

const editBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#2c5364",
  color: "#fff",
  cursor: "pointer"
};

const saveBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#0f8f56",
  color: "#fff",
  cursor: "pointer"
};

const cancelBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#7a8d94",
  color: "#fff",
  cursor: "pointer"
};

const deleteBtn = {
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  background: "#b23a3a",
  color: "#fff",
  cursor: "pointer"
};

const emptyTd = {
  padding: 16,
  color: "#496874",
  textAlign: "center"
};
```

---

## File: `src\pages\DoctorAvailability.js`
```js
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SpeakableText from "../components/SpeakableText";
import { getAllAppointmentsCloud } from "../services/cloudData";
import { getAllAppointments } from "../services/localData";
import { hasSupabase } from "../supabaseClient";

const KNOWN_DOCTORS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    specialty: "General Medicine"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    specialty: "Dermatology"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    specialty: "Pediatrics"
  }
];

function isFutureSlot(date, time) {
  if (!date || !time) return false;
  const dt = new Date(`${date}T${time}`);
  return Number.isFinite(dt.getTime()) && dt.getTime() > Date.now();
}

export default function DoctorAvailability() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const local = await getAllAppointments();
        if (active) setAppointments(local || []);

        if (hasSupabase && isOnline) {
          const cloud = await getAllAppointmentsCloud();
          if (active) setAppointments(cloud || []);
        }
      } catch {
        // Keep last known data.
      }
    }

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOnline]);

  const doctorCards = useMemo(() => {
    const fromAppointments = new Map();
    appointments.forEach((a) => {
      const doctorId = String(a?.doctorId || "").trim();
      if (!doctorId) return;
      if (!fromAppointments.has(doctorId)) {
        fromAppointments.set(doctorId, {
          id: doctorId,
          name: a?.doctorName || doctorId,
          specialty: a?.doctorSpecialty || "General"
        });
      }
    });

    KNOWN_DOCTORS.forEach((d) => {
      if (!fromAppointments.has(d.id)) {
        fromAppointments.set(d.id, d);
      }
    });

    return [...fromAppointments.values()].map((doctor) => {
      const doctorAppointments = appointments.filter(
        (a) => String(a.doctorId || "") === doctor.id
      );
      const activeConsults = doctorAppointments.filter(
        (a) => String(a.status || "") === "in_consultation"
      ).length;
      const completedConsults = doctorAppointments.filter(
        (a) => String(a.status || "") === "completed"
      ).length;
      const upcoming = doctorAppointments
        .filter((a) => isFutureSlot(a.date, a.time))
        .sort((a, b) => {
          const aMs = new Date(`${a.date}T${a.time}`).getTime();
          const bMs = new Date(`${b.date}T${b.time}`).getTime();
          return aMs - bMs;
        });
      const nextSlot = upcoming[0] || null;
      const status = activeConsults > 0 ? "busy" : "available";

      return {
        ...doctor,
        status,
        activeConsults,
        completedConsults,
        totalConsults: doctorAppointments.length,
        queueSize: upcoming.length,
        nextSlot
      };
    });
  }, [appointments]);

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("doctor_availability_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex", marginBottom: 12 }}
      />
      <SpeakableText
        as="p"
        text={isOnline
          ? t("doctor_availability_live")
          : t("doctor_availability_offline")}
        style={styles.helper}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />

      <div style={styles.grid}>
        {doctorCards.map((doctor) => (
          <div key={doctor.id} style={styles.card}>
            <div style={styles.headerRow}>
              <h3 style={styles.name}>{t(`doctor_${doctor.id.split("_")[1]}`, doctor.name)}</h3>
              <span
                style={{
                  ...styles.badge,
                  background: doctor.status === "available" ? "#1f8b4c" : "#b45309"
                }}
              >
                {doctor.status === "available"
                  ? t("doctor_availability_status_available")
                  : t("doctor_availability_status_in_consultation")}
              </span>
            </div>
            <p style={styles.meta}><strong>{t("doctor_availability_specialty")}:</strong> {t(`specialty_${doctor.specialty.toLowerCase().replace(/\s+/g, "_")}`, doctor.specialty)}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_total_consults")}:</strong> {doctor.totalConsults}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_active_consults")}:</strong> {doctor.activeConsults}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_completed")}:</strong> {doctor.completedConsults}</p>
            <p style={styles.meta}><strong>{t("doctor_availability_upcoming_queue")}:</strong> {doctor.queueSize}</p>
            <p style={styles.meta}>
              <strong>{t("doctor_availability_next_slot")}:</strong>{" "}
              {doctor.nextSlot
                ? `${doctor.nextSlot.date} ${doctor.nextSlot.time}`
                : t("doctor_availability_no_upcoming_slot")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background: "#e0f7fa"
  },
  title: {
    marginTop: 0,
    color: "#0f2027"
  },
  helper: {
    marginTop: 0,
    color: "#35515d"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  name: {
    margin: 0,
    color: "#203a43",
    fontSize: 18
  },
  badge: {
    color: "#fff",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700
  },
  meta: {
    margin: "7px 0",
    color: "#2d4a53",
    fontSize: 14
  }
};
```

---

## File: `src\pages\PharmacyAvailability.js`
```js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  deleteChatMessageCloud,
  createPharmacyCloud,
  getPrescriptionMessagesCloud,
  getPharmaciesCloud,
  updatePharmacyMedicinesCloud
} from "../services/cloudData";
import { deleteChatMessage, getAllChatMessages } from "../services/localData";
import { hasSupabase } from "../supabaseClient";
import SpeakableText from "../components/SpeakableText";

const PRESCRIPTION_PREFIX = "[PRESCRIPTION]";

function parsePrescriptionMessage(rawText) {
  const text = String(rawText || "").trim();
  if (!text.startsWith(PRESCRIPTION_PREFIX)) return null;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const pickup = (label) => {
    const row = lines.find((line) => line.startsWith(`${label}:`));
    return row ? row.slice(label.length + 1).trim() : "";
  };

  const medsStart = lines.findIndex((line) => line === "Medicines:");
  const notesStart = lines.findIndex((line) => line.startsWith("Notes:"));
  const medicines =
    medsStart >= 0
      ? lines
          .slice(medsStart + 1, notesStart >= 0 ? notesStart : undefined)
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2).trim())
      : [];

  return {
    patientName: pickup("Patient Name"),
    patientMobile: pickup("Patient Mobile"),
    doctorName: pickup("Doctor Name"),
    issuedAt: pickup("Issued At"),
    appointmentId: pickup("Appointment Id"),
    pharmacyOwnerEmail: pickup("Pharmacy Owner Email"),
    medicines,
    notes: pickup("Notes")
  };
}

export default function PharmacyAvailability() {
  const { t } = useTranslation();
  const role = sessionStorage.getItem("role") || "patient";
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }, []);

  const [pharmacies, setPharmacies] = useState([]);
  const [searchMedicine, setSearchMedicine] = useState("");
  const [loading, setLoading] = useState(true);
  const [medicineName, setMedicineName] = useState("");
  const [medicineUnits, setMedicineUnits] = useState("");
  const [ownerPharmacy, setOwnerPharmacy] = useState(null);
  const [incomingPrescriptions, setIncomingPrescriptions] = useState([]);

  const [newPharmacy, setNewPharmacy] = useState({
    name: "",
    area: "",
    phone: "",
    ownerEmail: "",
    ownerPassword: ""
  });

  const loadPharmacies = useCallback(async () => {
    if (!hasSupabase || !navigator.onLine) {
      setPharmacies([]);
      setOwnerPharmacy(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getPharmaciesCloud();
      setPharmacies(data);
      if (role === "pharmacy") {
        const own = data.find(
          (p) => p.ownerEmail === String(user?.email || "").toLowerCase()
        );
        setOwnerPharmacy(own || null);
      }
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  const loadIncomingPrescriptions = useCallback(async () => {
    if (role !== "pharmacy") return;
    try {
      const currentOwnerEmail = String(user?.email || "").trim().toLowerCase();
      if (hasSupabase && navigator.onLine) {
        const cloudMessages = await getPrescriptionMessagesCloud();
        const parsed = cloudMessages
          .map((m) => {
            const parsedRx = parsePrescriptionMessage(m.text);
            return parsedRx ? { ...parsedRx, id: m.id } : null;
          })
          .filter(Boolean)
          .filter((rx) => {
            const target = String(rx?.pharmacyOwnerEmail || "ALL").trim().toLowerCase();
            return !target || target === "all" || target === currentOwnerEmail;
          });
        setIncomingPrescriptions(parsed);
        return;
      }

      const localMessages = await getAllChatMessages();
      const parsed = localMessages
        .map((m) => {
          const parsedRx = parsePrescriptionMessage(m.text);
          return parsedRx ? { ...parsedRx, id: m.id } : null;
        })
        .filter(Boolean)
        .filter((rx) => {
          const target = String(rx?.pharmacyOwnerEmail || "ALL").trim().toLowerCase();
          return !target || target === "all" || target === currentOwnerEmail;
        });
      setIncomingPrescriptions(parsed);
    } catch {
      setIncomingPrescriptions([]);
    }
  }, [role, user]);

  async function markPrescriptionDelivered(rxId) {
    try {
      if (hasSupabase && navigator.onLine) {
        await deleteChatMessageCloud(rxId);
      } else {
        await deleteChatMessage(rxId);
      }
      await loadIncomingPrescriptions();
    } catch {
      alert(t("pharmacy_unable_mark_prescription_delivered", "Unable to mark prescription as delivered."));
    }
  }

  useEffect(() => {
    loadPharmacies();
    loadIncomingPrescriptions();
    const timer = setInterval(loadPharmacies, 3000);
    const rxTimer = setInterval(loadIncomingPrescriptions, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(rxTimer);
    };
  }, [loadPharmacies, loadIncomingPrescriptions]);

  async function saveMedicine() {
    if (!ownerPharmacy) {
      alert(t("pharmacy_owner_not_found"));
      return;
    }
    const key = medicineName.trim();
    const units = Number(medicineUnits);
    if (!key || Number.isNaN(units) || units < 0) {
      alert(t("pharmacy_enter_valid_medicine_units"));
      return;
    }

    const next = { ...(ownerPharmacy.medicines || {}), [key]: units };
    const updated = await updatePharmacyMedicinesCloud(ownerPharmacy.id, next);
    setOwnerPharmacy(updated);
    setMedicineName("");
    setMedicineUnits("");
    await loadPharmacies();
  }

  function selectMedicineForEdit(name, units) {
    setMedicineName(String(name || ""));
    setMedicineUnits(String(Number(units) || 0));
  }

  async function addPharmacyOwner(e) {
    e.preventDefault();
    if (!newPharmacy.name || !newPharmacy.ownerEmail || !newPharmacy.ownerPassword) {
      alert(t("pharmacy_owner_fields_required"));
      return;
    }

    await createPharmacyCloud({
      ...newPharmacy,
      medicines: {
        Paracetamol: 0,
        Ibuprofen: 0
      }
    });

    setNewPharmacy({
      name: "",
      area: "",
      phone: "",
      ownerEmail: "",
      ownerPassword: ""
    });
    await loadPharmacies();
    alert(t("pharmacy_owner_created"));
  }

  const searchKey = searchMedicine.trim().toLowerCase();

  function localizePharmacyName(name) {
    const key = String(name || "").trim().toLowerCase();
    if (key.includes("apollo")) return t("pharmacy_apollo_name");
    if (key.includes("pharmeasy")) return t("pharmacy_pharmeasy_name");
    return name || "-";
  }

  function localizeArea(area) {
    const value = String(area || "").trim().toLowerCase();
    if (value === "chennai") return t("city_chennai");
    if (value === "bangalore" || value === "bengaluru") return t("city_bangalore");
    return area || "-";
  }

  return (
    <div style={page}>
      <SpeakableText
        as="h2"
        text={t("pharmacy_title")}
        style={title}
        wrapperStyle={{ display: "flex", marginBottom: 16 }}
      />

      {!hasSupabase && (
        <SpeakableText
          as="p"
          text={t("pharmacy_not_configured")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}
      {hasSupabase && !navigator.onLine && (
        <SpeakableText
          as="p"
          text={t("pharmacy_internet_required")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}

      {role === "admin" && (
        <div style={card}>
          <h3 style={pharmacyName}>{t("pharmacy_create_owner_admin")}</h3>
          <form onSubmit={addPharmacyOwner} style={adminGrid}>
            <input
              style={searchBox}
              placeholder={t("pharmacy_name")}
              value={newPharmacy.name}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_area")}
              value={newPharmacy.area}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, area: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("phone")}
              value={newPharmacy.phone}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, phone: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_owner_email")}
              value={newPharmacy.ownerEmail}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, ownerEmail: e.target.value }))}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_owner_password")}
              value={newPharmacy.ownerPassword}
              onChange={(e) => setNewPharmacy((p) => ({ ...p, ownerPassword: e.target.value }))}
            />
            <button style={btn} type="submit">{t("pharmacy_create_owner")}</button>
          </form>
        </div>
      )}

      {role === "pharmacy" && (
        <div style={card}>
          <h3 style={pharmacyName}>{t("pharmacy_update_stock")}</h3>
          <p style={helperText2}>
            {t("pharmacy_logged_in_as")}: {user?.email || "-"} {ownerPharmacy ? `| ${localizePharmacyName(ownerPharmacy.name)}` : ""}
          </p>
          <div style={adminGrid}>
            <input
              style={searchBox}
              placeholder={t("pharmacy_medicine_name")}
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
            />
            <input
              style={searchBox}
              placeholder={t("pharmacy_units")}
              type="number"
              min="0"
              value={medicineUnits}
              onChange={(e) => setMedicineUnits(e.target.value)}
            />
            <button style={btn} onClick={saveMedicine} type="button">
              {t("pharmacy_update_units")}
            </button>
          </div>
          {ownerPharmacy && (
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={stockTable}>
                <thead>
                  <tr>
                    <th style={stockHeadCell}>{t("pharmacy_medicine_name")}</th>
                    <th style={stockHeadCell}>{t("pharmacy_units")}</th>
                    <th style={stockHeadCell}>{t("common_action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ownerPharmacy.medicines || {}).map(([m, qty]) => (
                    <tr key={m}>
                      <td style={stockCell}>
                        <button
                          type="button"
                          style={medicineLinkBtn}
                          onClick={() => selectMedicineForEdit(m, qty)}
                          title={t("pharmacy_update_units")}
                        >
                          {m}
                        </button>
                      </td>
                      <td style={stockCell}>
                        {qty} {t("units")}
                      </td>
                      <td style={stockCell}>
                        <button
                          type="button"
                          style={smallActionBtn}
                          onClick={() => selectMedicineForEdit(m, qty)}
                        >
                          {t("common_edit")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={tableHint}>{t("pharmacy_click_medicine_to_edit")}</p>
            </div>
          )}
        </div>
      )}

      {role === "pharmacy" && (
        <div style={card}>
          <h3 style={pharmacyName}>
            {t("pharmacy_incoming_prescriptions", "Incoming Prescriptions")}
          </h3>
          {incomingPrescriptions.length === 0 ? (
            <p style={helperText2}>
              {t("pharmacy_no_incoming_prescriptions", "No prescriptions received yet.")}
            </p>
          ) : (
            incomingPrescriptions.map((rx) => (
              <div key={rx.id} style={rxCard}>
                <p style={rxMeta}>
                  <strong>{t("chat_prescription_patient_label", "Patient")}:</strong> {rx.patientName || "-"}
                  {" | "}
                  <strong>{t("mobile", "Mobile")}:</strong> {rx.patientMobile || "-"}
                </p>
                <p style={rxMeta}>
                  <strong>{t("doctor", "Doctor")}:</strong> {rx.doctorName || "-"}
                  {" | "}
                  <strong>{t("date", "Date")}:</strong> {rx.issuedAt || "-"}
                </p>
                <p style={rxMeta}>
                  <strong>{t("chat_prescription_pharmacy_owner", "Pharmacy Owner")}:</strong> {rx.pharmacyOwnerEmail || "ALL"}
                </p>
                <p style={rxTitle}>{t("chat_prescription_medicines", "Medicines")}:</p>
                {rx.medicines.length === 0 ? (
                  <p style={rxItem}>-</p>
                ) : (
                  rx.medicines.map((item, idx) => (
                    <p key={`${rx.id}_item_${idx}`} style={rxItem}>
                      {idx + 1}. {item}
                    </p>
                  ))
                )}
                {rx.notes && (
                  <p style={rxNote}>
                    <strong>{t("chat_prescription_notes", "Notes")}:</strong> {rx.notes}
                  </p>
                )}
                <button
                  type="button"
                  style={smallActionBtn}
                  onClick={() => markPrescriptionDelivered(rx.id)}
                >
                  {t("pharmacy_mark_given_delete", "Given to patient (Delete)")}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <input
        type="text"
        placeholder={t("pharmacy_search_placeholder")}
        value={searchMedicine}
        onChange={(e) => setSearchMedicine(e.target.value)}
        style={searchBox}
      />

      {!searchMedicine && (
        <SpeakableText
          as="p"
          text={t("pharmacy_helper")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}
      {loading && (
        <SpeakableText
          as="p"
          text={t("loading")}
          style={helperText}
          wrapperStyle={{ display: "flex" }}
        />
      )}

      {pharmacies.map((pharmacy) => {
        let found = false;
        let stock = 0;

        if (searchKey && pharmacy.medicines) {
          Object.entries(pharmacy.medicines).forEach(([medicine, qty]) => {
            if (medicine.toLowerCase() === searchKey) {
              found = true;
              stock = Number(qty);
            }
          });
        }

        return (
          <div key={pharmacy.id} style={card}>
            <h3 style={pharmacyName}>{localizePharmacyName(pharmacy.name)}</h3>
            <SpeakableText as="p" text={`${t("pharmacy_area")}: ${localizeArea(pharmacy.area)}`} wrapperStyle={{ display: "flex" }} />
            <SpeakableText as="p" text={`${t("phone")}: ${pharmacy.phone || "-"}`} wrapperStyle={{ display: "flex" }} />

            {searchKey && (
              <>
                {found ? (
                  stock > 0 ? (
                    <p style={available}>
                      {t("available")} - {stock} {t("units")}
                    </p>
                  ) : (
                    <p style={outOfStock}>{t("out_of_stock")}</p>
                  )
                ) : (
                  <p style={notFound}>{t("not_available")}</p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  color: "#0f2027",
  marginBottom: 16
};

const searchBox = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #b0bec5",
  marginBottom: 10
};

const helperText = {
  color: "#546e7a",
  marginBottom: 20
};

const helperText2 = {
  color: "#37545f",
  marginBottom: 10
};

const card = {
  background: "#ffffff",
  padding: 16,
  borderRadius: 12,
  marginBottom: 14,
  boxShadow: "0 6px 14px rgba(0,0,0,0.12)"
};

const pharmacyName = {
  marginBottom: 6,
  color: "#203a43"
};

const available = {
  color: "green",
  fontWeight: 600,
  marginTop: 8
};

const outOfStock = {
  color: "red",
  fontWeight: 600,
  marginTop: 8
};

const notFound = {
  color: "#ff6f00",
  fontWeight: 500,
  marginTop: 8
};

const adminGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 8,
  alignItems: "start"
};

const btn = {
  border: "none",
  borderRadius: 8,
  background: "#2c5364",
  color: "#fff",
  padding: "10px 12px",
  cursor: "pointer"
};

const stockTable = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 420
};

const stockHeadCell = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #d6e2e8",
  background: "#eef5f8",
  color: "#1e3f4d",
  fontWeight: 700,
  fontSize: 14
};

const stockCell = {
  padding: "10px 12px",
  borderBottom: "1px solid #edf3f6",
  color: "#203a43",
  fontSize: 14
};

const medicineLinkBtn = {
  border: "none",
  background: "transparent",
  color: "#11556f",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
  fontWeight: 600
};

const smallActionBtn = {
  border: "1px solid #bfd1d9",
  background: "#f8fcfe",
  color: "#1f4d5f",
  borderRadius: 8,
  padding: "4px 10px",
  fontSize: 13,
  cursor: "pointer"
};

const tableHint = {
  marginTop: 8,
  fontSize: 12,
  color: "#4f6974"
};

const rxCard = {
  border: "1px solid #d6e3e8",
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
  background: "#f8fcfe"
};

const rxMeta = {
  margin: "4px 0",
  color: "#2f4a53",
  fontSize: 13
};

const rxTitle = {
  margin: "8px 0 4px",
  fontWeight: 700,
  color: "#1f3d49"
};

const rxItem = {
  margin: "2px 0",
  color: "#1f3d49",
  fontSize: 14
};

const rxNote = {
  marginTop: 8,
  color: "#1f3d49",
  fontSize: 13,
  fontStyle: "italic"
};
```

---

## File: `src\pages\Login.js`
```js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import {
  getPatientUserCloud,
  registerPatientUserCloud,
  getPharmacyOwnerLoginCloud
} from "../services/cloudData";
import { hasSupabase } from "../supabaseClient";
import {
  getPatientUserByMobile,
  saveOfflineCredential,
  getOfflineCredential,
  savePatientUserLocal,
  getDoctorByEmail
} from "../services/localData";

const DOCTOR_ACCOUNTS = [
  {
    id: "doc_kumar",
    name: "Dr. Kumar",
    email: "doctor@gmail.com",
    password: "doctor@123"
  },
  {
    id: "doc_anjali",
    name: "Dr. Anjali",
    email: "anjali@gmail.com",
    password: "anjali@123"
  },
  {
    id: "doc_arun",
    name: "Dr. Arun",
    email: "arun@gmail.com",
    password: "arun@123"
  }
];

const PHARMACY_DEMO_ACCOUNTS = [
  {
    id: "ph_apollo",
    name: "Apollo Pharmacy",
    ownerEmail: "apollo@gmail.com",
    ownerPassword: "apollo@123"
  },
  {
    id: "ph_pharmeasy",
    name: "PharmEasy",
    ownerEmail: "pharmeasy@gmail.com",
    ownerPassword: "pharmeasy@123"
  }
];

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({});
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ---------------- ROLE FIELDS ---------------- */
  const roleFields = {
    patientRegister: [
      { label: t("name"), name: "name", type: "text" },
      { label: t("age"), name: "age", type: "number" },
      { label: t("mobile"), name: "mobile", type: "tel" }
    ],
    patientLogin: [
      { label: t("name"), name: "name", type: "text" },
      { label: t("age"), name: "age", type: "number" },
      { label: t("mobile"), name: "mobile", type: "tel" }
    ],
    doctor: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ],
    pharmacy: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ],
    admin: [
      { label: t("email"), name: "email", type: "email" },
      { label: t("password"), name: "password", type: "password" }
    ]
  };

  /* ---------------- HANDLERS ---------------- */
  const handleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    sessionStorage.setItem("userLanguage", lang);
  };

  const handleRole = (r) => {
    setRole(r);
    setFormData({});
    setIsNewUser(r === "patient"); // âœ… only patient can register
  };

  const activeFields =
    role === "patient"
      ? (isNewUser ? roleFields.patientRegister : roleFields.patientLogin)
      : roleFields[role] || [];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const normalizeName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const completeLogin = (loggedRole, userData, route, extra = {}) => {
    sessionStorage.setItem("role", loggedRole);
    const activeLang = String(i18n.language || localStorage.getItem("language") || "en");
    sessionStorage.setItem("userLanguage", activeLang);
    if (extra.patientMobile) {
      sessionStorage.setItem("patientMobile", String(extra.patientMobile));
    }
    sessionStorage.setItem("userData", JSON.stringify(userData));
    navigate(route);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ===== DOCTOR DIRECT LOGIN ===== */
      if (role === "doctor") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        const storedDoctor = await getDoctorByEmail(email);
        if (storedDoctor && storedDoctor.password === password) {
          completeLogin(
            "doctor",
            {
              role: "doctor",
              id: storedDoctor.id,
              name: storedDoctor.name,
              email: storedDoctor.email,
              specialty: storedDoctor.specialty
            },
            "/doctor-home"
          );
          setLoading(false);
          return;
        }
        const doctor = DOCTOR_ACCOUNTS.find(
          (d) => d.email === email && d.password === password
        );
        if (doctor) {
          completeLogin(
            "doctor",
            {
              role: "doctor",
              id: doctor.id,
              name: doctor.name,
              email: doctor.email
            },
            "/doctor-home"
          );
        } else {
          alert(t("login_invalid_doctor_credentials"));
        }
        setLoading(false);
        return;
      }

      /* ===== ADMIN DIRECT LOGIN ===== */
      if (role === "admin") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        if (
          email === "admin@gmail.com" &&
          password === "admin@123"
        ) {
          completeLogin(
            "admin",
            { role: "admin", email: "admin@gmail.com" },
            "/admin-home"
          );
        } else {
          alert(t("login_invalid_admin_credentials"));
        }
        setLoading(false);
        return;
      }

      /* ===== PHARMACY LOGIN (FROM SUPABASE) ===== */
      if (role === "pharmacy") {
        const email = (formData.email || "").trim().toLowerCase();
        const password = (formData.password || "").trim();
        let pharmacy = null;

        if (hasSupabase && navigator.onLine) {
          try {
            pharmacy = await getPharmacyOwnerLoginCloud(email, password);
            if (pharmacy) {
              await saveOfflineCredential("pharmacy", email, password, pharmacy);
            }
          } catch (error) {
            console.warn("Cloud pharmacy login failed, trying offline cache.", error);
          }
        }

        if (!pharmacy) {
          const cached = await getOfflineCredential("pharmacy", email);
          if (cached && cached.password === password) {
            pharmacy = cached.userData;
          }
        }

        if (!pharmacy) {
          const staticMatch = PHARMACY_DEMO_ACCOUNTS.find(
            (p) =>
              p.ownerEmail.toLowerCase() === email &&
              p.ownerPassword === password
          );
          if (staticMatch) {
            pharmacy = {
              id: staticMatch.id,
              name: staticMatch.name,
              ownerEmail: staticMatch.ownerEmail,
              ownerPassword: staticMatch.ownerPassword,
              medicines: {
                Paracetamol: 20,
                Ibuprofen: 15
              }
            };
            await saveOfflineCredential("pharmacy", email, password, pharmacy);
          }
        }

        if (!pharmacy) {
          if (!navigator.onLine) {
            alert(t("login_offline_pharmacy_failed"));
          } else {
            alert(t("login_invalid_pharmacy_credentials"));
          }
          setLoading(false);
          return;
        }

        completeLogin(
          "pharmacy",
          {
            role: "pharmacy",
            email: pharmacy.ownerEmail,
            pharmacyId: pharmacy.id,
            pharmacyName: pharmacy.name
          },
          "/pharmacy"
        );
        setLoading(false);
        return;
      }

      /* ===== PATIENT REGISTER / LOGIN ===== */
      const userId = (formData.mobile || "").trim();
      if (!userId) {
        alert(t("login_mobile_required"));
        setLoading(false);
        return;
      }

      const patientData = { ...formData, mobile: userId, role: "patient" };

      // REGISTER
      if (isNewUser) {
        const localExisting = await getPatientUserByMobile(userId);
        if (localExisting) {
          alert(t("login_user_already_exists"));
          setIsNewUser(false);
          setLoading(false);
          return;
        }

        if (!hasSupabase || !navigator.onLine) {
          alert(t("login_patient_registration_requires_internet"));
          setLoading(false);
          return;
        }
        const cloudExisting = await getPatientUserCloud(userId);
        if (cloudExisting) {
          alert(t("login_user_already_exists"));
          setIsNewUser(false);
          setLoading(false);
          return;
        }
        const registered = await registerPatientUserCloud(patientData);
        await savePatientUserLocal(registered);
        alert(t("registered_success"));
        setIsNewUser(false);
        setFormData({});
        setLoading(false);
        return;
      }

      // LOGIN
      let loginUser = null;

      if (hasSupabase && navigator.onLine) {
        try {
          loginUser = await getPatientUserCloud(userId);
          if (loginUser) {
            await savePatientUserLocal(loginUser);
          }
        } catch (error) {
          console.warn("Cloud patient login failed, trying offline cache.", error);
        }
      }

      if (!loginUser) {
        loginUser = await getPatientUserByMobile(userId);
      }

      if (!loginUser) {
        if (!navigator.onLine) {
          alert(t("login_offline_login_failed"));
        } else {
          alert(t("invalid_credentials"));
        }
        setLoading(false);
        return;
      }

      const enteredName = normalizeName(formData.name);
      const storedName = normalizeName(loginUser?.name);
      const enteredAgeNum = Number(formData.age);
      const storedAgeNum = Number(loginUser?.age);
      const isAgeMismatch =
        Number.isFinite(enteredAgeNum) && Number.isFinite(storedAgeNum)
          ? enteredAgeNum !== storedAgeNum
          : String(formData.age || "").trim() !== String(loginUser?.age ?? "").trim();
      if (!enteredName || enteredName !== storedName || isAgeMismatch) {
        alert(t("invalid_credentials"));
        setLoading(false);
        return;
      }

      completeLogin(
        "patient",
        {
          ...loginUser,
          name: String(loginUser?.name || "").trim() || t("patient")
        },
        "/patient-home",
        { patientMobile: userId }
      );
    } catch (err) {
      console.error(err);
      if (role === "pharmacy") {
        const msg = String(err?.message || "");
        const code = String(err?.code || "");
        if (code === "42P01" || msg.toLowerCase().includes("relation") || msg.toLowerCase().includes("pharmacies")) {
          alert(t("login_pharmacy_table_missing"));
        } else if (code === "42501") {
          alert(t("login_pharmacy_rls_denied"));
        } else {
          alert(`${t("login_pharmacy_failed_prefix")} ${msg || t("unknown_error")}`);
        }
      } else {
        alert(`${t("generic_error_prefix")} ${err?.message || t("unknown_error")}`);
      }
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={container}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#0f2027" }}>{t("welcome")}</h2>

        <div style={langWrap}>
          <button onClick={() => handleLanguage("en")} style={langBtn}>English</button>
          <button onClick={() => handleLanguage("ta")} style={langBtn}>à®¤à®®à®¿à®´à¯</button>
          <button onClick={() => handleLanguage("hi")} style={langBtn}>à¤¹à¤¿à¤¨à¥à¤¦à¥€</button>
          <button onClick={() => handleLanguage("ml")} style={langBtn}>à´®à´²à´¯à´¾à´³à´‚</button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h3 style={{ color: "#203a43" }}>{t("select_role")}</h3>
        {["patient", "doctor", "pharmacy", "admin"].map((r) => (
          <button key={r} onClick={() => handleRole(r)} style={roleBtn}>
            {t(r)}
          </button>
        ))}
      </div>

      {role && (
        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          <h3 style={{ textAlign: "center", color: "#203a43" }}>
            {isNewUser ? t("register") : t("login")}
          </h3>

          {activeFields.map((f) => (
            <input
              key={f.name}
              {...f}
              placeholder={f.label}
              value={formData[f.name] || ""}
              onChange={handleChange}
              required
              style={input}
            />
          ))}

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? t("please_wait") : isNewUser ? t("register") : t("login")}
          </button>

          {/* âœ… TOGGLE ONLY FOR PATIENT */}
          {role === "patient" && (
            <p style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setIsNewUser(!isNewUser)}
                style={toggleBtn}
              >
                {isNewUser ? t("already_account") : t("new_user")}
              </button>
            </p>
          )}
        </form>
      )}
    </div>
  );
}

/* ---------------- THEME ---------------- */
const container = {
  maxWidth: 480,
  margin: "40px auto",
  padding: 24,
  borderRadius: 12,
  background: "#e0f7fa",
  boxShadow: "0 8px 24px rgba(15,32,39,0.35)"
};

const langWrap = { display: "flex", justifyContent: "center", gap: 10, marginTop: 10 };

const langBtn = {
  padding: "8px 16px",
  borderRadius: 20,
  border: "1px solid #2c5364",
  background: "#ffffff",
  color: "#203a43",
  fontWeight: "600",
  cursor: "pointer"
};

const roleBtn = {
  margin: 6,
  padding: "10px 22px",
  background: "#2c5364",
  color: "#ffffff",
  border: "none",
  borderRadius: 20,
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #b0bec5"
};

const submitBtn = {
  width: "100%",
  marginTop: 16,
  padding: 12,
  background: "#203a43",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
};

const toggleBtn = {
  background: "none",
  border: "none",
  color: "#203a43",
  cursor: "pointer",
  textDecoration: "underline"
};
```

---

## File: `src\pages\Profile.js`
```js
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SpeakableText from "../components/SpeakableText";
import { getAppointmentsForPatientCloud } from "../services/cloudData";
import {
  getAppointmentsForPatient,
  savePatientUserLocal
} from "../services/localData";
import { hasSupabase } from "../supabaseClient";

export default function Profile() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState({ type: "", text: "" });
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  });

  const patientMobile = String(
    profile?.mobile || sessionStorage.getItem("patientMobile") || ""
  ).trim();

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadAppointments() {
      try {
        const local = await getAppointmentsForPatient(patientMobile, profile?.name || "");
        if (active) setAppointments(local || []);
        if (hasSupabase && isOnline) {
          const cloud = await getAppointmentsForPatientCloud(
            patientMobile,
            profile?.name || ""
          );
          if (active) setAppointments(cloud || []);
        }
      } catch {
        // keep existing data if fetch fails
      }
    }

    loadAppointments();
    return () => {
      active = false;
    };
  }, [isOnline, patientMobile, profile?.name]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const active = appointments.filter((a) => a.status === "in_consultation").length;
    const upcoming = appointments.filter((a) => {
      if (!a.date || !a.time) return false;
      const dt = new Date(`${a.date}T${a.time}`);
      return Number.isFinite(dt.getTime()) && dt.getTime() > Date.now();
    }).length;
    return { total, completed, active, upcoming };
  }, [appointments]);

  async function saveProfile() {
    if (!patientMobile) {
      setSaveState({ type: "error", text: t("profile_mobile_not_found") });
      return;
    }
    const name = String(profile?.name || "").trim();
    const age = String(profile?.age || "").trim();
    if (!name || !age) {
      setSaveState({ type: "error", text: t("profile_name_age_required") });
      return;
    }

    setSaving(true);
    setSaveState({ type: "", text: "" });
    try {
      const updated = {
        ...profile,
        role: "patient",
        mobile: patientMobile,
        name,
        age
      };
      await savePatientUserLocal(updated);
      sessionStorage.setItem("userData", JSON.stringify(updated));
      setProfile(updated);
      setSaveState({ type: "success", text: t("profile_updated_success") });
    } catch {
      setSaveState({
        type: "error",
        text: t("profile_update_failed")
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <SpeakableText
        as="h2"
        text={t("profile_title")}
        style={styles.title}
        wrapperStyle={{ display: "flex", marginBottom: 12 }}
      />
      <SpeakableText
        as="p"
        text={isOnline
          ? t("profile_online_text")
          : t("profile_offline_text")}
        style={styles.sub}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {String(profile?.name || "P").trim().charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={styles.cardTitle}>{profile?.name || t("patient")}</h3>
              <p style={styles.headerMeta}>{t("profile_patient_id")}: {patientMobile || "N/A"}</p>
            </div>
          </div>

          <div style={styles.chipsRow}>
            <span style={styles.chip}>{t("profile_role")}: {t("patient")}</span>
            <span style={styles.chip}>{isOnline ? t("profile_online") : t("profile_offline")}</span>
          </div>

          <label style={styles.label}>
            {t("name")}
            <input
              style={styles.input}
              value={profile?.name || ""}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label style={styles.label}>
            {t("age")}
            <input
              type="number"
              min="0"
              style={styles.input}
              value={profile?.age || ""}
              onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
            />
          </label>
          <label style={styles.label}>
            {t("mobile")}
            <input style={styles.inputDisabled} value={patientMobile} disabled />
          </label>
          <button style={styles.primaryBtn} onClick={saveProfile} disabled={saving}>
            {saving ? t("profile_updating") : t("profile_update_button")}
          </button>
          {saveState.text ? (
            <p
              style={
                saveState.type === "success"
                  ? styles.successMsg
                  : styles.errorMsg
              }
            >
              {saveState.text}
            </p>
          ) : null}
        </section>

        <section style={styles.card}>
          <SpeakableText
            as="h3"
            text={t("profile_care_summary")}
            style={styles.cardTitle}
            wrapperStyle={{ display: "flex", marginBottom: 8 }}
          />
          <div style={styles.summaryGrid}>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_total")}</p>
              <p style={styles.summaryValue}>{stats.total}</p>
            </div>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_upcoming")}</p>
              <p style={styles.summaryValue}>{stats.upcoming}</p>
            </div>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_active")}</p>
              <p style={styles.summaryValue}>{stats.active}</p>
            </div>
            <div style={styles.summaryTile}>
              <p style={styles.summaryLabel}>{t("profile_completed")}</p>
              <p style={styles.summaryValue}>{stats.completed}</p>
            </div>
          </div>
        </section>
      </div>

      <section style={{ ...styles.card, marginTop: 14 }}>
        <SpeakableText
          as="h3"
          text={t("profile_recent_appointments")}
          style={styles.cardTitle}
          wrapperStyle={{ display: "flex", marginBottom: 8 }}
        />
        {appointments.length === 0 ? (
          <p style={styles.empty}>{t("profile_no_appointments")}</p>
        ) : (
          appointments
            .slice()
            .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
            .slice(0, 5)
            .map((a) => (
              <div key={a.id} style={styles.appointmentItem}>
                <div>
                  <p style={styles.itemTitle}>{a.doctorName || t("doctor")}</p>
                  <p style={styles.itemMeta}>
                    {a.date || "-"} {a.time || "-"} | Token #{a.tokenNo || "-"}
                  </p>
                </div>
                <span style={styles.itemStatus}>{a.status || t("appointments_booked")}</span>
              </div>
            ))
        )}
        </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background: "#e0f7fa"
  },
  title: {
    margin: 0,
    color: "#0f2027"
  },
  sub: {
    marginTop: 8,
    color: "#35515d"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 14
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)"
  },
  cardTitle: {
    marginTop: 0,
    color: "#203a43"
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2c5364, #4b7b8d)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: 22
  },
  headerMeta: {
    margin: 0,
    color: "#4d6872",
    fontSize: 13
  },
  chipsRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10
  },
  chip: {
    background: "#e8f4f8",
    color: "#1f4b59",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 10,
    color: "#264851",
    fontSize: 14
  },
  input: {
    border: "1px solid #b9cfd6",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14
  },
  inputDisabled: {
    border: "1px solid #d2dfe4",
    background: "#f4f8fa",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14
  },
  primaryBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    background: "#2c5364",
    color: "#fff",
    cursor: "pointer"
  },
  successMsg: {
    margin: "10px 0 0",
    color: "#1f7a45",
    background: "#e9f7ef",
    border: "1px solid #bfe3cf",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13
  },
  errorMsg: {
    margin: "10px 0 0",
    color: "#a61f2b",
    background: "#fdecef",
    border: "1px solid #f1c1c8",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
    gap: 10
  },
  summaryTile: {
    background: "#f3f9fb",
    border: "1px solid #d8e8ee",
    borderRadius: 10,
    padding: 10
  },
  summaryLabel: {
    margin: 0,
    color: "#4a6872",
    fontSize: 12,
    fontWeight: 600
  },
  summaryValue: {
    margin: "4px 0 0",
    color: "#103847",
    fontSize: 22,
    fontWeight: 700
  },
  empty: {
    margin: "6px 0",
    color: "#54727d"
  },
  appointmentItem: {
    border: "1px solid #d8e8ee",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    background: "#fbfeff",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center"
  },
  itemTitle: {
    margin: 0,
    color: "#153d4a",
    fontWeight: 700
  },
  itemMeta: {
    margin: "4px 0 0",
    color: "#4d6a74",
    fontSize: 13
  },
  itemStatus: {
    background: "#e9f5ee",
    color: "#1d6d45",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize"
  }
};
```

---

## File: `src\pages\Symptoms.js`
```js
import React from "react";
import { useTranslation } from "react-i18next";
import OfflineSymptomChecker from "../components/OfflineSymptomChecker";
import SpeakableText from "../components/SpeakableText";

export default function Symptoms() {
  const { t } = useTranslation();
  return (
    <div style={page}>
      <SpeakableText
        as="h2"
        text={t("symptom_checker_title")}
        style={title}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />
      <SpeakableText
        as="p"
        text={t("symptom_on_device_ai_info")}
        style={helper}
        wrapperStyle={{ display: "flex", marginBottom: 14 }}
      />
      <OfflineSymptomChecker />
    </div>
  );
}

const page = {
  padding: 24,
  minHeight: "100vh",
  background: "#e0f7fa"
};

const title = {
  marginTop: 0,
  color: "#0f2027",
  marginBottom: 14
};

const helper = {
  marginTop: 0,
  color: "#35515d"
};
```

---

## File: `src\locales\hi.json`
```json
{
  "welcome": "à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ",
  "login": "à¤²à¥‰à¤—à¤¿à¤¨",
  "select_role": "à¤­à¥‚à¤®à¤¿à¤•à¤¾ à¤šà¥à¤¨à¥‡à¤‚",
  "register": "à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤à¤‚",
  "patient": "à¤°à¥‹à¤—à¥€",
  "doctor": "à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "pharmacy": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€",
  "admin": "à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•",
  "name": "à¤¨à¤¾à¤®",
  "age": "à¤‰à¤®à¥à¤°",
  "mobile": "à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤°",
  "email": "à¤ˆà¤®à¥‡à¤²",
  "phone": "à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤°",
  "password": "à¤ªà¤¾à¤¸à¤µà¤°à¥à¤¡",
  "condition": "à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
  "already_account": "à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤–à¤¾à¤¤à¤¾ à¤¹à¥ˆ? à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨ à¤•à¤°à¥‡à¤‚",
  "new_user": "à¤¨à¤ à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾? à¤–à¤¾à¤¤à¤¾ à¤¬à¤¨à¤¾à¤à¤‚",
  "invalid_credentials": "à¤—à¤²à¤¤ à¤µà¤¿à¤µà¤°à¤£",
  "registered_success": "à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤¸à¤«à¤²",
  "please_login": "à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤¸à¤«à¤²à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤†à¤—à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤²à¥‰à¤—à¤¿à¤¨ à¤•à¤°à¥‡à¤‚à¥¤",
  "save": "à¤¸à¥‡à¤µ à¤•à¤°à¥‡à¤‚",
  "cancel": "à¤°à¤¦à¥à¤¦ à¤•à¤°à¥‡à¤‚",
  "close": "âœ–",
  "nav": {
    "home": "à¤¹à¥‹à¤®",
    "appointments": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
    "symptoms": "à¤²à¤•à¥à¤·à¤£",
    "health_tips": "à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤¸à¥à¤à¤¾à¤µ",
    "consultation": "à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
    "doctors": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾",
    "profile": "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤²",
    "pharmacy": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€",
    "dashboard": "à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡",
    "users": "à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾",
    "settings": "à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
    "analytics": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£"
  },
  "pharmacy_title": " à¤ªà¤¾à¤¸ à¤•à¥€ à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤®à¥‡à¤‚ à¤¦à¤µà¤¾ à¤•à¥€ à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾",
  "pharmacy_search_placeholder": "à¤¦à¤µà¤¾ à¤•à¤¾ à¤¨à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚ (à¤‰à¤¦à¤¾: à¤ªà¥ˆà¤°à¤¾à¤¸à¤¿à¤Ÿà¤¾à¤®à¥‹à¤²)",
  "pharmacy_helper": "à¤ªà¤¾à¤¸ à¤•à¥€ à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤®à¥‡à¤‚ à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾ à¤œà¤¾à¤‚à¤šà¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¦à¤µà¤¾ à¤•à¤¾ à¤¨à¤¾à¤® à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚",
  "available": " à¤‰à¤ªà¤²à¤¬à¥à¤§",
  "out_of_stock": " à¤¸à¥à¤Ÿà¥‰à¤• à¤¸à¤®à¤¾à¤ªà¥à¤¤",
  "not_available": " à¤‡à¤¸ à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤®à¥‡à¤‚ à¤¦à¤µà¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆ",
  "units": "à¤¯à¥‚à¤¨à¤¿à¤Ÿ",
  "book_appointment_title": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚",
  "book_appointment_desc": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¥€ à¤µà¤¿à¤œà¤¿à¤Ÿ à¤¶à¥‡à¤¡à¥à¤¯à¥‚à¤² à¤•à¤°à¥‡à¤‚",
  "symptom_checker_title": "à¤²à¤•à¥à¤·à¤£ à¤œà¤¾à¤‚à¤š",
  "symptom_checker_desc": "à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤²à¤•à¥à¤·à¤£ à¤œà¤¾à¤‚à¤šà¥‡à¤‚",
  "consultation_title": " à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "consultation_desc": "à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "video_call_card_title": " à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤•à¥‰à¤²",
  "video_call_card_desc": "à¤²à¤¾à¤‡à¤µ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
  "doctors_title": " à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "doctors_desc": "à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "your_appointments": "à¤†à¤ªà¤•à¥‡ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
  "appointment_1": "12 à¤«à¤¼à¤°à¤µà¤°à¥€ 2026 | 10:30 AM | à¤¡à¥‰. à¤•à¥à¤®à¤¾à¤°",
  "appointment_2": "18 à¤«à¤¼à¤°à¤µà¤°à¥€ 2026 | 04:00 PM | à¤¡à¥‰. à¤…à¤‚à¤œà¤²à¤¿",
  "health_tips_title": "à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤¸à¥à¤à¤¾à¤µ",
  "health_tip_1": " à¤°à¥‹à¤œà¤¼ à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤ªà¤¾à¤¨à¥€ à¤ªà¤¿à¤à¤‚",
  "health_tip_2": " à¤°à¥‹à¤œà¤¼ 30 à¤®à¤¿à¤¨à¤Ÿ à¤Ÿà¤¹à¤²à¥‡à¤‚",
  "welcome_doctor": "à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "add_patient_title": " à¤®à¤°à¥€à¤œ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚",
  "add_patient_desc": "à¤¨à¤ à¤®à¤°à¥€à¤œ à¤•à¤¾ à¤µà¤¿à¤µà¤°à¤£ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚",
  "view_patients_title": " à¤®à¤°à¥€à¤œ à¤¸à¥‚à¤šà¥€",
  "view_patients_desc": "à¤¸à¤­à¥€ à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¦à¥‡à¤–à¥‡à¤‚",
  "appointments_title": " à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
  "appointments_desc": "à¤†à¤œ à¤•à¥€ à¤¨à¤¿à¤°à¥à¤§à¤¾à¤°à¤¿à¤¤ à¤µà¤¿à¤œà¤¼à¤¿à¤Ÿà¥à¤¸",
  "prescriptions_title": " à¤ªà¥à¤°à¤¿à¤¸à¥à¤•à¥à¤°à¤¿à¤ªà¥à¤¶à¤¨",
  "prescriptions_desc": "à¤ªà¥à¤°à¤¿à¤¸à¥à¤•à¥à¤°à¤¿à¤ªà¥à¤¶à¤¨ à¤®à¥ˆà¤¨à¥‡à¤œ à¤•à¤°à¥‡à¤‚",
  "patient_name": "à¤®à¤°à¥€à¤œ à¤•à¤¾ à¤¨à¤¾à¤®",
  "appointment_form_title": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚",
  "appointment_form_saved_offline": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤¸à¥‡à¤µ à¤¹à¥‹ à¤—à¤¯à¤¾",
  "patient_age": "à¤‰à¤®à¥à¤°",
  "patient_condition": "à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
  "save_patient": "à¤®à¤°à¥€à¤œ à¤¸à¥‡à¤µ à¤•à¤°à¥‡à¤‚",
  "patient_added_success": "à¤®à¤°à¥€à¤œ à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤œà¥‹à¤¡à¤¼ à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
  "add_patient_error": "à¤®à¤°à¥€à¤œ à¤œà¥‹à¤¡à¤¼à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¤à¥à¤°à¥à¤Ÿà¤¿",
  "nav_toggle_menu": "à¤®à¥‡à¤¨à¥‚ à¤Ÿà¥‰à¤—à¤² à¤•à¤°à¥‡à¤‚",
  "patient_list": "à¤®à¤°à¥€à¤œ à¤¸à¥‚à¤šà¥€",
  "no_patients": "à¤…à¤­à¥€ à¤¤à¤• à¤•à¥‹à¤ˆ à¤®à¤°à¥€à¤œ à¤¨à¤¹à¥€à¤‚",
  "admin_dashboard": "à¤à¤¡à¤®à¤¿à¤¨ à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡",
  "admin_users_title": " à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾",
  "admin_users_desc": "à¤®à¤°à¥€à¤œà¥‹à¤‚ à¤”à¤° à¤¡à¥‰à¤•à¥à¤Ÿà¤°à¥‹à¤‚ à¤•à¤¾ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¨",
  "admin_appointments_title": " à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
  "admin_appointments_desc": "à¤¸à¤­à¥€ à¤¬à¥à¤• à¤•à¤¿à¤ à¤—à¤ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
  "admin_doctors_title": " à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "admin_doctors_desc": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾ à¤”à¤° à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²",
  "admin_settings_title": " à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸",
  "admin_settings_desc": "à¤¸à¤¿à¤¸à¥à¤Ÿà¤® à¤•à¥‰à¤¨à¥à¤«à¤¼à¤¿à¤—à¤°à¥‡à¤¶à¤¨",
  "system_overview": "à¤¸à¤¿à¤¸à¥à¤Ÿà¤® à¤“à¤µà¤°à¤µà¥à¤¯à¥‚",
  "total_patients": "à¤•à¥à¤² à¤®à¤°à¥€à¤œ: 128",
  "total_doctors": " à¤•à¥à¤² à¤¡à¥‰à¤•à¥à¤Ÿà¤°: 14",
  "appointments_today": " à¤†à¤œ à¤•à¥‡ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸: 22",
  "admin_actions": "à¤à¤¡à¤®à¤¿à¤¨ à¤•à¤¾à¤°à¥à¤°à¤µà¤¾à¤‡à¤¯à¤¾à¤",
  "approve_doctors": "à¤¨à¤ à¤¡à¥‰à¤•à¥à¤Ÿà¤°à¥‹à¤‚ à¤•à¥‹ à¤®à¤‚à¤œà¤¼à¥‚à¤°à¥€ à¤¦à¥‡à¤‚",
  "monitor_logs": " à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤²à¥‰à¤—à¥à¤¸ à¤•à¥€ à¤¨à¤¿à¤—à¤°à¤¾à¤¨à¥€ à¤•à¤°à¥‡à¤‚",
  "update_guidelines": "à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤¦à¤¿à¤¶à¤¾-à¤¨à¤¿à¤°à¥à¤¦à¥‡à¤¶ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚",
  "video_call_title": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "video_call_online": "à¤‘à¤¨à¤²à¤¾à¤‡à¤¨",
  "video_call_offline": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨",
  "video_call_doctor_hint": "à¤à¤• à¤°à¥‚à¤® à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤•à¥‹à¤¡ à¤…à¤ªà¤¨à¥‡ à¤®à¤°à¥€à¤œ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¸à¤¾à¤à¤¾ à¤•à¤°à¥‡à¤‚à¥¤",
  "video_call_patient_hint": "à¤•à¥‰à¤² à¤®à¥‡à¤‚ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥‹à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤…à¤ªà¤¨à¥‡ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¤¾ à¤°à¥‚à¤® à¤•à¥‹à¤¡ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤",
  "video_call_room_code": "à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤°à¥‚à¤® à¤•à¥‹à¤¡",
  "video_call_generate": "à¤•à¥‹à¤¡ à¤¬à¤¨à¤¾à¤à¤‚",
  "video_call_signed_as": "à¤‡à¤¸ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¸à¤¾à¤‡à¤¨ à¤‡à¤¨",
  "video_call_you": "à¤†à¤ªà¤•à¤¾ à¤µà¥€à¤¡à¤¿à¤¯à¥‹",
  "video_call_remote": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° / à¤®à¤°à¥€à¤œ",
  "video_call_remote_idle": "à¤²à¤¾à¤‡à¤µ à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¶à¥à¤°à¥‚ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤°à¥‚à¤® à¤®à¥‡à¤‚ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥‹à¤‚à¥¤",
  "video_call_join": "à¤•à¥‰à¤² à¤®à¥‡à¤‚ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥‹à¤‚",
  "video_call_connecting": "à¤•à¤¨à¥‡à¤•à¥à¤Ÿ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
  "video_call_waiting": "à¤œà¥à¤¡à¤¼ à¤—à¤¯à¤¾à¥¤ à¤¦à¥‚à¤¸à¤°à¥‡ à¤¸à¤¹à¤­à¤¾à¤—à¥€ à¤•à¥€ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾...",
  "video_call_connected": "à¤œà¥à¤¡à¤¼ à¤—à¤¯à¤¾",
  "video_call_mute": "à¤®à¤¾à¤‡à¤• à¤®à¥à¤¯à¥‚à¤Ÿ",
  "video_call_unmute": "à¤®à¤¾à¤‡à¤• à¤…à¤¨à¤®à¥à¤¯à¥‚à¤Ÿ",
  "video_call_camera_off": "à¤•à¥ˆà¤®à¤°à¤¾ à¤¬à¤‚à¤¦",
  "video_call_camera_on": "à¤•à¥ˆà¤®à¤°à¤¾ à¤šà¤¾à¤²à¥‚",
  "video_call_end": "à¤•à¥‰à¤² à¤¸à¤®à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚",
  "video_call_ended": "à¤•à¥‰à¤² à¤¸à¤®à¤¾à¤ªà¥à¤¤à¥¤ à¤†à¤ª à¤•à¤­à¥€ à¤­à¥€ à¤«à¤¿à¤° à¤¸à¥‡ à¤œà¥à¤¡à¤¼ à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
  "video_call_enter_room": "à¤ªà¤¹à¤²à¥‡ à¤°à¥‚à¤® à¤•à¥‹à¤¡ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚ à¤¯à¤¾ à¤¬à¤¨à¤¾à¤à¤‚à¥¤",
  "video_call_room_not_ready": "à¤°à¥‚à¤® à¤¤à¥ˆà¤¯à¤¾à¤° à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤ à¤ªà¤¹à¤²à¥‡ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¶à¥à¤°à¥‚ à¤•à¤°à¤¨à¥‡ à¤•à¥‹ à¤•à¤¹à¥‡à¤‚à¥¤",
  "video_call_start_error": "à¤•à¥‰à¤² à¤¶à¥à¤°à¥‚ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¥€à¥¤",
  "video_call_not_supported": "à¤¯à¤¹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤¼à¤° à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤•à¥‰à¤² à¤•à¤¾ à¤¸à¤®à¤°à¥à¤¥à¤¨ à¤¨à¤¹à¥€à¤‚ à¤•à¤°à¤¤à¤¾à¥¤",
  "video_call_permission_error": "à¤•à¥ˆà¤®à¤°à¤¾/à¤®à¤¾à¤‡à¤•à¥à¤°à¥‹à¤«à¥‹à¤¨ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤…à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤¦à¥‡à¤‚à¥¤",
  "video_call_room_placeholder": "TM-AB12CD",
  "video_call_waiting_host": "à¤‡à¤¸ à¤°à¥‚à¤® à¤•à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¶à¥à¤°à¥‚ à¤•à¤¿à¤ à¤œà¤¾à¤¨à¥‡ à¤•à¥€ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾ à¤¹à¥ˆ...",
  "video_call_room_connect_error": "à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤°à¥‚à¤® à¤¸à¥‡ à¤•à¤¨à¥‡à¤•à¥à¤Ÿ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¤¾à¥¤",
  "video_call_connection_failed": "à¤•à¤¨à¥‡à¤•à¥à¤¶à¤¨ à¤Ÿà¥‚à¤Ÿ à¤—à¤¯à¤¾à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤°à¥‚à¤® à¤®à¥‡à¤‚ à¤«à¤¿à¤° à¤¸à¥‡ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥‹à¤‚à¥¤",
  "video_call_cloud_required": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤•à¥‰à¤² à¤•à¥‡ à¤²à¤¿à¤ à¤‡à¤‚à¤Ÿà¤°à¤¨à¥‡à¤Ÿ à¤”à¤° Supabase realtime à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "video_call_mic_live_status": "à¤®à¤¾à¤‡à¤• à¤šà¤¾à¤²à¥‚ à¤¹à¥ˆ",
  "video_call_mic_muted_status": "à¤®à¤¾à¤‡à¤• à¤®à¥à¤¯à¥‚à¤Ÿ à¤¹à¥ˆ",
  "video_call_camera_live_status": "à¤•à¥ˆà¤®à¤°à¤¾ à¤šà¤¾à¤²à¥‚ à¤¹à¥ˆ",
  "video_call_camera_muted_status": "à¤•à¥ˆà¤®à¤°à¤¾ à¤¬à¤‚à¤¦ à¤¹à¥ˆ",
  "video_call_leave_status": "à¤‡à¤¸ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¸à¥‡ à¤¬à¤¾à¤¹à¤° à¤¨à¤¿à¤•à¤²à¥‡à¤‚",
  "loading": "à¤²à¥‹à¤¡ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
  "please_wait": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤°à¤¤à¥€à¤•à¥à¤·à¤¾ à¤•à¤°à¥‡à¤‚...",
  "unknown_error": "à¤…à¤œà¥à¤žà¤¾à¤¤ à¤¤à¥à¤°à¥à¤Ÿà¤¿",
  "generic_error_prefix": "à¤•à¥à¤› à¤—à¤²à¤¤ à¤¹à¥‹ à¤—à¤¯à¤¾:",
  "login_invalid_doctor_credentials": "à¤—à¤²à¤¤ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¥à¤°à¥‡à¤¡à¥‡à¤‚à¤¶à¤¿à¤¯à¤²à¥à¤¸",
  "login_invalid_admin_credentials": "à¤—à¤²à¤¤ à¤à¤¡à¤®à¤¿à¤¨ à¤•à¥à¤°à¥‡à¤¡à¥‡à¤‚à¤¶à¤¿à¤¯à¤²à¥à¤¸",
  "login_invalid_pharmacy_credentials": "à¤—à¤²à¤¤ à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤•à¥à¤°à¥‡à¤¡à¥‡à¤‚à¤¶à¤¿à¤¯à¤²à¥à¤¸",
  "login_offline_pharmacy_failed": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤²à¥‰à¤—à¤¿à¤¨ à¤µà¤¿à¤«à¤² à¤°à¤¹à¤¾à¥¤ à¤ªà¤¹à¤²à¥‡ à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤²à¥‰à¤—à¤¿à¤¨ à¤•à¤°à¥‡à¤‚à¥¤",
  "login_mobile_required": "à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤° à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆ",
  "login_patient_registration_requires_internet": "à¤®à¤°à¥€à¤œ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¥‡ à¤²à¤¿à¤ à¤‡à¤‚à¤Ÿà¤°à¤¨à¥‡à¤Ÿ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "login_user_already_exists": "à¤¯à¥‚à¤œà¤¼à¤° à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤®à¥Œà¤œà¥‚à¤¦ à¤¹à¥ˆà¥¤ à¤²à¥‰à¤—à¤¿à¤¨ à¤•à¤°à¥‡à¤‚à¥¤",
  "login_offline_login_failed": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤²à¥‰à¤—à¤¿à¤¨ à¤µà¤¿à¤«à¤² à¤°à¤¹à¤¾à¥¤ à¤ªà¤¹à¤²à¥‡ à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤²à¥‰à¤—à¤¿à¤¨ à¤¯à¤¾ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¤°à¥‡à¤‚à¥¤",
  "login_pharmacy_table_missing": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤²à¥‰à¤—à¤¿à¤¨ à¤µà¤¿à¤«à¤²: pharmacies table à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¥€à¥¤",
  "login_pharmacy_rls_denied": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤²à¥‰à¤—à¤¿à¤¨ à¤µà¤¿à¤«à¤²: à¤à¤•à¥à¤¸à¥‡à¤¸ à¤…à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤à¥¤",
  "login_pharmacy_failed_prefix": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤²à¥‰à¤—à¤¿à¤¨ à¤µà¤¿à¤«à¤²:",
  "appointments_page_title": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤”à¤° à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤•à¥à¤¯à¥‚",
  "appointments_offline_mode_active": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤®à¥‹à¤¡ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¹à¥ˆà¥¤ à¤¨à¤ˆ à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¬à¤¾à¤¦ à¤®à¥‡à¤‚ à¤¸à¤¿à¤‚à¤• à¤¹à¥‹à¤—à¥€à¥¤",
  "appointments_book_title": "à¤Ÿà¥‹à¤•à¤¨ / à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ",
  "appointments_select_doctor": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤šà¥à¤¨à¥‡à¤‚",
  "appointments_date": "à¤¤à¤¾à¤°à¥€à¤–",
  "appointments_time": "à¤¸à¤®à¤¯",
  "appointments_symptoms_issue": "à¤²à¤•à¥à¤·à¤£ / à¤¸à¤®à¤¸à¥à¤¯à¤¾",
  "appointments_booking": "à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¹à¥‹ à¤°à¤¹à¥€ à¤¹à¥ˆ...",
  "appointments_book_token": "à¤Ÿà¥‹à¤•à¤¨ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚",
  "appointments_my_tokens": "à¤®à¥‡à¤°à¥‡ à¤Ÿà¥‹à¤•à¤¨",
  "appointments_none": "à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "appointments_token_prefix": "à¤Ÿà¥‹à¤•à¤¨",
  "appointments_status": "à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
  "appointments_booked": "booked",
  "appointments_sync_pending": "à¤¸à¤¿à¤‚à¤•: à¤…à¤ªà¤²à¥‹à¤¡ à¤¬à¤¾à¤•à¥€",
  "appointments_symptoms": "à¤²à¤•à¥à¤·à¤£",
  "appointments_code": "à¤•à¥‹à¤¡",
  "appointments_join_video": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤œà¥‰à¤‡à¤¨ à¤•à¤°à¥‡à¤‚",
  "appointments_open_text_consultation": "à¤Ÿà¥‡à¤•à¥à¤¸à¥à¤Ÿ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤–à¥‹à¤²à¥‡à¤‚",
  "appointments_patient_queue": "à¤®à¤°à¥€à¤œ à¤•à¥à¤¯à¥‚",
  "appointments_no_patients_queue": "à¤•à¥à¤¯à¥‚ à¤®à¥‡à¤‚ à¤•à¥‹à¤ˆ à¤®à¤°à¥€à¤œ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "appointments_text_consult": "à¤Ÿà¥‡à¤•à¥à¤¸à¥à¤Ÿ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "appointments_video_consult_code": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ + à¤•à¥‹à¤¡",
  "appointments_share_code": "à¤•à¥‹à¤¡ à¤¸à¤¾à¤à¤¾ à¤•à¤°à¥‡à¤‚",
  "appointments_mark_completed": "à¤ªà¥‚à¤°à¥à¤£ à¤•à¤°à¥‡à¤‚",
  "appointments_patient_code": "à¤®à¤°à¥€à¤œ à¤•à¥‹à¤¡",
  "appointments_shared": "à¤¸à¤¾à¤à¤¾",
  "appointments_fill_date_time_symptoms": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¤à¤¾à¤°à¥€à¤–, à¤¸à¤®à¤¯ à¤”à¤° à¤²à¤•à¥à¤·à¤£ à¤­à¤°à¥‡à¤‚à¥¤",
  "appointments_patient_mobile_missing": "session à¤®à¥‡à¤‚ à¤®à¤°à¥€à¤œ à¤•à¤¾ à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤° à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "appointments_token_booked_success": "à¤Ÿà¥‹à¤•à¤¨ à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤¬à¥à¤• à¤¹à¥‹ à¤—à¤¯à¤¾à¥¤",
  "appointments_token_saved_offline": "à¤Ÿà¥‹à¤•à¤¨ à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤¸à¥‡à¤µ à¤¹à¥‹ à¤—à¤¯à¤¾à¥¤",
  "appointments_booking_failed_prefix": "à¤¬à¥à¤•à¤¿à¤‚à¤— à¤µà¤¿à¤«à¤²:",
  "appointments_cloud_required_online": "Supabase cloud à¤”à¤° à¤‡à¤‚à¤Ÿà¤°à¤¨à¥‡à¤Ÿ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "appointments_unable_start_text": "à¤Ÿà¥‡à¤•à¥à¤¸à¥à¤Ÿ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¶à¥à¤°à¥‚ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¤¾à¥¤",
  "appointments_unable_start_video": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¶à¥à¤°à¥‚ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¤¾à¥¤",
  "appointments_unable_mark_completed": "à¤ªà¥‚à¤°à¥à¤£ à¤šà¤¿à¤¹à¥à¤¨à¤¿à¤¤ à¤¨à¤¹à¥€à¤‚ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾ à¤¸à¤•à¤¾à¥¤",
  "appointments_generate_video_code_first": "à¤ªà¤¹à¤²à¥‡ video code à¤¬à¤¨à¤¾à¤à¤‚à¥¤",
  "appointments_code_copied": "à¤•à¥‹à¤¡ à¤•à¥‰à¤ªà¥€ à¤¹à¥‹ à¤—à¤¯à¤¾à¥¤",
  "appointments_share_this_code": "à¤¯à¤¹ à¤•à¥‹à¤¡ à¤¸à¤¾à¤à¤¾ à¤•à¤°à¥‡à¤‚:",
  "chat_title": "à¤Ÿà¥‡à¤•à¥à¤¸à¥à¤Ÿ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "chat_invalid_consultation": "à¤…à¤®à¤¾à¤¨à¥à¤¯ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶à¥¤ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤•à¥à¤¯à¥‚ à¤¸à¥‡ à¤šà¥ˆà¤Ÿ à¤–à¥‹à¤²à¥‡à¤‚à¥¤",
  "chat_cloud_required": "à¤šà¥ˆà¤Ÿ à¤•à¥‡ à¤²à¤¿à¤ cloud connection à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "chat_no_messages": "à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤¸à¤‚à¤¦à¥‡à¤¶ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "chat_type_message": "à¤¸à¤‚à¤¦à¥‡à¤¶ à¤²à¤¿à¤–à¥‡à¤‚...",
  "chat_send": "à¤­à¥‡à¤œà¥‡à¤‚",
  "chat_unable_send": "à¤¸à¤‚à¤¦à¥‡à¤¶ à¤­à¥‡à¤œà¤¾ à¤¨à¤¹à¥€à¤‚ à¤œà¤¾ à¤¸à¤•à¤¾à¥¤",
  "pharmacy_owner_not_found": "owner pharmacy à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¥€à¥¤",
  "pharmacy_enter_valid_medicine_units": "à¤®à¤¾à¤¨à¥à¤¯ à¤¦à¤µà¤¾ à¤”à¤° units à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤",
  "pharmacy_owner_fields_required": "à¤¨à¤¾à¤®, owner email à¤”à¤° password à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¤‚à¥¤",
  "pharmacy_owner_created": "pharmacy owner à¤¬à¤¨ à¤—à¤¯à¤¾à¥¤",
  "pharmacy_not_configured": "Supabase configure à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "pharmacy_internet_required": "cloud pharmacy data à¤•à¥‡ à¤²à¤¿à¤ internet à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "pharmacy_create_owner_admin": "Pharmacy Owner à¤¬à¤¨à¤¾à¤à¤‚ (Admin)",
  "pharmacy_name": "Pharmacy Name",
  "pharmacy_area": "à¤•à¥à¤·à¥‡à¤¤à¥à¤°",
  "pharmacy_owner_email": "Owner Email",
  "pharmacy_owner_password": "Owner Password",
  "pharmacy_create_owner": "Owner à¤¬à¤¨à¤¾à¤à¤‚",
  "pharmacy_update_stock": "Medicine Stock à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚",
  "pharmacy_logged_in_as": "à¤²à¥‰à¤—à¤¿à¤¨ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¹à¥ˆ",
  "pharmacy_medicine_name": "Medicine Name (à¤‰à¤¦à¤¾: Paracetamol)",
  "pharmacy_units": "Units",
  "pharmacy_update_units": "Units à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚",
  "admin_cloud_connection_required": "cloud connection à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "admin_not_configured": "Supabase configure à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤ env keys à¤¸à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚à¥¤",
  "admin_offline_paused": "à¤†à¤ª offline à¤¹à¥ˆà¤‚à¥¤ Admin live sync à¤°à¥à¤•à¤¾ à¤¹à¥ˆà¥¤",
  "admin_total_patients_short": "à¤•à¥à¤² à¤®à¤°à¥€à¤œ",
  "admin_doctors_short": "à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "admin_appointments_today_short": "à¤†à¤œ à¤•à¥‡ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ",
  "admin_active_consults": "à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "admin_completed_cases": "à¤ªà¥‚à¤°à¥à¤£ à¤®à¤¾à¤®à¤²à¥‡",
  "admin_operational_controls": "à¤¸à¤‚à¤šà¤¾à¤²à¤¨ à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤£",
  "admin_open_appointment_queue": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤•à¥à¤¯à¥‚ à¤–à¥‹à¤²à¥‡à¤‚",
  "admin_view_patient_records": "à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¦à¥‡à¤–à¥‡à¤‚",
  "admin_pharmacy_monitor": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤®à¥‰à¤¨à¤¿à¤Ÿà¤°",
  "admin_doctor_workload": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¤¾à¤°à¥à¤¯à¤­à¤¾à¤°",
  "admin_live_appointment_monitor": "à¤²à¤¾à¤‡à¤µ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤®à¥‰à¤¨à¤¿à¤Ÿà¤°",
  "admin_no_appointments_found": "à¤•à¥‹à¤ˆ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾à¥¤",
  "admin_force_complete": "à¤œà¤¬à¤°à¤¨ à¤ªà¥‚à¤°à¥à¤£ à¤•à¤°à¥‡à¤‚",
  "read_aloud": "à¤œà¥‹à¤° à¤¸à¥‡ à¤ªà¤¢à¤¼à¥‡à¤‚",
  "voice_listening": "à¤¸à¥à¤¨ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
  "symptom_voice_not_supported": "à¤‡à¤¸ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤¼à¤° à¤®à¥‡à¤‚ à¤µà¥‰à¤‡à¤¸ à¤‡à¤¨à¤ªà¥à¤Ÿ à¤¸à¤®à¤°à¥à¤¥à¤¿à¤¤ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "symptom_enter_text_or_image": "à¤ªà¤¹à¤²à¥‡ à¤²à¤•à¥à¤·à¤£ à¤²à¤¿à¤–à¥‡à¤‚ à¤¯à¤¾ à¤à¤• à¤›à¤µà¤¿ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_unable_process_image": "à¤›à¤µà¤¿ à¤•à¥‹ à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤ªà¥à¤°à¥‹à¤¸à¥‡à¤¸ à¤¨à¤¹à¥€à¤‚ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾ à¤¸à¤•à¤¾à¥¤",
  "symptom_on_device_ai_info": "On-device AI à¤‡à¤¸ à¤à¤ª à¤ªà¤° à¤ªà¥‚à¤°à¥€ à¤¤à¤°à¤¹ à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤•à¤¾à¤® à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤¬à¥‡à¤¹à¤¤à¤° à¤¸à¤Ÿà¥€à¤•à¤¤à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¹à¥‹à¤¨à¥‡ à¤ªà¤° Online AI à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤",
  "symptom_text_placeholder": "à¤²à¤•à¥à¤·à¤£ à¤²à¤¿à¤–à¥‡à¤‚ (à¤‰à¤¦à¤¾à¤¹à¤°à¤£: 2 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤¸à¥‡ à¤¬à¥à¤–à¤¾à¤°, à¤–à¤¾à¤‚à¤¸à¥€, à¤—à¤²à¥‡ à¤®à¥‡à¤‚ à¤¦à¤°à¥à¤¦)",
  "symptom_speak_button": "à¤²à¤•à¥à¤·à¤£ à¤¬à¥‹à¤²à¥‡à¤‚",
  "symptom_read_result": "à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤ªà¤¢à¤¼à¥‡à¤‚",
  "symptom_image_label": "à¤›à¤µà¤¿",
  "symptom_analyzing": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
  "symptom_check_offline": "à¤²à¤•à¥à¤·à¤£ à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤œà¤¾à¤‚à¤šà¥‡à¤‚",
  "symptom_result": "à¤ªà¤°à¤¿à¤£à¤¾à¤®",
  "symptom_engine": "à¤‡à¤‚à¤œà¤¨",
  "symptom_engine_ai": "AI (OpenAI)",
  "symptom_engine_offline": "On-device Offline AI",
  "symptom_probable_disease": "à¤¸à¤‚à¤­à¤¾à¤µà¤¿à¤¤ à¤°à¥‹à¤—",
  "symptom_natural_remedy": "à¤ªà¥à¤°à¤¾à¤•à¥ƒà¤¤à¤¿à¤• à¤‰à¤ªà¤¾à¤¯",
  "symptom_doctor_guidance": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨",
  "symptom_confidence": "à¤µà¤¿à¤¶à¥à¤µà¤¸à¤¨à¥€à¤¯à¤¤à¤¾",
  "symptom_serious_detected": "à¤—à¤‚à¤­à¥€à¤° à¤²à¤•à¥à¤·à¤£ à¤ªà¤¾à¤ à¤—à¤: à¤¤à¥à¤°à¤‚à¤¤ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_red_flags": "à¤°à¥‡à¤¡ à¤«à¥à¤²à¥ˆà¤—à¥à¤¸",
  "symptom_image_hint": "à¤›à¤µà¤¿ à¤¸à¤‚à¤•à¥‡à¤¤",
  "symptom_emergency_warning": "à¤¤à¥‡à¤œ à¤¸à¥€à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¦à¤°à¥à¤¦, à¤¸à¤¾à¤‚à¤¸ à¤²à¥‡à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¤à¤•à¤²à¥€à¤«, à¤­à¥à¤°à¤® à¤¯à¤¾ à¤²à¤—à¤¾à¤¤à¤¾à¤° à¤¤à¥‡à¤œ à¤¬à¥à¤–à¤¾à¤° à¤œà¥ˆà¤¸à¥‡ à¤¸à¤‚à¤•à¥‡à¤¤à¥‹à¤‚ à¤ªà¤° à¤¤à¥à¤°à¤‚à¤¤ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤œà¤¾à¤à¤‚à¥¤",
  "symptom_recent_checks": "à¤¹à¤¾à¤² à¤•à¥€ à¤œà¤¾à¤‚à¤šà¥‡à¤‚",
  "appointment_list_all": "à¤¸à¤­à¥€ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸ (à¤•à¥à¤¯à¥‚ à¤¦à¥ƒà¤¶à¥à¤¯)",
  "appointment_list_patient": "à¤®à¤°à¥€à¤œ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
  "appointment_list_reason": "à¤•à¤¾à¤°à¤£",
  "symptom_rule_viral_fever_disease": "à¤µà¤¾à¤¯à¤°à¤² à¤¬à¥à¤–à¤¾à¤°",
  "symptom_rule_viral_fever_remedy": "à¤—à¤°à¥à¤® à¤¤à¤°à¤² à¤ªà¤¿à¤à¤‚, à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤†à¤°à¤¾à¤® à¤•à¤°à¥‡à¤‚, à¤”à¤° à¤¤à¤¾à¤ªà¤®à¤¾à¤¨ à¤ªà¤° à¤¨à¤œà¤° à¤°à¤–à¥‡à¤‚à¥¤",
  "symptom_rule_viral_fever_advice": "à¤¯à¤¦à¤¿ à¤¬à¥à¤–à¤¾à¤° 102F à¤¸à¥‡ à¤Šà¤ªà¤° à¤¹à¥‹ à¤¯à¤¾ 2 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤°à¤¹à¥‡ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_rule_cold_disease": "à¤¸à¤¾à¤§à¤¾à¤°à¤£ à¤¸à¤°à¥à¤¦à¥€ / à¤Šà¤ªà¤°à¥€ à¤¶à¥à¤µà¤¸à¤¨ à¤¸à¤‚à¤•à¥à¤°à¤®à¤£",
  "symptom_rule_cold_remedy": "à¤­à¤¾à¤ª à¤²à¥‡à¤‚, à¤¶à¤¹à¤¦ à¤”à¤° à¤…à¤¦à¤°à¤• à¤•à¥‡ à¤¸à¤¾à¤¥ à¤—à¤°à¥à¤® à¤ªà¤¾à¤¨à¥€ à¤ªà¤¿à¤à¤‚, à¤”à¤° à¤¶à¤°à¥€à¤° à¤•à¥‹ à¤¹à¤¾à¤‡à¤¡à¥à¤°à¥‡à¤Ÿ à¤°à¤–à¥‡à¤‚à¥¤",
  "symptom_rule_cold_advice": "à¤¯à¤¦à¤¿ à¤¸à¤¾à¤‚à¤¸ à¤²à¥‡à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¦à¤¿à¤•à¥à¤•à¤¤, à¤¸à¥€à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¦à¤°à¥à¤¦, à¤¯à¤¾ à¤¤à¥‡à¤œ à¤¬à¥à¤–à¤¾à¤° à¤¹à¥‹ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¥‹ à¤¦à¤¿à¤–à¤¾à¤à¤‚à¥¤",
  "symptom_rule_headache_disease": "à¤¤à¤¨à¤¾à¤µ à¤¸à¤¿à¤°à¤¦à¤°à¥à¤¦ / à¤®à¤¾à¤‡à¤—à¥à¤°à¥‡à¤¨",
  "symptom_rule_headache_remedy": "à¤…à¤‚à¤§à¥‡à¤°à¥‡ à¤”à¤° à¤¶à¤¾à¤‚à¤¤ à¤•à¤®à¤°à¥‡ à¤®à¥‡à¤‚ à¤†à¤°à¤¾à¤® à¤•à¤°à¥‡à¤‚, à¤ªà¤¾à¤¨à¥€ à¤ªà¤¿à¤à¤‚, à¤”à¤° à¤œà¥à¤žà¤¾à¤¤ à¤Ÿà¥à¤°à¤¿à¤—à¤°à¥à¤¸ à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚à¥¤",
  "symptom_rule_headache_advice": "à¤¯à¤¦à¤¿ à¤¬à¤¾à¤°-à¤¬à¤¾à¤° à¤¤à¥‡à¤œ à¤¸à¤¿à¤°à¤¦à¤°à¥à¤¦ à¤¯à¤¾ à¤¦à¥ƒà¤·à¥à¤Ÿà¤¿ à¤®à¥‡à¤‚ à¤¬à¤¦à¤²à¤¾à¤µ à¤¹à¥‹ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¸à¤²à¤¾à¤¹ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_gastro_disease": "à¤—à¥ˆà¤¸à¥à¤Ÿà¥à¤°à¥‹à¤à¤‚à¤Ÿà¥‡à¤°à¤¾à¤‡à¤Ÿà¤¿à¤¸ / à¤«à¥‚à¤¡ à¤ªà¥‰à¤‡à¤œà¤¼à¤¨à¤¿à¤‚à¤—",
  "symptom_rule_gastro_remedy": "ORS à¤²à¥‡à¤‚, à¤¹à¤²à¥à¤•à¤¾ à¤­à¥‹à¤œà¤¨ à¤•à¤°à¥‡à¤‚, à¤¨à¤¾à¤°à¤¿à¤¯à¤² à¤ªà¤¾à¤¨à¥€ à¤ªà¤¿à¤à¤‚, à¤”à¤° à¤¤à¤²à¤¾-à¤­à¥à¤¨à¤¾ à¤¯à¤¾ à¤®à¤¸à¤¾à¤²à¥‡à¤¦à¤¾à¤° à¤­à¥‹à¤œà¤¨ à¤¨ à¤–à¤¾à¤à¤‚à¥¤",
  "symptom_rule_gastro_advice": "à¤¯à¤¦à¤¿ à¤®à¤² à¤®à¥‡à¤‚ à¤–à¥‚à¤¨, à¤²à¤—à¤¾à¤¤à¤¾à¤° à¤‰à¤²à¥à¤Ÿà¥€, à¤¯à¤¾ à¤¡à¤¿à¤¹à¤¾à¤‡à¤¡à¥à¤°à¥‡à¤¶à¤¨ à¤¹à¥‹ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¥‹ à¤¦à¤¿à¤–à¤¾à¤à¤‚à¥¤",
  "symptom_rule_skin_disease": "à¤¤à¥à¤µà¤šà¤¾ à¤à¤²à¤°à¥à¤œà¥€ / à¤¡à¤°à¥à¤®à¥‡à¤Ÿà¤¾à¤‡à¤Ÿà¤¿à¤¸",
  "symptom_rule_skin_remedy": "à¤¤à¥à¤µà¤šà¤¾ à¤•à¥‹ à¤ à¤‚à¤¡à¤¾ à¤”à¤° à¤¸à¥‚à¤–à¤¾ à¤°à¤–à¥‡à¤‚, à¤¹à¤²à¥à¤•à¤¾ moisturizer à¤²à¤—à¤¾à¤à¤‚, à¤”à¤° irritant à¤‰à¤¤à¥à¤ªà¤¾à¤¦à¥‹à¤‚ à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚à¥¤",
  "symptom_rule_skin_advice": "à¤¯à¤¦à¤¿ à¤°à¥ˆà¤¶ à¤¤à¥‡à¤œà¥€ à¤¸à¥‡ à¤«à¥ˆà¤²à¥‡, à¤°à¤¿à¤¸à¥‡, à¤¯à¤¾ à¤¸à¥‚à¤œà¤¨ à¤¹à¥‹ à¤¤à¥‹ à¤¤à¥à¤µà¤šà¤¾ à¤µà¤¿à¤¶à¥‡à¤·à¤œà¥à¤ž à¤¸à¥‡ à¤®à¤¿à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_cardio_disease": "à¤¸à¤‚à¤­à¤¾à¤µà¤¿à¤¤ à¤¹à¥ƒà¤¦à¤¯-à¤¶à¥à¤µà¤¸à¤¨ à¤†à¤ªà¤¾à¤¤ à¤¸à¥à¤¥à¤¿à¤¤à¤¿",
  "symptom_rule_cardio_remedy": "à¤‡à¤¸ à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥‹à¤ˆ à¤˜à¤°à¥‡à¤²à¥‚ à¤‰à¤ªà¤šà¤¾à¤° à¤¸à¤²à¤¾à¤¹ à¤¨à¤¹à¥€à¤‚ à¤¦à¥€ à¤œà¤¾à¤¤à¥€à¥¤",
  "symptom_rule_cardio_advice": "à¤¤à¥à¤°à¤‚à¤¤ à¤†à¤ªà¤¾à¤¤ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "symptom_generic_disease": "à¤—à¥ˆà¤°-à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤²à¤•à¥à¤·à¤£ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨",
  "symptom_generic_remedy": "à¤ªà¤¾à¤¨à¥€ à¤ªà¤¿à¤à¤‚, à¤¹à¤²à¥à¤•à¤¾ à¤ªà¥Œà¤·à¥à¤Ÿà¤¿à¤• à¤­à¥‹à¤œà¤¨ à¤²à¥‡à¤‚, à¤”à¤° à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤†à¤°à¤¾à¤® à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_generic_advice": "à¤¯à¤¦à¤¿ à¤²à¤•à¥à¤·à¤£ 24-48 à¤˜à¤‚à¤Ÿà¥‡ à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤°à¤¹à¥‡à¤‚ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_serious_pattern_advice": "à¤—à¤‚à¤­à¥€à¤° à¤²à¤•à¥à¤·à¤£ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤ªà¤¾à¤¯à¤¾ à¤—à¤¯à¤¾à¥¤ à¤¤à¥à¤°à¤‚à¤¤ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_potential_emergency_pattern": "à¤¸à¤‚à¤­à¤¾à¤µà¤¿à¤¤ à¤†à¤ªà¤¾à¤¤ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨",
  "symptom_no_image_uploaded": "à¤•à¥‹à¤ˆ à¤›à¤µà¤¿ à¤…à¤ªà¤²à¥‹à¤¡ à¤¨à¤¹à¥€à¤‚ à¤•à¥€ à¤—à¤ˆà¥¤",
  "symptom_risk_reason_low": "à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤µà¥ƒà¤•à¥à¤· à¤®à¥‡à¤‚ à¤•à¥‹à¤ˆ à¤‰à¤šà¥à¤š-à¤œà¥‹à¤–à¤¿à¤® à¤¶à¤¾à¤–à¤¾ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¨à¤¹à¥€à¤‚ à¤¹à¥à¤ˆà¥¤",
  "symptom_risk_reason_medium": "à¤®à¤§à¥à¤¯à¤® à¤œà¥‹à¤–à¤¿à¤® à¤²à¤•à¥à¤·à¤£ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤•à¤¾ à¤ªà¤¤à¤¾ à¤šà¤²à¤¾à¥¤",
  "symptom_risk_reason_high": "à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤²à¤•à¥à¤·à¤£ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤•à¤¾ à¤ªà¤¤à¤¾ à¤šà¤²à¤¾ (à¤¹à¥ƒà¤¦à¤¯-à¤¶à¥à¤µà¤¸à¤¨ à¤¯à¤¾ à¤¨à¥à¤¯à¥‚à¤°à¥‹à¤²à¥‰à¤œà¤¿à¤• à¤°à¥‡à¤¡ à¤«à¤¼à¥à¤²à¥ˆà¤—)à¥¤",
  "symptom_risk_value_low": "à¤•à¤®",
  "symptom_risk_value_medium": "à¤®à¤§à¥à¤¯à¤®",
  "symptom_risk_value_high": "à¤‰à¤šà¥à¤š",
  "symptom_image_hint_skin_name": "à¤›à¤µà¤¿ à¤•à¤¾ à¤¨à¤¾à¤® à¤¤à¥à¤µà¤šà¤¾ à¤•à¥€ à¤¸à¤®à¤¸à¥à¤¯à¤¾ à¤•à¤¾ à¤¸à¤‚à¤•à¥‡à¤¤ à¤¦à¥‡à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤°à¥ˆà¤¶ à¤¯à¤¾ à¤à¤²à¤°à¥à¤œà¥€ à¤œà¥ˆà¤¸à¤¾ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤",
  "symptom_image_hint_red_tone": "à¤›à¤µà¤¿ à¤®à¥‡à¤‚ à¤…à¤§à¤¿à¤• à¤²à¤¾à¤² à¤°à¤‚à¤— à¤µà¤¾à¤²à¥‡ à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤¹à¥ˆà¤‚à¥¤ à¤¯à¤¹ à¤œà¤²à¤¨, à¤°à¥ˆà¤¶ à¤¯à¤¾ à¤¸à¥‚à¤œà¤¨ à¤¸à¥‡ à¤®à¥‡à¤² à¤–à¤¾ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤",
  "symptom_image_hint_dark": "à¤›à¤µà¤¿ à¤•à¤¾à¤«à¥€ à¤…à¤‚à¤§à¥‡à¤°à¥€ à¤¹à¥ˆ; à¤µà¤¿à¤µà¤°à¤£ à¤¸à¥€à¤®à¤¿à¤¤ à¤¹à¥ˆà¤‚à¥¤ à¤¬à¥‡à¤¹à¤¤à¤° à¤°à¥‹à¤¶à¤¨à¥€ à¤®à¥‡à¤‚ à¤¤à¤¸à¥à¤µà¥€à¤° à¤²à¥‡à¤‚à¥¤",
  "symptom_image_hint_none": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤›à¤µà¤¿ à¤œà¤¾à¤‚à¤š à¤®à¥‡à¤‚ à¤•à¥‹à¤ˆ à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤¦à¥ƒà¤¶à¥à¤¯ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾à¥¤",
  "symptom_voice_issue_prefix": "à¤¸à¤‚à¤­à¤¾à¤µà¤¿à¤¤ à¤¸à¤®à¤¸à¥à¤¯à¤¾:",
  "symptom_voice_remedy_prefix": "à¤ªà¥à¤°à¤¾à¤•à¥ƒà¤¤à¤¿à¤• à¤‰à¤ªà¤¾à¤¯:",
  "symptom_voice_advice_prefix": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¤²à¤¾à¤¹:",
  "symptom_not_clear": "à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤¨à¤¹à¥€à¤‚",
  "symptom_none": "à¤•à¥‹à¤ˆ à¤¨à¤¹à¥€à¤‚",
  "symptom_consult_if_needed": "à¤œà¤°à¥‚à¤°à¤¤ à¤¹à¥‹ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤¸à¤²à¤¾à¤¹ à¤²à¥‡à¤‚",
  "symptom_age_placeholder": "à¤‰à¤®à¥à¤° (à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤•, à¤œà¥‹à¤–à¤¿à¤® à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨ à¤®à¥‡à¤‚ à¤¸à¥à¤§à¤¾à¤° à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ)",
  "symptom_risk_level": "à¤œà¥‹à¤–à¤¿à¤® à¤¸à¥à¤¤à¤°",
  "symptom_safety_note": "à¤¸à¥à¤°à¤•à¥à¤·à¤¾ à¤¨à¥‹à¤Ÿ",
  "symptom_confidence_low": "à¤•à¤®",
  "symptom_confidence_medium": "à¤®à¤§à¥à¤¯à¤®",
  "symptom_confidence_high": "à¤‰à¤šà¥à¤š",
  "symptom_rule_viral_fever_remedy": "à¤…à¤šà¥à¤›à¥€ à¤¤à¤°à¤¹ à¤¹à¤¾à¤‡à¤¡à¥à¤°à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚, à¤†à¤°à¤¾à¤® à¤•à¤°à¥‡à¤‚, à¤”à¤° à¤¤à¤¾à¤ªà¤®à¤¾à¤¨ à¤•à¥€ à¤¨à¤¿à¤—à¤°à¤¾à¤¨à¥€ à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_rule_viral_fever_advice": "à¤¯à¤¦à¤¿ à¤¬à¥à¤–à¤¾à¤° 2 à¤¦à¤¿à¤¨ à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤°à¤¹à¥‡ à¤¯à¤¾ à¤¨à¤ à¤²à¤•à¥à¤·à¤£ à¤¦à¤¿à¤–à¥‡à¤‚ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_cold_cough_remedy": "à¤—à¤°à¥à¤® à¤¤à¤°à¤² à¤ªà¤¦à¤¾à¤°à¥à¤¥, à¤­à¤¾à¤ª à¤¸à¤¾à¤à¤¸ à¤²à¥‡à¤¨à¤¾, à¤”à¤° à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤†à¤°à¤¾à¤® à¤®à¤¦à¤¦ à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤",
  "symptom_rule_cold_cough_advice": "à¤¯à¤¦à¤¿ à¤¸à¤¾à¤‚à¤¸ à¤²à¥‡à¤¨à¥‡ à¤®à¥‡à¤‚ à¤¦à¤¿à¤•à¥à¤•à¤¤, à¤¤à¥‡à¤œ à¤¬à¥à¤–à¤¾à¤°, à¤¯à¤¾ à¤²à¤—à¤¾à¤¤à¤¾à¤° à¤–à¤¾à¤‚à¤¸à¥€ à¤¹à¥‹ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_migraine_headache_remedy": "à¤¶à¤¾à¤‚à¤¤ à¤…à¤‚à¤§à¥‡à¤°à¥‡ à¤•à¤®à¤°à¥‡ à¤®à¥‡à¤‚ à¤†à¤°à¤¾à¤® à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤¹à¤¾à¤‡à¤¡à¥à¤°à¥‡à¤Ÿà¥‡à¤¡ à¤°à¤¹à¥‡à¤‚à¥¤",
  "symptom_rule_migraine_headache_advice": "à¤¯à¤¦à¤¿ à¤¸à¤¿à¤°à¤¦à¤°à¥à¤¦ à¤—à¤‚à¤­à¥€à¤°, à¤¬à¤¾à¤°-à¤¬à¤¾à¤°, à¤¯à¤¾ à¤¨à¥à¤¯à¥‚à¤°à¥‹à¤²à¥‰à¤œà¤¿à¤• à¤²à¤•à¥à¤·à¤£à¥‹à¤‚ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¹à¥‹ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_gastro_issue_remedy": "à¤®à¥Œà¤–à¤¿à¤• à¤ªà¥à¤¨à¤°à¥à¤œà¤²à¥€à¤•à¤°à¤£, à¤¹à¤²à¥à¤•à¤¾ à¤†à¤¹à¤¾à¤°, à¤”à¤° à¤¤à¥ˆà¤²à¥€à¤¯ à¤­à¥‹à¤œà¤¨ à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚à¥¤",
  "symptom_rule_gastro_issue_advice": "à¤¯à¤¦à¤¿ à¤‰à¤²à¥à¤Ÿà¥€ à¤¬à¤¨à¥€ à¤°à¤¹à¥‡, à¤¨à¤¿à¤°à¥à¤œà¤²à¥€à¤•à¤°à¤£ à¤¬à¤¿à¤—à¤¡à¤¼à¥‡, à¤¯à¤¾ à¤°à¤•à¥à¤¤ à¤¦à¤¿à¤–à¥‡ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_skin_allergy_remedy": "à¤Ÿà¥à¤°à¤¿à¤—à¤° à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚, à¤¤à¥à¤µà¤šà¤¾ à¤•à¥‹ à¤¸à¤¾à¤« à¤°à¤–à¥‡à¤‚, à¤”à¤° à¤¶à¤¾à¤‚à¤¤à¤¿à¤¦à¤¾à¤¯à¤• à¤¦à¥‡à¤–à¤­à¤¾à¤² à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¥‡à¤‚à¥¤",
  "symptom_rule_skin_allergy_advice": "à¤¯à¤¦à¤¿ à¤°à¥ˆà¤¶ à¤¤à¥‡à¤œà¥€ à¤¸à¥‡ à¤«à¥ˆà¤²à¥‡, à¤ªà¤¾à¤¨à¥€ à¤†à¤, à¤¯à¤¾ à¤¸à¥‚à¤œà¤¨ à¤¦à¤¿à¤–à¥‡ à¤¤à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_cardio_respiratory_remedy": "à¤ªà¤°à¤¿à¤¶à¥à¤°à¤® à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚ à¤”à¤° à¤›à¤¾à¤¤à¥€ à¤¯à¤¾ à¤¸à¤¾à¤‚à¤¸ à¤²à¥‡à¤¨à¥‡ à¤•à¥‡ à¤²à¤•à¥à¤·à¤£à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¤¤à¥à¤•à¤¾à¤² à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤²à¥‡à¤‚à¥¤",
  "symptom_rule_cardio_respiratory_advice": "à¤›à¤¾à¤¤à¥€ à¤•à¥‡ à¤¦à¤°à¥à¤¦ à¤¯à¤¾ à¤¸à¤¾à¤‚à¤¸ à¤²à¥‡à¤¨à¥‡ à¤®à¥‡à¤‚ à¤•à¤ à¤¿à¤¨à¤¾à¤ˆ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¤¤à¥à¤•à¤¾à¤² à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¯à¤¾ à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤¦à¥‡à¤–à¤­à¤¾à¤² à¤•à¥€ à¤¸à¤²à¤¾à¤¹ à¤¦à¥€ à¤œà¤¾à¤¤à¥€ à¤¹à¥ˆà¥¤",
  "specialty_general_medicine": "à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾",
  "specialty_dermatology": "à¤¤à¥à¤µà¤šà¤¾ à¤µà¤¿à¤œà¥à¤žà¤¾à¤¨",
  "specialty_pediatrics": "à¤¬à¤¾à¤² à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾",
  "doctor_kumar": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¥à¤®à¤¾à¤°",
  "doctor_anjali": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤…à¤‚à¤œà¤²à¤¿",
  "doctor_arun": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤…à¤°à¥à¤£",
  "home_analytics_title": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
  "home_analytics_desc": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤°à¥à¤à¤¾à¤¨ à¤”à¤° à¤²à¤•à¥à¤·à¤£ à¤¸à¤‚à¤¬à¤‚à¤§à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤¦à¥‡à¤–à¥‡à¤‚à¥¤",
  "admin_analytics_button": "à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£ à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡",
  "doctor_availability_title": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾",
  "doctor_availability_live": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤”à¤° à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤•à¥‡ à¤†à¤§à¤¾à¤° à¤ªà¤° à¤²à¤¾à¤‡à¤µ à¤¸à¥à¤¥à¤¿à¤¤à¤¿à¥¤",
  "doctor_availability_offline": "à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨ à¤®à¥‹à¤¡: à¤…à¤‚à¤¤à¤¿à¤® à¤¸à¤¿à¤‚à¤•/à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¦à¤¿à¤–à¤¾à¤ à¤œà¤¾ à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚à¥¤",
  "doctor_availability_status_available": "à¤‰à¤ªà¤²à¤¬à¥à¤§",
  "doctor_availability_status_in_consultation": "à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤®à¥‡à¤‚",
  "doctor_availability_specialty": "à¤µà¤¿à¤¶à¥‡à¤·à¤œà¥à¤žà¤¤à¤¾",
  "doctor_availability_total_consults": "à¤•à¥à¤² à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "doctor_availability_active_consults": "à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "doctor_availability_completed": "à¤ªà¥‚à¤°à¥à¤£",
  "doctor_availability_upcoming_queue": "à¤†à¤—à¤¾à¤®à¥€ à¤•à¤¤à¤¾à¤°",
  "doctor_availability_next_slot": "à¤…à¤—à¤²à¤¾ à¤¸à¥à¤²à¥‰à¤Ÿ",
  "doctor_availability_no_upcoming_slot": "à¤•à¥‹à¤ˆ à¤†à¤—à¤¾à¤®à¥€ à¤¸à¥à¤²à¥‰à¤Ÿ à¤¨à¤¹à¥€à¤‚",
  "doctor_analytics_title": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
  "condition_general_non_specific": "à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤—à¥ˆà¤°-à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤²à¤•à¥à¤·à¤£",
  "condition_viral_fever": "à¤µà¤¾à¤¯à¤°à¤² à¤¬à¥à¤–à¤¾à¤°",
  "condition_cold_cough": "à¤¸à¤°à¥à¤¦à¥€ à¤”à¤° à¤–à¤¾à¤‚à¤¸à¥€",
  "condition_migraine_headache": "à¤®à¤¾à¤‡à¤—à¥à¤°à¥‡à¤¨ / à¤¸à¤¿à¤°à¤¦à¤°à¥à¤¦",
  "condition_gastro_issue": "à¤ªà¥‡à¤Ÿ à¤¸à¤‚à¤¬à¤‚à¤§à¥€ à¤¸à¤®à¤¸à¥à¤¯à¤¾",
  "condition_skin_allergy": "à¤¤à¥à¤µà¤šà¤¾ à¤à¤²à¤°à¥à¤œà¥€",
  "condition_cardio_respiratory": "à¤¹à¥ƒà¤¦à¤¯-à¤¶à¥à¤µà¤¸à¤¨ à¤œà¥‹à¤–à¤¿à¤®",
  "status_mode": "à¤®à¥‹à¤¡",
  "doctor_analytics_subtitle": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤”à¤° à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤ªà¥à¤°à¤µà¤¾à¤¹ à¤•à¤¾ à¤ªà¤°à¤¿à¤šà¤¾à¤²à¤¨ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶à¥¤",
  "doctor_analytics_total_appointments": "à¤•à¥à¤² à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ",
  "doctor_analytics_pending": "à¤²à¤‚à¤¬à¤¿à¤¤",
  "doctor_analytics_completed": "à¤ªà¥‚à¤°à¥à¤£",
  "doctor_analytics_video_consults": "à¤µà¥€à¤¡à¤¿à¤¯à¥‹ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "doctor_analytics_text_consults": "à¤Ÿà¥‡à¤•à¥à¤¸à¥à¤Ÿ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶",
  "doctor_analytics_last7days": "à¤ªà¤¿à¤›à¤²à¥‡ 7 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤•à¤¾ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤°à¥à¤à¤¾à¤¨",
  "doctor_analytics_top_symptoms": "à¤¸à¤¬à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤¬à¤¤à¤¾à¤ à¤—à¤ à¤²à¤•à¥à¤·à¤£",
  "doctor_analytics_no_symptom_data": "à¤…à¤­à¥€ à¤²à¤•à¥à¤·à¤£ à¤¡à¥‡à¤Ÿà¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "admin_analytics_title": "à¤à¤¡à¤®à¤¿à¤¨ à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£",
  "admin_analytics_subtitle": "à¤ªà¥à¤²à¥‡à¤Ÿà¤«à¤¼à¥‰à¤°à¥à¤®-à¤¸à¥à¤¤à¤°à¥€à¤¯ à¤¸à¤‚à¤šà¤¾à¤²à¤¨ à¤”à¤° à¤‰à¤ªà¤¯à¥‹à¤— à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£à¥¤",
  "admin_analytics_total_patients": "à¤•à¥à¤² à¤®à¤°à¥€à¤œ",
  "admin_analytics_total_appointments": "à¤•à¥à¤² à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ",
  "admin_analytics_today_appointments": "à¤†à¤œ à¤•à¥‡ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ",
  "admin_analytics_pending_cases": "à¤²à¤‚à¤¬à¤¿à¤¤ à¤®à¤¾à¤®à¤²à¥‡",
  "admin_analytics_completed_cases": "à¤ªà¥‚à¤°à¥à¤£ à¤®à¤¾à¤®à¤²à¥‡",
  "admin_analytics_cancelled_cases": "à¤°à¤¦à¥à¤¦ à¤®à¤¾à¤®à¤²à¥‡",
  "admin_analytics_total_doctors": "à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "admin_analytics_total_pharmacies": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€",
  "admin_analytics_doctor_workload": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¤¾à¤°à¥à¤¯à¤­à¤¾à¤°",
  "admin_analytics_table_doctor": "à¤¡à¥‰à¤•à¥à¤Ÿà¤°",
  "admin_analytics_table_appointments": "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ",
  "admin_analytics_table_completed": "à¤ªà¥‚à¤°à¥à¤£",
  "admin_analytics_table_completion_rate": "à¤ªà¥‚à¤°à¥à¤£à¤¤à¤¾ %",
  "admin_analytics_pharmacy_stock_summary": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤¸à¥à¤Ÿà¥‰à¤• à¤¸à¤¾à¤°à¤¾à¤‚à¤¶",
  "admin_analytics_no_pharmacy_stock_data": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€ à¤¸à¥à¤Ÿà¥‰à¤• à¤¡à¥‡à¤Ÿà¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "admin_analytics_table_pharmacy": "à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€",
  "admin_analytics_table_medicines_listed": "à¤¸à¥‚à¤šà¥€à¤¬à¤¦à¥à¤§ à¤¦à¤µà¤¾à¤à¤",
  "admin_analytics_table_total_units": "à¤•à¥à¤² à¤¯à¥‚à¤¨à¤¿à¤Ÿ",
  "appointments_not_consulted": "à¤…à¤­à¥€ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¨à¤¹à¥€à¤‚ à¤¹à¥à¤†",
  "appointments_consulted": "à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¹à¥‹ à¤šà¥à¤•à¤¾",
  "appointments_no_pending_consultations": "à¤•à¥‹à¤ˆ à¤²à¤‚à¤¬à¤¿à¤¤ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "appointments_no_completed_consultations": "à¤•à¥‹à¤ˆ à¤ªà¥‚à¤°à¥à¤£ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "common_action": "à¤•à¤¾à¤°à¥à¤°à¤µà¤¾à¤ˆ",
  "common_edit": "à¤¸à¤‚à¤ªà¤¾à¤¦à¤¿à¤¤ à¤•à¤°à¥‡à¤‚",
  "pharmacy_click_medicine_to_edit": "à¤¯à¥‚à¤¨à¤¿à¤Ÿ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¦à¤µà¤¾ à¤•à¤¾ à¤¨à¤¾à¤® à¤¯à¤¾ 'à¤¸à¤‚à¤ªà¤¾à¤¦à¤¿à¤¤ à¤•à¤°à¥‡à¤‚' à¤¦à¤¬à¤¾à¤à¤à¥¤",
  "add_patient_subtitle": "à¤®à¤°à¥€à¤œ à¤•à¥€ à¤•à¥à¤²à¤¿à¤¨à¤¿à¤•à¤² à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤®à¥‡à¤‚ à¤¸à¥‡à¤µ à¤•à¤°à¥‡à¤‚à¥¤",
  "add_patient_required_fields": "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¨à¤¾à¤®, à¤‰à¤®à¥à¤° à¤”à¤° à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤",
  "add_patient_permission_denied": "Supabase RLS à¤¨à¥‡ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤¨à¤¹à¥€à¤‚ à¤¦à¥€à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ patients à¤Ÿà¥‡à¤¬à¤² à¤•à¥€ à¤¨à¥€à¤¤à¤¿à¤¯à¤¾à¤ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚à¥¤",
  "add_patient_table_missing": "Supabase à¤®à¥‡à¤‚ patients à¤Ÿà¥‡à¤¬à¤² à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "add_patient_unable_prefix": "à¤®à¤°à¥€à¤œ à¤œà¥‹à¤¡à¤¼à¤¨à¥‡ à¤®à¥‡à¤‚ à¤…à¤¸à¤®à¤°à¥à¤¥:",
  "additional_data_label": "à¤…à¤¤à¤¿à¤°à¤¿à¤•à¥à¤¤ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€",
  "doctor_patients_title": "à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡",
  "doctor_patients_subtitle": "à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¿à¤¤ à¤®à¤°à¥€à¤œ à¤¡à¥‡à¤Ÿà¤¾ à¤”à¤° à¤•à¥à¤²à¤¿à¤¨à¤¿à¤•à¤² à¤¨à¥‹à¤Ÿà¥à¤¸à¥¤",
  "doctor_patients_filter_placeholder": "à¤¨à¤¾à¤®, à¤‰à¤®à¥à¤°, à¤¸à¥à¤¥à¤¿à¤¤à¤¿, à¤…à¤¤à¤¿à¤°à¤¿à¤•à¥à¤¤ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤¸à¥‡ à¤«à¤¼à¤¿à¤²à¥à¤Ÿà¤° à¤•à¤°à¥‡à¤‚",
  "doctor_patients_no_records": "à¤•à¥‹à¤ˆ à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾à¥¤",
  "doctor_patients_internet_required": "à¤‡à¤‚à¤Ÿà¤°à¤¨à¥‡à¤Ÿ à¤•à¤¨à¥‡à¤•à¥à¤¶à¤¨ à¤”à¤° Supabase à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "doctor_patients_name_required": "à¤¨à¤¾à¤® à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤",
  "doctor_patients_updated": "à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¹à¥‹ à¤—à¤¯à¤¾à¥¤",
  "doctor_patients_update_failed_prefix": "à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¤¾:",
  "doctor_patients_delete_confirm": "à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤¯à¤¹ à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¹à¤Ÿà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚? à¤‡à¤¸à¥‡ à¤µà¤¾à¤ªà¤¸ à¤¨à¤¹à¥€à¤‚ à¤²à¤¾à¤¯à¤¾ à¤œà¤¾ à¤¸à¤•à¤¤à¤¾à¥¤",
  "doctor_patients_deleted": "à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¹à¤Ÿà¤¾à¤¯à¤¾ à¤—à¤¯à¤¾à¥¤",
  "doctor_patients_delete_failed_prefix": "à¤®à¤°à¥€à¤œ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤¹à¤Ÿà¤¾à¤¯à¤¾ à¤¨à¤¹à¥€à¤‚ à¤œà¤¾ à¤¸à¤•à¤¾:",
  "doctor_patients_delete": "à¤¹à¤Ÿà¤¾à¤à¤",
  "profile_title": "à¤®à¥‡à¤°à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤²",
  "profile_online_text": "à¤‘à¤¨à¤²à¤¾à¤‡à¤¨: à¤¨à¤µà¥€à¤¨à¤¤à¤® à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¹à¥ˆà¤‚à¥¤",
  "profile_offline_text": "à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨: à¤†à¤ª à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤¦à¥‡à¤– à¤”à¤° à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
  "profile_patient_id": "à¤®à¤°à¥€à¤œ à¤†à¤ˆà¤¡à¥€",
  "profile_role": "à¤­à¥‚à¤®à¤¿à¤•à¤¾",
  "profile_online": "à¤‘à¤¨à¤²à¤¾à¤‡à¤¨",
  "profile_offline": "à¤‘à¤«à¤¼à¤²à¤¾à¤‡à¤¨",
  "profile_mobile_not_found": "à¤®à¤°à¥€à¤œ à¤•à¤¾ à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤° à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾à¥¤",
  "profile_name_age_required": "à¤¨à¤¾à¤® à¤”à¤° à¤‰à¤®à¥à¤° à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¤‚à¥¤",
  "profile_updated_success": "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¹à¥‹ à¤—à¤ˆà¥¤",
  "profile_update_failed": "à¤…à¤­à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹ à¤¸à¤•à¥€à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤«à¤¿à¤° à¤¸à¥‡ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤•à¤°à¥‡à¤‚à¥¤",
  "profile_updating": "à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¹à¥‹ à¤°à¤¹à¤¾ à¤¹à¥ˆ...",
  "profile_update_button": "à¤ªà¥à¤°à¥‹à¤«à¤¼à¤¾à¤‡à¤² à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚",
  "profile_care_summary": "à¤•à¥‡à¤¯à¤° à¤¸à¤¾à¤°à¤¾à¤‚à¤¶",
  "profile_total": "à¤•à¥à¤²",
  "profile_upcoming": "à¤†à¤—à¤¾à¤®à¥€",
  "profile_active": "à¤¸à¤•à¥à¤°à¤¿à¤¯",
  "profile_completed": "à¤ªà¥‚à¤°à¥à¤£",
  "profile_recent_appointments": "à¤¹à¤¾à¤² à¤•à¥€ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿà¥à¤¸",
  "profile_no_appointments": "à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
  "pharmacy_apollo_name": "à¤…à¤ªà¥‹à¤²à¥‹ à¤«à¤¾à¤°à¥à¤®à¥‡à¤¸à¥€",
  "pharmacy_pharmeasy_name": "à¤«à¤¾à¤°à¥à¤®à¤ˆà¤œà¤¼à¥€ à¤¸à¥à¤Ÿà¥‹à¤°",
  "city_chennai": "à¤šà¥‡à¤¨à¥à¤¨à¤ˆ",
  "city_bangalore": "à¤¬à¥‡à¤‚à¤—à¤²à¥à¤°à¥",
  "patient_home_hint": "à¤à¤• à¤¬à¤¡à¤¼à¥‡ à¤¬à¤Ÿà¤¨ à¤•à¥‹ à¤¦à¤¬à¤¾à¤à¤‚à¥¤ à¤µà¥‰à¤‡à¤¸ à¤•à¤®à¤¾à¤‚à¤¡ à¤¦à¥‡à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ Speak à¤¬à¤Ÿà¤¨ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¥‡à¤‚à¥¤",
  "chat_offline_message": "à¤‘à¤«à¤²à¤¾à¤‡à¤¨ à¤®à¥‹à¤¡: à¤¸à¤‚à¤¦à¥‡à¤¶ à¤²à¥‹à¤•à¤²à¥€ à¤¸à¤‚à¤—à¥ƒà¤¹à¥€à¤¤ à¤•à¤¿à¤¯à¥‡ à¤œà¤¾à¤¤à¥‡ à¤¹à¥ˆà¤‚ à¤”à¤° à¤•à¥à¤²à¤¾à¤‰à¤¡ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¹à¥‹à¤¨à¥‡ à¤¤à¤• à¤¸à¤¿à¤‚à¤• à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹à¤‚à¤—à¥‡à¥¤",
  "chat_speak_message": "à¤¸à¤‚à¤¦à¥‡à¤¶ à¤¬à¥‹à¤²à¥‡à¤‚",
  "appointments_status_booked": "à¤¬à¥à¤• à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
  "appointments_status_in_consultation": "à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤®à¥‡à¤‚",
  "appointments_status_completed": "à¤ªà¥‚à¤°à¥à¤£",
  "admin_doctor_workload_item": "{{name}} | à¤•à¥à¤²: {{total}} | à¤¸à¤•à¥à¤°à¤¿à¤¯: {{active}}"
}
```

---

## File: `src\locales\en.json`
```json
{
  "welcome": "Welcome",
  "login": "Login",
  "select_role": "Select Role",
  "register": "Create account",
  "patient": "Patient",
  "doctor": "Doctor",
  "pharmacy": "Pharmacy",
  "admin": "Admin",
  "name": "Name",
  "age": "Age",
  "mobile": "Mobile Number",
  "email": "Email",
  "phone": "Phone Number",
  "password": "Password",
  "condition": "Condition",
  "already_account": "Already have an account? Sign in",
  "new_user": "New here? Create an account",
  "invalid_credentials": "Invalid credentials",
  "registered_success": "Registered successfully",
  "please_login": "Registration successful. Please login to continue.",
  "save": "Save",
  "cancel": "Cancel",
  "close": "âœ–",
  "nav": {
    "home": "Home",
    "appointments": "Appointments",
    "symptoms": "Symptoms",
    "health_tips": "Health Tips",
    "consultation": "Consultation",
    "doctors": "Doctor Availability",
    "profile": "Profile",
    "pharmacy": "Pharmacy",
    "dashboard": "Dashboard",
    "users": "Users",
    "settings": "Settings",
    "analytics": "Analytics"
  },
  "pharmacy_title": " Nearby Pharmacy Medicine Availability",
  "pharmacy_search_placeholder": "Search medicine name (example: Paracetamol)",
  "pharmacy_helper": "Enter a medicine name to check availability in nearby pharmacies",
  "available": " Available",
  "out_of_stock": " Out of Stock",
  "not_available": " Medicine not available in this pharmacy",
  "units": "units",
  "book_appointment_title": "Book Appointment",
  "book_appointment_desc": "Schedule doctor visit",
  "symptom_checker_title": "Symptom Checker",
  "symptom_checker_desc": "Check health symptoms",
  "consultation_title": " Consultation",
  "consultation_desc": "Online consultation",
  "video_call_card_title": " Video Call",
  "video_call_card_desc": "Start live consultation",
  "doctors_title": " Doctors",
  "doctors_desc": "Available doctors",
  "your_appointments": "Your Appointments",
  "appointment_1": "12 Feb 2026 | 10:30 AM | Dr. Kumar",
  "appointment_2": "18 Feb 2026 | 04:00 PM | Dr. Anjali",
  "health_tips_title": "Health Tips",
  "health_tip_1": " Drink plenty of water daily",
  "health_tip_2": " Walk 30 minutes every day",
  "welcome_doctor": "Welcome Doctor",
  "add_patient_title": " Add Patient",
  "add_patient_desc": "Add new patient details",
  "view_patients_title": " View Patients",
  "view_patients_desc": "See all patient records",
  "appointments_title": " Appointments",
  "appointments_desc": "Todayâ€™s scheduled visits",
  "prescriptions_title": " Prescriptions",
  "prescriptions_desc": "Manage prescriptions",
  "patient_name": "Patient Name",
  "appointment_form_title": "Book Appointment",
  "appointment_form_saved_offline": "Appointment saved offline",
  "patient_age": "Age",
  "patient_condition": "Health Condition",
  "save_patient": "Save Patient",
  "patient_added_success": "Patient added successfully",
  "add_patient_error": "Error adding patient",
  "nav_toggle_menu": "Toggle menu",
  "patient_list": "Patient List",
  "no_patients": "No patients yet",
  "admin_dashboard": "Admin Dashboard",
  "admin_users_title": " Users",
  "admin_users_desc": "Manage patients & doctors",
  "admin_appointments_title": " Appointments",
  "admin_appointments_desc": "All booked appointments",
  "admin_doctors_title": " Doctors",
  "admin_doctors_desc": "Doctor availability & profiles",
  "admin_settings_title": " Settings",
  "admin_settings_desc": "System configuration",
  "system_overview": "System Overview",
  "total_patients": "Total Patients: 128",
  "total_doctors": " Total Doctors: 14",
  "appointments_today": " Appointments Today: 22",
  "admin_actions": "Admin Actions",
  "approve_doctors": "Approve new doctors",
  "monitor_logs": " Monitor appointment logs",
  "update_guidelines": "Update health guidelines",
  "video_call_title": "Video Consultation",
  "video_call_online": "Online",
  "video_call_offline": "Offline",
  "video_call_doctor_hint": "Start a room and share the code with your patient.",
  "video_call_patient_hint": "Enter your doctor's room code to join the call.",
  "video_call_room_code": "Consultation Room Code",
  "video_call_generate": "Generate Code",
  "video_call_signed_as": "Signed in as",
  "video_call_you": "Your Video",
  "video_call_remote": "Doctor / Patient",
  "video_call_remote_idle": "Join a room to begin live video consultation.",
  "video_call_join": "Join Call",
  "video_call_connecting": "Connecting...",
  "video_call_waiting": "Connected. Waiting for the other participant...",
  "video_call_connected": "Connected",
  "video_call_mute": "Mute Mic",
  "video_call_unmute": "Unmute Mic",
  "video_call_camera_off": "Camera Off",
  "video_call_camera_on": "Camera On",
  "video_call_end": "End Call",
  "video_call_ended": "Call ended. You can join again anytime.",
  "video_call_enter_room": "Enter or generate a room code first.",
  "video_call_room_not_ready": "Room not ready. Ask doctor to start first.",
  "video_call_start_error": "Unable to start call.",
  "video_call_not_supported": "This browser does not support video calls.",
  "video_call_permission_error": "Camera/microphone access denied. Please allow permissions.",
  "video_call_room_placeholder": "TM-AB12CD",
  "video_call_waiting_host": "Waiting for the doctor to start this room...",
  "video_call_room_connect_error": "Unable to connect to the consultation room.",
  "video_call_connection_failed": "Connection dropped. Try joining the room again.",
  "video_call_cloud_required": "Video calls require internet and Supabase realtime.",
  "video_call_mic_live_status": "Mic is live",
  "video_call_mic_muted_status": "Mic is muted",
  "video_call_camera_live_status": "Camera is live",
  "video_call_camera_muted_status": "Camera is off",
  "video_call_leave_status": "Leave this consultation",
  "loading": "Loading...",
  "please_wait": "Please wait...",
  "unknown_error": "Unknown error",
  "generic_error_prefix": "Something went wrong:",
  "login_invalid_doctor_credentials": "Invalid doctor credentials",
  "login_invalid_admin_credentials": "Invalid admin credentials",
  "login_invalid_pharmacy_credentials": "Invalid pharmacy credentials",
  "login_offline_pharmacy_failed": "Offline pharmacy login failed. Login once online first to cache credentials.",
  "login_mobile_required": "Mobile number required",
  "login_patient_registration_requires_internet": "Patient registration requires internet.",
  "login_user_already_exists": "User already exists. Please login.",
  "login_offline_login_failed": "Offline login failed. Register or login once online first.",
  "login_pharmacy_table_missing": "Pharmacy login failed: 'pharmacies' table not found. Run supabase-schema.sql in Supabase SQL Editor.",
  "login_pharmacy_rls_denied": "Pharmacy login failed: Supabase RLS policy denied access. Re-run supabase-schema.sql policies.",
  "login_pharmacy_failed_prefix": "Pharmacy login failed:",
  "appointments_page_title": "Appointments and Consultation Queue",
  "appointments_offline_mode_active": "Offline mode active. New bookings are saved locally and will sync when online.",
  "appointments_book_title": "Book Token / Appointment",
  "appointments_select_doctor": "Select Doctor",
  "appointments_date": "Date",
  "appointments_time": "Time",
  "appointments_symptoms_issue": "Symptoms / Issue",
  "appointments_booking": "Booking...",
  "appointments_book_token": "Book Token",
  "appointments_my_tokens": "My Tokens",
  "appointments_none": "No appointments yet.",
  "appointments_token_prefix": "Token",
  "appointments_status": "Status",
  "appointments_booked": "booked",
  "appointments_sync_pending": "Sync: Pending upload",
  "appointments_symptoms": "Symptoms",
  "appointments_code": "Code",
  "appointments_join_video": "Join Video",
  "appointments_open_text_consultation": "Open Text Consultation",
  "appointments_patient_queue": "Patient Queue",
  "appointments_no_patients_queue": "No patients in queue.",
  "appointments_text_consult": "Text Consult",
  "appointments_video_consult_code": "Video Consult + Code",
  "appointments_share_code": "Share Code",
  "appointments_mark_completed": "Mark Completed",
  "appointments_patient_code": "Patient Code",
  "appointments_shared": "Shared",
  "appointments_fill_date_time_symptoms": "Please fill date, time and symptoms.",
  "appointments_patient_mobile_missing": "Patient mobile missing in session. Please logout and login again.",
  "appointments_token_booked_success": "Token booked successfully.",
  "appointments_token_saved_offline": "Token saved offline. It will sync when internet is available.",
  "appointments_booking_failed_prefix": "Booking failed:",
  "appointments_cloud_required_online": "Supabase cloud is required and internet must be available.",
  "appointments_unable_start_text": "Unable to start text consultation.",
  "appointments_unable_start_video": "Unable to start video consultation.",
  "appointments_unable_mark_completed": "Unable to mark completed.",
  "appointments_generate_video_code_first": "Generate video code first using 'Video Consult + Code'.",
  "appointments_code_copied": "Code copied. Share it with patient.",
  "appointments_share_this_code": "Share this code:",
  "chat_title": "Text Consultation",
  "chat_invalid_consultation": "Invalid consultation. Open chat from appointment queue.",
  "chat_cloud_required": "Cloud connection required for chat.",
  "chat_no_messages": "No messages yet.",
  "chat_type_message": "Type message...",
  "chat_send": "Send",
  "chat_unable_send": "Unable to send message.",
  "pharmacy_owner_not_found": "Owner pharmacy not found.",
  "pharmacy_enter_valid_medicine_units": "Enter valid medicine and units.",
  "pharmacy_owner_fields_required": "Name, owner email and password are required.",
  "pharmacy_owner_created": "Pharmacy owner created.",
  "pharmacy_not_configured": "Supabase is not configured.",
  "pharmacy_internet_required": "Internet required for cloud pharmacy data.",
  "pharmacy_create_owner_admin": "Create Pharmacy Owner (Admin)",
  "pharmacy_name": "Pharmacy Name",
  "pharmacy_area": "Area",
  "pharmacy_owner_email": "Owner Email",
  "pharmacy_owner_password": "Owner Password",
  "pharmacy_create_owner": "Create Owner",
  "pharmacy_update_stock": "Update Medicine Stock",
  "pharmacy_logged_in_as": "Logged in as",
  "pharmacy_medicine_name": "Medicine Name (example: Paracetamol)",
  "pharmacy_units": "Units",
  "pharmacy_update_units": "Update Units",
  "admin_cloud_connection_required": "Cloud connection required.",
  "admin_not_configured": "Supabase not configured. Set env keys to enable admin features.",
  "admin_offline_paused": "You are offline. Admin live data sync is paused.",
  "admin_total_patients_short": "Total Patients",
  "admin_doctors_short": "Doctors",
  "admin_appointments_today_short": "Appointments Today",
  "admin_active_consults": "Active Consults",
  "admin_completed_cases": "Completed Cases",
  "admin_operational_controls": "Operational Controls",
  "admin_open_appointment_queue": "Open Appointment Queue",
  "admin_view_patient_records": "View Patient Records",
  "admin_pharmacy_monitor": "Pharmacy Monitor",
  "admin_doctor_workload": "Doctor Workload",
  "admin_live_appointment_monitor": "Live Appointment Monitor",
  "admin_no_appointments_found": "No appointments found.",
  "admin_force_complete": "Force Complete",
  "read_aloud": "Read aloud",
  "voice_listening": "Listening...",
  "symptom_voice_not_supported": "Voice input is not supported on this browser.",
  "symptom_enter_text_or_image": "Enter symptom text or upload an image first.",
  "symptom_unable_process_image": "Unable to process image offline.",
  "symptom_on_device_ai_info": "On-device AI works fully offline and on any device running this app. Online AI is used when available for better accuracy.",
  "symptom_text_placeholder": "Type symptoms (example: fever, cough, sore throat for 2 days)",
  "symptom_speak_button": "Speak Symptoms",
  "symptom_read_result": "Read Result",
  "symptom_image_label": "Image",
  "symptom_analyzing": "Analyzing...",
  "symptom_check_offline": "Check Symptom Offline",
  "symptom_result": "Result",
  "symptom_engine": "Engine",
  "symptom_engine_ai": "AI (OpenAI)",
  "symptom_engine_offline": "On-device Offline AI",
  "symptom_probable_disease": "Probable disease",
  "symptom_natural_remedy": "Natural remedy",
  "symptom_doctor_guidance": "Doctor guidance",
  "symptom_confidence": "Confidence",
  "symptom_serious_detected": "Serious symptoms detected: Contact doctor now.",
  "symptom_red_flags": "Red flags",
  "symptom_image_hint": "Image hint",
  "symptom_emergency_warning": "Emergency signs like severe chest pain, breathing trouble, confusion, or persistent high fever need immediate hospital care.",
  "symptom_recent_checks": "Recent Checks",
  "appointment_list_all": "All Appointments (Queue View)",
  "appointment_list_patient": "Patient Appointments",
  "appointment_list_reason": "Reason",
  "symptom_rule_viral_fever_disease": "Viral Fever",
  "symptom_rule_viral_fever_remedy": "Drink warm fluids, take adequate rest, and monitor temperature regularly.",
  "symptom_rule_viral_fever_advice": "Contact a doctor if fever is above 102F or lasts more than 2 days.",
  "symptom_rule_cold_disease": "Common Cold / Upper Respiratory Infection",
  "symptom_rule_cold_remedy": "Steam inhalation, warm water with honey and ginger, and good hydration.",
  "symptom_rule_cold_advice": "See a doctor if breathing difficulty, chest pain, or high fever appears.",
  "symptom_rule_headache_disease": "Tension Headache / Migraine",
  "symptom_rule_headache_remedy": "Rest in a dark quiet room, drink water, and avoid known triggers.",
  "symptom_rule_headache_advice": "Consult a doctor if severe repeated headaches or vision changes occur.",
  "symptom_rule_gastro_disease": "Gastroenteritis / Food Poisoning",
  "symptom_rule_gastro_remedy": "Use ORS, soft foods, coconut water, and avoid oily or spicy meals.",
  "symptom_rule_gastro_advice": "See a doctor if blood in stool, persistent vomiting, or dehydration signs occur.",
  "symptom_rule_skin_disease": "Skin Allergy / Dermatitis",
  "symptom_rule_skin_remedy": "Keep skin cool and dry, use gentle moisturizer, avoid irritant products.",
  "symptom_rule_skin_advice": "Consult dermatologist if rash spreads quickly, oozes, or causes swelling.",
  "symptom_rule_cardio_disease": "Possible Cardio-Respiratory Emergency",
  "symptom_rule_cardio_remedy": "No home remedy advised for this pattern.",
  "symptom_rule_cardio_advice": "Immediate emergency care required.",
  "symptom_generic_disease": "Non-specific symptom pattern",
  "symptom_generic_remedy": "Hydrate, light nutritious food, and adequate rest.",
  "symptom_generic_advice": "If symptoms continue beyond 24-48 hours, contact a doctor.",
  "symptom_serious_pattern_advice": "Serious symptom pattern detected. Contact doctor immediately.",
  "symptom_potential_emergency_pattern": "Potential emergency pattern",
  "symptom_no_image_uploaded": "No image uploaded.",
  "symptom_risk_reason_low": "No high-risk branch triggered in decision tree.",
  "symptom_risk_reason_medium": "Moderate-risk symptom pattern detected.",
  "symptom_risk_reason_high": "Emergency symptoms pattern detected (cardiorespiratory or neurologic red flag).",
  "symptom_risk_value_low": "Low",
  "symptom_risk_value_medium": "Medium",
  "symptom_risk_value_high": "High",
  "symptom_image_hint_skin_name": "Image name suggests a skin issue. Possible rash or allergy pattern.",
  "symptom_image_hint_red_tone": "Image has higher red-tone areas. It could match irritation, rash, or inflammation.",
  "symptom_image_hint_dark": "Image is quite dark; details are limited. Capture it in better light.",
  "symptom_image_hint_none": "No clear visual pattern was detected from the offline image check.",
  "symptom_voice_issue_prefix": "Possible issue:",
  "symptom_voice_remedy_prefix": "Natural remedy:",
  "symptom_voice_advice_prefix": "Doctor advice:",
  "symptom_not_clear": "Not clear",
  "symptom_none": "none",
  "symptom_consult_if_needed": "consult a doctor if needed",
  "symptom_age_placeholder": "Age (optional, improves risk guidance)",
  "symptom_risk_level": "Risk Level",
  "symptom_safety_note": "Safety Note",
  "symptom_confidence_low": "Low",
  "symptom_confidence_medium": "Medium",
  "symptom_confidence_high": "High",
  "symptom_rule_viral_fever_remedy": "Hydrate well, take rest, and monitor temperature.",
  "symptom_rule_viral_fever_advice": "Consult a doctor if fever stays above 2 days or new symptoms appear.",
  "symptom_rule_cold_cough_remedy": "Warm fluids, steam inhalation, and adequate rest can help.",
  "symptom_rule_cold_cough_advice": "Consult a doctor if breathing trouble, high fever, or persistent cough occurs.",
  "symptom_rule_migraine_headache_remedy": "Rest in a quiet dark room and stay hydrated.",
  "symptom_rule_migraine_headache_advice": "Consult a doctor if headache is severe, frequent, or has neurologic symptoms.",
  "symptom_rule_gastro_issue_remedy": "Use oral rehydration, light diet, and avoid oily food.",
  "symptom_rule_gastro_issue_advice": "Consult a doctor if vomiting persists, dehydration worsens, or blood appears.",
  "symptom_rule_skin_allergy_remedy": "Avoid triggers, keep skin clean, and use soothing care.",
  "symptom_rule_skin_allergy_advice": "Consult a doctor if rash spreads quickly, blisters, or swelling appears.",
  "symptom_rule_cardio_respiratory_remedy": "Avoid exertion and seek urgent medical attention for chest or breathing symptoms.",
  "symptom_rule_cardio_respiratory_advice": "Immediate doctor or emergency care is advised for chest pain or breathing difficulty.",
  "specialty_general_medicine": "General Medicine",
  "specialty_dermatology": "Dermatology",
  "specialty_pediatrics": "Pediatrics",
  "doctor_kumar": "Dr. Kumar",
  "doctor_anjali": "Dr. Anjali",
  "doctor_arun": "Dr. Arun",
  "home_analytics_title": "Analytics",
  "home_analytics_desc": "View appointment trends and symptom insights.",
  "admin_analytics_button": "Analytics Dashboard",
  "doctor_availability_title": "Doctor Availability",
  "doctor_availability_live": "Live status based on appointment and consultation records.",
  "doctor_availability_offline": "Offline mode: showing last synced/available local records.",
  "doctor_availability_status_available": "Available",
  "doctor_availability_status_in_consultation": "In Consultation",
  "doctor_availability_specialty": "Specialty",
  "doctor_availability_total_consults": "Total Consultations",
  "doctor_availability_active_consults": "Active Consultations",
  "doctor_availability_completed": "Completed",
  "doctor_availability_upcoming_queue": "Upcoming Queue",
  "doctor_availability_next_slot": "Next Slot",
  "doctor_availability_no_upcoming_slot": "No upcoming slot",
  "doctor_analytics_title": "Doctor Analytics",
  "condition_general_non_specific": "General non-specific symptoms",
  "condition_viral_fever": "Viral Fever",
  "condition_cold_cough": "Cold and Cough",
  "condition_migraine_headache": "Migraine / Headache",
  "condition_gastro_issue": "Gastrointestinal Issue",
  "condition_skin_allergy": "Skin Allergy",
  "condition_cardio_respiratory": "Cardio-Respiratory Risk",
  "status_mode": "Mode",
  "doctor_analytics_subtitle": "operational summary for appointments and consultation flow.",
  "doctor_analytics_total_appointments": "Total Appointments",
  "doctor_analytics_pending": "Pending",
  "doctor_analytics_completed": "Completed",
  "doctor_analytics_video_consults": "Video Consults",
  "doctor_analytics_text_consults": "Text Consults",
  "doctor_analytics_last7days": "Last 7 Days Appointment Trend",
  "doctor_analytics_top_symptoms": "Top Reported Symptoms",
  "doctor_analytics_no_symptom_data": "No symptom data yet.",
  "admin_analytics_title": "Admin Analytics",
  "admin_analytics_subtitle": "Platform-level operational and utilization analytics.",
  "admin_analytics_total_patients": "Total Patients",
  "admin_analytics_total_appointments": "Total Appointments",
  "admin_analytics_today_appointments": "Today Appointments",
  "admin_analytics_pending_cases": "Pending Cases",
  "admin_analytics_completed_cases": "Completed Cases",
  "admin_analytics_cancelled_cases": "Cancelled Cases",
  "admin_analytics_total_doctors": "Doctors",
  "admin_analytics_total_pharmacies": "Pharmacies",
  "admin_analytics_doctor_workload": "Doctor Workload",
  "admin_analytics_table_doctor": "Doctor",
  "admin_analytics_table_appointments": "Appointments",
  "admin_analytics_table_completed": "Completed",
  "admin_analytics_table_completion_rate": "Completion %",
  "admin_analytics_pharmacy_stock_summary": "Pharmacy Stock Summary",
  "admin_analytics_no_pharmacy_stock_data": "No pharmacy stock data available.",
  "admin_analytics_table_pharmacy": "Pharmacy",
  "admin_analytics_table_medicines_listed": "Medicines Listed",
  "admin_analytics_table_total_units": "Total Units",
  "appointments_not_consulted": "Not Consulted",
  "appointments_consulted": "Consulted",
  "appointments_no_pending_consultations": "No pending consultations.",
  "appointments_no_completed_consultations": "No completed consultations.",
  "common_action": "Action",
  "common_edit": "Edit",
  "pharmacy_click_medicine_to_edit": "Click medicine name or Edit to update units.",
  "add_patient_subtitle": "Enter patient clinical details and save to records.",
  "add_patient_required_fields": "Please enter Name, Age, and Condition.",
  "add_patient_permission_denied": "Permission denied by Supabase RLS. Please update policies for patients table.",
  "add_patient_table_missing": "Patients table is not available in Supabase.",
  "add_patient_unable_prefix": "Unable to add patient:",
  "additional_data_label": "Additional Data",
  "doctor_patients_title": "Patient Records",
  "doctor_patients_subtitle": "Doctor-managed patient data with clinical notes.",
  "doctor_patients_filter_placeholder": "Filter by name, age, condition, additional data",
  "doctor_patients_no_records": "No patient records found.",
  "doctor_patients_internet_required": "Internet connection and Supabase are required.",
  "doctor_patients_name_required": "Name is required.",
  "doctor_patients_updated": "Patient record updated.",
  "doctor_patients_update_failed_prefix": "Unable to update patient:",
  "doctor_patients_delete_confirm": "Delete this patient record? This cannot be undone.",
  "doctor_patients_deleted": "Patient record deleted.",
  "doctor_patients_delete_failed_prefix": "Unable to delete patient:",
  "doctor_patients_delete": "Delete",
  "profile_title": "My Profile",
  "profile_online_text": "Online: latest records available.",
  "profile_offline_text": "Offline: you can still view and update local profile.",
  "profile_patient_id": "Patient ID",
  "profile_role": "Role",
  "profile_online": "Online",
  "profile_offline": "Offline",
  "profile_mobile_not_found": "Patient mobile not found.",
  "profile_name_age_required": "Name and age are required.",
  "profile_updated_success": "Profile updated successfully.",
  "profile_update_failed": "Unable to update profile now. Please try again.",
  "profile_updating": "Updating...",
  "profile_update_button": "Update Profile",
  "profile_care_summary": "Care Summary",
  "profile_total": "Total",
  "profile_upcoming": "Upcoming",
  "profile_active": "Active",
  "profile_completed": "Completed",
  "profile_recent_appointments": "Recent Appointments",
  "profile_no_appointments": "No appointments yet.",
  "pharmacy_apollo_name": "Apollo Pharmacy",
  "pharmacy_pharmeasy_name": "PharmEasy Store",
  "city_chennai": "Chennai",
  "city_bangalore": "Bangalore",
  "patient_home_hint": "Tap one big button. Use the Speak button to give voice commands.",
  "chat_offline_message": "Offline mode: messages are stored locally and will not sync until cloud is available.",
  "chat_speak_message": "Speak Message",
  "appointments_status_booked": "Booked",
  "appointments_status_in_consultation": "In consultation",
  "appointments_status_completed": "Completed",
  "admin_doctor_workload_item": "{{name}} | Total: {{total}} | Active: {{active}}"
}
```

---

## File: `src\locales\ml.json`
```json
{
  "welcome": "à´¸àµà´µà´¾à´—à´¤à´‚",
  "login": "à´²àµ‹à´—à´¿àµ»",
  "select_role": "à´±àµ‹àµ¾ à´¤à´¿à´°à´žàµà´žàµ†à´Ÿàµà´•àµà´•àµà´•",
  "register": "à´…à´•àµà´•àµ—à´£àµà´Ÿàµ à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´•",
  "patient": "à´°àµ‹à´—à´¿",
  "doctor": "à´¡àµ‹à´•àµà´Ÿàµ¼",
  "pharmacy": "à´«à´¾àµ¼à´®à´¸à´¿",
  "admin": "à´…à´¡àµà´®à´¿àµ»",
  "name": "à´ªàµ‡à´°àµ",
  "age": "à´µà´¯à´¸àµ",
  "mobile": "à´®àµŠà´¬àµˆàµ½ à´¨à´®àµà´ªàµ¼",
  "email": "à´‡à´®àµ†à´¯à´¿àµ½",
  "phone": "à´«àµ‹àµº à´¨à´®àµà´ªàµ¼",
  "password": "à´ªà´¾à´¸àµâ€Œà´µàµ‡à´¡àµ",
  "condition": "à´°àµ‹à´—à´¾à´µà´¸àµà´¥",
  "already_account": "à´‡à´¤à´¿à´¨à´•à´‚ à´…à´•àµà´•àµ—à´£àµà´Ÿàµ à´‰à´£àµà´Ÿàµ‹? à´¸àµˆàµ» à´‡àµ» à´šàµ†à´¯àµà´¯àµà´•",
  "new_user": "à´ªàµà´¤à´¿à´¯à´¯à´¾à´³à´¾à´£àµ‹? à´…à´•àµà´•àµ—à´£àµà´Ÿàµ à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´•",
  "invalid_credentials": "à´¤àµ†à´±àµà´±à´¾à´¯ à´•àµà´°àµ†à´¡àµ»à´·àµà´¯àµ½à´¸àµ",
  "registered_success": "à´°à´œà´¿à´¸àµà´Ÿàµà´°àµ‡à´·àµ» à´µà´¿à´œà´¯à´•à´°à´‚",
  "please_login": "à´°à´œà´¿à´¸àµà´Ÿàµà´°àµ‡à´·àµ» à´µà´¿à´œà´¯à´•à´°à´‚. à´¤àµà´Ÿà´°à´¾àµ» à´²àµ‹à´—à´¿àµ» à´šàµ†à´¯àµà´¯àµà´•.",
  "save": "à´¸àµ‡à´µàµ",
  "cancel": "à´±à´¦àµà´¦à´¾à´•àµà´•àµà´•",
  "close": "âœ–",
  "nav": {
    "home": "à´¹àµ‹à´‚",
    "appointments": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
    "symptoms": "à´²à´•àµà´·à´£à´™àµà´™àµ¾",
    "health_tips": "à´†à´°àµ‹à´—àµà´¯ à´•àµà´±à´¿à´ªàµà´ªàµà´•àµ¾",
    "consultation": "à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ»",
    "doctors": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´²à´­àµà´¯à´¤",
    "profile": "à´ªàµà´°àµŠà´«àµˆàµ½",
    "pharmacy": "à´«à´¾àµ¼à´®à´¸à´¿",
    "dashboard": "à´¡à´¾à´·àµà´¬àµ‹àµ¼à´¡àµ",
    "users": "à´‰à´ªà´¯àµ‹à´•àµà´¤à´¾à´•àµà´•àµ¾",
    "settings": "à´•àµà´°à´®àµ€à´•à´°à´£à´™àµà´™àµ¾",
    "analytics": "à´µà´¿à´¶à´•à´²à´¨à´‚"
  },
  "pharmacy_title": " à´¸à´®àµ€à´ªà´¤àµà´¤àµ† à´«à´¾àµ¼à´®à´¸à´¿à´•à´³à´¿à´²àµ† à´®à´°àµà´¨àµà´¨àµ à´²à´­àµà´¯à´¤",
  "pharmacy_search_placeholder": "à´®à´°àµà´¨àµà´¨à´¿à´¨àµà´±àµ† à´ªàµ‡à´°àµ à´¤à´¿à´°à´¯àµà´• (à´‰à´¦à´¾: à´ªà´°à´¾à´¸à´¿à´±àµà´±à´®àµ‹àµ¾)",
  "pharmacy_helper": "à´¸à´®àµ€à´ªà´¤àµà´¤àµ† à´«à´¾àµ¼à´®à´¸à´¿à´•à´³à´¿àµ½ à´²à´­àµà´¯à´¤ à´ªà´°à´¿à´¶àµ‹à´§à´¿à´•àµà´•à´¾àµ» à´®à´°àµà´¨àµà´¨à´¿à´¨àµà´±àµ† à´ªàµ‡à´°àµ à´¨àµ½à´•àµà´•",
  "available": " à´²à´­àµà´¯à´®à´¾à´£àµ",
  "out_of_stock": " à´¸àµà´±àµà´±àµ‹à´•àµà´•àµ à´‡à´²àµà´²",
  "not_available": " à´ˆ à´«à´¾àµ¼à´®à´¸à´¿à´¯à´¿àµ½ à´®à´°àµà´¨àµà´¨àµ à´²à´­àµà´¯à´®à´²àµà´²",
  "units": "à´¯àµ‚à´£à´¿à´±àµà´±àµà´•àµ¾",
  "book_appointment_title": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµ à´¬àµà´•àµà´•àµ à´šàµ†à´¯àµà´¯àµà´•",
  "book_appointment_desc": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´¸à´¨àµà´¦àµ¼à´¶à´¨à´‚ à´·àµ†à´¡àµà´¯àµ‚àµ¾ à´šàµ†à´¯àµà´¯àµà´•",
  "symptom_checker_title": "à´²à´•àµà´·à´£ à´ªà´°à´¿à´¶àµ‹à´§à´¨",
  "symptom_checker_desc": "à´†à´°àµ‹à´—àµà´¯ à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´ªà´°à´¿à´¶àµ‹à´§à´¿à´•àµà´•àµà´•",
  "consultation_title": " à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ»",
  "consultation_desc": "à´“àµºà´²àµˆàµ» à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ»",
  "video_call_card_title": " à´µàµ€à´¡à´¿à´¯àµ‹ à´•àµ‹àµ¾",
  "video_call_card_desc": "à´²àµˆà´µàµ à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ» à´†à´°à´‚à´­à´¿à´•àµà´•àµà´•",
  "doctors_title": " à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾àµ¼",
  "doctors_desc": "à´²à´­àµà´¯à´®à´¾à´¯ à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾àµ¼",
  "your_appointments": "à´¨à´¿à´™àµà´™à´³àµà´Ÿàµ† à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "appointment_1": "12 à´«àµ†à´¬àµ 2026 | 10:30 AM | à´¡àµ‹. à´•àµà´®à´¾àµ¼",
  "appointment_2": "18 à´«àµ†à´¬àµ 2026 | 04:00 PM | à´¡àµ‹. à´…à´žàµà´œà´²à´¿",
  "health_tips_title": "à´†à´°àµ‹à´—àµà´¯ à´•àµà´±à´¿à´ªàµà´ªàµà´•àµ¾",
  "health_tip_1": " à´¦à´¿à´µà´¸àµ‡à´¨ à´®à´¤à´¿à´¯à´¾à´¯ à´µàµ†à´³àµà´³à´‚ à´•àµà´Ÿà´¿à´•àµà´•àµà´•",
  "health_tip_2": " à´¦à´¿à´µà´¸àµ‡à´¨ 30 à´®à´¿à´¨à´¿à´±àµà´±àµ à´¨à´Ÿà´•àµà´•àµà´•",
  "welcome_doctor": "à´¸àµà´µà´¾à´—à´¤à´‚ à´¡àµ‹à´•àµà´Ÿàµ¼",
  "add_patient_title": " à´°àµ‹à´—à´¿à´¯àµ† à´šàµ‡àµ¼à´•àµà´•àµà´•",
  "add_patient_desc": "à´ªàµà´¤à´¿à´¯ à´°àµ‹à´—à´¿à´¯àµà´Ÿàµ† à´µà´¿à´µà´°à´™àµà´™àµ¾ à´šàµ‡àµ¼à´•àµà´•àµà´•",
  "view_patients_title": " à´°àµ‹à´—à´¿ à´ªà´Ÿàµà´Ÿà´¿à´•",
  "view_patients_desc": "à´Žà´²àµà´²à´¾ à´°àµ‹à´—à´¿à´•à´³àµà´Ÿàµ†à´¯àµà´‚ à´°àµ‡à´–à´•àµ¾ à´•à´¾à´£àµà´•",
  "appointments_title": " à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "appointments_desc": "à´‡à´¨àµà´¨à´¤àµà´¤àµ† à´¨à´¿à´¶àµà´šà´¿à´¤ à´¸à´¨àµà´¦àµ¼à´¶à´¨à´™àµà´™àµ¾",
  "prescriptions_title": " à´®à´°àµà´¨àµà´¨àµ à´•àµà´±à´¿à´ªàµà´ªàµà´•àµ¾",
  "prescriptions_desc": "à´®à´°àµà´¨àµà´¨àµ à´•àµà´±à´¿à´ªàµà´ªàµà´•àµ¾ à´¨à´¿à´¯à´¨àµà´¤àµà´°à´¿à´•àµà´•àµà´•",
  "patient_name": "à´°àµ‹à´—à´¿à´¯àµà´Ÿàµ† à´ªàµ‡à´°àµ",
  "appointment_form_title": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµ à´¬àµà´•àµà´•àµ à´šàµ†à´¯àµà´¯àµà´•",
  "appointment_form_saved_offline": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµ à´“à´«àµà´²àµˆà´¨à´¿àµ½ à´¸àµ‡à´µàµ à´šàµ†à´¯àµà´¤àµ",
  "patient_age": "à´µà´¯à´¸àµ",
  "patient_condition": "à´†à´°àµ‹à´—àµà´¯à´¾à´µà´¸àµà´¥",
  "save_patient": "à´°àµ‹à´—à´¿à´¯àµ† à´¸àµ‡à´µàµ à´šàµ†à´¯àµà´¯àµà´•",
  "patient_added_success": "à´°àµ‹à´—à´¿à´¯àµ† à´µà´¿à´œà´¯à´•à´°à´®à´¾à´¯à´¿ à´šàµ‡àµ¼à´¤àµà´¤àµ",
  "add_patient_error": "à´°àµ‹à´—à´¿à´¯àµ† à´šàµ‡àµ¼à´•àµà´•àµà´¨àµà´¨à´¤à´¿àµ½ à´ªà´¿à´¶à´•àµ à´¸à´‚à´­à´µà´¿à´šàµà´šàµ",
  "nav_toggle_menu": "à´®àµ†à´¨àµ à´®à´¾à´±àµà´±àµà´•",
  "patient_list": "à´°àµ‹à´—à´¿ à´ªà´Ÿàµà´Ÿà´¿à´•",
  "no_patients": "à´‡à´¤àµà´µà´°àµ† à´°àµ‹à´—à´¿à´•à´³à´¿à´²àµà´²",
  "admin_dashboard": "à´…à´¡àµà´®à´¿àµ» à´¡à´¾à´·àµà´¬àµ‹àµ¼à´¡àµ",
  "admin_users_title": " à´‰à´ªà´¯àµ‹à´•àµà´¤à´¾à´•àµà´•àµ¾",
  "admin_users_desc": "à´°àµ‹à´—à´¿à´•à´³àµà´‚ à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾à´°àµà´‚ à´¨à´¿à´¯à´¨àµà´¤àµà´°à´¿à´•àµà´•àµà´•",
  "admin_appointments_title": " à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "admin_appointments_desc": "à´¬àµà´•àµà´•àµ à´šàµ†à´¯àµà´¤ à´Žà´²àµà´²à´¾ à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•à´³àµà´‚",
  "admin_doctors_title": " à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾àµ¼",
  "admin_doctors_desc": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´²à´­àµà´¯à´¤à´¯àµà´‚ à´ªàµà´°àµŠà´«àµˆà´²àµà´•à´³àµà´‚",
  "admin_settings_title": " à´•àµà´°à´®àµ€à´•à´°à´£à´™àµà´™àµ¾",
  "admin_settings_desc": "à´¸à´¿à´¸àµà´±àµà´±à´‚ à´•àµ‹àµºà´«à´¿à´—à´±àµ‡à´·àµ»",
  "system_overview": "à´¸à´¿à´¸àµà´±àµà´±à´‚ à´…à´µà´²àµ‹à´•à´¨à´‚",
  "total_patients": "à´®àµŠà´¤àµà´¤à´‚ à´°àµ‹à´—à´¿à´•àµ¾: 128",
  "total_doctors": " à´®àµŠà´¤àµà´¤à´‚ à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾àµ¼: 14",
  "appointments_today": " à´‡à´¨àµà´¨à´¤àµà´¤àµ† à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾: 22",
  "admin_actions": "à´…à´¡àµà´®à´¿àµ» à´ªàµà´°à´µàµ¼à´¤àµà´¤à´¨à´™àµà´™àµ¾",
  "approve_doctors": "à´ªàµà´¤à´¿à´¯ à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾à´°àµ† à´…à´‚à´—àµ€à´•à´°à´¿à´•àµà´•àµà´•",
  "monitor_logs": " à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµ à´²àµ‹à´—àµà´•àµ¾ à´¨à´¿à´°àµ€à´•àµà´·à´¿à´•àµà´•àµà´•",
  "update_guidelines": "à´†à´°àµ‹à´—àµà´¯ à´®à´¾àµ¼à´—àµà´—à´¨à´¿àµ¼à´¦àµ‡à´¶à´™àµà´™àµ¾ à´ªàµà´¤àµà´•àµà´•àµà´•",
  "video_call_title": "à´µàµ€à´¡à´¿à´¯àµ‹ à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ»",
  "video_call_online": "à´“àµºà´²àµˆàµ»",
  "video_call_offline": "à´“à´«àµâ€Œà´²àµˆàµ»",
  "video_call_doctor_hint": "à´’à´°àµ à´®àµà´±à´¿ à´†à´°à´‚à´­à´¿à´šàµà´šàµ à´•àµ‹à´¡àµ à´¨à´¿à´™àµà´™à´³àµà´Ÿàµ† à´°àµ‹à´—à´¿à´¯àµà´®à´¾à´¯à´¿ à´ªà´™àµà´•à´¿à´Ÿàµà´•.",
  "video_call_patient_hint": "à´•àµ‹à´³à´¿àµ½ à´šàµ‡à´°à´¾àµ» à´¨à´¿à´™àµà´™à´³àµà´Ÿàµ† à´¡àµ‹à´•àµà´Ÿà´±àµà´Ÿàµ† à´±àµ‚à´‚ à´•àµ‹à´¡àµ à´¨àµ½à´•àµà´•.",
  "video_call_room_code": "à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ» à´±àµ‚à´‚ à´•àµ‹à´¡àµ",
  "video_call_generate": "à´•àµ‹à´¡àµ à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´•",
  "video_call_signed_as": "à´‡à´™àµà´™à´¿à´¨àµ† à´¸àµˆàµ» à´‡àµ» à´šàµ†à´¯àµà´¤àµ",
  "video_call_you": "à´¨à´¿à´™àµà´™à´³àµà´Ÿàµ† à´µàµ€à´¡à´¿à´¯àµ‹",
  "video_call_remote": "à´¡àµ‹à´•àµà´Ÿàµ¼ / à´°àµ‹à´—à´¿",
  "video_call_remote_idle": "à´²àµˆà´µàµ à´µàµ€à´¡à´¿à´¯àµ‹ à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ» à´†à´°à´‚à´­à´¿à´•àµà´•à´¾àµ» à´®àµà´±à´¿à´¯à´¿àµ½ à´šàµ‡à´°àµà´•.",
  "video_call_join": "à´•àµ‹à´³à´¿àµ½ à´šàµ‡à´°àµà´•",
  "video_call_connecting": "à´•à´£à´•àµà´±àµà´±àµ à´šàµ†à´¯àµà´¯àµà´¨àµà´¨àµ...",
  "video_call_waiting": "à´•à´£à´•àµà´±àµà´±àµ à´šàµ†à´¯àµà´¤àµ. à´®à´±àµà´±àµ‡ à´ªà´™àµà´•à´¾à´³à´¿à´•àµà´•à´¾à´¯à´¿ à´•à´¾à´¤àµà´¤à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨àµ...",
  "video_call_connected": "à´•à´£à´•àµà´±àµà´±àµ à´šàµ†à´¯àµà´¤àµ",
  "video_call_mute": "à´®àµˆà´•àµà´•àµ à´®àµà´¯àµ‚à´Ÿàµà´Ÿàµ",
  "video_call_unmute": "à´®àµˆà´•àµà´•àµ à´…àµºà´®àµà´¯àµ‚à´Ÿàµà´Ÿàµ",
  "video_call_camera_off": "à´•àµà´¯à´¾à´®à´± à´“à´«àµ",
  "video_call_camera_on": "à´•àµà´¯à´¾à´®à´± à´“àµº",
  "video_call_end": "à´•à´¾àµ¾ à´…à´µà´¸à´¾à´¨à´¿à´ªàµà´ªà´¿à´•àµà´•àµà´•",
  "video_call_ended": "à´•à´¾àµ¾ à´…à´µà´¸à´¾à´¨à´¿à´šàµà´šàµ. à´¨à´¿à´™àµà´™àµ¾à´•àµà´•àµ à´à´¤à´¾à´¨àµà´‚ à´¸à´®à´¯à´¤àµà´¤àµ à´µàµ€à´£àµà´Ÿàµà´‚ à´šàµ‡à´°à´¾à´‚.",
  "video_call_enter_room": "à´®àµàµ»à´ªàµ à´±àµ‚à´‚ à´•àµ‹à´¡àµ à´¨àµ½à´•àµà´• à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´•.",
  "video_call_room_not_ready": "à´®àµà´±à´¿ à´¤à´¯àµà´¯à´¾à´±à´²àµà´². à´†à´¦àµà´¯à´‚ à´¡àµ‹à´•àµà´Ÿà´±àµ‹à´Ÿàµ à´†à´°à´‚à´­à´¿à´•àµà´•à´¾àµ» à´ªà´±à´¯àµà´•.",
  "video_call_start_error": "à´•à´¾àµ¾ à´†à´°à´‚à´­à´¿à´•àµà´•à´¾àµ» à´•à´´à´¿à´žàµà´žà´¿à´²àµà´².",
  "video_call_not_supported": "à´ˆ à´¬àµà´°àµ—à´¸àµ¼ à´µàµ€à´¡à´¿à´¯àµ‹ à´•àµ‹à´³à´¿à´¨àµ† à´ªà´¿à´¨àµà´¤àµà´£à´¯àµà´•àµà´•àµà´¨àµà´¨à´¿à´²àµà´².",
  "video_call_permission_error": "à´•àµà´¯à´¾à´®à´±/à´®àµˆà´•àµà´°àµ‹à´«àµ‹àµº à´…à´¨àµà´®à´¤à´¿ à´¨à´¿à´°à´¸à´¿à´šàµà´šàµ. à´¦à´¯à´µà´¾à´¯à´¿ à´…à´¨àµà´®à´¤à´¿ à´¨àµ½à´•àµà´•.",
  "video_call_room_placeholder": "TM-AB12CD",
  "video_call_waiting_host": "à´ˆ à´±àµ‚à´‚ à´¡àµ‹à´•àµà´Ÿàµ¼ à´†à´°à´‚à´­à´¿à´•àµà´•àµà´¨àµà´¨à´¤àµ à´•à´¾à´¤àµà´¤à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨àµ...",
  "video_call_room_connect_error": "à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ» à´±àµ‚à´®àµà´®à´¾à´¯à´¿ à´•à´£à´•àµà´±àµà´±àµ à´šàµ†à´¯àµà´¯à´¾à´¨à´¾à´¯à´¿à´²àµà´².",
  "video_call_connection_failed": "à´•à´£à´•àµà´·àµ» à´¨à´·àµà´Ÿà´ªàµà´ªàµ†à´Ÿàµà´Ÿàµ. à´µàµ€à´£àµà´Ÿàµà´‚ à´±àµ‚à´®à´¿àµ½ à´šàµ‡à´°à´¾àµ» à´¶àµà´°à´®à´¿à´•àµà´•àµà´•.",
  "video_call_cloud_required": "à´µàµ€à´¡à´¿à´¯àµ‹ à´•àµ‹à´³àµà´•àµ¾à´•àµà´•àµ internet à´‰à´‚ Supabase realtime à´‰à´‚ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "video_call_mic_live_status": "à´®àµˆà´•àµà´•àµ à´¸à´œàµ€à´µà´®à´¾à´£àµ",
  "video_call_mic_muted_status": "à´®àµˆà´•àµà´•àµ à´®àµà´¯àµ‚à´Ÿàµà´Ÿàµ à´šàµ†à´¯àµà´¤à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨àµ",
  "video_call_camera_live_status": "à´•àµà´¯à´¾à´®à´± à´¸à´œàµ€à´µà´®à´¾à´£àµ",
  "video_call_camera_muted_status": "à´•àµà´¯à´¾à´®à´± à´“à´«àµ à´†à´£àµ",
  "video_call_leave_status": "à´ˆ à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·à´¨à´¿àµ½ à´¨à´¿à´¨àµà´¨àµ à´ªàµà´±à´¤àµà´¤àµà´•à´Ÿà´•àµà´•àµà´•",
  "loading": "à´²àµ‹à´¡àµ à´šàµ†à´¯àµà´¯àµà´¨àµà´¨àµ...",
  "please_wait": "à´¦à´¯à´µà´¾à´¯à´¿ à´•à´¾à´¤àµà´¤à´¿à´°à´¿à´•àµà´•àµà´•...",
  "unknown_error": "à´…à´œàµà´žà´¾à´¤ à´ªà´¿à´¶à´•àµ",
  "generic_error_prefix": "à´Žà´¨àµà´¤àµ‹ à´ªà´¿à´¶à´•àµ à´¸à´‚à´­à´µà´¿à´šàµà´šàµ:",
  "login_invalid_doctor_credentials": "à´¤àµ†à´±àµà´±à´¾à´¯ doctor credentials",
  "login_invalid_admin_credentials": "à´¤àµ†à´±àµà´±à´¾à´¯ admin credentials",
  "login_invalid_pharmacy_credentials": "à´¤àµ†à´±àµà´±à´¾à´¯ pharmacy credentials",
  "login_offline_pharmacy_failed": "offline pharmacy login à´ªà´°à´¾à´œà´¯à´ªàµà´ªàµ†à´Ÿàµà´Ÿàµ. à´†à´¦àµà´¯à´‚ online login à´šàµ†à´¯àµà´¯àµà´•.",
  "login_mobile_required": "mobile à´¨à´®àµà´ªàµ¼ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ",
  "login_patient_registration_requires_internet": "patient registration-à´¨àµ internet à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "login_user_already_exists": "user à´‡à´¤à´¿à´¨à´•à´‚ à´‰à´£àµà´Ÿàµ. login à´šàµ†à´¯àµà´¯àµà´•.",
  "login_offline_login_failed": "offline login à´ªà´°à´¾à´œà´¯à´ªàµà´ªàµ†à´Ÿàµà´Ÿàµ. à´†à´¦àµà´¯à´‚ online login à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ register à´šàµ†à´¯àµà´¯àµà´•.",
  "login_pharmacy_table_missing": "pharmacy login à´ªà´°à´¾à´œà´¯à´‚: pharmacies table à´‡à´²àµà´².",
  "login_pharmacy_rls_denied": "pharmacy login à´ªà´°à´¾à´œà´¯à´‚: access à´¨à´¿à´°à´¸à´¿à´šàµà´šàµ.",
  "login_pharmacy_failed_prefix": "pharmacy login à´ªà´°à´¾à´œà´¯à´‚:",
  "appointments_page_title": "Appointmentsà´¯àµà´‚ Consultation Queueà´¯àµà´‚",
  "appointments_offline_mode_active": "offline mode à´¸à´œàµ€à´µà´®à´¾à´£àµ. à´ªàµà´¤à´¿à´¯ bookings à´ªà´¿à´¨àµà´¨àµ€à´Ÿàµ sync à´šàµ†à´¯àµà´¯àµà´‚.",
  "appointments_book_title": "Token / Appointment",
  "appointments_select_doctor": "Doctor à´¤à´¿à´°à´žàµà´žàµ†à´Ÿàµà´•àµà´•àµà´•",
  "appointments_date": "à´¤àµ€à´¯à´¤à´¿",
  "appointments_time": "à´¸à´®à´¯à´‚",
  "appointments_symptoms_issue": "à´²à´•àµà´·à´£à´‚ / à´ªàµà´°à´¶àµà´¨à´‚",
  "appointments_booking": "booking à´¨à´Ÿà´•àµà´•àµà´¨àµà´¨àµ...",
  "appointments_book_token": "Token book à´šàµ†à´¯àµà´¯àµà´•",
  "appointments_my_tokens": "à´Žà´¨àµà´±àµ† Tokens",
  "appointments_none": "à´‡à´ªàµà´ªàµ‹àµ¾ appointments à´‡à´²àµà´².",
  "appointments_token_prefix": "Token",
  "appointments_status": "à´¸àµà´¥à´¿à´¤à´¿",
  "appointments_booked": "booked",
  "appointments_sync_pending": "sync: upload à´¬à´¾à´•àµà´•à´¿",
  "appointments_symptoms": "à´²à´•àµà´·à´£à´™àµà´™àµ¾",
  "appointments_code": "Code",
  "appointments_join_video": "Video join à´šàµ†à´¯àµà´¯àµà´•",
  "appointments_open_text_consultation": "Text consultation à´¤àµà´±à´•àµà´•àµà´•",
  "appointments_patient_queue": "Patient Queue",
  "appointments_no_patients_queue": "queueà´¯à´¿àµ½ patients à´‡à´²àµà´².",
  "appointments_text_consult": "Text Consult",
  "appointments_video_consult_code": "Video Consult + Code",
  "appointments_share_code": "Code à´ªà´™àµà´•à´¿à´Ÿàµà´•",
  "appointments_mark_completed": "Completed à´†à´¯à´¿ à´®à´¾à´±àµà´±àµà´•",
  "appointments_patient_code": "Patient Code",
  "appointments_shared": "Shared",
  "appointments_fill_date_time_symptoms": "à´¤àµ€à´¯à´¤à´¿, à´¸à´®à´¯à´‚, à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´¨àµ½à´•àµà´•.",
  "appointments_patient_mobile_missing": "session-àµ½ patient mobile à´‡à´²àµà´².",
  "appointments_token_booked_success": "token à´µà´¿à´œà´¯à´•à´°à´®à´¾à´¯à´¿ book à´šàµ†à´¯àµà´¤àµ.",
  "appointments_token_saved_offline": "token offline save à´šàµ†à´¯àµà´¤àµ.",
  "appointments_booking_failed_prefix": "booking à´ªà´°à´¾à´œà´¯à´‚:",
  "appointments_cloud_required_online": "Supabase cloud à´‰à´‚ internet à´‰à´‚ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "appointments_unable_start_text": "text consultation à´†à´°à´‚à´­à´¿à´•àµà´•à´¾à´¨à´¾à´¯à´¿à´²àµà´².",
  "appointments_unable_start_video": "video consultation à´†à´°à´‚à´­à´¿à´•àµà´•à´¾à´¨à´¾à´¯à´¿à´²àµà´².",
  "appointments_unable_mark_completed": "completed à´†à´¯à´¿ à´®à´¾à´±àµà´±à´¾à´¨à´¾à´¯à´¿à´²àµà´².",
  "appointments_generate_video_code_first": "à´†à´¦àµà´¯à´‚ video code à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´•.",
  "appointments_code_copied": "code copy à´šàµ†à´¯àµà´¤àµ.",
  "appointments_share_this_code": "à´ˆ code à´ªà´™àµà´•à´¿à´Ÿàµà´•:",
  "chat_title": "Text Consultation",
  "chat_invalid_consultation": "à´…à´¸à´¾à´§àµà´µà´¾à´¯ consultation. appointment queueàµ½ à´¨à´¿à´¨àµà´¨àµ chat à´¤àµà´±à´•àµà´•àµà´•.",
  "chat_cloud_required": "chat-à´¿à´¨àµ cloud connection à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "chat_no_messages": "à´‡à´ªàµà´ªàµ‹àµ¾ messages à´‡à´²àµà´².",
  "chat_type_message": "message à´Žà´´àµà´¤àµà´•...",
  "chat_send": "à´…à´¯à´•àµà´•àµà´•",
  "chat_unable_send": "message à´…à´¯à´¯àµà´•àµà´•à´¾à´¨à´¾à´¯à´¿à´²àµà´².",
  "pharmacy_owner_not_found": "owner pharmacy à´•à´£àµà´Ÿà´¿à´²àµà´².",
  "pharmacy_enter_valid_medicine_units": "à´¶à´°à´¿à´¯à´¾à´¯ medicineà´¯àµà´‚ unitsà´¯àµà´‚ à´¨àµ½à´•àµà´•.",
  "pharmacy_owner_fields_required": "name, owner email, password à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "pharmacy_owner_created": "pharmacy owner à´¸àµƒà´·àµà´Ÿà´¿à´šàµà´šàµ.",
  "pharmacy_not_configured": "Supabase configure à´šàµ†à´¯àµà´¤à´¿à´Ÿàµà´Ÿà´¿à´²àµà´².",
  "pharmacy_internet_required": "cloud pharmacy data-à´•àµà´•àµ internet à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "pharmacy_create_owner_admin": "Pharmacy Owner à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´• (Admin)",
  "pharmacy_name": "Pharmacy Name",
  "pharmacy_area": "à´ªàµà´°à´¦àµ‡à´¶à´‚",
  "pharmacy_owner_email": "Owner Email",
  "pharmacy_owner_password": "Owner Password",
  "pharmacy_create_owner": "Owner à´¸àµƒà´·àµà´Ÿà´¿à´•àµà´•àµà´•",
  "pharmacy_update_stock": "Medicine Stock à´…à´ªàµà´¡àµ‡à´±àµà´±àµ à´šàµ†à´¯àµà´¯àµà´•",
  "pharmacy_logged_in_as": "à´²àµ‹à´—à´¿àµ» à´šàµ†à´¯àµà´¤à´¤àµ",
  "pharmacy_medicine_name": "Medicine Name (à´‰à´¦à´¾: Paracetamol)",
  "pharmacy_units": "Units",
  "pharmacy_update_units": "Units à´…à´ªàµà´¡àµ‡à´±àµà´±àµ à´šàµ†à´¯àµà´¯àµà´•",
  "admin_cloud_connection_required": "cloud connection à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "admin_not_configured": "Supabase configure à´šàµ†à´¯àµà´¤à´¿à´Ÿàµà´Ÿà´¿à´²àµà´². env keys à´¸à´œàµà´œà´®à´¾à´•àµà´•àµà´•.",
  "admin_offline_paused": "à´¨à´¿à´™àµà´™àµ¾ offline à´†à´£àµ. Admin live sync à´¨à´¿àµ¼à´¤àµà´¤à´¿à´¯à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨àµ.",
  "admin_total_patients_short": "à´†à´•àµ† à´°àµ‹à´—à´¿à´•àµ¾",
  "admin_doctors_short": "à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾àµ¼",
  "admin_appointments_today_short": "à´‡à´¨àµà´¨à´¤àµà´¤àµ† appointments",
  "admin_active_consults": "à´¸à´œàµ€à´µ consults",
  "admin_completed_cases": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯ à´•àµ‡à´¸àµà´•àµ¾",
  "admin_operational_controls": "Operational Controls",
  "admin_open_appointment_queue": "Appointment Queue à´¤àµà´±à´•àµà´•àµà´•",
  "admin_view_patient_records": "Patient Records à´•à´¾à´£àµà´•",
  "admin_pharmacy_monitor": "Pharmacy Monitor",
  "admin_doctor_workload": "Doctor Workload",
  "admin_live_appointment_monitor": "Live Appointment Monitor",
  "admin_no_appointments_found": "appointments à´’à´¨àµà´¨àµà´‚ à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿à´¯à´¿à´²àµà´².",
  "admin_force_complete": "Force Complete",
  "read_aloud": "à´¶à´¬àµà´¦à´®à´¾à´¯à´¿ à´µà´¾à´¯à´¿à´•àµà´•àµà´•",
  "voice_listening": "à´•àµ‡àµ¾à´•àµà´•àµà´¨àµà´¨àµ...",
  "symptom_voice_not_supported": "à´ˆ à´¬àµà´°àµ—à´¸à´±à´¿àµ½ voice input à´ªà´¿à´¨àµà´¤àµà´£à´¯àµà´•àµà´•àµà´¨àµà´¨à´¿à´²àµà´².",
  "symptom_enter_text_or_image": "à´†à´¦àµà´¯à´‚ symptom text à´¨àµ½à´•àµà´• à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´šà´¿à´¤àµà´°à´‚ upload à´šàµ†à´¯àµà´¯àµà´•.",
  "symptom_unable_process_image": "à´šà´¿à´¤àµà´°à´‚ offline à´†à´¯à´¿ process à´šàµ†à´¯àµà´¯à´¾à´¨à´¾à´¯à´¿à´²àµà´².",
  "symptom_on_device_ai_info": "On-device AI à´ˆ à´†à´ªàµà´ªà´¿àµ½ à´ªàµ‚àµ¼à´£àµà´£à´®à´¾à´¯àµà´‚ offline à´†à´¯à´¿ à´ªàµà´°à´µàµ¼à´¤àµà´¤à´¿à´•àµà´•àµà´¨àµà´¨àµ. à´•àµ‚à´Ÿàµà´¤àµ½ à´•àµƒà´¤àµà´¯à´¤à´¯àµà´•àµà´•àµ à´²à´­à´¿à´•àµà´•àµà´®àµà´ªàµ‹àµ¾ Online AI à´‰à´ªà´¯àµ‹à´—à´¿à´•àµà´•àµà´¨àµà´¨àµ.",
  "symptom_text_placeholder": "à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´Žà´´àµà´¤àµà´• (à´‰à´¦à´¾: 2 à´¦à´¿à´µà´¸à´®à´¾à´¯à´¿ à´ªà´¨à´¿, à´šàµà´®, à´¤àµŠà´£àµà´Ÿà´µàµ‡à´¦à´¨)",
  "symptom_speak_button": "à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´ªà´±à´¯àµà´•",
  "symptom_read_result": "à´«à´²à´‚ à´µà´¾à´¯à´¿à´•àµà´•àµà´•",
  "symptom_image_label": "à´šà´¿à´¤àµà´°à´‚",
  "symptom_analyzing": "à´µà´¿à´¶à´•à´²à´¨à´‚ à´¨à´Ÿà´•àµà´•àµà´¨àµà´¨àµ...",
  "symptom_check_offline": "à´²à´•àµà´·à´£à´‚ offline à´†à´¯à´¿ à´ªà´°à´¿à´¶àµ‹à´§à´¿à´•àµà´•àµà´•",
  "symptom_result": "à´«à´²à´‚",
  "symptom_engine": "Engine",
  "symptom_engine_ai": "AI (OpenAI)",
  "symptom_engine_offline": "On-device Offline AI",
  "symptom_probable_disease": "à´¸à´¾à´§àµà´¯à´¤à´¯àµà´³àµà´³ à´°àµ‹à´—à´‚",
  "symptom_natural_remedy": "à´¸àµà´µà´¾à´­à´¾à´µà´¿à´• à´ªà´°à´¿à´¹à´¾à´°à´‚",
  "symptom_doctor_guidance": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´¨à´¿àµ¼à´¦àµ‡à´¶à´‚",
  "symptom_confidence": "à´µà´¿à´¶àµà´µà´¾à´¸àµà´¯à´¤",
  "symptom_serious_detected": "à´—àµà´°àµà´¤à´° à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿: à´‰à´Ÿàµ» à´¡àµ‹à´•àµà´Ÿà´±àµ† à´¬à´¨àµà´§à´ªàµà´ªàµ†à´Ÿàµà´•.",
  "symptom_red_flags": "Red flags",
  "symptom_image_hint": "Image hint",
  "symptom_emergency_warning": "à´•à´Ÿàµà´¤àµà´¤ à´¨àµ†à´žàµà´šàµà´µàµ‡à´¦à´¨, à´¶àµà´µà´¸à´¨ à´¬àµà´¦àµà´§à´¿à´®àµà´Ÿàµà´Ÿàµ, à´†à´¶à´¯à´•àµà´•àµà´´à´ªàµà´ªàµ, à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´¨àµ€à´£àµà´Ÿàµà´¨à´¿àµ½à´•àµà´•àµà´¨àµà´¨ à´‰à´¯àµ¼à´¨àµà´¨ à´œàµà´µà´°à´‚ à´ªàµ‹à´²àµà´³àµà´³ à´²à´•àµà´·à´£à´™àµà´™àµ¾à´•àµà´•àµ à´‰à´Ÿàµ» à´†à´¶àµà´ªà´¤àµà´°à´¿ à´ªà´°à´¿à´šà´°à´£à´‚ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "symptom_recent_checks": "à´¸à´®àµ€à´ªà´•à´¾à´² à´ªà´°à´¿à´¶àµ‹à´§à´¨à´•àµ¾",
  "appointment_list_all": "à´Žà´²àµà´²à´¾ Appointments (Queue View)",
  "appointment_list_patient": "Patient Appointments",
  "appointment_list_reason": "à´•à´¾à´°à´£à´‚",
  "symptom_rule_viral_fever_disease": "à´µàµˆà´±àµ½ à´ªà´¨à´¿",
  "symptom_rule_viral_fever_remedy": "à´šàµ‚à´Ÿàµà´³àµà´³ à´¦àµà´°à´¾à´µà´•à´™àµà´™àµ¾ à´•àµà´Ÿà´¿à´•àµà´•àµà´•, à´®à´¤à´¿à´¯à´¾à´¯ à´µà´¿à´¶àµà´°à´®à´‚ à´Žà´Ÿàµà´•àµà´•àµà´•, à´¶à´°àµ€à´° à´¤à´¾à´ªà´¨à´¿à´² à´¶àµà´°à´¦àµà´§à´¿à´•àµà´•àµà´•.",
  "symptom_rule_viral_fever_advice": "à´ªà´¨à´¿ 102F-à´¨àµ à´®àµà´•à´³à´¿àµ½ à´†à´£àµ†à´™àµà´•à´¿àµ½ à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ 2 à´¦à´¿à´µà´¸à´¤àµà´¤à´¿à´²à´§à´¿à´•à´‚ à´¤àµà´Ÿàµ¼à´¨àµà´¨à´¾àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´¸à´®àµ€à´ªà´¿à´•àµà´•àµà´•.",
  "symptom_rule_cold_disease": "à´¸à´¾à´§à´¾à´°à´£ à´œà´²à´¦àµ‹à´·à´‚ / à´®àµà´•à´³à´¿à´²àµ† à´¶àµà´µà´¾à´¸à´•àµ‹à´¶ à´…à´£àµà´¬à´¾à´§",
  "symptom_rule_cold_remedy": "steam à´Žà´Ÿàµà´•àµà´•àµà´•, à´¤àµ‡à´¨àµà´‚ à´‡à´žàµà´šà´¿à´¯àµà´‚ à´šàµ‡àµ¼à´¤àµà´¤ à´šàµ‚à´Ÿàµà´µàµ†à´³àµà´³à´‚ à´•àµà´Ÿà´¿à´•àµà´•àµà´•, à´¶à´°àµ€à´°à´‚ à´¨à´¨àµà´¨à´¾à´¯à´¿ hydrate à´šàµ†à´¯àµà´¯àµà´•.",
  "symptom_rule_cold_advice": "à´¶àµà´µà´¾à´¸à´¤à´Ÿà´¸à´‚, à´¨àµ†à´žàµà´šàµà´µàµ‡à´¦à´¨, à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´‰à´¯àµ¼à´¨àµà´¨ à´ªà´¨à´¿ à´‰à´£àµà´Ÿàµ†à´™àµà´•à´¿àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_headache_disease": "à´Ÿàµ†àµ»à´·àµ» à´¤à´²à´µàµ‡à´¦à´¨ / à´®àµˆà´—àµà´°àµˆàµ»",
  "symptom_rule_headache_remedy": "à´‡à´°àµà´£àµà´Ÿ à´¶à´¾à´¨àµà´¤à´®à´¾à´¯ à´®àµà´±à´¿à´¯à´¿àµ½ à´µà´¿à´¶àµà´°à´®à´¿à´•àµà´•àµà´•, à´µàµ†à´³àµà´³à´‚ à´•àµà´Ÿà´¿à´•àµà´•àµà´•, à´…à´±à´¿à´¯à´¾à´µàµà´¨àµà´¨ triggers à´’à´´à´¿à´µà´¾à´•àµà´•àµà´•.",
  "symptom_rule_headache_advice": "à´µàµ€à´£àµà´Ÿàµà´‚ à´µàµ€à´£àµà´Ÿàµà´‚ à´•à´Ÿàµà´¤àµà´¤ à´¤à´²à´µàµ‡à´¦à´¨à´¯àµ‹ à´•à´¾à´´àµà´š à´®à´¾à´±àµà´±à´®àµ‹ à´‰à´£àµà´Ÿà´¾à´¯à´¾àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´¸à´®àµ€à´ªà´¿à´•àµà´•àµà´•.",
  "symptom_rule_gastro_disease": "à´—à´¾à´¸àµâ€Œà´Ÿàµà´°àµ‹à´Žàµ»à´±à´±àµˆà´±àµà´±à´¿à´¸àµ / à´«àµà´¡àµ à´ªàµŠà´¯à´¿à´¸à´£à´¿à´‚à´—àµ",
  "symptom_rule_gastro_remedy": "ORS à´‰à´ªà´¯àµ‹à´—à´¿à´•àµà´•àµà´•, à´²à´˜àµ à´­à´•àµà´·à´£à´‚ à´•à´´à´¿à´•àµà´•àµà´•, à´¤àµ‡à´™àµà´™à´¾à´µàµ†à´³àµà´³à´‚ à´•àµà´Ÿà´¿à´•àµà´•àµà´•, à´Žà´£àµà´£à´¯àµ‡à´±à´¿à´¯ à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´•à´¾à´°à´‚ à´•àµ‚à´Ÿà´¿à´¯ à´­à´•àµà´·à´£à´‚ à´’à´´à´¿à´µà´¾à´•àµà´•àµà´•.",
  "symptom_rule_gastro_advice": "à´®à´²à´¤àµà´¤à´¿àµ½ à´°à´•àµà´¤à´‚, à´¤àµà´Ÿàµ¼à´šàµà´šà´¯à´¾à´¯ à´›àµ¼à´¦àµà´¦à´¿, à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´¨à´¿àµ¼à´œà´²àµ€à´•à´°à´£à´‚ à´‰à´£àµà´Ÿàµ†à´™àµà´•à´¿àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_skin_disease": "à´¤àµà´µà´•àµà´•àµ à´…à´²àµ¼à´œà´¿ / à´¡àµ†àµ¼à´®à´±àµà´±àµˆà´±àµà´±à´¿à´¸àµ",
  "symptom_rule_skin_remedy": "à´¤àµà´µà´•àµà´•àµ à´¤à´£àµà´ªàµà´ªà´¾à´¯àµà´‚ à´µà´°à´£àµà´Ÿà´¤à´¾à´¯àµà´‚ à´¸àµ‚à´•àµà´·à´¿à´•àµà´•àµà´•, à´®àµƒà´¦àµà´µà´¾à´¯ moisturizer à´‰à´ªà´¯àµ‹à´—à´¿à´•àµà´•àµà´•, irritant à´‰àµ½à´ªàµà´ªà´¨àµà´¨à´™àµà´™àµ¾ à´’à´´à´¿à´µà´¾à´•àµà´•àµà´•.",
  "symptom_rule_skin_advice": "rash à´µàµ‡à´—à´¤àµà´¤à´¿àµ½ à´ªà´Ÿà´°àµà´•à´¯àµ‹, à´šàµ‹àµ¼à´šàµà´šà´¯àµ‹, à´µàµ€à´•àµà´•à´‚ à´‰à´£àµà´Ÿà´¾à´•àµà´•à´¯àµ‹ à´šàµ†à´¯àµà´¤à´¾àµ½ dermatologist-à´¨àµ† à´¸à´®àµ€à´ªà´¿à´•àµà´•àµà´•.",
  "symptom_rule_cardio_disease": "à´¸à´¾à´§àµà´¯à´®à´¾à´¯ à´¹àµƒà´¦à´¯-à´¶àµà´µà´¾à´¸à´•àµ‹à´¶ à´…à´Ÿà´¿à´¯à´¨àµà´¤à´°à´¾à´µà´¸àµà´¥",
  "symptom_rule_cardio_remedy": "à´ˆ à´°àµ€à´¤à´¿à´•àµà´•àµ à´µàµ€à´Ÿàµà´Ÿàµà´µàµˆà´¦àµà´¯ à´¨à´¿àµ¼à´¦àµ‡à´¶à´‚ à´‡à´²àµà´².",
  "symptom_rule_cardio_advice": "à´‰à´Ÿàµ» à´…à´Ÿà´¿à´¯à´¨àµà´¤à´° à´µàµˆà´¦àµà´¯à´¸à´¹à´¾à´¯à´‚ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "symptom_generic_disease": "à´µàµà´¯à´•àµà´¤à´®à´²àµà´²à´¾à´¤àµà´¤ à´²à´•àµà´·à´£ à´®à´¾à´¤àµƒà´•",
  "symptom_generic_remedy": "à´µàµ†à´³àµà´³à´‚ à´•àµà´Ÿà´¿à´•àµà´•àµà´•, à´²à´˜àµ à´ªàµ‹à´·à´•à´¾à´¹à´¾à´°à´‚ à´•à´´à´¿à´•àµà´•àµà´•, à´®à´¤à´¿à´¯à´¾à´¯ à´µà´¿à´¶àµà´°à´®à´‚ à´Žà´Ÿàµà´•àµà´•àµà´•.",
  "symptom_generic_advice": "à´²à´•àµà´·à´£à´™àµà´™àµ¾ 24-48 à´®à´£à´¿à´•àµà´•àµ‚à´±à´¿àµ½ à´•àµ‚à´Ÿàµà´¤à´²à´¾à´¯à´¿ à´¤àµà´Ÿàµ¼à´¨àµà´¨à´¾àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´¸à´®àµ€à´ªà´¿à´•àµà´•àµà´•.",
  "symptom_serious_pattern_advice": "à´—àµà´°àµà´¤à´° à´²à´•àµà´·à´£ à´®à´¾à´¤àµƒà´• à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿. à´‰à´Ÿàµ» à´¡àµ‹à´•àµà´Ÿà´±àµ† à´¸à´®àµ€à´ªà´¿à´•àµà´•àµà´•.",
  "symptom_potential_emergency_pattern": "à´¸à´¾à´§àµà´¯à´®à´¾à´¯ à´…à´Ÿà´¿à´¯à´¨àµà´¤à´° à´®à´¾à´¤àµƒà´•",
  "symptom_no_image_uploaded": "à´šà´¿à´¤àµà´°à´‚ à´…à´ªàµâ€Œà´²àµ‹à´¡àµ à´šàµ†à´¯àµà´¤à´¿à´Ÿàµà´Ÿà´¿à´²àµà´².",
  "symptom_image_hint_skin_name": "à´šà´¿à´¤àµà´°à´¤àµà´¤à´¿à´¨àµà´±àµ† à´ªàµ‡à´°àµ à´¤àµà´µà´•àµà´•àµ à´ªàµà´°à´¶àµà´¨à´‚ à´¸àµ‚à´šà´¿à´ªàµà´ªà´¿à´•àµà´•àµà´¨àµà´¨àµ. rash à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ allergy à´®à´¾à´¤àµƒà´•à´¯à´¾à´¯à´¿à´°à´¿à´•àµà´•à´¾à´‚.",
  "symptom_image_hint_red_tone": "à´šà´¿à´¤àµà´°à´¤àµà´¤à´¿àµ½ à´•àµ‚à´Ÿàµà´¤àµ½ à´šàµà´µà´ªàµà´ªàµ à´¨à´¿à´±à´®àµà´³àµà´³ à´­à´¾à´—à´™àµà´™àµ¾ à´•à´¾à´£àµà´¨àµà´¨àµ. à´‡à´¤àµ irritation, rash, à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ inflammation à´Žà´¨àµà´¨à´¿à´µà´¯àµà´®à´¾à´¯à´¿ à´ªàµŠà´°àµà´¤àµà´¤à´ªàµà´ªàµ†à´Ÿà´¾à´‚.",
  "symptom_image_hint_dark": "à´šà´¿à´¤àµà´°à´‚ à´µà´³à´°àµ† à´‡à´°àµà´£àµà´Ÿà´¤à´¾à´£àµ; à´µà´¿à´µà´°à´™àµà´™àµ¾ à´ªà´°à´¿à´®à´¿à´¤à´®à´¾à´£àµ. à´¨à´²àµà´² à´µàµ†à´³à´¿à´šàµà´šà´¤àµà´¤à´¿àµ½ à´µàµ€à´£àµà´Ÿàµà´‚ à´šà´¿à´¤àµà´°à´‚ à´Žà´Ÿàµà´•àµà´•àµà´•.",
  "symptom_image_hint_none": "offline image à´ªà´°à´¿à´¶àµ‹à´§à´¨à´¯à´¿àµ½ à´µàµà´¯à´•àµà´¤à´®à´¾à´¯ à´¦àµƒà´¶àµà´¯ à´®à´¾à´¤àµƒà´• à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿à´¯à´¿à´²àµà´².",
  "symptom_risk_reason_low": "à´¤àµ€àµ¼à´¤àµà´¥à´®à´¾à´•àµà´•àµ½ à´®à´°à´¤àµà´¤à´¿àµ½ à´‰à´¯àµ¼à´¨àµà´¨-à´†à´ªà´¤àµà´¤àµ à´¶à´¾à´– à´ªàµà´°à´µàµ¼à´¤àµà´¤à´¿à´šàµà´šà´¿à´Ÿàµà´Ÿà´¿à´²àµà´².",
  "symptom_risk_reason_medium": "à´®à´¿à´¤-à´†à´ªà´¤àµ à´²à´•àµà´·à´£ à´®à´¾à´¤àµƒà´• à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿.",
  "symptom_risk_reason_high": "à´…à´¤àµà´¯à´¾à´µà´¶àµà´¯à´‚ à´²à´•àµà´·à´£ à´®à´¾à´¤àµƒà´• à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿ (à´¹àµƒà´¦à´¯à´‚-à´¶àµà´µà´¾à´¸à´•àµ‹à´¶à´‚ à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ à´¨à´¾à´¡à´¿ à´±àµ†à´¡àµ à´«àµà´²à´¾à´—àµ).",
  "symptom_risk_value_low": "à´¤à´¾à´´àµà´¨àµà´¨à´¤àµ",
  "symptom_risk_value_medium": "à´®à´¿à´¤à´‚",
  "symptom_risk_value_high": "à´‰à´¯àµ¼à´¨àµà´¨à´¤àµ",
  "symptom_voice_issue_prefix": "à´¸à´¾à´§àµà´¯à´®à´¾à´¯ à´ªàµà´°à´¶àµà´¨à´‚:",
  "symptom_voice_remedy_prefix": "à´¸àµà´µà´¾à´­à´¾à´µà´¿à´• à´ªà´°à´¿à´¹à´¾à´°à´‚:",
  "symptom_voice_advice_prefix": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´¨à´¿àµ¼à´¦àµ‡à´¶à´‚:",
  "symptom_not_clear": "à´µàµà´¯à´•àµà´¤à´®à´²àµà´²",
  "symptom_none": "à´’à´¨àµà´¨àµà´®à´¿à´²àµà´²",
  "symptom_consult_if_needed": "à´†à´µà´¶àµà´¯à´®àµ†à´™àµà´•à´¿àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´¸à´®àµ€à´ªà´¿à´•àµà´•àµà´•",
  "symptom_age_placeholder": "à´ªàµà´°à´¾à´¯à´‚ (à´à´šàµà´›à´¿à´•à´‚, à´…à´ªà´•à´Ÿà´¸à´¾à´§àµà´¯à´¤ à´¨à´¿àµ¼à´¦àµ‡à´¶à´‚ à´®àµ†à´šàµà´šà´ªàµà´ªàµ†à´Ÿàµà´¤àµà´¤àµà´¨àµà´¨àµ)",
  "symptom_risk_level": "à´…à´ªà´•à´Ÿà´¸à´¾à´§àµà´¯à´¤ à´¨à´¿à´²",
  "symptom_safety_note": "à´¸àµà´°à´•àµà´· à´•àµà´±à´¿à´ªàµà´ªàµ",
  "symptom_confidence_low": "à´•àµà´±à´žàµà´ž",
  "symptom_confidence_medium": "à´®à´§àµà´¯à´¸àµà´¥",
  "symptom_confidence_high": "à´‰à´¯àµ¼à´¨àµà´¨",
  "symptom_rule_viral_fever_remedy": "à´¨à´¨àµà´¨à´¾à´¯à´¿ à´œà´²à´¸à´‚à´¤àµƒà´ªàµà´¤à´®à´¾à´•àµà´•àµà´•, à´µà´¿à´¶àµà´°à´¾à´®à´‚ à´Žà´Ÿàµà´•àµà´•àµà´•, à´¤à´¾à´ªà´¨à´¿à´² à´¨à´¿à´°àµ€à´•àµà´·à´¿à´•àµà´•àµà´•.",
  "symptom_rule_viral_fever_advice": "à´ªà´¨à´¿ 2 à´¦à´¿à´µà´¸à´¤àµà´¤à´¿àµ½ à´•àµ‚à´Ÿàµà´¤àµ½ à´¤àµà´Ÿà´°àµà´•à´¯àµ‹ à´ªàµà´¤à´¿à´¯ à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´•à´¾à´£à´ªàµà´ªàµ†à´Ÿàµà´•à´¯àµ‹ à´šàµ†à´¯àµà´¤à´¾àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_cold_cough_remedy": "à´šàµ‚à´Ÿà´¾à´¯ à´¦àµà´°à´¾à´µà´•à´‚, à´¨àµ€à´°à´¾à´µà´¿ à´¶àµà´µà´¾à´¸à´‚, à´…à´¨àµà´¯àµ‹à´œàµà´¯à´®à´¾à´¯ à´µà´¿à´¶àµà´°à´¾à´®à´‚ à´¸à´¹à´¾à´¯à´¿à´•àµà´•à´¾à´‚.",
  "symptom_rule_cold_cough_advice": "à´¶àµà´µà´¾à´¸àµ‹à´šàµà´›àµà´µà´¾à´¸ à´¬àµà´¦àµà´§à´¿à´®àµà´Ÿàµà´Ÿ, à´‰à´¯àµ¼à´¨àµà´¨ à´ªà´¨à´¿, à´¨à´¿à´°à´¨àµà´¤à´°à´®à´¾à´¯ à´šàµà´® à´‰à´£àµà´Ÿàµ†à´™àµà´•à´¿àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_migraine_headache_remedy": "à´¨à´¿à´¶àµà´¶à´¬àµà´¦à´®à´¾à´¯ à´‡à´°àµà´£àµà´Ÿ à´®àµà´±à´¿à´¯à´¿àµ½ à´µà´¿à´¶àµà´°à´¾à´®à´‚ à´Žà´Ÿàµà´•àµà´•àµà´•, à´¸àµà´«à´Ÿà´¿à´• à´¨à´¿à´²à´¨à´¿àµ¼à´¤àµà´¤àµà´•.",
  "symptom_rule_migraine_headache_advice": "à´¤à´²à´•à´±àµà´ªàµà´ªàµ à´•à´ à´¿à´¨à´®àµ‹ à´†à´µàµ¼à´¤àµà´¤à´¿à´¤à´®àµ‹ à´¨à´°àµà´µàµ‹à´ªà´¾à´§à´¿ à´²à´•àµà´·à´£à´™àµà´™àµ¾ à´‰à´£àµà´Ÿàµ†à´™àµà´•à´¿àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_gastro_issue_remedy": "à´®àµà´– à´ªàµà´¨àµ¼à´œà´²àµ€à´•à´°à´£à´‚, à´²à´˜àµ à´­à´•àµà´·à´£à´‚, à´Žà´£àµà´£à´¯àµà´³àµà´³ à´­à´•àµà´·à´£à´‚ à´’à´´à´¿à´µà´¾à´•àµà´•àµà´•.",
  "symptom_rule_gastro_issue_advice": "à´›àµ¼à´¦àµà´¦à´¿ à´¤àµà´Ÿà´°àµà´•à´¯àµ‹ à´¨à´¿àµ¼à´œà´²àµ€à´•à´°à´£à´‚ à´µà´·à´¿à´¯àµà´•à´¯àµ‹ à´°à´•àµà´¤à´‚ à´•à´¾à´£à´ªàµà´ªàµ†à´Ÿàµà´•à´¯àµ‹ à´šàµ†à´¯àµà´¤à´¾àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_skin_allergy_remedy": "à´Ÿàµà´°à´¿à´—àµ¼ à´‰à´ªàµ‡à´•àµà´·à´¿à´•àµà´•àµà´•, à´šàµ¼à´®àµà´®à´‚ à´¶àµà´¦àµà´§à´®à´¾à´•àµà´•à´¿ à´¨à´¿à´²à´¨à´¿àµ¼à´¤àµà´¤àµà´•, à´¸àµà´¨à´¿à´—àµà´§à´®à´¾à´¯à´¿ à´ªà´°à´¿à´šà´°à´£à´‚ à´‰à´ªà´¯àµ‹à´—à´¿à´•àµà´•àµà´•.",
  "symptom_rule_skin_allergy_advice": "à´šàµà´£àµà´Ÿàµà´µà´°àµà´¤àµ à´ªàµ†à´Ÿàµà´Ÿàµ†à´¨àµà´¨àµ à´ªà´°à´¨àµà´¨àµ‹, à´•àµ‹à´Ÿàµà´Ÿàµà´•àµ¾ à´‰à´£àµà´Ÿà´¾à´¯àµ‹ à´¨à´¾à´°àµà´ªàµà´ªàµ‹à´Ÿàµà´Ÿàµà´£àµà´Ÿà´¾à´¯àµ‹ à´šàµ†à´¯àµà´¤à´¾àµ½ à´¡àµ‹à´•àµà´Ÿà´±àµ† à´•à´¾à´£àµà´•.",
  "symptom_rule_cardio_respiratory_remedy": "à´•à´ à´¿à´¨à´ªàµà´°à´¯à´¤àµà´¨à´‚ à´’à´´à´¿à´µà´¾à´•àµà´•àµà´•, à´¨àµ†à´žàµà´šàµ à´…à´²àµà´²àµ†à´¨àµà´¨àµ à´¶àµà´µà´¾à´¸ à´²à´•àµà´·à´£à´™àµà´™àµ¾à´•àµà´•àµ à´…à´¨à´¿à´¯à´¨àµà´¤àµà´°à´¿à´¤ à´µàµˆà´¦àµà´¯ à´¸à´¹à´¾à´¯à´‚ à´¨àµ‡à´Ÿàµà´•.",
  "symptom_rule_cardio_respiratory_advice": "à´¨àµ†à´žàµà´šàµ à´µàµ‡à´¦à´¨ à´…à´²àµà´²àµ†à´¨àµà´¨àµ à´¶àµà´µà´¾à´¸ à´¬àµà´¦àµà´§à´¿à´®àµà´Ÿàµà´Ÿà´¿à´¨à´¾à´¯à´¿ à´…à´¨à´¿à´¯à´¨àµà´¤àµà´°à´¿à´¤ à´¡àµ‹à´•àµà´Ÿàµ¼ à´Žà´¨àµà´¨àµà´‚ à´…à´¤à´¿à´°àµ‹à´— à´¸à´‚à´°à´•àµà´·à´£à´‚ à´¶àµà´ªà´¾à´°à´¿à´¶àµà´šà´¿à´¤àµà´šàµ†à´¯àµà´¯à´ªàµà´ªàµ†à´Ÿàµà´¨àµà´¨àµ.",
  "specialty_general_medicine": "à´ªàµŠà´¤àµ à´µàµˆà´¦àµà´¯à´¶à´¾à´¸àµà´¤àµà´°à´‚",
  "specialty_dermatology": "à´šàµ¼à´®àµà´®à´°àµ‹à´— à´¶à´¾à´¸àµà´¤àµà´°à´‚",
  "specialty_pediatrics": "à´•àµà´Ÿàµà´Ÿà´¿ à´µàµˆà´¦àµà´¯à´¶à´¾à´¸àµà´¤àµà´°à´‚",  "doctor_kumar": "à´¡àµ‹. à´•àµà´®à´¾à´°àµ",
  "doctor_anjali": "à´¡àµ‹. à´…à´žàµà´œà´²à´¿",
  "doctor_arun": "à´¡àµ‹. à´…à´°àµà´£àµ",  "home_analytics_title": "à´µà´¿à´¶à´•à´²à´¨à´‚",
  "home_analytics_desc": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµ à´ªàµà´°à´µà´£à´¤à´¯àµà´‚ à´²à´•àµà´·à´£ à´µà´¿à´µà´°à´™àµà´™à´³àµà´‚ à´•à´¾à´£àµà´•.",
  "admin_analytics_button": "à´µà´¿à´¶à´•à´²à´¨ à´¡à´¾à´·àµà´¬àµ‹àµ¼à´¡àµ",
  "doctor_availability_title": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´²à´­àµà´¯à´¤",
  "doctor_availability_live": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´‚ à´•àµºà´¸àµ¾à´Ÿàµà´Ÿàµ‡à´·àµ» à´°àµ‡à´–à´•à´³àµà´‚ à´…à´Ÿà´¿à´¸àµà´¥à´¾à´¨à´®à´¾à´•àµà´•à´¿à´¯ à´²àµˆà´µàµ à´¨à´¿à´².",
  "doctor_availability_offline": "à´“à´«àµâ€Œà´²àµˆàµ» à´®àµ‹à´¡àµ: à´…à´µà´¸à´¾à´¨à´®à´¾à´¯à´¿ à´¸à´¿à´™àµà´•àµ à´šàµ†à´¯àµà´¤/à´²àµ‹à´•àµà´•àµ½ à´°àµ‡à´–à´•àµ¾ à´•à´¾à´£à´¿à´•àµà´•àµà´¨àµà´¨àµ.",
  "doctor_availability_status_available": "à´²à´­àµà´¯à´®à´¾à´£àµ",
  "doctor_availability_status_in_consultation": "à´ªà´°à´¾à´®àµ¼à´¶à´¤àµà´¤à´¿à´²à´¾à´£àµ",
  "doctor_availability_specialty": "à´µà´¿à´¦à´—àµâ€Œà´§à´¤",
  "doctor_availability_total_consults": "à´®àµŠà´¤àµà´¤à´‚ à´ªà´°à´¾à´®àµ¼à´¶à´™àµà´™àµ¾",
  "doctor_availability_active_consults": "à´¨à´¿à´²à´µà´¿à´²àµ† à´ªà´°à´¾à´®àµ¼à´¶à´™àµà´™àµ¾",
  "doctor_availability_completed": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯à´¿",
  "doctor_availability_upcoming_queue": "à´µà´°à´¾à´¨à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨ à´¨à´¿à´°",
  "doctor_availability_next_slot": "à´…à´Ÿàµà´¤àµà´¤ à´¸à´®à´¯à´‚",
  "doctor_availability_no_upcoming_slot": "à´µà´°à´¾à´¨à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨ à´¸à´®à´¯à´‚ à´‡à´²àµà´²",
  "condition_general_non_specific": "à´ªàµŠà´¤àµà´µà´¾à´¯ à´¨à´¿àµ¼à´¦àµà´¦à´¿à´·àµà´Ÿà´®à´²àµà´²à´¾à´¤àµà´¤ à´²à´•àµà´·à´£à´™àµà´™àµ¾",
  "condition_viral_fever": "à´µàµˆà´±àµ½ à´ªà´¨à´¿",
  "condition_cold_cough": "à´¶àµ€à´¤à´³à´µàµà´‚ à´šàµà´®à´¯àµà´‚",
  "condition_migraine_headache": "à´®àµˆà´—àµà´°àµ†à´¯àµàµ» / à´¤à´²à´µàµ‡à´¦à´¨",
  "condition_gastro_issue": "à´—à´¾à´¸àµà´Ÿàµà´°àµ‹à´ªàµà´°à´¶àµà´¨à´‚",
  "condition_skin_allergy": "à´¤àµà´µà´•àµà´•àµ à´…à´²àµ¼à´œà´¿",
  "condition_cardio_respiratory": "à´¹àµƒà´¦à´¯à´‚-à´¶àµà´µà´¾à´¸à´•àµ‹à´¶ à´…à´ªà´•à´Ÿà´‚",
  "status_mode": "à´®àµ‹à´¡àµ",
  "doctor_analytics_title": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´µà´¿à´¶à´•à´²à´¨à´‚",
  "doctor_analytics_subtitle": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´‚ à´ªà´°à´¾à´®àµ¼à´¶ à´ªàµà´°à´µà´¾à´¹à´µàµà´‚ à´¸à´‚à´¬à´¨àµà´§à´¿à´šàµà´š à´ªàµà´°à´µàµ¼à´¤àµà´¤à´¨à´¸à´‚à´—àµà´°à´¹à´‚.",
  "doctor_analytics_total_appointments": "à´®àµŠà´¤àµà´¤à´‚ à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "doctor_analytics_pending": "à´¬à´¾à´•àµà´•à´¿",
  "doctor_analytics_completed": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯à´¿",
  "doctor_analytics_video_consults": "à´µàµ€à´¡à´¿à´¯àµ‹ à´ªà´°à´¾à´®àµ¼à´¶à´™àµà´™àµ¾",
  "doctor_analytics_text_consults": "à´Ÿàµ†à´•àµà´¸àµà´±àµà´±àµ à´ªà´°à´¾à´®àµ¼à´¶à´™àµà´™àµ¾",
  "doctor_analytics_last7days": "à´•à´´à´¿à´žàµà´ž 7 à´¦à´¿à´µà´¸à´¤àµà´¤àµ† à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµ à´ªàµà´°à´µà´£à´¤",
  "doctor_analytics_top_symptoms": "à´à´±àµà´±à´µàµà´‚ à´•àµ‚à´Ÿàµà´¤àµ½ à´±à´¿à´ªàµà´ªàµ‹àµ¼à´Ÿàµà´Ÿàµ à´šàµ†à´¯àµà´¤ à´²à´•àµà´·à´£à´™àµà´™àµ¾",
  "doctor_analytics_no_symptom_data": "à´‡à´¨à´¿à´¯àµà´‚ à´²à´•àµà´·à´£ à´¡à´¾à´±àµà´± à´‡à´²àµà´².",
  "admin_analytics_title": "à´…à´¡àµà´®à´¿àµ» à´µà´¿à´¶à´•à´²à´¨à´‚",
  "admin_analytics_subtitle": "à´ªàµà´²à´¾à´±àµà´±àµà´«àµ‹à´‚ à´¤à´²à´¤àµà´¤à´¿à´²àµà´³àµà´³ à´ªàµà´°à´µàµ¼à´¤àµà´¤à´¨-à´‰à´ªà´¯àµ‹à´— à´µà´¿à´¶à´•à´²à´¨à´‚.",
  "admin_analytics_total_patients": "à´®àµŠà´¤àµà´¤à´‚ à´°àµ‹à´—à´¿à´•àµ¾",
  "admin_analytics_total_appointments": "à´®àµŠà´¤àµà´¤à´‚ à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "admin_analytics_today_appointments": "à´‡à´¨àµà´¨à´¤àµà´¤àµ† à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "admin_analytics_pending_cases": "à´¬à´¾à´•àµà´•à´¿à´¯àµà´³àµà´³ à´•àµ‡à´¸àµà´•àµ¾",
  "admin_analytics_completed_cases": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯ à´•àµ‡à´¸àµà´•àµ¾",
  "admin_analytics_cancelled_cases": "à´±à´¦àµà´¦à´¾à´•àµà´•à´¿à´¯ à´•àµ‡à´¸àµà´•àµ¾",
  "admin_analytics_total_doctors": "à´¡àµ‹à´•àµà´Ÿàµ¼à´®à´¾àµ¼",
  "admin_analytics_total_pharmacies": "à´«à´¾àµ¼à´®à´¸à´¿à´•àµ¾",
  "admin_analytics_doctor_workload": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´ªàµà´°à´µàµ¼à´¤àµà´¤à´¨à´­à´¾à´°à´‚",
  "admin_analytics_table_doctor": "à´¡àµ‹à´•àµà´Ÿàµ¼",
  "admin_analytics_table_appointments": "à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "admin_analytics_table_completed": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯à´¿",
  "admin_analytics_table_completion_rate": "à´ªàµ‚àµ¼à´¤àµà´¤àµ€à´•à´°à´£à´‚ %",
  "admin_analytics_pharmacy_stock_summary": "à´«à´¾àµ¼à´®à´¸à´¿ à´¸àµà´±àµà´±àµ‹à´•àµà´•àµ à´¸à´‚à´—àµà´°à´¹à´‚",
  "admin_analytics_no_pharmacy_stock_data": "à´«à´¾àµ¼à´®à´¸à´¿ à´¸àµà´±àµà´±àµ‹à´•àµà´•àµ à´¡à´¾à´±àµà´± à´²à´­àµà´¯à´®à´²àµà´².",
  "admin_analytics_table_pharmacy": "à´«à´¾àµ¼à´®à´¸à´¿",
  "admin_analytics_table_medicines_listed": "à´ªà´Ÿàµà´Ÿà´¿à´•à´ªàµà´ªàµ†à´Ÿàµà´¤àµà´¤à´¿à´¯ à´®à´°àµà´¨àµà´¨àµà´•àµ¾",
  "admin_analytics_table_total_units": "à´®àµŠà´¤àµà´¤à´‚ à´¯àµ‚à´£à´¿à´±àµà´±àµà´•àµ¾",
  "appointments_not_consulted": "à´‡à´¨à´¿à´¯àµà´‚ à´ªà´°à´¾à´®àµ¼à´¶à´¿à´šàµà´šà´¿à´Ÿàµà´Ÿà´¿à´²àµà´²",
  "appointments_consulted": "à´ªà´°à´¾à´®àµ¼à´¶à´¿à´šàµà´šàµ",
  "appointments_no_pending_consultations": "à´¬à´¾à´•àµà´•à´¿ à´ªà´°à´¾à´®àµ¼à´¶à´™àµà´™àµ¾ à´‡à´²àµà´².",
  "appointments_no_completed_consultations": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯ à´ªà´°à´¾à´®àµ¼à´¶à´™àµà´™àµ¾ à´‡à´²àµà´².",
  "common_action": "à´¨à´Ÿà´ªà´Ÿà´¿",
  "common_edit": "à´¤à´¿à´°àµà´¤àµà´¤àµà´•",
  "pharmacy_click_medicine_to_edit": "à´¯àµ‚à´£à´¿à´±àµà´±àµ à´ªàµà´¤àµà´•àµà´•à´¾àµ» à´®à´°àµà´¨àµà´¨à´¿à´¨àµà´±àµ† à´ªàµ‡à´°àµ à´…à´²àµà´²àµ†à´™àµà´•à´¿àµ½ 'à´¤à´¿à´°àµà´¤àµà´¤àµà´•' à´…à´®àµ¼à´¤àµà´¤àµà´•.",
  "add_patient_subtitle": "à´°àµ‹à´—à´¿à´¯àµà´Ÿàµ† à´•àµà´²à´¿à´¨à´¿à´•àµà´•àµ½ à´µà´¿à´µà´°à´™àµà´™àµ¾ à´¨àµ½à´•àµà´•à´¯àµà´‚ à´°àµ‡à´–à´•à´³à´¿àµ½ à´¸àµ‡à´µàµ à´šàµ†à´¯àµà´¯àµà´•à´¯àµà´‚ à´šàµ†à´¯àµà´¯àµà´•.",
  "add_patient_required_fields": "à´¦à´¯à´µà´¾à´¯à´¿ à´ªàµ‡à´°àµ, à´µà´¯à´¸àµ, à´…à´µà´¸àµà´¥ à´¨àµ½à´•àµà´•.",
  "add_patient_permission_denied": "Supabase RLS à´…à´¨àµà´®à´¤à´¿ à´¨à´¿à´·àµ‡à´§à´¿à´šàµà´šàµ. patients à´Ÿàµ‡à´¬à´¿àµ¾ à´¨à´¯à´™àµà´™àµ¾ à´ªàµà´¤àµà´•àµà´•àµà´•.",
  "add_patient_table_missing": "Supabase-àµ½ patients à´Ÿàµ‡à´¬à´¿àµ¾ à´²à´­àµà´¯à´®à´²àµà´².",
  "add_patient_unable_prefix": "à´°àµ‹à´—à´¿à´¯àµ† à´šàµ‡àµ¼à´•àµà´•à´¾àµ» à´•à´´à´¿à´žàµà´žà´¿à´²àµà´²:",
  "additional_data_label": "à´•àµ‚à´Ÿàµà´¤àµ½ à´µà´¿à´µà´°à´‚",
  "doctor_patients_title": "à´°àµ‹à´—à´¿ à´°àµ‡à´–à´•àµ¾",
  "doctor_patients_subtitle": "à´¡àµ‹à´•àµà´Ÿàµ¼ à´¨à´¿à´¯à´¨àµà´¤àµà´°à´¿à´•àµà´•àµà´¨àµà´¨ à´°àµ‹à´—à´¿ à´µà´¿à´µà´°à´™àµà´™à´³àµà´‚ à´•àµà´²à´¿à´¨à´¿à´•àµà´•àµ½ à´•àµà´±à´¿à´ªàµà´ªàµà´•à´³àµà´‚.",
  "doctor_patients_filter_placeholder": "à´ªàµ‡à´°àµ, à´µà´¯à´¸àµ, à´…à´µà´¸àµà´¥, à´•àµ‚à´Ÿàµà´¤àµ½ à´µà´¿à´µà´°à´‚ à´Žà´¨àµà´¨à´¿à´µ à´‰à´ªà´¯àµ‹à´—à´¿à´šàµà´šàµ à´«à´¿àµ½à´±àµà´±àµ¼ à´šàµ†à´¯àµà´¯àµà´•",
  "doctor_patients_no_records": "à´°àµ‹à´—à´¿ à´°àµ‡à´–à´•àµ¾ à´’à´¨àµà´¨àµà´‚ à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿à´¯à´¿à´²àµà´².",
  "doctor_patients_internet_required": "à´‡à´¨àµà´±àµ¼à´¨àµ†à´±àµà´±àµ à´•à´£à´•àµà´·à´¨àµà´‚ Supabase-à´µàµà´‚ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.",
  "doctor_patients_name_required": "à´ªàµ‡à´°àµ à´¨à´¿àµ¼à´¬à´¨àµà´§à´®à´¾à´£àµ.",
  "doctor_patients_updated": "à´°àµ‹à´—à´¿ à´°àµ‡à´– à´ªàµà´¤àµà´•àµà´•à´¿.",
  "doctor_patients_update_failed_prefix": "à´°àµ‹à´—à´¿ à´°àµ‡à´– à´ªàµà´¤àµà´•àµà´•à´¾àµ» à´•à´´à´¿à´žàµà´žà´¿à´²àµà´²:",
  "doctor_patients_delete_confirm": "à´ˆ à´°àµ‹à´—à´¿ à´°àµ‡à´– à´‡à´²àµà´²à´¾à´¤à´¾à´•àµà´•à´£àµ‹? à´‡à´¤àµ à´¤à´¿à´°à´¿à´šàµà´šàµà´•àµŠà´£àµà´Ÿàµà´µà´°à´¾àµ» à´•à´´à´¿à´¯à´¿à´²àµà´².",
  "doctor_patients_deleted": "à´°àµ‹à´—à´¿ à´°àµ‡à´– à´‡à´²àµà´²à´¾à´¤à´¾à´•àµà´•à´¿.",
  "doctor_patients_delete_failed_prefix": "à´°àµ‹à´—à´¿ à´°àµ‡à´– à´‡à´²àµà´²à´¾à´¤à´¾à´•àµà´•à´¾àµ» à´•à´´à´¿à´žàµà´žà´¿à´²àµà´²:",
  "doctor_patients_delete": "à´‡à´²àµà´²à´¾à´¤à´¾à´•àµà´•àµà´•",
  "profile_title": "à´Žà´¨àµà´±àµ† à´ªàµà´°àµŠà´«àµˆàµ½",
  "profile_online_text": "à´“àµºà´²àµˆàµ»: à´à´±àµà´±à´µàµà´‚ à´ªàµà´¤à´¿à´¯ à´°àµ‡à´–à´•àµ¾ à´²à´­àµà´¯à´®à´¾à´£àµ.",
  "profile_offline_text": "à´“à´«àµâ€Œà´²àµˆàµ»: à´ªàµà´°à´¾à´¦àµ‡à´¶à´¿à´• à´ªàµà´°àµŠà´«àµˆàµ½ à´•à´¾à´£à´¾à´¨àµà´‚ à´ªàµà´¤àµà´•àµà´•à´¾à´¨àµà´‚ à´•à´´à´¿à´¯àµà´‚.",
  "profile_patient_id": "à´°àµ‹à´—à´¿ à´à´¡à´¿",
  "profile_role": "à´­àµ‚à´®à´¿à´•",
  "profile_online": "à´“àµºà´²àµˆàµ»",
  "profile_offline": "à´“à´«àµâ€Œà´²àµˆàµ»",
  "profile_mobile_not_found": "à´°àµ‹à´—à´¿à´¯àµà´Ÿàµ† à´®àµŠà´¬àµˆàµ½ à´¨à´®àµà´ªàµ¼ à´•à´£àµà´Ÿàµ†à´¤àµà´¤à´¿à´¯à´¿à´²àµà´².",
  "profile_name_age_required": "à´ªàµ‡à´°àµà´‚ à´µà´¯à´¸àµà´¸àµà´‚ à´¨à´¿àµ¼à´¬à´¨àµà´§à´®à´¾à´£àµ.",
  "profile_updated_success": "à´ªàµà´°àµŠà´«àµˆàµ½ à´µà´¿à´œà´¯à´•à´°à´®à´¾à´¯à´¿ à´ªàµà´¤àµà´•àµà´•à´¿.",
  "profile_update_failed": "à´‡à´ªàµà´ªàµ‹àµ¾ à´ªàµà´°àµŠà´«àµˆàµ½ à´ªàµà´¤àµà´•àµà´•à´¾àµ» à´•à´´à´¿à´žàµà´žà´¿à´²àµà´². à´¦à´¯à´µà´¾à´¯à´¿ à´µàµ€à´£àµà´Ÿàµà´‚ à´¶àµà´°à´®à´¿à´•àµà´•àµà´•.",
  "profile_updating": "à´ªàµà´¤àµà´•àµà´•àµà´¨àµà´¨àµ...",
  "profile_update_button": "à´ªàµà´°àµŠà´«àµˆàµ½ à´ªàµà´¤àµà´•àµà´•àµà´•",
  "profile_care_summary": "à´ªà´°à´¿à´šà´°à´£ à´¸à´‚à´—àµà´°à´¹à´‚",
  "profile_total": "à´®àµŠà´¤àµà´¤à´‚",
  "profile_upcoming": "à´µà´°à´¾à´¨à´¿à´°à´¿à´•àµà´•àµà´¨àµà´¨à´¤àµ",
  "profile_active": "à´¸à´œàµ€à´µà´‚",
  "profile_completed": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯à´¿",
  "profile_recent_appointments": "à´¸à´®àµ€à´ªà´•à´¾à´² à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾",
  "profile_no_appointments": "à´‡à´¨à´¿à´¯àµà´‚ à´…à´ªàµà´ªàµ‹à´¯à´¿à´¨àµà´±àµà´®àµ†à´¨àµà´±àµà´•àµ¾ à´‡à´²àµà´².",
  "pharmacy_apollo_name": "à´…à´ªàµà´ªàµ‹à´³àµ‹ à´«à´¾àµ¼à´®à´¸à´¿",
  "pharmacy_pharmeasy_name": "à´«à´¾àµ¼à´®à´‡à´¸à´¿ à´¸àµà´±àµà´±àµ‹àµ¼",
  "city_chennai": "à´šàµ†à´¨àµà´¨àµˆ",
  "city_bangalore": "à´¬àµ†à´‚à´—à´³àµ‚à´°àµ",
  "patient_home_hint": "à´’à´°àµ à´µà´²à´¿à´¯ à´¬à´Ÿàµà´Ÿàµº à´…à´®àµ¼à´¤àµà´¤àµà´•. à´µàµ‹à´¯à´¿à´¸àµ à´•à´®à´¾àµ»à´¡àµà´•àµ¾à´•àµà´•àµ Speak à´¬à´Ÿàµà´Ÿàµº à´‰à´ªà´¯àµ‹à´—à´¿à´•àµà´•àµà´•.",
  "chat_offline_message": "à´“à´«àµâ€Œà´²àµˆàµ» à´®àµ‹à´¡àµ: à´¸à´¨àµà´¦àµ‡à´¶à´™àµà´™àµ¾ à´²àµ‹à´•àµà´•à´²à´¿ à´¸àµ‚à´•àµà´·à´¿à´•àµà´•àµà´¨àµà´¨àµ; à´•àµà´²àµ—à´¡àµ à´²à´­àµà´¯à´®à´¾à´•àµà´¨àµà´¨à´¤àµà´µà´°àµ† à´¸à´¿à´™àµà´•àµ à´šàµ†à´¯àµà´¯à´¿à´²àµà´².",
  "chat_speak_message": "à´¸à´¨àµà´¦àµ‡à´¶à´‚ à´ªà´±à´¯àµà´•",
  "appointments_status_booked": "à´¬àµà´•àµà´•àµ à´šàµ†à´¯àµà´¤àµ",
  "appointments_status_in_consultation": "à´ªà´°à´¾à´®àµ¼à´¶à´¤àµà´¤à´¿àµ½",
  "appointments_status_completed": "à´ªàµ‚àµ¼à´¤àµà´¤à´¿à´¯à´¾à´¯à´¿",
  "admin_doctor_workload_item": "{{name}} | à´®àµŠà´¤àµà´¤à´‚: {{total}} | à´¸à´œàµ€à´µà´‚: {{active}}"
}
```

---

## File: `src\locales\ta.json`
```json
{
  "welcome": "à®µà®°à®µà¯‡à®±à¯à®•à®¿à®±à¯‹à®®à¯",
  "login": "à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯",
  "select_role": "à®ªà®™à¯à®•à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯",
  "register": "à®•à®£à®•à¯à®•à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à®µà¯à®®à¯",
  "patient": "à®¨à¯‹à®¯à®¾à®³à®°à¯",
  "doctor": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯",
  "pharmacy": "à®®à®°à¯à®¨à¯à®¤à®•à®®à¯",
  "admin": "à®¨à®¿à®°à¯à®µà®¾à®•à®¿",
  "name": "à®ªà¯†à®¯à®°à¯",
  "age": "à®µà®¯à®¤à¯",
  "mobile": "à®®à¯Šà®ªà¯ˆà®²à¯ à®Žà®£à¯",
  "email": "à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯",
  "phone": "à®¤à¯Šà®²à¯ˆà®ªà¯‡à®šà®¿ à®Žà®£à¯",
  "password": "à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯",
  "condition": "à®¨à®¿à®²à¯ˆ",
  "already_account": "à®à®±à¯à®•à®©à®µà¯‡ à®•à®£à®•à¯à®•à¯ à®‰à®³à¯à®³à®¤à®¾? à®‰à®³à¯à®¨à¯à®´à¯ˆà®¯à®µà¯à®®à¯",
  "new_user": "à®ªà¯à®¤à®¿à®¯ à®ªà®¯à®©à®°à®¾? à®•à®£à®•à¯à®•à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à®µà¯à®®à¯",
  "invalid_credentials": "à®¤à®µà®±à®¾à®© à®šà®¾à®©à¯à®±à¯à®•à®³à¯",
  "registered_success": "à®ªà®¤à®¿à®µà¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à¯",
  "please_login": "à®ªà®¤à®¿à®µà¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à¯. à®¤à¯Šà®Ÿà®° à®‰à®³à¯à®¨à¯à®´à¯ˆà®¯à®µà¯à®®à¯.",
  "save": "à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
  "cancel": "à®°à®¤à¯à®¤à¯",
  "close": "âœ–",
  "nav": {
    "home": "à®®à¯à®•à®ªà¯à®ªà¯",
    "appointments": "à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
    "symptoms": "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯",
    "health_tips": "à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
    "consultation": "à®†à®²à¯‹à®šà®©à¯ˆ",
    "doctors": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®•à®¿à®Ÿà¯ˆà®ªà¯à®ªà¯à®•à®³à¯",
    "profile": "à®šà¯à®¯à®µà®¿à®µà®°à®®à¯",
    "pharmacy": "à®®à®°à¯à®¨à¯à®¤à®•à®®à¯",
    "dashboard": "à®Ÿà®¾à®·à¯à®ªà¯‹à®°à¯à®Ÿà¯",
    "users": "à®ªà®¯à®©à®°à¯à®•à®³à¯",
    "settings": "à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯",
    "analytics": "à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯"
  },
  "pharmacy_title": "à®…à®°à¯à®•à®¿à®²à¯à®³à¯à®³ à®®à®°à¯à®¨à¯à®¤à®•à®™à¯à®•à®³à®¿à®²à¯ à®®à®°à¯à®¨à¯à®¤à¯ à®•à®¿à®Ÿà¯ˆà®ªà¯à®ªà¯à®•à®³à¯",
  "pharmacy_search_placeholder": "à®®à®°à¯à®¨à¯à®¤à®¿à®©à¯ à®ªà¯†à®¯à®°à¯ˆ à®¤à¯‡à®Ÿà¯à®™à¯à®•à®³à¯ (à®‰à®¤à®¾: à®ªà®¾à®°à®¾à®šà¯†à®Ÿà¯à®Ÿà®®à®¾à®²à¯)",
  "pharmacy_helper": "à®…à®°à¯à®•à®¿à®²à¯à®³à¯à®³ à®®à®°à¯à®¨à¯à®¤à®•à®™à¯à®•à®³à®¿à®²à¯ à®•à®¿à®Ÿà¯ˆà®ªà¯à®ªà¯ˆ à®ªà®¾à®°à¯à®•à¯à®• à®®à®°à¯à®¨à¯à®¤à®¿à®©à¯ à®ªà¯†à®¯à®°à¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà¯à®™à¯à®•à®³à¯",
  "available": " à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯",
  "out_of_stock": " à®¸à¯à®Ÿà®¾à®•à¯ à®‡à®²à¯à®²à¯ˆ",
  "not_available": " à®‡à®¨à¯à®¤ à®®à®°à¯à®¨à¯à®¤à®•à®¤à¯à®¤à®¿à®²à¯ à®®à®°à¯à®¨à¯à®¤à¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®µà®¿à®²à¯à®²à¯ˆ",
  "units": "à®¯à¯‚à®©à®¿à®Ÿà¯à®•à®³à¯",
  "book_appointment_title": "à®¨à®¿à®¯à®®à®©à¯ˆ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
  "book_appointment_desc": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ˆ à®¤à®¿à®Ÿà¯à®Ÿà®®à®¿à®Ÿà®µà¯à®®à¯",
  "symptom_checker_title": "à®…à®±à®¿à®•à¯à®±à®¿ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
  "symptom_checker_desc": "à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆ à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®µà¯à®®à¯",
  "consultation_title": " à®†à®²à¯‹à®šà®©à¯ˆ",
  "consultation_desc": "à®†à®©à¯à®²à¯ˆà®©à¯ à®†à®²à¯‹à®šà®©à¯ˆ",
  "video_call_card_title": " à®µà¯€à®Ÿà®¿à®¯à¯‹ à®…à®´à¯ˆà®ªà¯à®ªà¯",
  "video_call_card_desc": "à®¨à¯‡à®°à®²à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ à®¤à¯Šà®Ÿà®™à¯à®•à®µà¯à®®à¯",
  "doctors_title": " à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯",
  "doctors_desc": "à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯",
  "your_appointments": "à®‰à®™à¯à®•à®³à¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "appointment_1": "12 à®ªà®¿à®ªà¯ 2026 | 10:30 AM | à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®•à¯à®®à®¾à®°à¯",
  "appointment_2": "18 à®ªà®¿à®ªà¯ 2026 | 04:00 PM | à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®…à®žà¯à®šà®²à®¿",
  "health_tips_title": "à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
  "health_tip_1": " à®¤à®¿à®©à®®à¯à®®à¯ à®ªà¯‹à®¤à¯à®®à®¾à®© à®…à®³à®µà¯ à®¤à®£à¯à®£à¯€à®°à¯ à®•à¯à®Ÿà®¿à®•à¯à®•à®µà¯à®®à¯",
  "health_tip_2": " à®¤à®¿à®©à®®à¯à®®à¯ 30 à®¨à®¿à®®à®¿à®Ÿà®®à¯ à®¨à®Ÿà®•à¯à®•à®µà¯à®®à¯",
  "welcome_doctor": "à®µà®°à®µà¯‡à®±à¯à®•à®¿à®±à¯‹à®®à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯",
  "add_patient_title": " à®¨à¯‹à®¯à®¾à®³à®¿à®¯à¯ˆ à®šà¯‡à®°à¯à®•à¯à®•à®µà¯à®®à¯",
  "add_patient_desc": "à®ªà¯à®¤à®¿à®¯ à®¨à¯‹à®¯à®¾à®³à®¿à®¯à®¿à®©à¯ à®µà®¿à®µà®°à®™à¯à®•à®³à¯ˆ à®šà¯‡à®°à¯à®•à¯à®•à®µà¯à®®à¯",
  "view_patients_title": " à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à¯",
  "view_patients_desc": "à®Žà®²à¯à®²à®¾ à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆà®¯à¯à®®à¯ à®ªà®¾à®°à¯à®•à¯à®•à®µà¯à®®à¯",
  "appointments_title": " à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "appointments_desc": "à®‡à®©à¯à®±à¯ˆà®¯ à®¤à®¿à®Ÿà¯à®Ÿà®®à®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯",
  "prescriptions_title": " à®®à®°à¯à®¨à¯à®¤à¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
  "prescriptions_desc": "à®®à®°à¯à®¨à¯à®¤à¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®µà¯à®®à¯",
  "patient_name": "à®¨à¯‹à®¯à®¾à®³à®¿à®¯à®¿à®©à¯ à®ªà¯†à®¯à®°à¯",
  "appointment_form_title": "à®¨à®¿à®¯à®®à®©à®¤à¯à®¤à¯ˆ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
  "appointment_form_saved_offline": "à®¨à®¿à®¯à®®à®©à®®à¯ à®†à®ƒà®ªà¯à®²à¯ˆà®©à®¿à®²à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
  "patient_age": "à®µà®¯à®¤à¯",
  "patient_condition": "à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®¨à®¿à®²à¯ˆ",
  "save_patient": "à®¨à¯‹à®¯à®¾à®³à®¿à®¯à¯ˆ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
  "patient_added_success": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¾à®°à¯",
  "add_patient_error": "à®¨à¯‹à®¯à®¾à®³à®¿à®¯à¯ˆ à®šà¯‡à®°à¯à®•à¯à®•à¯à®®à¯à®ªà¯‹à®¤à¯ à®ªà®¿à®´à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
  "nav_toggle_menu": "à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à¯ˆ à®®à®¾à®±à¯à®±à®µà¯à®®à¯",
  "patient_list": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à¯",
  "no_patients": "à®‡à®©à¯à®©à¯à®®à¯ à®¨à¯‹à®¯à®¾à®³à®¿à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ",
  "admin_dashboard": "à®¨à®¿à®°à¯à®µà®¾à®• à®Ÿà®¾à®·à¯à®ªà¯‹à®°à¯à®Ÿà¯",
  "admin_users_title": " à®ªà®¯à®©à®°à¯à®•à®³à¯",
  "admin_users_desc": "à®¨à¯‹à®¯à®¾à®³à®¿à®•à®³à¯ & à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯ à®¨à®¿à®°à¯à®µà®•à®¿à®ªà¯à®ªà¯",
  "admin_appointments_title": " à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "admin_appointments_desc": "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "admin_doctors_title": " à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯",
  "admin_doctors_desc": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®•à®¿à®Ÿà¯ˆà®ªà¯à®ªà¯à®®à¯ à®šà¯à®¯à®µà®¿à®µà®°à®™à¯à®•à®³à¯à®®à¯",
  "admin_settings_title": " à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯",
  "admin_settings_desc": "à®…à®®à¯ˆà®ªà¯à®ªà¯ à®•à®Ÿà¯à®Ÿà®®à¯ˆà®ªà¯à®ªà¯",
  "system_overview": "à®…à®®à¯ˆà®ªà¯à®ªà¯ à®®à¯‡à®±à¯à®ªà®¾à®°à¯à®µà¯ˆ",
  "total_patients": "à®®à¯Šà®¤à¯à®¤ à®¨à¯‹à®¯à®¾à®³à®¿à®•à®³à¯: 128",
  "total_doctors": " à®®à¯Šà®¤à¯à®¤ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯: 14",
  "appointments_today": " à®‡à®©à¯à®±à¯ˆà®¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯: 22",
  "admin_actions": "à®¨à®¿à®°à¯à®µà®¾à®• à®šà¯†à®¯à®²à¯à®•à®³à¯",
  "approve_doctors": "à®ªà¯à®¤à®¿à®¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯ˆ à®…à®™à¯à®•à¯€à®•à®°à®¿à®•à¯à®•à®µà¯à®®à¯",
  "monitor_logs": " à®¨à®¿à®¯à®®à®© à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯",
  "update_guidelines": "à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà¯à®¤à®²à¯à®•à®³à¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯",
  "video_call_title": "à®µà¯€à®Ÿà®¿à®¯à¯‹ à®†à®²à¯‹à®šà®©à¯ˆ",
  "video_call_online": "à®†à®©à¯à®²à¯ˆà®©à¯",
  "video_call_offline": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯",
  "video_call_doctor_hint": "à®’à®°à¯ à®…à®±à¯ˆà®¯à¯ˆ à®¤à¯Šà®Ÿà®™à¯à®•à®¿ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ˆ à®‰à®™à¯à®•à®³à¯ à®¨à¯‹à®¯à®¾à®³à®¿à®¯à¯à®Ÿà®©à¯ à®ªà®•à®¿à®°à¯à®™à¯à®•à®³à¯.",
  "video_call_patient_hint": "à®•à®¾à®²à®¿à®²à¯ à®šà¯‡à®° à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®…à®±à¯ˆ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà¯à®™à¯à®•à®³à¯.",
  "video_call_room_code": "à®†à®²à¯‹à®šà®©à¯ˆ à®…à®±à¯ˆ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯",
  "video_call_generate": "à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯",
  "video_call_signed_as": "à®‡à®µà¯à®µà®¾à®±à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®¨à¯à®¤à¯à®³à¯à®³à¯€à®°à¯",
  "video_call_you": "à®‰à®™à¯à®•à®³à¯ à®µà¯€à®Ÿà®¿à®¯à¯‹",
  "video_call_remote": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ / à®¨à¯‹à®¯à®¾à®³à®°à¯",
  "video_call_remote_idle": "à®¨à¯‡à®°à®²à¯ˆ à®µà¯€à®Ÿà®¿à®¯à¯‹ à®†à®²à¯‹à®šà®©à¯ˆ à®¤à¯Šà®Ÿà®™à¯à®• à®…à®±à¯ˆà®¯à®¿à®²à¯ à®‡à®£à¯ˆà®¯à¯à®™à¯à®•à®³à¯.",
  "video_call_join": "à®•à®¾à®²à¯ à®šà¯‡à®°à®µà¯à®®à¯",
  "video_call_connecting": "à®‡à®£à¯ˆà®•à¯à®•à®¿à®±à®¤à¯...",
  "video_call_waiting": "à®‡à®£à¯ˆà®¨à¯à®¤à®¤à¯. à®®à®±à¯à®± à®ªà®™à¯à®•à¯‡à®±à¯à®ªà®¾à®³à®°à¯ˆ à®•à®¾à®¤à¯à®¤à®¿à®°à¯à®•à¯à®•à®¿à®±à®¤à¯...",
  "video_call_connected": "à®‡à®£à¯ˆà®¨à¯à®¤à®¤à¯",
  "video_call_mute": "à®®à¯ˆà®•à¯ à®®à¯à®¯à¯‚à®Ÿà¯",
  "video_call_unmute": "à®®à¯ˆà®•à¯ à®…à®©à¯-à®®à¯à®¯à¯‚à®Ÿà¯",
  "video_call_camera_off": "à®•à¯‡à®®à®°à®¾ à®†à®ƒà®ªà¯",
  "video_call_camera_on": "à®•à¯‡à®®à®°à®¾ à®†à®©à¯",
  "video_call_end": "à®•à®¾à®²à¯ˆà®•à¯ à®®à¯à®Ÿà®¿à®•à¯à®•à®µà¯à®®à¯",
  "video_call_ended": "à®•à®¾à®²à¯ à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à¯. à®Žà®ªà¯à®ªà¯‹à®¤à¯ à®µà¯‡à®£à¯à®Ÿà¯à®®à®¾à®©à®¾à®²à¯à®®à¯ à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®šà¯‡à®°à®²à®¾à®®à¯.",
  "video_call_enter_room": "à®®à¯à®¤à®²à®¿à®²à¯ à®…à®±à¯ˆ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯ à®…à®²à¯à®²à®¤à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à®µà¯à®®à¯.",
  "video_call_room_not_ready": "à®…à®±à¯ˆ à®¤à®¯à®¾à®°à®¾à®• à®‡à®²à¯à®²à¯ˆ. à®®à¯à®¤à®²à®¿à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®¤à¯Šà®Ÿà®™à¯à®•à®šà¯ à®šà¯Šà®²à¯à®²à¯à®™à¯à®•à®³à¯.",
  "video_call_start_error": "à®•à®¾à®²à¯ à®¤à¯Šà®Ÿà®™à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "video_call_not_supported": "à®‡à®¨à¯à®¤ à®‰à®²à®¾à®µà®¿ à®µà¯€à®Ÿà®¿à®¯à¯‹ à®…à®´à¯ˆà®ªà¯à®ªà¯ˆ à®†à®¤à®°à®¿à®•à¯à®•à®µà®¿à®²à¯à®²à¯ˆ.",
  "video_call_permission_error": "à®•à¯‡à®®à®°à®¾/à®®à¯ˆà®•à¯à®°à¯‹à®ƒà®ªà¯‹à®©à¯ à®…à®©à¯à®®à®¤à®¿ à®®à®±à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯. à®…à®©à¯à®®à®¤à®¿à®•à®³à¯ˆ à®µà®´à®™à¯à®•à®µà¯à®®à¯.",
  "video_call_room_placeholder": "TM-AB12CD",
  "video_call_waiting_host": "à®‡à®¨à¯à®¤ à®…à®±à¯ˆà®¯à¯ˆ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®¤à¯Šà®Ÿà®™à¯à®• à®•à®¾à®¤à¯à®¤à®¿à®°à¯à®•à¯à®•à®¿à®±à®¤à¯...",
  "video_call_room_connect_error": "à®†à®²à¯‹à®šà®©à¯ˆ à®…à®±à¯ˆà®¯à¯à®Ÿà®©à¯ à®‡à®£à¯ˆà®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "video_call_connection_failed": "à®‡à®£à¯ˆà®ªà¯à®ªà¯ à®¤à¯à®£à¯à®Ÿà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯. à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®…à®±à¯ˆà®¯à®¿à®²à¯ à®šà¯‡à®° à®®à¯à®¯à®±à¯à®šà®¿à®•à¯à®•à®µà¯à®®à¯.",
  "video_call_cloud_required": "à®µà¯€à®Ÿà®¿à®¯à¯‹ à®…à®´à¯ˆà®ªà¯à®ªà®¿à®±à¯à®•à¯ à®‡à®£à¯ˆà®¯à®®à¯à®®à¯ Supabase realtime-à®®à¯à®®à¯ à®¤à¯‡à®µà¯ˆ.",
  "video_call_mic_live_status": "à®®à¯ˆà®•à¯ à®šà¯†à®¯à®²à®¿à®²à¯à®³à¯à®³à®¤à¯",
  "video_call_mic_muted_status": "à®®à¯ˆà®•à¯ à®®à¯à®¯à¯‚à®Ÿà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯",
  "video_call_camera_live_status": "à®•à¯‡à®®à®°à®¾ à®šà¯†à®¯à®²à®¿à®²à¯à®³à¯à®³à®¤à¯",
  "video_call_camera_muted_status": "à®•à¯‡à®®à®°à®¾ à®…à®£à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯",
  "video_call_leave_status": "à®‡à®¨à¯à®¤ à®†à®²à¯‹à®šà®©à¯ˆà®¯à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®µà¯†à®³à®¿à®¯à¯‡à®±à¯",
  "loading": "à®à®±à¯à®±à¯à®•à®¿à®±à®¤à¯...",
  "please_wait": "à®•à®¾à®¤à¯à®¤à®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯...",
  "unknown_error": "à®¤à¯†à®°à®¿à®¯à®¾à®¤ à®ªà®¿à®´à¯ˆ",
  "generic_error_prefix": "à®à®¤à¯‹ à®ªà®¿à®´à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯:",
  "login_invalid_doctor_credentials": "à®¤à®µà®±à®¾à®© à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®šà®¾à®©à¯à®±à¯à®•à®³à¯",
  "login_invalid_admin_credentials": "à®¤à®µà®±à®¾à®© à®¨à®¿à®°à¯à®µà®¾à®•à®¿ à®šà®¾à®©à¯à®±à¯à®•à®³à¯",
  "login_invalid_pharmacy_credentials": "à®¤à®µà®±à®¾à®© à®®à®°à¯à®¨à¯à®¤à®•à®®à¯ à®šà®¾à®©à¯à®±à¯à®•à®³à¯",
  "login_offline_pharmacy_failed": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯ à®®à®°à¯à®¨à¯à®¤à®•à®®à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯ à®¤à¯‹à®²à¯à®µà®¿. à®®à¯à®¤à®²à®¿à®²à¯ à®†à®©à¯à®²à¯ˆà®©à®¿à®²à¯ à®’à®°à¯à®®à¯à®±à¯ˆ à®‰à®³à¯à®¨à¯à®´à¯ˆà®¯à®µà¯à®®à¯.",
  "login_mobile_required": "à®®à¯Šà®ªà¯ˆà®²à¯ à®Žà®£à¯ à®¤à¯‡à®µà¯ˆ",
  "login_patient_registration_requires_internet": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯ à®‡à®£à¯ˆà®¯à®®à¯ à®¤à¯‡à®µà¯ˆ.",
  "login_user_already_exists": "à®ªà®¯à®©à®°à¯ à®à®±à¯à®•à®©à®µà¯‡ à®‰à®³à¯à®³à®¾à®°à¯. à®‰à®³à¯à®¨à¯à®´à¯ˆà®¯à®µà¯à®®à¯.",
  "login_offline_login_failed": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯ à®¤à¯‹à®²à¯à®µà®¿. à®®à¯à®¤à®²à®¿à®²à¯ à®†à®©à¯à®²à¯ˆà®©à®¿à®²à¯ à®ªà®¤à®¿à®µà¯ à®…à®²à¯à®²à®¤à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
  "login_pharmacy_table_missing": "à®®à®°à¯à®¨à¯à®¤à®•à®®à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯ à®¤à¯‹à®²à¯à®µà®¿: pharmacies table à®‡à®²à¯à®²à¯ˆ.",
  "login_pharmacy_rls_denied": "à®®à®°à¯à®¨à¯à®¤à®•à®®à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯ à®¤à¯‹à®²à¯à®µà®¿: à®…à®£à¯à®•à®²à¯ à®®à®±à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "login_pharmacy_failed_prefix": "à®®à®°à¯à®¨à¯à®¤à®•à®®à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®µà¯ à®¤à¯‹à®²à¯à®µà®¿:",
  "appointments_page_title": "à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®²à¯‹à®šà®©à¯ˆ à®µà®°à®¿à®šà¯ˆ",
  "appointments_offline_mode_active": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯ à®®à¯à®±à¯ˆ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®Ÿà®¿à®²à¯ à®‰à®³à¯à®³à®¤à¯. à®ªà¯à®¤à®¿à®¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ à®ªà®¿à®©à¯à®©à®°à¯ à®’à®¤à¯à®¤à®¿à®šà¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯.",
  "appointments_book_title": "à®Ÿà¯‹à®•à¯à®•à®©à¯ / à®¨à®¿à®¯à®®à®©à®®à¯ à®ªà®¤à®¿à®µà¯",
  "appointments_select_doctor": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯",
  "appointments_date": "à®¤à¯‡à®¤à®¿",
  "appointments_time": "à®¨à¯‡à®°à®®à¯",
  "appointments_symptoms_issue": "à®…à®±à®¿à®•à¯à®±à®¿ / à®ªà®¿à®°à®šà¯à®šà®©à¯ˆ",
  "appointments_booking": "à®ªà®¤à®¿à®µà¯ à®¨à®Ÿà¯ˆà®ªà¯†à®±à¯à®•à®¿à®±à®¤à¯...",
  "appointments_book_token": "à®Ÿà¯‹à®•à¯à®•à®©à¯ à®ªà®¤à®¿à®µà¯",
  "appointments_my_tokens": "à®Žà®©à¯ à®Ÿà¯‹à®•à¯à®•à®©à¯à®•à®³à¯",
  "appointments_none": "à®‡à®©à¯à®©à¯à®®à¯ à®¨à®¿à®¯à®®à®©à®®à¯ à®‡à®²à¯à®²à¯ˆ.",
  "appointments_token_prefix": "à®Ÿà¯‹à®•à¯à®•à®©à¯",
  "appointments_status": "à®¨à®¿à®²à¯ˆ",
  "appointments_booked": "booked",
  "appointments_sync_pending": "à®’à®¤à¯à®¤à®¿à®šà¯ˆ: à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®®à¯ à®¨à®¿à®²à¯à®µà¯ˆ",
  "appointments_symptoms": "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯",
  "appointments_code": "à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯",
  "appointments_join_video": "à®µà¯€à®Ÿà®¿à®¯à¯‹à®µà®¿à®²à¯ à®šà¯‡à®°à®µà¯à®®à¯",
  "appointments_open_text_consultation": "à®‰à®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆà®¯à¯ˆà®¤à¯ à®¤à®¿à®±à®•à¯à®•à®µà¯à®®à¯",
  "appointments_patient_queue": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®µà®°à®¿à®šà¯ˆ",
  "appointments_no_patients_queue": "à®µà®°à®¿à®šà¯ˆà®¯à®¿à®²à¯ à®¨à¯‹à®¯à®¾à®³à®¿à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ.",
  "appointments_text_consult": "à®‰à®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ",
  "appointments_video_consult_code": "à®µà¯€à®Ÿà®¿à®¯à¯‹ à®†à®²à¯‹à®šà®©à¯ˆ + à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯",
  "appointments_share_code": "à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ˆ à®ªà®•à®¿à®°à®µà¯à®®à¯",
  "appointments_mark_completed": "à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à®¾à®• à®•à¯à®±à®¿à®•à¯à®•à®µà¯à®®à¯",
  "appointments_patient_code": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯",
  "appointments_shared": "à®ªà®•à®¿à®°à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
  "appointments_fill_date_time_symptoms": "à®¤à¯‡à®¤à®¿, à®¨à¯‡à®°à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆ à®¨à®¿à®°à®ªà¯à®ªà®µà¯à®®à¯.",
  "appointments_patient_mobile_missing": "session-à®²à¯ à®¨à¯‹à®¯à®¾à®³à®°à¯ à®®à¯Šà®ªà¯ˆà®²à¯ à®Žà®£à¯ à®‡à®²à¯à®²à¯ˆ.",
  "appointments_token_booked_success": "à®Ÿà¯‹à®•à¯à®•à®©à¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "appointments_token_saved_offline": "à®Ÿà¯‹à®•à¯à®•à®©à¯ à®†à®ƒà®ªà¯à®²à¯ˆà®©à®¿à®²à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "appointments_booking_failed_prefix": "à®ªà®¤à®¿à®µà¯ à®¤à¯‹à®²à¯à®µà®¿:",
  "appointments_cloud_required_online": "Supabase cloud à®®à®±à¯à®±à¯à®®à¯ à®‡à®£à¯ˆà®¯à®®à¯ à®¤à¯‡à®µà¯ˆ.",
  "appointments_unable_start_text": "à®‰à®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆà®¯à¯ˆ à®¤à¯Šà®Ÿà®™à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "appointments_unable_start_video": "à®µà¯€à®Ÿà®¿à®¯à¯‹ à®†à®²à¯‹à®šà®©à¯ˆà®¯à¯ˆ à®¤à¯Šà®Ÿà®™à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "appointments_unable_mark_completed": "à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à®¾à®• à®•à¯à®±à®¿à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "appointments_generate_video_code_first": "à®®à¯à®¤à®²à®¿à®²à¯ video code à®‰à®°à¯à®µà®¾à®•à¯à®•à®µà¯à®®à¯.",
  "appointments_code_copied": "à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯ à®¨à®•à®²à¯†à®Ÿà¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "appointments_share_this_code": "à®‡à®¨à¯à®¤ à®•à¯à®±à®¿à®¯à¯€à®Ÿà¯à®Ÿà¯ˆ à®ªà®•à®¿à®°à®µà¯à®®à¯:",
  "chat_title": "à®‰à®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ",
  "chat_invalid_consultation": "à®¤à®µà®±à®¾à®© à®†à®²à¯‹à®šà®©à¯ˆ. à®¨à®¿à®¯à®®à®© à®µà®°à®¿à®šà¯ˆà®¯à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®‰à®°à¯ˆà®¯à®¾à®Ÿà®²à¯ˆ à®¤à®¿à®±à®•à¯à®•à®µà¯à®®à¯.",
  "chat_cloud_required": "à®…à®°à®Ÿà¯à®Ÿà¯ˆ à®šà¯†à®¯à®²à®¿à®•à¯à®•à¯ cloud à®‡à®£à¯ˆà®ªà¯à®ªà¯ à®¤à¯‡à®µà¯ˆ.",
  "chat_no_messages": "à®‡à®©à¯à®©à¯à®®à¯ à®šà¯†à®¯à¯à®¤à®¿à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ.",
  "chat_type_message": "à®šà¯†à®¯à¯à®¤à®¿à®¯à¯ˆ à®¤à®Ÿà¯à®Ÿà®šà¯à®šà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯...",
  "chat_send": "à®…à®©à¯à®ªà¯à®ªà¯",
  "chat_unable_send": "à®šà¯†à®¯à¯à®¤à®¿à®¯à¯ˆ à®…à®©à¯à®ªà¯à®ª à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "pharmacy_owner_not_found": "à®‰à®°à®¿à®®à¯ˆà®¯à®¾à®³à®°à¯ à®®à®°à¯à®¨à¯à®¤à®•à®®à¯ à®•à®¾à®£à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
  "pharmacy_enter_valid_medicine_units": "à®šà®°à®¿à®¯à®¾à®© à®®à®°à¯à®¨à¯à®¤à¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®³à®µà¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯.",
  "pharmacy_owner_fields_required": "à®ªà¯†à®¯à®°à¯, à®‰à®°à®¿à®®à¯ˆà®¯à®¾à®³à®°à¯ à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯, à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯ à®¤à¯‡à®µà¯ˆ.",
  "pharmacy_owner_created": "à®®à®°à¯à®¨à¯à®¤à®• à®‰à®°à®¿à®®à¯ˆà®¯à®¾à®³à®°à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "pharmacy_not_configured": "Supabase à®…à®®à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
  "pharmacy_internet_required": "cloud à®®à®°à¯à®¨à¯à®¤à®• à®¤à®°à®µà¯à®•à¯à®•à¯ à®‡à®£à¯ˆà®¯à®®à¯ à®¤à¯‡à®µà¯ˆ.",
  "pharmacy_create_owner_admin": "à®®à®°à¯à®¨à¯à®¤à®• à®‰à®°à®¿à®®à¯ˆà®¯à®¾à®³à®°à¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à®µà¯à®®à¯ (Admin)",
  "pharmacy_name": "à®®à®°à¯à®¨à¯à®¤à®• à®ªà¯†à®¯à®°à¯",
  "pharmacy_area": "à®ªà®•à¯à®¤à®¿",
  "pharmacy_owner_email": "à®‰à®°à®¿à®®à¯ˆà®¯à®¾à®³à®°à¯ à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯",
  "pharmacy_owner_password": "à®‰à®°à®¿à®®à¯ˆà®¯à®¾à®³à®°à¯ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯",
  "pharmacy_create_owner": "à®‰à®°à¯à®µà®¾à®•à¯à®•à¯",
  "pharmacy_update_stock": "à®®à®°à¯à®¨à¯à®¤à¯ à®‡à®°à¯à®ªà¯à®ªà¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯",
  "pharmacy_logged_in_as": "à®‰à®³à¯à®¨à¯à®´à¯ˆà®¨à¯à®¤à®µà®°à¯",
  "pharmacy_medicine_name": "à®®à®°à¯à®¨à¯à®¤à¯ à®ªà¯†à®¯à®°à¯ (à®‰à®¤à®¾: Paracetamol)",
  "pharmacy_units": "à®…à®²à®•à¯à®•à®³à¯",
  "pharmacy_update_units": "à®…à®²à®•à¯à®•à®³à¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯",
  "admin_cloud_connection_required": "cloud à®‡à®£à¯ˆà®ªà¯à®ªà¯ à®¤à¯‡à®µà¯ˆ.",
  "admin_not_configured": "Supabase à®…à®®à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ. env keys à®…à®®à¯ˆà®•à¯à®•à®µà¯à®®à¯.",
  "admin_offline_paused": "à®¨à¯€à®™à¯à®•à®³à¯ à®†à®ƒà®ªà¯à®²à¯ˆà®©à®¿à®²à¯ à®‰à®³à¯à®³à¯€à®°à¯à®•à®³à¯. Admin live sync à®¨à®¿à®±à¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯.",
  "admin_total_patients_short": "à®®à¯Šà®¤à¯à®¤ à®¨à¯‹à®¯à®¾à®³à®¿à®•à®³à¯",
  "admin_doctors_short": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯",
  "admin_appointments_today_short": "à®‡à®©à¯à®±à¯ˆà®¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "admin_active_consults": "à®šà¯†à®¯à®²à®¿à®²à¯à®³à¯à®³ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯",
  "admin_completed_cases": "à®®à¯à®Ÿà®¿à®¨à¯à®¤ à®µà®´à®•à¯à®•à¯à®•à®³à¯",
  "admin_operational_controls": "à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®•à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®¾à®Ÿà¯à®•à®³à¯",
  "admin_open_appointment_queue": "à®¨à®¿à®¯à®®à®© à®µà®°à®¿à®šà¯ˆà®¯à¯ˆ à®¤à®¿à®±à®•à¯à®•à®µà¯à®®à¯",
  "admin_view_patient_records": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆ à®ªà®¾à®°à¯à®•à¯à®•à®µà¯à®®à¯",
  "admin_pharmacy_monitor": "à®®à®°à¯à®¨à¯à®¤à®• à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯",
  "admin_doctor_workload": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®ªà®£à®¿à®šà¯à®šà¯à®®à¯ˆ",
  "admin_live_appointment_monitor": "à®¨à¯‡à®°à®Ÿà®¿ à®¨à®¿à®¯à®®à®© à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯",
  "admin_no_appointments_found": "à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®‡à®²à¯à®²à¯ˆ.",
  "admin_force_complete": "à®•à®Ÿà¯à®Ÿà®¾à®¯à®®à®¾à®• à®®à¯à®Ÿà®¿à®•à¯à®•à®µà¯à®®à¯",
  "read_aloud": "à®šà®¤à¯à®¤à®®à®¾à®• à®µà®¾à®šà®¿",
  "voice_listening": "à®•à¯‡à®Ÿà¯à®•à®¿à®±à®¤à¯...",
  "symptom_voice_not_supported": "à®‡à®¨à¯à®¤ à®‰à®²à®¾à®µà®¿à®¯à®¿à®²à¯ à®•à¯à®°à®²à¯ à®‰à®³à¯à®³à¯€à®Ÿà¯ à®†à®¤à®°à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
  "symptom_enter_text_or_image": "à®…à®±à®¿à®•à¯à®±à®¿ à®‰à®°à¯ˆà®¯à¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯ à®…à®²à¯à®²à®¤à¯ à®ªà®Ÿà®¤à¯à®¤à¯ˆ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯.",
  "symptom_unable_process_image": "à®ªà®Ÿà®¤à¯à®¤à¯ˆ à®†à®ƒà®ªà¯à®²à¯ˆà®©à®¿à®²à¯ à®šà¯†à®¯à®²à®¾à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "symptom_on_device_ai_info": "à®‡à®¨à¯à®¤ à®šà¯†à®¯à®²à®¿à®¯à®¿à®²à¯ à®‡à®¯à®™à¯à®•à¯à®®à¯ On-device AI à®®à¯à®´à¯à®®à¯ˆà®¯à®¾à®• à®†à®ƒà®ªà¯à®²à¯ˆà®©à®¿à®²à¯ à®µà¯‡à®²à¯ˆ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯. à®šà®¿à®±à®¨à¯à®¤ à®¤à¯à®²à¯à®²à®¿à®¯à®¤à¯à®¤à®¿à®±à¯à®•à®¾à®• à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®ªà¯‹à®¤à¯ Online AI à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®®à¯.",
  "symptom_text_placeholder": "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆ à®Žà®´à¯à®¤à¯à®™à¯à®•à®³à¯ (à®‰à®¤à®¾: 2 à®¨à®¾à®Ÿà¯à®•à®³à®¾à®• à®•à®¾à®¯à¯à®šà¯à®šà®²à¯, à®‡à®°à¯à®®à®²à¯, à®¤à¯Šà®£à¯à®Ÿà¯ˆ à®µà®²à®¿)",
  "symptom_speak_button": "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆ à®ªà¯‡à®šà®µà¯à®®à¯",
  "symptom_read_result": "à®®à¯à®Ÿà®¿à®µà¯ˆ à®µà®¾à®šà®¿à®•à¯à®•à®µà¯à®®à¯",
  "symptom_image_label": "à®ªà®Ÿà®®à¯",
  "symptom_analyzing": "à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ à®šà¯†à®¯à¯à®•à®¿à®±à®¤à¯...",
  "symptom_check_offline": "à®…à®±à®¿à®•à¯à®±à®¿à®¯à¯ˆ à®†à®ƒà®ªà¯à®²à¯ˆà®©à®¿à®²à¯ à®šà®°à®¿à®ªà®¾à®°à¯",
  "symptom_result": "à®®à¯à®Ÿà®¿à®µà¯",
  "symptom_engine": "à®‡à®¯à®¨à¯à®¤à®¿à®°à®®à¯",
  "symptom_engine_ai": "AI (OpenAI)",
  "symptom_engine_offline": "On-device Offline AI",
  "symptom_probable_disease": "à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®¨à¯‹à®¯à¯",
  "symptom_natural_remedy": "à®‡à®¯à®±à¯à®•à¯ˆ à®¨à®¿à®µà®¾à®°à®£à®®à¯",
  "symptom_doctor_guidance": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà¯",
  "symptom_confidence": "à®¨à®®à¯à®ªà®•à®¤à¯à®¤à®©à¯à®®à¯ˆ",
  "symptom_serious_detected": "à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®© à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®©: à®‰à®Ÿà®©à¯‡ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_red_flags": "à®…à®ªà®¾à®¯ à®šà¯à®Ÿà¯à®Ÿà¯à®•à®³à¯",
  "symptom_image_hint": "à®ªà®Ÿ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
  "symptom_emergency_warning": "à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®© à®¨à¯†à®žà¯à®šà¯ à®µà®²à®¿, à®šà¯à®µà®¾à®š à®šà®¿à®°à®®à®®à¯, à®•à¯à®´à®ªà¯à®ªà®®à¯ à®…à®²à¯à®²à®¤à¯ à®¨à¯€à®Ÿà®¿à®¤à¯à®¤ à®…à®¤à®¿à®• à®•à®¾à®¯à¯à®šà¯à®šà®²à¯ à®ªà¯‹à®©à¯à®±à®µà¯ˆ à®‰à®Ÿà®©à®Ÿà®¿ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®¤à¯‡à®µà¯ˆà®ªà¯à®ªà®Ÿà¯à®®à¯.",
  "symptom_recent_checks": "à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®šà®°à®¿à®ªà®¾à®°à¯à®ªà¯à®ªà¯à®•à®³à¯",
  "appointment_list_all": "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯ (à®µà®°à®¿à®šà¯ˆ à®ªà®¾à®°à¯à®µà¯ˆ)",
  "appointment_list_patient": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "appointment_list_reason": "à®•à®¾à®°à®£à®®à¯",
  "symptom_rule_viral_fever_disease": "à®µà¯ˆà®°à®¸à¯ à®•à®¾à®¯à¯à®šà¯à®šà®²à¯",
  "symptom_rule_viral_fever_remedy": "à®šà¯‚à®Ÿà®¾à®© à®¤à®¿à®°à®µà®™à¯à®•à®³à¯ˆ à®•à¯à®Ÿà®¿à®•à¯à®•à®µà¯à®®à¯, à®ªà¯‹à®¤à¯à®®à®¾à®© à®“à®¯à¯à®µà¯ à®Žà®Ÿà¯à®•à¯à®•à®µà¯à®®à¯, à®µà¯†à®ªà¯à®ªà®¨à®¿à®²à¯ˆà®¯à¯ˆ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_viral_fever_advice": "à®•à®¾à®¯à¯à®šà¯à®šà®²à¯ 102F-à® à®•à®Ÿà®¨à¯à®¤à®¾à®²à¯ à®…à®²à¯à®²à®¤à¯ 2 à®¨à®¾à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯ à®®à¯‡à®²à¯ à®¨à¯€à®Ÿà®¿à®¤à¯à®¤à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_cold_disease": "à®šà®¾à®¤à®¾à®°à®£ à®šà®³à®¿ / à®®à¯‡à®²à¯ à®šà¯à®µà®¾à®š à®¤à¯Šà®±à¯à®±à¯",
  "symptom_rule_cold_remedy": "à®¨à¯€à®°à®¾à®µà®¿ à®µà®¾à®™à¯à®•à¯à®¤à®²à¯, à®¤à¯‡à®©à¯à®®à¯ à®‡à®žà¯à®šà®¿à®¯à¯à®®à¯ à®•à®²à®¨à¯à®¤ à®šà¯‚à®Ÿà®¾à®© à®¨à¯€à®°à¯, à®®à®±à¯à®±à¯à®®à¯ à®¨à®²à¯à®² à®‰à®Ÿà®²à¯ à®ˆà®°à®ªà¯à®ªà®¤à®®à¯.",
  "symptom_rule_cold_advice": "à®šà¯à®µà®¾à®š à®šà®¿à®°à®®à®®à¯, à®¨à¯†à®žà¯à®šà¯ à®µà®²à®¿, à®…à®²à¯à®²à®¤à¯ à®…à®¤à®¿à®• à®•à®¾à®¯à¯à®šà¯à®šà®²à¯ à®µà®¨à¯à®¤à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®•à®¾à®£à®µà¯à®®à¯.",
  "symptom_rule_headache_disease": "à®‡à®´à¯à®ªà¯à®ªà¯ à®¤à®²à¯ˆà®µà®²à®¿ / à®®à¯ˆà®•à¯à®°à¯‡à®©à¯",
  "symptom_rule_headache_remedy": "à®‡à®°à¯à®£à¯à®Ÿ à®…à®®à¯ˆà®¤à®¿à®¯à®¾à®© à®…à®±à¯ˆà®¯à®¿à®²à¯ à®“à®¯à¯à®µà¯ à®Žà®Ÿà¯à®•à¯à®•à®µà¯à®®à¯, à®¤à®£à¯à®£à¯€à®°à¯ à®•à¯à®Ÿà®¿à®•à¯à®•à®µà¯à®®à¯, à®¤à¯†à®°à®¿à®¨à¯à®¤ à®¤à¯‚à®£à¯à®Ÿà¯à®¤à®²à¯à®•à®³à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_headache_advice": "à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®© à®¤à®²à¯ˆà®µà®²à®¿ à®…à®²à¯à®²à®¤à¯ à®ªà®¾à®°à¯à®µà¯ˆ à®®à®¾à®±à¯à®±à®®à¯ à®‡à®°à¯à®¨à¯à®¤à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_gastro_disease": "à®•à¯à®Ÿà®²à®´à®±à¯à®šà®¿ / à®‰à®£à®µà¯ à®µà®¿à®·à®¤à¯à®¤à®©à¯à®®à¯ˆ",
  "symptom_rule_gastro_remedy": "ORS, à®®à¯†à®©à¯à®®à¯ˆà®¯à®¾à®© à®‰à®£à®µà¯, à®¤à¯†à®©à¯à®©à¯ˆ à®¨à¯€à®°à¯, à®®à®±à¯à®±à¯à®®à¯ à®Žà®£à¯à®£à¯†à®¯à¯ à®…à®²à¯à®²à®¤à¯ à®•à®¾à®° à®‰à®£à®µà¯à®•à®³à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_gastro_advice": "à®®à®²à®¤à¯à®¤à®¿à®²à¯ à®‡à®°à®¤à¯à®¤à®®à¯, à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿à®¯à®¾à®© à®µà®¾à®¨à¯à®¤à®¿, à®…à®²à¯à®²à®¤à¯ à®¨à¯€à®°à®¿à®´à®ªà¯à®ªà¯ à®‡à®°à¯à®¨à¯à®¤à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_skin_disease": "à®¤à¯‹à®²à¯ à®…à®²à®°à¯à®œà®¿ / à®Ÿà¯†à®°à¯à®®à®Ÿà®¿à®Ÿà®¿à®¸à¯",
  "symptom_rule_skin_remedy": "à®¤à¯‹à®²à¯ˆ à®•à¯à®³à®¿à®°à¯à®šà¯à®šà®¿à®¯à®¾à®•à®µà¯à®®à¯ à®‰à®²à®°à¯à®šà¯à®šà®¿à®¯à®¾à®•à®µà¯à®®à¯ à®µà¯ˆà®¤à¯à®¤à¯à®•à¯ à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯, à®®à¯†à®©à¯à®®à¯ˆà®¯à®¾à®© moisturizer à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯, à®Žà®°à®¿à®šà¯à®šà®²à¯ à®¤à®°à¯à®®à¯ à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_skin_advice": "à®ªà®°à¯ à®µà®¿à®°à¯ˆà®µà®¾à®• à®ªà®°à®µà®¿à®©à®¾à®²à¯, à®šà¯€à®´à¯ à®µà®¨à¯à®¤à®¾à®²à¯, à®…à®²à¯à®²à®¤à¯ à®µà¯€à®•à¯à®•à®®à¯ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¾à®²à¯ à®¤à¯‹à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_cardio_disease": "à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®‡à®¤à®¯à®®à¯-à®šà¯à®µà®¾à®š à®…à®µà®šà®° à®¨à®¿à®²à¯ˆ",
  "symptom_rule_cardio_remedy": "à®‡à®¨à¯à®¤ à®¨à®¿à®²à¯ˆà®•à¯à®•à¯ à®µà¯€à®Ÿà¯à®Ÿà¯à®šà¯ à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
  "symptom_rule_cardio_advice": "à®‰à®Ÿà®©à®Ÿà®¿ à®…à®µà®šà®° à®®à®°à¯à®¤à¯à®¤à¯à®µ à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®¤à¯‡à®µà¯ˆ.",
  "symptom_generic_disease": "à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà¯à®Ÿà®¤à®²à¯à®²à®¾à®¤ à®…à®±à®¿à®•à¯à®±à®¿ à®®à¯à®±à¯ˆ",
  "symptom_generic_remedy": "à®¤à®£à¯à®£à¯€à®°à¯ à®•à¯à®Ÿà®¿à®•à¯à®•à®µà¯à®®à¯, à®‡à®²à®•à¯ à®šà®¤à¯à®¤à¯à®£à®µà¯ à®‰à®£à¯à®£à®µà¯à®®à¯, à®ªà¯‹à®¤à¯à®®à®¾à®© à®“à®¯à¯à®µà¯ à®Žà®Ÿà¯à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_generic_advice": "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ 24-48 à®®à®£à®¿ à®¨à¯‡à®°à®¤à¯à®¤à®¿à®±à¯à®•à¯ à®®à¯‡à®²à¯ à®¨à¯€à®Ÿà®¿à®¤à¯à®¤à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_serious_pattern_advice": "à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®© à®…à®±à®¿à®•à¯à®±à®¿ à®®à¯à®±à¯ˆ à®•à®£à¯à®Ÿà®±à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯. à®‰à®Ÿà®©à¯‡ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯.",
  "symptom_potential_emergency_pattern": "à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®…à®µà®šà®° à®¨à®¿à®²à¯ˆ à®®à¯à®±à¯ˆ",
  "symptom_no_image_uploaded": "à®ªà®Ÿà®®à¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
  "symptom_risk_reason_low": "à®¤à¯€à®°à¯à®®à®¾à®© à®®à®°à®¤à¯à®¤à®¿à®²à¯ à®Žà®¨à¯à®¤ à®‰à®¯à®°à¯à®µà®¾à®© à®†à®ªà®¤à¯à®¤à¯ à®•à®¿à®³à¯ˆà®¯à¯à®®à¯ à®¤à¯à®µà®™à¯à®•à®µà®¿à®²à¯à®²à¯ˆ.",
  "symptom_risk_reason_medium": "à®¨à®Ÿà¯à®¨à®¿à®²à¯ˆ à®†à®ªà®¤à¯à®¤à¯ à®…à®±à®¿à®•à¯à®±à®¿ à®®à¯à®±à¯ˆ à®•à®£à¯à®Ÿà®±à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "symptom_risk_reason_high": "à®…à®µà®šà®° à®…à®±à®¿à®•à¯à®±à®¿ à®®à¯à®±à¯ˆ à®•à®£à¯à®Ÿà®±à®¿à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯ (à®‡à®¤à®¯-à®šà¯à®µà®¾à®šà®®à¯ à®…à®²à¯à®²à®¤à¯ à®¨à®°à®®à¯à®ªà¯ à®šà®¿à®µà®ªà¯à®ªà¯ à®•à¯Šà®Ÿà®¿).",
  "symptom_risk_value_low": "à®•à¯à®±à¯ˆà®¨à¯à®¤à®¤à¯",
  "symptom_risk_value_medium": "à®¨à®Ÿà¯à®¤à¯à®¤à®°",
  "symptom_risk_value_high": "à®‰à®¯à®°à¯à®¨à¯à®¤à®¤à¯",
  "symptom_image_hint_skin_name": "à®ªà®Ÿà®¤à¯à®¤à®¿à®©à¯ à®ªà¯†à®¯à®°à¯ à®¤à¯‹à®²à¯ à®ªà®¿à®°à®šà¯à®šà®©à¯ˆà®¯à¯ˆ à®šà¯à®Ÿà¯à®Ÿà¯à®•à®¿à®±à®¤à¯. à®ªà®°à¯ à®…à®²à¯à®²à®¤à¯ à®…à®²à®°à¯à®œà®¿ à®ªà¯‹à®©à¯à®± à®…à®®à¯ˆà®ªà¯à®ªà¯ à®‡à®°à¯à®•à¯à®•à®²à®¾à®®à¯.",
  "symptom_image_hint_red_tone": "à®ªà®Ÿà®¤à¯à®¤à®¿à®²à¯ à®…à®¤à®¿à®• à®šà®¿à®µà®ªà¯à®ªà¯ à®¨à®¿à®± à®ªà®•à¯à®¤à®¿ à®‰à®³à¯à®³à®¤à¯. à®Žà®°à®¿à®šà¯à®šà®²à¯, à®ªà®°à¯, à®…à®²à¯à®²à®¤à¯ à®…à®´à®±à¯à®šà®¿à®¯à¯à®Ÿà®©à¯ à®ªà¯Šà®°à¯à®¨à¯à®¤à®²à®¾à®®à¯.",
  "symptom_image_hint_dark": "à®ªà®Ÿà®®à¯ à®®à®¿à®•à®µà¯à®®à¯ à®‡à®°à¯à®£à¯à®Ÿà¯à®³à¯à®³à®¤à¯; à®µà®¿à®µà®°à®™à¯à®•à®³à¯ à®•à¯à®±à¯ˆà®µà¯. à®¨à®²à¯à®² à®µà¯†à®³à®¿à®šà¯à®šà®¤à¯à®¤à®¿à®²à¯ à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®ªà®Ÿà®®à¯ à®Žà®Ÿà¯à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_image_hint_none": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯ à®ªà®Ÿà®šà¯ à®šà®°à®¿à®ªà®¾à®°à¯à®ªà¯à®ªà®¿à®²à¯ à®¤à¯†à®³à®¿à®µà®¾à®© à®•à®¾à®Ÿà¯à®šà®¿ à®…à®®à¯ˆà®ªà¯à®ªà¯ à®¤à¯†à®°à®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ.",
  "symptom_voice_issue_prefix": "à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®ªà®¿à®°à®šà¯à®šà®©à¯ˆ:",
  "symptom_voice_remedy_prefix": "à®‡à®¯à®±à¯à®•à¯ˆ à®¨à®¿à®µà®¾à®°à®£à®®à¯:",
  "symptom_voice_advice_prefix": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®…à®±à®¿à®µà¯à®°à¯ˆ:",
  "symptom_not_clear": "à®¤à¯†à®³à®¿à®µà®¿à®²à¯à®²à¯ˆ",
  "symptom_none": "à®‡à®²à¯à®²à¯ˆ",
  "symptom_consult_if_needed": "à®¤à¯‡à®µà¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿà®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®…à®£à¯à®•à®µà¯à®®à¯",
  "symptom_age_placeholder": "à®µà®¯à®¤à¯ (à®µà®¿à®°à¯à®®à¯à®ªà®¿à®¯, à®†à®ªà®¤à¯à®¤à¯ à®µà®´à®¿à®•à®¾à®Ÿà¯à®Ÿà¯à®¤à®²à¯ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®®à¯)",
  "symptom_risk_level": "à®†à®ªà®¤à¯à®¤à¯ à®¨à®¿à®²à¯ˆ",
  "symptom_safety_note": "à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯",
  "symptom_confidence_low": "à®•à¯à®±à¯ˆà®¨à¯à®¤",
  "symptom_confidence_medium": "à®¨à®Ÿà¯à®¨à®¿à®²à¯ˆ",
  "symptom_confidence_high": "à®‰à®¯à®°à¯à®¨à¯à®¤",
  "symptom_rule_viral_fever_remedy": "à®¨à®©à¯à®±à®¾à®• à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯, à®“à®¯à¯à®µà¯ à®Žà®Ÿà¯à®•à¯à®•à®µà¯à®®à¯, à®®à®±à¯à®±à¯à®®à¯ à®µà¯†à®ªà¯à®ªà®¨à®¿à®²à¯ˆà®¯à¯ˆ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_viral_fever_advice": "à®•à®¾à®²à¯à®¨à¯à®¤à®¾à®• à®µà¯†à®ªà¯à®ªà®¨à®¿à®²à¯ˆ 2 à®¨à®¾à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯ à®®à¯‡à®²à¯ à®¨à¯€à®Ÿà®¿à®¤à¯à®¤à®¾à®²à¯ à®…à®²à¯à®²à®¤à¯ à®ªà¯à®¤à®¿à®¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ à®¤à¯‹à®©à¯à®±à®¿à®©à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
  "symptom_rule_cold_cough_remedy": "à®šà¯‚à®Ÿà®¾à®© à®¤à®¿à®°à®µà®™à¯à®•à®³à¯, à®¨à¯€à®°à®¾à®µà®¿ à®‡à®©à®²à¥‡à¤¶ÐµÐ½Ð½Ñ, à®®à®±à¯à®±à¯à®®à¯ à®ªà¯‹à®¤à¯à®®à®¾à®© à®“à®¯à¯à®µà¯ à®‰à®¤à®µ à®®à¯à®Ÿà®¿à®¯à¯à®®à¯.",
  "symptom_rule_cold_cough_advice": "à®šà¯à®µà®¾à®š à®šà®¿à®°à®®à®®à¯, à®…à®¤à®¿à®• à®•à®¾à®¯à¯à®šà¯à®šà®²à¯, à®…à®²à¯à®²à®¤à¯ à®¤à¯Šà®Ÿà®°à¯à®šà¯à®šà®¿à®¯à®¾à®© à®‡à®°à¯à®®à®²à¯ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
  "symptom_rule_migraine_headache_remedy": "à®…à®®à¯ˆà®¤à®¿à®¯à®¾à®© à®‡à®°à¯à®£à¯à®Ÿ à®…à®±à¯ˆà®¯à®¿à®²à¯ à®“à®¯à¯à®µà¯ à®Žà®Ÿà¯à®•à¯à®•à®µà¯à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯ à®¨à®¿à®²à®µà¯à®¤à®²à¯.",
  "symptom_rule_migraine_headache_advice": "à®¤à®²à¯ˆà®µà®²à®¿ à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®•, à®…à®Ÿà®¿à®•à¯à®•à®Ÿà®¿, à®…à®²à¯à®²à®¤à¯ à®¨à®°à®®à¯à®ªà¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯à®Ÿà®©à¯ à®‡à®°à¯à®¨à¯à®¤à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
  "symptom_rule_gastro_issue_remedy": "à®µà®¾à®¯à¯à®µà®´à®¿ à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯, à®ªà¯‹à®¤à®¿à®¯ à®‰à®£à®µà¯, à®®à®±à¯à®±à¯à®®à¯ à®Žà®£à¯à®£à¯†à®¯à¯ à®‰à®£à®µà¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.",
  "symptom_rule_gastro_issue_advice": "à®µà®¾à®¨à¯à®¤à®¿ à®¨à¯€à®Ÿà®¿à®¤à¯à®¤à®¿à®°à¯à®¨à¯à®¤à®¾à®²à¯, à®¨à¯€à®°à®¿à®´à®ªà¯à®ªà¯ à®®à¯‹à®šà®®à®¾à®•, à®…à®²à¯à®²à®¤à¯ à®‡à®°à®¤à¯à®¤à®®à¯ à®¤à¯‹à®©à¯à®±à®¿à®©à®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
  "symptom_rule_skin_allergy_remedy": "à®¤à¯‚à®£à¯à®Ÿà¯à®ªà¯Šà®°à¯à®³à¯à®•à®³à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯, à®¤à¯‹à®²à¯ˆ à®šà¯à®¤à¯à®¤à®®à®¾à®• à®µà¯ˆà®¤à¯à®¤à¯à®•à¯ à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯, à®®à®±à¯à®±à¯à®®à¯ à®šà®¾à®¨à¯à®¤à®®à®¾à®© à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯.",
  "symptom_rule_skin_allergy_advice": "à®ªà®°à¯ à®µà®¿à®°à¯ˆà®µà®¾à®• à®ªà®°à®µà®¿à®©à®¾à®²à¯, à®ªà¯à®³à¯à®³à®¿à®µà¯€à®Ÿà¯, à®…à®²à¯à®²à®¤à¯ à®µà¯€à®•à¯à®•à®®à¯ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¾à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
  "symptom_rule_cardio_respiratory_remedy": "à®‰à®±à¯à®šà®¾à®•à®®à¯ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à¯†à®žà¯à®šà¯ à®…à®²à¯à®²à®¤à¯ à®šà¯à®µà®¾à®š à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯à®•à¯à®•à¯ à®‰à®Ÿà®©à®Ÿà®¿ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®•à®µà®©à®¤à¯à®¤à¯ˆ à®¨à®¾à®Ÿà®µà¯à®®à¯.",
  "symptom_rule_cardio_respiratory_advice": "à®¨à¯†à®žà¯à®šà¯ à®µà®²à®¿ à®…à®²à¯à®²à®¤à¯ à®šà¯à®µà®¾à®š à®šà®¿à®°à®®à®¤à¯à®¤à®¿à®±à¯à®•à¯ à®‰à®Ÿà®©à®Ÿà®¿ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®…à®²à¯à®²à®¤à¯ à®…à®µà®šà®° à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯.",
  "specialty_general_medicine": "à®ªà¯Šà®¤à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à¯",
  "specialty_dermatology": "à®¤à¯‹à®²à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à¯",
  "specialty_pediatrics": "à®•à¯à®´à®¨à¯à®¤à¯ˆ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à¯",
  "doctor_kumar": "à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®•à¯à®®à®¾à®°à¯",
  "doctor_anjali": "à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®…à®žà¯à®šà®²à®¿",
  "doctor_arun": "à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®…à®°à¥à®£à¯",
  "home_analytics_title": "à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯",
  "home_analytics_desc": "à®¨à®¿à®¯à®®à®© à®ªà¯‹à®•à¯à®•à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®±à®¿à®•à¯à®±à®¿ à®¤à®•à®µà®²à¯à®•à®³à¯ˆ à®ªà®¾à®°à¯à®•à¯à®•à®µà¯à®®à¯.",
  "admin_analytics_button": "à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯ à®ªà®²à®•à¯ˆ",
  "doctor_availability_title": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®•à®¿à®Ÿà¯ˆà®ªà¯à®ªà¯à®¨à®¿à®²à¯ˆ",
  "doctor_availability_live": "à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®²à¯‹à®šà®©à¯ˆ à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¾à®•à®•à¯ à®•à¯Šà®£à¯à®Ÿ à®¨à¯‡à®°à®Ÿà®¿ à®¨à®¿à®²à¯ˆ.",
  "doctor_availability_offline": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯ à®¨à®¿à®²à¯ˆ: à®•à®Ÿà¯ˆà®šà®¿à®¯à®¾à®• à®’à®¤à¯à®¤à®¿à®šà¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ / à®‰à®³à¯à®³à¯‚à®°à¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ à®•à®¾à®Ÿà¯à®Ÿà®ªà¯à®ªà®Ÿà¯à®•à®¿à®©à¯à®±à®©.",
  "doctor_availability_status_available": "à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®±à®¾à®°à¯",
  "doctor_availability_status_in_consultation": "à®†à®²à¯‹à®šà®©à¯ˆà®¯à®¿à®²à¯ à®‰à®³à¯à®³à®¾à®°à¯",
  "doctor_availability_specialty": "à®šà®¿à®±à®ªà¯à®ªà¯",
  "doctor_availability_total_consults": "à®®à¯Šà®¤à¯à®¤ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯",
  "doctor_availability_active_consults": "à®¨à®Ÿà¯ˆà®ªà¯†à®±à¯à®®à¯ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯",
  "doctor_availability_completed": "à®®à¯à®Ÿà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
  "doctor_availability_upcoming_queue": "à®µà®°à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®µà®°à®¿à®šà¯ˆ",
  "doctor_availability_next_slot": "à®…à®Ÿà¯à®¤à¯à®¤ à®¨à¯‡à®°à®®à¯",
  "doctor_availability_no_upcoming_slot": "à®µà®°à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®¨à¯‡à®°à®®à¯ à®‡à®²à¯à®²à¯ˆ",
  "doctor_analytics_title": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯",
  "condition_general_non_specific": "à®ªà¯†à®¾à®¤à¯à®µà®¾à®© à®…à®©à¯ˆà®¤à¯à®¤à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯à®®à¯",
  "condition_viral_fever": "à®µà¯ˆà®°à®¸à¯ à®•à®¾à®¯à¯à®šà¯à®šà®²à¯",
  "condition_cold_cough": "à®šà®³à®¿ à®®à®±à¯à®±à¯à®®à¯ à®‡à®°à¯à®®à®²à¯",
  "condition_migraine_headache": "à®®à¯ˆà®•à¯à®°à¯‡à®©à¯ / à®¤à®²à¯ˆà®µà®²à®¿",
  "condition_gastro_issue": "à®•à¯à®Ÿà®²à®¿à®¯à®²à¯ à®ªà®¿à®°à®šà¯à®šà®©à¯ˆ",
  "condition_skin_allergy": "à®¤à¯‹à®²à¯ à®…à®²à®°à¯à®œà®¿",
  "condition_cardio_respiratory": "à®‡à®¤à®¯à®®à¯-à®®à¯‚à®šà¯à®šà¯ à®…à®ªà®¾à®¯à®®à¯",
  "status_mode": "à®®à¯à®±à¯ˆ",
  "doctor_analytics_subtitle": "à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®²à¯‹à®šà®©à¯ˆ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®Ÿà®¿à®©à¯ à®šà¯à®°à¯à®•à¯à®•à®®à¯.",
  "doctor_analytics_total_appointments": "à®®à¯Šà®¤à¯à®¤ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "doctor_analytics_pending": "à®¨à®¿à®²à¯à®µà¯ˆà®¯à®¿à®²à¯",
  "doctor_analytics_completed": "à®®à¯à®Ÿà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
  "doctor_analytics_video_consults": "à®µà¯€à®Ÿà®¿à®¯à¯‹ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯",
  "doctor_analytics_text_consults": "à®‰à®°à¯ˆ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯",
  "doctor_analytics_last7days": "à®•à®Ÿà¯ˆà®šà®¿ 7 à®¨à®¾à®Ÿà¯à®•à®³à®¿à®©à¯ à®¨à®¿à®¯à®®à®© à®ªà¯‹à®•à¯à®•à¯",
  "doctor_analytics_top_symptoms": "à®…à®¤à®¿à®•à®®à¯ à®¤à¯†à®°à®¿à®µà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯",
  "doctor_analytics_no_symptom_data": "à®…à®±à®¿à®•à¯à®±à®¿ à®¤à®°à®µà¯ à®‡à®²à¯à®²à¯ˆ.",
  "admin_analytics_title": "à®¨à®¿à®°à¯à®µà®¾à®• à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯",
  "admin_analytics_subtitle": "à®¤à®³ à®…à®³à®µà®¿à®²à®¾à®© à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯.",
  "admin_analytics_total_patients": "à®®à¯Šà®¤à¯à®¤ à®¨à¯‹à®¯à®¾à®³à®¿à®•à®³à¯",
  "admin_analytics_total_appointments": "à®®à¯Šà®¤à¯à®¤ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "admin_analytics_today_appointments": "à®‡à®©à¯à®±à¯ˆà®¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "admin_analytics_pending_cases": "à®¨à®¿à®²à¯à®µà¯ˆ à®µà®´à®•à¯à®•à¯à®•à®³à¯",
  "admin_analytics_completed_cases": "à®®à¯à®Ÿà®¿à®¨à¯à®¤ à®µà®´à®•à¯à®•à¯à®•à®³à¯",
  "admin_analytics_cancelled_cases": "à®°à®¤à¯à®¤à¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®µà®´à®•à¯à®•à¯à®•à®³à¯",
  "admin_analytics_total_doctors": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯à®•à®³à¯",
  "admin_analytics_total_pharmacies": "à®®à®°à¯à®¨à¯à®¤à®•à®™à¯à®•à®³à¯",
  "admin_analytics_doctor_workload": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®ªà®£à®¿à®šà¯à®šà¯à®®à¯ˆ",
  "admin_analytics_table_doctor": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯",
  "admin_analytics_table_appointments": "à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "admin_analytics_table_completed": "à®®à¯à®Ÿà®¿à®¨à¯à®¤à®µà¯ˆ",
  "admin_analytics_table_completion_rate": "à®®à¯à®Ÿà®¿à®ªà¯à®ªà¯ %",
  "admin_analytics_pharmacy_stock_summary": "à®®à®°à¯à®¨à¯à®¤à®• à®•à¯ˆà®¯à®¿à®°à¯à®ªà¯à®ªà¯ à®šà¯à®°à¯à®•à¯à®•à®®à¯",
  "admin_analytics_no_pharmacy_stock_data": "à®®à®°à¯à®¨à¯à®¤à®• à®•à¯ˆà®¯à®¿à®°à¯à®ªà¯à®ªà¯ à®¤à®°à®µà¯ à®‡à®²à¯à®²à¯ˆ.",
  "admin_analytics_table_pharmacy": "à®®à®°à¯à®¨à¯à®¤à®•à®®à¯",
  "admin_analytics_table_medicines_listed": "à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿ à®®à®°à¯à®¨à¯à®¤à¯à®•à®³à¯",
  "admin_analytics_table_total_units": "à®®à¯Šà®¤à¯à®¤ à®…à®²à®•à¯à®•à®³à¯",
  "appointments_not_consulted": "à®‡à®©à¯à®©à¯à®®à¯ à®†à®²à¯‹à®šà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà®¾à®¤à®µà¯ˆ",
  "appointments_consulted": "à®†à®²à¯‹à®šà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®µà¯ˆ",
  "appointments_no_pending_consultations": "à®¨à®¿à®²à¯à®µà¯ˆà®¯à®¿à®²à¯ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯ à®‡à®²à¯à®²à¯ˆ.",
  "appointments_no_completed_consultations": "à®®à¯à®Ÿà®¿à®¨à¯à®¤ à®†à®²à¯‹à®šà®©à¯ˆà®•à®³à¯ à®‡à®²à¯à®²à¯ˆ.",
  "common_action": "à®šà¯†à®¯à®²à¯",
  "common_edit": "à®¤à®¿à®°à¯à®¤à¯à®¤à¯",
  "pharmacy_click_medicine_to_edit": "à®…à®²à®•à¯à®•à®³à¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®• à®®à®°à¯à®¨à¯à®¤à¯à®ªà¯ à®ªà¯†à®¯à®°à¯ à®…à®²à¯à®²à®¤à¯ 'à®¤à®¿à®°à¯à®¤à¯à®¤à¯' à®Žà®©à¯à®ªà®¤à¯ˆ à®…à®´à¯à®¤à¯à®¤à®µà¯à®®à¯.",
  "add_patient_subtitle": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®µà®¿à®µà®°à®™à¯à®•à®³à¯ˆ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¤à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯.",
  "add_patient_required_fields": "à®ªà¯†à®¯à®°à¯, à®µà®¯à®¤à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à®¿à®²à¯ˆ à®•à®Ÿà¯à®Ÿà®¾à®¯à®®à¯.",
  "add_patient_permission_denied": "Supabase RLS à®…à®©à¯à®®à®¤à®¿ à®®à®±à¯à®¤à¯à®¤à®¤à¯. patients à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆ à®•à¯Šà®³à¯à®•à¯ˆà®•à®³à¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯.",
  "add_patient_table_missing": "Supabase à®‡à®²à¯ patients à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®µà®¿à®²à¯à®²à¯ˆ.",
  "add_patient_unable_prefix": "à®¨à¯‹à®¯à®¾à®³à®¿à®¯à¯ˆ à®šà¯‡à®°à¯à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ:",
  "additional_data_label": "à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®¤à®•à®µà®²à¯",
  "doctor_patients_title": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯",
  "doctor_patients_subtitle": "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à¯à®®à¯ à®¨à¯‹à®¯à®¾à®³à®°à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯.",
  "doctor_patients_filter_placeholder": "à®ªà¯†à®¯à®°à¯, à®µà®¯à®¤à¯, à®¨à®¿à®²à¯ˆ, à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®¤à®•à®µà®²à¯ à®®à¯‚à®²à®®à¯ à®µà®Ÿà®¿à®•à®Ÿà¯à®Ÿà¯",
  "doctor_patients_no_records": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ.",
  "doctor_patients_internet_required": "à®‡à®£à¯ˆà®¯ à®‡à®£à¯ˆà®ªà¯à®ªà¯à®®à¯ Supabase-à®®à¯à®®à¯ à®¤à¯‡à®µà¯ˆ.",
  "doctor_patients_name_required": "à®ªà¯†à®¯à®°à¯ à®•à®Ÿà¯à®Ÿà®¾à®¯à®®à¯.",
  "doctor_patients_updated": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "doctor_patients_update_failed_prefix": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ:",
  "doctor_patients_delete_confirm": "à®‡à®¨à¯à®¤ à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯ˆ à®¨à¯€à®•à¯à®•à®µà®¾? à®‡à®¤à¯ˆ à®®à¯€à®Ÿà¯à®Ÿà¯†à®Ÿà¯à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®¾à®¤à¯.",
  "doctor_patients_deleted": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯ à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "doctor_patients_delete_failed_prefix": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®ªà®¤à®¿à®µà¯ˆ à®¨à¯€à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ:",
  "doctor_patients_delete": "à®¨à¯€à®•à¯à®•à¯",
  "profile_title": "à®Žà®©à¯ à®šà¯à®¯à®µà®¿à®µà®°à®®à¯",
  "profile_online_text": "à®†à®©à¯à®²à¯ˆà®©à¯: à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®©à¯à®±à®©.",
  "profile_offline_text": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯: à®‰à®³à¯à®³à¯‚à®°à¯ à®šà¯à®¯à®µà®¿à®µà®°à®¤à¯à®¤à¯ˆ à®ªà®¾à®°à¯à®•à¯à®•à®µà¯à®®à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯ à®®à¯à®Ÿà®¿à®¯à¯à®®à¯.",
  "profile_patient_id": "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®…à®Ÿà¯ˆà®¯à®¾à®³ à®Žà®£à¯",
  "profile_role": "à®ªà®™à¯à®•à¯",
  "profile_online": "à®†à®©à¯à®²à¯ˆà®©à¯",
  "profile_offline": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯",
  "profile_mobile_not_found": "à®¨à¯‹à®¯à®¾à®³à®¿à®¯à®¿à®©à¯ à®®à¯Šà®ªà¯ˆà®²à¯ à®Žà®£à¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®µà®¿à®²à¯à®²à¯ˆ.",
  "profile_name_age_required": "à®ªà¯†à®¯à®°à¯à®®à¯ à®µà®¯à®¤à¯à®®à¯ à®•à®Ÿà¯à®Ÿà®¾à®¯à®®à¯.",
  "profile_updated_success": "à®šà¯à®¯à®µà®¿à®µà®°à®®à¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
  "profile_update_failed": "à®¤à®±à¯à®ªà¯‹à®¤à¯ à®šà¯à®¯à®µà®¿à®µà®°à®¤à¯à®¤à¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®• à®®à¯à®Ÿà®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ. à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®®à¯à®¯à®±à¯à®šà®¿à®•à¯à®•à®µà¯à®®à¯.",
  "profile_updating": "à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯...",
  "profile_update_button": "à®šà¯à®¯à®µà®¿à®µà®°à®¤à¯à®¤à¯ˆ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯",
  "profile_care_summary": "à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ à®šà¯à®°à¯à®•à¯à®•à®®à¯",
  "profile_total": "à®®à¯Šà®¤à¯à®¤à®®à¯",
  "profile_upcoming": "à®µà®°à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯",
  "profile_active": "à®¨à®Ÿà®ªà¯à®ªà¯",
  "profile_completed": "à®®à¯à®Ÿà®¿à®¨à¯à®¤à®µà¯ˆ",
  "profile_recent_appointments": "à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯",
  "profile_no_appointments": "à®‡à®©à¯à®©à¯à®®à¯ à®¨à®¿à®¯à®®à®©à®™à¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ.",
  "pharmacy_apollo_name": "à®…à®ªà¯à®ªà¯‹à®²à¯‹ à®®à®°à¯à®¨à¯à®¤à®•à®®à¯",
  "pharmacy_pharmeasy_name": "à®ªà®¾à®°à¯à®®à¯à®‡à®šà®¿ à®®à®°à¯à®¨à¯à®¤à®•à®®à¯",
  "city_chennai": "à®šà¯†à®©à¯à®©à¯ˆ",
  "city_bangalore": "à®ªà¯†à®™à¯à®•à®³à¯‚à®°à¯",
  "patient_home_hint": "à®’à®°à¯ à®ªà¯†à®°à®¿à®¯ à®ªà¯Šà®¤à¯à®¤à®¾à®©à¯ˆà®¤à¯ à®¤à®Ÿà¯à®Ÿà¯à®™à¯à®•à®³à¯. à®•à¯à®°à®²à¯ à®•à®Ÿà¯à®Ÿà®³à¯ˆà®•à¯à®•à¯ Speak à®ªà¯Šà®¤à¯à®¤à®¾à®©à¯ˆà®ªà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®™à¯à®•à®³à¯.",
  "chat_offline_message": "à®†à®ƒà®ªà¯à®²à¯ˆà®©à¯ à®®à¯à®±à¯ˆ: à®šà¯†à®¯à¯à®¤à®¿à®•à®³à¯ à®‰à®³à¯à®³à¯‚à®°à®¿à®²à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®©à¯à®±à®© à®®à®±à¯à®±à¯à®®à¯ à®•à®¿à®³à®µà¯à®Ÿà¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®µà®°à¯ˆ à®’à®¤à¯à®¤à®¿à®šà¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿ à®®à®¾à®Ÿà¯à®Ÿà®¾à®¤à¯.",
  "chat_speak_message": "à®šà¯†à®¯à¯à®¤à®¿ à®ªà¯‡à®šà®µà¯à®®à¯",
  "appointments_status_booked": "à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®µà¯ˆ",
  "appointments_status_in_consultation": "à®†à®²à¯‹à®šà®©à¯ˆà®¯à®¿à®²à¯",
  "appointments_status_completed": "à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à¯",
  "admin_doctor_workload_item": "{{name}} | à®®à¯Šà®¤à¯à®¤à®®à¯: {{total}} | à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®Ÿà®¿à®²à¯: {{active}}"
}
```

---

## File: `src\services\translationService.js`
```js
const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-4o-mini";

const LANGUAGE_NAMES = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  ml: "Malayalam"
};

const translationCache = new Map();
const REQUEST_TIMEOUT_MS = 6000;

function getOpenAiKey() {
  return process.env.REACT_APP_OPENAI_API_KEY || "";
}

function getTranslateProxyUrl() {
  return process.env.REACT_APP_TRANSLATE_PROXY_URL || "";
}

function getLibreTranslateUrl() {
  return (
    process.env.REACT_APP_LIBRETRANSLATE_URL ||
    process.env.LIBRETRANSLATE_URL ||
    "https://libretranslate.de/translate"
  );
}

function getLibreTranslateKey() {
  return (
    process.env.REACT_APP_LIBRETRANSLATE_API_KEY ||
    process.env.LIBRETRANSLATE_API_KEY ||
    ""
  );
}

function normalizeLang(lang) {
  const value = String(lang || "en").toLowerCase();
  return LANGUAGE_NAMES[value] ? value : value.split("-")[0];
}

function detectSourceLang(text) {
  const raw = String(text || "");
  if (/[\u0B80-\u0BFF]/.test(raw)) return "ta";
  if (/[\u0D00-\u0D7F]/.test(raw)) return "ml";
  if (/[\u0900-\u097F]/.test(raw)) return "hi";
  return "en";
}

function cacheKey(text, targetLanguage) {
  return `${normalizeLang(targetLanguage)}::${String(text || "").trim()}`;
}

function getLibreTranslateCandidates() {
  const primary = getLibreTranslateUrl();
  const fallbacks = [
    "https://libretranslate.de/translate",
    "https://translate.astian.org/translate"
  ];

  return [primary, ...fallbacks].filter(Boolean);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function translateWithProxy(text, targetLanguage, sourceLanguage) {
  const url = getTranslateProxyUrl();
  if (!url) throw new Error("translate-proxy-missing");

  const body = {
    q: text,
    source: sourceLanguage || "auto",
    target: normalizeLang(targetLanguage),
    format: "text"
  };

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`translate-proxy-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.translatedText || data?.text || "").trim();
}

async function translateWithLibreTranslate(text, targetLanguage, sourceLanguage, url) {
  if (!url) throw new Error("libretranslate-url-missing");

  const body = {
    q: text,
    source: sourceLanguage || "auto",
    target: normalizeLang(targetLanguage),
    format: "text"
  };

  const apiKey = getLibreTranslateKey();
  if (apiKey) body.api_key = apiKey;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`libretranslate-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.translatedText || "").trim();
}

async function translateWithOpenAi(text, targetLanguage) {
  const apiKey = getOpenAiKey();
  if (!apiKey) throw new Error("openai-key-missing");

  const languageName =
    LANGUAGE_NAMES[normalizeLang(targetLanguage)] || "English";

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            `Translate the user's message into ${languageName}. Return only the translated text. Keep names, codes, numbers, and medical meaning unchanged.`
        },
        {
          role: "user",
          content: [{ type: "input_text", text }]
        }
      ],
      max_output_tokens: 300
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`openai-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.output_text || "").trim();
}

async function translateWithGoogle(text, targetLanguage) {
  const target = normalizeLang(targetLanguage);
  const source = detectSourceLang(text);
  const query = encodeURIComponent(text);
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${query}`;

  const response = await fetchWithTimeout(url, { method: "GET" });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`google-translate-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.[0]) ? data[0] : [];
  const translated = parts.map((p) => p?.[0]).filter(Boolean).join("");
  return String(translated || "").trim();
}

async function translateWithMyMemory(text, targetLanguage) {
  const source = detectSourceLang(text);
  const target = normalizeLang(targetLanguage);
  if (source === target) return String(text || "").trim();
  const query = encodeURIComponent(text);
  const response = await fetchWithTimeout(
    `https://api.mymemory.translated.net/get?q=${query}&langpair=${source}|${target}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`mymemory-error:${response.status}:${errorText}`);
  }

  const data = await response.json();
  return String(data?.responseData?.translatedText || "").trim();
}

export async function translateChatTextWithMeta(text, targetLanguage) {
  const rawText = String(text || "").trim();
  const normalizedTarget = normalizeLang(targetLanguage);
  const source = detectSourceLang(rawText);

  if (!rawText) return { text: "", provider: "none" };
  if (!navigator.onLine) return { text: rawText, provider: "offline" };
  if (source === normalizedTarget) return { text: rawText, provider: "same-language" };
  if (normalizedTarget === "en" && /^[\x00-\x7F\s.,!?'"():;/\\-]+$/.test(rawText)) {
    return { text: rawText, provider: "ascii-english" };
  }

  const key = cacheKey(rawText, normalizedTarget);
  if (translationCache.has(key)) {
    return { text: translationCache.get(key), provider: "cache" };
  }

  try {
    const translated = await translateWithProxy(rawText, normalizedTarget, source);
    if (translated && translated !== rawText) {
      translationCache.set(key, translated);
      return { text: translated, provider: "proxy" };
    }
  } catch {
    // fall through to LibreTranslate
  }

  try {
    const candidates = getLibreTranslateCandidates();
    let translated = "";

    for (const url of candidates) {
      try {
        translated = await translateWithLibreTranslate(
          rawText,
          normalizedTarget,
          source,
          url
        );
        if (translated) break;
      } catch {
        // try next endpoint
      }
    }

    if (translated) {
      translationCache.set(key, translated);
      return { text: translated, provider: "libretranslate" };
    }
  } catch {
    // fall through to OpenAI
  }

  try {
    const translated = await translateWithMyMemory(rawText, normalizedTarget);
    if (translated && translated !== rawText) {
      translationCache.set(key, translated);
      return { text: translated, provider: "mymemory" };
    }
  } catch {
    // fall through to next provider
  }

  try {
    const translated = await translateWithGoogle(rawText, normalizedTarget);
    if (translated && translated !== rawText) {
      translationCache.set(key, translated);
      return { text: translated, provider: "google" };
    }
  } catch {
    // fall through to OpenAI
  }

  try {
    const translated = await translateWithOpenAi(rawText, normalizedTarget);
    if (translated) {
      translationCache.set(key, translated);
      return { text: translated, provider: "openai" };
    }
  } catch {
    // ignore
  }

  // Do not cache failures so we can retry on the next refresh.
  return { text: rawText, provider: "fallback" };
}

export async function translateChatText(text, targetLanguage) {
  const result = await translateChatTextWithMeta(text, targetLanguage);
  return result.text;
}
```

---

## File: `src\services\localData.js`
```js
import { openDB } from "idb";

const DB_NAME = "telemed-offline-db";
const DB_VERSION = 3;

function nowTs() {
  return Date.now();
}

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("users")) {
      db.createObjectStore("users", { keyPath: "mobile" });
    }

    if (!db.objectStoreNames.contains("patients")) {
      const patients = db.createObjectStore("patients", {
        keyPath: "id",
        autoIncrement: true
      });
      patients.createIndex("createdAt", "createdAt");
    }

    if (!db.objectStoreNames.contains("appointments")) {
      const appointments = db.createObjectStore("appointments", {
        keyPath: "id",
        autoIncrement: true
      });
      appointments.createIndex("patientMobile", "patientMobile");
      appointments.createIndex("doctorId", "doctorId");
      appointments.createIndex("updatedAt", "updatedAt");
    }

    if (!db.objectStoreNames.contains("messages")) {
      const messages = db.createObjectStore("messages", {
        keyPath: "id",
        autoIncrement: true
      });
      messages.createIndex("appointmentId", "appointmentId");
      messages.createIndex("createdAt", "createdAt");
    }

    if (!db.objectStoreNames.contains("authCache")) {
      const authCache = db.createObjectStore("authCache", {
        keyPath: "key"
      });
      authCache.createIndex("role", "role");
      authCache.createIndex("identifier", "identifier");
      authCache.createIndex("updatedAt", "updatedAt");
    }

    if (!db.objectStoreNames.contains("doctors")) {
      const doctors = db.createObjectStore("doctors", {
        keyPath: "email"
      });
      doctors.createIndex("id", "id");
      doctors.createIndex("createdAt", "createdAt");
    }
  }
});

export async function registerPatientUser(user) {
  const db = await dbPromise;
  const mobile = String(user.mobile || "").trim();
  if (!mobile) throw new Error("mobile-required");

  const existing = await db.get("users", mobile);
  if (existing) throw new Error("user-exists");

  const record = {
    ...user,
    mobile,
    role: "patient",
    createdAt: nowTs(),
    updatedAt: nowTs()
  };
  await db.put("users", record);
  return record;
}

export async function getPatientUserByMobile(mobile) {
  const db = await dbPromise;
  return db.get("users", String(mobile || "").trim());
}

export async function savePatientUserLocal(user) {
  const db = await dbPromise;
  const mobile = String(user.mobile || "").trim();
  if (!mobile) throw new Error("mobile-required");
  const existing = await db.get("users", mobile);
  const record = {
    ...existing,
    ...user,
    mobile,
    role: "patient",
    createdAt: existing?.createdAt || nowTs(),
    updatedAt: nowTs()
  };
  await db.put("users", record);
  return record;
}

export async function addPatientRecord(patient) {
  const db = await dbPromise;
  return db.add("patients", {
    ...patient,
    createdAt: nowTs(),
    updatedAt: nowTs()
  });
}

export async function getAllPatientRecords() {
  const db = await dbPromise;
  const data = await db.getAll("patients");
  return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function createAppointment(appointment) {
  const db = await dbPromise;
  const createdAt = Number(appointment?.createdAt || 0) || nowTs();
  const updatedAt = Number(appointment?.updatedAt || 0) || nowTs();
  return db.add("appointments", {
    ...appointment,
    cloudId:
      appointment?.cloudId === undefined || appointment?.cloudId === null
        ? null
        : appointment.cloudId,
    syncStatus: appointment?.syncStatus || "synced",
    createdAt,
    updatedAt
  });
}

export async function getAllAppointments() {
  const db = await dbPromise;
  return db.getAll("appointments");
}

export async function getAppointmentById(id) {
  const db = await dbPromise;
  const numericId = Number(id);
  const key = Number.isNaN(numericId) ? id : numericId;
  return db.get("appointments", key);
}

export async function getAppointmentsForDoctor(doctorId) {
  const db = await dbPromise;
  const all = await db.getAll("appointments");
  return all.filter((a) => a.doctorId === doctorId);
}

export async function getAppointmentsForPatient(patientMobile, patientName) {
  const db = await dbPromise;
  const mobile = String(patientMobile || "").trim();
  const name = String(patientName || "").trim();
  const all = await db.getAll("appointments");
  return all.filter((a) => {
    if (mobile) return String(a.patientMobile || "").trim() === mobile;
    return name && String(a.patientName || "").trim() === name;
  });
}

export async function updateAppointmentById(id, updates) {
  const db = await dbPromise;
  const existing = await db.get("appointments", id);
  if (!existing) throw new Error("appointment-not-found");
  const merged = {
    ...existing,
    ...updates,
    // Keep local primary key stable. Do not overwrite with cloud row id.
    id: existing.id,
    updatedAt: nowTs()
  };
  await db.put("appointments", merged);
  return merged;
}

export async function deleteAppointmentById(id) {
  const db = await dbPromise;
  await db.delete("appointments", id);
}

export async function addChatMessage(appointmentId, message) {
  const db = await dbPromise;
  return db.add("messages", {
    appointmentId,
    ...message,
    createdAt: nowTs()
  });
}

export async function getChatMessages(appointmentId) {
  const db = await dbPromise;
  const all = await db.getAll("messages");
  return all
    .filter((m) => String(m.appointmentId) === String(appointmentId))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export async function getAllChatMessages() {
  const db = await dbPromise;
  const all = await db.getAll("messages");
  return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function deleteChatMessage(id) {
  const db = await dbPromise;
  const numericId = Number(id);
  const key = Number.isNaN(numericId) ? id : numericId;
  await db.delete("messages", key);
  return true;
}

function authKey(role, identifier) {
  return `${String(role || "").trim().toLowerCase()}:${String(identifier || "")
    .trim()
    .toLowerCase()}`;
}

export async function saveOfflineCredential(role, identifier, password, userData) {
  const db = await dbPromise;
  const normalizedRole = String(role || "").trim().toLowerCase();
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
  const key = authKey(normalizedRole, normalizedIdentifier);
  if (!normalizedRole || !normalizedIdentifier || !password) {
    throw new Error("offline-auth-data-required");
  }

  await db.put("authCache", {
    key,
    role: normalizedRole,
    identifier: normalizedIdentifier,
    password: String(password).trim(),
    userData: userData || null,
    updatedAt: nowTs()
  });
}

export async function getOfflineCredential(role, identifier) {
  const db = await dbPromise;
  return db.get("authCache", authKey(role, identifier));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function slugId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function addDoctorCredential(doctor) {
  const db = await dbPromise;
  const email = normalizeEmail(doctor.email);
  if (!email) throw new Error("doctor-email-required");
  const existing = await db.get("doctors", email);
  if (existing) throw new Error("doctor-already-exists");

  const idBase = slugId(doctor.id || doctor.name || email);
  const record = {
    id: idBase ? `doc_${idBase}` : `doc_${Date.now()}`,
    name: String(doctor.name || "").trim() || "Doctor",
    email,
    password: String(doctor.password || "").trim(),
    specialty: String(doctor.specialty || "General Medicine").trim(),
    createdAt: nowTs(),
    updatedAt: nowTs()
  };
  await db.put("doctors", record);
  return record;
}

export async function getDoctorByEmail(email) {
  const db = await dbPromise;
  return db.get("doctors", normalizeEmail(email));
}

export async function getAllDoctors() {
  const db = await dbPromise;
  const all = await db.getAll("doctors");
  return all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}
```

---

## File: `src\services\cloudData.js`
```js
import { hasSupabase, supabase } from "../supabaseClient";

function ensureClient() {
  if (!hasSupabase || !supabase) {
    throw new Error("supabase-not-configured");
  }
}

function mapUser(row) {
  if (!row) return null;
  return {
    name: row.name,
    age: row.age,
    mobile: row.mobile,
    role: row.role || "patient",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function mapPatient(row) {
  const rawCondition = String(row.condition || "");
  const fallbackMatch = rawCondition.match(/\nAdditional:\s*(.*)$/i);
  const additionalFromCondition = fallbackMatch ? fallbackMatch[1].trim() : "";
  const cleanCondition = fallbackMatch
    ? rawCondition.replace(/\nAdditional:\s*.*$/i, "").trim()
    : rawCondition;

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    condition: cleanCondition,
    additionalData: String(row.additional_data || additionalFromCondition || ""),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function mapAppointment(row) {
  return {
    id: row.id,
    patientName: row.patient_name,
    patientMobile: row.patient_mobile,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    date: row.date,
    time: row.time,
    symptoms: row.symptoms,
    tokenNo: row.token_no,
    status: row.status,
    consultType: row.consult_type,
    consultCode: row.consult_code,
    codeSharedAt: row.code_shared_at
      ? new Date(row.code_shared_at).getTime()
      : null,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

function mapMessage(row) {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    text: row.text,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  };
}

function mapPharmacy(row) {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    phone: row.phone,
    ownerEmail: row.owner_email,
    ownerPassword: row.owner_password,
    medicines: row.medicines || {},
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
  };
}

export async function getPatientUserCloud(mobile) {
  ensureClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("mobile", String(mobile || "").trim())
    .maybeSingle();

  if (error) throw error;
  return mapUser(data);
}

export async function registerPatientUserCloud(user) {
  ensureClient();
  const payload = {
    name: user.name,
    age: Number(user.age || 0),
    mobile: String(user.mobile || "").trim(),
    role: "patient"
  };

  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapUser(data);
}

export async function addPatientRecordCloud(patient) {
  ensureClient();
  const payloadWithAdditional = {
    name: patient.name,
    age: String(patient.age || ""),
    condition: patient.condition || "",
    additional_data: patient.additionalData || ""
  };
  const { data, error } = await supabase
    .from("patients")
    .insert(payloadWithAdditional)
    .select()
    .single();
  if (!error) return mapPatient(data);

  // Backward compatibility: if DB column `additional_data` is not created yet.
  const message = String(error?.message || "").toLowerCase();
  const details = String(error?.details || "").toLowerCase();
  const hint = String(error?.hint || "").toLowerCase();
  const missingAdditionalColumn =
    String(error?.code || "") === "42703" ||
    message.includes("additional_data") ||
    details.includes("additional_data") ||
    hint.includes("additional_data");

  if (missingAdditionalColumn) {
    const mergedCondition = patient.additionalData
      ? `${patient.condition || ""}\nAdditional: ${patient.additionalData}`
      : (patient.condition || "");
    const payloadFallback = {
      name: patient.name,
      age: String(patient.age || ""),
      condition: mergedCondition
    };
    const { data: fbData, error: fbError } = await supabase
      .from("patients")
      .insert(payloadFallback)
      .select()
      .single();
    if (fbError) throw fbError;
    return mapPatient(fbData);
  }

  throw error;
}

export async function getAllPatientRecordsCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPatient);
}

export async function updatePatientRecordCloud(id, updates) {
  ensureClient();
  const payloadWithAdditional = {
    name: updates.name,
    age: String(updates.age || ""),
    condition: updates.condition || "",
    additional_data: updates.additionalData || ""
  };

  const { data, error } = await supabase
    .from("patients")
    .update(payloadWithAdditional)
    .eq("id", id)
    .select()
    .single();

  if (!error) return mapPatient(data);

  const message = String(error?.message || "").toLowerCase();
  const details = String(error?.details || "").toLowerCase();
  const hint = String(error?.hint || "").toLowerCase();
  const missingAdditionalColumn =
    String(error?.code || "") === "42703" ||
    message.includes("additional_data") ||
    details.includes("additional_data") ||
    hint.includes("additional_data");

  if (missingAdditionalColumn) {
    const mergedCondition = updates.additionalData
      ? `${updates.condition || ""}\nAdditional: ${updates.additionalData}`
      : (updates.condition || "");
    const fallbackPayload = {
      name: updates.name,
      age: String(updates.age || ""),
      condition: mergedCondition
    };
    const { data: fbData, error: fbError } = await supabase
      .from("patients")
      .update(fallbackPayload)
      .eq("id", id)
      .select()
      .single();
    if (fbError) throw fbError;
    return mapPatient(fbData);
  }

  throw error;
}

export async function deletePatientRecordCloud(id) {
  ensureClient();
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function createAppointmentCloud(appointment) {
  ensureClient();
  const payload = {
    patient_name: appointment.patientName,
    patient_mobile: appointment.patientMobile,
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    doctor_specialty: appointment.doctorSpecialty,
    date: appointment.date,
    time: appointment.time,
    symptoms: appointment.symptoms,
    token_no: appointment.tokenNo,
    status: appointment.status,
    consult_type: appointment.consultType,
    consult_code: appointment.consultCode
  };

  const { data, error } = await supabase
    .from("appointments")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function getAppointmentsForDoctorCloud(doctorId) {
  ensureClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function getAppointmentsForPatientCloud(patientMobile, patientName) {
  ensureClient();
  let queryBuilder = supabase.from("appointments").select("*");
  const mobile = String(patientMobile || "").trim();
  const name = String(patientName || "").trim();
  if (mobile) {
    queryBuilder = queryBuilder.eq("patient_mobile", mobile);
  } else if (name) {
    queryBuilder = queryBuilder.eq("patient_name", name);
  }

  const { data, error } = await queryBuilder.order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function getAllAppointmentsCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function getAppointmentByIdCloud(id) {
  ensureClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAppointment(data) : null;
}

export async function updateAppointmentCloud(id, updates) {
  ensureClient();
  const payload = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.consultType !== undefined) payload.consult_type = updates.consultType;
  if (updates.consultCode !== undefined) payload.consult_code = updates.consultCode;
  if (updates.codeSharedAt !== undefined) {
    payload.code_shared_at = updates.codeSharedAt
      ? new Date(updates.codeSharedAt).toISOString()
      : null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function addChatMessageCloud(appointmentId, message) {
  ensureClient();
  const payload = {
    appointment_id: String(appointmentId),
    text: message.text,
    sender_role: message.senderRole,
    sender_name: message.senderName
  };
  const { data, error } = await supabase
    .from("messages")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}

export async function getChatMessagesCloud(appointmentId) {
  ensureClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("appointment_id", String(appointmentId))
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapMessage);
}

export async function getPrescriptionMessagesCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .ilike("text", "[PRESCRIPTION]%")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map(mapMessage);
}

export async function deleteChatMessageCloud(messageId) {
  ensureClient();
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);
  if (error) throw error;
  return true;
}

export async function getPharmaciesCloud() {
  ensureClient();
  const { data, error } = await supabase
    .from("pharmacies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPharmacy);
}

export async function getPharmacyOwnerLoginCloud(email, password) {
  ensureClient();
  const { data, error } = await supabase
    .from("pharmacies")
    .select("*")
    .eq("owner_email", String(email || "").trim().toLowerCase())
    .eq("owner_password", String(password || "").trim())
    .maybeSingle();
  if (error) throw error;
  return data ? mapPharmacy(data) : null;
}

export async function createPharmacyCloud(payload) {
  ensureClient();
  const insertPayload = {
    name: payload.name,
    area: payload.area || "",
    phone: payload.phone || "",
    owner_email: String(payload.ownerEmail || "").trim().toLowerCase(),
    owner_password: String(payload.ownerPassword || "").trim(),
    medicines: payload.medicines || {}
  };
  const { data, error } = await supabase
    .from("pharmacies")
    .insert(insertPayload)
    .select()
    .single();
  if (error) throw error;
  return mapPharmacy(data);
}

export async function updatePharmacyMedicinesCloud(pharmacyId, medicines) {
  ensureClient();
  const { data, error } = await supabase
    .from("pharmacies")
    .update({ medicines: medicines || {} })
    .eq("id", pharmacyId)
    .select()
    .single();
  if (error) throw error;
  return mapPharmacy(data);
}
```

---

## File: `src\services\clinicalModels.js`
```js
const TRAINING_SAMPLES = [
  // Viral Fever - 6 samples
  {
    label: "viral_fever",
    text: "fever chills body pain fatigue headache weakness"
  },
  {
    label: "viral_fever",
    text: "high temperature shivering tiredness muscle pain fever"
  },
  {
    label: "viral_fever",
    text: "fever 101 temperature body ache with chills malaise"
  },
  {
    label: "viral_fever",
    text: "sudden onset fever myalgia joint pain fatigue"
  },
  {
    label: "viral_fever",
    text: "fever sweating chills weakness general body pain"
  },
  {
    label: "viral_fever",
    text: "high fever temperature exhaustion body ache weakness"
  },
  
  // Cold & Cough - 6 samples
  {
    label: "cold_cough",
    text: "cold cough sore throat runny nose sneezing blocked nose"
  },
  {
    label: "cold_cough",
    text: "cough throat irritation mild fever sneezing nasal congestion"
  },
  {
    label: "cold_cough",
    text: "persistent cough sore throat stuffy nose runny discharge"
  },
  {
    label: "cold_cough",
    text: "throat pain coughing sneezing nasal blockage respiratory"
  },
  {
    label: "cold_cough",
    text: "continuous cough scratchy throat nose congestion sniffles"
  },
  {
    label: "cold_cough",
    text: "bronchial cough mucus throat irritation nasal symptoms"
  },
  
  // Migraine & Headache - 6 samples
  {
    label: "migraine_headache",
    text: "severe headache migraine nausea light sensitivity one side pain"
  },
  {
    label: "migraine_headache",
    text: "headache throbbing pain vomiting visual disturbance migraine"
  },
  {
    label: "migraine_headache",
    text: "intense headache photophobia pulsating unilateral pain"
  },
  {
    label: "migraine_headache",
    text: "head pain throbbing dizziness nausea aura symptoms"
  },
  {
    label: "migraine_headache",
    text: "severe head pain light bothers blurred vision vomiting"
  },
  {
    label: "migraine_headache",
    text: "pounding headache one side temples neck stiffness nausea"
  },
  
  // Gastro Issue - 6 samples
  {
    label: "gastro_issue",
    text: "stomach pain diarrhea vomiting food poisoning abdominal cramps nausea"
  },
  {
    label: "gastro_issue",
    text: "loose motion abdominal pain vomiting dehydration stomach upset"
  },
  {
    label: "gastro_issue",
    text: "severe abdominal pain diarrhea nausea stomach discomfort"
  },
  {
    label: "gastro_issue",
    text: "stomach cramping loose stool digestive upset nausea vomiting"
  },
  {
    label: "gastro_issue",
    text: "abdominal discomfort bowel movement diarrhea stomach pain food"
  },
  {
    label: "gastro_issue",
    text: "belly pain cramping loose motion indigestion stomach trouble"
  },
  
  // Skin Allergy - 6 samples
  {
    label: "skin_allergy",
    text: "rash itching skin redness hives irritation allergy patch"
  },
  {
    label: "skin_allergy",
    text: "itchy skin red patch swelling allergic reaction rashes"
  },
  {
    label: "skin_allergy",
    text: "skin eruption itching redness urticaria hives reaction"
  },
  {
    label: "skin_allergy",
    text: "dermitis itchy bumps skin irritation allergic rash"
  },
  {
    label: "skin_allergy",
    text: "red rash itching swollen skin allergy dermatitis"
  },
  {
    label: "skin_allergy",
    text: "skin inflammation itchy patches hives contact reaction"
  },
  
  // Cardio-Respiratory - 6 samples
  {
    label: "cardio_respiratory",
    text: "chest pain shortness of breath breathless tight chest dizziness"
  },
  {
    label: "cardio_respiratory",
    text: "left arm pain chest pressure breathing difficulty sweating fainting"
  },
  {
    label: "cardio_respiratory",
    text: "chest tightness breathlessness palpitations cardiac pain anxiety"
  },
  {
    label: "cardio_respiratory",
    text: "difficult breathing chest discomfort heart pain respiratory distress"
  },
  {
    label: "cardio_respiratory",
    text: "chest compression breathlessness diaphoresis cardiac symptoms urgent"
  },
  {
    label: "cardio_respiratory",
    text: "chest heaviness shortness breath cardiovascular emergency dyspnea"
  }
];

const REMEDY_BY_LABEL = {
  viral_fever: "Hydrate well, take rest, and monitor temperature.",
  cold_cough: "Warm fluids, steam inhalation, and adequate rest can help.",
  migraine_headache: "Rest in a quiet dark room and stay hydrated.",
  gastro_issue: "Use oral rehydration, light diet, and avoid oily food.",
  skin_allergy: "Avoid triggers, keep skin clean, and use soothing care.",
  cardio_respiratory:
    "Avoid exertion and seek urgent medical attention for chest or breathing symptoms."
};

const ADVICE_BY_LABEL = {
  viral_fever:
    "Consult a doctor if fever stays above 2 days or new symptoms appear.",
  cold_cough:
    "Consult a doctor if breathing trouble, high fever, or persistent cough occurs.",
  migraine_headache:
    "Consult a doctor if headache is severe, frequent, or has neurologic symptoms.",
  gastro_issue:
    "Consult a doctor if vomiting persists, dehydration worsens, or blood appears.",
  skin_allergy:
    "Consult a doctor if rash spreads quickly, blisters, or swelling appears.",
  cardio_respiratory:
    "Immediate doctor or emergency care is advised for chest pain or breathing difficulty."
};

const CLASS_KEYWORDS = {
  viral_fever: [
    "fever",
    "temperature",
    "chills",
    "body pain",
    "fatigue",
    "shivering",
    "weakness",
    "myalgia",
    "muscle pain",
    "sweating",
    "malaise",
    "high temperature",
    "onset fever",
    "joint pain"
  ],
  cold_cough: [
    "cold",
    "cough",
    "sore throat",
    "runny nose",
    "sneezing",
    "blocked nose",
    "nasal congestion",
    "throat pain",
    "stuffy nose",
    "nasal",
    "bronchial",
    "mucus",
    "respiratory",
    "throat irritation",
    "coughing"
  ],
  migraine_headache: [
    "headache",
    "migraine",
    "light sensitivity",
    "one side pain",
    "throbbing",
    "visual disturbance",
    "photophobia",
    "pulsating",
    "aura",
    "temples",
    "neck stiffness",
    "head pain",
    "blurred vision",
    "pounding",
    "dizziness"
  ],
  gastro_issue: [
    "stomach pain",
    "diarrhea",
    "vomiting",
    "food poisoning",
    "abdominal",
    "loose motion",
    "nausea",
    "cramping",
    "bowel",
    "digestive",
    "belly pain",
    "indigestion",
    "abdominal pain",
    "bowel movement",
    "stomach discomfort"
  ],
  skin_allergy: [
    "rash",
    "itching",
    "skin",
    "hives",
    "allergy",
    "red patch",
    "skin redness",
    "itchy",
    "eruption",
    "urticaria",
    "dermatitis",
    "dermitis",
    "swelling",
    "bumps",
    "irritation",
    "contact reaction"
  ],
  cardio_respiratory: [
    "chest pain",
    "shortness of breath",
    "breathing difficulty",
    "breathless",
    "left arm pain",
    "tight chest",
    "dizziness",
    "cardiac",
    "palpitations",
    "breathlessness",
    "sweating",
    "chest pressure",
    "heart pain",
    "chest tightness",
    "dyspnea",
    "diaphoresis",
    "respiratory distress"
  ]
};

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function trainModel(samples) {
  const classDocCount = {};
  const classWordCount = {};
  const classTokenTotals = {};
  const vocabulary = new Set();

  for (const sample of samples) {
    const label = sample.label;
    const tokens = tokenize(sample.text);

    classDocCount[label] = (classDocCount[label] || 0) + 1;
    if (!classWordCount[label]) classWordCount[label] = {};
    if (!classTokenTotals[label]) classTokenTotals[label] = 0;

    for (const token of tokens) {
      vocabulary.add(token);
      classWordCount[label][token] = (classWordCount[label][token] || 0) + 1;
      classTokenTotals[label] += 1;
    }
  }

  return {
    classDocCount,
    classWordCount,
    classTokenTotals,
    vocabularySize: vocabulary.size,
    totalDocs: samples.length
  };
}

const MODEL = trainModel(TRAINING_SAMPLES);
const MODEL_VOCAB = new Set(
  Object.values(MODEL.classWordCount).flatMap((obj) => Object.keys(obj))
);

function toProbabilityMap(logScores) {
  const entries = Object.entries(logScores);
  const maxLog = Math.max(...entries.map(([, value]) => value));
  const exps = entries.map(([label, value]) => [label, Math.exp(value - maxLog)]);
  const sum = exps.reduce((acc, [, value]) => acc + value, 0);

  const probs = {};
  for (const [label, value] of exps) {
    probs[label] = sum > 0 ? value / sum : 0;
  }
  return probs;
}

export function predictWithNaiveBayes(symptomText) {
  const rawTokens = tokenize(symptomText);
  const labels = Object.keys(MODEL.classDocCount);
  if (rawTokens.length === 0) {
    return {
      label: "viral_fever",
      confidence: "low",
      probabilities: {}
    };
  }

  const tokens = rawTokens.filter((token) => MODEL_VOCAB.has(token));
  const text = String(symptomText || "").toLowerCase();
  const keywordScores = {};
  for (const label of labels) {
    const keywords = CLASS_KEYWORDS[label] || [];
    keywordScores[label] = keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? (keyword.includes(" ") ? 2 : 1) : 0);
    }, 0);
  }
  const maxKeywordScore = Math.max(...Object.values(keywordScores), 0);

  // If clear symptom-group keywords are present, prefer that class directly.
  if (maxKeywordScore >= 2) {
    const best = Object.entries(keywordScores).sort((a, b) => b[1] - a[1])[0];
    const label = best?.[0] || "viral_fever";
    return {
      label,
      confidence: maxKeywordScore >= 4 ? "high" : "medium",
      probabilities: {}
    };
  }

  if (tokens.length === 0) {
    if (maxKeywordScore > 0) {
      const best = Object.entries(keywordScores).sort((a, b) => b[1] - a[1])[0];
      const label = best?.[0] || "viral_fever";
      return {
        label,
        confidence: best?.[1] >= 3 ? "medium" : "low",
        probabilities: {}
      };
    }

    return {
      label: "viral_fever",
      confidence: "low",
      probabilities: {}
    };
  }

  const logScores = {};
  for (const label of labels) {
    const prior =
      Math.log((MODEL.classDocCount[label] || 0) + 1) -
      Math.log(MODEL.totalDocs + labels.length);
    let score = prior;

    for (const token of tokens) {
      const count = MODEL.classWordCount[label]?.[token] || 0;
      const prob =
        (count + 1) /
        ((MODEL.classTokenTotals[label] || 0) + MODEL.vocabularySize);
      score += Math.log(prob);
    }
    logScores[label] = score;
  }

  const nbProbabilities = toProbabilityMap(logScores);
  const combinedScores = {};
  for (const label of labels) {
    const nb = nbProbabilities[label] || 0;
    const keywordBoost =
      maxKeywordScore > 0 ? (keywordScores[label] || 0) / maxKeywordScore : 0;
    combinedScores[label] = nb * 0.45 + keywordBoost * 0.55;
  }
  const sorted = Object.entries(combinedScores).sort((a, b) => b[1] - a[1]);
  const [topLabel, topScore] = sorted[0] || ["viral_fever", 0];

  const confidence =
    topScore >= 0.68 ? "high" : topScore >= 0.42 ? "medium" : "low";

  return {
    label: topLabel,
    confidence,
    probabilities: nbProbabilities
  };
}

export function predictSeverityWithDecisionTree({ symptomText, age }) {
  const input = String(symptomText || "").toLowerCase();
  const numericAge = Number(age || 0);
  const has = (word) => input.includes(word);

  const severeBreathing =
    has("shortness of breath") || has("breathing difficulty") || has("breathless");
  const chestWarning =
    has("chest pain") || has("tight chest") || has("left arm pain");
  const neuroWarning = has("fainted") || has("unconscious") || has("confusion");
  const bleedingWarning = has("blood vomiting") || has("blood in stool");
  const veryHighFever =
    has("103") || has("104") || has("high fever") || has("seizure");
  const moderateWarning =
    has("vomiting") || has("diarrhea") || has("dehydration") || has("rash");

  if (severeBreathing || chestWarning || neuroWarning || bleedingWarning) {
    return {
      riskLevel: "high",
      emergency: true,
      reason:
        "Emergency symptoms pattern detected (cardiorespiratory or neurologic red flag)."
    };
  }

  if (veryHighFever && numericAge >= 60) {
    return {
      riskLevel: "high",
      emergency: true,
      reason: "High fever with higher-age risk profile."
    };
  }

  if (veryHighFever || moderateWarning) {
    return {
      riskLevel: "medium",
      emergency: false,
      reason: "Moderate-risk symptom pattern detected."
    };
  }

  return {
    riskLevel: "low",
    emergency: false,
    reason: "No high-risk branch triggered in decision tree."
  };
}

export function buildClinicalAIResult({ symptomText, age }) {
  const nb = predictWithNaiveBayes(symptomText);
  const tree = predictSeverityWithDecisionTree({ symptomText, age });

  return {
    label: nb.label,
    confidence: nb.confidence,
    probabilities: nb.probabilities,
    riskLevel: tree.riskLevel,
    emergency: tree.emergency,
    treeReason: tree.reason,
    naturalRemedy: REMEDY_BY_LABEL[nb.label] || REMEDY_BY_LABEL.viral_fever,
    doctorAdvice: ADVICE_BY_LABEL[nb.label] || ADVICE_BY_LABEL.viral_fever
  };
}
```

---

## File: `src\services\aiSymptomService.js`
```js
const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = "gpt-4o-mini";
const LANGUAGE_NAMES = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  ml: "Malayalam"
};

function getApiKey() {
  return process.env.REACT_APP_OPENAI_API_KEY || "";
}

function parseAiText(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("ai-empty-response");

  try {
    const parsed = JSON.parse(raw);
    return {
      issue: parsed.issue || "General non-specific symptoms",
      naturalRemedy:
        parsed.naturalRemedy ||
        "Hydrate, rest, and take light nutritious food.",
      doctorAdvice:
        parsed.doctorAdvice ||
        "Contact a doctor if symptoms persist or worsen.",
      advice:
        parsed.advice ||
        "Monitor symptoms and consult a doctor if symptoms persist or worsen.",
      confidence: parsed.confidence || "low",
      serious: Boolean(parsed.serious),
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : []
    };
  } catch {
    return {
      issue: "General non-specific symptoms",
      naturalRemedy: "Hydrate, rest, and take light nutritious food.",
      doctorAdvice: "Contact a doctor if symptoms persist or worsen.",
      advice: raw,
      confidence: "low",
      serious: false,
      redFlags: []
    };
  }
}

export async function analyzeSymptomsWithAI({ symptomText, imageDataUrl, language }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("openai-key-missing");
  if (!navigator.onLine) throw new Error("offline-no-ai");
  const outputLanguage =
    LANGUAGE_NAMES[String(language || "").toLowerCase()] || "English";

  const input = [
    {
      role: "system",
      content:
        `You are a cautious triage assistant. Return ONLY JSON with keys: issue, naturalRemedy, doctorAdvice, advice, confidence, serious, redFlags. Keep output concise and safe. Do not claim diagnosis certainty. Write all patient-facing text in ${outputLanguage}.`
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Symptoms from patient: ${String(symptomText || "").trim() || "No text provided"}`
        },
        ...(imageDataUrl
          ? [{ type: "input_image", image_url: imageDataUrl }]
          : []),
        {
          type: "input_text",
          text: "confidence must be one of: low, medium, high. serious must be true for emergency patterns. redFlags should be an array of urgent warning signs if any."
        }
      ]
    }
  ];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      max_output_tokens: 220
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`openai-error:${response.status}:${errText}`);
  }

  const data = await response.json();
  const outputText = data?.output_text || "";
  return parseAiText(outputText);
}
```
