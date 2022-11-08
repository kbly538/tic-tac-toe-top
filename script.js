function PlayerFactory(name, playerNo) {
    return { name, playerNo, stats: { win: 0, lose: 0, tie: 0, fastestWin: 0 }, currentGameStats: { turnCount: 0 } };
}

const Gameboard = (function (doc) {
    // GRID DETAILS
    const GRID_ROW_COUNT = 3;
    const GRID_COL_COUNT = 3;
    let _grid = ['', '', '', '', '', '', '', '', ''];
    let activeCell = '';

    // CACHE DOM
    const gameboardContainer = document.querySelector('.gameboardContainer');

    const setActiveCell = (ix) => activeCell = ix;
    const getActiveCell = () => activeCell;
    const clearActiveCell = () => activeCell = '';
    const getGameboard = () => [..._grid];
    const setGameboard = (grid) => _grid = grid;
    const updateGameboard = (ix, mark) => _grid[ix] = mark;
    const isEmptyCell = () => getGameboard()[getActiveCell()] === '';
    const getRows = () => GRID_ROW_COUNT;
    const getCols = () => GRID_COL_COUNT;
    const getIndexFromClick = (clickedCell) => {
        const coords = clickedCell.split('');
        cellIndex = Number(coords[0]) * 3 + Number(coords[1])
        return cellIndex;
    }

    const resetGrid = () => {
        for (let [index, cell] of _grid.entries()) {
            updateGameboard(index, '');
        }
    };


    const resetGameboard = () => {
        setActiveCell('');
        resetGrid();

    }

    const removeAttachedEventListeners = () => {

        let gridCell = Array.from(gameboardContainer.childNodes).map(child => child)
        gridCell.forEach(cell => {
            let newCell = cell.cloneNode(true);
            gameboardContainer.replaceChild(newCell, cell)
        })
    }

    return {  // GAMEBOARD METHODS
        getGameboard,
        setGameboard,
        getIndexFromClick,
        isEmptyCell,
        getRows, getCols,
        updateGameboard,
        setActiveCell,
        getActiveCell,
        removeAttachedEventListeners,
        resetGameboard
    };
})(document);

const DisplayController = (function (doc) {


    // DEFAULTS
    let player1Color = 'green';
    let player2Color = 'red';


    // Cache DOM
    const gameInfo = doc.getElementById('game-info');
    const turnInfo = doc.getElementById('turn-info');
    const resultScreen = doc.querySelector('.result-screen');
    const resultText = doc.getElementById('result-text');
    const playerForm = document.getElementById('playerform');
    const gameboard = document.querySelector('.gameboardContainer');
    const player2Option = document.getElementById('option-player2')
    const player1WinStats = document.getElementById('player1-total-wins');
    const player2WinStats = document.getElementById('player2-total-wins');
    const player1Stats = document.getElementById('player1-stats');
    const player2Stats = document.getElementById('player2-stats');
    const player1StatsContainer = document.getElementById('player1-stat-container');
    const player2StatsContainer = document.getElementById('player2-stat-container');
    const player1LosePara = document.getElementById('p1lose');
    const player1TiePara = document.getElementById('p1tie');
    const player1FastestPara = document.getElementById('p1fastest-win');
    const player2LosePara = document.getElementById('p2lose');
    const player2TiePara = document.getElementById('p2tie');
    const player2FastestPara = document.getElementById('p2fastest-win');



    const updateGameboardDisplay = () => drawGameboard();

    const drawGameboard = () => {
        let currentgameboard = Gameboard.getGameboard();
        let rowCount = Gameboard.getRows();
        let colCount = Gameboard.getCols();

        if (!!doc && 'querySelector' in doc) {
            let targetCell;
            for (let row = 0; row < rowCount; row++) {
                for (let col = 0; col < colCount; col++) {
                    targetCell = doc.getElementById(`${row}${col}`)
                    targetCell.textContent = currentgameboard[row * 3 + col];
                }
            }
        }
    }

    const activateGameDetails = () => {
        gameInfo.classList.remove('inactive');
        turnInfo.classList.remove('inactive');
    }

    const displayPlayerStats = (player1, player2) => {
        player1WinStats.textContent = `${player1.name}: ${player1.stats.win}`
        player2WinStats.textContent = `${player2.name}: ${player2.stats.win}`

        player1LosePara.textContent = `Lost Games: ${player1.stats.lose}`
        player1TiePara.textContent = `Ties: ${player1.stats.tie}`
        player1FastestPara.textContent = `Fastest win: ${player1.stats.fastestWin} rounds`

        player2LosePara.textContent = `Lost Games: ${player2.stats.lose}`
        player2TiePara.textContent = `Ties: ${player2.stats.tie}`
        player2FastestPara.textContent = `Fastest win: ${player2.stats.fastestWin} rounds`
    }

    const setupGameDisplay = () => {
        playerForm.classList.add('inactive');
        gameboard.classList.remove('inactive');
        player2Option.remove();
    }

    const setGameInfo = (player1, player2) => gameInfo.textContent = `${player1.name} VS ${player2.name}`;

    const updateTurnDisplay = (player) => {

        turnInfo.textContent = `${player.name}'s turn`;

        if (player.playerNo === 1) turnInfo.style.color = player1Color;
        else turnInfo.style.color = player2Color;

    }

    const updateResultDisplay = (result, winner) => {
        if (result === 'tie') setResultScreen();
        else if (winner) setResultScreen(winner);
    }


    const setResultScreen = (winner) => {
        toggleResultScreen();
        if (!winner) resultText.textContent = `IT'S A TIE`.toUpperCase();
        else resultText.textContent = `${winner.name} wins this round.`.toUpperCase()
        return;
    }

    const toggleResultScreen = () => {
        let resultScreenClassList = Array.from(resultScreen.classList);
        if (resultScreenClassList.includes("inactive-result-screen")) {
            resultScreen.classList.remove('inactive-result-screen');
            resultScreen.classList.add('active-result-screen');
            return;
        }

        resultScreen.classList.add('inactive-result-screen');
        resultScreen.classList.remove('active-result-screen');
    }


    return {
        updateGameboardDisplay, setGameInfo, updateTurnDisplay,
        activateGameDetails, setupGameDisplay, updateResultDisplay,
        toggleResultScreen, displayPlayerStats,
        player1Stats, player2Stats,
        player1StatsContainer, player2StatsContainer,
    }
})(document);

