class Game {
    id;
    player1;
    player2;
    end = false;
    onTurn;
    move;
}
class Player {
    socketId;
    name;
    gameId;
}

module.exports = { Game, Player }