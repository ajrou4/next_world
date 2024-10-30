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
