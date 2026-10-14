import RoleGuard from "../components/RoleGuard";

export default function ImportantLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
