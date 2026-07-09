import React, { useState, useEffect } from 'react';
import { audioSynth } from '../utils/audio';

const MathGame = ({ onButtonPress, onWishingStar }) => {
  const [target, setTarget] = useState(24);
  const [numbers, setNumbers] = useState([3, 8, 2, 1, 5]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [expression, setExpression] = useState('');
  
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('vibecalc_game_highscore') || 0);
  });
  
  // Feedback states
  const [gameMessage, setGameMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate a solvable puzzle
  const createNewPuzzle = () => {
    const operators = ['+', '-', '*'];
    // Generate 3 to 4 numbers to build a base solvable formula
    const numCount = Math.random() > 0.5 ? 4 : 3;
    let baseNums = [];
    for (let i = 0; i < numCount; i++) {
      baseNums.push(Math.floor(Math.random() * 9) + 2); // numbers 2 to 10
    }

    let currentVal = baseNums[0];
    const puzzleNums = [baseNums[0]];

    for (let i = 1; i < baseNums.length; i++) {
      const op = operators[Math.floor(Math.random() * operators.length)];
      const nextNum = baseNums[i];

      if (op === '+') {
        currentVal += nextNum;
      } else if (op === '-') {
        currentVal -= nextNum;
      } else if (op === '*') {
        currentVal *= nextNum;
      }
      puzzleNums.push(nextNum);
    }

    // Validate target value. Redo if negative, zero, or too high
    if (currentVal <= 0 || currentVal > 120 || isNaN(currentVal)) {
      createNewPuzzle();
      return;
    }

    // Add extra random numbers to round out the set to 5 numbers
    while (puzzleNums.length < 5) {
      const extraNum = Math.floor(Math.random() * 9) + 2;
      puzzleNums.push(extraNum);
    }

    // Shuffle the numbers
    const shuffledNums = [...puzzleNums].sort(() => Math.random() - 0.5);

    setTarget(currentVal);
    setNumbers(shuffledNums);
    setUsedIndices([]);
    setExpression('');
    setGameMessage('');
    setIsSuccess(false);
  };

  // Run on mount
  useEffect(() => {
    createNewPuzzle();
  }, []);

  const handleNumberClick = (num, index, event) => {
    if (onButtonPress && event) onButtonPress(event);
    if (usedIndices.includes(index)) return;

    audioSynth.playClick('default');
    setUsedIndices((prev) => [...prev, index]);
    setExpression((prev) => prev + num);
  };

  const handleOperatorClick = (op, event) => {
    if (onButtonPress && event) onButtonPress(event);
    audioSynth.playClick('operator');
    setExpression((prev) => {
      // Add spaces around operators for readability
      return prev + ` ${op} `;
    });
  };

  const handleBackspace = (event) => {
    if (onButtonPress && event) onButtonPress(event);
    audioSynth.playClick('special');

    if (expression.length === 0) return;

    setExpression((prev) => {
      let nextExpr = prev.trim();
      const lastChar = nextExpr.charAt(nextExpr.length - 1);

      // Check if the last term is a number that corresponds to one of our target numbers
      if (!isNaN(lastChar)) {
        // Find which index matches this number in reverse order of indices used
        if (usedIndices.length > 0) {
          const lastUsedIdx = usedIndices[usedIndices.length - 1];
          setUsedIndices((prevIndices) => prevIndices.slice(0, -1));
        }
        // Remove the number
        return prev.slice(0, -1);
      } else if (['+', '-', '*', '/'].includes(lastChar)) {
        // Remove operator and surrounding spaces
        return prev.slice(0, -3);
      } else if (lastChar === '(' || lastChar === ')') {
        return prev.slice(0, -1);
      }
      return prev.slice(0, -1);
    });
    setGameMessage('');
  };

  const handleClear = (event) => {
    if (onButtonPress && event) onButtonPress(event);
    audioSynth.playClick('special');
    setExpression('');
    setUsedIndices([]);
    setGameMessage('');
  };

  const checkSolution = (event) => {
    if (onButtonPress && event) onButtonPress(event);
    if (!expression) return;

    try {
      // Safe eval
      // Restrict characters: only allow numbers, +, -, *, /, (, ) and whitespace
      const safeRegex = /^[0-9+\-*/()\s]+$/;
      if (!safeRegex.test(expression)) {
        throw new Error('Invalid elements');
      }

      // Check parentheses balance
      const openCount = (expression.match(/\(/g) || []).length;
      const closeCount = (expression.match(/\)/g) || []).length;
      let balancedExpr = expression;
      if (openCount > closeCount) {
        balancedExpr += ')'.repeat(openCount - closeCount);
      }

      const total = new Function(`return (${balancedExpr})`)();

      if (total === target) {
        // Win!
        audioSynth.playLevelUp();
        setIsSuccess(true);
        // Trigger wishing star effect (only fires in space theme)
        if (onWishingStar) onWishingStar();
        const pointsGained = 100 + (usedIndices.length === 5 ? 50 : 0); // Bonus for using all numbers
        const newScore = score + pointsGained;
        setScore(newScore);
        setStreak((prev) => prev + 1);
        setLevel((prev) => prev + 1);

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('vibecalc_game_highscore', newScore);
        }

        setGameMessage(usedIndices.length === 5 
          ? `Perfect! You used all numbers! +150 pts` 
          : `Correct! You reached ${target}! +100 pts`
        );
      } else {
        // Incorrect value
        audioSynth.playError();
        setStreak(0);
        setGameMessage(`Incorrect. You calculated ${total || 0}, but the target is ${target}.`);
      }
    } catch (e) {
      audioSynth.playError();
      setGameMessage('Syntax error in expression. Check brackets!');
    }
  };

  const skipLevel = () => {
    audioSynth.playClick('special');
    setStreak(0);
    createNewPuzzle();
  };

  return (
    <div className="calc-layout">
      {/* Game Window Card */}
      <div className="game-card">
        {isSuccess && (
          <div className="success-overlay">
            <h2>Level Cleared!</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>{gameMessage}</p>
            <button
              className="calc-btn btn-eq pulse-glow-btn"
              style={{ width: '180px', height: '50px' }}
              onClick={createNewPuzzle}
            >
              Next Level →
            </button>
          </div>
        )}

        {/* HUD Bar */}
        <div className="game-hud">
          <div className="hud-item">
            <span className="hud-lbl">LEVEL</span>
            <span className="hud-val">{level}</span>
          </div>
          <div className="hud-item">
            <span className="hud-lbl">STREAK</span>
            <span className="hud-val">{streak} 🔥</span>
          </div>
          <div className="hud-item">
            <span className="hud-lbl">SCORE</span>
            <span className="hud-val">{score}</span>
          </div>
        </div>

        {/* Target Indicator */}
        <div className="target-container">
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '1px' }}>REACH THE TARGET</span>
          <span className="target-val">{target}</span>
        </div>

        {/* Available Numbers */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Available numbers (click once):</span>
          <div className="game-numbers-row">
            {numbers.map((num, index) => {
              const isUsed = usedIndices.includes(index);
              return (
                <div
                  key={index}
                  className={`game-num-card ${isUsed ? 'used' : ''}`}
                  onClick={(e) => handleNumberClick(num, index, e)}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>

        {/* Display Screen for Formula */}
        <div className="calc-screen" style={{ width: '100%', minHeight: '90px', marginBottom: '0' }}>
          <div className="crt-overlay"></div>
          <div className="screen-formula" style={{ color: 'var(--text-primary)', fontSize: '20px' }}>
            {expression || 'Select numbers & operators'}
          </div>
        </div>

        {/* Operators & Controls Keyboard */}
        <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
          {/* Operator Grid */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <button className="calc-btn btn-op" onClick={(e) => handleOperatorClick('+', e)}>+</button>
            <button className="calc-btn btn-op" onClick={(e) => handleOperatorClick('-', e)}>-</button>
            <button className="calc-btn btn-op" onClick={(e) => handleOperatorClick('*', e)}>×</button>
            <button className="calc-btn btn-op" onClick={(e) => handleOperatorClick('/', e)}>÷</button>
            
            <button className="calc-btn btn-fn" onClick={(e) => handleOperatorClick('(', e)}>(</button>
            <button className="calc-btn btn-fn" onClick={(e) => handleOperatorClick(')', e)}>)</button>
            <button className="calc-btn btn-fn" onClick={(e) => handleBackspace(e)}>⌫</button>
            <button className="calc-btn btn-fn" onClick={(e) => handleClear(e)}>C</button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '120px' }}>
            <button
              className="calc-btn btn-eq pulse-glow-btn"
              style={{ height: '60px' }}
              onClick={(e) => checkSolution(e)}
            >
              Submit
            </button>
            <button
              className="calc-btn btn-num"
              style={{ height: '40px', fontSize: '13px' }}
              onClick={skipLevel}
            >
              Skip
            </button>
          </div>
        </div>

        {gameMessage && !isSuccess && (
          <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginTop: '10px' }}>
            {gameMessage}
          </div>
        )}
      </div>

      {/* Rules Info Sidebar */}
      <div className="canvas-info-sidebar">
        <div className="sidebar-card">
          <h3>High Score</h3>
          <div className="sidebar-val-row">
            <span className="sidebar-val-lbl">All-Time Best:</span>
            <span className="sidebar-val-num" style={{ color: 'var(--accent)' }}>{highScore} pts</span>
          </div>
        </div>

        <div className="sidebar-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3>How to Play</h3>
          <div className="game-instructions" style={{ fontSize: '13px', color: 'var(--text-secondary)', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <p>1. Combine the <strong>available numbers</strong> with mathematical operators <strong>(+, -, ×, ÷)</strong> to reach the target sum.</p>
            <p>2. Each number card can be clicked and used <strong>only once</strong>.</p>
            <p>3. Parentheses are allowed to enforce operation order (e.g. <code>(3 + 5) * 2</code>).</p>
            <p>4. You gain <strong>100 points</strong> for matching the target.</p>
            <p>5. 🌟 <strong>Bonus +50 points</strong> if you successfully utilize <strong>all 5 numbers</strong> in your equation!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathGame;
