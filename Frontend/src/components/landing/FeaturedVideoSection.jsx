import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FeaturedVideoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        background: '#000000',
        paddingTop: '2rem',
        paddingBottom: '6rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        overflow: 'hidden'
      }}
    >
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          style={{
            position: 'relative',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            aspectRatio: '16 / 9',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}
        >
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
              pointerEvents: 'none'
            }}
          />

          {/* Bottom Content Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1.5rem',
              zIndex: 10
            }}
          >
            {/* Left Liquid Glass Card */}
            <div
              className="liquid-glass"
              style={{
                borderRadius: '1rem',
                padding: '1.5rem 2rem',
                maxWidth: '28rem',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontWeight: '600'
                }}
              >
                Our Approach
              </div>
              <p style={{ color: '#FFFFFF', fontSize: '0.95rem', lineHeight: 1.6 }}>
                We believe in the power of curiosity-driven exploration. Every project starts with a question, and every answer opens a new door to innovation.
              </p>
            </div>

            {/* Right Explore More Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass"
              style={{
                borderRadius: '9999px',
                padding: '0.85rem 2rem',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Explore more
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedVideoSection;
