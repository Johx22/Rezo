# Rezo — LaTeX-Inspired Resume Builder

Rezo is an interactive, AI-powered resume builder built with React, TypeScript, and Tailwind CSS. Originally created in Google AI Studio, Rezo has been refined to feature a distraction-free, wizard-like editor and a high-fidelity LaTeX-style resume preview page designed to be printed directly to PDF.

---

## 🚀 Key Features

* **LaTeX-Style Typography**: Renders resume documents in the classic **Computer Modern Serif** web font, replicating the layout and formatting of standard LaTeX academic/professional templates.
* **Unified Workspace Header Actions**:
  * **Download PDF**: Minimalist, blue primary CTA triggering browser print layouts (A4-compliant formatting, page-break margins, and rounded corner simulation).
  * **Import JSON**: Secondary action that loads external JSON resume schemas to populate the editor state instantly.
  * **Export JSON**: Secondary action next to Import to download the current resume schema for local backup.
* **Streamlined Wizard Flow**: Tabbed editor steps (Personal, Experience, Education, Projects, Skills, etc.) with the bottom footer buttons removed to declutter the workspace.
* **Sticky Widescreen Live Preview**: A 480px-wide side-by-side preview panel featuring custom white pill controls for zooming and panning, along with helper tooltips.
* **Responsive Page Simulation**: A4 sheets simulated inside the viewport (`210mm x 297mm`) that scale responsively. Page simulation boundaries automatically square up during printing to let browser engine paginate naturally.
* **Light Theme Enhancements**: Visual gradient blobs are automatically disabled in Light mode to provide a clean, high-contrast, professional writing environment.

---

## 🛠️ Tech Stack

* **Core Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build System**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Text Editing**: Rich-text markdown support for bullet points and descriptions.

---

## 📁 File Structure

```text
Rezo/
├── index.html            # Entry point & Tailwind/Computer Modern font declarations
├── src/
│   ├── App.tsx           # Application shell, state controller, & Navbar action handler
│   ├── main.tsx          # React mounting context
│   ├── types.ts          # Strongly typed models for resume schema layouts
│   ├── constants.ts      # Default initial states & layout ordering configs
│   ├── index.css         # Global styling rules & theme configurations
│   └── components/
│       ├── Editor.tsx    # Left-hand form steps editor & workspace UI
│       ├── Preview.tsx   # Right-hand LaTeX A4 document template simulator
│       └── Background.tsx# Dark-mode decorative gradient backdrop helper
```

---

## 💻 Running Locally

### Prerequisites
Make sure you have **Node.js** (v18+) installed.

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Keys**:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Launch Dev Server**:
   ```bash
   npm run dev
   ```

4. **Production Build & Bundling**:
   To test build artifacts and compile performance:
   ```bash
   npm run build
   ```
