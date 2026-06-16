import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password, remember);
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-slate-100 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">RK Refinery Login</h1>
          <p className="text-sm text-slate-500">Username + Password</p>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        <div>
          <label className="text-sm font-medium">Username</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>

        <button disabled={loading} className="w-full bg-slate-900 text-white rounded py-2">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}