"use client";

export default function Features() {
  const features = [
    {
      icon: "🎭",
      title: "Fully Anonymous",
      desc: "Speak freely without your name attached. Real thoughts, zero judgement.",
      color: "#FF6EC4"
    },
    {
      icon: "📚",
      title: "Professor Reviews",
      desc: "Honest reviews to help you choose the right classes and professors.",
      color: "#FFA500"
    },
    {
      icon: "🏛️",
      title: "Campus-Only Access",
      desc: "Verified with your college email. Only real students, no outsiders.",
      color: "#FFD700"
    },
    {
      icon: "🤖",
      title: "AI Moderation",
      desc: "Keep discussions respectful. Toxic content filtered automatically.",
      color: "#FF2400"
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
          Why Students Choose TeaTalks
        </h2>
        
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          marginBottom: "60px",
          fontSize: "1.1rem",
          maxWidth: "600px",
          margin: "0 auto 60px"
        }}>
          Everything you need for honest campus conversations
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "32px"
        }}>
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "36px 28px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}20`;
                e.currentTarget.style.borderColor = feature.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div style={{
                fontSize: "3rem",
                marginBottom: "20px",
                filter: "grayscale(0)",
                transition: "transform 0.3s"
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{
                fontSize: "1.4rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "12px"
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#6b7280",
                margin: 0
              }}>
                {feature.desc}
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