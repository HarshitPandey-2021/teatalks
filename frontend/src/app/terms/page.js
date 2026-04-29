export default function Terms() {
  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #FFD6A5, #FF9AA2, #FF6EC4)", 
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

        {/* 🌟 MAIN GLASS CARD */}
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(10px)",
            borderRadius: "28px",
            padding: "50px 30px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          }}
        >

          {/* TERMS */}
          <section style={{ marginBottom: "60px", textAlign: "center" }}>
            <h1 style={{
              fontSize: "3rem",
              fontWeight: "800",
              marginBottom: "25px",
              background: "linear-gradient(90deg,#ff6ec4,#ff8c42,#ffd93d)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Terms of Use
            </h1>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.9",
              color: "#374151",
              maxWidth: "850px",
              margin: "20px auto",
            }}>
              By accessing TeaTalks, you step into a shared space shaped by trust, respect, and thoughtful interaction. The platform is designed to encourage open expression while maintaining a sense of responsibility toward the community that inhabits it.
            </p>
          </section>

          {/* COMMUNITY */}
          <section style={{ marginBottom: "60px", textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.4rem",
              fontWeight: "700",
              marginBottom: "30px",
              background: "linear-gradient(90deg,#ff6ec4,#ffb347)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Community Standards
            </h2>

            <ul style={{
              listStyle: "none",
              padding: 0,
              maxWidth: "700px",
              margin: "0 auto",
              display: "grid",
              gap: "15px",
            }}>
              {[
                "No hate speech — ensure all communication remains respectful and inclusive.",
                "No harassment — interactions must never target or intimidate others.",
                "No threats — every user deserves a safe and secure environment.",
                "No abusive language — conversations should remain constructive and mindful.",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: "16px",
                    padding: "16px 20px",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
                    fontWeight: "600",
                    color: "#374151",
                    transition: "0.3s ease",
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* MODERATION */}
          <section style={{ textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.4rem",
              fontWeight: "700",
              marginBottom: "30px",
              background: "linear-gradient(90deg,#ff6ec4,#ffb347)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Content Moderation
            </h2>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.9",
              color: "#374151",
              maxWidth: "800px",
              margin: "0 auto",
            }}>
              TeaTalks reserves the right to review and remove content that disrupts the integrity of the platform or violates community guidelines. This ensures that the space remains balanced, respectful, and meaningful for everyone involved.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}