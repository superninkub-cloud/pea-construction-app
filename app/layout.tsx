import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "PEA Construction Update",
  description: "ระบบอัพเดทสถานะงานก่อสร้าง",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-wrapper">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
