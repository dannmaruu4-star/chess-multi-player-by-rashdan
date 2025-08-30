const ws = new WebSocket(`ws://${window.location.host}`);
const chess = new Chess();
let board;
let myColor = 'white';

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if(data.type === 'assign') {
        myColor = data.color;
        document.getElementById('color').innerText = `You are: ${myColor}`;
        setupBoard();
    }

    if(data.type === 'move') {
        chess.move(data.move);
        board.position(chess.fen());
        checkGameStatus();
    }

    if(data.type === 'reset') {
        chess.reset();
        board.start();
    }
};

function setupBoard() {
    board = Chessboard('board', {
        draggable: true,
        orientation: myColor,
        position: 'start',
        onDrop: (source, target) => {
            if(chess.turn() !== myColor[0]) return 'snapback';
            const move = chess.move({ from: source, to: target });
            if(!move) return 'snapback';
            ws.send(JSON.stringify({ type: 'move', move }));
            checkGameStatus();
        }
    });
}

document.getElementById('resetBtn').addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'reset' }));
    chess.reset();
    board.start();
});

function checkGameStatus() {
    if(chess.in_checkmate()) {
        alert('Checkmate! Game over.');
    } else if(chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
        alert('Draw!');
    }
}
