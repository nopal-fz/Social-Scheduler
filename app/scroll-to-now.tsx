"use client";

import { useEffect } from "react";

const ROW_HEIGHT = 44;

export function GridScroll({ top }: { top: number | null }) {
  useEffect(() => {
    const body = document.getElementById("grid-body");
    if (!body) {
      return;
    }

    const measure = () => {
      const scrollbar = Math.max(0, body.offsetWidth - body.clientWidth);
      document.documentElement.style.setProperty("--sbw", `${scrollbar}px`);
    };

    measure();
    window.addEventListener("resize", measure);

    // Other weeks and off-hours open at 08:00, matching the prototype.
    const target =
      top === null ? 4 * ROW_HEIGHT : Math.max(0, top - body.clientHeight * 0.55);
    body.scrollTop = Math.floor(target / ROW_HEIGHT) * ROW_HEIGHT;

    return () => window.removeEventListener("resize", measure);
  }, [top]);

  return null;
}
