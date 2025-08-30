const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Jalankan server HTTP
const server = app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

let players = [];

wss.on('connection', ws => {
    console.log('Player connected');

    // Assign warna
    let color = players.length === 0 ? 'white' : 'black';
    ws.color = color;
    ws.send(JSON.stringify({ type: 'assign', color }));
    players.push(ws);

    ws.on('message', message => {
        const data = JSON.parse(message);

        if(data.type === 'move') {
            players.forEach(player => {
                if(player !== ws && player.readyState === WebSocket.OPEN) {
                    player.send(JSON.stringify({ type: 'move', move: data.move }));
                }
            });
        }

        if(data.type === 'reset') {
            players.forEach(player => {
                if(player.readyState === WebSocket.OPEN) {
                    player.send(JSON.stringify({ type: 'reset' }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Player disconnected');
        players = players.filter(p => p !== ws);
    });
});
