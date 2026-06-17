import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [printerInterface, setPrinterInterface] = useState("");
  const [paperWidth, setPaperWidth] = useState("80");
  const [printers, setPrinters] = useState<Array<{ name: string; isDefault: boolean }>>([]);

  useEffect(() => {
    setPrinterInterface(localStorage.getItem("rk_printer_interface") || "");
    setPaperWidth(localStorage.getItem("rk_paper_width") || "80");
  }, []);

  const save = () => {
    localStorage.setItem("rk_printer_interface", printerInterface.trim());
    localStorage.setItem("rk_paper_width", paperWidth);
    alert("Saved");
  };

  const detect = async () => {
    if (!window.rk) return alert("Electron bridge missing. Restart Electron.");
    if (!window.rk.listPrinters) return alert("listPrinters not available. Rebuild EXE / restart Electron.");

    try {
      const list = await window.rk.listPrinters();
      setPrinters(list);
      if (list.length === 0) alert("No printers found in Windows.");
    } catch (e: any) {
      alert(e?.message ?? "Detect printers failed");
    }
  };

  const usePrinter = (name: string) => {
    const v = `printer:${name}`;
    setPrinterInterface(v);
    localStorage.setItem("rk_printer_interface", v);

    // optional: also set normal printer name for silent prints
    localStorage.setItem("rk_normal_printer_name", name);

    alert(`Selected: ${v}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-3 max-w-2xl">
        <div className="text-sm">
          Current saved interface:{" "}
          <code className="bg-slate-100 px-2 py-1 rounded">
            {localStorage.getItem("rk_printer_interface") || "(not set)"}
          </code>
        </div>

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
            <div className="text-sm font-medium mb-2">Detected Printers (click to use)</div>
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
          <label className="text-sm font-medium">Printer Interface (Thermal)</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={printerInterface}
            onChange={(e) => setPrinterInterface(e.target.value)}
            placeholder="printer:RP3200 plus(U) 1"
          />
          <div className="text-xs text-slate-500 mt-1">
            Format: <code>printer:PRINTER_NAME</code>
          </div>
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

        <div className="text-xs text-slate-500">
          Debug: listPrinters = <b>{String(!!window.rk?.listPrinters)}</b>
        </div>
      </div>
    </div>
  );
}