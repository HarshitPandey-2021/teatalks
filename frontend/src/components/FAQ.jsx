"use client";
import { useState } from "react";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "Is it really 100% anonymous?",
      a: "Yes. We don't store your name with posts. Only your college email is verified once during signup for campus access."
    },
    {
      q: "Can I get in trouble for posting?",
      a: "Our AI moderation filters harmful content automatically. Follow community guidelines and you're completely safe."
    },
    {
      q: "Who can see my posts?",
      a: "Only verified students from your campus. No outsiders, no public access."
    },
    {
      q: "How do I join?",
      a: "Sign up with your college email. We'll send a verification link. That's it!"
    },
    {
      q: "Is TeaTalks free?",
      a: "Yes! Completely free for all students. No hidden costs, no premium tiers."
    }
  ];

  return (
    <section style={{
      padding: "100px 20px",
      background: "#fafafa"
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
          Got Questions?
        </h2>
        
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          marginBottom: "60px",
          fontSize: "1.1rem"
        }}>
          We've got answers
        </p>

        <div style={{
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              style={{
                background: "white",
                borderRadius: "16px",
                marginBottom: "16px",
                overflow: "hidden",
                border: "2px solid",
                borderColor: open === i ? "#FF6EC4" : "#e5e7eb",
                transition: "all 0.3s ease",
                boxShadow: open === i ? "0 10px 30px rgba(255,110,196,0.15)" : "none"
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "24px 28px",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  color: "#111827",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "color 0.3s"
                }}
              >
                {faq.q}
                <span style={{
                  fontSize: "1.2rem",
                  transform: open === i ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.3s ease",
                  color: open === i ? "#FF6EC4" : "#9ca3af"
                }}>
                  ▼
                </span>
              </button>
              
              <div style={{
                maxHeight: open === i ? "300px" : "0",
                overflow: "hidden",
                transition: "max-height 0.4s ease"
              }}>
                <p style={{
                  padding: "0 28px 28px",
                  color: "#6b7280",
                  lineHeight: "1.7",
                  fontSize: "1rem"
                }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}