

export default function Privacy() {
  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #FFE5B4, #FFD580, #FFB3D9)", // pastel orange → yellow → magenta
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
          color: "#1a1a1a",
        }}
      >

        <div className="mascot-bg"></div>

        {/* PRIVACY POLICY */}
        <section className="section" style={{ marginBottom: "50px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "2.8rem",
            fontWeight: "800",
            color: "#333",
            marginBottom: "25px",
            textShadow: "1px 1px 6px rgba(0,0,0,0.1)"
          }}>
            Privacy Policy
          </h1>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.8",
            maxWidth: "800px",
            margin: "20px auto",
            color: "#222"
          }}>
            At TeaTalks, protecting student privacy is our highest priority. We ensure your
            interactions, thoughts, and personal data remain secure, confidential, and
            entirely under your control.
          </p>
        </section>

        {/* INFORMATION WE COLLECT */}
        <section className="section" style={{ marginBottom: "50px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.4rem",
            fontWeight: "700",
            color: "#333",
            marginBottom: "20px",
            textShadow: "1px 1px 5px rgba(0,0,0,0.1)"
          }}>
            Information We Collect
          </h2>

          <ul style={{
            listStyle: "none",
            padding: 0,
            maxWidth: "600px",
            margin: "0 auto",
            fontSize: "1.1rem",
            color: "#222",
          }}>
            <li style={{
              background: "rgba(255,255,255,0.4)",
              borderRadius: "12px",
              padding: "15px 20px",
              marginBottom: "10px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
            }}>
              Email for authentication
            </li>
            <li style={{
              background: "rgba(255,255,255,0.4)",
              borderRadius: "12px",
              padding: "15px 20px",
              marginBottom: "10px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
            }}>
              University name
            </li>
          </ul>
        </section>

        {/* ANONYMOUS POSTING */}
        <section className="section" style={{ marginBottom: "50px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.4rem",
            fontWeight: "700",
            color: "#333",
            marginBottom: "20px",
            textShadow: "1px 1px 5px rgba(0,0,0,0.1)"
          }}>
            Anonymous Posting
          </h2>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.8",
            maxWidth: "750px",
            margin: "0 auto",
            color: "#222"
          }}>
            All posts on TeaTalks appear anonymously. Your identity is never revealed publicly,
            ensuring complete freedom to express opinions and share experiences without concern.
          </p>
        </section>

        {/* DATA PROTECTION */}
        <section className="section" style={{ marginBottom: "50px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.4rem",
            fontWeight: "700",
            color: "#333",
            marginBottom: "20px",
            textShadow: "1px 1px 5px rgba(0,0,0,0.1)"
          }}>
            Data Protection
          </h2>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.8",
            maxWidth: "750px",
            margin: "0 auto",
            color: "#222"
          }}>
            TeaTalks never sells, shares, or distributes user data to third parties.
            Our platform adheres to strict privacy standards, keeping your information safe,
            secure, and confidential at all times.
          </p>
        </section>

      </div>

      
    </main>
  );
}