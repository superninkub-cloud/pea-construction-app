"use client";

import { useState } from "react";
import Overview from "./components/Overview";
import UpdateStatus from "./components/UpdateStatus";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"update" | "overview">("update");

  return (
    <>
      <ul className="nav-tabs">
        <li>
          <button
            className={`nav-link ${activeTab === "update" ? "active" : ""}`}
            onClick={() => setActiveTab("update")}
          >
            📝 อัพเดทสถานะ
          </button>
        </li>
        <li>
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 ภาพรวมโครงการ
          </button>
        </li>
      </ul>

      {activeTab === "update" ? <UpdateStatus /> : <Overview />}
    </>
  );
}
