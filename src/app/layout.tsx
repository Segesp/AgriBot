import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgriBot Dashboard - Monitoreo IoT",
  description: "Dashboard para visualizar datos de sensores enviados por ESP32 mediante SIM800L",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
