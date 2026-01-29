import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mala3ebna - Book Your Pitches",
  description: "Experience the ultimate football pitch booking platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { Toaster } from "sonner";
import { LocaleProvider } from "@/components/providers/locale-context";
import { AuthProvider } from "@/components/providers/auth-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { CapacitorProvider } from "@/components/providers/capacitor-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <NotificationProvider>
            <CapacitorProvider>
              <LocaleProvider>
                {children}
                <Toaster position="top-center" richColors />
              </LocaleProvider>
            </CapacitorProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
