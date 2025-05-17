"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ⭐️ yönlendirme için eklendi

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter(); // ⭐️ yönlendirme hook'u

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5278/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        passwordHash: password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Giriş başarılı:", data);
      router.push("/dashboard"); // ⭐️ Giriş başarılıysa oyun sayfasına yönlendir
    } else if (response.status === 401) {
      setErrorMessage("Geçersiz e-posta veya şifre");
    } else {
      const errorData = await response.json();
      setErrorMessage(errorData.message || "Bir hata oluştu");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Giriş Yap</h1>
        <form onSubmit={handleSubmit}>
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

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="btn">
            Giriş Yap
          </button>
        </form>

        <p>
          Hesabınız yok mu? <Link href="/signup">Kaydol</Link>
        </p>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to right, #e0f7fa, #e8f5e9);
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

        .error-message {
          color: red;
          font-size: 0.9rem;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
