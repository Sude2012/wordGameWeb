"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddWordForm() {
  const [word, setWord] = useState({
    EngWordName: "",
    TurWordName: "",
    Picture: "",
    Pronunciation: "",
    Samples: [""],
    UserId: 1,
  });

  const [savedWords, setSavedWords] = useState([]);
  const router = useRouter();
  const [notification, setNotification] = useState({ message: "", type: "" });

  const handleSampleChange = (index, value) => {
    const updated = [...word.Samples];
    updated[index] = value;
    setWord({ ...word, Samples: updated });
  };

  const addSampleField = () => {
    setWord({ ...word, Samples: [...word.Samples, ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!word.EngWordName.trim() || !word.TurWordName.trim()) {
      setNotification({
        message: "Lütfen İngilizce ve Türkçe kelimeleri giriniz.",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 2500);
      return;
    }

    try {
      const res = await fetch("http://localhost:5278/api/add-full-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(word),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          message: data.message || "Kelime başarıyla eklendi.",
          type: "success",
        });
        setTimeout(() => setNotification({ message: "", type: "" }), 2000);
        const newWord = data.word || word;
        setSavedWords((prev) => [newWord, ...prev]);
        setWord({
          EngWordName: "",
          TurWordName: "",
          Picture: "",
          Pronunciation: "",
          Samples: [""],
          UserId: 1,
        });
      } else {
        setNotification({
          message: data.message || "Bir hata oluştu.",
          type: "error",
        });
        setTimeout(() => setNotification({ message: "", type: "" }), 2500);
      }
    } catch (error) {
      setNotification({
        message: "Sunucu hatası: " + error.message,
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 2500);
    }
  };

  return (
    <div className="container">
      <style>{`
        .logout-btn {
          position: absolute;
          left: 24px;
          top: 24px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 18px;
          padding: 7px 18px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(220,38,38,0.10);
          transition: background 0.18s, transform 0.18s;
          z-index: 10;
        }
        .logout-btn:hover {
          background: #b91c1c;
          transform: scale(1.04);
        }
        @media (max-width: 600px) {
          .logout-btn { left: 8px; top: 8px; padding: 6px 12px; font-size: 0.95rem; }
        }
        .notification {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          min-width: 260px;
          max-width: 90vw;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          box-shadow: 0 4px 18px rgba(0,0,0,0.13);
          z-index: 100;
          text-align: center;
          opacity: 0.97;
          transition: opacity 0.3s;
        }
        .notification.success {
          background: #16a34a;
          color: white;
        }
        .notification.error {
          background: #dc2626;
          color: white;
        }
        .container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 24px;
          background: linear-gradient(135deg, #a0e9ff 0%, #67d4ff 100%);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 115, 230, 0.3);
          display: flex;
          gap: 8px;
          color: #003366;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        form.form {
          width: 49%;
          min-width: 300px;
          background: rgba(255 255 255 / 0.90);
          padding: 26px 18px 26px 18px;
          border-radius: 13px;
          box-shadow: inset 0 0 14px rgba(255, 255, 255, 0.4);
          position: relative;
        }
        h2 {
          margin-bottom: 25px;
          text-align: center;
          color: #004e89;
          text-shadow: 1px 1px 3px #a0c8f0;
        }
        .input {
          width: 90%;
          padding: 16px 14px;
          margin-bottom: 18px;
          border-radius: 12px;
          border: 1.5px solid #007bbd;
          font-size: 1.2rem;
          box-shadow: inset 1px 1px 6px rgba(0, 123, 189, 0.2);
          transition: border-color 0.3s ease;
        }
        .input:focus {
          outline: none;
          border-color: #004e89;
          box-shadow: 0 0 8px #004e89;
          background: #e0f0ff;
        }
        .label {
          font-weight: 600;
          margin-bottom: 10px;
          display: block;
          font-size: 1.1rem;
          color: #003366;
        }
        .btn-add {
          display: block;
          margin: 10px auto 25px auto;
          background: #00b4d8;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 15px rgba(0, 180, 216, 0.5);
          transition: background 0.3s ease;
        }
        .btn-add:hover {
          background: #0096c7;
        }
        .btn-submit {
          width: 100%;
          background: linear-gradient(90deg, #007bbd, #00b4d8);
          padding: 16px;
          border-radius: 25px;
          color: white;
          font-size: 1.3rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(0, 123, 189, 0.7);
          border: none;
          transition: background 0.3s ease;
        }
        .btn-submit:hover {
          background: linear-gradient(90deg, #005f86, #0096c7);
        }
        .saved-words {
          width: 49%;
          min-width: 300px;
          background: rgba(255 255 255 / 0.93);
          padding: 20px 14px;
          border-radius: 13px;
          box-shadow: inset 0 0 18px rgba(255, 255, 255, 0.35);
          overflow-y: auto;
          max-height: 700px;
        }
        .saved-words h3 {
          text-align: center;
          margin-bottom: 20px;
          color: #004e89;
          text-shadow: 1px 1px 2px #a0c8f0;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        .word-card {
          background: #caf0f8cc;
          border-radius: 15px;
          padding: 18px 20px;
          margin-bottom: 18px;
          box-shadow: 0 5px 15px rgba(0, 115, 230, 0.25);
          transition: transform 0.3s ease;
        }
        .word-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 115, 230, 0.4);
        }
        .word-header {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #007bbd;
        }
        .word-image {
          width: 100%;
          max-height: 160px;
          object-fit: contain;
          border-radius: 12px;
          margin-bottom: 10px;
          box-shadow: 0 3px 10px rgba(0, 123, 189, 0.3);
        }
        .audio-player {
          width: 100%;
          margin-bottom: 10px;
        }
        .samples-list {
          font-style: italic;
          color: #004e89;
          margin-left: 10px;
        }
        @media (max-width: 900px) {
          .container { flex-direction: column; gap: 18px; max-width: 98vw; }
          form.form, .saved-words { width: 100%; min-width: 0; }
        }
      `}</style>
      <div style={{ position: "relative" }}>
        <button className="logout-btn" onClick={() => router.push("/login")}>
          Çıkış
        </button>
        {notification.message && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form">
          <h2>Kelime Ekle</h2>

          <input
            type="text"
            placeholder="İngilizce"
            value={word.EngWordName}
            onChange={(e) => setWord({ ...word, EngWordName: e.target.value })}
            className="input"
            required
          />

          <input
            type="text"
            placeholder="Türkçe"
            value={word.TurWordName}
            onChange={(e) => setWord({ ...word, TurWordName: e.target.value })}
            className="input"
            required
          />

          <input
            type="text"
            placeholder="Resim URL"
            value={word.Picture}
            onChange={(e) => setWord({ ...word, Picture: e.target.value })}
            className="input"
          />

          <input
            type="text"
            placeholder="Ses URL (opsiyonel)"
            value={word.Pronunciation}
            onChange={(e) =>
              setWord({ ...word, Pronunciation: e.target.value })
            }
            className="input"
          />

          <label className="label">Örnek Cümleler:</label>
          {word.Samples.map((sample, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Cümle ${i + 1}`}
              value={sample}
              onChange={(e) => handleSampleChange(i, e.target.value)}
              className="input"
            />
          ))}

          <button type="button" onClick={addSampleField} className="btn-add">
            + Cümle Ekle
          </button>

          <button type="submit" className="btn-submit">
            Kaydet
          </button>
        </form>
      </div>

      <div className="saved-words">
        <h3>Yeni Eklenen Kelimeler</h3>
        {savedWords.length === 0 && <p>Henüz kelime eklenmedi.</p>}
        <ul>
          {savedWords.map((w, i) => (
            <li key={i} className="word-card">
              <div className="word-header">
                <strong>{w.EngWordName}</strong> - {w.TurWordName}
              </div>
              {w.Picture && (
                <img
                  src={w.Picture}
                  alt={w.EngWordName}
                  className="word-image"
                />
              )}
              {w.Pronunciation && (
                <audio
                  controls
                  src={w.Pronunciation}
                  className="audio-player"
                />
              )}
              <ul className="samples-list">
                {w.Samples.map((s, idx) => (
                  <li key={idx}>"{s}"</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
