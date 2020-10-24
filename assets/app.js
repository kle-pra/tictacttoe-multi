
const socket = io();

const positions = document.querySelectorAll('.board div');
const title = document.querySelector('.title');
const subtitle = document.querySelector('.subtitle');
const restart = document.querySelector('#playAgain');
const player1ScoreText = document.querySelector('#player1score');
const player2ScoreText = document.querySelector('#player2score');
restart.addEventListener('click', newGame);

let player = 1;
let player1Score = 0;
let player2Score = 0;
let playerId;
let gameId;
let onTurn;
let playerName;
let gameOver = false;

socket.on('join', (player) => {
  playerId = socket.id;
  name = player.name;
  gameId = player.gameId;
  subtitle.innerHTML = `You are ${name} (game ID: ${gameId})`;
});

socket.on('start', (game) => {
  console.log("start", game)
  onTurn = game.onTurn;
  title.innerHTML = `Player ${player}'s turn.`;
  positions.forEach(pos => pos.addEventListener('click', move));
});

function move(event) {
  if (onTurn == playerId) {
    socket.emit('move', event.target.id);
  } else {
    console.log('Not your turn.')
  }
}

socket.on('move', (game) => {
  mark(game.move);
  onTurn = game.onTurn
});

function mark(move) {
  position = positions[move];

  if (position.classList.contains('cross') ||
    position.classList.contains('circle') ||
    gameOver) {
    return;
  }

  if (player == 1) {
    position.classList.add('cross');
  } else {
    position.classList.add('circle');
  }

  if (gameEnd()) {
    gameOver = true;
    player == 1 ? player1Score++ : player2Score++;
    player1ScoreText.innerHTML = player1Score;
    player2ScoreText.innerHTML = player2Score;
    restart.style.display = 'block';
    title.textContent = `Player ${player}'s won!`;
  } else {
    player = player == 2 ? 1 : 2;
    title.innerHTML = `Player ${player}'s turn.`;
  }
}

function gameEnd() {
  return winningCommnination([0, 1, 2]) ||
    winningCommnination([3, 4, 5]) ||
    winningCommnination([6, 7, 8]) ||
    winningCommnination([0, 3, 6]) ||
    winningCommnination([1, 4, 7]) ||
    winningCommnination([2, 5, 8]) ||
    winningCommnination([0, 4, 8]) ||
    winningCommnination([2, 4, 6]);
}

function winningCommnination(indeces) {
  let crossesWin = true;
  let circlesWin = true;

  for (let i of indeces) {
    if (!positions[i].classList.contains('cross')) {
      crossesWin = false;
    }
    if (!positions[i].classList.contains('circle')) {
      circlesWin = false;
    }
  }
  return circlesWin || crossesWin;
}

function newGame() {
  socket.emit('newGame', playerId);
}

socket.on('newGame', (game) => {
  restart.style.display = 'none';

  positions.forEach(position => {
    position.classList.remove('cross');
    position.classList.remove('circle');
  })
  gameOver = false;
  onTurn = game.onTurn;
  title.innerHTML = `Player ${player}'s turn.`;
  subtitle.innerHTML = `You are ${name} (game ID: ${gameId})`;
});

window.onbeforeunload = function (event) {
  return confirm("Reloading will quite the game.");
};