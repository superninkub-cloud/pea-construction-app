"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Lock, CheckCircle2, AlertTriangle, X, ShieldAlert } from "lucide-react";

interface LineNotificationToggleProps {
  compact?: boolean;
}

export default function LineNotificationToggle({ compact = false }: LineNotificationToggleProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"confirm" | "auth">("confirm");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check admin role from sessionStorage
  const checkAdminStatus = () => {
    try {
      const role = sessionStorage.getItem("pea_role");
      const adminUser = sessionStorage.getItem("pea_admin_user");
      // Admin Cha16072534
      return adminUser === "Cha16072534" || role === "admin";
    } catch (e) {
      return false;
    }
  };

  // Fetch current setting from API
  const fetchSetting = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notify/settings");
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled !== false);
      } else {
        // Fallback default
        setEnabled(true);
      }
    } catch (err) {
      console.error("Error fetching LINE notify setting:", err);
      setEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(checkAdminStatus());
    fetchSetting();

    const handleSettingChanged = (e: any) => {
      if (e.detail && typeof e.detail.enabled === "boolean") {
        setEnabled(e.detail.enabled);
      } else {
        fetchSetting();
      }
    };

    window.addEventListener("line-notify-setting-changed", handleSettingChanged);
    return () => {
      window.removeEventListener("line-notify-setting-changed", handleSettingChanged);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleButtonClick = () => {
    setErrorMsg("");
    setPasswordInput("");
    const currentlyAdmin = checkAdminStatus();
    setIsAdmin(currentlyAdmin);

    if (currentlyAdmin) {
      setModalMode("confirm");
    } else {
      setModalMode("auth");
    }
    setShowModal(true);
  };

  const handleToggle = async (passKey: string = "Cha16072534") => {
    setIsSubmitting(true);
    setErrorMsg("");

    const targetState = !enabled;

    try {
      const res = await fetch("/api/notify/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: targetState,
          adminKey: passKey
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "ไม่สามารถเปลี่ยนการตั้งค่าได้");
        setIsSubmitting(false);
        return;
      }

      // Success
      setEnabled(targetState);
      sessionStorage.setItem("pea_admin_user", "Cha16072534");
      setIsAdmin(true);
      setShowModal(false);
      setPasswordInput("");

      // Broadcast event so any other component on the page updates
      window.dispatchEvent(
        new CustomEvent("line-notify-setting-changed", {
          detail: { enabled: targetState }
        })
      );

      showToast(
        targetState
          ? "✅ เปิดการแจ้งเตือน LINE เรียบร้อยแล้ว (ระบบจะส่งข้อความเข้ากลุ่ม LINE ตามปกติ)"
          : "🔕 ปิดการแจ้งเตือน LINE เรียบร้อยแล้ว (ระบบจะไม่ส่งข้อความเข้ากลุ่ม LINE ชั่วคราว)"
      );
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim();
    if (clean === "Cha16072534" || clean === "Cha16072534--") {
      handleToggle(clean);
    } else {
      setErrorMsg("รหัสผ่านไม่ถูกต้อง! เฉพาะ user admin Cha16072534 เท่านั้นที่มีสิทธิ์");
    }
  };

  const isEnabled = enabled !== false;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleButtonClick}
        title={
          loading
            ? "กำลังตรวจสอบสถานะการแจ้งเตือน..."
            : isEnabled
            ? "LINE แจ้งเตือน: เปิดอยู่ (คลิกเพื่อเปลี่ยนสถานะ)"
            : "LINE แจ้งเตือน: ปิดอยู่ (คลิกเพื่อเปลี่ยนสถานะ)"
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: compact ? "6px 12px" : "7px 14px",
          borderRadius: "9999px",
          fontSize: "0.82rem",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          border: isEnabled ? "1.5px solid #10b981" : "1.5px solid #f43f5e",
          backgroundColor: isEnabled ? "#ecfdf5" : "#fff1f2",
          color: isEnabled ? "#047857" : "#be123c",
          boxShadow: isEnabled
            ? "0 1px 3px rgba(16, 185, 129, 0.15)"
            : "0 1px 3px rgba(244, 63, 94, 0.15)",
          whiteSpace: "nowrap",
          userSelect: "none"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = isEnabled
            ? "0 4px 10px rgba(16, 185, 129, 0.25)"
            : "0 4px 10px rgba(244, 63, 94, 0.25)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = isEnabled
            ? "0 1px 3px rgba(16, 185, 129, 0.15)"
            : "0 1px 3px rgba(244, 63, 94, 0.15)";
        }}
      >
        {/* Status Indicator Dot */}
        <span
          style={{
            position: "relative",
            display: "flex",
            height: "8px",
            width: "8px"
          }}
        >
          {isEnabled && (
            <span
              style={{
                position: "absolute",
                display: "inline-flex",
                height: "100%",
                width: "100%",
                borderRadius: "50%",
                backgroundColor: "#34d399",
                opacity: 0.75,
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
              }}
            />
          )}
          <span
            style={{
              position: "relative",
              display: "inline-flex",
              borderRadius: "50%",
              height: "8px",
              width: "8px",
              backgroundColor: isEnabled ? "#10b981" : "#f43f5e"
            }}
          />
        </span>

        {/* Icon */}
        {isEnabled ? (
          <Bell size={15} style={{ color: "#059669" }} />
        ) : (
          <BellOff size={15} style={{ color: "#e11d48" }} />
        )}

        {/* Label */}
        <span>
          {isEnabled ? "LINE แจ้งเตือน: เปิด" : "LINE แจ้งเตือน: ปิด"}
        </span>

        {/* Admin or Lock Indicator */}
        {!isAdmin && (
          <Lock size={12} style={{ opacity: 0.65, marginLeft: "2px" }} />
        )}
      </button>

      {/* Confirmation & Auth Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setShowModal(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              animation: "scaleIn 0.18s ease-out"
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px 16px",
                borderBottom: "1px solid #f1f5f9"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    backgroundColor: isEnabled ? "#fee2e2" : "#dcfce7",
                    color: isEnabled ? "#dc2626" : "#16a34a",
                    padding: "8px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {isEnabled ? <BellOff size={22} /> : <Bell size={22} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
                    {modalMode === "confirm"
                      ? (isEnabled ? "ปิดการแจ้งเตือนผ่าน LINE" : "เปิดการแจ้งเตือนผ่าน LINE")
                      : "ยืนยันสิทธิ์ Admin Cha16072534"}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    ระบบแจ้งเตือนไลน์อัตโนมัติ (ผกร.กรย.)
                  </span>
                </div>
              </div>
              <button
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                  borderRadius: "8px"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Permission Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  backgroundColor: "#f5f3ff",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  color: "#6d28d9",
                  fontWeight: "600",
                  marginBottom: "14px"
                }}
              >
                <Lock size={12} />
                <span>จำกัดสิทธิ์เฉพาะ: Admin Cha16072534</span>
              </div>

              {modalMode === "confirm" ? (
                <>
                  <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.55", margin: 0 }}>
                    {isEnabled ? (
                      <>
                        คุณกำลังจะ <strong style={{ color: "#dc2626" }}>ปิดการแจ้งเตือนผ่าน LINE</strong> ทั้งหมดของระบบ
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "8px", display: "block" }}>
                          ℹ️ เมื่อปิดแล้ว การอัพเดทสถานะงานก่อสร้างและรูปถ่ายหน้างานทั้งหมดจะไม่ส่งเข้ากลุ่ม LINE จนกว่าจะเปิดใหม่อีกครั้ง
                        </span>
                      </>
                    ) : (
                      <>
                        คุณกำลังจะ <strong style={{ color: "#16a34a" }}>เปิดการแจ้งเตือนผ่าน LINE</strong>
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "8px", display: "block" }}>
                          ℹ️ เมื่อเปิดแล้ว การอัพเดทสถานะงานก่อสร้างและรูปถ่ายหน้างานจะส่งเข้ากลุ่ม LINE ตามปกติ
                        </span>
                      </>
                    )}
                  </p>

                  {errorMsg && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "10px 14px",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        color: "#b91c1c",
                        fontSize: "0.85rem"
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "24px",
                      justifyContent: "flex-end"
                    }}
                  >
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        color: "#475569",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleToggle("Cha16072534")}
                      style={{
                        padding: "9px 20px",
                        borderRadius: "10px",
                        border: "none",
                        background: isEnabled
                          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                          : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        boxShadow: isEnabled
                          ? "0 4px 12px rgba(220, 38, 38, 0.3)"
                          : "0 4px 12px rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {isSubmitting ? (
                        <span>กำลังบันทึก...</span>
                      ) : (
                        <>
                          {isEnabled ? <BellOff size={16} /> : <Bell size={16} />}
                          <span>{isEnabled ? "ยืนยันปิดแจ้งเตือน LINE" : "ยืนยันเปิดแจ้งเตือน LINE"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Auth Form for non-logged in or other roles */
                <form onSubmit={handleAuthSubmit}>
                  <p style={{ color: "#334155", fontSize: "0.9rem", lineHeight: "1.5", margin: 0, marginBottom: "14px" }}>
                    เฉพาะ <strong style={{ color: "#7e22ce" }}>user admin Cha16072534</strong> เท่านั้นที่มีสิทธิ์เปิดหรือปิดการแจ้งเตือน LINE
                    <br />
                    กรุณาระบุรหัสผ่าน Admin เพื่อยืนยันสิทธิ์:
                  </p>

                  <div style={{ marginBottom: "16px" }}>
                    <input
                      type="password"
                      placeholder="กรอกรหัส Admin Cha16072534"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      disabled={isSubmitting}
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: errorMsg ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                        outline: "none",
                        fontSize: "0.95rem",
                        boxSizing: "border-box"
                      }}
                    />
                    {errorMsg && (
                      <p style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: "6px", fontWeight: "500" }}>
                        {errorMsg}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "flex-end"
                    }}
                  >
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: "9px 18px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        color: "#475569",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        cursor: "pointer"
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !passwordInput.trim()}
                      style={{
                        padding: "9px 20px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        cursor: isSubmitting || !passwordInput.trim() ? "not-allowed" : "pointer",
                        opacity: isSubmitting || !passwordInput.trim() ? 0.6 : 1,
                        boxShadow: "0 4px 12px rgba(126, 34, 206, 0.25)"
                      }}
                    >
                      {isSubmitting ? "กำลังตรวจสอบ..." : "ยืนยันสิทธิ์และเปลี่ยนสถานะ"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 10000,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            fontSize: "0.9rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "420px",
            animation: "slideUp 0.25s ease-out"
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Embedded CSS animations */}
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
