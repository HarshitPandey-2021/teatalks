

export default function About() {
  return (
    <main
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(160deg, #FFA500, #FF6EC4, #FF2400)", // Orange → Magenta → Scarlet
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

        {/* ABOUT TEATALKS */}
        <section className="section" style={{ marginBottom: "60px", textAlign: "center" }}>
          <h1 style={{
            fontSize: "3rem",
            fontWeight: "800",
            color: "#FFF8F0",
            marginBottom: "25px",
            textShadow: "2px 2px 12px rgba(0,0,0,0.2)"
          }}>
            About TeaTalks
          </h1>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.9",
            color: "#222",
            maxWidth: "850px",
            margin: "20px auto",
          }}>
            TeaTalks is a thoughtfully curated, anonymous digital sanctuary for university students.
            Here, individuals can explore, express, and connect freely. Our platform empowers students
            to share reflections, discuss campus life, and engage in conversations without fear of judgment
            or social constraints.
          </p>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.9",
            color: "#222",
            maxWidth: "850px",
            margin: "20px auto",
          }}>
            From academic pursuits and career dilemmas to hostel anecdotes and late-night contemplations,
            TeaTalks preserves the genuine essence of student life, turning every voice into a meaningful narrative.
          </p>
        </section>

        {/* WHY WE CREATED TEATALKS */}
        <section className="section" style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#FFF8F0",
            marginBottom: "30px",
            textShadow: "1px 1px 8px rgba(0,0,0,0.2)"
          }}>
            Why We Created TeaTalks
          </h2>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.9",
            color: "#222",
            maxWidth: "800px",
            margin: "15px auto",
          }}>
            Most social platforms tie interactions to real-world identities, which can limit honesty.
            Students may hesitate to share their true thoughts, ideas, or vulnerabilities.
          </p>

          <p style={{
            fontSize: "1.15rem",
            lineHeight: "1.9",
            color: "#222",
            maxWidth: "800px",
            margin: "15px auto",
          }}>
            TeaTalks was created to provide a safe, empowering space where ideas and authenticity
            matter more than labels. Students can laugh, debate, learn, and share openly while remaining anonymous.
          </p>
        </section>

        {/* TEAM SECTION */}
        <section className="section" style={{ marginBottom: "60px", textAlign: "center" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#FFF8F0",
            marginBottom: "30px",
            textShadow: "1px 1px 8px rgba(0,0,0,0.2)"
          }}>
            The Team Behind TeaTalks
          </h2>

          <ul style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "25px",
            justifyItems: "center",
            maxWidth: "900px",
            margin: "0 auto",
          }}>
            <li style={{
              background: "linear-gradient(135deg, #FFA500, #FF6EC4)",
              borderRadius: "20px",
              padding: "25px",
              width: "100%",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              color: "#fff",
              fontWeight: "700",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}>Shakti — Role</li>
            <li style={{
              background: "linear-gradient(135deg, #FF6EC4, #FF2400)",
              borderRadius: "20px",
              padding: "25px",
              width: "100%",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              color: "#fff",
              fontWeight: "700",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}>Somesh — Role</li>
            <li style={{
              background: "linear-gradient(135deg, #FFA500, #FF2400)",
              borderRadius: "20px",
              padding: "25px",
              width: "100%",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              color: "#fff",
              fontWeight: "700",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}>Shiva — Role</li>
            {/* Shakti aligned center */}
            <li style={{
              background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FF2400)",
              borderRadius: "20px",
              padding: "25px",
              width: "100%",
              maxWidth: "220px",
              boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              color: "#fff",
              fontWeight: "700",
              margin: "0 auto", // center
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}>Harshit — Role</li>
          </ul>
        </section>

      </div>

      
    </main>
  );
}