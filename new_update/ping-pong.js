// class PongGame {
//   getRandomWinner(player1, player2) {
//     return Math.random() < 0.5 ? player1 : player2;
//   }
// }

// class Tournament {
//   constructor() {
//     this.players = [];
//     this.currentRound = 'quarter-finals';
//     this.matches = {
//       'quarter-finals': [],
//       'semi-finals': [],
//       'finals': []
//     };
//     this.winners = {
//       'quarter-finals': [],
//       'semi-finals': [],
//       'finals': []
//     };
//     this.currentMatch = null;
//     this.PongGame = null;   
//     this.ui = null;
//     this.matchesPlayed = 0;
//     this.totalMatches = 7;
//     this.playerStats = new Map();
//   } 
  
//   // connectedCallback(){
//   //   console.log('connected');
//   // }
//   validatePlayerName(name) {
//     const sanitized = name.replace(/<[^>]*>?/gm, '').trim();
//     return sanitized.length >= 2 && sanitized.length <= 20;
//   }

//   updatePlayerStats(playerId, won) {
//     if (!this.playerStats.has(playerId)) {
//       this.playerStats.set(playerId, { matches: 0, wins: 0 });
//     }
//     const stats = this.playerStats.get(playerId);
//     stats.matches++;
//     if (won) stats.wins++;
//     this.playerStats.set(playerId, stats);
//   }

//   getTournamentStats() {
//     return {
//       totalMatches: this.matchesPlayed,
//       remainingMatches: this.totalMatches - this.matchesPlayed,
//       playerStats: Array.from(this.playerStats.entries()).map(([id, stats]) => {
//         const player = this.players.find(p => p.id === id);
//         return {
//           name: player.name,
//           matches: stats.matches,
//           wins: stats.wins,
//           winRate: stats.matches ? ((stats.wins / stats.matches) * 100).toFixed(1) : 0
//         };
//       })
//     };
//   }

//   setUI(ui) {
//     this.ui = ui;
//   }

//   initializeTournament(playerNames) {
//     const sanitizedPlayers = playerNames
//       .filter(name => name.trim() !== '')
//       .map(name => ({
//         id: Math.random().toString(36).substr(2, 9),
//         name: name.replace(/<[^>]*>?/gm, '').trim()
//       })).filter(player => this.validatePlayerName(player.name));

//     if (sanitizedPlayers.length < 4 || sanitizedPlayers.length > 8) {
//       alert('Tournament requires between 4 and 8 players');
//       return false;
//     }

//     this.players = sanitizedPlayers;
    
//     this.players.forEach(player => {
//       this.playerStats.set(player.id, { matches: 0, wins: 0 });
//     });
    
//     // Shuffle players
//     for (let i = this.players.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
//     }

//     this.createMatches();
//     return true;
//   }

//   createMatches() {
//     for (let i = 0; i < this.players.length; i += 2) {
//       if (this.players[i] && this.players[i + 1]) {
//         this.matches['quarter-finals'].push({
//           player1: this.players[i],
//           player2: this.players[i + 1],
//           winner: null
//         });
//       }
//     }
//   }

//   setWinner(round, matchIndex, winningPlayer) {
//     this.matches[round][matchIndex].winner = winningPlayer;
//     this.winners[round].push(winningPlayer);

//     if (this.winners[round].length === this.matches[round].length) {
//       this.advanceToNextRound(round);
//     }
//   }

//   advanceToNextRound(currentRound) {
//     const winners = this.winners[currentRound];
    
//     if (currentRound === 'quarter-finals') {
//       this.currentRound = 'semi-finals';
//       for (let i = 0; i < winners.length; i += 2) {
//         if (winners[i] && winners[i + 1]) {
//           this.matches['semi-finals'].push({
//             player1: winners[i],
//             player2: winners[i + 1],
//             winner: null
//           });
//         }
//       }
//     } else if (currentRound === 'semi-finals') {
//       this.currentRound = 'finals';
//       this.matches['finals'].push({
//         player1: winners[0],
//         player2: winners[1],
//         winner: null
//       });
//     }

