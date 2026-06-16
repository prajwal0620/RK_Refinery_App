import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";

export default function AppLayout() {
  const { logout, user } = useAuth();
  const nav = useNavigate();
  const { dark, setDark } = useTheme();

  const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <div className={`h-full ${dark ? "bg-slate-900" : "bg-slate-100"}`}>
      <div className="h-full grid grid-cols-[260px_1fr]">
        <div className={`${dark ? "bg-slate-800 text-white" : "bg-white"} border-r`}>
          <Sidebar />
        </div>

        <div className="flex flex-col h-full">
          <div className={`${dark ? "bg-slate-800 text-white" : "bg-white"} border-b px-4 py-3 flex items-center justify-between`}>
            <div className="text-sm">Logged in: <b>{user?.username}</b></div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setDark(!dark)}
              >
                {dark ? "Light" : "Dark"}
              </button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}