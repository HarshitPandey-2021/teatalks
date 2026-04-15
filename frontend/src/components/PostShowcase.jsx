"use client";

export default function PostShowcase() {
  const examples = [
    {
      text: "Anyone else think the library WiFi is secretly a social experiment to test our patience? 📚💀",
      votes: 127,
      comments: 34,
      category: "Campus Life"
    },
    {
      text: "Prof. Sharma's 8 AM lectures hit different when you're running on 3 hours of sleep ngl",
      votes: 89,
      comments: 12,
      category: "Professor Review"
    },
    {
      text: "Hostel mess served something unidentifiable today. We survived though. 🍽️",
      votes: 201,
      comments: 56,
      category: "Confession"
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
          Real Campus Conversations
        </h2>
        
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          marginBottom: "60px",
          fontSize: "1.1rem",
          maxWidth: "600px",
          margin: "0 auto 60px"
        }}>
          See what students are actually talking about
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "700px",
          margin: "0 auto"
        }}>
          {examples.map((post, i) => (
            <div 
              key={i} 
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "28px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Category Badge */}
              <div style={{
                display: "inline-block",
                background: "linear-gradient(135deg, rgba(255,110,196,0.1), rgba(255,215,0,0.1))",
                color: "#FF6EC4",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "16px"
              }}>
                {post.category}
              </div>
              
              <p style={{
                fontSize: "1.1rem",
                color: "#111827",
                marginBottom: "20px",
                lineHeight: "1.7",
                fontWeight: "500"
              }}>
                {post.text}
              </p>
              
              <div style={{
                display: "flex",
                gap: "24px",
                fontSize: "0.9rem",
                color: "#6b7280",
                fontWeight: "600"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  👍 {post.votes}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  💬 {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <a 
            href="/feed"
            style={{
              color: "#FF6EC4",
              fontSize: "1.1rem",
              fontWeight: "600",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "gap 0.3s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.gap = "12px"}
            onMouseLeave={(e) => e.currentTarget.style.gap = "8px"}
          >
            Explore More Posts →
          </a>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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