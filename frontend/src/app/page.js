import Image from "next/image";

import SearchBar from "../components/SearchBar";
import CategoryTabs from "../components/CategoryTabs";
import EmptyState from "../components/EmptyState";

export default function Home() {
  return (
    <main>

      {/* HERO SECTION */}
      <section 
        className="hero"
        style={{
          backgroundImage: "url('/campus.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          borderBottomLeftRadius: "50% 20%",
          borderBottomRightRadius: "50% 20%",
          overflow: "hidden",
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        {/* Mascot enlarged */}
        <Image
          src="/mascot-1.png"
          alt="Mascot"
          width={220}
          height={220}
          style={{
            position: "absolute",
            left: "15px",
            bottom: "0px",
            zIndex: 2,
            objectFit: "contain",
            pointerEvents: "none"
          }}
        />

        {/* LIGHTER OVERLAY */}
        <div 
          className="hero-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.5)",
            zIndex: 1
          }}
        ></div>

        <div 
          className="hero-content"
          style={{ position: "relative", zIndex: 2, display: "inline-block" }}
        >
          <h1>Your Campus. Your Voice. Zero Judgement</h1>
          <p style={{ margin: "15px 0" }}>
            TeaTalks is an anonymous student platform where real
            campus conversations happen.
          </p>
          <button className="btn-primary" style={{ display: "block", margin: "20px auto" }}>
            Spill the Tea ☕
          </button>
        </div>
      </section>

      <div className="page">

        <div className="mascot-bg"></div>

        {/* SEARCH SECTION */}
        <section className="section" style={{ padding: "40px 20px" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "700",
            color: "#FF6EC4",
            marginBottom: "20px",
            textShadow: "1px 1px 8px rgba(255,110,196,0.4)"
          }}>
            Search Discussions
          </h2>
          <SearchBar/>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="section" style={{ padding: "40px 20px" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "700",
            color: "#FF6EC4",
            marginBottom: "20px",
            textShadow: "1px 1px 8px rgba(255,110,196,0.4)"
          }}>
            Categories
          </h2>
          <CategoryTabs/>
        </section>

        {/* WHY TEATALKS SECTION */}
        <section className="section" style={{ padding: "50px 20px", background: "rgba(255,255,255,0.03)" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: "700",
            color: "#FF6EC4",
            marginBottom: "40px",
            textShadow: "1px 1px 8px rgba(255,110,196,0.4)",
          }}>
            Why TeaTalks?
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            justifyItems: "center",
          }}>
            {[
              {
                title: "Anonymous Posts",
                desc: "Speak freely, unburden your thoughts, and let the world hear you without labels. Here, your voice is yours alone.",
                color: "#FFA500" // Orange
              },
              {
                title: "Campus Stories",
                desc: "Dive into the tapestry of campus life — laughter in the hostels, the silent library whispers, and the tales that classrooms hold.",
                color: "#FF6EC4" // Magenta
              },
              {
                title: "Professor Reviews",
                desc: "Gain honest reflections on professors and courses — illuminating the path for fellow students and guiding learning journeys.",
                color: "#D4AF37" // Brownish Yellow
              },
              {
                title: "Community Voting",
                desc: "Empower the community to highlight what truly matters. The best stories, advice, and discussions rise to the top organically.",
                color: "#FF2400" // Scarlet
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15))",
                  borderRadius: "20px",
                  padding: "25px 20px",
                  width: "100%",
                  maxWidth: "300px",
                  boxShadow: `0 8px 25px ${card.color}40`,
                  textAlign: "center",
                  cursor: "default",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <h3 style={{
                  color: card.color,
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  marginBottom: "15px",
                  textShadow: `1px 1px 6px ${card.color}50`,
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  color: card.color, // DESC same as title now
                }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* EMPTY STATE */}
        <section className="section">
          <EmptyState/>
        </section>

      </div>

    </main>
  )
}