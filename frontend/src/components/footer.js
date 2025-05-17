"use client";

const Footer = () => {
  return (
    <div className="footer">
      <p>&copy; 2025 Kelime Oyunu. Tüm Hakları Saklıdır.</p>
      <style jsx>{`
        .footer {
          width: 100%;
          background-color: #333;
          color: white;
          padding: 10px;
          text-align: center;
          position: fixed;
          bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default Footer;
