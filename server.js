const express = require('express');
const socketio = require('socket.io');
const gameModel = require('./models/game.model');

const app = express();
app.use(express.static('assets'));

const http = require('http').createServer(app);
const io = socketio(http);
const games = []; // ongoing games
const gamesWaiting = [];

io.on('connection', socket => {
    const player = new gameModel.Player();
    player.socketId = socket.id;
    let game;

    if (gamesWaiting.length != 0) {
        player.name = 'Player 2';
        game = gamesWaiting.pop();
        game.player2 = player;
        game.onTurn = game.player1.socketId;
        games.push(game);

        io.to(game.player1.socketId).emit('start', game);
        io.to(game.player2.socketId).emit('start', game);
    } else {
        player.name = 'Player 1';
        game = new gameModel.Game();
        game.player1 = player;
        game.id = Math.round(Math.random() * 1000);
        gamesWaiting.push(game);
    }
    player.gameId = game.id;

    //join a room for specific game
    socket.join(game.id);

    io.to(player.socketId).emit('join', player);

    socket.on('move', (move) => {
        if (game.onTurn == socket.id) {
            game.move = move;
            game.onTurn = game.player1.socketId == game.onTurn ? game.player2.socketId : game.player1.socketId;
            io.to(game.id).emit('move', game);
        }
    });

    socket.on('newGame', playerId => {
        game.onTurn = game.player1.socketId;
        game.move = null;
        io.to(game.id).emit('newGame', game);
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('App running');
});

