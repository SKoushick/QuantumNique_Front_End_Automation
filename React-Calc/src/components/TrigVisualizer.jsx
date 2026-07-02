import React, { useState, useEffect, useRef } from 'react';
import { audioSynth } from '../utils/audio';

const TrigVisualizer = () => {
  const [angle, setAngle] = useState(45); // Degrees (0 to 360)
  const canvasRef = useRef(null);
  const isDragging = useRef(false);

  const rad = (angle * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  const tanVal = Math.abs(cosVal) > 0.0001 ? Math.tan(rad) : Infinity;

  // Render variables
  const formatVal = (val) => {
    if (val === Infinity || Math.abs(val) > 1000) return 'Undefined';
    return Number(val.toFixed(4)).toString();
  };

  const drawUnitCircle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Reset and clear
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.35; // 35% of size

    const style = getComputedStyle(document.body);
    const gridLineColor = style.getPropertyValue('--grid-line') || 'rgba(255, 255, 255, 0.08)';
    const textPrimaryColor = style.getPropertyValue('--text-primary') || '#ffffff';
    const textSecondaryColor = style.getPropertyValue('--text-secondary') || '#888888';

    // Color definitions
    const cosColor = '#38bdf8'; // Sky Blue
    const sinColor = '#4ade80'; // Emerald Green
    const tanColor = '#f43f5e'; // Rose Pink
    const hypColor = '#a855f7'; // Purple (Hypotenuse)

    // 1. Grid Axes
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY); ctx.lineTo(w, centerY);
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h);
    ctx.stroke();

    // 2. Draw Unit Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Highlighted Angle Arc
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // In HTML5 Canvas, y increases downwards, so we negate the angle for standard math orientation
    ctx.arc(centerX, centerY, radius * 0.25, 0, -rad, angle > 180 || angle < 0);
    ctx.stroke();

    // Calculate coordinate on unit circle
    const targetX = centerX + cosVal * radius;
    const targetY = centerY - sinVal * radius; // Negate Y for canvas coordinates

    // 4. Draw Cosine (X-component) - Blue
    ctx.strokeStyle = cosColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(targetX, centerY);
    ctx.stroke();

    // 5. Draw Sine (Y-component) - Green
    ctx.strokeStyle = sinColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(targetX, centerY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // 6. Draw Hypotenuse - Purple
    ctx.strokeStyle = hypColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // 7. Draw Tangent line - Rose Pink
    if (Math.abs(cosVal) > 0.0001) {
      // Tangent line touches the circle at targetX, targetY and intersects x-axis at (centerX + radius / cos(theta))
      const tangentStartX = targetX;
      const tangentStartY = targetY;
      const tangentEndX = centerX + (radius / cosVal);
      const tangentEndY = centerY;

      ctx.strokeStyle = tanColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(tangentStartX, tangentStartY);
      ctx.lineTo(tangentEndX, tangentEndY);
      ctx.stroke();
    }

    // 8. Handle Marker / Interactive Node
    ctx.fillStyle = textPrimaryColor;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hypColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 9, 0, Math.PI * 2);
    ctx.stroke();

    // 9. Labeling coordinates on circle
    ctx.fillStyle = textPrimaryColor;
    ctx.font = '12px sans-serif';
    ctx.fillText(
      `P(${cosVal.toFixed(2)}, ${sinVal.toFixed(2)})`,
      targetX + (cosVal >= 0 ? 10 : -100),
      targetY + (sinVal >= 0 ? -12 : 18)
    );
  };

  useEffect(() => {
    drawUnitCircle();
  }, [angle]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawUnitCircle();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map click coordinate to Angle
  const updateAngleFromMouse = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx = px - centerX;
    const dy = centerY - py; // Reverse Y axis

    let computedAngle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
    if (computedAngle < 0) {
      computedAngle += 360;
    }
    setAngle(computedAngle);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateAngleFromMouse(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    updateAngleFromMouse(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      audioSynth.playClick('default');
    }
  };

  return (
    <div className="calc-layout">
      {/* Unit Circle Panel */}
      <div className="canvas-panel">
        <h2 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          Drag the circle point or use the slider below to explore trigonometry visually
        </h2>
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Angle Slider Controls */}
        <div className="trig-slider-container">
          <div className="trig-slider-lbl">
            <span>Angle (θ):</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent)' }}>
              {angle}° / {((angle * Math.PI) / 180).toFixed(4)} rad
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            className="custom-slider"
            value={angle}
            onChange={(e) => {
              setAngle(Number(e.target.value));
              if (Number(e.target.value) % 15 === 0) {
                audioSynth.playClick('default');
              }
            }}
          />
        </div>
      </div>

      {/* Numerical readouts */}
      <div className="canvas-info-sidebar">
        <div className="sidebar-card">
          <h3 style={{ color: 'var(--accent)' }}>Trigonometric Ratios</h3>
          
          <div className="sidebar-val-row" style={{ borderLeft: '3px solid #4ade80', paddingLeft: '8px' }}>
            <span className="sidebar-val-lbl">sin(θ) [Opposite]</span>
            <span className="sidebar-val-num" style={{ color: '#4ade80' }}>{formatVal(sinVal)}</span>
          </div>
          
          <div className="sidebar-val-row" style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '8px', marginTop: '12px' }}>
            <span className="sidebar-val-lbl">cos(θ) [Adjacent]</span>
            <span className="sidebar-val-num" style={{ color: '#38bdf8' }}>{formatVal(cosVal)}</span>
          </div>

          <div className="sidebar-val-row" style={{ borderLeft: '3px solid #f43f5e', paddingLeft: '8px', marginTop: '12px' }}>
            <span className="sidebar-val-lbl">tan(θ) [Tangent]</span>
            <span className="sidebar-val-num" style={{ color: '#f43f5e' }}>{formatVal(tanVal)}</span>
          </div>
        </div>

        <div className="sidebar-card">
          <h3 style={{ color: 'var(--text-secondary)' }}>Reciprocal Identities</h3>
          
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">csc(θ) = 1/sin</span>
            <span className="sidebar-val-num">{formatVal(Math.abs(sinVal) > 0.0001 ? 1 / sinVal : Infinity)}</span>
          </div>

          <div className="sidebar-val-row" style={{ marginTop: '8px' }}>
            <span className="sidebar-val-lbl">sec(θ) = 1/cos</span>
            <span className="sidebar-val-num">{formatVal(Math.abs(cosVal) > 0.0001 ? 1 / cosVal : Infinity)}</span>
          </div>

          <div className="sidebar-val-row" style={{ marginTop: '8px' }}>
            <span className="sidebar-val-lbl">cot(θ) = 1/tan</span>
            <span className="sidebar-val-num">{formatVal(Math.abs(tanVal) > 0.0001 ? 1 / tanVal : Infinity)}</span>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Visual Legend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#a855f7' }}></div>
              <span className="sidebar-val-lbl">Hypotenuse (r = 1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#4ade80' }}></div>
              <span className="sidebar-val-lbl">Sine (Vertical Height)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#38bdf8' }}></div>
              <span className="sidebar-val-lbl">Cosine (Horizontal Base)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f43f5e' }}></div>
              <span className="sidebar-val-lbl">Tangent Line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrigVisualizer;
