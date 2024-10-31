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

class Tournament {
    constructor() {
      this.players = [];
      this.currentRound = 'quarter-finals';
      this.matches = {
        'quarter-finals': [],
        'semi-finals': [],
        'finals': []
      };
      this.winners = {
        'quarter-finals': [],
        'semi-finals': [],
        'finals': []
      };
      this.currentMatch = null;
      this.pongGame = null;
      this.ui = null;
      this.matchesPlayed = 0;
      this.totalMatches = 7;
      this.playerStats = new Map();
    }
  
    validatePlayerName(name) {
      const sanitized = name.replace(/<[^>]*>?/gm, '').trim();
      return sanitized.length >= 2 && sanitized.length <= 20;
    }
  
    updatePlayerStats(playerId, won) {
      if (!this.playerStats.has(playerId)) {
        this.playerStats.set(playerId, { matches: 0, wins: 0 });
      }
      const stats = this.playerStats.get(playerId);
      stats.matches++;
      if (won) stats.wins++;
      this.playerStats.set(playerId, stats);
    }
  
    getTournamentStats() {
      return {
        totalMatches: this.matchesPlayed,
        remainingMatches: this.totalMatches - this.matchesPlayed,
        playerStats: Array.from(this.playerStats.entries()).map(([id, stats]) => {
          const player = this.players.find(p => p.id === id);
          return {
            name: player.name,
            matches: stats.matches,
            wins: stats.wins,
            winRate: stats.matches ? ((stats.wins / stats.matches) * 100).toFixed(1) : 0
          };
        })
      };
    }
  
    setUI(ui) {
      this.ui = ui;
    }
  
    initializeTournament(playerNames) {
      const sanitizedPlayers = playerNames
        .filter(name => name.trim() !== '')
        .map(name => ({
          id: Math.random().toString(36).substr(2, 9),
          name: name.replace(/<[^>]*>?/gm, '').trim()
        }))
        .filter(player => this.validatePlayerName(player.name));
  
      if (sanitizedPlayers.length < 4 || sanitizedPlayers.length > 8) {
        alert('Tournament requires between 4 and 8 players');
        return false;
      }
  
      this.players = sanitizedPlayers;
      
      // Initialize player stats
      this.players.forEach(player => {
        this.playerStats.set(player.id, { matches: 0, wins: 0 });
      });
      
      // Shuffle players
      for (let i = this.players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
      }
  
      this.createMatches();
      return true;
    }
  
    createMatches() {
      for (let i = 0; i < this.players.length; i += 2) {
        if (this.players[i] && this.players[i + 1]) {
          this.matches['quarter-finals'].push({
            player1: this.players[i],
            player2: this.players[i + 1],
            winner: null
          });
        }
      }
    }
  
    setWinner(round, matchIndex, winningPlayer) {
      this.matches[round][matchIndex].winner = winningPlayer;
      this.winners[round].push(winningPlayer);
  
      if (this.winners[round].length === this.matches[round].length) {
        this.advanceToNextRound(round);
      }
    }
  
    advanceToNextRound(currentRound) {
      const winners = this.winners[currentRound];
      
      if (currentRound === 'quarter-finals') {
        this.currentRound = 'semi-finals';
        for (let i = 0; i < winners.length; i += 2) {
          if (winners[i] && winners[i + 1]) {
            this.matches['semi-finals'].push({
              player1: winners[i],
              player2: winners[i + 1],
              winner: null
            });
          }
        }
      } else if (currentRound === 'semi-finals') {
        this.currentRound = 'finals';
        this.matches['finals'].push({
          player1: winners[0],
          player2: winners[1],
          winner: null
        });
      }
  
      if (this.ui) {
        this.ui.renderTournament();
      }
    }
  
