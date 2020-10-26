class Game {
    id;
    player1;
    player2;
    onTurnSocketId;
    move;
}
class Player {
    socketId;
    name;
    gameId;
}

module.exports = { Game, Player }