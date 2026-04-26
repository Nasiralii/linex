"use client";

import { motion } from "framer-motion";
import { C } from "../lib/constants";

export function Marquee() {
  const items = [
    "Verified Professionals",
    "مقاولون مؤهَّلون",
    "Transparent Comparison",
    "مقارنة شفافة",
    "Built for Saudi Arabia",
    "من الطرح إلى التعميد",
    "Four-Tier Trust System",
    "نظام طبقات الثقة",
    "Post. Compare. Decide.",
    "اطرح. قارن. اختر.",
  ];

  return (
    <div
      style={{
        background: `linear-gradient(135deg,${C.copper},${C.copperLt})`,
        padding: "18px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* shine */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-20%",
          width: "40%",
          height: "100%",
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)",
          animation: "scanLine 4s linear infinite",
          transform: "skewX(-20deg)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            style={{
              color: "rgba(255,255,255,.9)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              padding: "0 20px",
              borderRight: "1px solid rgba(255,255,255,.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            className="marquee-item"
          >
            <style>{`
              @media (min-width: 768px) {
                .marquee-item { font-size: 12px !important; letter-spacing: .15em !important; padding: 0 28px !important; gap: 10px !important; }
              }
            `}</style>
            <span style={{ color: "rgba(255,255,255,.4)", fontSize: 8 }}>◆</span> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
