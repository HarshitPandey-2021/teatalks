"use client";

import { useState } from "react";

export default function SpillMode() {
  const [fill, setFill] = useState(0);
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);

  const handleTap = () => {
    if (locked) return;

    setStarted(true);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 1.3; // slower for ~2.5 sec

      if (progress >= 80) {
        clearInterval(interval);
        setFill(80);
        setTimeout(() => setLocked(true), 200);
      } else {
        setFill(progress);
      }
    }, 30);
  };

  return (
    <section style={{ padding: "90px 20px", textAlign: "center" }}>
      <h2 style={{
  fontSize: "2.3rem",
  fontWeight: "900",
  textAlign: "center",
  marginBottom: "20px",
  background: "linear-gradient(90deg,#FF6EC4,#FFA500,#FFD700)",
  WebkitBackgroundClip: "text",
  color: "transparent",
  letterSpacing: "0.6px",
  textShadow: "0 6px 20px rgba(255,165,0,0.25)"
}}>
  Spill Mode
</h2>
      <p style={{ color: "#777", marginBottom: "25px" }}>
        tap gently…
      </p>

      <div style={{ position: "relative", display: "inline-block" }}>

        {/* CUP */}
        <div
          onClick={handleTap}
          style={{
            width: "220px",
            height: "280px",
            margin: "0 auto",
            borderRadius: "22px 22px 35px 35px",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            filter: locked ? "blur(10px)" : "none",
            transition: "0.4s ease",
            background: "rgba(255,255,255,0.5)",
          }}
          className="cup-glow"
        >

          {/* LIQUID */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${fill}%`,
              background:
                "linear-gradient(180deg,#ff6ec4,#ffb347,#ffd93d)",
              transition: "height 0.25s ease",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              overflow: "hidden",
            }}
          >

            {started && (
              <>
                <span style={wordStyle(20)}>confession</span>
                <span style={wordStyle(45)}>truth</span>
                <span style={wordStyle(65)}>late night thought</span>
              </>
            )}
          </div>

          {!started && (
            <div className="tap-text">
              tap to spill ☕
            </div>
          )}
        </div>

        {/* POPUP */}
        {locked && (
          <div className="spill-popup-wrapper">
            <div className="spill-popup">

              <p className="spill-text">
                some thoughts deserve a quieter corner…  
                <br />
                a place where they’re heard, not judged ☕
              </p>

              <div className="spill-actions">
                <button className="btn-outline">Log In</button>
                <button className="btn-primary">Sign Up</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* FLOATING WORD STYLE */
function wordStyle(bottom) {
  return {
    position: "absolute",
    bottom: `${bottom}%`,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "12px",
    color: "rgba(255,255,255,0.75)",
    filter: "blur(1px)",
    animation: "float 4s infinite ease-in-out",
    whiteSpace: "nowrap",
  };
}