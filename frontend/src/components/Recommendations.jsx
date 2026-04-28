export default function Recommendations({ data }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
      {data.map((item, index) => (
        <div
          key={index}
          className="glass-card"
          style={{
            padding: 18,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.15)",
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
            boxShadow: "0 0 10px rgba(59,130,246,0.3)"
          }}>
            {index + 1}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>{item}</p>
        </div>
      ))}
    </div>
  );
}
