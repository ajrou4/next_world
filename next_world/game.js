export class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.startPromptElement = document.getElementById('startPrompt');
        this.gameStatsElement = document.getElementById('gameStats');

        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 10,
            speedX: 4,
            speedY: 4,
            color: '#ffff00'
        };

        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.paddle1 = {
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            score: 0,
            color: '#ff0000'
        };
        this.paddle2 = {
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            score: 0,
            color: '#0000ff'
        };

        this.keys = {
            w: false,
            s: false,
            ArrowUp: false,
            ArrowDown: false
        };

        this.gameEnded = false;
        this.gameStarted = false;
        this.winner = null;
        this.loser = null;

        this.initializeEventListeners();
        this.gameLoop();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && !this.gameStarted && !this.gameEnded) {
                this.gameStarted = true;
                this.startPromptElement.style.display = 'none';
            }
            if (e.key in this.keys) {
                this.keys[e.key] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
            }
        });
    }

    getGameResult() {
        return {
            winner: this.winner,
            loser: this.loser,
            winnerScore: Math.max(this.paddle1.score, this.paddle2.score),
            loserScore: Math.min(this.paddle1.score, this.paddle2.score)
        };
    }

    updatePaddles() {
        if (this.gameEnded || !this.gameStarted) return;
        
        if (this.keys.w && this.paddle1.y > 0) {
            this.paddle1.y -= 8;
        }
        if (this.keys.s && this.paddle1.y < this.canvas.height - this.paddleHeight) {
            this.paddle1.y += 8;
        }
        if (this.keys.ArrowUp && this.paddle2.y > 0) {
            this.paddle2.y -= 8;
        }
        if (this.keys.ArrowDown && this.paddle2.y < this.canvas.height - this.paddleHeight) {
            this.paddle2.y += 8;
        }
    }

    checkGameEnd() {
        if (this.paddle1.score >= 10 || this.paddle2.score >= 10) {
            const scoreDiff = Math.abs(this.paddle1.score - this.paddle2.score);
            if (scoreDiff >= 2) {
                this.gameEnded = true;
                this.winner = this.paddle1.score > this.paddle2.score ? "Player 1" : "Player 2";
                this.loser = this.paddle1.score > this.paddle2.score ? "Player 2" : "Player 1";
                const winnerScore = this.paddle1.score > this.paddle2.score ? this.paddle1.score : this.paddle2.score;
                const loserScore = this.paddle1.score > this.paddle2.score ? this.paddle2.score : this.paddle1.score;
                
                this.gameOverElement.style.display = "block";
                this.gameOverElement.textContent = `${this.winner} Wins!`;
                
                this.gameStatsElement.style.display = "block";
                this.gameStatsElement.innerHTML = `Winner: ${this.winner} (${winnerScore} points)<br>
                                            Loser: ${this.loser} (${loserScore} points)`;
            }
        }
    }

    updateBall() {
        if (this.gameEnded || !this.gameStarted) return;
        
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;

        if (this.ball.y + this.ball.radius > this.canvas.height || this.ball.y - this.ball.radius < 0) {
            this.ball.speedY = -this.ball.speedY;
        }

        if (this.ball.x - this.ball.radius < this.paddleWidth && 
            this.ball.y > this.paddle1.y && 
            this.ball.y < this.paddle1.y + this.paddleHeight) {
            this.ball.speedX = -this.ball.speedX;
        }

        if (this.ball.x + this.ball.radius > this.canvas.width - this.paddleWidth && 
            this.ball.y > this.paddle2.y && 
            this.ball.y < this.paddle2.y + this.paddleHeight) {
            this.ball.speedX = -this.ball.speedX;
        }

        if (this.ball.x < 0) {
            this.paddle2.score++;
            this.resetBall();
            this.checkGameEnd();
        } else if (this.ball.x > this.canvas.width) {
            this.paddle1.score++;
            this.resetBall();
            this.checkGameEnd();
        }

        this.scoreElement.textContent = `Player 1: ${this.paddle1.score} | Player 2: ${this.paddle2.score}`;
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = this.ball.speedX > 0 ? 4 : -4;
        this.ball.speedY = (Math.random() * 6 - 3);
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = this.paddle1.color;
        this.ctx.fillRect(0, this.paddle1.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillStyle = this.paddle2.color;
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.paddle2.y, this.paddleWidth, this.paddleHeight);

        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    gameLoop() {
        this.updatePaddles();
        this.updateBall();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.pongGame = new PongGame();