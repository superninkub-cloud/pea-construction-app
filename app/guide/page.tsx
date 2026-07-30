import React from "react";
import TopBar from "../components/TopBar";

export const metadata = {
  title: "คู่มืองานก่อสร้าง 115kV - PEA Construction",
};

export default function GuidePage() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="คู่มืองานก่อสร้าง 115kV" />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <iframe
          src="https://pea-foundation-guide-c4e3.vercel.app/"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="คู่มืองานก่อสร้าง 115kV"
          allowFullScreen
        />
      </div>
    </div>
  );
}
