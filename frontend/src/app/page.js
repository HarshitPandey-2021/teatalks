import Image from "next/image";
import EmptyState from "@/components/EmptyState";
import TeaGame from "@/components/TeaGame";
import Testimonial from "@/components/Testimonial";

export default function Home() {
  return (
    <main style={{ background: "#ffffff" }}>

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

        {/* HERO CONTENT */}
        <div style={{ position: "relative", zIndex: 2 }}>

          <h1 style={{
            fontSize: "3.8rem",
            fontWeight: "900",
            lineHeight: "1.15",
            letterSpacing: "0.5px",
            background: "linear-gradient(90deg,#FF4D8D,#FF8C42,#FFD700)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "0 8px 30px rgba(255,140,0,0.25)"
          }}>
            Your Campus. Your <br /> Voice. Zero Judgement
          </h1>

          <p style={{
            margin: "20px 0",
            fontSize: "1.1rem",
            color: "#374151",
            fontWeight: "500"
          }}>
            TeaTalks is an anonymous student platform where real campus conversations happen.
          </p>

          {/* BUTTON */}
          <div style={{
            display: "inline-block",
            marginTop: "10px",
            padding: "4px",
            borderRadius: "14px",
            background: "linear-gradient(120deg,#FF4D8D,#FF8C42,#FFD700)",
            boxShadow: "0 10px 30px rgba(255,140,0,0.35)"
          }}>
            <button
              className="btn-primary"
              style={{
                borderRadius: "12px",
                padding: "12px 26px",
                fontWeight: "700",
                fontSize: "0.95rem",
                letterSpacing: "0.4px"
              }}
            >
              Spill the Tea ☕
            </button>
          </div>

        </div>

      </section> {/* ✅ FIXED: properly closed */}

      <div className="page">

        <TeaGame/>

        <div style={{
          height: "1.5px",
          width: "70%",
          margin: "70px auto",
          background: "linear-gradient(90deg, transparent, #FFD700, #FF6EC4, transparent)",
          boxShadow: "0 0 10px rgba(255,182,0,0.4)"
        }} />

        <Testimonial/>

        <div style={{
          height: "1.5px",
          width: "70%",
          margin: "70px auto",
          background: "linear-gradient(90deg, transparent, #FFA500, #FFD700, transparent)",
          boxShadow: "0 0 10px rgba(255,165,0,0.4)"
        }} />

        <section className="section" style={{ padding: "60px 20px" }}>
          
          <h2 style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: "800",
            marginBottom: "10px",
            letterSpacing: "0.5px",
            background: "linear-gradient(90deg,#FF6EC4,#FFA500,#FFD700)",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}>
            Why TeaTalks
          </h2>

          <div style={{
            width: "140px",
            height: "4px",
            margin: "14px auto 45px",
            borderRadius: "10px",
            background: "linear-gradient(90deg,#FF6EC4,#FFD700)",
            boxShadow: "0 0 12px rgba(255,182,0,0.5)"
          }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
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
                  background: "linear-gradient(180deg,#ffffff,#fff7ed)",
                  borderRadius: "20px",
                  padding: "30px 26px",
                  maxWidth: "300px",
                  boxShadow: `0 14px 35px ${card.color}25`,
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.05)",
                  position: "relative"
                }}
              >
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: `${card.color}30`,
                  filter: "blur(20px)"
                }} />

                <h3 style={{
                  color: card.color,
                  fontSize: "1.3rem",
                  fontWeight: "800",
                  marginBottom: "12px",
                  letterSpacing: "0.4px"
                }}>
                  {card.title}
                </h3>

                <p style={{
                  color: "#555",
                  fontSize: "0.98rem",
                  lineHeight: "1.75"
                }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div style={{
          height: "1.5px",
          width: "60%",
          margin: "60px auto",
          background: "linear-gradient(90deg, transparent, #FF6EC4, #FFD700, transparent)",
          boxShadow: "0 0 8px rgba(255,110,196,0.4)"
        }} />

        <section className="section">
          <EmptyState/>
        </section>

      </div>
    </main>
  );
}