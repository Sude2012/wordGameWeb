"use client";

const Navbar = () => {
  return (
    <div className="navbar">
      <h2>Kelime Oyununa Hoşgeldiniz</h2>
      <style jsx>{`
        .navbar {
          width: 100%;
          background-color: #333;
          color: white;
          padding: 50px;
          text-align: center;
        }

        .navbar h2 {
          margin: 0;
          font-size: 3.1rem;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
