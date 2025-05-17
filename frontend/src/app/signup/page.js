"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5278/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username, // Backend'deki 'Username' ile uyumlu
          email, // Backend'deki 'Email' ile uyumlu
          passwordHash: password, // Backend'deki 'PasswordHash' ile uyumlu
        }),
      });

      const data = await response.json(); // 🔍 Body'i JSON olarak oku

      if (!response.ok) {
        throw new Error(data.message || "Bilinmeyen bir hata oluştu.");
      }

      alert("Kayıt başarılı!");
      router.push("/login");
    } catch (error) {
      console.error("Kayıt sırasında hata:", error.message);
      alert(`Kayıt hatası: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Kaydol</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            Kaydol
          </button>
        </form>

        <p>
          Zaten hesabınız var mı? <Link href="/login">Giriş Yap</Link>
        </p>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to right, #e3f2fd, #e8f5e9);
          padding: 40px 20px;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        h1 {
          margin-bottom: 25px;
        }

        .input-group {
          margin-bottom: 20px;
          text-align: left;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        .btn {
          width: 100%;
          background-color: #4caf50;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .btn:hover {
          background-color: #45a049;
        }

        p {
          margin-top: 20px;
          font-size: 0.9rem;
        }

        a {
          color: #4caf50;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
