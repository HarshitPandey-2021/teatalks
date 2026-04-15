"use client";
export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Verify Your Email",
      desc: "Sign up with your college email to join your campus community",
      icon: "✉️"
    },
    {
      number: "2",
      title: "Post Anonymously",
      desc: "Share thoughts, review professors, or start discussions without revealing your identity",
      icon: "🎭"
    },
    {
      number: "3",
      title: "Engage & Vote",
      desc: "Upvote, comment, and let the best conversations rise to the top",
      icon: "💬"
    }
  ];

  return (
    <section id="how-it-works" style={{
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
          How It Works
        </h2>
        
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          marginBottom: "70px",
          fontSize: "1.1rem",
          maxWidth: "600px",
          margin: "0 auto 70px"
        }}>
          Get started in three simple steps
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          position: "relative"
        }}>
          
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                position: "relative",
                animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both`
              }}
            >
              {/* Connector Line (desktop only) */}
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute",
                  top: "50px",
                  left: "calc(50% + 60px)",
                  width: "calc(100% - 120px)",
                  height: "3px",
                  background: "linear-gradient(90deg, #FF6EC4, #FFD700)",
                  opacity: 0.3,
                  display: window.innerWidth < 768 ? "none" : "block"
                }} />
              )}
              
              {/* Step Number Circle */}
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6EC4, #FFA500)",
                color: "white",
                fontSize: "2.5rem",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 15px 35px rgba(255,110,196,0.3)",
                position: "relative",
                zIndex: 2
              }}>
                {step.icon}
              </div>
              
              <h3 style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "12px"
              }}>
                {step.title}
              </h3>
              
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#6b7280",
                maxWidth: "300px",
                margin: "0 auto"
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}