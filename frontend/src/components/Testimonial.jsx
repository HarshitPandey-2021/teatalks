"use client";
import { useState } from "react";

export default function Testimonial() {
  const [flipped, setFlipped] = useState(null);

  const team = [
    {
      name: "Shakti Ishan",
      role: "Creator",
      quote: "In the quiet absence of judgment, one discovers a rare liberty — to be entirely, and perhaps imperfectly, oneself.",
      gradient: "linear-gradient(135deg, #FF6EC4, #FFA500)"
    },
    {
      name: "Somesh Pandey",
      role: "Designer",
      quote: "Not everything needs to be understood… some things just need to be said and left behind.",
      gradient: "linear-gradient(135deg, #FFA500, #FFD700)"
    },
    {
      name: "Shiva Singh",
      role: "Developer",
      quote: "In the noise of everything, there's a strange comfort in anonymous honesty.",
      gradient: "linear-gradient(135deg, #FFD700, #FF6EC4)"
    },
    {
      name: "Harshit Pandey",
      role: "Engineer",
      quote: "Some thoughts aren't meant to stay inside… they find their way out eventually.",
      gradient: "linear-gradient(135deg, #FF2400, #FFA500)"
    }
  ];

  return (
    <section style={{
      padding: "100px 20px",
      background: "white"
    }}>
      
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <h2 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: "900",
          textAlign: "center",
          marginBottom: "16px",
          background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FFD700)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Behind the Tea ☕
        </h2>
        
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          marginBottom: "60px",
          fontSize: "1.1rem"
        }}>
          The humans who made this possible
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "28px"
        }}>
          {team.map((member, i) => (
            <div
              key={i}
              onClick={() => setFlipped(flipped === i ? null : i)}
              style={{
                height: "300px",
                perspective: "1000px",
                cursor: "pointer"
              }}
            >
              <div style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transition: "transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)",
                transformStyle: "preserve-3d",
                transform: flipped === i ? "rotateY(180deg)" : "rotateY(0)"
              }}>
                
                {/* FRONT */}
                <div style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  background: member.gradient,
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                  padding: "30px"
                }}>
                  <h3 style={{ 
                    fontSize: "1.6rem", 
                    fontWeight: "800",
                    marginBottom: "8px",
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                  }}>
                    {member.name}
                  </h3>
                  <p style={{ 
                    fontSize: "1rem", 
                    opacity: 0.95,
                    fontWeight: "500"
                  }}>
                    {member.role}
                  </p>
                  <p style={{
                    fontSize: "0.85rem",
                    marginTop: "20px",
                    opacity: 0.8,
                    fontWeight: "600"
                  }}>
                    👆 Click to flip
                  </p>
                </div>

                {/* BACK */}
                <div style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "white",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "35px",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                  border: "2px solid #e5e7eb"
                }}>
                  <p style={{
                    fontSize: "1rem",
                    lineHeight: "1.7",
                    color: "#374151",
                    fontStyle: "italic",
                    textAlign: "center",
                    fontWeight: "500"
                  }}>
                    "{member.quote}"
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}