    startMatch(player1, player2) {
      this.currentMatch = { player1, player2 };
      document.getElementById('current-players').textContent = 
        `${player1.name} (W/S) vs ${player2.name} (↑/↓)`;
      document.querySelector('.game-container').classList.remove('hidden');
      document.querySelector('.game-info').classList.remove('hidden');
      
      this.pongGame = new PongGame((winner) => {
        this.handleGameEnd(winner);
      });
      this.pongGame.start();
    }
  
    handleGameEnd(winner) {
      const winningPlayer = winner === 'left' ? this.currentMatch.player1 : this.currentMatch.player2;
      const losingPlayer = winner === 'left' ? this.currentMatch.player2 : this.currentMatch.player1;
      
      document.getElementById('game-status').textContent = `${winningPlayer.name} wins!`;
      
      const currentRoundMatches = this.matches[this.currentRound];
      const matchIndex = currentRoundMatches.findIndex(
        match => match.player1.id === this.currentMatch.player1.id && 
                 match.player2.id === this.currentMatch.player2.id
      );
      
      if (matchIndex !== -1) {
        this.setWinner(this.currentRound, matchIndex, winningPlayer);
        this.updatePlayerStats(winningPlayer.id, true);
        this.updatePlayerStats(losingPlayer.id, false);
      }
  
      this.matchesPlayed++;
      this.updateProgress();
      
      if (this.ui) {
        this.ui.renderTournamentStats();
      }
      
      this.pongGame.stop();
      this.pongGame.reset();
      document.querySelector('.match-controls').classList.remove('hidden');
    }
  
