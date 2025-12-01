import { useEffect, useState } from "react";
import api from "../services/api";
import "./RSVPModal.css";

export default function RSVPModal({ show, onClose }) {
  const [members, setMembers] = useState([{ name: "" }]);
  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState({ type: null, text: "" });

  useEffect(() => {
    if (show) {
      setMembers([{ name: "" }]);
      setBanner({ type: null, text: "" });
      setSending(false);
    }
  }, [show]);

  const addMember = () => {
    setMembers((prev) => [...prev, { name: "" }]);
  };

  const handleChange = (index, value) => {
    setMembers((prev) => prev.map((m, idx) => (idx === index ? { name: value } : m)));
  };

  const handleSubmit = async () => {
    const trimmed = members.map((m) => ({ name: m.name.trim() })).filter((m) => m.name);
    if (!trimmed.length) {
      setBanner({ type: "error", text: "Please add at least one name." });
      return;
    }

    try {
      setSending(true);
      setBanner({ type: null, text: "" });
      await api.post("/rsvp", { members: trimmed });
      setBanner({ type: "success", text: "RSVP sent! Thank you." });
      setMembers([{ name: "" }]);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send RSVP right now. Please try again.";
      setBanner({ type: "error", text: message });
    } finally {
      setSending(false);
    }
  };

  if (!show) return null;

  return (
    <div className="rsvp-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rsvp-box" onClick={(e) => e.stopPropagation()}>
        <div className="rsvp-box__header">
          <div>
            <p className="eyebrow">RSVP</p>
            <h3>Who is coming?</h3>
            <p className="muted small">
              We will email the hosts with: “Hi, I/We will be attending your wedding. Congrats for your wedding.
              Count me/us.”
            </p>
          </div>
          <button className="closeBtn" type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="rsvp-fields">
          {members.map((m, index) => (
            <div key={index} className="field">
              <label htmlFor={`member-${index}`}>Name {members.length > 1 ? `#${index + 1}` : ""}</label>
              <input
                id={`member-${index}`}
                type="text"
                placeholder="Full name"
                value={m.name}
                onChange={(e) => handleChange(index, e.target.value)}
                required
              />
            </div>
          ))}
          <button className="addBtn" type="button" onClick={addMember}>
            + Add more member
          </button>
        </div>

        {banner.type && <div className={`rsvp-banner ${banner.type}`}>{banner.text}</div>}

        <div className="actions">
          <button className="cancelBtn" type="button" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button className="submitBtn" type="button" onClick={handleSubmit} disabled={sending}>
            {sending ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
