import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div data-testid="admin-layout-page">
      <Outlet />
    </div>
  );
}
