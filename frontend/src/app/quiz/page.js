"use client";

import { useState, useEffect } from "react";

export default function Quiz() {
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [newWordCount, setNewWordCount] = useState(10);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState([]);
  const [showWordle, setShowWordle] = useState(false);
  const [wordleGuesses, setWordleGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [wordleFeedback, setWordleFeedback] = useState("");
  const [wordleCompleted, setWordleCompleted] = useState(false);
  const [targetWord, setTargetWord] = useState("");

  useEffect(() => {
    fetch("http://localhost:5278/api/words")
      .then((res) => res.json())
      .then((data) => {
        console.log("API'den gelen veri:", data);
        setWords(data);
      })
      .catch((err) => console.error("Kelime yüklenirken hata:", err));
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("newWordCount");
    if (savedSettings) {
      setNewWordCount(parseInt(savedSettings));
    }
  }, []);

  const currentFilteredWords = words.slice(0, newWordCount);
  const currentWord = currentFilteredWords[index % currentFilteredWords.length];

  // Get 5-letter English words from the current word list for Wordle
  const getWordleWords = () => {
    return currentFilteredWords
      .map((word) => word.text.toLowerCase())
      .filter((word) => word.length === 5);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctAnswer = currentWord.translation.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      setFeedback("✅ Doğru!");
      setDisabled(true);
      setScore((prev) => prev + 10);

      const progress = userProgress[currentWord.id] || [];
      const updatedProgress = [...progress, new Date().toISOString()];

      if (
        updatedProgress.length >= 6 &&
        !learnedWords.includes(currentWord.id)
      ) {
        console.log("🎉 Öğrenilen kelime:", currentWord.text);
        setLearnedWords((prev) => [...prev, currentWord.id]);
      }

      setUserProgress({ ...userProgress, [currentWord.id]: updatedProgress });

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % currentFilteredWords.length);
        setAnswer("");
        setFeedback("");
        setDisabled(false);
      }, 1500);
    } else {
      setFeedback("❌ Yanlış, tekrar deneyin.");
      setAnswer("");
    }
  };

  const handleSettingsChange = (e) => {
    const value = parseInt(e.target.value);
    setNewWordCount(value);
    localStorage.setItem("newWordCount", value);
  };

  // Wordle functions
  const handleWordleGuess = (e) => {
    e.preventDefault();

    if (currentGuess.length !== 5) {
      setWordleFeedback("Kelime 5 harfli olmalıdır!");
      return;
    }

    const wordleWords = getWordleWords();
    if (!wordleWords.includes(currentGuess.toLowerCase())) {
      setWordleFeedback("Bu kelime quizde sorulan kelimeler arasında değil!");
      return;
    }

    const newGuesses = [...wordleGuesses, currentGuess.toLowerCase()];
    setWordleGuesses(newGuesses);

    if (currentGuess.toLowerCase() === targetWord) {
      setWordleFeedback("Tebrikler! Doğru kelimeyi buldunuz!");
      setWordleCompleted(true);
      setScore((prev) => prev + 15); // Add 15 points for completing Wordle
    } else if (newGuesses.length >= 4) {
      setWordleFeedback(`Maalesef bilemediniz. Doğru kelime: ${targetWord}`);
      setWordleCompleted(true);
    } else {
      setWordleFeedback("");
    }

    setCurrentGuess("");
  };

  const toggleWordle = () => {
    setShowWordle(!showWordle);
    if (!showWordle) {
      // Reset Wordle game when showing it
      setWordleGuesses([]);
      setCurrentGuess("");
      setWordleFeedback("");
      setWordleCompleted(false);
      // Select a random target word from 5-letter quiz words
      const wordleWords = getWordleWords();
      if (wordleWords.length > 0) {
        setTargetWord(
          wordleWords[Math.floor(Math.random() * wordleWords.length)]
        );
      } else {
        setWordleFeedback("Quizde 5 harfli kelime bulunamadı!");
        setWordleCompleted(true);
      }
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(90deg, rgba(88,86,117,1) 0%, rgba(61,99,158,0.756578947368421) 35%, rgba(170,230,201,1) 82%);
        }
        .container {
          max-width: 520px;
          margin: 40px auto;
          padding: 30px 25px;
          background-color: rgba(255 255 255 / 0.9);
          border-radius: 16px;
          box-shadow: 0 15px 25px rgba(0,0,0,0.15);
          text-align: center;
          position: relative;
          animation: fadeIn 1s ease forwards;
        }
        h1 {
          margin-bottom: 30px;
          font-weight: 700;
          font-size: 2rem;
          color: #34495e;
          letter-spacing: 1.3px;
          text-shadow: 1px 1px 4px #a3b1c6;
        }
        label {
          font-weight: 600;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #34495e;
        }
        input[type="number"] {
          width: 60px;
          padding: 6px 10px;
          border-radius: 8px;
          border: 2px solid #3498db;
          font-weight: 600;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        input[type="number"]:focus {
          outline: none;
          border-color: #2ecc71;
          box-shadow: 0 0 8px #2ecc71;
        }
        .score {
          font-weight: 700;
          font-size: 1.2rem;
          margin-top: 5px;
          color: #27ae60;
          text-shadow: 1px 1px 2px #b7e4c7;
        }
        .learned-count {
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 25px;
        }
        .image-container {
          margin: 0 auto 25px;
          max-width: 100%;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 15px rgba(0,0,0,0.1);
          animation: zoomIn 0.8s ease forwards;
        }
        .image-container img {
          max-width: 100%;
          max-height: 280px;
          display: block;
          border-radius: 14px;
          transition: transform 0.3s ease;
        }
        .image-container img:hover {
          transform: scale(1.05);
        }
        .question {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 15px;
          color: #2c3e50;
          text-shadow: 1px 1px 3px #a3b1c6;
          animation: slideIn 0.7s ease forwards;
        }
        .samples-container {
          background-color: #e6f0ff;
          padding: 18px 20px;
          border-radius: 12px;
          margin-bottom: 25px;
          text-align: left;
          box-shadow: inset 0 0 10px #cce0ff;
          animation: fadeIn 1.2s ease forwards;
        }
        .samples-title {
          font-weight: 700;
          margin-bottom: 10px;
          color: #1a73e8;
        }
        .samples-list {
          margin: 0;
          padding-left: 20px;
          list-style-type: disc;
          color: #34495e;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-top: 15px;
        }
        input[type="text"] {
          padding: 14px 18px;
          font-size: 1.1rem;
          border-radius: 10px;
          border: 2px solid #3498db;
          transition: border-color 0.3s ease;
          outline: none;
          box-shadow: 0 2px 6px rgba(52,152,219,0.2);
        }
        input[type="text"]:focus:not(:disabled) {
          border-color: #2ecc71;
          box-shadow: 0 0 10px #2ecc71;
        }
        input[type="text"]:disabled {
          background-color: #d1e7dd;
          color: #495057;
          cursor: not-allowed;
        }
        button {
          padding: 14px;
          font-size: 1.15rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(45deg, #3498db, #2980b9);
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 12px rgba(41,128,185,0.6);
          transition: background 0.4s ease, box-shadow 0.3s ease;
          user-select: none;
        }
        button:hover:not(:disabled) {
          background: linear-gradient(45deg, #2ecc71, #27ae60);
          box-shadow: 0 8px 16px rgba(39,174,96,0.8);
        }
        button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          box-shadow: none;
          color: #ecf0f1;
        }
        .feedback {
          margin-top: 22px;
          font-weight: 700;
          font-size: 1.2rem;
          min-height: 32px;
          animation: feedbackFlash 1.3s ease forwards;
        }
        .feedback.correct {
          color: #27ae60;
          text-shadow: 1px 1px 5px #a3d9a5;
        }
        .feedback.wrong {
          color: #c0392b;
          text-shadow: 1px 1px 5px #eaa6a6;
        }
        .next-button {
          margin-top: 28px;
          padding: 12px 26px;
          font-size: 1rem;
          border-radius: 10px;
          border: none;
          background-color: #7f8c8d;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;
          box-shadow: 0 4px 8px rgba(127,140,141,0.5);
        }
        .next-button:hover {
          background-color: #95a5a6;
        }
        .loading {
          font-size: 1.2rem;
          text-align: center;
          color: #34495e;
          margin-top: 100px;
          font-weight: 600;
          animation: fadeIn 1.2s ease forwards;
        }
        
        /* Wordle styles */
        .wordle-container {
          margin-top: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .wordle-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 15px;
          color: #2c3e50;
        }
        .wordle-grid {
          display: grid;
          grid-template-rows: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .wordle-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }
        .wordle-cell {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          border: 2px solid #ddd;
          border-radius: 8px;
          background-color: white;
        }
        .wordle-cell.correct {
          background-color: #2ecc71;
          color: white;
          border-color: #27ae60;
        }
        .wordle-cell.present {
          background-color: #f39c12;
          color: white;
          border-color: #e67e22;
        }
        .wordle-cell.absent {
          background-color: #95a5a6;
          color: white;
          border-color: #7f8c8d;
        }
        .wordle-feedback {
          margin-top: 10px;
          font-weight: 600;
          min-height: 24px;
          color: #e74c3c;
        }
        .wordle-feedback.success {
          color: #27ae60;
        }
        .toggle-wordle-btn {
          margin-top: 20px;
          background: linear-gradient(45deg, #9b59b6, #8e44ad);
        }
        .toggle-wordle-btn:hover {
          background: linear-gradient(45deg, #8e44ad, #7d3c98);
        }

        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity: 1;}
        }
        @keyframes zoomIn {
          from {opacity: 0; transform: scale(0.85);}
          to {opacity: 1; transform: scale(1);}
        }
        @keyframes slideIn {
          from {opacity: 0; transform: translateX(-30px);}
          to {opacity: 1; transform: translateX(0);}
        }
        @keyframes feedbackFlash {
          0% {opacity: 0;}
          30% {opacity: 1;}
          70% {opacity: 1;}
          100% {opacity: 0;}
        }

        @media (max-width: 600px) {
          .container {
            margin: 20px 15px;
            padding: 20px 18px;
          }
          h1 {
            font-size: 1.5rem;
          }
          .question {
            font-size: 1.2rem;
          }
          button, input[type="text"], input[type="number"] {
            font-size: 1rem;
            padding: 12px 15px;
          }
          .wordle-cell {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
        }
      `}</style>

      <div className="container">
        <h1>Quiz Ekranı</h1>

        <label>
          Günlük Yeni Kelime Sayısı:
          <input
            type="number"
            value={newWordCount}
            onChange={handleSettingsChange}
            min="1"
            max="50"
          />
        </label>

        <p className="score">Puan: {score}</p>
        <p className="learned-count">
          Öğrenilen kelime sayısı: {learnedWords.length}
        </p>

        {currentWord?.picture && (
          <div className="image-container">
            <img
              src={`/${currentWord.picture}`}
              alt={currentWord.text}
              style={{ width: "200px", height: "auto" }}
            />
          </div>
        )}

        <div className="question">
          Kelimenin İngilizcesi: {currentWord?.text}
        </div>

        <div className="samples-container">
          <div className="samples-title">Örnek Cümleler:</div>
          <ul className="samples-list">
            {currentWord?.Samples && currentWord.Samples.length > 0 ? (
              currentWord.Samples.map((sample, i) => <li key={i}>{sample}</li>)
            ) : (
              <li>Örnek cümle bulunamadı.</li>
            )}
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Türkçe anlamını yazın"
            disabled={disabled}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" disabled={disabled || !answer.trim()}>
            Cevabı Kontrol Et
          </button>
        </form>

        {feedback && (
          <div
            className={`feedback ${
              feedback.startsWith("✅") ? "correct" : "wrong"
            }`}
          >
            {feedback}
          </div>
        )}

        <button className="toggle-wordle-btn" onClick={toggleWordle}>
          {showWordle ? "Wordle'ı Kapat" : "Wordle Oyna "}
        </button>

        {showWordle && (
          <div className="wordle-container">
            <div className="wordle-title">
              Wordle Bulmaca (Quiz Kelimelerinden)
            </div>
            <div className="wordle-grid">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div className="wordle-row" key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, cellIndex) => {
                    const guess = wordleGuesses[rowIndex];
                    const letter = guess ? guess[cellIndex] : "";
                    let cellClass = "wordle-cell";

                    if (guess) {
                      if (targetWord[cellIndex] === letter) {
                        cellClass += " correct";
                      } else if (targetWord.includes(letter)) {
                        cellClass += " present";
                      } else {
                        cellClass += " absent";
                      }
                    }

                    return (
                      <div className={cellClass} key={cellIndex}>
                        {letter.toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {!wordleCompleted && (
              <form onSubmit={handleWordleGuess}>
                <input
                  type="text"
                  value={currentGuess}
                  onChange={(e) =>
                    setCurrentGuess(e.target.value.toLowerCase())
                  }
                  placeholder="5 harfli kelime girin"
                  maxLength={5}
                  disabled={wordleCompleted}
                />
                <button type="submit" disabled={wordleCompleted}>
                  Tahmin Et
                </button>
              </form>
            )}

            {wordleFeedback && (
              <div
                className={`wordle-feedback ${
                  wordleFeedback.includes("Tebrikler") ? "success" : ""
                }`}
              >
                {wordleFeedback}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
