"use client";

import { useRef, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function TiltCard({ children, style = {} }: TiltCardProps) {
  const r = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!r.current) return;
    const b = r.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    r.current.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.025)`;
    r.current.style.boxShadow = `${-x * 24}px ${y * 24}px 60px rgba(0,0,0,.3)`;
  };

  const onLeave = () => {
    if (!r.current) return;
    r.current.style.transform = "rotateY(0) rotateX(0) scale(1)";
    r.current.style.boxShadow = "";
  };

  return (
    <div className="card-3d-wrap">
      <div
        ref={r}
        className="card-3d"
        style={{ position: "relative", ...style }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </div>
    </div>
  );
}
