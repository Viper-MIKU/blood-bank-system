import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const EMPTY_NOTICE = { type: "", message: "" };

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bloodGroup: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(EMPTY_NOTICE);

  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password || !form.bloodGroup || !form.location) {
      setNotice({
        type: "error",
        message: "Fill in all fields to create your account.",
      });
      return;
    }

    try {
      setLoading(true);
      setNotice(EMPTY_NOTICE);

      await api.post("/register", form);

      setNotice({
        type: "success",
        message: "Account created. Redirecting to sign in...",
      });

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            notice: {
              type: "success",
              message: "Account ready. Sign in to continue.",
            },
          },
        });
      }, 900);
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Could not create your account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="auth-page-shell"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="auth-copy"
          initial={{ opacity: 0, x: -30 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          <span className="eyebrow">Join the network</span>
          <h1>Create account</h1>
          <p>Register once so people can find you faster when blood is needed.</p>

          <div className="auth-points">
            <div className="auth-point">Share your blood group and city</div>
            <div className="auth-point">Appear in the donor directory</div>
            <div className="auth-point">Receive and manage requests easily</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="auth-card"
          initial={{ opacity: 0, x: 30 }}
          transition={{ delay: 0.18, duration: 0.45 }}
        >
          <div className="auth-header">
            <h2>Register</h2>
            <p>Add your details to get started.</p>
          </div>

          {notice.message ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={`notice auth-notice notice-${notice.type || "info"}`}
              initial={{ opacity: 0, y: 10 }}
            >
              {notice.message}
            </motion.div>
          ) : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Full name</span>
              <input
                name="name"
                onChange={handleChange}
                placeholder="Your name"
                value={form.name}
              />
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <input
                name="email"
                onChange={handleChange}
                placeholder="you@example.com"
                type="email"
                value={form.email}
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                name="password"
                onChange={handleChange}
                placeholder="Create a password"
                type="password"
                value={form.password}
              />
            </label>

            <label className="field">
              <span className="field-label">Blood group</span>
              <select name="bloodGroup" onChange={handleChange} value={form.bloodGroup}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">City</span>
              <input
                name="location"
                onChange={handleChange}
                placeholder="Your city"
                value={form.location}
              />
            </label>

            <button className="btn btn-primary auth-submit" type="submit">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
