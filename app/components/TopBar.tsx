"use client";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function TopBar({ title }: { title: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="user-profile">
        <div className="avatar">PE</div>
        <div className="user-info">
          <span className="user-name">ผกร.กรย.(ก3)</span>
          <span className="user-role">เจ้าหน้าที่อัพเดทสถานะ</span>
        </div>
      </div>
    </div>
  );
}
