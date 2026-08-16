"use client";

import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const auth = sessionStorage.getItem("pea_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Cha16072534") {
      sessionStorage.setItem("pea_auth", "true");
      sessionStorage.setItem("pea_role", "admin");
      setIsAuthenticated(true);
      setError(false);
    } else if (password === "pscc3") {
      sessionStorage.setItem("pea_auth", "true");
      sessionStorage.setItem("pea_role", "user");
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleGuestLogin = () => {
    sessionStorage.setItem("pea_auth", "true");
    sessionStorage.setItem("pea_role", "guest");
    setIsAuthenticated(true);
    setError(false);
  };

  // Avoid hydration mismatch by waiting for client mount
  if (!isClient) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#f8fafc",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginBottom: "20px" 
        }}>
          <div style={{ 
            backgroundColor: "#f3e8ff", 
            padding: "16px", 
            borderRadius: "50%",
            color: "#7e22ce"
          }}>
            <Lock size={32} />
          </div>
        </div>
        
        <h1 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "700", 
          color: "#1e293b",
          marginBottom: "8px"
        }}>
          ระบบจำกัดการเข้าถึง
        </h1>
        <p style={{ 
          color: "#64748b", 
          marginBottom: "32px",
          fontSize: "0.95rem"
        }}>
          กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบรายงานสถานะ
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: error ? "1px solid #ef4444" : "1px solid #cbd5e1",
                outline: "none",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              autoFocus
            />
            {error && (
              <p style={{ 
                color: "#ef4444", 
                fontSize: "0.85rem", 
                marginTop: "8px",
                fontWeight: "500"
              }}>
                รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#7e22ce",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
              marginBottom: "12px"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#6b21a8"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#7e22ce"}
          >
            เข้าสู่ระบบ
          </button>
          
          <button
            type="button"
            onClick={handleGuestLogin}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
          >
            เข้าใช้งานโหมดผู้เยี่ยมชม (ดูเท่านั้น)
          </button>
        </form>
      </div>
    </div>
  );
}
