import { useState } from "react";
import { downloadReport } from "../services/api.js";

export default function DownloadReport({ reportData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!reportData?.financial_score) {
      setError("Please analyze your finances first before downloading the report.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await downloadReport(reportData);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "FinanceAI_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("PDF generation failed. Make sure ReportLab is installed on the backend.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: "10px 22px", borderRadius: 10, border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 13, fontWeight: 600, color: "#fff",
          background: loading ? "rgba(16,185,129,0.3)" : "linear-gradient(135deg,#10B981,#06B6D4)",
          boxShadow: loading ? "none" : "0 0 16px rgba(16,185,129,0.35)",
          transition: "all 0.2s", opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        {loading ? (
          <>
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
            Generating PDF...
          </>
        ) : (
          <> ⬇ Download Financial Report</>
        )}
      </button>
      {error && (
        <p style={{ fontSize: 11, color: "#FCA5A5", margin: "6px 0 0" }}>⚠ {error}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
