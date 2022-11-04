const Gameboard = (function (doc) {
    // CELL ARRAY
    let _gridRows = 3;
    let _gridCols = 3;
    let _grid = ['', '', '',
        '', '', '',
        '', '', ''];
    let activeCell = '';

    const setActiveCell = (ix) => activeCell = ix;
    const getActiveCell = () => activeCell;
    const emptyActiveCell = () => activeCell = '';
    const getGameboard = () => _grid.slice();
    const setGameboard = (grid) => _grid = grid;
    const updateGameboard = (ix, mark) => _grid[ix] = mark;

    const getRows = () => _gridRows;
    const getCols = () => _gridCols;
    const getGridInfo = function () {
        return { rows: _gridRows, cols: _gridCols, grid: _grid.slice() }
    };

    return { getGameboard, setGameboard, getRows, getCols, getGridInfo, updateGameboard, setActiveCell, getActiveCell, emptyActiveCell };
})();






const DisplayController = (function (doc) {
    // Cache DOM
    const gameInfo = doc.getElementById('game-info');
    const turnInfo = doc.getElementById('turn-info');

    const updateGameboardDisplay = () => {

        let currentGameboard = Gameboard.getGameboard();
        let currentCell;


        if (!!doc && 'querySelector' in doc) {
            for (let row = 0; row < Gameboard.getRows(); row++) {
                for (let col = 0; col < Gameboard.getCols(); col++) {
                    currentCell = doc.getElementById(`${row}${col}`)
                    currentCell.textContent = currentGameboard[row * 3 + col];

                }

            }
        }

        gameInfo.classList.remove('inactive');
        turnInfo.classList.remove('inactive');

    };

    const setGameInfo = (player1, player2) => {
        gameInfo.textContent = `${player1.name} VS ${player2.name}`
    }
    const setTurnInfo = (player, tie, winner) => {
        turnInfo.textContent = `${player}'s turn`;
        let turnInfoColor = turnInfo.style.color;
        turnInfoColor === 'green'? turnInfoColor ='red': turnInfoColor = 'green';
        turnInfo.style.color = turnInfoColor;
        if (tie){
            turnInfo.textContent = "IT'S A TIE."
            turnInfo.style.fontSize = "64px"
            return;
        }

        if (winner){
            turnInfo.textContent = `${winner.name} wins.`
            if (player === 'O')
            {
                turnInfo.style.color = 'red';
            }
        }
    }

    return { updateGameboardDisplay, setGameInfo, setTurnInfo }
})(document);


function PlayerFactory(name) {
    return { name };
}


const GameEngine = (board, display) => {

    let gameState = { STARTED: 1, FINISHED: 0, NOT_STARTED: -1 } // -1: Has not started 0: Fİnished 1: Playing  

    let player1;
    let player2;
    let turn;
    let totalTurns = 0;
    let currentGameState = gameState.NOT_STARTED;

    // Cache DOM
    const cells = document.getElementsByClassName('gridcell');
    const player1input = document.getElementById('player1');
    const player2input = document.getElementById('player2');
    const playerForm = document.getElementById('playerform');
    const gameboard = document.querySelector('.gameboardContainer');
    const startGameButton = document.getElementById('formsubmit');


    // Register cells for event listening
    const processPlayerMove = () => {

        let result = null;

        if (turn === player1.name) {
            if (markBoard('X') === true) {
                turn = player2.name;
                result = checkWin('X');
            }
        } else if (turn === player2.name) {
            
            
            
            if (markBoard('O') === true) {
                turn = player1.name;
                result = checkWin('O');
                
            }
        } 

        totalTurns++;
        
        if (result) {
            // Remove event listeners
            const cleanGameboard = gameboard.cloneNode(true);
            gameboard.parentNode.replaceChild(cleanGameboard, gameboard);
            return;
        }

        console.log(totalTurns);
        console.log(result);
        if (totalTurns === 9 && !result){
            console.log('tie')
            const cleanGameboard = gameboard.cloneNode(true);
            gameboard.parentNode.replaceChild(cleanGameboard, gameboard);
            display.setTurnInfo(turn, true)
            return;
        }

        display.setTurnInfo(turn)

    }



    const listenForCellEvents = () => {
        Array.from(cells).forEach(cell => {
            cell.addEventListener('click', () => {
                const coords = cell.id.split('');
                cellIndex = Number(coords[0]) * 3 + Number(coords[1])
                board.setActiveCell(cellIndex)
                return cellIndex
            }, false)
        })
    }

    const listenForGameEvents = () => {
        gameboard.addEventListener('click', () => {
            processPlayerMove();
        })


        startGameButton.addEventListener('click', startGame);


    }


    const setPlayers = (p1, p2) => {
        player1 = PlayerFactory(p1);
        player2 = PlayerFactory(p2);

    }

    const validatePlayers = (p1, p2) => {
        if (player1.name === "" || player2.name === "") {
            alert("Players must have names.")
            currentGameState = gameState.NOT_STARTED;
            return;
        }
        currentGameState = gameState.STARTED;
    }

    const startGame = (e) => {
        setPlayers(player1input.value, player2input.value);
        validatePlayers(player1.name, player2.name)
        if (currentGameState == gameState.NOT_STARTED) return;


        turn = player1.name;


        playerForm.classList.add('inactive');
        gameboard.classList.remove('inactive');

        display.setGameInfo(player1, player2);
        display.setTurnInfo(turn);

        DisplayController.updateGameboardDisplay(document);

        e.preventDefault()
    }


    const markBoard = (mark) => {
        const activeCell = board.getActiveCell();
        const gameboard = board.getGameboard();

        if (gameboard[activeCell] !== '') return false;

        board.updateGameboard(activeCell, mark);

        display.updateGameboardDisplay();

        return true;
    }

    const determineWinner = (mark, player1, player2) => {
        if (mark === 'X') {
            display.setTurnInfo('X', false, player1)
            return player1.name;
        } else if (mark === 'O') {
            display.setTurnInfo('O', false, player2)
            return player2.name;
        }

        

        return "No such player."

    }

    const checkWin = (mark) => {
        let winner = null;
        let leftDiagonalConsecutiveMarkCount = 0;
        let rightDiagonalConsecutiveMarkCount = 0;

        let size = board.getCols();
        let grid = board.getGameboard();

        for (let i = 0; i < 3; i++) {
            let consecutiveRowMarkCount = 0;
            let consecutiveColMarkCount = 0;

            for (let j = 0; j < size; j++) {

                if (grid[i * size + j] === mark) {
                    consecutiveRowMarkCount++;
                }
                if (grid[j * size + i] === mark) {
                    consecutiveColMarkCount++;
                }

                if (i === j && grid[i * size + j] === mark) {
                    leftDiagonalConsecutiveMarkCount++
                }
                if (i === (size - 1) - j && grid[i * size + j] === mark) {
                    rightDiagonalConsecutiveMarkCount++
                }

            }

            if (consecutiveRowMarkCount === size
                || consecutiveColMarkCount === size
                || leftDiagonalConsecutiveMarkCount === size
                || rightDiagonalConsecutiveMarkCount === size) {
                winner = true;
            }

        }


        return winner ? determineWinner(mark, player1, player2) : null;
    }

    return { listenForCellEvents, listenForGameEvents };
}


const game = GameEngine(Gameboard, DisplayController);


game.listenForCellEvents();
game.listenForGameEvents();

