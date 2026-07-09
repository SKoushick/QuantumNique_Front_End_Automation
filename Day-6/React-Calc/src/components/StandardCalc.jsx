import React, { useState, useEffect } from 'react';
import { audioSynth } from '../utils/audio';

const StandardCalc = ({ onButtonPress, onResult }) => {
  const [expression, setExpression] = useState('');
  const [displayVal, setDisplayVal] = useState('0');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('vibecalc_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFinished, setIsFinished] = useState(false);

  // Sync history with localStorage
  useEffect(() => {
    localStorage.setItem('vibecalc_history', JSON.stringify(history));
  }, [history]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      // If user is typing a note in the history input, ignore keydowns on calculator
      if (activeElement && activeElement.tagName === 'INPUT') return;

      let key = e.key;

      if (key >= '0' && key <= '9') {
        handleInput(key);
      } else if (key === '.' || key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
        handleInput(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        evaluateExpression();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearExpression();
      } else if (key === '^') {
        handleInput('^');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, isFinished]);

  // Safe Math parser
  const parseAndEvaluate = (expr) => {
    try {
      // 1. Clean expression
      let formattedExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(');

      // 2. Handle exponents (e.g. 2^3 -> 2**3)
      formattedExpr = formattedExpr.replace(/\^/g, '**');

      // 3. Simple brackets check
      const openBrackets = (formattedExpr.match(/\(/g) || []).length;
      const closeBrackets = (formattedExpr.match(/\)/g) || []).length;
      if (openBrackets > closeBrackets) {
        formattedExpr += ')'.repeat(openBrackets - closeBrackets);
      }

      // 4. Safe eval via Function
      // Validate characters to ensure no malicious code can run
      const safeChars = /^[0-9+\-*/().\s|Math.PMath.EMath.sinMath.cosMath.tanMath.log10Math.logMath.sqrt**]+$/;
      const strippedExpr = formattedExpr
        .replace(/Math\.(PI|E|sin|cos|tan|log10|log|sqrt)/g, '')
        .replace(/\*\*/g, '*');
      
      if (!safeChars.test(strippedExpr)) {
        throw new Error('Invalid characters');
      }

      const result = new Function(`return (${formattedExpr})`)();

      if (result === undefined || isNaN(result) || !isFinite(result)) {
        return 'Error';
      }

      // Round to 10 decimal places to prevent float issues (0.1+0.2)
      return Number(result.toFixed(10)).toString();
    } catch (err) {
      return 'Error';
    }
  };

  const handleInput = (char, event) => {
    // Fire particle FX if handler provided
    if (onButtonPress && event) {
      onButtonPress(event);
    }

    // Play synthesized click
    if (['+', '-', '*', '/', '÷', '×', '^'].includes(char)) {
      audioSynth.playClick('operator');
    } else {
      audioSynth.playClick('default');
    }

    if (isFinished) {
      if (['+', '-', '*', '/', '÷', '×', '^'].includes(char)) {
        setExpression(displayVal + ' ' + char + ' ');
      } else {
        setExpression(char);
      }
      setIsFinished(false);
    } else {
      // Formats for operators for readability
      if (['+', '-', '*', '/'].includes(char)) {
        const opMap = { '*': ' × ', '/': ' ÷ ', '+': ' + ', '-': ' - ' };
        setExpression((prev) => prev + opMap[char]);
      } else if (char === '×' || char === '÷' || char === '^') {
        setExpression((prev) => prev + ' ' + char + ' ');
      } else if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('].includes(char)) {
        setExpression((prev) => prev + char);
      } else {
        setExpression((prev) => prev + char);
      }
    }
  };

  const handleBackspace = (event) => {
    if (onButtonPress && event) onButtonPress(event);
    audioSynth.playClick('special');
    
    setExpression((prev) => {
      if (prev.endsWith(' ')) {
        // Remove operator and surrounding spaces
        return prev.slice(0, -3);
      } else if (
        prev.endsWith('sin(') ||
        prev.endsWith('cos(') ||
        prev.endsWith('tan(') ||
        prev.endsWith('log(') ||
        prev.endsWith('sqrt(')
      ) {
        return prev.slice(0, -4);
      } else if (prev.endsWith('ln(')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
    setIsFinished(false);
  };

  const clearExpression = (event) => {
    if (onButtonPress && event) onButtonPress(event);
    audioSynth.playClick('special');
    setExpression('');
    setDisplayVal('0');
    setIsFinished(false);
  };

  const evaluateExpression = (event) => {
    if (onButtonPress && event) onButtonPress(event);
    if (!expression) return;

    const result = parseAndEvaluate(expression);

    if (result === 'Error') {
      audioSynth.playError();
      setDisplayVal('Error');
    } else {
      audioSynth.playSuccess();
      setDisplayVal(result);
      // Trigger result effect
      if (onResult) onResult();
      // Append to history
      const newEntry = {
        id: Date.now(),
        formula: expression,
        result: result,
        note: ''
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 50)); // limit 50 entries
    }
    setIsFinished(true);
  };

  const useHistoryItem = (item, type) => {
    audioSynth.playClick('special');
    if (type === 'formula') {
      setExpression(item.formula);
    } else {
      setExpression((prev) => prev + item.result);
    }
    setIsFinished(false);
  };

  const updateHistoryNote = (id, noteText) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note: noteText } : item))
    );
  };

  const clearHistory = () => {
    audioSynth.playClick('special');
    setHistory([]);
  };

  return (
    <div className="calc-layout">
      {/* Main Calculator */}
      <div className="calc-main">
        {/* Screen */}
        <div className="calc-screen">
          <div className="crt-overlay"></div>
          <div className="screen-formula">{expression || ' '}</div>
          <div className="screen-value">{displayVal}</div>
        </div>

        {/* Keyboard Layout */}
        <div className="calc-keyboard">
          {/* Standard keyboard layout */}
          <div className="keys-standard">
            <button className="calc-btn btn-fn" onClick={(e) => clearExpression(e)}>C</button>
            <button className="calc-btn btn-op" onClick={(e) => handleInput('÷', e)}>÷</button>
            <button className="calc-btn btn-op" onClick={(e) => handleInput('×', e)}>×</button>
            <button className="calc-btn btn-op" onClick={(e) => handleInput('-', e)}>-</button>

            <button className="calc-btn btn-num" onClick={(e) => handleInput('7', e)}>7</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('8', e)}>8</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('9', e)}>9</button>
            <button className="calc-btn btn-op" style={{gridRow: 'span 2'}} onClick={(e) => handleInput('+', e)}>+</button>

            <button className="calc-btn btn-num" onClick={(e) => handleInput('4', e)}>4</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('5', e)}>5</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('6', e)}>6</button>

            <button className="calc-btn btn-num" onClick={(e) => handleInput('1', e)}>1</button>

            <button className="calc-btn btn-num" onClick={(e) => handleInput('2', e)}>2</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('3', e)}>3</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('0', e)}>0</button>
            <button className="calc-btn btn-num" onClick={(e) => handleInput('.', e)}>.</button>

            {/* Equals button spans 4 columns for prominence */}
            <button
              className="calc-btn btn-eq pulse-glow-btn"
              style={{ gridColumn: 'span 2' }}
              onClick={(e) => evaluateExpression(e)}
            >
              =
            </button>
          </div>
        </div>
      </div>

      {/* History Tape */}
      <div className="calc-history">
        <div className="history-header">
          <h2>History Tape</h2>
          {history.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Clear
            </button>
          )}
        </div>
        <div className="history-items">
          {history.length === 0 ? (
            <div className="history-empty">No calculations yet</div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="history-item">
                <div onClick={() => useHistoryItem(item, 'formula')} className="history-formula" title="Click to reuse formula">
                  {item.formula} =
                </div>
                <div onClick={() => useHistoryItem(item, 'result')} className="history-result" title="Click to insert result">
                  {item.result}
                </div>
                <input
                  type="text"
                  className="history-note-input"
                  placeholder="Add note..."
                  value={item.note}
                  onChange={(e) => updateHistoryNote(item.id, e.target.value)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StandardCalc;
