import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "PEA Construction Update",
  description: "ระบบอัพเดทสถานะงานก่อสร้าง",
};

import AuthWrapper from "./components/AuthWrapper";

import ClientLayout from "./components/ClientLayout";

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
          </ClientLayout>
        </AuthWrapper>
      </body>
    </html>
  );
}
