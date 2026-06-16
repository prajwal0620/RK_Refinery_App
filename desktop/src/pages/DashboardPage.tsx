import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { dashboardSummary } from "../services/dashboardService";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await dashboardSummary(date);
      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [date]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Daily", weight: Number(data.daily.totalWeight), purity: Number(data.daily.totalPurity), majuri: Number(data.daily.totalMajuri) },
      { name: "Overall", weight: Number(data.overall.totalWeight), purity: Number(data.overall.totalPurity), majuri: Number(data.overall.totalMajuri) },
    ];
  }, [data]);

  if (loading && !data) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <input className="border rounded px-2 py-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="grid grid-cols-5 gap-3">
        <StatCard title="Today Total Bills" value={String(data.daily.totalBills)} />
        <StatCard title="Today Total Weight" value={`${Number(data.daily.totalWeight).toFixed(2)} g`} />
        <StatCard title="Today Total Purity" value={`${Number(data.daily.totalPurity).toFixed(2)} g`} />
        <StatCard title="Today Total Majuri" value={`₹${Number(data.daily.totalMajuri).toFixed(0)}`} />
        <StatCard title="Today Customer Count" value={String(data.daily.customerCount)} />
      </div>

      <div className="grid grid-cols-5 gap-3">
        <StatCard title="Overall Total Bills" value={String(data.overall.totalBills)} />
        <StatCard title="Overall Total Weight" value={`${Number(data.overall.totalWeight).toFixed(2)} g`} />
        <StatCard title="Overall Total Purity" value={`${Number(data.overall.totalPurity).toFixed(2)} g`} />
        <StatCard title="Overall Total Majuri" value={`₹${Number(data.overall.totalMajuri).toFixed(0)}`} />
        <StatCard title="Overall Customer Count" value={String(data.overall.customerCount)} />
      </div>

      <div className="bg-white rounded-xl shadow p-4 h-[320px]">
        <div className="font-medium mb-2">Summary Chart</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="weight" fill="#0f172a" />
            <Bar dataKey="purity" fill="#2563eb" />
            <Bar dataKey="majuri" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}