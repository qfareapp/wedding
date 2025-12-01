import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Gallery.css";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const eventId = import.meta.env.VITE_EVENT_ID;

  const loadPhotos = async () => {
    if (!eventId) {
      setError("Missing event id. Please set VITE_EVENT_ID in your .env file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/photos/${eventId}`);
      setPhotos(res.data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "We couldn't load the gallery right now. Please try again soon.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [eventId]);

  const decoratedPhotos = useMemo(
    () =>
      photos.map((p, idx) => ({
        ...p,
        caption: p.message?.trim() || "Shared with love",
        guest: p.guestName?.trim() || "Guest",
      })),
    [photos]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      }
      if (selectedIndex !== null && decoratedPhotos.length) {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, decoratedPhotos.length]);

  const handleSelect = (idx) => {
    setSelectedIndex(idx);
  };

  const closeModal = () => setSelectedIndex(null);

  const handleNext = () => {
    if (!decoratedPhotos.length || selectedIndex === null) return;
    setSelectedIndex((prev) => (prev + 1) % decoratedPhotos.length);
  };

  const handlePrev = () => {
    if (!decoratedPhotos.length || selectedIndex === null) return;
    setSelectedIndex((prev) => (prev - 1 + decoratedPhotos.length) % decoratedPhotos.length);
  };

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= decoratedPhotos.length) {
      setSelectedIndex(null);
    }
  }, [decoratedPhotos.length, selectedIndex]);

  const selected = selectedIndex !== null ? decoratedPhotos[selectedIndex] : null;

  return (
    <div className="gallery-page">
      <header className="gallery-hero">
        <div>
          <p className="eyebrow">Live gallery</p>
          <h1>Fresh from our guests</h1>
          <p className="muted">
            A flowing collage of every photo shared with us. Tap any image to see who shared it, read their note, and
            download a copy.
          </p>
          <div className="gallery-cta">
            <Link className="btn primary" to="/upload">Add your photo</Link>
            <button className="btn ghost" type="button" onClick={loadPhotos} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {error && <p className="gallery-error">{error}</p>}
        </div>
        <div className="gallery-hero__badge">
          <span className="badge">Real-time</span>
          <span className="badge badge--outline">{photos.length} uploads</span>
        </div>
      </header>

      <section className="collage-card">
        {!photos.length && !error && (
          <div className="collage-empty">
            <p className="eyebrow">Waiting for the first photo</p>
            <p className="muted">Be the first to share a memory from the celebration.</p>
            <Link className="btn primary" to="/upload">Upload now</Link>
          </div>
        )}

        <div className="collage-grid">
          {decoratedPhotos.map((photo, idx) => (
            <button
              key={photo._id || photo.imageUrl}
              type="button"
              className="collage-tile"
              onClick={() => handleSelect(idx)}
            >
              <img src={photo.imageUrl} alt={photo.caption} loading="lazy" />
              <div className="tile-overlay">
                <div className="tile-guest">{photo.guest}</div>
                <div className="tile-caption">{photo.caption}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div className="gallery-modal" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="gallery-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image">
              <button type="button" className="modal-nav prev" aria-label="Previous image" onClick={handlePrev}>
                {"<"}
              </button>
              <img src={selected.imageUrl} alt={selected.caption} />
              <button type="button" className="modal-nav next" aria-label="Next image" onClick={handleNext}>
                {">"}
              </button>
              <div className="modal-counter">
                {selectedIndex + 1} / {decoratedPhotos.length}
              </div>
            </div>
            <div className="modal-body">
              <p className="eyebrow">Shared by {selected.guest || "Guest"}</p>
              <h3>{selected.caption}</h3>
              <p className="muted">
                {selected.message?.trim() || "A sweet moment from the celebration."}
              </p>
              <div className="modal-actions">
                <a className="btn primary" href={selected.imageUrl} target="_blank" rel="noreferrer" download>
                  Download
                </a>
                <button className="btn ghost" type="button" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
