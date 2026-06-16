import { NavLink } from "react-router-dom";
import clsx from "clsx";

const linkClass = ({ isActive }: any) =>
  clsx(
    "block px-3 py-2 rounded",
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
  );

export default function Sidebar() {
  return (
    <div className="h-full p-3 space-y-2">
      <div className="px-2 py-3">
        <div className="font-bold text-lg">RK Refinery</div>
        <div className="text-xs text-slate-500">Silver Exchange</div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/" className={linkClass} end>Dashboard</NavLink>
        <NavLink to="/billing" className={linkClass}>Billing</NavLink>
        <NavLink to="/bills" className={linkClass}>View All Bills</NavLink>
        <NavLink to="/reports" className={linkClass}>Reports</NavLink>
        <NavLink to="/settings" className={linkClass}>Settings</NavLink>
      </nav>
    </div>
  );
}