//     if (this.ui) {
//       this.ui.renderTournament();
//     }
//   }

//   startMatch(player1, player2) {
//     this.currentMatch = { player1, player2 };
//     document.getElementById('current-players').textContent = 
//       `${player1.name} vs ${player2.name}`;
//     document.querySelector('.game-container').classList.remove('hidden');
//     document.querySelector('.game-info').classList.remove('hidden');

//     this.game = new Game();
//     this.game.startGame(player1, player2);
//   }

//   handleGameEnd(winner) {
//     const winningPlayer = winner === 'left' ? this.currentMatch.player1 : this.currentMatch.player2;
//     const losingPlayer = winner === 'left' ? this.currentMatch.player2 : this.currentMatch.player1;
    
//     document.getElementById('game-status').textContent = `${winningPlayer.name} wins!`;
    
//     const currentRoundMatches = this.matches[this.currentRound];
//     const matchIndex = currentRoundMatches.findIndex(
//       match => match.player1.id === this.currentMatch.player1.id && 
//                match.player2.id === this.currentMatch.player2.id
//     );
    
//     if (matchIndex !== -1) {
//       this.setWinner(this.currentRound, matchIndex, winningPlayer);
//       this.updatePlayerStats(winningPlayer.id, true);
//       this.updatePlayerStats(losingPlayer.id, false);
//     }

//     this.matchesPlayed++;
//     this.updateProgress();
    
//     if (this.ui) {
//       this.ui.renderTournamentStats();
//     }
    
//     this.pongGame.stop();
//     this.pongGame.reset();
//     document.querySelector('.match-controls').classList.remove('hidden');
//   }

//   updateProgress() {
//     const progress = (this.matchesPlayed / this.totalMatches) * 100;
//     document.querySelector('.progress-bar').style.width = `${progress}%`;
//   }
// }
// class TournamentUI {
//   constructor() {
//     this.tournament = new Tournament();
//     this.tournament.setUI(this);
//     this.initializeEventListeners();
//     this.renderTournamentStats();
//   }

//   renderTournamentStats() {
//     const stats = this.tournament.getTournamentStats();
//     const statsContainer = document.querySelector('.tournament-stats');
    
//     const statsHTML = `
//       <h3>Tournament Progress</h3>
//       <div class="tournament-progress">
//         <div class="progress-bar" style="width: ${(stats.totalMatches / this.tournament.totalMatches) * 100}%"></div>
//       </div>
//       <div class="stats-details">
//         <div class="stat-item">
//           <h4>Matches Played</h4>
//           <span>${stats.totalMatches}</span>
//         </div>
//         <div class="stat-item">
//           <h4>Remaining Matches</h4>
//           <span>${stats.remainingMatches}</span>
//         </div>
//       </div>
//       <div class="player-stats">
//         <h4>Player Statistics</h4>
//         <div class="player-stats-list">
//           ${stats.playerStats.map(player => `
//             <div class="player-stat-item">
//               <span class="player-name">${player.name}</span>
//               <span class="player-record">
//                 ${player.wins}W - ${player.matches - player.wins}L 
//                 (${player.winRate}%)
//               </span>
//             </div>
//           `).join('')}
//         </div>
//       </div>
//     `;
    
//     statsContainer.innerHTML = statsHTML;
//   }

//   initializeEventListeners() {
//     document.getElementById('start-tournament').addEventListener('click', () => {
//       this.startTournament();
//     });
//     document.getElementById('next-match').addEventListener('click', () => {
//       this.startNextMatch();
//     });
//   }

//   startTournament() {
//     const playerInputs = document.querySelectorAll('.player-input');
//     const players = Array.from(playerInputs).map(input => input.value);
//     if (this.tournament.initializeTournament(players)) {
//       document.querySelector('.setup-section').classList.add('hidden');
//       document.querySelector('.tournament-bracket').classList.remove('hidden');
//       this.renderTournament();
//     }
//   }

