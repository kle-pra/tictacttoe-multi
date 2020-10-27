import express, { Application } from 'express';
import * as http from 'http';
import { Server } from 'http';
import socketio, { Socket } from 'socket.io';
import { Game, Player } from './models/game.model';

const app: Application = express();
app.use(express.static('assets'));

const httpServer: Server = http.createServer(app);
const io = socketio(httpServer);
const games: Game[] = []; // ongoing games
const gamesWaiting: Game[] = [];

io.on('connection', (socket: Socket) => {
    const player = new Player();
    player.socketId = socket.id;
    let game: Game;

    if (gamesWaiting.length != 0) {
        player.name = 'Player 2';
        game = gamesWaiting.pop();
        game.player2 = player;
        game.onTurnSocketId = game.player1.socketId;
        games.push(game);

        io.to(game.player1.socketId).emit('newGame', game);
        io.to(game.player2.socketId).emit('newGame', game);
    } else {
        player.name = 'Player 1';
        game = new Game();
        game.player1 = player;
        game.id = Math.round(Math.random() * 1000);
        gamesWaiting.push(game);
    }
    player.gameId = game.id;

    //join a room for specific game
    socket.join('' + game.id);

    io.to(player.socketId).emit('join', player);

    socket.on('move', (move: number) => {
        if (game.onTurnSocketId == socket.id) {
            game.move = move;
            game.onTurnSocketId = game.player1.socketId == game.onTurnSocketId ? game.player2.socketId : game.player1.socketId;
            io.to('' + game.id).emit('move', game);
        }
    });

    socket.on('newGame', () => {
        game.onTurnSocketId = Math.random() < 0.5 ? game.player1.socketId : game.player2.socketId;
        game.move = null;
        io.to('' + game.id).emit('newGame', game);
    });
});

httpServer.listen(process.env.PORT || 3000, () => {
    console.log('App running');
});

