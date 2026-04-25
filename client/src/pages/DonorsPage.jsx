import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Loader from "../components/Loader";
import { api, getAuthConfig } from "../lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_OPTIONS = ["normal", "urgent", "critical"];

const defaultRequest = {
  message: "",
  hospital: "",
  requestLocation: "",
  unitsNeeded: 1,
  urgency: "normal",
};

export default function DonorsPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [blood, setBlood] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState([]);
  const [activeComposer, setActiveComposer] = useState("");
  const [requestForm, setRequestForm] = useState(defaultRequest);
  const [submittingId, setSubmittingId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let ignore = false;

    const loadData = async () => {
      try {
        const [usersResponse, sentResponse] = await Promise.all([
          api.get("/users", getAuthConfig(token)),
          api.get("/my-sent-requests", getAuthConfig(token)),
        ]);

        if (!ignore) {
          setUsers(usersResponse.data);
          setRequested(
            sentResponse.data
              .filter((request) => request.status === "pending")
              .map((request) => request.receiver?._id)
              .filter(Boolean)
          );
        }
      } catch (error) {
        if (!ignore) {
          setFeedback({
            type: "error",
            message: error.response?.data?.message || "Could not load donors.",
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [token]);

  const locationOptions = useMemo(
    () =>
      [...new Set(users.map((user) => user.location).filter(Boolean))].sort(
        (left, right) => left.localeCompare(right)
      ),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedLocation = location.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        [user.name, user.location, user.bio].some((value) =>
          value?.toLowerCase().includes(normalizedSearch)
        );

      const matchesBlood = !blood || user.bloodGroup === blood;
      const matchesLocation =
        !normalizedLocation ||
        user.location?.toLowerCase() === normalizedLocation;

      return matchesSearch && matchesBlood && matchesLocation;
    });
  }, [blood, location, search, users]);

  const metrics = useMemo(
    () => [
      { label: "Results", value: filteredUsers.length },
      { label: "Available", value: users.filter((user) => user.availability === "available").length },
      { label: "Cities", value: locationOptions.length },
    ],
    [filteredUsers.length, locationOptions.length, users]
  );

  const openComposer = (user) => {
    setActiveComposer(user._id);
    setRequestForm({
      message: `Hi ${user.name}, can you help with ${user.bloodGroup}?`,
      hospital: "",
      requestLocation: user.location || "",
      unitsNeeded: 1,
      urgency: "normal",
    });
    setFeedback({ type: "", message: "" });
  };

  const clearFilters = () => {
    setSearch("");
    setBlood("");
    setLocation("");
  };

  const updateRequestForm = (event) => {
    const { name, value } = event.target;
    setRequestForm((current) => ({
      ...current,
      [name]: name === "unitsNeeded" ? Number(value) : value,
    }));
  };

  const sendRequest = async (receiverId) => {
    if (!requestForm.message.trim()) {
      setFeedback({
        type: "error",
        message: "Add a message.",
      });
      return;
    }

    setSubmittingId(receiverId);

    try {
      await api.post(
        "/request",
        {
          receiverId,
          ...requestForm,
        },
        getAuthConfig(token)
      );

      setRequested((current) => [...new Set([...current, receiverId])]);
      setActiveComposer("");
      setRequestForm(defaultRequest);
      setFeedback({
        type: "success",
        message: "Request sent.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Could not send the request.",
      });
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-shell donors-screen">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="page-hero"
        initial={{ opacity: 0, y: 22 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <span className="eyebrow">Donors</span>
          <h1>Find donors</h1>
          <p>Search by blood group, city, or name.</p>
        </div>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/sent-requests">
            Outbox
          </Link>
          <button className="btn btn-secondary" onClick={clearFilters} type="button">
            Clear
          </button>
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
        <div className="toolbar-grid">
          <label className="field">
            <span className="field-label">Search</span>
            <input
              className="search-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, city, or note"
              type="text"
              value={search}
            />
          </label>

          <label className="field">
            <span className="field-label">Blood group</span>
            <select value={blood} onChange={(event) => setBlood(event.target.value)}>
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">City</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="">All cities</option>
              {locationOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
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

      <section className="donor-grid">
        {filteredUsers.length ? (
          filteredUsers.map((user, index) => {
            const isComposerOpen = activeComposer === user._id;
            const hasRequested = requested.includes(user._id);

            return (
              <motion.article
                animate={{ opacity: 1, y: 0 }}
                className="donor-card"
                initial={{ opacity: 0, y: 28 }}
                key={user._id}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <div className="donor-card-top">
                  <div className="donor-avatar">
                    {user.name?.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="donor-title">
                    <div className="donor-title-row">
                      <h3>{user.name}</h3>
                      <span className="blood-badge">{user.bloodGroup}</span>
                    </div>
                    <p className="donor-subtitle">{user.location}</p>
                  </div>
                </div>

                <div className="detail-list">
                  <div className="detail-row">
                    <span className="detail-key">Availability</span>
                    <span className={`availability-badge availability-${user.availability}`}>
                      {user.availability}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Last donation</span>
                    <span className="detail-value">{user.lastDonation || "Not added"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-key">Contact</span>
                    <span className="detail-value">Shared after acceptance</span>
                  </div>
                </div>

                {user.bio ? <p className="card-note">{user.bio}</p> : null}

                <div className="donor-card-actions">
                  <button
                    className={`btn ${hasRequested ? "btn-success" : "btn-primary"}`}
                    disabled={hasRequested}
                    onClick={() => openComposer(user)}
                    type="button"
                  >
                    {hasRequested ? "Pending" : "Send request"}
                  </button>
                </div>

                <AnimatePresence>
                  {isComposerOpen && !hasRequested ? (
                    <motion.div
                      animate={{ opacity: 1, height: "auto" }}
                      className="composer"
                      exit={{ opacity: 0, height: 0 }}
                      initial={{ opacity: 0, height: 0 }}
                    >
                      <div className="composer-header">
                        <h4>Request details</h4>
                        <button
                          className="text-button"
                          onClick={() => setActiveComposer("")}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="settings-form compact-form">
                        <label className="field">
                          <span className="field-label">Urgency</span>
                          <select
                            name="urgency"
                            onChange={updateRequestForm}
                            value={requestForm.urgency}
                          >
                            {URGENCY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="field">
                          <span className="field-label">Units</span>
                          <input
                            max="10"
                            min="1"
                            name="unitsNeeded"
                            onChange={updateRequestForm}
                            type="number"
                            value={requestForm.unitsNeeded}
                          />
                        </label>

                        <label className="field">
                          <span className="field-label">Hospital</span>
                          <input
                            name="hospital"
                            onChange={updateRequestForm}
                            placeholder="Optional"
                            value={requestForm.hospital}
                          />
                        </label>

                        <label className="field">
                          <span className="field-label">Need in</span>
                          <input
                            name="requestLocation"
                            onChange={updateRequestForm}
                            placeholder="City or area"
                            value={requestForm.requestLocation}
                          />
                        </label>
                      </div>

                      <textarea
                        name="message"
                        onChange={updateRequestForm}
                        placeholder="Add more details (optional)"
                        rows="4"
                        value={requestForm.message}
                      />

                      <button
                        className="btn btn-primary composer-submit"
                        disabled={submittingId === user._id}
                        onClick={() => sendRequest(user._id)}
                        type="button"
                      >
                        {submittingId === user._id ? "Sending..." : "Send request"}
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })
        ) : (
          <div className="empty-panel">
            <h3>No donors found.</h3>
            <p>Try a different search or clear the filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