const GameEngine = (board, display) => {
    // Cache DOM
    const cells = document.getElementsByClassName('gridcell');
    const player1input = document.getElementById('player1');
    const player2input = document.getElementById('player2');
    const startGameButton = document.getElementById('formsubmit');
    const player2Option = document.getElementById('option-player2')
    const player2label = document.getElementById('lbl-player2');
    const resultRestartButton = document.getElementById('restart-game-btn');
    const resultPlayAgainButton = document.getElementById('play-again-btn');



    // GAME STATUS
    const gameState = { STARTED: 1, FINISHED: 0, NOT_STARTED: -1 } // -1: Has not started 0: Finished 1: Playing  
    let player1 = null;
    let player2 = null;
    let turn = player1;
    let totalTurns = 0;
    let currentGameState = gameState.NOT_STARTED;
    let result = null;
    let againstAI = false;
    let winner = null;

    const resetGameStatus = () => {
        turn = player1;
        totalTurns = 0;
        currentGameState = gameState.FINISHED;
        result = null;
        winner = null;
    }
    const setGameState = (state) => currentGameState = state;
    // INGAME EVENTS
    const processPlayerMove = (againstAI = false) => {
        if (currentGameState === gameState.NOT_STARTED ||
            currentGameState === gameState.FINISHED) {
            return;
        }
        // TODO: LOTS OF REPETITION! TRY A DRYER APPROACH
        if (againstAI) {
            if (placeMark('X') === true) {
                turn = player2;
                updatePlayerStats(player1, "turn")
                result = checkWinner(board.getGameboard());
                if (result === null && currentGameState === gameState.STARTED) {
                    result = aiMove();
                }
            }
        } else {
            if (turn === player1 && placeMark('X') === true) {
                turn = player2;
                updatePlayerStats(player1, "turn")
                result = checkWinner(board.getGameboard());
            } else if (turn === player2 && placeMark('O') === true) {
                turn = player1;
                updatePlayerStats(player2, "turn")
                result = checkWinner(board.getGameboard());
            }
        }

        display.displayPlayerStats(player1, player2);
        display.updateTurnDisplay(turn, null, null) // TODO: WHAT ARE THESE NULLS?

        if (!result) return;

        if (gameFinished()) {
            
            display.updateResultDisplay(result, winner)
            setGameState(gameState.FINISHED);
        
        }
    }
    const processCellClick = (e) => {

        // GET AND SET ACTIVATED CELL
        let cell = e.target;
        let cellIndex = board.getIndexFromClick(cell.id);
        board.setActiveCell(cellIndex)

        if (!board.isEmptyCell()) return;

        processPlayerMove(againstAI);
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
    // GAME FLOW
    const getPlayersFromInput = () => {

        if (currentGameState === gameState.FINISHED) {
            setupGame();
            return;
        }
        // IS GAME AGAINST AI?
        againstAI = player2Option.value === 'ai';
        setPlayers(player1input.value, againstAI ? 'AI' : player2input.value);

        let playersValid = validatePlayers(player1, player2);


        if (!playersValid) {
            alertUser('Players must have names.')
            return;
        }

        setupGame();

    }
    const setPlayers = (p1Name, p2Name) => {
        player1 = PlayerFactory(p1Name, 1);
        player2 = PlayerFactory(p2Name, 2);
    }
    const setupGame = () => {
        turn = player1;
        display.displayPlayerStats(player1, player2);
        setGameState(gameState.STARTED);

    }
    const startGame = (e) => {

        e.preventDefault()

        getPlayersFromInput();

        if (currentGameState !== gameState.STARTED) return;

        display.setupGameDisplay();
        display.setGameInfo(player1, player2);
        display.updateTurnDisplay(turn);
        display.activateGameDetails();
        DisplayController.updateGameboardDisplay(document);

    }

    const updatePlayerStats = (player, action) => {
        // TODO: FIX ISSUE OF NOT BEING DISPLAYED 
        console.log(player, action)
        if (action === "win") {
            player.stats.win++;
            player.stats.fastestWin = ((player.stats.fastestWin < player.currentGameStats.turnCount) 
                                     && player.stats.fastestWin !== 0) 
                                     ? player.stats.fastestWin 
                                     : player.currentGameStats.turnCount;
        }
        else if (action === "tie") player.stats.tie++;
        else if (action === "turn") player.currentGameStats.turnCount++;
        else if (action === "lose") player.stats.lose++;
    }


    const gameFinished = () => {

        
        if (result === 'tie') {
            board.removeAttachedEventListeners()
            updatePlayerStats(player1, 'tie');
            updatePlayerStats(player2, 'tie');
            return true;
        };

        if (winner) {
            // TODO: MOVE UPDATING PLAYER STATS PORTION IN winnerCheck() here
            board.removeAttachedEventListeners()
            return true;
        }
        
        
        return false;
    }
    const checkWinner = (board, shouldUpdatePlayerStats = true) => {

        // GET UP TO DATE BOARD STATUS
        let size = 3;
        let grid = board;


        // CHECK BOARD FOR X WINNER 
        // TODO: GET RID OF REPETITION
        let leftDiagonalConsecutiveMarkCount = 0;
        let rightDiagonalConsecutiveMarkCount = 0;

        for (let i = 0; i < 3; i++) {
            let consecutiveRowMarkCount = 0;
            let consecutiveColMarkCount = 0;

            for (let j = 0; j < size; j++) {
                if (grid[i * size + j] === "X") consecutiveRowMarkCount++;
                if (grid[j * size + i] === "X") consecutiveColMarkCount++;
                if (i === j && grid[i * size + j] === "X") leftDiagonalConsecutiveMarkCount++
                if (i === (size - 1) - j && grid[i * size + j] === "X") rightDiagonalConsecutiveMarkCount++;
            }

            if (consecutiveRowMarkCount === size
                || consecutiveColMarkCount === size
                || leftDiagonalConsecutiveMarkCount === size
                || rightDiagonalConsecutiveMarkCount === size) {

                // return winner
                winner = getPlayerFromMark("X");
                if (shouldUpdatePlayerStats) {
                    updatePlayerStats(winner, 'win');
                    updatePlayerStats(player2, 'lose');
                    currentGameState = gameState.FINISHED;
                }
                return "X";
            }

        }

        // CHECK BOARD FOR O WINNER             
        leftDiagonalConsecutiveMarkCount = 0;
        rightDiagonalConsecutiveMarkCount = 0;

        for (let i = 0; i < 3; i++) {
            let consecutiveRowMarkCount = 0;
            let consecutiveColMarkCount = 0;

            for (let j = 0; j < size; j++) {
                if (grid[i * size + j] === "O") consecutiveRowMarkCount++;
                if (grid[j * size + i] === "O") consecutiveColMarkCount++;
                if (i === j && grid[i * size + j] === "O") leftDiagonalConsecutiveMarkCount++
                if (i === (size - 1) - j && grid[i * size + j] === "O") rightDiagonalConsecutiveMarkCount++;
            }

            if (consecutiveRowMarkCount === size
                || consecutiveColMarkCount === size
                || leftDiagonalConsecutiveMarkCount === size
                || rightDiagonalConsecutiveMarkCount === size) {

                // return winner
                winner = getPlayerFromMark("O");
                if (shouldUpdatePlayerStats) {
                    updatePlayerStats(winner, 'win');
                    updatePlayerStats(player1, 'lose');
                    currentGameState = gameState.FINISHED;
                }
                return "O";
            }

        }

        if (noRoomOnBoard(board)) return 'tie'

        return null;
    }
    const continueGameWithCurrentSettings = (e) => {


        resetGameStatus();
        board.resetGameboard();
        display.toggleResultScreen();
        player1.currentGameStats.turnCount = 0;
        player2.currentGameStats.turnCount = 0;
        listenForCellEvents();
        startGame(e);


    }


    let scores = {
        X: 10,
        O: -10,
        tie: 0
    }

    const noRoomOnBoard = (arr) => {
        for (let i of arr) {
            if (i === "") return false;
        }
        return true
    }

    const minimax = (tempboard, depth, isMaximizing) => {

        let shouldUpdatePlayerStats = false;
        let tempResult = checkWinner(tempboard, shouldUpdatePlayerStats);
        if (tempResult) {
            return scores[tempResult];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempboard[i] == '') {
                    tempboard[i] = "X";
                    let score = minimax(tempboard, depth + 1, false);
                    tempboard[i] = "";
                    bestScore = Math.max(score, bestScore)
                }
            }
            return bestScore;
        } else {

            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempboard[i] == '') {
                    tempboard[i] = "O";
                    let score = minimax(tempboard, depth + 1, true);
                    tempboard[i] = "";
                    bestScore = Math.min(score, bestScore)
                }
            }

            return bestScore;

        }


    }

    const bestMove = (currentBoard) => {


        let bestScore = Infinity;
        let move;

        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] == '') {
                currentBoard[i] = "O";
                let score = minimax(currentBoard, 0, true);
                currentBoard[i] = "";
                if (bestScore > score) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }
    const aiMove = () => {

        display.updateTurnDisplay(turn);
        let gameRunning = (currentGameState !== gameState.NOT_STARTED && currentGameState !== gameState.FINISHED);
        if (gameRunning === false) return;
        
        const gameboard = board.getGameboard();
        let move = bestMove(gameboard);
        board.setActiveCell(move);
        totalTurns++;
        
        board.updateGameboard(board.getActiveCell(), 'O');
        display.updateGameboardDisplay();
        
        result = checkWinner(board.getGameboard())

        turn = player1;

        return result;
    }
    // UTILITY
    const getPlayerFromMark = (mark) => mark === 'X' ? player1 : mark === 'O' ? player2 : null;
    const alertUser = (message) => alert(message);
    const validatePlayers = (p1, p2) => p1.name !== "" && p2.name !== ""

    // EVENT LISTENERS
    const listenForCellEvents = () => {

        // EVENT LISTENERS: DETECT AND PROCESS CELL CLICKS
        Array.from(cells).forEach(cell => {
            cell.addEventListener('click', processCellClick, false)
        })
    }
    const listenForGameEvents = () => {


        // EVENT LISTENERS: START GAME
        startGameButton.addEventListener('click', startGame);



        // EVENT LISTENERS: OPPONENT SELECTION
        player2Option.addEventListener('change', () => {

            if (player2Option.value === "human") return player2label.style.display = "flex";

            player2label.style.display = "none"

        })

        // EVENT LISTENERS: RESULT SCREEN ACTIONS
        resultPlayAgainButton.addEventListener('click', continueGameWithCurrentSettings)
        resultRestartButton.addEventListener('click', () => location.reload())

        display.player1Stats.addEventListener('mouseenter', () => {
            display.player1StatsContainer.style.display = "grid";
        })

        display.player1Stats.addEventListener('mouseleave', () => {
            display.player1StatsContainer.style.display = "none";
        })


        display.player2Stats.addEventListener('mouseenter', () => {
            display.player2StatsContainer.style.display = "grid";
        })

        display.player2Stats.addEventListener('mouseleave', () => {
            display.player2StatsContainer.style.display = "none";
        })



    }
    return { listenForCellEvents, listenForGameEvents };
}

const game = GameEngine(Gameboard, DisplayController);
game.listenForCellEvents();
game.listenForGameEvents();



// TODO: MOVE TO DISPLAY CONTROLLER MODULE
let resScreen = document.querySelector('.result-screen')
document.addEventListener('keypress', (e) => {
    if (e.key === "k") {
        DisplayController.toggleResultScreen();

    }
})