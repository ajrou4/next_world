class PongGame {
    getRandomWinner(player1, player2) {
      return Math.random() < 0.5 ? player1 : player2;
    }
  }

  class Tournament {
    constructor(players) {
      this.players = players;
      this.matches = { 'semi-finals': [], 'finals': [] };
      this.winners = { 'semi-finals': [], 'finals': [] };
      this.pongGame = new PongGame();
    }

    createMatches() {
      for (let i = 0; i < this.players.length; i += 2) {
        if (this.players[i] && this.players[i + 1]) {
          this.matches['semi-finals'].push({
            player1: this.players[i],
            player2: this.players[i + 1],
            winner: null
          });
        }
      }
    }

    playRound(round) {
      const matches = this.matches[round];
      matches.forEach((match, index) => {
        const winner = this.pongGame.getRandomWinner(match.player1, match.player2);
        match.winner = winner;
        this.winners[round].push(winner);
      });
    }

    playTournament() {
      this.playRound('semi-finals');
      this.matches['finals'].push({
        player1: this.winners['semi-finals'][0],
        player2: this.winners['semi-finals'][1],
        winner: null
      });
      this.playRound('finals');
    }
  }

  function startTournament() {
    const players = [
      { name: document.getElementById('player1').value || 'Player 1' },
      { name: document.getElementById('player2').value || 'Player 2' },
      { name: document.getElementById('player3').value || 'Player 3' },
      { name: document.getElementById('player4').value || 'Player 4' }
    ];

    const tournament = new Tournament(players);
    tournament.createMatches();
    tournament.playTournament();

    const finalWinner = tournament.winners['finals'][0].name;
    const bracketHTML = `
      <h1>Tournament Bracket</h1>
      <div class="bracket">
        <div class="round">
          <div class="match">${players[0].name}</div>
          <div class="match">${players[1].name}</div>
        </div>
        <div class="center">
          <div class="trophy">🏆</div>
          <div class="match">${tournament.winners['semi-finals'][0].name}</div>
          <div class="match">${tournament.winners['semi-finals'][1].name}</div>
          <div class="champion">${finalWinner}</div>
        </div>
        <div class="round">
          <div class="match">${players[2].name}</div>
          <div class="match">${players[3].name}</div>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = bracketHTML;
  }