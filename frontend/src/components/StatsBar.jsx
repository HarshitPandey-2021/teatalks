"use client";
import { useEffect, useState } from "react";

export default function StatsBar() {
  const [posts, setPosts] = useState(1247);
  const [students, setStudents] = useState(890);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const interval = setInterval(() => {
      setPosts(prev => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.6) {
        setStudents(prev => prev + 1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, #FF6EC4, #FFA500, #FFD700)",
      color: "white",
      padding: "20px",
      textAlign: "center",
      fontSize: "1rem",
      fontWeight: "600",
      letterSpacing: "0.3px",
      boxShadow: "0 4px 15px rgba(255,110,196,0.3)"
    }}>
      <span style={{
        display: "inline-block",
        animation: animate ? "slideIn 0.6s ease-out" : "none"
      }}>
        🔥 <span style={{ 
          fontWeight: "800",
          fontSize: "1.1rem"
        }}>
          {posts.toLocaleString()}
        </span> confessions shared • <span style={{ 
          fontWeight: "800",
          fontSize: "1.1rem"
        }}>
          {students.toLocaleString()}
        </span> students joined
      </span>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}