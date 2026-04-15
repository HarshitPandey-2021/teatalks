"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section style={{
      padding: "120px 20px",
      background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FFD700)",
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Decorative Elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        fontSize: "6rem",
        opacity: 0.1,
        animation: "float 3s ease-in-out infinite"
      }}>
        ☕
      </div>
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "8%",
        fontSize: "5rem",
        opacity: 0.1,
        animation: "float 4s ease-in-out infinite"
      }}>
        💬
      </div>

      <div className="container" style={{ 
        maxWidth: "900px", 
        margin: "0 auto",
        position: "relative",
        zIndex: 2
      }}>
        
        <h2 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: "900",
          color: "white",
          marginBottom: "24px",
          lineHeight: "1.1",
          textShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          Ready to Join the Conversation?
        </h2>
        
        <p style={{
          fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
          color: "rgba(255,255,255,0.95)",
          marginBottom: "40px",
          lineHeight: "1.6",
          maxWidth: "700px",
          margin: "0 auto 40px",
          fontWeight: "500"
        }}>
          Join <strong>1,000+ students</strong> who are already sharing their campus stories anonymously
        </p>

        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <Link href="/signup">
            <button style={{
              background: "white",
              color: "#FF6EC4",
              padding: "18px 40px",
              borderRadius: "12px",
              fontWeight: "800",
              fontSize: "1.1rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            }}
            >
              Get Started Free 🚀
            </button>
          </Link>
          
          <Link href="/feed">
            <button style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "white",
              padding: "18px 40px",
              borderRadius: "12px",
              border: "2px solid rgba(255,255,255,0.4)",
              fontWeight: "700",
              fontSize: "1.1rem",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            }}
            >
              Explore Feed
            </button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div style={{
          marginTop: "50px",
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
          fontSize: "0.95rem",
          color: "rgba(255,255,255,0.9)",
          fontWeight: "600"
        }}>
          <div>✓ 100% Anonymous</div>
          <div>✓ AI Moderated</div>
          <div>✓ Campus-Only</div>
          <div>✓ Free Forever</div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}