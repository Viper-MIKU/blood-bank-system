import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Loader from "../components/Loader";
import { api, getAuthConfig } from "../lib/api";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;

    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications", getAuthConfig(token));

        if (!ignore) {
          setNotifications(res.data);
        }
      } catch (error) {
        if (!ignore) {
          setNotice({
            type: "error",
            message: error.response?.data?.message || "Could not load notifications.",
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, [token]);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read", {}, getAuthConfig(token));
      setNotifications([]);
      setNotice({ type: "success", message: "Notifications cleared." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Could not update notifications.",
      });
    }
  };

  if (loading) {
    return <Loader />;
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
          <span className="eyebrow">Alerts</span>
          <h1>Notifications</h1>
          <p>Updates on your requests.</p>
        </div>

        {notifications.length ? (
          <div className="hero-actions">
            <button className="btn btn-secondary" onClick={markAllRead} type="button">
              Mark all read
            </button>
          </div>
        ) : null}
      </motion.section>

      <AnimatePresence>
        {notice.message ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`notice notice-${notice.type || "info"}`}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
          >
            {notice.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="request-list">
        {notifications.length ? (
          notifications.map((item, index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="request-card"
              initial={{ opacity: 0, y: 28 }}
              key={item._id}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <div className="request-card-heading">
                <div>
                  <h3>{item.receiver?.name || "Donor update"}</h3>
                  <p>{dateFormatter.format(new Date(item.updatedAt))}</p>
                </div>
                <span className={`status-pill status-${item.status}`}>{item.status}</span>
              </div>

              <div className="contact-panel">
                <p>
                  {item.status === "accepted"
                    ? `Contact shared: ${item.receiver?.email || "Not available"}`
                    : "The donor could not accept this request."}
                </p>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="empty-panel">
            <h3>No new notifications.</h3>
            <p>When a donor replies to your request, it will show up here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
