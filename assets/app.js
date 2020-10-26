
const socket = io();

const positions = document.querySelectorAll('.board div');
const title = document.querySelector('.title');
const subtitle = document.querySelector('.subtitle');
const restart = document.querySelector('#playAgain');
const player1ScoreText = document.querySelector('#player1score');
const player2ScoreText = document.querySelector('#player2score');
restart.addEventListener('click', newGame);

let currentPlayerRef = 1;
let player1Score = 0;
let player2Score = 0;
let gameId;
let onTurnSocketId;
let playerName;
let gameOver = false;

socket.on('join', player => {
  playerName = player.name;
  gameId = player.gameId;
  subtitle.innerHTML = `You are ${playerName} (game ID: ${gameId})`;
});

socket.on('start', game => {
  onTurnSocketId = game.onTurnSocketId;
  title.innerHTML = `Player ${currentPlayerRef}'s turn.`;
  positions.forEach(pos => pos.addEventListener('click', move));
});

function move(event) {
  if (onTurnSocketId == socket.id) {
    socket.emit('move', event.target.id);
  } else {
    console.log('Not your turn.')
  }
}

socket.on('move', game => {
  mark(game.move);
  onTurnSocketId = game.onTurnSocketId
});

function mark(move) {
  position = positions[move];

  if (position.classList.contains('cross') ||
    position.classList.contains('circle') ||
    gameOver) {
    return;
  }

  if (currentPlayerRef == 1) {
    position.classList.add('cross');
  } else {
    position.classList.add('circle');
  }

  if (isGameWinned()) {
    gameOver = true;
    currentPlayerRef == 1 ? player1Score++ : player2Score++;
    player1ScoreText.innerHTML = player1Score;
    player2ScoreText.innerHTML = player2Score;
    restart.style.display = 'block';
    title.textContent = `Player ${currentPlayerRef}'s won!`;
  } else if (isGameATie()) {
    gameOver = true;
    restart.style.display = 'block';
    title.textContent = `Game is a tie!`;
  } else {
    currentPlayerRef = currentPlayerRef == 2 ? 1 : 2;
    title.innerHTML = `Player ${currentPlayerRef}'s turn.`;
  }
}

function isGameWinned() {
  return winningCommnination([0, 1, 2]) ||
    winningCommnination([3, 4, 5]) ||
    winningCommnination([6, 7, 8]) ||
    winningCommnination([0, 3, 6]) ||
    winningCommnination([1, 4, 7]) ||
    winningCommnination([2, 5, 8]) ||
    winningCommnination([0, 4, 8]) ||
    winningCommnination([2, 4, 6]);
}

function isGameATie() {
  return !Array.from(positions).some(position =>
    !position.classList.contains('cross') && !position.classList.contains('circle')
  );
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
  socket.emit('newGame', null);
}

socket.on('newGame', game => {
  restart.style.display = 'none';
  positions.forEach(position => {
    position.classList.remove('cross', 'circle');
  })
  gameOver = false;
  onTurnSocketId = game.onTurnSocketId;
  currentPlayerRef = onTurnSocketId == game.player1.socketId ? 1 : 2;
  title.innerHTML = `Player ${currentPlayerRef}'s turn.`;
  subtitle.innerHTML = `You are ${name} (game ID: ${gameId})`;
});

window.onbeforeunload = function (event) {
  return confirm("Reloading will quite the game.");
};