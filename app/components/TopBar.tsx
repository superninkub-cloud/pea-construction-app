export default function TopBar({ title }: { title: string }) {
  return (
    <div className="topbar">
      <h1 className="topbar-title">{title}</h1>
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
