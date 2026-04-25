import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import Loader from "../components/Loader";
import { api, getAuthConfig } from "../lib/api";

const STATUS_FILTERS = ["all", "pending", "accepted", "rejected"];

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function SentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;

    const loadRequests = async () => {
      try {
        const res = await api.get("/my-sent-requests", getAuthConfig(token));

        if (!ignore) {
          setRequests(res.data);
        }
      } catch (error) {
        if (!ignore) {
          setFeedback({
            type: "error",
            message: error.response?.data?.message || "Could not load sent requests.",
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

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) =>
        statusFilter === "all" ? true : request.status === statusFilter
      ),
    [requests, statusFilter]
  );

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
          <span className="eyebrow">Outbox</span>
          <h1>Sent requests</h1>
          <p>Monitor responses and next steps for your outgoing blood requests.</p>
        </div>
      </motion.section>

      <section className="panel toolbar-panel">
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
          filteredRequests.map((request, index) => (
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
                  {(request.receiver?.name || "D").slice(0, 1).toUpperCase()}
                </div>

                <div className="request-card-title">
                  <div className="request-card-heading">
                    <div>
                      <h3>{request.receiver?.name || "Unknown donor"}</h3>
                      <p>
                        {request.receiver?.bloodGroup || "Unknown group"} in{" "}
                        {request.receiver?.location || "Unknown city"}
                      </p>
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
                  <span className="detail-key">Location</span>
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

              <div className="contact-panel">
                <span className="field-label">Contact</span>
                <p>
                  {request.status === "accepted"
                    ? request.receiver?.email || "Contact not available"
                    : "Contact details appear after acceptance."}
                </p>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="empty-panel">
            <h3>No sent requests yet.</h3>
            <p>Send a request from the donors page to start tracking responses here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
