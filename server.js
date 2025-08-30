const WebSocket = require('ws');

// Gunakan PORT dari Render atau default 8080
const PORT = process.env.PORT || 8080;

// Buat WebSocket server
const wss = new WebSocket.Server({ port: PORT });

let players = [];

wss.on('connection', ws => {
    console.log('Player connected');

    // Auto assign warna: player pertama White, kedua Black
    let color = players.length === 0 ? 'white' : 'black';
    ws.color = color;

    ws.send(JSON.stringify({ type: 'assign', color }));
    players.push(ws);

    // Terima mesej dari client
    ws.on('message', message => {
        const data = JSON.parse(message);

        if(data.type === 'move') {
            // Broadcast move ke pemain lain
            players.forEach(player => {
                if(player !== ws && player.readyState === WebSocket.OPEN) {
                    player.send(JSON.stringify({ type: 'move', move: data.move }));
                }
            });
        }

        if(data.type === 'reset') {
            // Broadcast reset ke semua player
            players.forEach(player => {
                if(player.readyState === WebSocket.OPEN) {
                    player.send(JSON.stringify({ type: 'reset' }));
                }
            });
        }
    });

    // Handle disconnect
    ws.on('close', () => {
        console.log('Player disconnected');
        players = players.filter(p => p !== ws);
    });
});

console.log(`Server running on port ${PORT}`);
