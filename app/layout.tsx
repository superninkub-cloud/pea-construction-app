import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "PEA Construction Update",
  description: "ระบบอัพเดทสถานะงานก่อสร้าง ของ ผกร.กรย.(ก3) ประจำปี 2569",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <div className="container-main">
          <Header />
          <div className="content-body">{children}</div>
        </div>
      </body>
    </html>
  );
}
