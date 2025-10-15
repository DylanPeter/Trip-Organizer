import { Link, NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Trip Organizer
        </Link>

        <nav className="flex items-center gap-3">
          <NavLink
            to="/trips"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            Trips
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            Profile
          </NavLink>
        </nav>
      </div>
    </header>
  );
}