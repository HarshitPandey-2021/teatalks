"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <section style={{
      padding: "120px 20px 100px",
      textAlign: "center",
      background: "linear-gradient(180deg, #fffbf5 0%, #ffffff 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Decorative background elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        right: "10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(255,110,196,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "5%",
        width: "250px",
        height: "250px",
        background: "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />

      <div className="container" style={{ 
        maxWidth: "1200px", 
        margin: "0 auto",
        position: "relative",
        zIndex: 2
      }}>
        
        {/* Badge */}
        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #fff0f5, #fffbf0)",
          border: "1px solid rgba(255,110,196,0.3)",
          color: "#FF6EC4",
          padding: "8px 20px",
          borderRadius: "25px",
          fontSize: "0.875rem",
          fontWeight: "600",
          marginBottom: "30px",
          boxShadow: "0 4px 15px rgba(255,110,196,0.1)"
        }}>
          🎓 Anonymous. Safe. Campus-Only.
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
          fontWeight: "900",
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
          color: "#111827",
          marginBottom: "24px"
        }}>
          Your Campus.{" "}
          <span style={{
            background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block"
          }}>
            Your Voice.
          </span>
          <br />
          Zero Judgement.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          lineHeight: "1.6",
          color: "#6b7280",
          maxWidth: "700px",
          margin: "0 auto 40px",
          fontWeight: "400"
        }}>
          Anonymous discussions, professor reviews, and real campus stories.<br />
          AI-moderated. Verified by college email.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "60px"
        }}>
          <Link href="/signup">
            <button style={{
              background: "linear-gradient(135deg, #FF6EC4, #FFA500)",
              color: "white",
              padding: "16px 32px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 8px 20px rgba(255,110,196,0.3)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,110,196,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,110,196,0.3)";
            }}
            >
              Spill the Tea ☕
            </button>
          </Link>
          
          <button 
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              background: "white",
              color: "#111827",
              padding: "16px 32px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FF6EC4";
              e.currentTarget.style.color = "#FF6EC4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#111827";
            }}
          >
            See How It Works →
          </button>
        </div>

        {/* Visual Element */}
        <div style={{
          position: "relative",
          maxWidth: "900px",
          margin: "0 auto",
          background: "linear-gradient(135deg, rgba(255,110,196,0.05), rgba(255,215,0,0.05))",
          borderRadius: "24px",
          padding: "40px",
          border: "1px solid rgba(255,110,196,0.2)"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
            textAlign: "left"
          }}>
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                background: "linear-gradient(135deg, #FF6EC4, #FFA500)" 
              }} />
              <div>
                <div style={{ fontWeight: "700", color: "#111" }}>Anonymous Student</div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>2 hours ago</div>
              </div>
            </div>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#374151", 
              lineHeight: "1.7",
              margin: "0"
            }}>
              "Anyone else think the library WiFi is secretly a social experiment to test our patience? 📚💀"
            </p>
            <div style={{
              marginTop: "20px",
              display: "flex",
              gap: "20px",
              fontSize: "0.9rem",
              color: "#6b7280"
            }}>
              <span>👍 127 upvotes</span>
              <span>💬 34 comments</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}