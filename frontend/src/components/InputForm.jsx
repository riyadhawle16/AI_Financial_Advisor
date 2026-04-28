import { useState } from "react";

const inputStyle = {
  width: "100%",
  background: "rgba(30,41,59,0.6)",
  border: "1px solid rgba(59,130,246,0.2)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#F8FAFC",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const errorInputStyle = {
  ...inputStyle,
  borderColor: "#EF4444",
  boxShadow: "0 0 0 3px rgba(239,68,68,0.15)",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#94A3B8",
  marginBottom: 6,
};

export default function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    income: "",
    expenses: "",
    savings: "",
    debt: "",
    risk_tolerance: "medium",
  });

  const [focused, setFocused] = useState(null);
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear validation error when user starts typing
    if (validationError) setValidationError("");
  };

  const validate = () => {
    const income = Number(form.income);
    const expenses = Number(form.expenses);

    if (!form.income || income <= 0) {
      return "Income must be greater than 0. Please enter your monthly income.";
    }
    if (!form.expenses || expenses <= 0) {
      return "Expenses must be greater than 0. Please enter your monthly expenses.";
    }
    if (expenses >= income) {
      return `Expenses (₹${expenses.toLocaleString("en-IN")}) cannot be equal to or greater than Income (₹${income.toLocaleString("en-IN")}). Please check your values.`;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    onSubmit({
      ...form,
      income: Number(form.income),
      expenses: Number(form.expenses),
      savings: Number(form.savings) || 0,
      debt: Number(form.debt) || 0,
    });
  };

  const getFocusStyle = (name) => {
    const isErrorField =
      validationError &&
      ((name === "income" && (!form.income || Number(form.income) <= 0)) ||
       (name === "expenses" && (!form.expenses || Number(form.expenses) <= 0 || Number(form.expenses) >= Number(form.income))));

    if (isErrorField) return errorInputStyle;
    if (focused === name) return { ...inputStyle, borderColor: "#3B82F6", boxShadow: "0 0 0 3px rgba(59,130,246,0.15)" };
    return inputStyle;
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: 0 }}>
          Financial Profile
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: "4px 0 0" }}>
          Enter Your Details
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Income — required, must be > 0 */}
          <div>
            <label style={labelStyle}>
              Monthly Income (₹) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              name="income" type="number" min="1" placeholder="e.g. 80000"
              value={form.income}
              onChange={handleChange}
              onFocus={() => setFocused("income")}
              onBlur={() => setFocused(null)}
              style={getFocusStyle("income")}
              required
            />
            {validationError && (!form.income || Number(form.income) <= 0) && (
              <p style={{ fontSize: 11, color: "#EF4444", margin: "4px 0 0" }}>
                ⚠ Income cannot be 0
              </p>
            )}
          </div>

          {/* Expenses — required, must be > 0 and < income */}
          <div>
            <label style={labelStyle}>
              Monthly Expenses (₹) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              name="expenses" type="number" min="1" placeholder="e.g. 50000"
              value={form.expenses}
              onChange={handleChange}
              onFocus={() => setFocused("expenses")}
              onBlur={() => setFocused(null)}
              style={getFocusStyle("expenses")}
              required
            />
            {validationError && (!form.expenses || Number(form.expenses) <= 0) && (
              <p style={{ fontSize: 11, color: "#EF4444", margin: "4px 0 0" }}>
                ⚠ Expenses cannot be 0
              </p>
            )}
          </div>

          {/* Savings — optional, can be 0 */}
          <div>
            <label style={labelStyle}>
              Monthly Savings (₹)
              <span style={{ fontSize: 10, color: "#64748B", marginLeft: 4, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                (can be 0)
              </span>
            </label>
            <input
              name="savings" type="number" min="0" placeholder="e.g. 20000"
              value={form.savings}
              onChange={handleChange}
              onFocus={() => setFocused("savings")}
              onBlur={() => setFocused(null)}
              style={getFocusStyle("savings")}
            />
          </div>

          {/* Debt — optional, can be 0 */}
          <div>
            <label style={labelStyle}>
              Total Debt (₹)
              <span style={{ fontSize: 10, color: "#64748B", marginLeft: 4, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                (can be 0)
              </span>
            </label>
            <input
              name="debt" type="number" min="0" placeholder="e.g. 10000"
              value={form.debt}
              onChange={handleChange}
              onFocus={() => setFocused("debt")}
              onBlur={() => setFocused(null)}
              style={getFocusStyle("debt")}
            />
          </div>
        </div>

        {/* Validation error banner */}
        {validationError && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠</span>
            <span style={{ fontSize: 13, color: "#FCA5A5", lineHeight: 1.5 }}>{validationError}</span>
          </div>
        )}

        <div>
          <label style={labelStyle}>Risk Appetite</label>
          <select
            name="risk_tolerance"
            value={form.risk_tolerance}
            onChange={handleChange}
            onFocus={() => setFocused("risk")}
            onBlur={() => setFocused(null)}
            style={{ ...getFocusStyle("risk"), cursor: "pointer" }}
          >
            <option value="low"    style={{ background: "#111827" }}>🛡 Low — Capital Protection</option>
            <option value="medium" style={{ background: "#111827" }}>⚖ Medium — Balanced Growth</option>
            <option value="high"   style={{ background: "#111827" }}>🚀 High — Aggressive Growth</option>
          </select>
        </div>

        {/* Helper note */}
        <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>
          <span style={{ color: "#EF4444" }}>*</span> Income and Expenses are required and must be greater than 0.
          Savings and Debt can be 0.
        </p>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: loading
              ? "rgba(59,130,246,0.4)"
              : "linear-gradient(135deg, #3B82F6, #06B6D4)",
            boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.4)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                animation: "spin 0.8s linear infinite"
              }} />
              Analyzing with AI...
            </>
          ) : (
            <> Analyze My Finances</>
          )}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
