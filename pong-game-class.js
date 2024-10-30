class PongGame {
  constructor(onGameEnd) {
    this.ball = { x: 392, y: 242, dx: 5, dy: 3 };
    this.leftPaddle = { y: 200, speed: 0 };
    this.rightPaddle = { y: 200, speed: 0 };
    this.scores = { left: 0, right: 0 };
    this.gameLoop = null;
    this.onGameEnd = onGameEnd;
    this.winningScore = 5;
    this.ballSpeed = 5;
    this.maxBallSpeed = 15;
    this.createSoundEffects();
    
    this.initControls();
  }

  createSoundEffects() {
    this.sounds = {
      hit: new Audio('data:audio/wav;base64,UklGRl9vT19...'),
      score: new Audio('data:audio/wav;base64,UklGRl9vT19...')
    };
  }

  initControls() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'w': this.leftPaddle.speed = -5; break;
        case 's': this.leftPaddle.speed = 5; break;
        case 'ArrowUp': this.rightPaddle.speed = -5; break;
        case 'ArrowDown': this.rightPaddle.speed = 5; break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'w':
        case 's': this.leftPaddle.speed = 0; break;
        case 'ArrowUp':
        case 'ArrowDown': this.rightPaddle.speed = 0; break;
      }
    });
  }

  start() {
    if (this.gameLoop) return;
    this.gameLoop = setInterval(() => this.update(), 1000/60);
  }

  stop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  reset() {
    this.ball = { x: 392, y: 242, dx: 5, dy: 3 };
    this.leftPaddle = { y: 200, speed: 0 };
    this.rightPaddle = { y: 200, speed: 0 };
    this.scores = { left: 0, right: 0 };
    this.updateDisplay();
  }

  update() {
    // Update paddle positions
    this.leftPaddle.y = Math.max(0, Math.min(400, this.leftPaddle.y + this.leftPaddle.speed));
    this.rightPaddle.y = Math.max(0, Math.min(400, this.rightPaddle.y + this.rightPaddle.speed));

    // Update ball position
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Ball collision with top and bottom
    if (this.ball.y <= 0 || this.ball.y >= 485) {
      this.ball.dy *= -1;
    }

    // Ball collision with paddles
    if (this.ball.x <= 30 && this.ball.y >= this.leftPaddle.y && this.ball.y <= this.leftPaddle.y + 100) {
      document.getElementById('leftPaddle').classList.add('paddle-hit');
      setTimeout(() => document.getElementById('leftPaddle').classList.remove('paddle-hit'), 200);
      this.sounds.hit.play();
      this.ball.dx *= -1.1;
      this.ball.x = 31;
    }
    if (this.ball.x >= 760 && this.ball.y >= this.rightPaddle.y && this.ball.y <= this.rightPaddle.y + 100) {
      document.getElementById('rightPaddle').classList.add('paddle-hit');
      setTimeout(() => document.getElementById('rightPaddle').classList.remove('paddle-hit'), 200);
      this.sounds.hit.play();
      this.ball.dx *= -1.1;
      this.ball.x = 759;
    }

    // Scoring
    if (this.ball.x <= 0) {
      this.scores.right++;
      this.sounds.score.play();
      this.resetBall();
    }
    if (this.ball.x >= 800) {
      this.scores.left++;
      this.sounds.score.play();
      this.resetBall();
    }

    this.updateDisplay();

    // Check for game end
    if (this.scores.left >= this.winningScore || this.scores.right >= this.winningScore) {
      this.stop();
      const winner = this.scores.left >= this.winningScore ? 'left' : 'right';
      this.onGameEnd(winner);
    }

    // Gradually increase ball speed
    if (Math.abs(this.ball.dx) < this.maxBallSpeed) {
      this.ball.dx *= 1.001;
    }
  }

  resetBall() {
    this.ball = { 
      x: 392, 
      y: 242, 
      dx: 5 * (Math.random() > 0.5 ? 1 : -1), 
      dy: 3 * (Math.random() > 0.5 ? 1 : -1) 
    };
  }

  updateDisplay() {
    document.querySelector('.ball').style.left = `${this.ball.x}px`;
    document.querySelector('.ball').style.top = `${this.ball.y}px`;
    document.getElementById('leftPaddle').style.top = `${this.leftPaddle.y}px`;
    document.getElementById('rightPaddle').style.top = `${this.rightPaddle.y}px`;
    document.getElementById('leftScore').textContent = this.scores.left;
    document.getElementById('rightScore').textContent = this.scores.right;
  }
}
