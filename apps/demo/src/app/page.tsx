import { useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thanks for subscribing!');
  };

  return (
    <main className="container">
      <section className="hero">
        <h1>Transform Your React Apps with Parlay</h1>
        <p>The easiest way to make your React applications global-ready.</p>
        <button type="button">Get Started Now</button>
      </section>

      <section className="features">
        <h2>Why Choose Parlay?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Lightning Fast Setup</h3>
            <p>Get your app ready for internationalization in minutes, not hours.</p>
          </div>
          <div className="feature-card">
            <h3>AI-Powered Translations</h3>
            <p>Leverage cutting-edge AI to translate your content accurately.</p>
          </div>
          <div className="feature-card">
            <h3>Developer Friendly</h3>
            <p>Simple CLI tools and intuitive web interface make i18n a breeze.</p>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest updates and tips.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email subscription"
          />
          <button type="submit">Subscribe Now</button>
        </form>
        <p className="disclaimer">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>

      <section className="testimonials">
        <h2>What Developers Say</h2>
        <div className="testimonial-grid">
          <blockquote>
            <p>"Parlay made internationalizing our app incredibly simple. We were up and running in no time!"</p>
            <cite>- Sarah Chen, Senior Developer</cite>
          </blockquote>
          <blockquote>
            <p>"The AI translations are surprisingly accurate. It saved us countless hours of manual translation work."</p>
            <cite>- Miguel Rodriguez, Tech Lead</cite>
          </blockquote>
        </div>
      </section>
    </main>
  );
} 