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

// Password strength checker
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(pw)) score++;
  return score;
}
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColor = ["", "#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [focused, setFocused]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); setApiError(""); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";

    if (!form.email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";

    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "At least 8 characters.";
    else if (!/[A-Z]/.test(form.password)) e.password = "Add at least one uppercase letter.";
    else if (!/[a-z]/.test(form.password)) e.password = "Add at least one lowercase letter.";
    else if (!/\d/.test(form.password)) e.password = "Add at least one number.";
    else if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(form.password)) e.password = "Add at least one special character.";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match.";

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await register(form);
      navigate("/app");
    } catch (err) {
      setApiError(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally { setLoading(false); }
  };

  const getInpStyle = (field) => errors[field] ? inpErr : focused === field ? inpFocus : inp;
  const strength = getStrength(form.password);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0B1220 0%,#0f1a2e 50%,#0B1220 100%)", padding: "24px 16px" }}>

      <div className="fade-in" style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}>₹</div>
            <span style={{ fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FinanceAI</span>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>Create your free account</p>
        </div>

        <div className="glass-card" style={{ padding: "32px 28px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", margin: "0 0 24px", textAlign: "center" }}>
            Sign Up
          </h2>

          {apiError && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", color: "#FCA5A5", fontSize: 13, marginBottom: 18 }}>
              ⚠ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Full Name</label>
              <input type="text" placeholder="e.g. Riya Sharma" value={form.name} autoComplete="name"
                onChange={e => set("name", e.target.value)}
                onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                style={getInpStyle("name")} />
              {errors.name && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.name}</p>}
            </div>

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
            <div style={{ marginBottom: 8 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} placeholder="Min 8 chars, upper, number, symbol"
                  value={form.password} autoComplete="new-password"
                  onChange={e => set("password", e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  style={{ ...getInpStyle("password"), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16, padding: 0 }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.08)",
                        transition: "background 0.2s" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColor[strength], margin: 0 }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
              {errors.password && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password"
                  value={form.confirmPassword} autoComplete="new-password"
                  onChange={e => set("confirmPassword", e.target.value)}
                  onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
                  style={{ ...getInpStyle("confirmPassword"), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16, padding: 0 }}>
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.confirmPassword}</p>}
            </div>

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
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#64748B" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#3B82F6", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#475569" }}>
          Your data is encrypted and never shared.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
