import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Ticaret AI Asistanı",
  description: "Yapay zeka ile e-ticaret başlık ve açıklamaları üretin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <script src="https://cdn.tailwindcss.com"></script>
      <body>{children}</body>
    </html>
  );
}
