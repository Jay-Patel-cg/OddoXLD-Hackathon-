import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{
        background: '#000000',
        paddingTop: '8rem',
        paddingBottom: '3rem',
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
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.875rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}
        >
          About Us
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontWeight: '400'
          }}
        >
          Pioneering then{' '}
          <span className="font-serif-instrument" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
            ideas
          </span>{' '}
          for
          <br />
          minds that then{' '}
          <span className="font-serif-instrument" style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
            create, build, and inspire.
          </span>
        </motion.h2>
      </div>
    </section>
  );
};

export default AboutSection;
