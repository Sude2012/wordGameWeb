"use client";

import { useState, useEffect } from "react";

export default function Quiz() {
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5278/api/words")
      .then((res) => res.json())
      .then((data) => {
        console.log("API'den gelen veri:", data); // Veriyi kontrol et
        setWords(data);
      })
      .catch((err) => console.error("Kelime yüklenirken hata:", err));
  }, []);

  if (words.length === 0) return <p>Kelime listesi yükleniyor...</p>;

  const currentWord = words[index];

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctAnswer = currentWord.translation.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      setFeedback("✅ Doğru!");
      setDisabled(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setAnswer("");
        setFeedback("");
        setDisabled(false);
      }, 2000);
    } else {
      setFeedback("❌ Yanlış, tekrar deneyin.");
      setAnswer("");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Quiz Ekranı</h1>

      {/* Resim - Soruyla birlikte görünsün */}
      {currentWord.Picture && (
        <div style={styles.imageContainer}>
          <img
            src={
              currentWord.Picture.startsWith("http")
                ? currentWord.Picture
                : `/${currentWord.Picture}`
            }
            alt={currentWord.text}
            style={styles.image}
            onError={(e) => {
              e.target.style.display = "none"; // Resim yüklenemezse gizle
            }}
          />
        </div>
      )}

      {/* Soru */}
      <p style={styles.question}>
        İngilizcesi: <strong>{currentWord.text}</strong>
      </p>

      {/* Örnek Cümleler - Soruyla birlikte görünsün */}
      {currentWord.Samples && currentWord.Samples.length > 0 && (
        <div style={styles.samplesContainer}>
          <p style={styles.samplesTitle}>Örnek Cümleler:</p>
          <ul style={styles.samplesList}>
            {currentWord.Samples.map((sample, i) => (
              <li key={i} style={styles.sampleItem}>
                {sample}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Türkçe karşılığını yazın"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={styles.input}
          disabled={disabled}
          autoFocus
        />
        <button type="submit" disabled={disabled} style={styles.button}>
          Cevapla
        </button>
      </form>

      {/* Geri Bildirim */}
      <p
        style={{
          ...styles.feedback,
          color: feedback.includes("Doğru") ? "green" : "red",
        }}
      >
        {feedback}
      </p>

      {/* Sonraki Kelime Butonu */}
      <button
        onClick={() => {
          setIndex((prev) => (prev + 1) % words.length);
          setAnswer("");
          setFeedback("");
          setDisabled(false);
        }}
        style={styles.nextButton}
      >
        Sonraki Kelime
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "30px auto",
    padding: "25px",
    border: "2px solid #4a90e2",
    borderRadius: "12px",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f8f9fa",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "25px",
    color: "#2c3e50",
    fontSize: "1.8rem",
  },
  imageContainer: {
    margin: "0 auto 20px",
    maxWidth: "100%",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "250px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  question: {
    fontSize: "1.4rem",
    margin: "20px 0",
    color: "#34495e",
  },
  samplesContainer: {
    margin: "20px 0",
    textAlign: "left",
    backgroundColor: "#e8f4fc",
    padding: "15px",
    borderRadius: "8px",
  },
  samplesTitle: {
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#2980b9",
  },
  samplesList: {
    paddingLeft: "20px",
    margin: "0",
  },
  sampleItem: {
    marginBottom: "8px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  input: {
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ced4da",
    outline: "none",
    transition: "border-color 0.3s",
  },
  button: {
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#3498db",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  feedback: {
    margin: "20px 0",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  nextButton: {
    marginTop: "15px",
    padding: "10px 20px",
    fontSize: "0.9rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#7f8c8d",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};
