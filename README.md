# 🚀 TaskPilot — Premium Operational Mission Control & Task Hub

TaskPilot is a high-performance, premium operational task tracker and mission control center built with **Vue 3**, **Vite**, and **Tailwind CSS v4**. Featuring a sophisticated glassmorphism design, robust utility APIs, and fluid transitions, TaskPilot transforms your everyday todo list into a tactical command-center interface.

---

## ✨ Features

- **🛡️ Aero Command Dashboard**: A modern workspace utilizing high-contrast visual hierarchies, custom typography (Manrope & Inter), tactile borders, and custom glass surfaces.
- **🔗 Compressed URL Sharing**: Share entire project lists natively by generating compressed URL share strings using `lz-string` LZ-based compression.
- **📸 Visual Log Exporter**: Snap and download high-resolution PNG reports of your operational dashboard on demand using `html-to-image`.
- **🌙 Nocturnal & Diurnal Themes**: Smooth dark and light mode transitions powered by `@vueuse/core`.
- **⚡ Dynamic Fluid Motion**: Micro-animations and automatic list transitions powered by `@formkit/auto-animate`.
- **📊 Operational Analytics**: An adaptive sidebar showing task statistics, completion percentages, and filtered category counts.
- **🏷️ Structured Organization**: Categorize tasks by *General*, *Work*, *Personal*, *Automation*, and *Health* with corresponding custom iconography and priority highlights (*High*, *Medium*, *Low*).

---

## 🛠️ Tech Stack

- **Core**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>` SFCs)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS custom properties
- **Build Engine**: [Vite](https://vitejs.dev/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/) (`@phosphor-icons/vue`)
- **State & Utilities**:
  - [@vueuse/core](https://vueuse.org/) for reactive device dark mode, storage syncing.
  - [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html) for fast URL compression.
  - [html-to-image](https://github.com/bubkoo/html-to-image) for client-side rasterization.
  - [date-fns](https://date-fns.org/) for date calculations.
  - [vue-sonner](https://github.com/carlesbarrera/vue-sonner) for sleek notifications.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended) and [pnpm](https://pnpm.io/) for dependency management.

### Installation

Clone the repository and install the project dependencies:

```bash
# Install dependencies
pnpm install
```

### Development

Run the local development server:

```bash
pnpm dev
```

The application will start running at `http://localhost:5173`.

### Build

To compile and optimize the application for production deployment:

```bash
# Build the production bundle
pnpm build

# Preview the built application locally
pnpm preview
```

---

## 🎨 Design Systems

TaskPilot implements a dual-theme color palette driven by CSS variables in [index.css](file:///Users/honeyzrich/Desktop/projects/taskpilot/src/assets/index.css):

### ☀️ Aero Command (Light Mode)
Designed for high readability in professional environments using a soft slate background layered with pure white surface cards.

- **Background**: `hsl(210 40% 98%)` (Slate-50)
- **Primary**: `hsl(221 83% 53%)` (Command Blue)
- **Success**: `hsl(160 84% 39%)` (Tactical Green)

### 🌙 Nocturnal Navigator (Dark Mode)
A custom night-ops palette with deep slate tones, neon accents, and soft glow overlays.

- **Background**: `hsl(222 55% 10%)`
- **Primary**: `hsl(201 100% 74%)` (Glow Cyan)
- **Destructive**: `hsl(6 100% 83%)` (Neon Coral)

---

## 🤝 Credits

Crafted with excellence by **[Lawal Oyinlola](https://lawaloyinlola.com)**.
