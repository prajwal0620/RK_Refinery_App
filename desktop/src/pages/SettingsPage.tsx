import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [printerInterface, setPrinterInterface] = useState("");
  const [paperWidth, setPaperWidth] = useState("72");

  // ✅ Majuri rate per KG (market rate)
  const [majuriRateKg, setMajuriRateKg] = useState("100");

  const [printers, setPrinters] = useState<Array<{ name: string; isDefault: boolean }>>([]);

  useEffect(() => {
    setPrinterInterface(localStorage.getItem("rk_printer_interface") || "");
    setPaperWidth(localStorage.getItem("rk_paper_width") || "72");
    setMajuriRateKg(localStorage.getItem("rk_majuri_rate_kg") || "100");
  }, []);

  const save = () => {
    localStorage.setItem("rk_printer_interface", printerInterface.trim());
    localStorage.setItem("rk_paper_width", paperWidth);
    localStorage.setItem("rk_majuri_rate_kg", majuriRateKg);
    alert("Saved");
  };

  const detect = async () => {
    if (!window.rk?.listPrinters) return alert("Detect not available. Restart Electron.");
    const list = await window.rk.listPrinters();
    setPrinters(list);
  };

  const usePrinter = (name: string) => {
    const iface = `printer:${name}`;
    setPrinterInterface(iface);
    localStorage.setItem("rk_printer_interface", iface);
    localStorage.setItem("rk_normal_printer_name", name);
    alert(`Selected: ${iface}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-3 max-w-2xl">
        <div className="flex gap-2">
          <button type="button" onClick={detect} className="px-3 py-2 rounded bg-indigo-600 text-white">
            Detect Printers
          </button>
          <button type="button" onClick={save} className="px-3 py-2 rounded bg-slate-900 text-white">
            Save
          </button>
        </div>

        {printers.length > 0 && (
          <div className="border rounded p-2">
            <div className="text-sm font-medium mb-2">Detected Printers</div>
            <div className="grid grid-cols-2 gap-2">
              {printers.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  className="text-left px-3 py-2 border rounded hover:bg-slate-50"
                  onClick={() => usePrinter(p.name)}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.isDefault ? "Default" : ""}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Thermal Printer Interface</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={printerInterface}
            onChange={(e) => setPrinterInterface(e.target.value)}
            placeholder="printer:RP3200 plus(U) 1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Paper Width</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={paperWidth}
            onChange={(e) => setPaperWidth(e.target.value)}
          >
            <option value="72">72mm</option>
            <option value="80">80mm</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Majuri Rate (₹ per KG)</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={majuriRateKg}
            onChange={(e) => setMajuriRateKg(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="100"
          />
          <div className="text-xs text-slate-500 mt-1">
            Example: 100 means 1 KG = ₹100 (per gram = 0.1)
          </div>
        </div>
      </div>
    </div>
  );
}