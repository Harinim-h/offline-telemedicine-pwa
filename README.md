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
