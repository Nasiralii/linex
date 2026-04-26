"use client";

import { useEffect, useRef } from "react";
import { C } from "../lib/constants";

export function MagneticCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.left = e.clientX + "px";
        dot.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", onMove);
    let raf: number;
    const animate = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.1;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.1;
      if (ring.current) {
        ring.current.style.left = ringPos.current.x + "px";
        ring.current.style.top = ringPos.current.y + "px";
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: C.copper,
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%,-50%)",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ring}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `1.5px solid ${C.copper}`,
          pointerEvents: "none",
          zIndex: 9998,
          transform: "translate(-50%,-50%)",
          opacity: 0.5,
          transition: "width .2s, height .2s, opacity .2s",
        }}
      />
    </>
  );
}
