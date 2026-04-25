import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Loader from "../components/Loader";
import { api, getAuthConfig } from "../lib/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const AVAILABILITY = ["available", "busy", "unavailable"];

const getSavedProfile = () => {
  try {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    bloodGroup: "",
    location: "",
    availability: "available",
    lastDonation: "",
    bio: "",
    role: "user",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const res = await api.get("/me", getAuthConfig(token));

        if (!ignore) {
          localStorage.setItem("currentUser", JSON.stringify(res.data));
          setForm({
            name: res.data.name || "",
            email: res.data.email || "",
            bloodGroup: res.data.bloodGroup || "",
            location: res.data.location || "",
            availability: res.data.availability || "available",
            lastDonation: res.data.lastDonation || "",
            bio: res.data.bio || "",
            role: res.data.role || "user",
          });
        }
      } catch (error) {
        if (!ignore) {
          const savedProfile = getSavedProfile();

          if (savedProfile) {
            setForm({
              name: savedProfile.name || "",
              email: savedProfile.email || "",
              bloodGroup: savedProfile.bloodGroup || "",
              location: savedProfile.location || "",
              availability: savedProfile.availability || "available",
              lastDonation: savedProfile.lastDonation || "",
              bio: savedProfile.bio || "",
              role: savedProfile.role || "user",
            });
          } else {
            setNotice({
              type: "error",
              message: error.response?.data?.message || "Please sign in again to load your profile.",
            });
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await api.put(
        "/me",
        {
          name: form.name,
          bloodGroup: form.bloodGroup,
          location: form.location,
          availability: form.availability,
          lastDonation: form.lastDonation,
          bio: form.bio,
        },
        getAuthConfig(token)
      );

      const updatedUser = {
        ...res.data.user,
        email: form.email,
      };

      setForm((current) => ({
        ...current,
        ...updatedUser,
      }));
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setNotice({ type: "success", message: "Profile updated." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.response?.data?.message || "Could not update profile.",
      });
    } finally {
      setSaving(false);
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
          <span className="eyebrow">Profile</span>
          <h1>Your donor profile</h1>
          <p>Keep your details current so people can reach the right donor quickly.</p>
        </div>
      </motion.section>

      <div className="profile-layout">
        <section className="panel profile-summary-card">
          <div className="profile-avatar">{form.name?.slice(0, 1).toUpperCase() || "U"}</div>
          <h3>{form.name || "Your profile"}</h3>
          <p>{form.email}</p>
          <div className={`availability-badge availability-${form.availability}`}>
            {form.availability}
          </div>
          <div className="profile-meta">
            <span>{form.bloodGroup}</span>
            <span>{form.location}</span>
            <span>{form.role}</span>
          </div>
        </section>

        <section className="panel">
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

          <form className="settings-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Name</span>
              <input name="name" onChange={handleChange} value={form.name} />
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <input disabled value={form.email} />
            </label>

            <label className="field">
              <span className="field-label">Blood group</span>
              <select name="bloodGroup" onChange={handleChange} value={form.bloodGroup}>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">City</span>
              <input name="location" onChange={handleChange} value={form.location} />
            </label>

            <label className="field">
              <span className="field-label">Availability</span>
              <select name="availability" onChange={handleChange} value={form.availability}>
                {AVAILABILITY.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Last donation</span>
              <input
                name="lastDonation"
                onChange={handleChange}
                placeholder="Example: 2 months ago"
                value={form.lastDonation}
              />
            </label>

            <label className="field field-span-2">
              <span className="field-label">Short bio</span>
              <textarea
                name="bio"
                onChange={handleChange}
                placeholder="Add a short note about availability or preferred response time."
                rows="4"
                value={form.bio}
              />
            </label>

            <button className="btn btn-primary settings-submit" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
