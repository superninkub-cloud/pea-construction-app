import RoleGuard from "../components/RoleGuard";

export default function AppGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={["admin", "user", "office"]}
      message="คู่มือการใช้งานระบบเปิดให้เฉพาะบุคลากรแผนก ผกร. และผู้ดูแลระบบเท่านั้น ไม่เปิดให้บุคคลภายนอก (Guest) เข้าใช้งาน"
    >
      {children}
    </RoleGuard>
  );
}
