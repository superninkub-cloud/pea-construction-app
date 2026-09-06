import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "PEA Construction Update",
  description: "ระบบอัพเดทสถานะงานก่อสร้าง",
  icons: {
    icon: '/favicon.png?v=4',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import AuthWrapper from "./components/AuthWrapper";

import ClientLayout from "./components/ClientLayout";


import { Prompt } from 'next/font/google';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-prompt',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className={`${prompt.className} font-sans`}>
        <AuthWrapper>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthWrapper>
      </body>
    </html>
  );
}
