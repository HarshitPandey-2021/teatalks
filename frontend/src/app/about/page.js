'use client'

import { useEffect } from 'react'

export default function About() {
  useEffect(() => {
    document.title = "About | TeaTalks"
  }, [])

  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #FFA500, #FF6EC4, #FF2400)",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >

      <div
        className="page"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 20px",
        }}
      >

        <div className="mascot-bg"></div>

        {/* 🌟 MAIN OPAQUE CARD */}
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(10px)",
            borderRadius: "28px",
            padding: "50px 30px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          }}
        >

          {/* ABOUT */}
          <section style={{ marginBottom: "60px", textAlign: "center" }}>
            <h1 style={{
              fontSize: "3rem",
              fontWeight: "800",
              marginBottom: "25px",
              background: "linear-gradient(90deg,#ff6ec4,#ff8c42,#ffd93d)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              About TeaTalks
            </h1>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.9",
              color: "#374151",
              maxWidth: "850px",
              margin: "20px auto",
            }}>
              TeaTalks is a thoughtfully curated, anonymous digital sanctuary for university students — a space where expression is not filtered by identity, and conversations unfold in their most honest form. Within the everyday rhythm of campus life, countless thoughts remain unspoken; here, they finally find a place to exist.
            </p>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.9",
              color: "#374151",
              maxWidth: "850px",
              margin: "20px auto",
            }}>
              From academic dilemmas and career uncertainties to hostel anecdotes and quiet late-night reflections, TeaTalks captures the essence of student life — raw, unpolished, and deeply human.
            </p>
          </section>

          {/* WHY */}
          <section style={{ marginBottom: "60px", textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "30px",
              background: "linear-gradient(90deg,#ff6ec4,#ffb347)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Why We Created TeaTalks
            </h2>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.9",
              color: "#374151",
              maxWidth: "800px",
              margin: "15px auto",
            }}>
              Most platforms today are shaped around visibility and identity, which often restrains authenticity. Students hesitate — not because they lack thoughts, but because expression feels tied to perception.
            </p>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.9",
              color: "#374151",
              maxWidth: "800px",
              margin: "15px auto",
            }}>
              TeaTalks gently removes that barrier, allowing conversations to exist without labels — where honesty matters more than recognition, and voices are valued simply for being real.
            </p>
          </section>

          {/* TEAM */}
          <section style={{ textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "30px",
              background: "linear-gradient(90deg,#ff6ec4,#ffb347)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              The Team Behind TeaTalks
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "25px",
              maxWidth: "1000px",
              margin: "0 auto",
            }}>

              {/* SHAKTI */}
              <div style={{
                background: "linear-gradient(135deg,#ff9a44,#ff6ec4)",
                borderRadius: "24px",
                padding: "30px 20px",
                boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
                color: "#fff",
                textAlign: "center",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "8px" }}>Shakti Ishan</h3>
                <p style={{ fontSize: "0.95rem", fontWeight: "600", opacity: 0.9 }}>Frontend Developer</p>
              </div>

              {/* HARSHIT */}
              <div style={{
                background: "linear-gradient(135deg,#ff6ec4,#ffa500)",
                borderRadius: "24px",
                padding: "30px 20px",
                boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
                color: "#fff",
                textAlign: "center",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "8px" }}>Harshit Pandey</h3>
                <p style={{ fontSize: "0.95rem", fontWeight: "600", opacity: 0.9 }}>Frontend Developer</p>
              </div>

              {/* SHIVA */}
              <div style={{
                background: "linear-gradient(135deg,#ffa500,#ff2400)",
                borderRadius: "24px",
                padding: "30px 20px",
                boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
                color: "#fff",
                textAlign: "center",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "8px" }}>Shiva Singh</h3>
                <p style={{ fontSize: "0.95rem", fontWeight: "600", opacity: 0.9 }}>Database & AI</p>
              </div>

              {/* SOMESH */}
              <div style={{
                background: "linear-gradient(135deg,#ff6ec4,#ff2400)",
                borderRadius: "24px",
                padding: "30px 20px",
                boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
                color: "#fff",
                textAlign: "center",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "8px" }}>Somesh Pandey</h3>
                <p style={{ fontSize: "0.95rem", fontWeight: "600", opacity: 0.9 }}>Backend Developer</p>
              </div>

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}