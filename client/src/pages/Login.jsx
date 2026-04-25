import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

import { api } from "../lib/api";

const EMPTY_NOTICE = { type: "", message: "" };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(EMPTY_NOTICE);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.notice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice(location.state.notice);
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setNotice({
        type: "error",
        message: "Enter your email and password.",
      });
      return;
    }

    try {
      setLoading(true);
      setNotice(EMPTY_NOTICE);

      const res = await api.post("/login", { email, password });

      localStorage.setItem("token", res.data.token);
      setNotice({
        type: "success",
        message: "Signed in. Opening donors...",
      });

      window.setTimeout(() => {
        navigate("/users");
      }, 700);
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Could not sign you in.",
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
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in</h1>
          <p>Open your donor dashboard and manage blood requests in one place.</p>

          <div className="auth-points">
            <div className="auth-point">Search donors by city or blood group</div>
            <div className="auth-point">Send requests without leaving the page</div>
            <div className="auth-point">Review replies from your request inbox</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="auth-card"
          initial={{ opacity: 0, x: 30 }}
          transition={{ delay: 0.18, duration: 0.45 }}
        >
          <div className="auth-header">
            <h2>Login</h2>
            <p>Enter your account details to continue.</p>
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
              <span className="field-label">Email</span>
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                type="password"
                value={password}
              />
            </label>

            <button className="btn btn-primary auth-submit" type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
