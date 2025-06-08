"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// === MASALSI STORYBOOK AI GÖRSEL PROMPTU ===
function WordChainStory({ words = [] }) {
  const [story, setStory] = useState("");

  // Görselleri sırayla göstermek için state ve efekt
  const imagePaths = [
    "/image.png",
    "/image2.png",
    "/image3.png",
    "/image4.png",
    "/image5.png",
    "/image6.png",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState([]);

  // Örnek cümleler
  const exampleSentences = {
    home: [
      "I feel safe when I am at home.",
      "Our home is very cozy and warm.",
      "We invited our friends to our home.",
    ],
    bear: [
      "The bear caught a fish in the river.",
      "A brown bear lives in the forest.",
      "Bears like to eat honey.",
    ],
    table: [
      "There is a vase on the table.",
      "We ate dinner at the table.",
      "The table is made of wood.",
    ],
    book: [
      "I read a book every night.",
      "She borrowed a book from the library.",
      "This book is very interesting.",
    ],
    bag: [
      "My bag is full of books.",
      "She bought a new school bag.",
      "There is an apple in my bag.",
    ],
    jacket: [
      "It's cold, so I wore my jacket.",
      "His jacket is blue and warm.",
      "She forgot her jacket at school.",
    ],
    car: [
      "My father drives a red car.",
      "The car stopped at the traffic light.",
      "I cleaned my car yesterday.",
    ],
    mouse: [
      "A mouse ran across the kitchen.",
      "The mouse found some cheese.",
      "There is a little mouse in the corner.",
    ],
    butterfly: [
      "The butterfly landed on the flower.",
      "She saw a colorful butterfly in the garden.",
      "Butterflies have beautiful wings.",
    ],
    bird: [
      "A bird is singing in the tree.",
      "Birds build nests in spring.",
      "I saw a blue bird in the park.",
    ],
    dog: [
      "The dog barked all night.",
      "I took my dog for a walk.",
      "Her dog is very friendly.",
    ],
    apple: [
      "He ate a green apple.",
      "Apples are my favorite fruit.",
      "There is an apple on the table.",
    ],
    camel: [
      "A camel can walk in the desert for days.",
      "The camel has two humps.",
      "We rode a camel in Egypt.",
    ],
    sea: [
      "The sea is calm today.",
      "We swam in the sea during our vacation.",
      "She loves watching the sea waves.",
    ],
    tiger: [
      "The tiger is a powerful animal.",
      "A tiger moved silently through the jungle.",
      "He saw a tiger at the zoo.",
    ],
    brain: [
      "The brain controls our body.",
      "She has a sharp brain.",
      "A healthy brain needs good sleep.",
    ],
    boy: [
      "The boy is wearing glasses.",
      "A boy walked through the forest.",
      "He is a curious boy.",
    ],
    robin: [
      "A robin perched on the branch.",
      "Robins sing beautifully in the morning.",
      "He saw a robin in the garden.",
    ],
  };

  function getRandomSentence(word) {
    const arr = exampleSentences[word.toLowerCase()];
    if (arr && arr.length > 0) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    return `This is a sample sentence with "${word}".`;
  }

  useEffect(() => {
    if (words.length < 5) {
      setStory("");
      return;
    }

    const storyText = `Once upon a time, ${words.join(
      ", "
    )} met in a magical story!`;
    setStory(storyText);
  }, [words]);

  // Görselleri karıştırmak için efekt
  useEffect(() => {
    const shuffled = [...imagePaths].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
  }, [words]);

  // Karıştırılmış görselleri sırayla göstermek için efekt
  useEffect(() => {
    if (shuffledImages.length > 0) {
      setCurrentImageIndex(0);
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [shuffledImages]);

  if (words.length < 5) return null;

  return (
    <div
      style={{
        margin: "30px 0",
        padding: 24,
        borderRadius: 12,
        background: "#fdf8f3",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <h2>Word Chain Story</h2>
      <p>
        <b>Kelimeler:</b> {words.join(", ")}
      </p>
      <p style={{ fontStyle: "italic", marginBottom: 20 }}>{story}</p>

      {/* Tek bir görsel alanı, sırayla güncellenen */}
      <div style={{ marginBottom: 20, height: 220, position: "relative" }}>
        <img
          src={shuffledImages[currentImageIndex]}
          alt={`Image ${currentImageIndex + 1}`}
          style={{
            width: 200,
            height: 200,
            objectFit: "cover",
            borderRadius: 12,
            border: "2px solid #ccc",
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            transition: "opacity 1s ease-in-out",
          }}
        />
      </div>

      <div
        style={{
          background: "#f0f8ff",
          borderRadius: 8,
          padding: 16,
          textAlign: "left",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <b>Example Sentences:</b>
        <ul style={{ marginTop: 10 }}>
          {words.map((w, i) => (
            <li key={i}>{getRandomSentence(w)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// === ANA QUIZ BİLEŞENİ ===
export default function Quiz() {
  const [words, setWords] = useState([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [newWordCount, setNewWordCount] = useState(10);
  const [score, setScore] = useState(0);
  const [learnedWords, setLearnedWords] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // User info state
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // Wordle State
  const [showWordle, setShowWordle] = useState(false);
  const [wordleGuesses, setWordleGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [wordleFeedback, setWordleFeedback] = useState("");
  const [wordleCompleted, setWordleCompleted] = useState(false);
  const [targetWord, setTargetWord] = useState("");
  // Word Chain toggle state
  const [showWordChain, setShowWordChain] = useState(false);

  // Kullanıcı id'si (şimdilik sabit)
  const userId = 1;

  const router = useRouter();

  // Kelimeleri çek ve kullanıcı bilgisini al
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    if (email) setUserEmail(email);
    if (name) setUserName(name);

    fetch("http://localhost:5278/api/words")
      .then((res) => res.json())
      .then((data) => setWords(data))
      .catch((err) => console.error("Kelime yüklenirken hata:", err));
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("newWordCount");
    if (savedSettings) {
      setNewWordCount(parseInt(savedSettings));
    }
  }, []);

  useEffect(() => {
    if (learnedWords.length >= newWordCount && newWordCount !== 0) {
      setSessionCompleted(true);
    } else {
      setSessionCompleted(false);
    }
  }, [learnedWords, newWordCount]);

  const currentFilteredWords = words.slice(0, newWordCount);
  const currentWord = currentFilteredWords.find(
    (w) => !learnedWords.includes(w.id)
  );

  // --- Word Chain için random 5 kelime seç ---
  const [chainWords, setChainWords] = useState([]);
  useEffect(() => {
    if (currentFilteredWords.length >= 5) {
      const selected = [...currentFilteredWords]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map((w) => w.text);
      setChainWords(selected);
    }
  }, [words, newWordCount]);

  // --- 6 adımda öğrenme POST ---
  async function submitAnswer(isCorrect) {
    if (!currentWord) return;
    const wordId = currentWord.id;
    const response = await fetch("http://localhost:5278/api/exam/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, wordId, isCorrect }),
    });
    if (!response.ok) {
      setFeedback("Bir hata oluştu!");
      return;
    }
    const data = await response.json();
    if (data.Status === "learned") {
      setFeedback("👏 6 adım tamamlandı, bu kelimeyi artık biliyorsun!");
    } else if (isCorrect) {
      setFeedback(`✅ Doğru! (Doğru üst üste: ${data.CorrectStreak}/6)`);
    } else {
      setFeedback("❌ Yanlış, tekrar deneyeceksin!");
    }
  }

  // --- Cevap gönderme ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWord) return;
    const correctAnswer = currentWord.translation.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer;
    setDisabled(true);
    await submitAnswer(isCorrect);
    if (isCorrect) {
      setScore((prev) => prev + 10);
      setLearnedWords((prev) => [...prev, currentWord.id]);
    }
    setTimeout(() => {
      setAnswer("");
      setFeedback("");
      setDisabled(false);
    }, 1200);
  };

  // --- Wordle kodu ---
  const getWordleWords = () =>
    currentFilteredWords
      .map((word) => word.text.toLowerCase())
      .filter((word) => word.length === 5);

  const toggleWordle = () => {
    setShowWordle(!showWordle);
    if (!showWordle) {
      setWordleGuesses([]);
      setCurrentGuess("");
      setWordleFeedback("");
      setWordleCompleted(false);
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
      setScore((prev) => prev + 15);
    } else if (newGuesses.length >= 4) {
      setWordleFeedback(`Maalesef bilemediniz. Doğru kelime: ${targetWord}`);
      setWordleCompleted(true);
    } else {
      setWordleFeedback("");
    }

    setCurrentGuess("");
  };

  // === CSS ===
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(90deg, rgba(88,86,117,1) 0%, rgba(61,99,158,0.756578947368421) 35%, rgba(170,230,201,1) 82%);
        }
        .container { max-width: 520px; margin: 40px auto; padding: 30px 25px; background-color: rgba(255 255 255 / 0.9);
          border-radius: 16px; box-shadow: 0 15px 25px rgba(0,0,0,0.15); text-align: center; position: relative; animation: fadeIn 1s ease forwards;}
        .back-btn { position: absolute; left: 24px; top: 24px; background: #2563eb; color: white; border: none; border-radius: 8px; padding: 10px 22px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(37,99,235,0.15); transition: background 0.2s, transform 0.2s; z-index: 2;}
        .back-btn:hover { background: #1d4ed8; transform: scale(1.05); }
        h1 { margin-bottom: 30px; font-weight: 700; font-size: 2rem; color: #34495e; letter-spacing: 1.3px; text-shadow: 1px 1px 4px #a3b1c6;}
        label { font-weight: 600; font-size: 1rem; display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #34495e;}
        input[type="number"] { width: 60px; padding: 6px 10px; border-radius: 8px; border: 2px solid #3498db; font-weight: 600; font-size: 1rem; transition: border-color 0.3s ease;}
        input[type="number"]:focus { outline: none; border-color: #2ecc71; box-shadow: 0 0 8px #2ecc71;}
        .score { font-weight: 700; font-size: 1.2rem; margin-top: 5px; color: #27ae60; text-shadow: 1px 1px 2px #b7e4c7;}
        .learned-count { font-size: 0.9rem; color: #7f8c8d; margin-bottom: 25px;}
        .question { font-size: 1.5rem; font-weight: 700; margin-bottom: 15px; color: #2c3e50; text-shadow: 1px 1px 3px #a3b1c6; animation: slideIn 0.7s ease forwards;}
        .samples-container { background-color: #e6f0ff; padding: 18px 20px; border-radius: 12px; margin-bottom: 25px; text-align: left; box-shadow: inset 0 0 10px #cce0ff; animation: fadeIn 1.2s ease forwards;}
        .samples-title { font-weight: 700; margin-bottom: 10px; color: #1a73e8;}
        .samples-list { margin: 0; padding-left: 20px; list-style-type: disc; color: #34495e; font-size: 0.95rem; line-height: 1.4;}
        form { display: flex; flex-direction: column; gap: 18px; margin-top: 15px;}
        input[type="text"] { padding: 14px 18px; font-size: 1.1rem; border-radius: 10px; border: 2px solid #3498db; transition: border-color 0.3s ease; outline: none; box-shadow: 0 2px 6px rgba(52,152,219,0.2);}
        input[type="text"]:focus:not(:disabled) { border-color: #2ecc71; box-shadow: 0 0 10px #2ecc71;}
        input[type="text"]:disabled { background-color: #d1e7dd; color: #495057; cursor: not-allowed;}
        button { padding: 14px; font-size: 1.15rem; border-radius: 10px; border: none; background: linear-gradient(45deg, #3498db, #2980b9); color: white; font-weight: 700; cursor: pointer; box-shadow: 0 6px 12px rgba(41,128,185,0.6); transition: background 0.4s ease, box-shadow 0.3s ease; user-select: none;}
        button:hover:not(:disabled) { background: linear-gradient(45deg, #2ecc71, #27ae60); box-shadow: 0 8px 16px rgba(39,174,96,0.8);}
        button:disabled { background: #95a5a6; cursor: not-allowed; box-shadow: none; color: #ecf0f1;}
        .feedback { margin-top: 22px; font-weight: 700; font-size: 1.2rem; min-height: 32px; animation: feedbackFlash 1.3s ease forwards;}
        .feedback.correct { color: #27ae60; text-shadow: 1px 1px 5px #a3d9a5;}
        .feedback.wrong { color: #c0392b; text-shadow: 1px 1px 5px #eaa6a6;}
        .toggle-wordle-btn { margin-top: 20px; background: linear-gradient(45deg, #9b59b6, #8e44ad);}
        .toggle-wordle-btn:hover { background: linear-gradient(45deg, #8e44ad, #7d3c98);}
        /* WORDLE STYLE */
        .wordle-container { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);}
        .wordle-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 15px; color: #2c3e50;}
        .wordle-grid { display: grid; grid-template-rows: repeat(4, 1fr); gap: 8px; margin-bottom: 20px;}
        .wordle-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;}
        .wordle-cell { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; border: 2px solid #ddd; border-radius: 8px; background-color: white;}
        .wordle-cell.correct { background-color: #2ecc71; color: white; border-color: #27ae60;}
        .wordle-cell.present { background-color: #f39c12; color: white; border-color: #e67e22;}
        .wordle-cell.absent { background-color: #95a5a6; color: white; border-color: #7f8c8d;}
        .wordle-feedback { margin-top: 10px; font-weight: 600; min-height: 24px; color: #e74c3c;}
        .wordle-feedback.success { color: #27ae60;}
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
        @keyframes slideIn { from {opacity: 0; transform: translateX(-30px);} to {opacity: 1; transform: translateX(0);} }
        @keyframes feedbackFlash { 0% {opacity: 0;} 30% {opacity: 1;} 70% {opacity: 1;} 100% {opacity: 0;} }
        @media (max-width: 600px) {
          .container { margin: 20px 15px; padding: 20px 18px;}
          h1 { font-size: 1.5rem;}
          .question { font-size: 1.2rem;}
          button, input[type="text"], input[type="number"] { font-size: 1rem; padding: 12px 15px;}
          .wordle-cell { width: 40px; height: 40px; font-size: 1.2rem;}
        }
      `}</style>
      <div className="container">
        <button className="back-btn" onClick={() => router.push("/dashboard")}>
          ← Geri
        </button>
        <h1>Quiz Ekranı</h1>
        {userName && (
          <p
            style={{
              fontSize: "1.1rem",
              color: "#2c3e50",
              marginBottom: "20px",
            }}
          >
            Hoş geldin, {userName}!
          </p>
        )}

        {/* Wordle & Word Chain toggle buttons container */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            margin: "20px 0",
          }}
        >
          <button
            className="toggle-wordle-btn"
            onClick={() => setShowWordChain(!showWordChain)}
          >
            {showWordChain ? "Word Chain'i Kapat" : "Word Chain'i Göster"}
          </button>
        </div>
        {showWordChain && <WordChainStory words={chainWords} />}

        <label>
          Günlük Yeni Kelime Sayısı:
          <input
            type="number"
            value={newWordCount}
            onChange={(e) => setNewWordCount(Number(e.target.value))}
            min="1"
            max="50"
          />
        </label>

        <p className="score">Puan: {score}</p>
        <p className="learned-count">
          Öğrenilen kelime sayısı: {learnedWords.length}/{newWordCount}
        </p>

        {sessionCompleted ? (
          <div className="feedback correct" style={{ fontSize: "1.3rem" }}>
            🎉 Bugünlük bilmeniz gereken kelimeleri bildiniz!
          </div>
        ) : (
          <>
            {currentWord && (
              <>
                <div className="question">
                  Kelimenin İngilizcesi: {currentWord.text}
                </div>
                <div className="samples-container">
                  <div className="samples-title">Örnek Cümleler:</div>
                  <ul className="samples-list">
                    {currentWord.samples && currentWord.samples.length > 0 ? (
                      currentWord.samples.map((sample, i) => (
                        <li key={i}>{sample}</li>
                      ))
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
              </>
            )}
          </>
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
                    if (guess && targetWord) {
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
                        {letter ? letter.toUpperCase() : ""}
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
