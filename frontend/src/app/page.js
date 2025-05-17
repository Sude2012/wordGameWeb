"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";
import "./globals.css";

const HomePage = () => {
  return (
    <div className="container">
      <Navbar />

      <div className="buttons">
        <Link href="/login">
          <button className="btn">Giriş Yap</button>
        </Link>
        <Link href="/signup">
          <button className="btn">Kaydol</button>
        </Link>
      </div>

      <Footer />

      <style jsx>{`
        .container {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          text-align: center;
          padding-top: 120px;
        }

        .container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("/wordgame2.png");
          background-size: cover;
          background-position: center;
          opacity: 0.9;
          z-index: -1;
        }

        .buttons {
          margin-top: 80px;
        }

        .btn {
          background-color: #4caf50;
          color: white;
          font-size: 1.4rem;
          padding: 15px 30px;
          margin: 10px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s ease;
          margin-top: 350px;
        }

        .btn:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
