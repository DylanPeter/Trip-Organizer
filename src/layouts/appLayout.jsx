import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar/NavBar.jsx";
import Footer from "../components/Footer.jsx"

export default function AppLayout() {
  return (
    <>
      <NavBar />
      {/* Your pages render here */}
      <Outlet />
      <Footer />
    </>
  );
}