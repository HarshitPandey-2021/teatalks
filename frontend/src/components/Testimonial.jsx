"use client";

import { useState } from "react";
import Image from "next/image";

export default function Testimonial() {
  const [active, setActive] = useState(null);

  const team = [
    {
      name: "Shakti Ishan",
      role: "Brewmaster",
      msg: "In the quiet absence of judgment, one discovers a rare liberty.",
      img: "/avatar1.png",
      gradient: "linear-gradient(135deg, #ff7a9c, #ffb347)",
    },
    {
      name: "Somesh Pandey",
      role: "Brewmaster",
      msg: "Not everything needs to be understood… some things need to be said.",
      img: "/avatar2.jpg",
      gradient: "linear-gradient(135deg, #f6d365, #fda085)",
    },
    {
      name: "Shiva Singh",
      role: "Brewmaster",
      msg: "There’s comfort in anonymous honesty.",
      img: "/avatar3.png",
      gradient: "linear-gradient(135deg, #84fab0, #8fd3f4)",
    },
    {
      name: "Harshit Pandey",
      role: "Brewmaster",
      msg: "Some thoughts find their way out eventually.",
      img: "/avatar4.jpg",
      gradient: "linear-gradient(135deg, #fccb90, #d57eeb)",
    },
  ];

  return (
    <section style={{ padding: "90px 20px", textAlign: "center", background: "#F5EDE5" }}>

      <h2 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "10px" }}>
        Meet the Brewmasters
      </h2>

      <p style={{ color: "#666", marginBottom: "40px" }}>
        Tap a card to reveal thoughts ☕
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "25px",
        justifyItems: "center",
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        {team.map((member, index) => (
          <div
            key={index}
            onClick={() => setActive(active === index ? null : index)}
            style={{ width: "260px", height: "180px", perspective: "1000px" }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              transformStyle: "preserve-3d",
              transition: "transform 0.6s",
              transform: active === index ? "rotateY(180deg)" : "rotateY(0deg)"
            }}>

              {/* FRONT */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "16px",
                background: member.gradient,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backfaceVisibility: "hidden"
              }}>
                <Image src={member.img} alt="" width={50} height={50} style={{ borderRadius: "50%" }} />
                <h3>{member.name}</h3>
                <p style={{ fontSize: "12px" }}>{member.role}</p>
              </div>

              {/* BACK */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "16px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "15px",
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                textAlign: "center"
              }}>
                {member.msg}
              </div>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
