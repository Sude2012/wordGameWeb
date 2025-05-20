"use client";
import { useState } from "react";

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
      alert("Lütfen İngilizce ve Türkçe kelimeleri giriniz.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5278/api/add-full-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(word),
      });

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        // Backend'den dönen tam kelime objesi (örneğin data.word)
        // Eğer backend sadece message döndürüyorsa, backend'i güncellemen gerek
        // Ama burada varsayıyorum data içinde yeni kelimen var
        const newWord = data.word || word; // Eğer backend döndürmezse fallback

        setSavedWords((prev) => [newWord, ...prev]);

        setWord({
          EngWordName: "",
          TurWordName: "",
          Picture: "",
          Pronunciation: "",
          Samples: [""],
          UserId: 1,
        });
      }
    } catch (error) {
      alert("Sunucu hatası: " + error.message);
    }
  };

  return (
    <div className="container">
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
          onChange={(e) => setWord({ ...word, Pronunciation: e.target.value })}
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

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 40px auto;
          padding: 20px;
          background: linear-gradient(135deg, #a0e9ff 0%, #67d4ff 100%);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 115, 230, 0.3);
          display: flex;
          gap: 40px;
          color: #003366;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        form.form {
          flex: 1;
          background: rgba(255 255 255 / 0.85);
          padding: 30px;
          border-radius: 15px;
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
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
          flex: 1;
          background: rgba(255 255 255 / 0.9);
          padding: 25px;
          border-radius: 20px;
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.5);
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
      `}</style>
    </div>
  );
}
