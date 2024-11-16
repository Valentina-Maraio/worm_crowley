import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// Constants will now be calculated based on screen size
const GAME_DURATION = 120000; // 2 minutes in milliseconds
const INITIAL_SPEED = 15;
const collisionSound = new Audio('/collision.mp3');
const gameOverSound = new Audio('/gameover.mp3');

function App() {
  const gameContainerRef = useRef(null);
  const [gameSize, setGameSize] = useState({ width: 0, height: 0 });
  const [wormY, setWormY] = useState(0);
  const [coins, setCoins] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState(false);

  // Calculate sizes based on game container size
  const WORM_SIZE = gameSize.width * 0.13;
  const COIN_SIZE = gameSize.width * 0.11;
  const OBSTACLE_SIZE = gameSize.width * 0.09;
  const MIN_GAP = WORM_SIZE + 20;

  const updateGameSize = useCallback(() => {
    if (gameContainerRef.current) {
      const { width, height } = gameContainerRef.current.getBoundingClientRect();
      setGameSize({ width, height });
      setWormY(height / 2 - WORM_SIZE / 2);
    }
  }, []);

  useEffect(() => {
    updateGameSize();
    window.addEventListener('resize', updateGameSize);
    return () => window.removeEventListener('resize', updateGameSize);
  }, [updateGameSize]);

  const moveWorm = useCallback((direction) => {
    setWormY((prevY) => {
      const newY = prevY + direction * 10;
      return Math.max(0, Math.min(newY, gameSize.height - WORM_SIZE));
    });
  }, [gameSize.height]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    let gameLoopInterval = null;
    let wormMoveInterval = null;

    const moveSpeed = 50;
    const gameInterval = 100;
    const coinMoveSpeed = speed;
    const obstacleMoveSpeed = speed;

    const minY = 0;
    const maxY = gameSize.height - WORM_SIZE;

    const handleKeyDown = (e) => {
      if (wormMoveInterval) return;

      let direction;
      if (e.key === 'ArrowUp') direction = -1;
      else if (e.key === 'ArrowDown') direction = 1;
      else return;

      moveWorm(direction);
      wormMoveInterval = setInterval(() => moveWorm(direction), moveSpeed);
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        clearInterval(wormMoveInterval);
        wormMoveInterval = null;
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const gameContainerRect = gameContainerRef.current.getBoundingClientRect();
      const touchY = touch.clientY - gameContainerRect.top;

      if (touchY < wormY + WORM_SIZE / 2) {
        wormMoveInterval = setInterval(() => moveWorm(-1), moveSpeed);
      } else {
        wormMoveInterval = setInterval(() => moveWorm(1), moveSpeed);
      }
    };

    const handleTouchEnd = () => {
      clearInterval(wormMoveInterval);
      wormMoveInterval = null;
    };

    gameLoopInterval = setInterval(() => {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => ({ ...coin, x: coin.x - coinMoveSpeed }))
      );

      setObstacles((prevObstacles) =>
        prevObstacles.map((obs) => ({ ...obs, x: obs.x - obstacleMoveSpeed }))
      );

      const newCoins = coins.filter((coin) => {
        if (coin.x < 0) return false;

        if (
          Math.abs(coin.x - WORM_SIZE) < WORM_SIZE / 2 + COIN_SIZE / 2 &&
          Math.abs(coin.y - wormY) < WORM_SIZE / 2 + COIN_SIZE / 2
        ) {
          setScore((prevScore) => prevScore + 1);
          collisionSound.play();
          return false;
        }
        return true;
      });

      if (newCoins.length !== coins.length) {
        setCoins(newCoins);
      }

      if (
        obstacles.some(
          (obs) =>
            Math.abs(obs.x - WORM_SIZE) < OBSTACLE_SIZE &&
            Math.abs(obs.y - wormY) < OBSTACLE_SIZE
        )
      ) {
        setGameOver(true);
        gameOverSound.play();
      }

      if (Math.random() < 0.02) {
        setCoins((prevCoins) => [
          ...prevCoins,
          { x: gameSize.width, y: Math.random() * (gameSize.height - COIN_SIZE) },
        ]);
      }

      if (Math.random() < 0.01) {
        setObstacles((prevObstacles) => {
          const newObstacleY = Math.random() * (gameSize.height - OBSTACLE_SIZE);

          const isValid = prevObstacles.every(
            (obs) => Math.abs(obs.y - newObstacleY) >= MIN_GAP
          );

          if (isValid) {
            return [...prevObstacles, { x: gameSize.width, y: newObstacleY }];
          }
          return prevObstacles;
        });
      }

      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          setGameOver(true);
          return 0;
        }
        return prevTime - gameInterval;
      });

      setSpeed((prevSpeed) => prevSpeed + 0.001);
    }, gameInterval);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameContainerRef.current.addEventListener('touchstart', handleTouchStart);
    gameContainerRef.current.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gameContainerRef.current.removeEventListener('touchstart', handleTouchStart);
      gameContainerRef.current.removeEventListener('touchend', handleTouchEnd);
      clearInterval(wormMoveInterval);
      clearInterval(gameLoopInterval);
    };
  }, [coins, obstacles, wormY, speed, gameStarted, gameOver, gameSize, moveWorm]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setCoins([]);
    setObstacles([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setSpeed(INITIAL_SPEED);
    setWormY(gameSize.height / 2 - WORM_SIZE / 2);
  };

  return (
    <div className="App">
      <h1>Worm Crowley</h1>
      {!gameStarted && (
        <button className="start-button" onClick={startGame}>
          Start Game
        </button>
      )}
      <div ref={gameContainerRef} className="game-container">
        {gameStarted && !gameOver ? (
          <>
            <video
              src="/worm.webm"
              className="worm"
              style={{ left: 0, top: wormY, width: WORM_SIZE, height: WORM_SIZE }}
              autoPlay
              loop
              muted
            ></video>
            {coins.map((coin, index) => (
              <img
                key={index}
                src="/aziraphale.png"
                alt="Coin"
                className="coin"
                style={{ left: coin.x, top: coin.y, width: COIN_SIZE, height: COIN_SIZE }}
              />
            ))}
            {obstacles.map((obs, index) => (
              <img
                key={index}
                className="obstacle"
                style={{ left: obs.x, top: obs.y, width: OBSTACLE_SIZE, height: OBSTACLE_SIZE }}
                src="/metatron.png"
                alt="Obstacle"
              />
            ))}
          </>
        ) : gameOver ? (
          <>
            <div className="game-over">Game Over!</div>
            <button className="restart-button" onClick={startGame}>
              Restart Game
            </button>
          </>
        ) : null}
      </div>
      <div className="info">
        <p>Score: {score}</p>
        <p>Time Left: {Math.ceil(timeLeft / 1000)}s</p>
      </div>
      
      {/* Mobile Controls */}
      {gameStarted && !gameOver && (
        <div className="controls">
          <button className="control-button" onClick={() => moveWorm(-1)}>Up</button>
          <button className="control-button" onClick={() => moveWorm(1)}>Down</button>
        </div>
      )}
    </div>
  );
}

export default App;