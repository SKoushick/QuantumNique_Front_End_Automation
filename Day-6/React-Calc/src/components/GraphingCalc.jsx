import React, { useState, useEffect, useRef } from 'react';
import { audioSynth } from '../utils/audio';

const GraphingCalc = ({ onButtonPress }) => {
  const [eq1, setEq1] = useState('sin(x)');
  const [eq2, setEq2] = useState('x^2 - 2');
  
  // Graph view states
  const [scale, setScale] = useState(40); // Pixels per unit
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Center offset relative to canvas center
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, mathX: 0, mathY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const canvasRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  const presets = [
    { name: 'Sine Wave', eq1: 'sin(x)', eq2: '' },
    { name: 'Damped Sine', eq1: 'sin(x) / x', eq2: '' },
    { name: 'Parabola', eq1: 'x^2', eq2: '-x^2 + 4' },
    { name: 'Trig Wave Combo', eq1: 'sin(x)', eq2: 'cos(x * 2) * 1.5' },
    { name: 'Cubic Curve', eq1: 'x^3 - 3*x', eq2: '' }
  ];

  // Helper to evaluate f(x) safely
  const evaluateFx = (expr, x) => {
    if (!expr.trim()) return NaN;
    try {
      let formatted = expr
        .toLowerCase()
        .replace(/\bx\b/g, `(${x})`)
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/pi/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\^/g, '**');

      // Basic syntax validation
      const safeChars = /^[0-9+\-*/().\s|Math.PMath.EMath.sinMath.cosMath.tanMath.log10Math.logMath.sqrt**]+$/;
      const strippedExpr = formatted
        .replace(/Math\.(PI|E|sin|cos|tan|log10|log|sqrt)/g, '')
        .replace(/\*\*/g, '*');

      if (!safeChars.test(strippedExpr)) return NaN;

      const result = new Function(`return (${formatted})`)();
      return typeof result === 'number' && !isNaN(result) && isFinite(result) ? result : NaN;
    } catch (e) {
      return NaN;
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get current theme-based grid colors
    const style = getComputedStyle(document.body);
    const gridLineColor = style.getPropertyValue('--grid-line') || 'rgba(255, 255, 255, 0.05)';
    const gridAxisColor = style.getPropertyValue('--grid-axis') || 'rgba(255, 255, 255, 0.2)';
    const textPrimaryColor = style.getPropertyValue('--text-primary') || '#ffffff';
    const textSecondaryColor = style.getPropertyValue('--text-secondary') || '#888888';
    
    // Line colors (use vibrant palette: cyan/emerald for eq1, magenta/orange for eq2)
    const eq1Color = '#00f0ff'; // Cyan
    const eq2Color = '#ff007f'; // Magenta

    const centerX = width / 2 + offset.x;
    const centerY = height / 2 + offset.y;

    // 1. Draw Grid Lines
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    ctx.font = '10px monospace';
    ctx.fillStyle = textSecondaryColor;

    // Draw vertical grid lines
    const startGridX = Math.floor((-width / 2 - offset.x) / scale);
    const endGridX = Math.ceil((width / 2 - offset.x) / scale);
    
    for (let x = startGridX; x <= endGridX; x++) {
      const px = centerX + x * scale;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      // Labels on axis (if inside screen)
      if (x !== 0) {
        ctx.fillText(x.toString(), px - 5, centerY + 15);
      }
    }

    // Draw horizontal grid lines
    const startGridY = Math.floor((-height / 2 - offset.y) / scale);
    const endGridY = Math.ceil((height / 2 - offset.y) / scale);

    for (let y = startGridY; y <= endGridY; y++) {
      const py = centerY - y * scale;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      // Labels on axis
      if (y !== 0) {
        ctx.fillText(y.toString(), centerX + 8, py + 4);
      }
    }

    // 2. Draw Axes
    ctx.strokeStyle = gridAxisColor;
    ctx.lineWidth = 2;
    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Origin label
    ctx.fillText('0', centerX - 12, centerY + 12);

    // 3. Plot Function 1 (eq1)
    plotEquation(ctx, eq1, eq1Color, centerX, centerY, width);

    // 4. Plot Function 2 (eq2)
    plotEquation(ctx, eq2, eq2Color, centerX, centerY, width);

    // 5. Draw Crosshair Hover Info
    if (isHovered) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(width, mousePos.y);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash

      // Coordinate marker circle
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  };

  const plotEquation = (ctx, eq, color, centerX, centerY, canvasWidth) => {
    if (!eq.trim()) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let started = false;

    // Iterate through screen columns
    for (let px = 0; px < canvasWidth; px++) {
      // Map screen px to math x
      const x = (px - centerX) / scale;
      const y = evaluateFx(eq, x);

      if (isNaN(y)) {
        started = false;
        continue;
      }

      // Map math y to screen py
      const py = centerY - y * scale;

      // Keep it somewhat within drawing limits
      if (py >= -100 && py <= ctx.canvas.height + 100) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
  };

  // Re-draw whenever scale, offset, or inputs change
  useEffect(() => {
    drawGraph();
  }, [scale, offset, eq1, eq2, mousePos, isHovered]);

  // Adjust canvas size to parent width/height
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawGraph();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Drag to Pan handlers
  const handleMouseDown = (e) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - offset.x,
      startY: e.clientY - offset.y
    };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const centerX = canvas.width / 2 + offset.x;
    const centerY = canvas.height / 2 + offset.y;

    const mathX = Number(((px - centerX) / scale).toFixed(3));
    const mathY = Number(((centerY - py) / scale).toFixed(3));

    if (dragRef.current.isDragging) {
      setOffset({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY
      });
    }

    setMousePos({ x: px, y: py, mathX, mathY });
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  // Wheel to Zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    audioSynth.playClick('default');
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale((prevScale) => {
      const nextScale = Math.min(Math.max(prevScale * zoomFactor, 10), 300);
      return Number(nextScale.toFixed(2));
    });
  };

  const loadPreset = (preset) => {
    audioSynth.playClick('special');
    setEq1(preset.eq1);
    setEq2(preset.eq2);
    // Reset view
    setOffset({ x: 0, y: 0 });
    setScale(40);
  };

  const zoom = (direction) => {
    audioSynth.playClick('default');
    setScale((prevScale) => {
      const factor = direction === 'in' ? 1.3 : 0.7;
      const nextScale = Math.min(Math.max(prevScale * factor, 10), 300);
      return Number(nextScale.toFixed(2));
    });
  };

  const resetView = () => {
    audioSynth.playClick('special');
    setOffset({ x: 0, y: 0 });
    setScale(40);
  };

  return (
    <div className="calc-layout">
      {/* Canvas Panel */}
      <div className="canvas-panel">
        <div className="panel-control-row">
          <div className="input-glow-wrapper">
            <span style={{ color: '#00f0ff', fontSize: '12px', fontWeight: '600', position: 'absolute', top: '-18px', left: '4px' }}>f₁(x) =</span>
            <input
              type="text"
              className="text-input"
              style={{ borderLeft: '4px solid #00f0ff' }}
              value={eq1}
              onChange={(e) => setEq1(e.target.value)}
              placeholder="e.g. sin(x)"
            />
          </div>
          <div className="input-glow-wrapper">
            <span style={{ color: '#ff007f', fontSize: '12px', fontWeight: '600', position: 'absolute', top: '-18px', left: '4px' }}>f₂(x) =</span>
            <input
              type="text"
              className="text-input"
              style={{ borderLeft: '4px solid #ff007f' }}
              value={eq2}
              onChange={(e) => setEq2(e.target.value)}
              placeholder="e.g. x^2 - 2"
            />
          </div>
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              handleMouseUp();
              setIsHovered(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onWheel={handleWheel}
            style={{ cursor: dragRef.current.isDragging ? 'grabbing' : 'grab' }}
          />
        </div>
      </div>

      {/* Info Sidebar */}
      <div className="canvas-info-sidebar">
        <div className="sidebar-card">
          <h3>Coordinate Tracker</h3>
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">X-val:</span>
            <span className="sidebar-val-num">{isHovered ? mousePos.mathX : '—'}</span>
          </div>
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">Y-val:</span>
            <span className="sidebar-val-num">{isHovered ? mousePos.mathY : '—'}</span>
          </div>
        </div>

        <div className="sidebar-card">
          <h3>Viewport Details</h3>
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">Zoom Scale:</span>
            <span className="sidebar-val-num">{scale} px/u</span>
          </div>
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">Offset X:</span>
            <span className="sidebar-val-num">{offset.x} px</span>
          </div>
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">Offset Y:</span>
            <span className="sidebar-val-num">{offset.y} px</span>
          </div>
        </div>

        {/* View adjustments */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="calc-btn btn-fn" style={{ flex: 1, height: '40px' }} onClick={() => zoom('in')}>Zoom +</button>
          <button className="calc-btn btn-fn" style={{ flex: 1, height: '40px' }} onClick={() => zoom('out')}>Zoom -</button>
          <button className="calc-btn btn-op" style={{ flex: 1.2, height: '40px' }} onClick={resetView}>Reset View</button>
        </div>

        {/* Presets Card */}
        <div className="sidebar-card" style={{ flex: 1, overflowY: 'auto' }}>
          <h3>Sample Functions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {presets.map((preset, index) => (
              <button
                key={index}
                className="calc-btn btn-num"
                style={{ fontSize: '13px', padding: '10px', justifyContent: 'flex-start', borderRadius: '10px' }}
                onClick={() => loadPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphingCalc;
