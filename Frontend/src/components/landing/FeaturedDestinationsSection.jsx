import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Star, MapPin, Sparkles, ArrowRight } from 'lucide-react';

const FEATURED_DESTINATIONS = [
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    category: 'Shopping',
    rating: '4.9',
    cost: '₹6,000/day',
    desc: 'Futuristic desert metropolis known for luxury shopping, ultra-modern skyscrapers, Burj Khalifa, and artificial islands.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'New York',
    country: 'United States',
    category: 'Entertainment',
    rating: '4.9',
    cost: '₹6,000/day',
    desc: 'The city that never sleeps, boasting Broadway, Central Park, Times Square, Statue of Liberty, and an iconic skyline.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Paris',
    country: 'France',
    category: 'Culture',
    rating: '4.9',
    cost: '₹4,800/day',
    desc: 'Global center for art, fashion, gastronomy, and romance featuring the Eiffel Tower, Louvre, and charming cafes.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    category: 'Tradition',
    rating: '4.9',
    cost: '₹5,500/day',
    desc: 'Ultramodern metropolis combining neon-lit skyscrapers, historic temples, anime culture, and world-class culinary art.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    category: 'Wellness',
    rating: '4.9',
    cost: '₹3,200/day',
    desc: 'Tropical paradise of volcanic mountains, iconic rice paddies, serene beaches, ancient temples, and soul relaxation.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
  }
];

const FeaturedDestinationsSection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        background: '#000000',
        paddingTop: '6rem',
        paddingBottom: '6rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '76rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3.5rem',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                fontWeight: '600'
              }}
            >
              Iconic World Destinations
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.8rem)',
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                fontWeight: '700',
                lineHeight: 1.1
              }}
            >
              Explore the World's Finest
            </h2>
          </div>

          <button
            onClick={() => navigate('/explore')}
            className="liquid-glass"
            style={{
              borderRadius: '9999px',
              padding: '0.75rem 1.75rem',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>View All Destinations</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* 5 Destination Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {FEATURED_DESTINATIONS.map((dest, idx) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: idx * 0.12 }}
              onClick={() => navigate(`/explore/${dest.name}`)}
              className="liquid-glass"
              style={{
                borderRadius: '1.5rem',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Image Header with Rating Badge */}
              <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
                  }}
                />
                <div
                  className="liquid-glass"
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: '#FFFFFF'
                  }}
                >
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>{dest.rating}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Title & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>{dest.name}</h3>
                  <span
                    className="liquid-glass"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      color: '#10B981',
                      textTransform: 'capitalize'
                    }}
                  >
                    {dest.category}
                  </span>
                </div>

                {/* Country Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', marginBottom: '0.85rem' }}>
                  <MapPin size={14} color="#10B981" />
                  <span>{dest.country}</span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
                  {dest.desc}
                </p>

                {/* Bottom Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF' }}>
                    {dest.cost}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/plan?destination=${encodeURIComponent(dest.name)}`);
                    }}
                    className="liquid-glass"
                    style={{
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      borderRadius: '9999px',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} color="#10B981" />
                    <span>Plan Trip</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinationsSection;
