export class Game {
    id: number;
    player1: Player;
    player2: Player;
    onTurnSocketId: string;
    move: number;
}
export class Player {
    socketId: string;
    name: string;
    gameId: number;
}