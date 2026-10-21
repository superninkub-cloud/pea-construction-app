import RoleGuard from "../components/RoleGuard";

export default function MyTasksLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
