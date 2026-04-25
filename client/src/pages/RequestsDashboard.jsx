import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../components/Loader";
import { api, getAuthConfig } from "../lib/api";

const STATUS_FILTERS = ["all", "pending", "accepted", "rejected"];

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function RequestsDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;

    const loadRequests = async () => {
      try {
        const res = await api.get("/my-requests", getAuthConfig(token));

        if (!ignore) {
          setRequests(res.data);
          setFeedback({ type: "", message: "" });
        }
      } catch (error) {
        if (!ignore) {
          setFeedback({
            type: "error",
            message: error.response?.data?.message || "Could not load requests.",
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      ignore = true;
    };
  }, [token]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const sender = request.sender || {};
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [
          sender.name,
          sender.location,
          sender.bloodGroup,
          request.message,
          request.requestLocation,
          request.hospital,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  const metrics = useMemo(
    () => [
      { label: "Pending", value: requests.filter((request) => request.status === "pending").length },
      { label: "Accepted", value: requests.filter((request) => request.status === "accepted").length },
      { label: "Rejected", value: requests.filter((request) => request.status === "rejected").length },
    ],
    [requests]
  );

  const updateStatus = async (id, status) => {
    setBusyId(id);

    try {
      await api.put(`/request/${id}`, { status }, getAuthConfig(token));

      setRequests((current) =>
        current.map((request) =>
          request._id === id ? { ...request, status } : request
        )
      );
      setFeedback({ type: "success", message: `Request ${status}.` });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Could not update the request.",
      });
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-shell requests-screen">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="page-hero"
        initial={{ opacity: 0, y: 22 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <span className="eyebrow">Inbox</span>
          <h1>Requests</h1>
          <p>Review and respond to blood requests.</p>
        </div>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/notifications">
            Alerts
          </Link>
        </div>
      </motion.section>

      <section className="metric-grid">
        {metrics.map((metric, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="metric-card"
            initial={{ opacity: 0, y: 18 }}
            key={metric.label}
            transition={{ delay: index * 0.06, duration: 0.32 }}
          >
            <span className="metric-value">{metric.value}</span>
            <span className="metric-label">{metric.label}</span>
          </motion.article>
        ))}
      </section>

      <section className="panel toolbar-panel">
        <div className="toolbar-grid request-toolbar-grid">
          <label className="field field-wide">
            <span className="field-label">Search</span>
            <input
              className="search-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, city, hospital, or message"
              type="text"
              value={search}
            />
          </label>

          <div className="field">
            <span className="field-label">Status</span>
            <div className="chip-row">
              {STATUS_FILTERS.map((status) => (
                <button
                  className={`chip ${statusFilter === status ? "active" : ""}`}
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  type="button"
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {feedback.message ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={`notice notice-${feedback.type || "info"}`}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -8 }}
            >
              {feedback.message}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <section className="request-list">
        {filteredRequests.length ? (
          filteredRequests.map((request, index) => {
            const sender = request.sender || {};

            return (
              <motion.article
                animate={{ opacity: 1, y: 0 }}
                className="request-card"
                initial={{ opacity: 0, y: 28 }}
                key={request._id}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <div className="request-card-top">
                  <div className="donor-avatar">
                    {(sender.name || "R").slice(0, 1).toUpperCase()}
                  </div>

                  <div className="request-card-title">
                    <div className="request-card-heading">
                      <div>
                        <h3>{sender.name || "Unknown requester"}</h3>
                        <p>{sender.bloodGroup || "Unknown group"} from {sender.location || "Unknown city"}</p>
                      </div>
                      <span className={`status-pill status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="request-meta">
                      <span>{dateFormatter.format(new Date(request.createdAt))}</span>
                      <span>{request.urgency}</span>
                      <span>{request.unitsNeeded} unit(s)</span>
                    </div>
                  </div>
                </div>

                <div className="request-info-grid">
                  <div className="detail-row">
                    <span className="detail-key">Need in</span>
                    <span className="detail-value">{request.requestLocation || "Not added"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Hospital</span>
                    <span className="detail-value">{request.hospital || "Not added"}</span>
                  </div>
                </div>

                <div className="message-panel">
                  <span className="field-label">Message</span>
                  <p>{request.message || "No message added."}</p>
                </div>

                {request.status === "pending" ? (
                  <div className="action-row">
                    <button
                      className="btn btn-primary"
                      disabled={busyId === request._id}
                      onClick={() => updateStatus(request._id, "accepted")}
                      type="button"
                    >
                      {busyId === request._id ? "Saving..." : "Accept"}
                    </button>

                    <button
                      className="btn btn-secondary"
                      disabled={busyId === request._id}
                      onClick={() => updateStatus(request._id, "rejected")}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="status-note">Marked as {request.status}.</div>
                )}
              </motion.article>
            );
          })
        ) : (
          <div className="empty-panel">
            <h3>No requests found.</h3>
            <p>New requests will appear here as donors contact you.</p>
          </div>
        )}
      </section>
    </div>
  );
}
