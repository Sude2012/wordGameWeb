"use client";

import { useEffect, useState } from "react";

export default function QuizPage() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");

  // API'den kelimeleri al
  useEffect(() => {
    fetch("http://localhost:5254/api/words") // Backend adresin
      .then((res) => res.json())
      .then((data) => setWords(data))
      .catch((err) => console.error("Kelime verisi alınamadı:", err));
  }, []);

  if (words.length === 0) return <p>Loading...</p>;

  const currentWord = words[currentIndex];

  const checkAnswer = () => {
    if (
      userAnswer.trim().toLowerCase() === currentWord.Translation.toLowerCase()
    ) {
      setCorrectCount(correctCount + 1);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < words.length) {
      setCurrentIndex(nextIndex);
      setUserAnswer("");
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kelime Testi</h1>

      {showResult ? (
        <div className="text-lg">
          Test tamamlandı! Doğru sayısı: {correctCount} / {words.length}
        </div>
      ) : (
        <div className="space-y-4">
          <p>
            <strong>İngilizce:</strong> {currentWord.Text}
          </p>
          <input
            type="text"
            className="border px-2 py-1"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Türkçe karşılığını yaz"
          />
          <button
            onClick={checkAnswer}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Cevabı Kontrol Et
          </button>
        </div>
      )}
    </div>
  );
}
