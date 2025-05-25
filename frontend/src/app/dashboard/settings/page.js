"use client";

import { useEffect, useState } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [user, setUser] = useState({
    name: "Kullanıcı",
    email: "test@example.com",
  });
  const [stats, setStats] = useState({ knownWords: 120, testCount: 18 });
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.className = theme === "dark" ? styles.dark : styles.light;
  }, [theme]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚙️ Ayarlar</h1>

      <div className={styles.card}>
        <h2>👤 Kullanıcı Bilgileri</h2>
        <p>
          <strong>İsim:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <div className={styles.card}>
        <h2>📊 İstatistikler</h2>
        <p>
          <strong>Bilinen Kelime:</strong> {stats.knownWords}
        </p>
        <p>
          <strong>Çözülmüş Test:</strong> {stats.testCount}
        </p>
      </div>

      <div className={styles.card}>
        <h2>🎨 Tema Seçimi</h2>
        <button onClick={toggleTheme} className={styles.toggleBtn}>
          {theme === "light" ? "🌙 Karanlık Mod" : "☀️ Aydınlık Mod"}
        </button>
      </div>
    </div>
  );
}
