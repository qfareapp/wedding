import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Upload.css";

const initialAlert = { type: null, text: "" };

export default function Upload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(initialAlert);

  const eventId = import.meta.env.VITE_EVENT_ID;
  const apiKey = import.meta.env.VITE_API_KEY;

  const previewUrls = useMemo(
    () => selectedFiles.map((f) => f.preview),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      // cleanup object URLs on unmount
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelect = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;
    // revoke previous previews
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "idle",
      error: null,
    }));
    setSelectedFiles(mapped);
    setAlert(initialAlert);
  };

  const handleUpload = async () => {
    if (!eventId) {
      setAlert({ type: "error", text: "Missing event id. Please set VITE_EVENT_ID in your .env file." });
      return;
    }

    if (!selectedFiles.length) {
      setAlert({ type: "error", text: "Please add at least one image." });
      return;
    }

    setUploading(true);
    setAlert(initialAlert);

    let successCount = 0;
    for (let i = 0; i < selectedFiles.length; i += 1) {
      setSelectedFiles((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "uploading", error: null } : item))
      );

      const formData = new FormData();
      formData.append("image", selectedFiles[i].file);
      formData.append("guestName", guestName);
      formData.append("message", message);
      formData.append("eventId", eventId);
      if (apiKey) {
        formData.append("api_key", apiKey);
      }

      try {
        await api.post("/photos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        successCount += 1;
        setSelectedFiles((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "done", error: null } : item))
        );
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Upload failed";
        setSelectedFiles((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "error", error: msg } : item))
        );
      }
    }

    if (successCount === selectedFiles.length) {
      setAlert({ type: "success", text: "All photos uploaded successfully!" });
      setSelectedFiles([]);
      setMessage("");
      setGuestName("");
    } else {
      setAlert({
        type: "error",
        text: "Some photos did not upload. Please retry the ones marked in red.",
      });
    }

    setUploading(false);
  };

  const fileInputId = "upload-input";

  return (
    <div className="upload-page">
      <header className="upload-hero">
        <div>
          <p className="eyebrow">Share a moment</p>
          <h1>Upload your photos</h1>
          <p className="muted">
            Add one or many photos from the celebration. We’ll keep the quality crisp and fit them right into
            the live gallery.
          </p>
          <div className="hero-actions">
            <Link className="btn ghost" to="/gallery">View gallery</Link>
          </div>
        </div>
        <div className="upload-tip">
          <p className="tip-title">Upload tips</p>
          <ul>
            <li>Max 25MB per photo (auto-compressed under 10MB).</li>
            <li>JPG/PNG/HEIC supported.</li>
            <li>Good light looks great - share your favorites!</li>
          </ul>
        </div>
      </header>

      <section className="upload-card">
        <div className="form-grid">
          <div className="form-block">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Gourab Kar"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>
          <div className="form-block">
            <label htmlFor="message">Caption / note (optional)</label>
            <textarea
              id="message"
              rows="3"
              placeholder="A sweet note about this moment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="dropzone">
          <div className="dropzone__info">
            <p className="dropzone__title">Add your photos</p>
            <p className="muted small">You can select multiple files. Aspect ratio is kept as-is.</p>
            <div className="dropzone__actions">
              <label className="btn primary" htmlFor={fileInputId}>
                Choose images
              </label>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                hidden
              />
              <button
                className="btn ghost"
                type="button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          <div className="preview-grid">
            {!selectedFiles.length && (
              <div className="preview-empty">
                <p className="eyebrow">No photos yet</p>
                <p className="muted small">Select one or more images to preview them here.</p>
              </div>
            )}
            {selectedFiles.map((item) => (
              <div
                key={item.preview}
                className={`preview-thumb status-${item.status}`}
                title={item.error || ""}
              >
                <img src={item.preview} alt={item.file.name} loading="lazy" />
                <div className="preview-meta">
                  <span className="preview-name">{item.file.name}</span>
                  <span className="preview-status">
                    {item.status === "uploading" && "Uploading..."}
                    {item.status === "done" && "Uploaded"}
                    {item.status === "error" && "Retry"}
                    {item.status === "idle" && "Ready"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {alert.type && (
          <div className={`banner banner-${alert.type}`}>
            {alert.text}
          </div>
        )}
      </section>
    </div>
  );
}
