import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const WORM_SIZE = 100;
const COIN_SIZE = 70;
const OBSTACLE_SIZE = 70;
const INITIAL_SPEED = 10;
const GAME_DURATION = 120000; // 2 minutes in milliseconds
const MIN_GAP = WORM_SIZE + 20;

function App() {
  const [wormY, setWormY] = useState(GAME_HEIGHT / 2);
  const [coins, setCoins] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState(false);

  const moveWorm = useCallback((direction) => {
    setWormY((prevY) => {
      const newY = prevY + direction * 10;
      return Math.max(0, Math.min(newY, GAME_HEIGHT - WORM_SIZE));
    });
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') moveWorm(-1);
      if (e.key === 'ArrowDown') moveWorm(1);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveWorm, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setCoins((prevCoins) => prevCoins.map(coin => ({ ...coin, x: coin.x - speed })));
      setObstacles((prevObstacles) => prevObstacles.map(obs => ({ ...obs, x: obs.x - speed })));

      const newCoins = coins.filter((coin) => {
        if (coin.x < 0) return false;

        if (
          Math.abs(coin.x - WORM_SIZE) < WORM_SIZE / 2 + COIN_SIZE / 2 &&
          Math.abs(coin.y - wormY) < WORM_SIZE / 2 + COIN_SIZE / 2
        ) {
          setScore((prevScore) => prevScore + 1);
          return false;
        }
        return true;
      });


      if (newCoins.length !== coins.length) {
        setCoins(newCoins);
      }

      if (obstacles.some(obs =>
        Math.abs(obs.x - WORM_SIZE) < OBSTACLE_SIZE && Math.abs(obs.y - wormY) < OBSTACLE_SIZE
      )) {
        setGameOver(true);
      }

      if (Math.random() < 0.02) {
        setCoins((prevCoins) => [...prevCoins, { x: GAME_WIDTH, y: Math.random() * (GAME_HEIGHT - COIN_SIZE) }]);
      }
      if (Math.random() < 0.01) {
        setObstacles((prevObstacles) => {
          const newObstacleY = Math.random() * (GAME_HEIGHT - OBSTACLE_SIZE);

          // Ensure the new obstacle is not too close to an existing one
          const isValid = prevObstacles.every(
            (obs) => Math.abs(obs.y - newObstacleY) >= MIN_GAP
          );

          if (isValid) {
            return [...prevObstacles, { x: GAME_WIDTH, y: newObstacleY }];
          }
          return prevObstacles; // Skip spawning this obstacle
        });
      }

      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          setGameOver(true);
          return 0;
        }
        return prevTime - 100;
      });
      setSpeed((prevSpeed) => prevSpeed + 0.001);
    }, 100);

    return () => clearInterval(gameLoop);
  }, [coins, obstacles, wormY, speed, gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setCoins([]);
    setObstacles([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setSpeed(INITIAL_SPEED);
    setWormY(GAME_HEIGHT / 2);
  };

  return (
    <div className="App">
      <h1>Worm Crowley</h1>
      {!gameStarted && (
        <button className="start-button" onClick={startGame}>
          Start Game
        </button>
      )}
      <div className="game-container" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {gameStarted && !gameOver ? (
          <>
            <video
              src="/worm.webm" // Replace with the path to your worm.webm file
              className="worm"
              style={{ left: 0, top: wormY, width: WORM_SIZE, height: WORM_SIZE }}
              autoPlay
              loop
              muted // Ensures no sound plays if the .webm file includes audio
            ></video>
            {coins.map((coin, index) => (
              <img
                key={index}
                src="/aziraphale.png" // Replace with the path to your coin image
                alt="Coin"
                className="coin"
                style={{ left: coin.x, top: coin.y, width: COIN_SIZE, height: COIN_SIZE }}
              />
            ))}
            {obstacles.map((obs, index) => (
              <div key={index} className="obstacle" style={{ left: obs.x, top: obs.y, width: OBSTACLE_SIZE, height: OBSTACLE_SIZE }}></div>
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
    </div>
  );
}

export default App;
