const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let players = [];

wss.on('connection', ws => {
    console.log('Player connected');

    // Assign warna otomatis
    let color = players.length === 0 ? 'white' : 'black';
    ws.color = color;
    ws.send(JSON.stringify({ type: 'assign', color }));

    players.push(ws);

    ws.on('message', message => {
        const data = JSON.parse(message);

        // Broadcast move ke pemain lain
        if(data.type === 'move') {
            players.forEach(player => {
                if(player !== ws && player.readyState === WebSocket.OPEN) {
                    player.send(JSON.stringify({ type: 'move', move: data.move }));
                }
            });
        }

        // Reset game
        if(data.type === 'reset') {
            players.forEach(player => {
                if(player.readyState === WebSocket.OPEN) {
                    player.send(JSON.stringify({ type: 'reset' }));
                }
            });
        }
    });

    ws.on('close', () => {
        players = players.filter(p => p !== ws);
        console.log('Player disconnected');
    });
});

console.log('Server running on ws://localhost:8080');
