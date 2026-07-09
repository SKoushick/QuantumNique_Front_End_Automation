import React, { useState, useEffect, useRef, useCallback } from 'react';
import StandardCalc from './components/StandardCalc';
import { audioSynth } from './utils/audio';

function App() {
  const [muted, setMuted] = useState(false);
  const [fishAreScattering, setFishAreScattering] = useState(false);

  const fxCanvasRef = useRef(null);
  const bubbles = useRef([]);
  const fishes = useRef([]);
  const popParticles = useRef([]);
  const bubblesInited = useRef(false);

  // Sync mute state
  useEffect(() => {
    audioSynth.setMuted(muted);
  }, [muted]);

  // Fish scattering trigger on result calculation
  const triggerFishScatter = useCallback(() => {
    if (fishAreScattering) return;

    setFishAreScattering(true);
    audioSynth.playSuccess();

    // Reset the fish after the animation
    setTimeout(() => {
      setFishAreScattering(false);
    }, 4000); // Fish return after 4 seconds
  }, [fishAreScattering]);

  // Initialize and run Canvas FX (Fish and Bubbles)
  useEffect(() => {
    const canvas = fxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bubblesInited.current = false;
      // Fish will re-init on their own when they swim off-screen
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial background bubbles
    const initBubbles = () => {
      if (bubblesInited.current) return;
      bubblesInited.current = true;
      bubbles.current = [];
      const count = 35;
      for (let i = 0; i < count; i++) {
        bubbles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height + canvas.height,
          radius: Math.random() * 8 + 3,
          speedY: Math.random() * 1.2 + 0.6,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
          wobbleDistance: Math.random() * 12 + 4,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    // Initialize fish species
    // Species types: clownfish, bluetang, butterflyfish
    const initFishes = () => {
      if (fishes.current.length > 0) return;
      
      const speciesList = [
        {
          species: 'clownfish',
          bodyColor: '#ff7675', // bright orange
          tailColor: '#ff7675',
          finColor: '#ff7675',
          swimSpeed: 0.15,
          length: 36,
          width: 14
        },
        {
          species: 'bluetang',
          bodyColor: '#0984e3', // electric royal blue
          tailColor: '#fdcb6e', // yellow tail
          finColor: '#0984e3',
          swimSpeed: 0.22,
          length: 42,
          width: 16
        },
        {
          species: 'butterflyfish',
          bodyColor: '#ffeaa7', // lemon yellow
          tailColor: '#ffeaa7',
          finColor: '#ffeaa7',
          swimSpeed: 0.12,
          length: 34,
          width: 18
        }
      ];

      // Spawn 8-12 roaming fish
      const fishCount = 10;
      for (let i = 0; i < fishCount; i++) {
        const template = speciesList[Math.floor(Math.random() * speciesList.length)];
        const swimRight = Math.random() > 0.5;
        fishes.current.push({
          ...template,
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.8) + (canvas.height * 0.1),
          vx: swimRight ? Math.random() * 1.2 + 0.6 : -(Math.random() * 1.2 + 0.6),
          vy: (Math.random() - 0.5) * 0.4,
          swimPhase: Math.random() * Math.PI * 2
        });
      }
    };

    const drawFish = (ctx, fish, time) => {
      ctx.save();
      ctx.translate(fish.x, fish.y);
      
      // Determine orientation angle based on velocity
      const angle = Math.atan2(fish.vy, fish.vx);
      ctx.rotate(angle);

      const len = fish.length;
      const h = fish.width;
      const phase = fish.swimPhase + time * fish.swimSpeed;
      const tailWag = Math.sin(phase) * 5; // horizontal tail fin wagging

      // 1. Draw Tail Fin (rendered behind body)
      ctx.beginPath();
      const jointX = -len * 0.4;
      const jointY = 0;
      const tipX = -len * 0.65;
      ctx.moveTo(jointX, jointY);
      ctx.lineTo(tipX, jointY - h * 0.45 + tailWag);
      ctx.lineTo(tipX, jointY + h * 0.45 + tailWag);
      ctx.closePath();
      ctx.fillStyle = fish.tailColor;
      ctx.fill();

      // Tail fin outlines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Draw Dorsal & Ventral Fins
      ctx.beginPath();
      // Dorsal (Top)
      ctx.moveTo(-len * 0.25, -h * 0.4);
      ctx.quadraticCurveTo(-len * 0.05, -h * 0.9, len * 0.1, -h * 0.3);
      ctx.lineTo(-len * 0.1, -h * 0.4);
      ctx.fillStyle = fish.finColor;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      // Ventral (Bottom)
      ctx.moveTo(-len * 0.2, h * 0.4);
      ctx.quadraticCurveTo(-len * 0.05, h * 0.8, len * 0.1, h * 0.35);
      ctx.lineTo(-len * 0.1, h * 0.4);
      ctx.fillStyle = fish.finColor;
      ctx.fill();
      ctx.stroke();

      // 3. Draw Body (Main Oval)
      ctx.beginPath();
      ctx.moveTo(len * 0.5, 0); // nose tip
      ctx.quadraticCurveTo(len * 0.1, -h * 0.6, -len * 0.4, 0); // top curve
      ctx.quadraticCurveTo(len * 0.1, h * 0.6, len * 0.5, 0); // bottom curve
      ctx.closePath();
      ctx.fillStyle = fish.bodyColor;
      ctx.fill();
      ctx.stroke();

      // 4. Species-specific body patterns
      if (fish.species === 'clownfish') {
        // Vertical white bands bordered in black
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        // Mid band
        ctx.beginPath();
        ctx.moveTo(-len * 0.02, -h * 0.49);
        ctx.quadraticCurveTo(-len * 0.04, 0, -len * 0.02, h * 0.49);
        ctx.lineTo(-len * 0.12, h * 0.46);
        ctx.quadraticCurveTo(-len * 0.14, 0, -len * 0.12, -h * 0.46);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Front band
        ctx.beginPath();
        ctx.moveTo(len * 0.2, -h * 0.45);
        ctx.quadraticCurveTo(len * 0.18, 0, len * 0.2, h * 0.45);
        ctx.lineTo(len * 0.1, h * 0.48);
        ctx.quadraticCurveTo(len * 0.08, 0, len * 0.1, -h * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (fish.species === 'bluetang') {
        // Side pattern
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(-len * 0.05, 0, len * 0.2, h * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (fish.species === 'butterflyfish') {
        // Vertical black stripe through eye
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.moveTo(len * 0.33, -h * 0.32);
        ctx.lineTo(len * 0.25, -h * 0.42);
        ctx.lineTo(len * 0.2, h * 0.42);
        ctx.lineTo(len * 0.28, h * 0.32);
        ctx.closePath();
        ctx.fill();
      }

      // 5. Draw Eye
      const eyeX = len * 0.28;
      const eyeY = -h * 0.16;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, h * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(eyeX + 1, eyeY, h * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Eye highlight
      ctx.beginPath();
      ctx.arc(eyeX - 0.5, eyeY - 0.5, h * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // 6. Draw Pectoral Fin (layered on top)
      ctx.beginPath();
      ctx.moveTo(len * 0.05, h * 0.15);
      ctx.quadraticCurveTo(-len * 0.12, h * 0.45, -len * 0.04, h * 0.1);
      ctx.closePath();
      ctx.fillStyle = fish.finColor;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.stroke();

      ctx.restore();
    };

    const drawBubble = (ctx, bubble) => {
      ctx.save();
      // Draw wobbly bubble
      const wobbleX = Math.sin(bubble.phase) * bubble.wobbleDistance;
      const bubbleX = bubble.x + wobbleX;
      
      ctx.beginPath();
      ctx.arc(bubbleX, bubble.y, bubble.radius, 0, Math.PI * 2);
      
      // Translucent bubble gradient
      const grad = ctx.createRadialGradient(
        bubbleX - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.1,
        bubbleX, bubble.y, bubble.radius
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.8, 'rgba(0, 206, 201, 0.12)');
      grad.addColorStop(1, 'rgba(0, 206, 201, 0.4)');

      ctx.fillStyle = grad;
      ctx.fill();

      // Bubble outline
      ctx.strokeStyle = 'rgba(129, 236, 236, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular highlight crescent
      ctx.beginPath();
      ctx.arc(bubbleX - bubble.radius * 0.35, bubble.y - bubble.radius * 0.35, bubble.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      // Initialize background bubbles and fish
      initBubbles();
      initFishes();

      // 1. Set a solid sky-blue background
      ctx.fillStyle = 'skyblue';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Animate and draw background roaming fishes
      fishes.current.forEach((fish) => {
        // Move fish
        fish.x += fish.vx;
        fish.y += fish.vy;

        // Occasional gentle depth drift changes
        if (Math.random() < 0.015) {
          fish.vy = (Math.random() - 0.5) * 0.4;
        }

        // Screen wraps/bounce steerings
        const buffer = 80;
        if (fish.vx > 0 && fish.x > canvas.width + buffer) {
          fish.x = -buffer;
          fish.y = Math.random() * (canvas.height * 0.8) + (canvas.height * 0.1);
        } else if (fish.vx < 0 && fish.x < -buffer) {
          fish.x = canvas.width + buffer;
          fish.y = Math.random() * (canvas.height * 0.8) + (canvas.height * 0.1);
        }

        // Keep fish vertically on screen
        if (fish.y < buffer) {
          fish.vy = Math.abs(fish.vy) * 0.5 + 0.1;
        } else if (fish.y > canvas.height - buffer) {
          fish.vy = -Math.abs(fish.vy) * 0.5 - 0.1;
        }

        // Draw fish
        drawFish(ctx, fish, time);
      });

      // 3. Animate and draw background rising bubbles
      bubbles.current.forEach((bubble) => {
        // Movement logic is commented out to keep bubbles static
        drawBubble(ctx, bubble);
      });

      // 4. Draw & animate click-spawns pop-bubbles
      popParticles.current = popParticles.current.filter((p) => {
        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Spawn rising bubble particles on clicks
  const triggerSparks = (e) => {
    if (!e || !e.clientX || !e.clientY) return;

    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      popParticles.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // push slightly upward
        lift: 0.1, // float up
        radius: Math.random() * 5 + 2,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  };

  return (
    <div className="app-container">
      {/* Spark / Bubble FX Canvas Layer */}
      <canvas ref={fxCanvasRef} className="fx-canvas" />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-title">
            <h1>Basic Calculator</h1>
          </div>

          <div className="header-controls">
            {/* Mute Audio Toggle */}
            <button
              className="header-btn"
              onClick={() => {
                audioSynth.playClick('special');
                setMuted(!muted);
              }}
              title={muted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {muted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Panel Main Area */}
        <main className="panel-body">
          <StandardCalc onButtonPress={triggerSparks} onResult={triggerFishScatter} />
        </main>
      </div>
    </div>
  );
}

export default App;
