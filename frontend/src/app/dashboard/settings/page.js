"use client";

import { useEffect, useState } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [stats, setStats] = useState({
    knownWords: 0,
    unknownWords: 0,
    testCount: 0,
  });
  const [allWords, setAllWords] = useState([]);

  useEffect(() => {
    document.body.style.backgroundColor = "#e6ffe6"; // daha açık yeşil
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        const userInfoRes = await fetch(
          "http://localhost:5278/api/user-info?email=" + email
        );
        const userInfo = await userInfoRes.json();

        const allWordsRes = await fetch(
          "http://localhost:5278/api/userwords/all?email=" + email
        );
        const rawText = await allWordsRes.text();
        console.log("API'den dönen veri:", rawText);

        let allWords = [];
        if (rawText && rawText.trim().length > 0) {
          try {
            allWords = JSON.parse(rawText);
          } catch (err) {
            console.error("JSON parse hatası:", err);
          }
        } else {
          console.warn("API boş yanıt döndü.");
        }

        setAllWords(allWords);

        const known = allWords.filter((w) => w.status === "learned").length;
        const unknown = allWords.filter((w) => w.status !== "learned").length;

        setUser({
          name: userInfo.username,
          email: userInfo.email,
          password: "••••••",
        });
        setStats({
          knownWords: known,
          unknownWords: unknown,
          testCount: allWords.length,
        });
      } catch (err) {
        console.error("Veri alınırken hata:", err);
      }
    };
    fetchData();
  }, []);

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
        <p>
          <strong>Şifre:</strong> {user.password}
        </p>
      </div>

      <div className={styles.card}>
        <h2>📊 İstatistikler</h2>
        <p>
          <strong>Bilinen Kelime:</strong> {stats.knownWords}
        </p>
        <p>
          <strong>Bilinmeyen Kelime:</strong> {stats.unknownWords}
        </p>
        <p>
          <strong>Çözülmüş Test:</strong> {stats.testCount}
        </p>
      </div>

      <div className={styles.card}>
        <h2>✅ Bilinen Kelimeler</h2>
        <p>
          <strong>Toplam:</strong> {stats.knownWords} kelime
        </p>
        {stats.knownWords > 0 ? (
          <ul>
            {allWords
              .filter((w) => w.status === "learned")
              .map((w, index) => (
                <li key={index}>
                  {w.EngWordName} - {w.TurWordName}
                </li>
              ))}
          </ul>
        ) : (
          <p>Henüz bilinen kelime yok.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2>❌ Bilinmeyen Kelimeler</h2>
        <p>
          <strong>Toplam:</strong> {stats.unknownWords} kelime
        </p>
        {stats.unknownWords > 0 ? (
          <ul>
            {allWords
              .filter((w) => w.status !== "learned")
              .map((w, index) => (
                <li key={index}>
                  {w.EngWordName} - {w.TurWordName}
                </li>
              ))}
          </ul>
        ) : (
          <p>Henüz bilinmeyen kelime yok.</p>
        )}
      </div>
    </div>
  );
}
