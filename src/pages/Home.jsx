import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate("/trips/new");

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-content">
          <h1>Plan Smarter, Travel Together</h1>
          <p className="subtitle">
            Keep your group organized with shared checklists, notes, and itineraries — all in one place.
          </p>
          <button className="cta-btn" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </section>

      <section className="features">
        <article className="feature-card">
          <h2>Collaborate</h2>
          <p>Invite friends and plan trips together with live updates.</p>
        </article>
        <article className="feature-card">
          <h2>Organize</h2>
          <p>Centralize checklists, notes, and links for every trip.</p>
        </article>
        <article className="feature-card">
          <h2>Track</h2>
          <p>See progress at a glance and keep everyone on the same page.</p>
        </article>
      </section>
    </main>
  );
}