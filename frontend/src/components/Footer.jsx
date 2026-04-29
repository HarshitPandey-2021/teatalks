import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "50px 20px 30px",
        background: "#0f172a",
        color: "#e5e7eb",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* BRAND */}
        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            marginBottom: "8px",
          }}
        >
          ☕ TeaTalks
        </h3>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#9ca3af",
            marginBottom: "20px",
          }}
        >
          Your Campus. Your Voice. Real Conversations.
        </p>

        {/* LINKS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <Link href="/about" style={linkStyle}>
            About
          </Link>

          <Link href="/privacy" style={linkStyle}>
            Privacy
          </Link>

          <Link href="/terms" style={linkStyle}>
            Terms
          </Link>
        </div>

        {/* DIVIDER */}
        <div
          style={{
            width: "60%",
            height: "1px",
            margin: "20px auto",
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* COPYRIGHT */}
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          © 2026 TeaTalks. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

/* LINK STYLE */
const linkStyle = {
  color: "#e5e7eb",
  fontSize: "0.9rem",
  textDecoration: "none",
  fontWeight: "500",
};
