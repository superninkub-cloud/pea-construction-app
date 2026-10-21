import RoleGuard from "../components/RoleGuard";

export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
