export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Join Your Campus",
      desc: "Sign in and become a part of your college space — where conversations begin.",
    },
    {
      step: "02",
      title: "Post Anonymously",
      desc: "Share your thoughts freely, without identity holding you back.",
    },
    {
      step: "03",
      title: "Engage & Explore",
      desc: "Interact, vote, and discover voices that resonate with yours.",
    },
  ];

  return (
    <section style={{ padding: "100px 20px", background: "#FFF8F2", textAlign: "center" }}>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* HEADING */}
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "800",
          marginBottom: "10px"
        }}>
          How It Works
        </h2>

        <p style={{
          color: "#666",
          marginBottom: "60px",
          maxWidth: "600px",
          marginInline: "auto",
          lineHeight: "1.7"
        }}>
          A simple flow designed to feel natural — where expression and interaction come effortlessly.
        </p>

        {/* STEP CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "30px",
          marginBottom: "70px"
        }}>
          {steps.map((item, i) => (
            <div key={i} style={{
              background: "linear-gradient(180deg,#ffffff,#fff7ed)",
              padding: "28px 20px",
              borderRadius: "18px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.05)"
            }}>

              <div style={{
                color: "#FF8C42",
                fontWeight: "700",
                marginBottom: "10px"
              }}>
                {item.step}
              </div>

              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                marginBottom: "8px"
              }}>
                {item.title}
              </h3>

              <p style={{
                fontSize: "0.95rem",
                color: "#555",
                lineHeight: "1.6"
              }}>
                {item.desc}
              </p>

            </div>
          ))}
        </div>

        {/* FLOWCHART */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "15px"
        }}>

          {/* STEP 1 */}
          <div style={flowBox}>Join</div>

          <div style={flowLine}></div>

          {/* STEP 2 */}
          <div style={flowBox}>Post</div>

          <div style={flowLine}></div>

          {/* STEP 3 */}
          <div style={flowBox}>Engage</div>

        </div>

      </div>
    </section>
  );
}

/* FLOW STYLES */
const flowBox = {
  padding: "12px 24px",
  borderRadius: "14px",
  background: "#ffffff",
  fontWeight: "600",
  boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
};

const flowLine = {
  width: "50px",
  height: "2px",
  background: "linear-gradient(90deg,#FF8C42,#FFD700)",
};
