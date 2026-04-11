"use client";

import { useState } from "react";

export default function Testimonial() {
  const [active, setActive] = useState(null);

  const team = [
    {
      name: "Shakti Ishan",
      role: "—",
      msg: "“In the quiet absence of judgment, one discovers a rare liberty — to be entirely, and perhaps imperfectly, oneself.”",
      gradient: "linear-gradient(135deg, #ff7a9c, #2b3a67)" // soft red → deep navy
    },
    {
      name: "Somesh Pandey",
      role: "—",
      msg: "not everything needs to be understood… some things just need to be said and left behind.",
      gradient: "linear-gradient(135deg, #b8f2a1, #ffe29f)" // pastel green → soft yellow
    },
    {
      name: "Shiva Singh",
      role: "—",
      msg: "in the noise of everything, there’s a strange comfort in anonymous honesty.",
      gradient: "linear-gradient(135deg, #7ed6a5, #f8fff9)" // soft green → white tint
    },
    {
      name: "Harshit Pandey",
      role: "—",
      msg: "some thoughts aren’t meant to stay inside… they find their way out eventually.",
      gradient: "linear-gradient(135deg, #ff9bdc, #d6b4ff)" // pastel magenta → lavender
    },
  ];

  return (
    <section
      style={{
        padding: "70px 20px",
        textAlign: "center",
      }}
    >
      <h2 style={{
  fontSize: "2.3rem",
  fontWeight: "900",
  textAlign: "center",
  marginBottom: "20px",
  background: "linear-gradient(90deg,#FFA500,#FFD700,#FF6EC4)",
  WebkitBackgroundClip: "text",
  color: "transparent",
  letterSpacing: "0.6px",
  textShadow: "0 6px 20px rgba(255,182,0,0.25)"
}}>
  Behind the Tea
</h2>
      <p style={{ marginBottom: "35px", color: "#666" }}>
        the ones who let it exist
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {team.map((member, index) => (
          <div
            key={index}
            onClick={() => setActive(active === index ? null : index)}
            style={{
              width: "270px",
              height: "190px",
              borderRadius: "18px",
              cursor: "pointer",
              perspective: "1000px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "18px",
                transition: "transform 0.6s ease",
                transformStyle: "preserve-3d",
                transform:
                  active === index ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* FRONT */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  background: member.gradient,
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "18px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                  padding: "20px",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                  {member.name}
                </h3>
                <p style={{ fontSize: "13px", opacity: 0.85, marginTop: "6px" }}>
                  {member.role}
                </p>
              </div>

              {/* BACK */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "#ffffff",
                  color: "#444",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                  borderRadius: "18px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  textAlign: "center",
                }}
              >
                {member.msg}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}