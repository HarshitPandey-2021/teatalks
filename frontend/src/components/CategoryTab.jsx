"use client";

import { useState } from "react";

export default function CategoryTabs() {
  const [active, setActive] = useState("All");

  const categories = [
    "All",
    "Academics",
    "Hostel",
    "Gossip",
    "Confessions",
    "Prof Reviews"
  ];

  return (
    <div
      className="tabs"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center",
        margin: "20px 0",
        padding: "8px",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)", // frosted glass effect
      }}
    >
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => setActive(c)}
          style={{
            padding: "10px 22px",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            color: active === c ? "#fff" : "#222",
            background: active === c 
              ? "linear-gradient(135deg, #ff6ec4, #ffb347)" // active gradient
              : "rgba(255,255,255,0.1)", // inactive subtle
            boxShadow: active === c 
              ? "0 6px 18px rgba(255,110,196,0.4)" 
              : "none",
            transition: "all 0.3s ease",
            transform: active === c ? "scale(1.05)" : "scale(1)"
          }}
          onMouseEnter={(e) => {
            if(active !== c) e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            if(active !== c) e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}