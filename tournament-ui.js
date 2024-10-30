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