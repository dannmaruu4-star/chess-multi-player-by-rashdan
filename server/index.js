const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
let players = [];

wss.on('connection', ws => {
    console.log('Player connected');
    players.push(ws);

    // Assign warna secara otomatis
    let color = players.length === 1 ? 'white' : 'black';
    ws.color = color;
    ws.send(JSON.stringify({ type: 'assign', color }));

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

console.log(`Server running on port ${PORT}`);
