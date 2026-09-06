import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Registerpage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:3001/api/users/register", formData);
      navigate("/login", { state: { message: "Registration successful. Please check your email to verify your account." } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>ShopMATE</h1>
        <h2 style={styles.title}>Create an account</h2>
        <p style={styles.subtitle}>Sign up to start shopping</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+91 9000000000"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  brand: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  error: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    marginBottom: "16px",
    textAlign: "left",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    backgroundColor: "#f9fafb",
  },
  select: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  footer: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#6b7280",
  },
  link: {
    color: "#111827",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Registerpage;