    updateProgress() {
      const progress = (this.matchesPlayed / this.totalMatches) * 100;
      document.querySelector('.progress-bar').style.width = `${progress}%`;
    }
  }
  class TournamentUI {
    constructor() {
      this.tournament = new Tournament();
      this.tournament.setUI(this);
      this.initializeEventListeners();
      this.renderTournamentStats();
    }
  
    renderTournamentStats() {
      const stats = this.tournament.getTournamentStats();
      const statsContainer = document.querySelector('.tournament-stats');
      
      const statsHTML = `
        <h3>Tournament Progress</h3>
        <div class="tournament-progress">
          <div class="progress-bar" style="width: ${(stats.totalMatches / this.tournament.totalMatches) * 100}%"></div>
        </div>
        <div class="stats-details">
          <div class="stat-item">
            <h4>Matches Played</h4>
            <span>${stats.totalMatches}</span>
          </div>
          <div class="stat-item">
            <h4>Remaining Matches</h4>
            <span>${stats.remainingMatches}</span>
          </div>
        </div>
        <div class="player-stats">
          <h4>Player Statistics</h4>
          <div class="player-stats-list">
            ${stats.playerStats.map(player => `
              <div class="player-stat-item">
                <span class="player-name">${player.name}</span>
                <span class="player-record">
                  ${player.wins}W - ${player.matches - player.wins}L 
                  (${player.winRate}%)
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      
      statsContainer.innerHTML = statsHTML;
    }
  
    initializeEventListeners() {
      document.getElementById('start-tournament').addEventListener('click', () => {
        this.startTournament();
      });
      document.getElementById('next-match').addEventListener('click', () => {
        this.startNextMatch();
      });
    }
  
    startTournament() {
      const playerInputs = document.querySelectorAll('.player-input');
      const players = Array.from(playerInputs).map(input => input.value);
  
      if (this.tournament.initializeTournament(players)) {
        document.querySelector('.setup-section').classList.add('hidden');
        document.querySelector('.tournament-bracket').classList.remove('hidden');
        this.renderTournament();
      }
    }
  
    renderTournament() {
      const quarterFinalsEl = document.getElementById('quarter-finals');
      quarterFinalsEl.innerHTML = '<h3>Quarter Finals</h3>';
      
      // Create top and bottom groups for quarter finals
      const topGroup = document.createElement('div');
      topGroup.className = 'match-group';
      const bottomGroup = document.createElement('div');
      bottomGroup.className = 'match-group';
      
      this.tournament.matches['quarter-finals'].forEach((match, index) => {
        const matchElement = document.createElement('div');
        matchElement.className = `match ${match.winner ? 'completed' : ''}`;
        
        const player1Element = document.createElement('div');
        player1Element.className = `player ${match.winner === match.player1 ? 'winner' : ''}`;
        player1Element.textContent = match.player1;
        player1Element.onclick = () => this.handlePlayerClick('quarter-finals', index, match.player1);
  
        const player2Element = document.createElement('div');
        player2Element.className = `player ${match.winner === match.player2 ? 'winner' : ''}`;
        player2Element.textContent = match.player2;
        player2Element.onclick = () => this.handlePlayerClick('quarter-finals', index, match.player2);
  
        matchElement.appendChild(player1Element);
        matchElement.appendChild(player2Element);
        
        // Add matches to top or bottom group
        if (index < 2) {
          topGroup.appendChild(matchElement);
        } else {
          bottomGroup.appendChild(matchElement);
        }
      });
      
      quarterFinalsEl.appendChild(topGroup);
      quarterFinalsEl.appendChild(bottomGroup);
  
      // Render semi-finals and finals
      ['semi-finals', 'finals'].forEach(round => {
        const roundElement = document.getElementById(round);
        roundElement.innerHTML = `<h3>${round.replace('-', ' ').toUpperCase()}</h3>`;
  
        this.tournament.matches[round].forEach((match, index) => {
          const matchElement = document.createElement('div');
          matchElement.className = `match ${match.winner ? 'completed' : ''}`;
          
          const player1Element = document.createElement('div');
          player1Element.className = `player ${match.winner === match.player1 ? 'winner' : ''}`;
          player1Element.textContent = match.player1;
          player1Element.onclick = () => this.handlePlayerClick(round, index, match.player1);
  
          const player2Element = document.createElement('div');
          player2Element.className = `player ${match.winner === match.player2 ? 'winner' : ''}`;
          player2Element.textContent = match.player2;
          player2Element.onclick = () => this.handlePlayerClick(round, index, match.player2);
  
          matchElement.appendChild(player1Element);
          matchElement.appendChild(player2Element);
          roundElement.appendChild(matchElement);
        });
      });
  
      // Highlight current match
      const currentMatch = document.querySelector(`#${this.tournament.currentRound} .match:not(.completed)`);
      if (currentMatch) {
        currentMatch.classList.add('in-progress');
      }
  
      if (this.tournament.winners.finals.length > 0) {
        document.querySelector('.winner-section').classList.remove('hidden');
        document.getElementById('final-winner').textContent = this.tournament.winners.finals[0];
      }
    }
  
    handlePlayerClick(round, matchIndex, player) {
      if (round === this.tournament.currentRound) {
        this.tournament.setWinner(round, matchIndex, player);
      }
    }
  
    startNextMatch() {
      document.getElementById('game-status').textContent = '';
      document.querySelector('.match-controls').classList.add('hidden');
      
      const currentRoundMatches = this.tournament.matches[this.tournament.currentRound];
      const nextMatchIndex = currentRoundMatches.findIndex(match => match.winner === null);
  
      if (nextMatchIndex !== -1) {
        const nextMatch = currentRoundMatches[nextMatchIndex];
        this.tournament.startMatch(nextMatch.player1, nextMatch.player2);
      } else if (this.tournament.currentRound === 'finals' && this.tournament.winners.finals.length > 0) {
        document.querySelector('.game-container').classList.add('hidden');
        document.querySelector('.game-info').classList.add('hidden');
        document.querySelector('.match-controls').classList.add('hidden');
        document.querySelector('.winner-section').classList.remove('hidden');
        document.getElementById('final-winner').textContent = this.tournament.winners.finals[0];
      }
    }
  }

  const tournamentUI = new TournamentUI();