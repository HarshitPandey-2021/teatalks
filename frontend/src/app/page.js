import Image from "next/image";
import EmptyState from "@/components/EmptyState";
import TeaGame from "@/components/TeaGame";
import Testimonial from "@/components/Testimonial";

export default function Home() {
  return (
    <main style={{ background: "#ffffff" }}>

      {/* HERO SECTION — DO NOT TOUCH */}
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

        <div 
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.5)",
            zIndex: 1
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1>Your Campus. Your Voice. Zero Judgement</h1>
          <p style={{ margin: "15px 0" }}>
            TeaTalks is an anonymous student platform where real
            campus conversations happen.
          </p>
          <button className="btn-primary" style={{ marginTop: "20px" }}>
            Spill the Tea ☕
          </button>
        </div>
      </section>

      <div className="page">

        {/* 🎮 GAME SECTION */}
        <TeaGame/>

        {/* 👥 TESTIMONIAL SECTION */}
        <Testimonial/>

        {/* WHY TEATALKS */}
        <section className="section" style={{ padding: "50px 20px" }}>
          <h2 className="section-title">Why TeaTalks?</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            justifyItems: "center",
          }}>
            {[
              {
                title: "Anonymous Posts",
                desc: "Speak freely, unburden your thoughts, and let the world hear you without labels.",
                color: "#FFA500"
              },
              {
                title: "Campus Stories",
                desc: "Dive into real campus life — hostels, libraries, classrooms.",
                color: "#FF6EC4"
              },
              {
                title: "Professor Reviews",
                desc: "Honest reflections to guide smarter academic choices.",
                color: "#FFD700"
              },
              {
                title: "Community Voting",
                desc: "The best conversations rise naturally.",
                color: "#FF2400"
              },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "25px",
                  maxWidth: "300px",
                  boxShadow: `0 8px 25px ${card.color}30`,
                  textAlign: "center"
                }}
              >
                <h3 style={{ color: card.color }}>{card.title}</h3>
                <p style={{ color: "#555" }}>{card.desc}</p>
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
  );
}