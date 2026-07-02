import { useState, useEffect } from 'react';
import './App.css';

// Function to generate a random target number
const generateTarget = () => Math.floor(Math.random() * 20) - 10; // Target between -10 and 10

// A simple component to render confetti when the user wins
const Confetti = () => {
  const confettiPieces = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 1}s`,
      backgroundColor: `hsl(${Math.random() * 360}, 90%, 60%)`,
    },
  }));

  return (
    <div className="confetti-container">{confettiPieces.map(c => <div key={c.id} className="confetti-piece" style={c.style} />)}</div>
  );
};

function App() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(generateTarget());
  const [win, setWin] = useState(false);

  const handleCountChange = (newCount) => {
    if (win) return;
    setCount(newCount);
    if (newCount === target) {
      setWin(true);
    }
  };

  const newGame = () => {
    setWin(false);
    setCount(0);
    let newTarget = generateTarget();
    // Ensure the new target isn't the starting count
    while (newTarget === 0) {
      newTarget = generateTarget();
    }
    setTarget(newTarget);
  };

  // Ensure target is not 0 initially to make it a bit of a game
  useEffect(() => {
    if (target === 0) {
      newGame();
    }
  }, []);

  return (
    <div className="game-container">
      {win && <Confetti />}
      <div className="game-header">
        <h1>Number Target Game</h1>
        <p>Match the count to the target number!</p>
      </div>
      <div className="game-board">
        <div className="target-display">Target: <span>{target}</span></div>
        <div key={count} className={`count-display ${win ? 'win-color' : ''}`}>{count}</div>
        {win && <div className="win-message">You Win!</div>}
        <div className="controls">
          <button onClick={() => handleCountChange(count - 1)} disabled={win}>-</button>
          <button onClick={() => handleCountChange(count + 1)} disabled={win}>+</button>
        </div>
        <button className="new-game-btn" onClick={newGame}>New Game</button>
      </div>
    </div>
  );
}

export default App;
