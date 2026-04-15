"use client";
import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScroll(progress);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: `${scroll}%`,
      height: "4px",
      background: "linear-gradient(90deg, #FF6EC4, #FFA500, #FFD700)",
      zIndex: 9999,
      transition: "width 0.1s ease-out",
      boxShadow: "0 0 10px rgba(255,110,196,0.5)"
    }} />
  );
}