import React, { useEffect, useRef } from 'react';

const StarryBg = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle Classes
    class Star {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Start anywhere initially
      }

      reset() {
        this.x = Math.random() * width;
        this.y = 0 - 10;
        this.size = Math.random() * 3 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.glowSpeed = Math.random() * 0.02 + 0.005;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.color = Math.random() > 0.3 ? '#FBBF24' : '#FCD34D'; // Starry Gold Yellow
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Glow pulsation
        this.alpha += this.glowSpeed;
        if (this.alpha > 0.85 || this.alpha < 0.1) {
          this.glowSpeed = -this.glowSpeed;
        }

        if (this.y > height || this.x < 0 || this.x > width) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class SwirlParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.3 + 0.05;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.5 + 0.2;
        this.radius = Math.random() * 100 + 50;
        this.color = theme === 'dark' ? '#1D4ED8' : '#DBEAFE'; // Royal blue trails
      }

      update() {
        this.angle += 0.002;
        // Float in a wave/swirling pattern
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed * 0.5 + 0.1; // Gentle sink

        if (this.y > height) {
          this.y = 0;
          this.x = Math.random() * width;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const stars = Array.from({ length: 45 }, () => new Star());
    const particles = Array.from({ length: 30 }, () => new SwirlParticle());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Clear with a tiny alpha to create very subtle motion trails
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background brush swirls (using canvas bezier curves)
      ctx.save();
      ctx.strokeStyle = theme === 'dark' ? 'rgba(30, 58, 138, 0.08)' : 'rgba(219, 234, 254, 0.2)';
      ctx.lineWidth = 40;
      ctx.beginPath();
      // Wave 1
      ctx.moveTo(-100, height * 0.3);
      ctx.bezierCurveTo(width * 0.3, height * 0.1, width * 0.6, height * 0.6, width + 100, height * 0.4);
      ctx.stroke();

      // Wave 2
      ctx.lineWidth = 60;
      ctx.beginPath();
      ctx.moveTo(-100, height * 0.65);
      ctx.bezierCurveTo(width * 0.4, height * 0.85, width * 0.7, height * 0.4, width + 100, height * 0.6);
      ctx.stroke();
      ctx.restore();

      // Draw stars and floating dust
      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default StarryBg;
