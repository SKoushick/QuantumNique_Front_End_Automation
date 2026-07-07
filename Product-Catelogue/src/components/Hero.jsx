import React from 'react';
import { motion } from 'framer-motion';
import starryNight from "../assets/images/starry-night.jpg";

const Hero = ({ onExplore, onMeetArtist }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <header className="hero-section">
      {/* Background Banner with Starry Night Masterpiece */}
      <div className="hero-bg-wrapper">
        <motion.div
          className="hero-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.img
          src={starryNight}
          alt="Starry Night"
          className="hero-banner-image"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Swirling Clouds overlay */}
        <div className="hero-clouds">
          <motion.div 
            className="cloud-layer layer-1"
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="cloud-layer layer-2"
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Animated stars overlay */}
        <motion.div 
          className="hero-stars"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {[
            { top: '15%', left: '20%', delay: 0 },
            { top: '25%', left: '60%', delay: 0.3 },
            { top: '10%', left: '75%', delay: 0.6 },
            { top: '40%', left: '45%', delay: 0.9 },
            { top: '30%', left: '85%', delay: 1.2 }
          ].map((star, i) => (
            <motion.div
              key={i}
              className="pulsing-star"
              style={{ top: star.top, left: star.left }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut"
              }}
            >
              ✦
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Cinematic Hero Content */}
      <motion.div 
        className="hero-content container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="museum-label-hero"
          variants={itemVariants}
        >
          The Starry Night Inspiration
        </motion.div>
        <motion.h1 
          className="hero-headline"
          variants={itemVariants}
        >
          Every Painting <br />
          <span className="gold-text-gradient">Tells a Story.</span>
        </motion.h1>
        <motion.p 
          className="hero-subtitle"
          variants={itemVariants}
        >
          Discover original artworks crafted with passion, emotional force, and deep imagination.
        </motion.p>
        <motion.div 
          className="hero-btn-group"
          variants={itemVariants}
        >
          <motion.button 
            className="gold-btn btn-lg"
            onClick={onExplore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Gallery
            <motion.svg 
              className="btn-arrow"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </motion.svg>
          </motion.button>
          <motion.button 
            className="secondary-btn btn-lg"
            onClick={onMeetArtist}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Meet the Artist
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </motion.div>
      </motion.div>
    </header>
  );
};

export default Hero;
