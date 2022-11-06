function PlayerFactory(name, playerNo) {
    return { name, playerNo };
}

const Gameboard = (function (doc) {
    // CELL ARRAY
    let _gridRows = 3;
    let _gridCols = 3;
    let _grid = ['', '', '', '', '', '', '', '', ''];
    let activeCell = '';

    // CACHE DOM
    const gameboardContainer = document.querySelector('.gameboardContainer');

    const setActiveCell = (ix) => activeCell = ix;
    const getActiveCell = () => activeCell;
    const emptyActiveCell = () => activeCell = '';
    const getGameboard = () => _grid.slice();
    const setGameboard = (grid) => _grid = grid;
    const updateGameboard = (ix, mark) => _grid[ix] = mark;

    const getRows = () => _gridRows;
    const getCols = () => _gridCols;

    const removeAttachedEventListeners = ()=>{
        // Remove event listeners
        const clonedGameboard = gameboardContainer.cloneNode(true);
        gameboardContainer.parentNode.replaceChild(clonedGameboard, gameboardContainer);
        return;
    }
    

    return { getGameboard, setGameboard, getRows, getCols, updateGameboard, setActiveCell, getActiveCell, emptyActiveCell, removeAttachedEventListeners};
})();

const DisplayController = (function (doc) {


    // DEFAULTS
    let player1Color = 'green';
    let player2Color = 'red';


    // Cache DOM
    const gameInfo = doc.getElementById('game-info');
    const turnInfo = doc.getElementById('turn-info');
    const resultScreen = doc.querySelector('.result-screen');
    const resultText = doc.getElementById('result-text');

    const updateGameboardDisplay = () => {

        let currentGameboard = Gameboard.getGameboard();

        // draw gameboard
        if (!!doc && 'querySelector' in doc) {
            let targetCell; 
            for (let row = 0; row < Gameboard.getRows(); row++) {
                for (let col = 0; col < Gameboard.getCols(); col++) {
                    targetCell = doc.getElementById(`${row}${col}`)
                    targetCell.textContent = currentGameboard[row * 3 + col];
                }
            }
        }

        activeCurrentGameDetails();

    };

    const activeCurrentGameDetails = ()=>{
        gameInfo.classList.remove('inactive');
        turnInfo.classList.remove('inactive');
    }



    const setGameInfo = (player1, player2) => {
        gameInfo.textContent = `${player1.name} VS ${player2.name}`;
    }
    const setTurnInfo = (player, tie, winner) => {
        if (tie) {
            setResultScreen();
            return;
        }
        
        if (winner) {
            setResultScreen(winner.name);
            return;
        }

        turnInfo.textContent = `${player.name}'s turn`;

        if (player.playerNo === 1){
          turnInfo.style.color = player1Color;
        } else {
            turnInfo.style.color = player2Color;
        }
    }

    const setResultScreen = (winner) =>{
        resultScreen.classList.remove('inactive-result-screen');
        resultScreen.classList.add('active-result-screen');
        
        if (!winner){
            resultText.textContent = `IT'S A TIE`.toUpperCase();
            return;
        }

        resultText.textContent = `${winner} wins this round.`.toUpperCase();
    }

    return { updateGameboardDisplay, setGameInfo, setTurnInfo }
})(document);

