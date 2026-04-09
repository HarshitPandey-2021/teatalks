"use client";

export default function EmptyState() {
  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "30px 40px",
        borderRadius: "20px",
        textAlign: "center",
        fontSize: "1.2rem",
        fontWeight: "600",
        color: "#fff",
        background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FFD97D)",
        boxShadow: "0 8px 25px rgba(255,110,196,0.4)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 12px 35px rgba(255,110,196,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,110,196,0.4)";
      }}
    >
      <span
        style={{
          display: "block",
          background: "rgba(255,255,255,0.15)",
          height: "5px",
          width: "80px",
          borderRadius: "3px",
          margin: "0 auto 15px",
        }}
      ></span>
      No Discussions Found 😌
    </div>
  );
}