import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const cards = [
    {
      video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
      tag: 'Strategy',
      title: 'Research & Insight',
      description: 'We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.'
    },
    {
      video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
      tag: 'Craft',
      title: 'Design & Execution',
      description: 'From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.'
    }
  ];

  return (
    <section
      ref={ref}
      style={{
        background: '#000000',
        paddingTop: '6rem',
        paddingBottom: '8rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Radial overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '3.5rem'
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#FFFFFF', letterSpacing: '-0.03em', fontWeight: '700' }}>
            What we do
          </h2>
          <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem', fontWeight: '600' }}>
            Our services
          </div>
        </motion.div>

        {/* 2-Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="liquid-glass"
              style={{ borderRadius: '1.5rem', overflow: 'hidden' }}
            >
              {/* Card Video Area */}
              <div style={{ aspectRatio: '16 / 9', position: 'relative', overflow: 'hidden' }}>
                <video
                  src={card.video}
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)'
                  }}
                />
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.75rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600' }}>
                    {card.tag}
                  </span>
                  <div className="liquid-glass" style={{ borderRadius: '9999px', padding: '0.5rem', color: '#FFF' }}>
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                  {card.title}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
