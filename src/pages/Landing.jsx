import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import RSVPModal from "../components/RSVPModal";
import "./Landing.css";

const timeline = [
  {
    time: "2:00 PM",
    title: "Welcome Sips",
    detail: "Arrive to sparkling drinks and soft strings in the garden.",
  },
  {
    time: "3:00 PM",
    title: "The Ceremony",
    detail: 'Under the floral arch as we say "I do" with our favorite people.',
  },
  {
    time: "4:30 PM",
    title: "Portraits in Bloom",
    detail: "Polaroids, candids, and a little golden-hour magic.",
  },
  {
    time: "6:00 PM",
    title: "Dinner & Dancing",
    detail: "Seasonal fare, heartfelt toasts, and a live band until late.",
  },
];

const highlights = [
  {
    label: "Venue",
    value: "BC Roy Institute, Sealdah",
    url: "https://maps.app.goo.gl/6bDzo7qz5rKUEjao9",
  },
  {
    label: "Address",
    value:
      "209, Officers Colony, Kaisar Street (near DRM office), Kolkata 700009, opposite to Jagat Cinema",
  },
];

const galleryCards = [
  { title: "Engagement", note: "Captured among the peonies" },
  { title: "Brunch Crew", note: "Coffee, laughter, and confetti" },
  { title: "Rehearsal", note: "Family hugs and warm lights" },
  { title: "First Look", note: "A quiet moment before the aisle" },
];

const fallbackSlides = [
  {
    id: "fallback-1",
    src: "/image wedding.png",
    caption: "Garden portraits",
    guest: "Our album",
  },
  {
    id: "fallback-2",
    src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
    caption: "Champagne toasts",
    guest: "Captured with love",
  },
  {
    id: "fallback-3",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    caption: "Golden hour dance floor",
    guest: "Shared by friends",
  },
];

