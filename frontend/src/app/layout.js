// app/layout.js

import Navbar from "../components/Navbar";
import Footer from "../components/footer";
//import "./globals.css";
export default function Layout({ children }) {
  return (
    <>
      <html lang="tr">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Kelime Ezberleme Sistemi</title>
        </head>
        <body>
          {children} {/* Sayfanın içeriği burada yüklenecek */}
        </body>
      </html>
    </>
  );
}
