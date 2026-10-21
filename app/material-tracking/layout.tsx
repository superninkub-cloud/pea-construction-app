import RoleGuard from "../components/RoleGuard";

export default function MaterialTrackingLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
