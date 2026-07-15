import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../services/api.js";

const inp = {
  width: "100%", background: "rgba(30,41,59,0.6)",
  border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10,
  padding: "11px 14px", color: "#F8FAFC", fontSize: 14,
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
};
const inpFocus = { ...inp, borderColor: "#3B82F6", boxShadow: "0 0 0 3px rgba(59,130,246,0.15)" };
const inpErr   = { ...inp, borderColor: "#EF4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.12)" };
const lbl = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#94A3B8", marginBottom: 6,
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]         = useState({ email: "", password: "", rememberMe: false });
  const [focused, setFocused]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); setApiError(""); };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password, rememberMe: form.rememberMe });
      navigate("/app");
    } catch (err) {
      setApiError(getApiErrorMessage(err, "Login failed. Please check your credentials."));
    } finally { setLoading(false); }
  };

  const getInpStyle = (field) => errors[field] ? inpErr : focused === field ? inpFocus : inp;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0B1220 0%,#0f1a2e 50%,#0B1220 100%)", padding: "24px 16px" }}>

      <div className="fade-in" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}>₹</div>
            <span style={{ fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FinanceAI</span>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>Welcome back — log in to your account</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "32px 28px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", margin: "0 0 24px", textAlign: "center" }}>
            Sign In
          </h2>

          {apiError && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", color: "#FCA5A5", fontSize: 13, marginBottom: 18 }}>
              ⚠ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} autoComplete="email"
                onChange={e => set("email", e.target.value)}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                style={getInpStyle("email")} />
              {errors.email && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                  value={form.password} autoComplete="current-password"
                  onChange={e => set("password", e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  style={{ ...getInpStyle("password"), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16, padding: 0 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <input type="checkbox" id="rememberMe" checked={form.rememberMe}
                onChange={e => set("rememberMe", e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#3B82F6", cursor: "pointer" }} />
              <label htmlFor="rememberMe" style={{ fontSize: 13, color: "#94A3B8", cursor: "pointer" }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none",
                cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600, color: "#fff",
                background: loading ? "rgba(59,130,246,0.4)" : "linear-gradient(135deg,#3B82F6,#06B6D4)",
                boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.35)",
                opacity: loading ? 0.7 : 1, transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading && <div style={{ width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748B" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#3B82F6", fontWeight: 600, textDecoration: "none" }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
