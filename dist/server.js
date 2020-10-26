"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const game_model_1 = require("./models/game.model");
const app = express_1.default();
app.use(express_1.default.static('assets'));
const http = require('http').createServer(app);
const io = socket_io_1.default(http);
const games = []; // ongoing games
const gamesWaiting = [];
io.on('connection', socket => {
    const player = new game_model_1.Player();
    player.socketId = socket.id;
    let game;
    if (gamesWaiting.length != 0) {
        player.name = 'Player 2';
        game = gamesWaiting.pop();
        game.player2 = player;
        game.onTurnSocketId = game.player1.socketId;
        games.push(game);
        io.to(game.player1.socketId).emit('start', game);
        io.to(game.player2.socketId).emit('start', game);
    }
    else {
        player.name = 'Player 1';
        game = new game_model_1.Game();
        game.player1 = player;
        game.id = Math.round(Math.random() * 1000);
        gamesWaiting.push(game);
    }
    player.gameId = game.id;
    //join a room for specific game
    socket.join(game.id);
    io.to(player.socketId).emit('join', player);
    socket.on('move', move => {
        if (game.onTurnSocketId == socket.id) {
            game.move = move;
            game.onTurnSocketId = game.player1.socketId == game.onTurnSocketId ? game.player2.socketId : game.player1.socketId;
            io.to(game.id).emit('move', game);
        }
    });
    socket.on('newGame', () => {
        game.onTurnSocketId = Math.random() < 0.5 ? game.player1.socketId : game.player2.socketId;
        game.move = null;
        io.to(game.id).emit('newGame', game);
    });
});
http.listen(process.env.PORT || 3000, () => {
    console.log('App running');
});
