import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/appLayout";
import Home from "./pages/Home";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Profile from "./pages/Profile";
import TripCreate from "./pages/TripCreate";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes below will include the NavBar */}
        <Route path="/profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> }/>
        <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trips/new" element={<TripCreate />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}