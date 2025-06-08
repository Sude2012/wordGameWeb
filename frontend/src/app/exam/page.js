"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Mock kelime verisi (backend ile entegre edilecek)
const initialWords = [
  { id: 8, eng: "apple", tur: "elma", streak: 0, status: "learning" },
  { id: 12, eng: "book", tur: "kitap", streak: 0, status: "learning" },
  { id: 86, eng: "car", tur: "araba", streak: 0, status: "learning" },
  { id: 87, eng: "dog", tur: "köpek", streak: 0, status: "learning" },
  { id: 19, eng: "house", tur: "ev", streak: 0, status: "learning" },
  { id: 10, eng: "tree", tur: "ağaç", streak: 0, status: "learning" },
];

const intervals = [1, 7, 30, 90, 180, 365]; // gün cinsinden

function shuffle(array) {
  // Fisher-Yates algoritması
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function getTurkish(w) {
  return (
    w?.tur ||
    w?.turWordName ||
    w?.TurWordName ||
    w?.turwordname ||
    w?.turwordName
  );
}

function getEnglish(w) {
  return (
    w?.eng ||
    w?.engWordName ||
    w?.EngWordName ||
    w?.engwordname ||
    w?.engwordName
  );
}

export default function ExamPage() {
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setError("");
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Giriş yapmalısınız. Lütfen önce giriş yapın.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:5278/api/exam/words?userId=${userId}`
        );
        if (!res.ok) {
          setError("Sunucudan veri alınamadı. (" + res.status + ")");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setWords(data);
        localStorage.setItem("examWords", JSON.stringify(data));
      } catch (err) {
        setError("Sunucuya bağlanılamadı veya ağ hatası oluştu.");
      }
      setLoading(false);
    };
    fetchWords();
  }, []);

  useEffect(() => {
    setSelected(null);
    setFeedback("");
    if (words.length && words[current]) {
      const correct = getTurkish(words[current]);
      const wrongs = words
        .filter((w, i) => i !== current)
        .map(getTurkish)
        .filter(Boolean);
      const sampledWrongs = shuffle([...wrongs]).slice(0, 3);
      const allOptions = shuffle([correct, ...sampledWrongs]);
      setOptions(allOptions);
    }
  }, [words, current]);

  const handleAnswer = async (isCorrect) => {
    setShowAnswer(false);
    const userId = localStorage.getItem("userId");
    const word = words[current];
    try {
      await fetch("http://localhost:5278/api/exam/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId),
          wordId: word.wordId,
          isCorrect,
        }),
      });
    } catch (err) {
      setError("Cevap gönderilemedi. Sunucuya ulaşılamıyor.");
    }
    setWords((prev) => {
      const updated = [...prev];
      if (isCorrect) {
        updated[current].streak += 1;
        if (updated[current].streak >= 6) {
          updated[current].status = "learned";
        }
      } else {
        updated[current].streak = 0;
      }
      return updated;
    });
    if (current < words.length - 1) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  const correctAnswer = getTurkish(words[current] || {});

  const handleOptionClick = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const isCorrect = opt === correctAnswer;
    setFeedback(isCorrect ? "Doğru!" : `Yanlış, doğru cevap: ${correctAnswer}`);
    setTimeout(() => {
      setSelected(null);
      setFeedback("");
      handleAnswer(isCorrect);
    }, 1000);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#e0f2fe",
        }}
      >
        <div>Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#e0f2fe",
          color: "#dc2626",
          fontSize: 20,
        }}
      >
        {error}
      </div>
    );
  }

  if (finished) {
    const learned = words.filter((w) => w.status === "learned").length;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#e0f2fe",
        }}
      >
        <div
          style={{
            background: "white",
            padding: 40,
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#166534",
              marginBottom: 24,
            }}
          >
            Sınav Tamamlandı
          </h1>
          <p style={{ fontSize: 18, color: "#444", marginBottom: 16 }}>
            Toplam {words.length} kelimeyi tekrar ettiniz.
            <br />
            {learned} kelimeyi tamamen öğrendiniz!
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 24,
            }}
          >
            <button
              onClick={() => {
                setCurrent(0);
                setFinished(false);
                setWords(
                  words.map((w) => ({ ...w, streak: 0, status: "learning" }))
                );
              }}
              style={{
                padding: "12px 32px",
                fontSize: 18,
                borderRadius: 8,
                background: "#16a34a",
                color: "white",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "12px 32px",
                fontSize: 18,
                borderRadius: 8,
                background: "#2563eb",
                color: "white",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#e0f2fe",
        }}
      >
        <div>Bugün için sınav kelimesi yok.</div>
      </div>
    );
  }

  const word = words[current];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#e0f2fe",
      }}
    >
      <style>{`
        .back-btn-exam {
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
        .back-btn-exam:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        @media (max-width: 600px) {
          .back-btn-exam { left: 10px; top: 10px; padding: 8px 14px; font-size: 0.95rem; }
        }
        .option-btn {
          padding: 12px 24px;
          font-size: 18px;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-bottom: 0;
        }
        .option-btn:hover:enabled {
          background: #1d4ed8;
          transform: scale(1.04);
        }
        .option-btn:active:enabled {
          transform: scale(0.97);
        }
      `}</style>
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          textAlign: "center",
          minWidth: 350,
          position: "relative",
        }}
      >
        <button
          className="back-btn-exam"
          onClick={() => router.push("/dashboard")}
        >
          ← Geri
        </button>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#166534",
            marginBottom: 16,
          }}
        >
          Sınav Modülü
        </h1>
        <div style={{ marginBottom: 16, fontSize: 18, color: "#444" }}>
          <b>{current + 1}. Soru</b> / {words.length}
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>
          {getEnglish(word)}
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 16, color: "#888" }}>
            Doğru Cevap Serisi: <b>{word.streak}</b> / 6
          </div>
          <div
            style={{
              fontSize: 16,
              color: word.status === "learned" ? "#16a34a" : "#888",
            }}
          >
            {word.status === "learned" ? "ÖĞRENİLDİ" : "Öğreniliyor"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {options.map((opt, i) => {
            let bg = "#2563eb";
            if (selected !== null) {
              if (opt === selected)
                bg = opt === correctAnswer ? "#16a34a" : "#dc2626";
              else if (opt === correctAnswer) bg = "#16a34a";
              else bg = "#2563eb";
            }
            return (
              <button
                key={i}
                onClick={() => handleOptionClick(opt)}
                disabled={selected !== null}
                className="option-btn"
                style={{
                  background: bg,
                  marginBottom: 0,
                  cursor: selected !== null ? "not-allowed" : "pointer",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {feedback && (
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 12,
              color: feedback.startsWith("Doğru") ? "#16a34a" : "#dc2626",
            }}
          >
            {feedback}
          </div>
        )}
        <div style={{ marginTop: 32, fontSize: 15, color: "#888" }}>
          <b>6 adım algoritması:</b> Her kelimeyi 6 kez üst üste doğru
          bilirseniz, o kelimeyi öğrenmiş olursunuz.
          <br />
          Yanlış yaparsanız sayaç sıfırlanır. Tekrar aralıkları: 1 gün, 1 hafta,
          1 ay, 3 ay, 6 ay, 1 yıl.
        </div>
      </div>
    </div>
  );
}