//   renderTournament() {
//     const quarterFinalsEl = document.getElementById('quarter-finals');
//     quarterFinalsEl.innerHTML = '<h3>Quarter Finals</h3>';
    
//     // Create top and bottom groups for quarter finals
//     const topGroup = document.createElement('div');
//     topGroup.className = 'match-group';
//     const bottomGroup = document.createElement('div');
//     bottomGroup.className = 'match-group';
    
//     this.tournament.matches['quarter-finals'].forEach((match, index) => {
//       const matchElement = document.createElement('div');
//       matchElement.className = `match ${match.winner ? 'completed' : ''}`;
      
//       const player1Element = document.createElement('div');
//       player1Element.className = `player ${match.winner === match.player1 ? 'winner' : ''}`;
//       player1Element.textContent = match.player1.name;
//       player1Element.onclick = () => this.handlePlayerClick('quarter-finals', index, match.player1.name);

//       const player2Element = document.createElement('div');
//       player2Element.className = `player ${match.winner === match.player2 ? 'winner' : ''}`;
//       player2Element.textContent = match.player2.name;
//       player2Element.onclick = () => this.handlePlayerClick('quarter-finals', index, match.player2.name);

//       matchElement.appendChild(player1Element);
//       matchElement.appendChild(player2Element);
      
//       // Add matches to top or bottom group
//       if (index < 2) {
//         topGroup.appendChild(matchElement);
//       } else {
//         bottomGroup.appendChild(matchElement);
//       }
//     });
    
//     quarterFinalsEl.appendChild(topGroup);
//     quarterFinalsEl.appendChild(bottomGroup);

//     // Render semi-finals and finals
//     ['semi-finals', 'finals'].forEach(round => {
//       const roundElement = document.getElementById(round);
//       roundElement.innerHTML = `<h3>${round.replace('-', ' ').toUpperCase()}</h3>`;

//       this.tournament.matches[round].forEach((match, index) => {
//         const matchElement = document.createElement('div');
//         matchElement.className = `match ${match.winner ? 'completed' : ''}`;
        
//         const player1Element = document.createElement('div');
//         player1Element.className = `player ${match.winner === match.player1 ? 'winner' : ''}`;
//         player1Element.textContent = match.player1;
//         player1Element.onclick = () => this.handlePlayerClick(round, index, match.player1);

//         const player2Element = document.createElement('div');
//         player2Element.className = `player ${match.winner === match.player2 ? 'winner' : ''}`;
//         player2Element.textContent = match.player2;
//         player2Element.onclick = () => this.handlePlayerClick(round, index, match.player2);

//         matchElement.appendChild(player1Element);
//         matchElement.appendChild(player2Element);
//         roundElement.appendChild(matchElement);
//       });
//     });

//     // Highlight current match
//     const currentMatch = document.querySelector(`#${this.tournament.currentRound} .match:not(.completed)`);
//     if (currentMatch) {
//       currentMatch.classList.add('in-progress');
//     }

//     if (this.tournament.winners.finals.length > 0) {
//       document.querySelector('.winner-section').classList.remove('hidden');
//       document.getElementById('final-winner').textContent = this.tournament. winners.finals[0];
//       // document.getElementById('final-winner').textContent = "Wa hasssssan";
//     }
//   }

//   handlePlayerClick(round, matchIndex, player) {
//     if (round === this.tournament.currentRound) {
//       this.tournament.setWinner(round, matchIndex, player);
//     }
//   }

//   startNextMatch() {
//     document.getElementById('game-status').textContent = '';
//     document.querySelector('.match-controls').classList.add('hidden');
    
//     const currentRoundMatches = this.tournament.matches[this.tournament.currentRound];
//     const nextMatchIndex = currentRoundMatches.findIndex(match => match.winner === null);

