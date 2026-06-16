import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem("rk_theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("rk_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("rk_theme", "light");
    }
  }, [dark]);

  return { dark, setDark };
}