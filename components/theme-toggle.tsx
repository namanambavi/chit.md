"use client";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("chit-theme", theme);
}

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  return <button className="icon-button" type="button" aria-label="Toggle color theme" title="Toggle color theme" onClick={toggle}>
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 16V5a7 7 0 0 1 0 14Z"/></svg>
  </button>;
}
