# MediClinic 3D - Interactive 3D Medical Clinic Floor Plan Navigator

An interactive, low-poly 3D medical clinic application built with **Three.js**, **WebGL**, **TypeScript**, **React**, and **GSAP**. The application renders an architectural isometric view of a medical clinic based on a detailed floor plan, featuring visitor avatar navigation, real-time waypoint routing, and **Three.js AnimationMixer** idle cycles (natural chest breathing, looking around, typing, and clinical animations).

---

## 🏥 Floor Plan Architecture & Zones

### 1. Entrance Mat (Bottom Center)
- Marked **"WELCOME"** with an antimicrobial coir texture and clinic badge.
- Main clinic entrance door with frosted glass insert and metallic handle opening inward.
- Interactive contactless sanitization station.

### 2. Waiting Room (Bottom Zone)
- **Left**: Contemporary L-shaped Reception Desk with raised privacy screen, check-in computer terminal, keyboard, receptionist chair, and an animated **Receptionist Avatar**.
- **Right**: 4 comfortable Patient Chairs aligned against the wall/corner, chilled/hot water dispenser cooler, corner magazine table, and potted indoor plant.

### 3. Medicine Cabin (Middle Zone)
- **Left Side**: Three **3x1.5** multi-tier pharmaceutical shelves fully stocked with antibiotics, vitamins, prescription boxes, amber dropper bottles, and labeled organizer drawers.
- **Right Side**: Open hallway and corridor with directional floor indicators connecting the Waiting Room directly to the Doctor's Cabin.

### 4. Doctor's Cabin (Top Zone)
- **Access Door**: Doorway on the left wall with an inward-opening door leaf.
- **Center-Left**: Large executive Doctor's Consultation Table featuring:
  - Main high-back executive leather chair with seated **Doctor Avatar** in white lab coat.
  - Secondary doctor/assistant chair beside the desk.
  - Patient visitor chair positioned across the desk facing the doctor.
  - Active patient ECG/vitals monitor, stethoscope, and prescription pad.
- **Top-Right Corner**: Medical Examination Bed/Table against the wall with adjustable headrest, mint sanitary mattress, hygienic paper roll, patient step stool, IV drip pole, and privacy curtain rail.

---

## 🎬 Three.js AnimationMixer System

The characters are powered by Three.js `AnimationMixer` and keyframe tracks:

1. **Visitor Avatar**:
   - **Idle Cycle**: Subtle chest expansion and vertical rise simulating natural breathing, coupled with a gentle multi-angle head look-around cycle (glancing left, slight nod, looking at clinic signs, resetting forward).
   - **Walk Cycle**: Coordinated limb swinging and vertical step bobbing.
   - **Seamless Crossfading**: Automatically blends between walking and destination idle states using `AnimationAction.crossFadeTo()`.
   - **Arrival Orientation**: When reaching any destination, the visitor smoothly rotates to engage with the zone (e.g. facing the receptionist at the desk, facing the doctor across the table).

2. **Doctor Avatar**:
   - Continuous `AnimationMixer` loop simulating reading patient charts, examining ECG waveforms, subtle typing, and glancing up warmly to greet the visitor.

3. **Receptionist Avatar**:
   - Continuous `AnimationMixer` loop simulating terminal checking, typing on keyboard, and looking up towards the entrance to welcome visitors.

---

## 🚀 Deployment Instructions

### Option 1: Deploy to Vercel (Recommended)

This repository includes a pre-configured `vercel.json` optimized for Vite:

1. Push your repository to **GitHub** (see instructions below).
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**. Your interactive 3D clinic will be live in under 1 minute!

---

### Option 2: Deploy to GitHub

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all project files
git add .

# 3. Commit your changes
git commit -m "Initial commit: Interactive 3D Medical Clinic"

# 4. Create repository on GitHub and link remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 5. Push to GitHub
git push -u origin main
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack

- **Three.js** (`r186`): 3D isometric scene, lighting, shadows, materials, and `AnimationMixer`
- **GSAP**: Smooth waypoint timeline navigation and door animations
- **React 19 & TypeScript**: Responsive UI overlays and component architecture
- **Tailwind CSS v4**: Clean UI layout and responsive styling
- **Vite 8**: Ultra-fast build and bundling tool
- **Web Audio API**: Procedural footstep and arrival chime synthesizer (no external audio assets required)
