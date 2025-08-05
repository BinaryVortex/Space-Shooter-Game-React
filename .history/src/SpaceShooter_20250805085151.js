import React, { useRef, useEffect } from "react";
import "./SpaceShooter.sass";

const PLAYER_IMG = "https://image.ibb.co/dfbD1U/heroShip.png";
const ENEMY_IMG = "https://i.ibb.co/0YgHvmx/enemy-fotor-20230927153748.png";
const HEALTHKIT_IMG = "https://image.ibb.co/gFvSEU/first_aid_kit.png";

const SpaceShooter = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationId;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight - 33 };
    let score = 0;
    let health = 100;

    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");

    // Resize canvas to window
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Game constants and assets
    const player_width = 32;
    const player_height = 32;
    const playerImg = new window.Image();
    playerImg.src = PLAYER_IMG;

    const bullet_width = 6;
    const bullet_height = 8;
    const bullet_speed = 10;

    const enemy_width = 32;
    const enemy_height = 32;
    const enemyImg = new window.Image();
    enemyImg.src = ENEMY_IMG;

    const healthkit_width = 32;
    const healthkit_height = 32;
    const healthkitImg = new window.Image();
    healthkitImg.src = HEALTHKIT_IMG;

    // Game objects
    let _bullets = [];
    let _enemies = [];
    let _healthkits = [];

    function Player() {
      this.draw = () => {
        c.beginPath();
        c.drawImage(playerImg, mouse.x - player_width, mouse.y - player_height);
      };
      this.update = () => this.draw();
    }
    let __player = new Player();

    function Bullet(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.draw = () => {
        c.beginPath();
        c.rect(this.x, this.y, this.width, this.height);
        c.fillStyle = "white";
        c.fill();
      };
      this.update = () => {
        this.y -= this.speed;
        this.draw();
      };
    }

    function Enemy(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.draw = () => {
        c.beginPath();
        c.drawImage(enemyImg, this.x, this.y);
      };
      this.update = () => {
        this.y += this.speed;
        this.draw();
      };
    }

    function Healthkit(x, y, width, height, speed) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.draw = () => {
        c.beginPath();
        c.drawImage(healthkitImg, this.x, this.y);
      };
      this.update = () => {
        this.y += this.speed;
        this.draw();
      };
    }

    // Mouse and Touch
    const mousemove = (event) => {
      mouse.x = event.clientX;
    };
    const touchmove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const root = document.documentElement;
      const touch = event.changedTouches[0];
      const touchX = parseInt(touch.clientX);
      const touchY = parseInt(touch.clientY) - rect.top - root.scrollTop;
      event.preventDefault();
      mouse.x = touchX;
      mouse.y = touchY;
    };
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("touchmove", touchmove);

    // Spawners
    const drawEnemies = () => {
      for (let _ = 0; _ < 4; _++) {
        const x = Math.random() * (window.innerWidth - enemy_width);
        const y = -enemy_height;
        const speed = Math.random() * 2;
        _enemies.push(
          new Enemy(x, y, enemy_width, enemy_height, speed)
        );
      }
    };
    const enemiesInterval = setInterval(drawEnemies, 1234);

    const drawHealthkits = () => {
      for (let _ = 0; _ < 1; _++) {
        const x = Math.random() * (window.innerWidth - enemy_width);
        const y = -enemy_height;
        const speed = Math.random() * 2.6;
        _healthkits.push(
          new Healthkit(x, y, healthkit_width, healthkit_height, speed)
        );
      }
    };
    const healthkitsInterval = setInterval(drawHealthkits, 15000);

    const fire = () => {
      for (let _ = 0; _ < 1; _++) {
        const x = mouse.x - bullet_width / 2;
        const y = mouse.y - player_height;
        _bullets.push(
          new Bullet(x, y, bullet_width, bullet_height, bullet_speed)
        );
      }
    };
    const fireInterval = setInterval(fire, 200);

    // Collision
    function collision(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }

    // Game loop
    function animate() {
      animationId = window.requestAnimationFrame(animate);
      c.beginPath();
      c.clearRect(0, 0, window.innerWidth, window.innerHeight);
      c.fillStyle = "white";
      c.font = "1em Arial";
      c.fillText("Health: " + health, 5, 20);
      c.fillText("Score: " + score, window.innerWidth - 100, 20);

      __player.update();

      // Bullets
      for (let i = _bullets.length - 1; i >= 0; i--) {
        _bullets[i].update();
        if (_bullets[i].y < 0) {
          _bullets.splice(i, 1);
        }
      }
      // Enemies
      for (let k = _enemies.length - 1; k >= 0; k--) {
        _enemies[k].update();
        if (_enemies[k].y > window.innerHeight) {
          _enemies.splice(k, 1);
          health -= 10;
          if (health <= 0) {
            window.alert("You DIED!\nYour score was " + score);
            restartGame();
            return;
          }
        }
      }
      // Bullet-Enemy collision
      for (let j = _enemies.length - 1; j >= 0; j--) {
        for (let l = _bullets.length - 1; l >= 0; l--) {
          if (collision(_enemies[j], _bullets[l])) {
            _enemies.splice(j, 1);
            _bullets.splice(l, 1);
            score++;
            break;
          }
        }
      }
      // Healthkits
      for (let h = 0; h < _healthkits.length; h++) {
        _healthkits[h].update();
      }
      // Bullet-Healthkit collision
      for (let hh = _healthkits.length - 1; hh >= 0; hh--) {
        for (let hhh = _bullets.length - 1; hhh >= 0; hhh--) {
          if (collision(_healthkits[hh], _bullets[hhh])) {
            _healthkits.splice(hh, 1);
            _bullets.splice(hhh, 1);
            health += 10;
            break;
          }
        }
      }
    }

    // Restart game
    function restartGame() {
      score = 0;
      health = 100;
      mouse = { x: window.innerWidth / 2, y: window.innerHeight - 33 };
      _bullets = [];
      _enemies = [];
      _healthkits = [];
    }

    animate();

    // Cleanup on unmount
    return () => {
      window.cancelAnimationFrame(animationId);
      clearInterval(enemiesInterval);
      clearInterval(healthkitsInterval);
      clearInterval(fireInterval);
      canvas.removeEventListener("mousemove", mousemove);
      canvas.removeEventListener("touchmove", touchmove);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className="space-shooter"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/background.jpg'})` }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default SpaceShooter;