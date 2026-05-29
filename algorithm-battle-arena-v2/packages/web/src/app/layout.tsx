import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Algorithm Battle Arena",
  description: "Competitive coding battle arena — fight for glory!",
  icons: { icon: "/aba-favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen arena-bg">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
