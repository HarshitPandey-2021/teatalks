

export default function Terms() {
  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #FFB84D, #FF8FC4, #FF5733)", // lighter pastel gradient
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
          color: "#1a1a1a",
        }}
      >

        <div className="mascot-bg"></div>

        {/* TERMS OF USE */}
        <section className="section" style={{ marginBottom: "60px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "3rem",
            fontWeight: "800",
            color: "#FFF8F0",
            marginBottom: "25px",
            textShadow: "2px 2px 12px rgba(0,0,0,0.2)"
          }}>
            Terms of Use
          </h1>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.9",
            color: "#222",
            maxWidth: "850px",
            margin: "20px auto",
          }}>
            By accessing or using TeaTalks, you agree to engage respectfully and responsibly. 
            Our platform is designed to foster thoughtful discussion, safe exploration, and the 
            free exchange of ideas within our student community.
          </p>
        </section>

        {/* COMMUNITY STANDARDS */}
        <section className="section" style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#FFF8F0",
            marginBottom: "30px",
            textShadow: "1px 1px 8px rgba(0,0,0,0.2)"
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
            <li style={{
              background: "rgba(255,255,255,0.4)",
              borderRadius: "15px",
              padding: "15px 20px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              fontWeight: "600",
              color: "#222"
            }}>No hate speech – ensure all communication is respectful and inclusive.</li>
            <li style={{
              background: "rgba(255,255,255,0.4)",
              borderRadius: "15px",
              padding: "15px 20px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              fontWeight: "600",
              color: "#222"
            }}>No harassment – do not target or intimidate any member.</li>
            <li style={{
              background: "rgba(255,255,255,0.4)",
              borderRadius: "15px",
              padding: "15px 20px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              fontWeight: "600",
              color: "#222"
            }}>No threats – all users must feel safe while engaging on the platform.</li>
            <li style={{
              background: "rgba(255,255,255,0.4)",
              borderRadius: "15px",
              padding: "15px 20px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              fontWeight: "600",
              color: "#222"
            }}>No abusive language – maintain constructive and courteous conversations.</li>
          </ul>
        </section>

        {/* CONTENT MODERATION */}
        <section className="section" style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#FFF8F0",
            marginBottom: "30px",
            textShadow: "1px 1px 8px rgba(0,0,0,0.2)"
          }}>
            Content Moderation
          </h2>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.9",
            color: "#222",
            maxWidth: "800px",
            margin: "0 auto",
          }}>
            TeaTalks reserves the right to remove content that violates our community standards 
            or poses harm to the community. Accounts found in violation of the rules may be 
            suspended to maintain a safe, inclusive, and respectful environment for all users.
          </p>
        </section>

      </div>

     

    </main>
  );
}