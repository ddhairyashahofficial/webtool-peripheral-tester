# Peripheral Tester

A Vite + React single-page application for testing keyboards, mice, touch, gamepads, styluses, and haptics in the browser.

## Requirements

- Node.js 22 (see `.nvmrc`)
- npm 10 or newer

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Production commands

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` creates an optimized static production bundle in `dist/`. Deploy that folder to any static host with an SPA fallback if your host requires one.

## Project layout

```text
src/App.jsx       # Supplied application component; preserved without refactoring
src/main.jsx      # React bootstrap
src/index.css     # Tailwind entry stylesheet and safe global defaults
.github/workflows # CI pipeline
```

## Browser capabilities

Peripheral APIs vary by browser and device. Use a current Chromium-based browser for the broadest Gamepad, Pointer, Touch, and Vibration API support. All diagnostic data stays in the browser.