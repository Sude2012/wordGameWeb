"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  const buttonBaseStyle = {
    width: "380px",
    height: "80px",
    fontSize: "24px",
    borderRadius: "12px",
    backgroundColor: "#16a34a", // koyu yeşil
    color: "white",
    fontWeight: "600",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
    border: "none",
    transition: "all 0.3s ease-in-out",
  };

  // Hover efektini kontrol için state kullanalım
  const [hovered, setHovered] = useState(null);

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: "url('/wordgamebackground.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const contentStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "40px",
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
    zIndex: 10,
    textAlign: "center",
    width: "420px",
  };

  const buttons = [
    { href: "/quiz", label: "🎮 Teste Başla", id: 1 },
    { href: "/dashboard/words", label: "⚙️ Ayarlar", id: 2 },
  ];

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "900",
            color: "#166534",
            marginBottom: "32px",
          }}
        >
          🌿 WORD GAME
        </h1>

        {buttons.map(({ href, label, id }) => (
          <Link key={id} href={href}>
            <button
              style={{
                ...buttonBaseStyle,
                backgroundColor:
                  hovered === id ? "#15803d" /* hover yeşili */ : "#16a34a",
                transform: hovered === id ? "scale(1.1)" : "scale(1)",
              }}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              {label}
            </button>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          style={{
            ...buttonBaseStyle,
            backgroundColor: hovered === 3 ? "#15803d" : "#16a34a",
            transform: hovered === 3 ? "scale(1.1)" : "scale(1)",
          }}
          onMouseEnter={() => setHovered(3)}
          onMouseLeave={() => setHovered(null)}
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </div>
  );
}
