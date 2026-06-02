import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Wexa | B2B Procurement & Inventory Platform",
  description: "Simplify and optimize the B2B procurement workflow between distributors and manufacturers with real-time stock sync and automated purchase orders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