export default function Landing() {
  const eventId = import.meta.env.VITE_EVENT_ID;
  const [slides, setSlides] = useState(() => fallbackSlides);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [sliderError, setSliderError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRsvpModal, setShowRsvpModal] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchPhotos = async () => {
      if (!eventId) {
        setSliderError("Add VITE_EVENT_ID to show live uploads here.");
        setSlides(fallbackSlides);
        setLoadingSlides(false);
        return;
      }

      setLoadingSlides(true);
      try {
        const res = await api.get(`/photos/${eventId}`);
        if (isCancelled) return;

        const photos = res.data || [];
        if (photos.length) {
          const normalized = photos.slice(0, 12).map((p, idx) => ({
            id: p._id || `photo-${idx}`,
            src: p.imageUrl,
            caption: p.message?.trim() || "Shared with love",
            guest: p.guestName?.trim(),
          }));
          setSlides(normalized);
          setSliderError(null);
        } else {
          setSlides(fallbackSlides);
          setSliderError("No uploads yet - be the first to add yours.");
        }
      } catch (err) {
        if (!isCancelled) {
          setSliderError("Unable to fetch live photos right now.");
          setSlides(fallbackSlides);
        }
      } finally {
        if (!isCancelled) {
          setLoadingSlides(false);
        }
      }
    };

    fetchPhotos();
    const interval = setInterval(fetchPhotos, 12000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [eventId]);

  useEffect(() => {
    if (!slides.length) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__floral hero__floral--left" aria-hidden="true" />
        <div className="hero__floral hero__floral--right" aria-hidden="true" />
        <div className="hero__content">
          <p className="eyebrow">Save the date</p>
          <h1 className="names">
            Debolina Sarkar <span>&</span> Gourab Kar
          </h1>
          <p className="hero__date">
            15 December 2025 - Monday - BC Roy Institute, Sealdah
          </p>
          <p className="hero__lead">
            A soft, floral celebration wrapped in champagne toasts, heart notes,
            and the people we love most.
          </p>
          <div className="hero__cta">
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowRsvpModal(true)}
            >
              RSVP now
            </button>
            <Link className="btn ghost" to="/upload">
              Share a photo
            </Link>
            <Link className="text-link" to="/gallery">
              View the gallery
            </Link>
          </div>
        </div>
        <div className="couple-photo" aria-label="Couple portrait">
          <img src="/image wedding.png" alt="Debolina Sarkar and Gourab Kar" loading="lazy" />
        </div>
      </section>

      <section className="section live-slider">
        <div className="live-slider__text">
          <p className="eyebrow">Live moments</p>
          <h2>Todays uploads in bloom</h2>
          <p className="muted">
            Every guest photo added to the gallery shows up here in real time. Keep
            sharing the love.
          </p>
          <div className="live-slider__cta">
            <Link className="btn primary" to="/upload">
              Add your photo
            </Link>
            <Link className="btn ghost" to="/gallery">
              More images
            </Link>
          </div>
        </div>
        <div className="live-slider__frame">
          <div className="live-slider__status-row">
            <span className="pill">Live gallery</span>
            {loadingSlides && <span className="live-slider__status">Refreshing...</span>}
            {!loadingSlides && sliderError && (
              <span className="live-slider__status muted">{sliderError}</span>
            )}
          </div>
          <div className="live-slider__rail" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide) => (
              <div key={slide.id} className="live-slider__slide">
                <img src={slide.src} alt={slide.caption} loading="lazy" />
                <div className="live-slider__caption">
                  <div className="live-slider__caption-title">{slide.caption}</div>
                  {slide.guest && <div className="live-slider__guest">- {slide.guest}</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="live-slider__dots">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                className={`dot ${idx === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <header className="section__header">
          <p className="eyebrow">Our day in bloom</p>
          <h2>Timelines & little moments</h2>
          <p className="muted">
            Think creamy petals, soft greens, clinking glasses, and a warm
            autumn dusk.
          </p>
        </header>
        <div className="timeline">
          {timeline.map((item) => (
            <div key={item.title} className="timeline__item">
              <div className="timeline__time">{item.time}</div>
              <div>
                <div className="timeline__title">{item.title}</div>
                <p className="timeline__detail">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid">
        <div className="card story">
          <p className="eyebrow">The story</p>
          <h3>Rooted in kindness, wrapped in florals</h3>
          <p className="muted">
            We met over coffee, became travel partners, and now we get to share
            vows beneath a leafy arch. Bring your best dance moves and your
            favorite toast.
          </p>
          <div className="story__badges">
            <span className="badge">Live band</span>
            <span className="badge">Champagne tower</span>
            <span className="badge">Photo booth</span>
          </div>
        </div>
      </section>

      <section className="section gallery">
        <header className="section__header">
          <p className="eyebrow">Glimpses</p>
          <h2>Petals, notes, and champagne bubbles</h2>
          <p className="muted">
            A peek at the mood - bouquets, hearts, and the little moments we
            love.
          </p>
        </header>
        <div className="gallery__grid">
          {galleryCards.map((card) => (
            <div key={card.title} className="gallery__card">
              <div className="gallery__floral" aria-hidden="true" />
              <div className="gallery__title">{card.title}</div>
              <p className="gallery__note">{card.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section details-landscape">
        <div className="details-landscape__text">
          <p className="eyebrow">Details</p>
          <h3>BC Roy Institute, Sealdah</h3>
          <div className="details__grid">
            {highlights.map((item) => (
              <div key={item.label} className="details__item">
                <p className="details__label">{item.label}</p>
                <p className="details__value">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="venue-link"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="details__note">
            Near DRM office - Opposite to Jagat Cinema - Kolkata 700009
          </div>
          <a
            href="https://maps.app.goo.gl/6bDzo7qz5rKUEjao9"
            target="_blank"
            rel="noreferrer"
            className="map-link"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="map-preview map-preview--wide">
          <iframe
            title="Map preview for BC Roy Institute, Sealdah"
            src="https://www.google.com/maps?q=BC%20Roy%20Institute%20Sealdah&output=embed"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="section rsvp">
        <div className="rsvp__inner">
          <div>
            <p className="eyebrow">RSVP</p>
            <h2>We can't wait to celebrate with you</h2>
            
          </div>
          <div className="rsvp__actions">
            <button
              className="btn primary"
              type="button"
              onClick={() => setShowRsvpModal(true)}
            >
              RSVP now
            </button>
            <Link className="btn ghost" to="/upload">
              Add your photo
            </Link>
          </div>
        </div>
      </section>

      <RSVPModal show={showRsvpModal} onClose={() => setShowRsvpModal(false)} />
    </div>
  );
}
