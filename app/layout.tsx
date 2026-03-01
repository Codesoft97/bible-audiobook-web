import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bible Audiobook",
  description:
    "Plataforma web para escutar a Biblia em audio, com autenticacao segura, perfis por familia e onboarding semelhante a streamings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={fontBody.variable}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
