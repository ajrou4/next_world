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
      document.querySelector('.