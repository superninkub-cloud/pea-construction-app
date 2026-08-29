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

import CopilotWidget from "./components/CopilotWidget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <AuthWrapper>
          <ClientLayout>
            {children}
            <CopilotWidget />
          </ClientLayout>
        </AuthWrapper>
      </body>
    </html>
  );
}
