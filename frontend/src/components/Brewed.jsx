export default function Brewed() {
  const features = [
    {
      title: "Anonymous Expression",
      desc: "Unfiltered, unlabelled, and entirely your own — articulate thoughts without the weight of identity.",
      color: "#FFA500",
    },
    {
      title: "Campus Narratives",
      desc: "Immerse yourself in the authentic pulse of campus life through shared experiences.",
      color: "#FF6EC4",
    },
    {
      title: "Professor Insights",
      desc: "Thoughtful reflections that guide smarter academic choices.",
      color: "#FFD700",
    },
    {
      title: "Community Resonance",
      desc: "Meaningful conversations rise naturally through collective engagement.",
      color: "#FF2400",
    },
  ];

  return (
    <section
      style={{
        padding: "110px 20px",
        textAlign: "center",
        background: "linear-gradient(180deg,#FDF6F0,#FFF)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* HEADING */}
        <h2
          style={{
            fontSize: "2.6rem",
            fontWeight: "900",
            marginBottom: "12px",
            letterSpacing: "0.4px",
            background: "linear-gradient(90deg,#FF4D8D,#FF8C42,#FFD700)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Brewed for Authenticity
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "70px",
            maxWidth: "620px",
            marginInline: "auto",
            lineHeight: "1.8",
            fontSize: "1.05rem",
          }}
        >
          A space where expression feels effortless, conversations remain unfiltered,
          and every voice finds its place in a shared narrative.
        </p>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "34px",
            justifyItems: "center",
          }}
        >
          {features.map((card, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",

                /* GLASS EFFECT */
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",

                borderRadius: "22px",
                padding: "34px 26px",
                maxWidth: "280px",

                border: "1px solid rgba(255,255,255,0.45)",

                boxShadow: `
                  0 8px 30px rgba(0,0,0,0.08),
                  0 4px 18px rgba(255,140,0,0.08)
                `,
              }}
            >

              {/* SOFT COLOR GLOW */}
              <div
                style={{
                  position: "absolute",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: card.color,
                  filter: "blur(35px)",
                  opacity: "0.25",
                  top: "-25px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />

              {/* SMALL DOT */}
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: card.color,
                  margin: "0 auto 14px",
                }}
              />

              {/* TITLE */}
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "800",
                  marginBottom: "10px",
                  letterSpacing: "0.3px",
                }}
              >
                {card.title}
              </h3>

              {/* DIVIDER */}
              <div
                style={{
                  width: "40px",
                  height: "2px",
                  background: card.color,
                  margin: "10px auto 16px",
                  borderRadius: "10px",
                  opacity: "0.6",
                }}
              />

              {/* DESC */}
              <p
                style={{
                  color: "#555",
                  fontSize: "0.96rem",
                  lineHeight: "1.75",
                }}
              >
                {card.desc}
              </p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
