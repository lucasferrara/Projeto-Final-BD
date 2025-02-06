import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gerenciamento de Dados de Eventos",
  description: "Sistema de gerenciamento de dados de eventos acadêmicos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
