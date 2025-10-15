import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home";
import Trips from "./pages/Trips";
import Profile from "./pages/Profile";
import TripDetail from "./pages/TripDetail"; // <= make sure this path is correct


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<> <NavBar /> <Home /></>}/>
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripDetail />} /> {}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}