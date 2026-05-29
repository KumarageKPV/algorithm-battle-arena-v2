"use client";
import { useState } from "react";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminProblemsPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [modal, setModal] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && (f.type === "application/json" || f.name.endsWith(".json") || f.name.endsWith(".csv"))) {
      setFile(f); setModal(null);
    } else {
      setModal({ success: false, message: "Please select a valid JSON or CSV file" });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await adminApi.importProblems(formData as any);
      const count = r.data.importedCount || r.data.inserted || 0;
      setModal({ success: true, message: `Upload successful! ${count} problems imported.` });
      setFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Import failed";
      setModal({ success: false, message: `Import failed: ${msg}` });
    } finally { setImporting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6" style={{ background: "rgba(20,20,20,0.85)", border: "1px solid #333" }}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          <FileText className="w-6 h-6 text-blue-400" /> Import Problems
        </h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <input type="file" accept=".json,.csv" onChange={handleFileSelect} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer text-arena-orange hover:text-orange-400 font-medium">
              Click to select a JSON or CSV file
            </label>
            {file && <p className="text-gray-300 mt-2 text-sm">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
          </div>
          <button onClick={handleImport} disabled={!file || importing}
            className="w-full py-3 rounded-lg font-bold text-sm bg-arena-orange text-black hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {importing ? "Importing..." : "Import Problems"}
          </button>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ background: "rgba(20,20,20,0.95)", border: "2px solid " + (modal.success ? "#22c55e" : "#ef4444") }}>
            <div className="flex items-center gap-3 mb-4">
              {modal.success ? <CheckCircle className="w-8 h-8 text-green-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
              <h3 className="text-lg font-bold text-white">{modal.success ? "Success" : "Error"}</h3>
            </div>
            <p className="text-gray-300 mb-4">{modal.message}</p>
            <button onClick={() => setModal(null)} className="w-full py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


