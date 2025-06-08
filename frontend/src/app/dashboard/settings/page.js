"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./settings.module.css";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [stats, setStats] = useState({
    knownWords: 0,
    unknownWords: 0,
    testCount: 0,
  });
  const [allWords, setAllWords] = useState([]);
  const [analysisReport, setAnalysisReport] = useState([]);
  const reportRef = useRef();
  const router = useRouter();

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

        if (!allWordsRes.ok) {
          console.error("API yanıt vermedi:", allWordsRes.status);
          setAllWords([]);
          return;
        }

        let allWords = [];
        try {
          const rawText = await allWordsRes.text();
          if (rawText && rawText.trim().length > 0) {
            allWords = JSON.parse(rawText);
          } else {
            console.warn("API boş yanıt döndü.");
          }
        } catch (err) {
          console.error("JSON ayrıştırma hatası:", err);
          setAllWords([]);
          return;
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

  useEffect(() => {
    const fetchReport = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      const res = await fetch(
        `http://localhost:5278/api/userwords/report?email=${email}`
      );
      if (res.ok) {
        const data = await res.json();
        setAnalysisReport(data);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(
      `<html><head><title>Başarı Analiz Raporu</title></head><body>${printContents}</body></html>`
    );
    win.document.close();
    win.print();
  };

  return (
    <div className={styles.container}>
      <style>{`
        .back-btn-settings {
          position: absolute;
          left: 32px;
          top: 32px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(37,99,235,0.15);
          transition: background 0.2s, transform 0.2s;
          z-index: 2;
        }
        .back-btn-settings:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        @media (max-width: 600px) {
          .back-btn-settings { left: 10px; top: 10px; padding: 8px 14px; font-size: 0.95rem; }
        }
      `}</style>
      <button
        className="back-btn-settings"
        onClick={() => router.push("/dashboard")}
      >
        ← Geri
      </button>
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
                  {w.EngWordName || w.engWordName || w.eng} -{" "}
                  {w.TurWordName || w.turWordName || w.tur}
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
                  {w.EngWordName || w.engWordName || w.eng} -{" "}
                  {w.TurWordName || w.turWordName || w.tur}
                </li>
              ))}
          </ul>
        ) : (
          <p>Henüz bilinmeyen kelime yok.</p>
        )}
      </div>

      <div className={styles.card} ref={reportRef}>
        <h2>📈 Başarı Analiz Raporu</h2>
        {analysisReport.length === 0 ? (
          <p>Yeterli veri yok.</p>
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>
                  Kategori
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>
                  Toplam
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>
                  Öğrenilen
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: 6 }}>
                  Başarı (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {analysisReport.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: 6 }}>{row.category}</td>
                  <td style={{ padding: 6 }}>{row.total}</td>
                  <td style={{ padding: 6 }}>{row.learned}</td>
                  <td style={{ padding: 6 }}>{row.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          onClick={handlePrint}
          style={{
            marginTop: 16,
            padding: "8px 20px",
            borderRadius: 8,
            background: "#2563eb",
            color: "white",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Yazdır
        </button>
      </div>
    </div>
  );
}
