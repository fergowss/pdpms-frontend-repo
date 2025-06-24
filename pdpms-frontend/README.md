# PDPMS Frontend

This is the standalone frontend for **PDPMS** built with [Vite](https://vitejs.dev/) + React (JSX).

## Prerequisites

* Node.js ≥ 18
* npm (comes with Node) or pnpm/yarn if preferred

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

   Vite will automatically open [http://localhost:5173](http://localhost:5173) in your browser.

## Tailwind CSS (optional)

Tailwind and its peer dependencies are already listed as **devDependencies** but not yet integrated. When you are ready to enable Tailwind:

1. Generate the configuration files:

   ```bash
   npx tailwindcss init -p
   ```

2. Create a `src/index.css` and add the Tailwind directives:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Import the CSS in `main.jsx`:

   ```jsx
   import './index.css';
   ```
