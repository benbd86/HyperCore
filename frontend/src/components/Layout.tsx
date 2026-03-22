import styled from "styled-components";
import { useState, useEffect } from "react";

const Wrapper = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
  color: var(--text-primary);
`;

const ThemeBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const ThemeButton = styled.button`
  padding: 6px 14px;
  font-size: 0.875rem;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  cursor: pointer;
  box-shadow: var(--shadow);
  &:hover {
    background: var(--bg-button-secondary);
    color: var(--text-primary);
  }
`;

/** App shell: syncs `body.dark` from localStorage and provides theme toggle on every route. */
export function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Wrapper>
      <ThemeBar>
        <ThemeButton
          type="button"
          onClick={() => setDarkMode((d) => !d)}
          aria-pressed={darkMode}
          aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </ThemeButton>
      </ThemeBar>
      {children}
    </Wrapper>
  );
}
