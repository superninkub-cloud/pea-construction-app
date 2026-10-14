"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * จำกัดสิทธิ์การเข้าถึงหน้าเพจตาม role ที่เก็บไว้ใน sessionStorage ("pea_role")
 * ค่าเริ่มต้น: อนุญาตเฉพาะ admin (ผู้ใช้แผนก/user และผู้เยี่ยมชม/guest จะเข้าไม่ได้)
 */
export default function RoleGuard({ children, allowedRoles = ["admin"] }: RoleGuardProps) {
  const [role, setRole] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      setRole(sessionStorage.getItem("pea_role"));
    } catch (error) {
      setRole(null);
    }
    setChecked(true);
  }, []);

  // รอตรวจสอบสิทธิ์ก่อน เพื่อไม่ให้เนื้อหากะพริบให้ผู้เยี่ยมชมเห็น
  if (!checked) return null;

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          minHeight: "70vh",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            textAlign: "center",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "32px 24px",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#fef3c7",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
            ไม่มีสิทธิ์เข้าใช้งานหน้านี้
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>
            เมนูนี้เปิดให้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น
            กรุณาออกจากระบบแล้วเข้าสู่ระบบด้วยรหัสผ่านของผู้ดูแลระบบ
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "10px",
              background: "#7e22ce",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
