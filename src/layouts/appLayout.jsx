import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar.jsx";

export default function AppLayout() {
  return (
    <>
      <NavBar />
      {/* Your pages render here */}
      <Outlet />
    </>
  );
}