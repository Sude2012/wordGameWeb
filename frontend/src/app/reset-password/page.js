"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== newPasswordRepeat) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (!email || !oldPassword || !newPassword) {
      setError("Tüm alanları doldurun.");
      return;
    }
    const res = await fetch("http://localhost:5278/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(
        "Şifre başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz..."
      );
      setTimeout(() => router.push("/login"), 1800);
    } else {
      setError(data.message || "Bir hata oluştu.");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Şifre Yenile</h1>
        <form onSubmit={handleSubmit} className="reset-form">
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
            <label htmlFor="old">Eski Şifre</label>
            <input
              type="password"
              id="old"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="new">Yeni Şifre</label>
            <input
              type="password"
              id="new"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="new2">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              id="new2"
              value={newPasswordRepeat}
              onChange={(e) => setNewPasswordRepeat(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="reset-btn">
            Şifreyi Güncelle
          </button>
        </form>
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
        .reset-btn {
          width: 100%;
          background-color: #2563eb;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .reset-btn:hover {
          background-color: #1d4ed8;
        }
        .error-message {
          color: red;
          font-size: 0.9rem;
          margin-top: 10px;
        }
        .success-message {
          color: #16a34a;
          font-size: 0.95rem;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
