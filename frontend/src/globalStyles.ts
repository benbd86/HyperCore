import { createGlobalStyle } from "styled-components";

/** Light/dark tokens via `body` / `body.dark` — use `var(--...)` in styled-components. */
export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    /* Light theme (default) */
    --bg-page: #f5f5f5;
    --bg-elevated: #ffffff;
    --bg-input: #ffffff;
    --bg-button-secondary: #f3f4f6;
    --bg-button-secondary-hover: #e5e7eb;
    --text-primary: #1a1a1a;
    --text-secondary: #374151;
    --text-muted: #6b7280;
    --border: #e5e7eb;
    --border-strong: #d1d5db;
    --border-focus: #2563eb;
    --link: #2563eb;
    --link-hover: #1d4ed8;
    --link-hover-bg: #eff6ff;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --error: #b91c1c;
    --error-bg: #fef2f2;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-modal: 0 4px 20px rgba(0, 0, 0, 0.15);
    --overlay: rgba(0, 0, 0, 0.5);
    --focus-ring: rgba(37, 99, 235, 0.2);

    margin: 0;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    background: var(--bg-page);
    color: var(--text-primary);
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  body.dark {
    --bg-page: #121212;
    --bg-elevated: #1e1e1e;
    --bg-input: #2a2a2a;
    --bg-button-secondary: #2a2a2a;
    --bg-button-secondary-hover: #3a3a3a;
    --text-primary: #f5f5f5;
    --text-secondary: #d1d5db;
    --text-muted: #9ca3af;
    --border: #374151;
    --border-strong: #4b5563;
    --border-focus: #60a5fa;
    --link: #60a5fa;
    --link-hover: #93c5fd;
    --link-hover-bg: #1e3a5f;
    --accent: #3b82f6;
    --accent-hover: #1d4ed8;
    --error: #f87171;
    --error-bg: #450a0a;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
    --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.55);
    --overlay: rgba(0, 0, 0, 0.65);
    --focus-ring: rgba(96, 165, 250, 0.35);
  }

  #root {
    min-height: 100vh;
  }

  body.dark {
    color-scheme: dark;
  }
`;
