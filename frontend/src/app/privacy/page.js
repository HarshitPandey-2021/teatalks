export default function Privacy() {
  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #FFD700, #FFB347, #FFF3B0)", // GOLD → ORANGE → SOFT YELLOW
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      <div
        className="page"
        style={{
          maxWidth: "1100px",
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
            borderRadius: "26px",
            padding: "50px 30px",
            boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
          }}
        >

          {/* PRIVACY POLICY */}
          <section style={{ marginBottom: "50px", textAlign: "center" }}>
            <h1 style={{
              fontSize: "2.8rem",
              fontWeight: "800",
              marginBottom: "25px",
              background: "linear-gradient(90deg,#ff8c42,#ffb347,#ffd700)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Privacy Policy
            </h1>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.85",
              maxWidth: "800px",
              margin: "20px auto",
              color: "#374151"
            }}>
              At TeaTalks, privacy is not treated as a feature — it is a foundation. Every interaction on the platform is designed with the intent to protect, respect, and preserve the individuality of its users. Your thoughts remain yours, your identity stays protected, and your presence is never exposed without your control.
            </p>
          </section>

          {/* INFORMATION */}
          <section style={{ marginBottom: "50px", textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.3rem",
              fontWeight: "700",
              marginBottom: "20px",
              background: "linear-gradient(90deg,#ff8c42,#ffd700)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Information We Collect
            </h2>

            <ul style={{
              listStyle: "none",
              padding: 0,
              maxWidth: "600px",
              margin: "0 auto",
              fontSize: "1.1rem",
              color: "#374151",
            }}>
              {[
                "Email for authentication",
                "University name"
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    borderRadius: "14px",
                    padding: "15px 20px",
                    marginBottom: "12px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                    transition: "0.3s ease",
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* ANONYMOUS */}
          <section style={{ marginBottom: "50px", textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.3rem",
              fontWeight: "700",
              marginBottom: "20px",
              background: "linear-gradient(90deg,#ff8c42,#ffd700)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Anonymous Posting
            </h2>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.85",
              maxWidth: "750px",
              margin: "0 auto",
              color: "#374151"
            }}>
              All posts on TeaTalks are presented without identity. This ensures that expression remains uninfluenced by perception, allowing users to speak freely, reflect honestly, and share experiences without hesitation or external pressure.
            </p>
          </section>

          {/* DATA */}
          <section style={{ textAlign: "center" }}>
            <h2 style={{
              fontSize: "2.3rem",
              fontWeight: "700",
              marginBottom: "20px",
              background: "linear-gradient(90deg,#ff8c42,#ffd700)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Data Protection
            </h2>

            <p style={{
              fontSize: "1.15rem",
              lineHeight: "1.85",
              maxWidth: "750px",
              margin: "0 auto",
              color: "#374151"
            }}>
              TeaTalks does not sell, distribute, or disclose user data to third parties. Every measure is taken to ensure your information remains secure, encrypted, and handled with the highest level of responsibility and care.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}