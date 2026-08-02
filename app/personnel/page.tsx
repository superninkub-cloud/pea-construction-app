"use client";

import ClientLayout from "../components/ClientLayout";
import AuthWrapper from "../components/AuthWrapper";
import Personnel from "../components/Personnel";

export default function PersonnelPage() {
  return (
    <AuthWrapper>
      <ClientLayout>
        <Personnel />
      </ClientLayout>
    </AuthWrapper>
  );
}