const GameEngine = (board, display) => {

    let gameState = { STARTED: 1, FINISHED: 0, NOT_STARTED: -1 } // -1: Has not started 0: Finished 1: Playing  

    let player1;
    let player2;
    let turn = player1;
    let totalTurns = 0;
    let currentGameState = gameState.NOT_STARTED;
    let result = null;
    let againstAI = true;

    // Cache DOM
    const cells = document.getElementsByClassName('gridcell');
    const player1input = document.getElementById('player1');
    const player2input = document.getElementById('player2');
    const playerForm = document.getElementById('playerform');
    const gameboard = document.querySelector('.gameboardContainer');
    const startGameButton = document.getElementById('formsubmit');
    

    const setGameState = (state)=>{
        currentGameState = state;
    }

    // AI
    const aiMove = () => {


        if (currentGameState === gameState.NOT_STARTED || 
            currentGameState === gameState.FINISHED){
            return;
        }

        let randomMove = Math.round(Math.random() * 8)
        const gameboard = board.getGameboard();

        while (gameboard[randomMove] !== '') {
            randomMove = Math.round(Math.random() * 8);
            console.log(board.getGameboard())
        }
        totalTurns++;

        board.setActiveCell(randomMove);

        board.updateGameboard(board.getActiveCell(), 'O');

        display.updateGameboardDisplay();

        result = checkWinner('O')

        turn = player1;

        return result;
    }


    // Register cells for event listening
    const processPlayerMove = (againstAI = false) => {

        console.log(board.getGameboard())

        if (currentGameState === gameState.NOT_STARTED || 
            currentGameState === gameState.FINISHED){
            return;
        }

        if (againstAI){
            if (placeMark('X') === true) {
                turn = player2;
                result = checkWinner('X');
                if (!result && currentGameState === gameState.STARTED){
                    result = aiMove();
                }
            }
        } else {
            if (turn === player1 && placeMark('X') === true) {
                turn = player2;
                result = checkWinner('X');
                console.log(turn)
            } else if (turn === player2 && placeMark('O') === true) {
                
                turn = player1;
                result = checkWinner('O');
            }
        }
        
        display.setTurnInfo(turn, null, null)

        let gameStatus = checkGameStatus();

        if (gameStatus){
            setGameState(gameState.FINISHED);
            return;
        }

    }

    const checkGameStatus = ()=>{
        if (result) {
            board.removeAttachedEventListeners()
            
            return true;
        }

        if (checkForTie() === true) {
            display.setTurnInfo(null, true, null)
            board.removeAttachedEventListeners()
            return true;
        };

        return false;
    }

    const processCellClick = (e) => {
        let cell = e.target;
        let cellIndex = getIndexFromClick(cell.id); 
        board.setActiveCell(cellIndex)
        if (!isEmptyCell) return;
        processPlayerMove(againstAI);
    }


    


    const listenForCellEvents = () => {
        Array.from(cells).forEach(cell => {
            cell.addEventListener('click', processCellClick, false)
        })
    }

    const listenForGameEvents = () => {
        startGameButton.addEventListener('click', startGame);
    }


    const setPlayers = (p1, p2) => {
        player1 = PlayerFactory(p1, 1);
        player2 = PlayerFactory(p2, 2);

    }

    const validatePlayers = (p1, p2) => {
        if (player1.name === "" || player2.name === "") {
            alert("Players must have names.")
            setGameState(gameState.NOT_STARTED);
            return;
        }
        setGameState(gameState.STARTED);
    }




    const placeMark = (mark) => {
        const activeCell = board.getActiveCell();
        const gameboard = board.getGameboard();

        if (gameboard[activeCell] !== '') return false;

        board.updateGameboard(activeCell, mark);

        display.updateGameboardDisplay();

        totalTurns++;
        return true;
    }

    const determineWinner = (mark, player1, player2) => {
       
        setGameState(gameState.FINISHED)
        
        if (mark === 'X') {
            display.setTurnInfo(player1, false, player1)
            return player1.name
        } else if (mark === 'O') {
            display.setTurnInfo(player2, false, player2)
            return player2.name;
        } else {
            display.setTurnInfo(null, true, null)
        }

        return "No such player."

    }

    const checkForTie = () => totalTurns === 9 && !result;

    const checkWinner = (mark) => {
        
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
        console.log(totalTurns, !winner)
        if (totalTurns === 9 && !winner) {
            return determineWinner();
        }

        return winner ? determineWinner(mark, player1, player2) : null;
    }

    // UTILITY
    const getIndexFromClick = (clickedCell)=>{
        const coords = clickedCell.split('');
        cellIndex = Number(coords[0]) * 3 + Number(coords[1])
        return cellIndex;
    }

    const isEmptyCell = ()=>{
        return board.getGameboard()[board.getActiveCell()] === '';
    }

    // GAME FLOW
    const startGame = (e) => {

        setPlayers(player1input.value, player2input.value);
        
        validatePlayers(player1.name, player2.name)

        turn = player1;


        playerForm.classList.add('inactive');
        gameboard.classList.remove('inactive');

        display.setGameInfo(player1, player2);
        display.setTurnInfo(player1, null, null);

        DisplayController.updateGameboardDisplay(document);
        console.log(currentGameState)

        e.preventDefault()
    }

    return { listenForCellEvents, listenForGameEvents };
}

const game = GameEngine(Gameboard, DisplayController);
game.listenForCellEvents();
game.listenForGameEvents();


