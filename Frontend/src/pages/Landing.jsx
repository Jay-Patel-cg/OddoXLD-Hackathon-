import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Globe, ArrowRight, Share2 } from 'lucide-react';
import FeaturedDestinationsSection from '../components/landing/FeaturedDestinationsSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturedVideoSection from '../components/landing/FeaturedVideoSection';
import PhilosophySection from '../components/landing/PhilosophySection';
import ServicesSection from '../components/landing/ServicesSection';

const Landing = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);

  // Vanilla JS smooth video opacity crossfade loop ref control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isFadingOut = false;
    let fadeStartTime = 0;
    const fadeDuration = 500; // ms

    const animateFade = (startOpacity, endOpacity, onComplete) => {
      fadeStartTime = performance.now();

      const step = (now) => {
        const elapsed = now - fadeStartTime;
        const progress = Math.min(elapsed / fadeDuration, 1);
        const currentOpacity = startOpacity + (endOpacity - startOpacity) * progress;

        if (video) {
          video.style.opacity = String(currentOpacity);
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else if (onComplete) {
          onComplete();
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    };

    const handleCanPlay = () => {
      video.play().catch(() => {});
      animateFade(0, 1);
    };

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !isFadingOut) {
        isFadingOut = true;
        animateFade(parseFloat(video.style.opacity || '1'), 0);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        isFadingOut = false;
        video.play().catch(() => {});
        animateFade(0, 1);
      }, 100);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      if (video) {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div style={{ background: '#000000', color: '#FFFFFF', minHeight: '100vh' }}>
      {/* SECTION 1 -- HERO */}
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Background Video */}
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
          muted
          autoPlay
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'bottom',
            opacity: 0,
            pointerEvents: 'none'
          }}
        />

        {/* Liquid Glass Pill Navbar */}
        <div style={{ position: 'relative', zIndex: 20, padding: '1.5rem' }}>
          <div
            className="liquid-glass"
            style={{
              maxWidth: '64rem',
              margin: '0 auto',
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Left Brand + Nav Links */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Custom Musafir Travel Logo */}
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Compass size={18} />
                </div>
                <span style={{ color: '#FFF', fontWeight: '700', fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                  Musafir
                </span>
              </Link>

              {/* Navigation Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginLeft: '2rem' }}>
                <Link to="/explore" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>
                  Explore
                </Link>
                <Link to="/trips" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>
                  My Trips
                </Link>
                <Link to="/plan" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: '500' }}>
                  AI Planner
                </Link>
              </div>
            </div>

            {/* Right Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/register" style={{ color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500' }}>
                Sign Up
              </Link>
              <Link
                to="/login"
                className="liquid-glass"
                style={{
                  borderRadius: '9999px',
                  padding: '0.5rem 1.5rem',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            transform: 'translateY(-10%)'
          }}
        >
          {/* Main Heading */}
          <h1
            className="font-serif-instrument"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              fontWeight: '400',
              marginBottom: '2.5rem'
            }}
          >
            Know it then <em style={{ fontStyle: 'italic' }}>all</em>.
          </h1>

          {/* Email Subscription Input Pill */}
          <form
            onSubmit={(e) => { e.preventDefault(); navigate('/plan'); }}
            className="liquid-glass"
            style={{
              maxWidth: '36rem',
              width: '100%',
              borderRadius: '9999px',
              padding: '0.4rem 0.5rem 0.4rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}
          >
            <input
              type="email"
              placeholder="Enter your email to plan a trip..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                flex: 1
              }}
            />
            <button
              type="submit"
              style={{
                background: '#FFFFFF',
                borderRadius: '50%',
                padding: '0.75rem',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Subtitle */}
          <p style={{ color: '#FFFFFF', fontSize: '0.875rem', lineHeight: 1.6, padding: '0 1rem', maxWidth: '34rem', marginBottom: '2rem' }}>
            Stay updated with the latest travel insights. Subscribe to our newsletter today and never miss out on exciting journeys.
          </p>

          {/* Manifesto / Explore Button */}
          <button
            onClick={() => navigate('/explore')}
            className="liquid-glass"
            style={{
              borderRadius: '9999px',
              padding: '0.75rem 2rem',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Explore Journeys
          </button>
        </div>

        {/* Social Icons Footer */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', gap: '1rem', paddingBottom: '3rem' }}>
          <button className="liquid-glass" style={{ borderRadius: '50%', padding: '1rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
            <Globe size={20} />
          </button>
          <button className="liquid-glass" style={{ borderRadius: '50%', padding: '1rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
            <Compass size={20} />
          </button>
          <button className="liquid-glass" style={{ borderRadius: '50%', padding: '1rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* FEATURED DESTINATIONS SHOWCASE */}
      <FeaturedDestinationsSection />

      {/* SECTION 2 -- ABOUT */}
      <AboutSection />

      {/* SECTION 3 -- FEATURED VIDEO */}
      <FeaturedVideoSection />

      {/* SECTION 4 -- PHILOSOPHY */}
      <PhilosophySection />

      {/* SECTION 5 -- SERVICES */}
      <ServicesSection />
    </div>
  );
};

export default Landing;
