"use client";
import { useState } from "react";
import Link from "next/link";

export default function TeaGame() {
  const [fill, setFill] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [hasSpilled, setHasSpilled] = useState(false);

  const spillTea = () => {
    if (hasSpilled) return;
    
    setHasSpilled(true);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 2.5;
      setFill(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setShowPopup(true), 400);
      }
    }, 20);
  };

  const reset = () => {
    setFill(0);
    setShowPopup(false);
    setHasSpilled(false);
  };

  return (
    <section style={{
      padding: "100px 20px",
      background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)",
      textAlign: "center",
      position: "relative"
    }}>
      
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <h2 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: "900",
          marginBottom: "12px",
          background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FFD700)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Ready to Spill? ☕
        </h2>
        
        <p style={{ 
          color: "#6b7280", 
          marginBottom: "50px", 
          fontSize: "1.1rem" 
        }}>
          Tap the cup to see what happens
        </p>

        <div style={{ 
          position: "relative", 
          display: "inline-block" 
        }}>
          
          {/* Cup Container */}
          <div
            onClick={spillTea}
            style={{
              width: "220px",
              height: "280px",
              background: "rgba(255,255,255,0.95)",
              border: "4px solid #e5e7eb",
              borderRadius: "24px 24px 35px 35px",
              position: "relative",
              overflow: "hidden",
              cursor: hasSpilled ? "default" : "pointer",
              boxShadow: "0 25px 50px rgba(0,0,0,0.12)",
              transition: "transform 0.2s",
              margin: "0 auto"
            }}
            onMouseEnter={(e) => {
              if (!hasSpilled) e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            
            {/* Liquid */}
            <div style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${fill}%`,
              background: "linear-gradient(180deg, #FF6EC4, #FFA500, #FFD700)",
              transition: "height 0.08s linear",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
              color: "white",
              fontSize: "14px",
              fontWeight: "700",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              {fill > 25 && (
                <span style={{ 
                  opacity: fill > 35 ? 1 : 0,
                  transition: "opacity 0.3s"
                }}>
                  confession
                </span>
              )}
              {fill > 55 && (
                <span style={{ 
                  opacity: fill > 65 ? 1 : 0,
                  transition: "opacity 0.3s"
                }}>
                  truth
                </span>
              )}
              {fill > 85 && (
                <span style={{ 
                  opacity: fill > 90 ? 1 : 0,
                  transition: "opacity 0.3s"
                }}>
                  hot take
                </span>
              )}
            </div>

            {/* Tap Hint */}
            {fill === 0 && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "16px",
                color: "#9ca3af",
                fontWeight: "700",
                animation: "pulse 2s infinite"
              }}>
                👆 Tap to spill
              </div>
            )}
            
            {/* Handle */}
            <div style={{
              position: "absolute",
              right: "-15px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "50px",
              height: "80px",
              border: "4px solid #e5e7eb",
              borderLeft: "none",
              borderRadius: "0 40px 40px 0"
            }} />
          </div>

          {/* Reset Button */}
          {hasSpilled && !showPopup && (
            <button
              onClick={reset}
              style={{
                marginTop: "30px",
                padding: "10px 24px",
                background: "white",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#6b7280",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FF6EC4";
                e.currentTarget.style.color = "#FF6EC4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              Spill Again
            </button>
          )}

          {/* Popup Modal */}
          {showPopup && (
            <div 
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                animation: "fadeIn 0.3s ease",
                padding: "20px"
              }}
              onClick={() => {
                setShowPopup(false);
                reset();
              }}
            >
              <div 
                style={{
                  background: "white",
                  padding: "50px 40px",
                  borderRadius: "24px",
                  maxWidth: "450px",
                  width: "100%",
                  textAlign: "center",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
                  animation: "scaleIn 0.4s ease"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  fontSize: "4rem",
                  marginBottom: "20px"
                }}>
                  ☕
                </div>
                
                <h3 style={{ 
                  fontSize: "2rem", 
                  marginBottom: "16px",
                  fontWeight: "800",
                  color: "#111827"
                }}>
                  That's the vibe!
                </h3>
                
                <p style={{ 
                  color: "#6b7280", 
                  marginBottom: "32px",
                  fontSize: "1.1rem",
                  lineHeight: "1.6"
                }}>
                  Join TeaTalks to share your thoughts anonymously with your campus community
                </p>
                
                <div style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>
                  <Link href="/signup">
                    <button style={{
                      background: "linear-gradient(135deg, #FF6EC4, #FFA500)",
                      color: "white",
                      padding: "14px 28px",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "1rem",
                      cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(255,110,196,0.3)",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      Sign Up Now
                    </button>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      reset();
                    }}
                    style={{
                      background: "white",
                      color: "#6b7280",
                      padding: "14px 28px",
                      borderRadius: "10px",
                      border: "2px solid #e5e7eb",
                      fontWeight: "600",
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#FF6EC4";
                      e.currentTarget.style.color = "#FF6EC4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.color = "#6b7280";
                    }}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}