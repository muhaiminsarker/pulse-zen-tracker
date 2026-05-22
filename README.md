# CalmPulse

Real-time ECG-based biofeedback app. Built as a capstone project for EN.585.795 Projects in Medical Sensors and Devices at Johns Hopkins University (Summer 2025).

An Arduino reads ECG signals from a 3-lead electrode setup, detects R-peaks to calculate BPM, and sends readings over serial to a Node.js backend. The backend pushes data to a React frontend over WebSocket, which displays live BPM, classifies your heart rate zone, and runs a breathing guide that adapts its pacing to your current state.

This is a prototype. It ran locally on one machine with physical hardware during the course. The Arduino hardware no longer exists.

---

## Architecture

```
3-lead ECG electrodes (right arm, left arm, right leg)
  → Instrumentation amplifier + voltage divider → analog pins A0/A1
    → Arduino UNO R3 (QRS detection, BPM calculation, LED output on pins 9/10/11)
      → Serial USB (COM3, 9600 baud)
        → Node.js + Express + Socket.io backend (port 5000)
          → WebSocket
            → React frontend (Vite, port 5173)
```

The backend (`backend/arduinoServer.js`) opens the serial connection, listens for `BPM:<value>` lines from the Arduino, and broadcasts them to connected browser clients via Socket.io. The frontend connects on startup and updates in real time.

There's also a simulated mode — the Arduino sends synthetic BPM values (55–198 BPM, with smooth transitions between zones) so the full UI can run without hardware.

---

## Features

- **Live BPM display** — updates in real time from Arduino serial output
- **Heart rate zones** — three zones with distinct color states:
  - Relaxed: ≤70 BPM
  - Elevated: 71–85 BPM
  - Anxious: >85 BPM
- **LED hardware indicators** — Arduino drives red, yellow, and green LEDs (pins 9, 10, 11) corresponding to zone state
- **Heart rate chart** — live line chart of the last 30 readings during a session (Recharts)
- **Breathing guide** — animated inhale/exhale prompt based on the 4-7-8 breathing method, with timing adapted to zone:
  - Anxious: 4s inhale / 6s exhale (extended exhale activates the parasympathetic nervous system via the Hering-Breuer reflex, counteracting sympathetic arousal)
  - Elevated: 4s inhale / 4s exhale
  - Relaxed: 3s inhale / 3s exhale
- **Session control** — start and stop sessions; each session records duration, average BPM, and time spent in each zone
- **Session history** — previous sessions listed in the UI; not persisted across page reloads

---

## Tech Stack

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui (Radix UI primitives)
- Recharts (heart rate chart)
- Socket.io client

**Backend**
- Node.js, Express
- Socket.io server
- serialport + @serialport/parser-readline

**Hardware**
- ELEGOO UNO R3 (Arduino-compatible)
- 3-lead ECG configuration: right arm, left arm, right leg electrodes
- TRRS connector inputs → instrumentation amplifier → voltage divider → analog pins A0 and A1
- Red/yellow/green LEDs on output pins 9, 10, 11 for zone indication
- QRS detection runs on the Arduino: derivative-based R-peak detection, BPM calculated from interval between peaks

---

## Running Locally

You need Node.js installed. The frontend and backend run as separate processes.

**1. Install frontend dependencies**

```bash
npm install
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Start the backend**

```bash
node arduinoServer.js
```

Server runs on `http://localhost:5000`. Without hardware, use simulated mode — toggle it from the UI after launch.

**4. Start the frontend**

```bash
# from the repo root
npm run dev
```

Open `http://localhost:5173`.

---

## Hardware Setup (if you have it)

- ELEGOO UNO R3 connected via USB
- 3-lead electrode placement: right arm, left arm, right leg
- TRRS connector carries electrode signals into the instrumentation amplifier; output connects to analog pins A0 and A1
- LEDs on pins 9 (red/anxious), 10 (yellow/elevated), 11 (green/relaxed) with equal resistance
- 3.3V powers the LED circuit; 5V powers the ECG circuit; two separate grounds
- The backend defaults to **COM3** at 9600 baud — change the `path` in `backend/arduinoServer.js` to match your port (e.g., `/dev/tty.usbmodem14101` on Mac/Linux)

Expected Arduino serial output format:

```
BPM:72
BPM:74
BPM:71
```

---

## Results

Simulation mode worked as intended — LEDs, breathing guide, and session history all responded correctly as BPM transitioned from 198 down to 55 through the simulated stress-to-calm arc.

Live ECG hardware integration was functional but had accuracy issues. The QRS detection algorithm on the Arduino used a derivative-based approach with no smoothing or moving average, which caused frequent false-positive peaks and inflated BPM readings. During a live demonstration, the presenter read ~147 BPM and a seated observer read ~125 BPM — directionally plausible given the difference in state, but likely overcounted in absolute terms due to the peak detection method.

---

## Known Limitations

- **COM port is hardcoded** — `arduinoServer.js` line 26 has `path: 'COM3'`; change it to match your port before running with hardware
- **QRS detection is noisy** — derivative-based peak detection with no smoothing generates false peaks; Pan-Tompkins with adaptive thresholds would be a meaningful improvement
- **Zone thresholds are fixed** — the 70/85 BPM cutoffs don't account for individual variation in resting heart rate or fitness level
- **Breathing guide is a simplified 4-7-8** — the hold phase is omitted; inhale/exhale only
- **Session history is in-memory** — page refresh clears it
- **Hardware no longer available** — the physical device from the course no longer exists; the live ECG path hasn't been tested since project completion

---

## If I Were to Continue This

The most impactful changes would be:

- **Pan-Tompkins QRS detection** — replacing the derivative-based algorithm with Pan & Tompkins' method (adaptive thresholds + bandpass filtering) would significantly reduce false peaks and give reliable BPM under mild movement
- **Personalized zone calibration** — a short onboarding test to set individual thresholds instead of fixed 70/85 BPM cutoffs; resting heart rate varies enough across users that hardcoded values limit accuracy for anyone outside the average range
- **Five-zone model** — aligning with exercise physiology zones (50–60% HRmax through 90%+) would give more granular feedback and make the system more clinically meaningful
- **HRV analysis** — short-term HRV metrics (RMSSD, pNN50) alongside BPM would add a second dimension to stress assessment that BPM alone doesn't capture
- **Dry electrodes** — the wet electrode setup was the main usability bottleneck during testing; dry electrodes would make the hardware practical outside a lab setting

---

## Context

Capstone project for EN.585.795 Projects in Medical Sensors and Devices (JHU, Summer 2025). The assignment was to design, build, and document a functional biomedical instrumentation system end-to-end — hardware through software.

The frontend was built with React/TypeScript/Vite and shadcn/ui. The backend and Arduino communication layer were written from scratch.
