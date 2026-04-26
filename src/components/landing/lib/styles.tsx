"use client";

import { C } from "./constants";

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${C.ivory}; color: ${C.charcoal}; overflow-x: hidden; }
      .fd { font-family: 'Cormorant Garamond', serif; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: ${C.copper}; }

      @keyframes shimmer   { 0%{background-position:-300% center} 100%{background-position:300% center} }
      @keyframes floatY    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
      @keyframes rotateSlow{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes rotateCCW { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
      @keyframes scanLine  { 0%{top:-10%} 100%{top:110%} }
      @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

      .shimmer-text {
        background: linear-gradient(90deg,${C.copper},${C.copperGl},#fff8f0,${C.copperGl},${C.copper});
        background-size: 300%;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
      }
      .grad-text {
        background: linear-gradient(135deg,${C.copper},${C.teal});
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .btn-primary {
        position: relative; overflow: hidden;
        background: linear-gradient(135deg,${C.copper},${C.copperLt});
        color: #fff; border: none; cursor: pointer;
        padding: 15px 40px; border-radius: 60px;
        font-family: 'Plus Jakarta Sans'; font-weight: 600;
        font-size: 13px; letter-spacing: .1em; text-transform: uppercase;
        transition: transform .25s, box-shadow .25s;
      }
      .btn-primary::after {
        content:''; position:absolute; inset:0; border-radius:60px;
        background: radial-gradient(circle at 50% 0%, rgba(255,255,255,.3), transparent 70%);
        opacity:0; transition: opacity .3s;
      }
      .btn-primary:hover { transform:translateY(-3px); box-shadow:0 18px 44px rgba(184,115,51,.45); }
      .btn-primary:hover::after { opacity:1; }

      .btn-ghost {
        position: relative; overflow: hidden;
        background: transparent; cursor: pointer;
        padding: 14px 40px; border-radius: 60px;
        font-family: 'Plus Jakarta Sans'; font-weight: 500;
        font-size: 13px; letter-spacing: .1em; text-transform: uppercase;
        border: 1.5px solid rgba(245,243,239,.35); color: ${C.ivory};
        transition: all .3s;
      }
      .btn-ghost:hover { border-color:${C.copper}; color:${C.copper}; box-shadow: inset 0 0 24px rgba(184,115,51,.12); }

      .tag-pill {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(184,115,51,.12);
        border: 1px solid rgba(184,115,51,.28);
        border-radius: 60px; padding: 7px 18px;
      }

      .card-3d-wrap { perspective: 1000px; }
      .card-3d { transition: transform .55s cubic-bezier(.23,1,.32,1), box-shadow .4s; transform-style: preserve-3d; will-change: transform; }

      /* Responsive Styles */
      @media (max-width: 1024px) {
        .btn-primary, .btn-ghost {
          padding: 12px 28px;
          font-size: 12px;
        }
      }

      @media (max-width: 768px) {
        .btn-primary, .btn-ghost {
          padding: 14px 32px;
          font-size: 12px;
          width: 100%;
          text-align: center;
        }
        .tag-pill {
          padding: 6px 14px;
        }
        .tag-pill span {
          font-size: 10px;
          letter-spacing: 0.12em;
        }
      }

      @media (max-width: 480px) {
        .btn-primary, .btn-ghost {
          padding: 12px 24px;
          font-size: 11px;
        }
        .tag-pill {
          padding: 5px 12px;
        }
      }
    `}</style>
  );
}
