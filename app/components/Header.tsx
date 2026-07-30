export default function Header() {
  return (
    <div className="header-banner">
      <div className="header-content">
        {/* Using standard img tag for simplicity, next/image would require domains in next.config */}
        <img
          src="https://lh3.googleusercontent.com/d/1pQWRFXNG6IL3cQUTWmuQVE7wMHVFrsjD"
          className="pea-logo"
          alt="PEA Logo"
        />
        <div>
          <h3 className="header-title">
            ระบบอัพเดทสถานะงานก่อสร้าง ของ ผกร.กรย.(ก3) ประจำปี 2569
          </h3>
          <p className="header-subtitle">
            Provincial Electricity Authority (PEA)
          </p>
        </div>
      </div>
    </div>
  );
}