//     if (nextMatchIndex !== -1) {
//       const nextMatch = currentRoundMatches[nextMatchIndex];
//       this.tournament.startMatch(nextMatch.player1, nextMatch.player2);
//     } else if (this.tournament.currentRound === 'finals' && this.tournament.winners.finals.length > 0) {
//       document.querySelector('.game-container').classList.add('hidden');
//       document.querySelector('.game-info').classList.add('hidden');
//       document.querySelector('.match-controls').classList.add('hidden');
//       document.querySelector('.winner-section').classList.remove('hidden');
//       document.getElementById('final-winner').textContent = this.tournament.winners.finals[0];
//     }
//   }
// }

// const tournamentUI = new TournamentUI();

class PongGame {
  getRandomWinner(player1, player2) {
    return Math.random() < 0.5 ? player1 : player2;
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
    this.matchesPlayed = 0;
    this.totalMatches = 7;
    this.playerStats = new Map();
    this.pongGame = new PongGame();  // Instantiate PongGame here
    this.ui = null;
  }

  setUI(ui) {
    this.ui = ui;
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

  initializeTournament(playerNames) {
    const sanitizedPlayers = playerNames
      .filter(name => name.trim() !== '')
      .map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name.replace(/<[^>]*>?/gm, '').trim()
      })).filter(player => this.validatePlayerName(player.name));

    if (sanitizedPlayers.length > 8) {
      alert('Tournament requires 8 players');
      return false;
    }

    this.players = sanitizedPlayers;
    
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

  startAutomaticTournament() {
    this.playRound('quarter-finals');
  }

  playRound(round) {
    const currentRoundMatches = this.matches[round];
    currentRoundMatches.forEach((match, index) => {
      const winner = this.pongGame.getRandomWinner(match.player1, match.player2);
      this.setWinner(round, index, winner);
      this.updatePlayerStats(winner.id, true);
      const loser = winner === match.player1 ? match.player2 : match.player1;
      this.updatePlayerStats(loser.id, false);
    });
    
    if (round === 'quarter-finals') {
      this.advanceToNextRound('quarter-finals');
      this.playRound('semi-finals');
    // } else if (round === 'semi-finals') {
    //   this.advanceToNextRound('semi-finals');
    //   this.playRound('finals');
    }
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
  }

  startTournament() {
    const playerInputs = document.querySelectorAll('.player-input');
    const players = Array.from(playerInputs).map(input => input.value);
    if (this.tournament.initializeTournament(players)) {
      document.querySelector('.setup-section').classList.add('hidden');
      document.querySelector('.tournament-bracket').classList.remove('hidden');
      this.renderTournament();
      this.tournament.startAutomaticTournament();  // Automatically start the tournament
    }
  }

  renderTournament() {
    const roundNames = ['quarter-finals', 'semi-finals', 'finals'];
    roundNames.forEach(round => {
      const roundElement = document.getElementById(round);
      roundElement.innerHTML = `<h3>${round.replace('-', ' ').toUpperCase()}</h3>`;

      this.tournament.matches[round].forEach((match, index) => {
        const matchElement = document.createElement('div');
        matchElement.className = `match ${match.winner ? 'completed' : ''}`;
        
        const player1Element = document.createElement('div');
        player1Element.className = `player ${match.winner === match.player1 ? 'winner' : ''}`;
        player1Element.textContent = match.player1.name;

        const player2Element = document.createElement('div');
        player2Element.className = `player ${match.winner === match.player2 ? 'winner' : ''}`;
        player2Element.textContent = match.player2.name;

        matchElement.appendChild(player1Element);
        matchElement.appendChild(player2Element);
        roundElement.appendChild(matchElement);
      });
    });

    if (this.tournament.winners.finals.length > 0) {
      document.querySelector('.winner-section').classList.remove('hidden');
      document.getElementById('final-winner').textContent = this.tournament.winners.finals[0].name;
    }
  }
}

// Initialize UI and start the tournament
const tournamentUI = new TournamentUI();
