import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analise Pessoal IA",
  description: "MVP de consultoria de imagem com IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
