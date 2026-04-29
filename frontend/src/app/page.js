
import Image from "next/image";
import Brewed from "@/components/Brewed";
import HowItWorks from "@/components/HowItWorks";
import Testimonial from "@/components/Testimonial";

export default function Home() {
  return (
    <main style={{ background: "#ffffff" }}>

      {/* ================= HERO ================= */}
      <section style={{ padding: "110px 20px 90px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "60px",
          }}
        >
          <div style={{ flex: "1 1 420px", textAlign: "center" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: "900", lineHeight: "1.2" }}>
              Your Campus. <br />
              Your Voice. <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#FF4D8D,#FF8C42,#FFD700)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Zero Judgement
              </span>
            </h1>

            <p
              style={{
                marginTop: "24px",
                fontSize: "1.05rem",
                color: "#555",
                lineHeight: "1.7",
              }}
            >
              A space where unfiltered student voices converge — where thoughts
              unfold freely and conversations exist without judgement.
            </p>

            <button
              style={{
                marginTop: "25px",
                padding: "14px 30px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "700",
                background:
                  "linear-gradient(120deg,#FF4D8D,#FF8C42,#FFD700)",
                color: "#fff",
                boxShadow: "0 10px 25px rgba(255,140,0,0.3)",
                cursor: "pointer",
              }}
            >
              Spill the Tea ☕
            </button>
          </div>

          <div
            style={{
              flex: "1 1 320px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Image
  src="/phone.png"
  alt="preview"
  width={260}
  height={520}
  style={{
                borderRadius: "16px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section style={{ padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {[
            { num: "10K+", label: "Voices Shared" },
            { num: "50+", label: "Campuses" },
            { num: "100K+", label: "Interactions" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 200px",
                textAlign: "center",
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  background: "linear-gradient(90deg,#FF4D8D,#FFD700)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {item.num}
              </div>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BREWED ================= */}
      <Brewed />

      {/* ================= HOW IT WORKS ================= */}
      <HowItWorks />

      {/* ================= TESTIMONIAL ================= */}
      <Testimonial />

      {/* ================= QUESTIONS (INLINE) ================= */}
      <section
        style={{
          padding: "110px 20px",
          background: "linear-gradient(180deg,#FFF,#FDF6F0)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: "900",
              marginBottom: "10px",
              background: "linear-gradient(90deg,#FF4D8D,#FF8C42,#FFD700)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Questions, Answered
          </h2>

          <p
            style={{
              color: "#666",
              marginBottom: "60px",
              maxWidth: "600px",
              marginInline: "auto",
              lineHeight: "1.7",
            }}
          >
            Everything you might be wondering — thoughtfully clarified.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              {
                q: "Is TeaTalks really anonymous?",
                a: "Yes. Your identity is never revealed publicly. The platform is designed for honest expression.",
              },
              {
                q: "Who can see my posts?",
                a: "Only users within your campus can view and engage with your posts.",
              },
              {
                q: "Can I delete my posts?",
                a: "Yes, you have full control over your content anytime.",
              },
              {
                q: "What content is allowed?",
                a: "Respectful and meaningful conversations are encouraged. Harmful content is moderated.",
              },
            ].map((item, i) => (
              <details
                key={i}
                style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  textAlign: "left",
                }}
              >
                <summary
                  style={{
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {item.q}
                </summary>

                <p
                  style={{
                    marginTop: "10px",
                    color: "#555",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}
