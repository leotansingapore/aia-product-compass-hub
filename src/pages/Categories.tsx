import { Navigate } from "react-router-dom";

export default function Categories() {
  return <Navigate to="/library?tab=products" replace />;
}
