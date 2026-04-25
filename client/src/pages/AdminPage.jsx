import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Loader from "../components/Loader";
import { api, getAuthConfig } from "../lib/api";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;

    const loadOverview = async () => {
      try {
        const res = await api.get("/admin/overview", getAuthConfig(token));

        if (!ignore) {
          setData(res.data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.response?.data?.message || "Could not load admin overview."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      ignore = true;
    };
  }, [token]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="dashboard-shell">
        <div className="empty-panel">
          <h3>Admin only</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="page-hero"
        initial={{ opacity: 0, y: 22 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Dashboard</h1>
          <p>System overview and recent activity.</p>
        </div>
      </motion.section>

      <section className="metric-grid">
        <article className="metric-card">
          <span className="metric-value">{data.summary.totalUsers}</span>
          <span className="metric-label">Users</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">{data.summary.availableDonors}</span>
          <span className="metric-label">Available donors</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">{data.summary.pendingRequests}</span>
          <span className="metric-label">Pending requests</span>
        </article>
      </section>

      <div className="admin-layout">
        <section className="panel">
          <h3 className="section-title">Recent users</h3>
          <div className="simple-list">
            {data.users.slice(0, 8).map((user) => (
              <div className="simple-list-row" key={user._id}>
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.bloodGroup} in {user.location}</p>
                </div>
                <div className="simple-list-meta">
                  <span className={`availability-badge availability-${user.availability}`}>
                    {user.availability}
                  </span>
                  <span>{user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3 className="section-title">Recent requests</h3>
          <div className="simple-list">
            {data.requests.map((request) => (
              <div className="simple-list-row" key={request._id}>
                <div>
                  <strong>{request.sender?.name || "Sender"} to {request.receiver?.name || "Receiver"}</strong>
                  <p>
                    {request.urgency} · {request.unitsNeeded} unit(s) · {request.requestLocation || "No location"}
                  </p>
                </div>
                <span className={`status-pill status-${request.status}`}>{request.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
