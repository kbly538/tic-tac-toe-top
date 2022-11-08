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
        player2FastestPara.textContent = `Fastest win: ${player2.stats.fastestWin} rounds`}

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

    const updateResultDisplay = (result) => result ? setResultScreen(result.name) : setResultScreen();


    const setResultScreen = (winner) => {

        toggleResultScreen();

        if (!winner) return resultText.textContent = `IT'S A TIE`.toUpperCase();
        else resultText.textContent = `${winner} wins this round.`.toUpperCase();
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


    return { updateGameboardDisplay, setGameInfo, updateTurnDisplay, 
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

    const resetGameStatus = () => {
        turn = player1;
        totalTurns = 0;
        currentGameState = gameState.FINISHED;
        result = null;
    }
    const setGameState = (state) => currentGameState = state;
    // INGAME EVENTS
    const processPlayerMove = (againstAI = false) => {

        if (currentGameState === gameState.NOT_STARTED ||
            currentGameState === gameState.FINISHED) {
            return;
        }
        if (againstAI) {
            if (placeMark('X') === true) {
                turn = player2;
                updatePlayerStats(player1, "turn")
                result = checkWinner('X');
                if (!result) result = checkForTie();
                if (!result && currentGameState === gameState.STARTED) {
                    result = aiMove();
                }
            } 
        } else {
            if (turn === player1 && placeMark('X') === true) {
                turn = player2;
                updatePlayerStats(player1, "turn")
                result = checkWinner('X');
            } else if (turn === player2 && placeMark('O') === true) {
                turn = player1;
                updatePlayerStats(player2, "turn")
                result = checkWinner('O');
            }
        }

        display.displayPlayerStats(player1, player2);
        display.updateTurnDisplay(turn, null, null)


        if (gameFinished()) {
            display.updateResultDisplay(result)
            setGameState(gameState.FINISHED);
            return;
        }

    }
    const processCellClick = (e) => {

        // GET AND SET ACTIVATED CELL
        let cell = e.target;
        let cellIndex = board.getIndexFromClick(cell.id);
        board.setActiveCell(cellIndex)

        if (!board.isEmptyCell()){ return};

        processPlayerMove(againstAI);
    }
    const placeMark = (mark) => {
        const activeCell = board.getActiveCell();
        const gameboard = board.getGameboard();

        if (gameboard[activeCell] !== '') {
            return false;
        }

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
        if (action === "win") {
            player.stats.win++;
            player.stats.fastestWin = ((player.stats.fastestWin < player.currentGameStats.turnCount) && player.stats.fastestWin !== 0) ?  player.stats.fastestWin : player.currentGameStats.turnCount;
        } 
        else if (action === "tie")player.currentGameStats.tie++;
        else if (action === "turn") player.currentGameStats.turnCount++;
    }


    const gameFinished = () => {
        if (result) {
            board.removeAttachedEventListeners()
            return true;
        }

        if (checkForTie() === true) {
            board.removeAttachedEventListeners()
            updatePlayerStats(player1, 'tie');
            updatePlayerStats(player2, 'tie');
            return true;
        };

        return false;
    }
    const checkForTie = () => totalTurns === 9 && !result;
    const checkWinner = (mark) => {

        let winner = null;

        // GET UP TO DATE BOARD STATUS
        let size = board.getCols();
        let grid = board.getGameboard();


        // CHECK BOARD FOR WINNER 
        let leftDiagonalConsecutiveMarkCount = 0;
        let rightDiagonalConsecutiveMarkCount = 0;

        for (let i = 0; i < 3; i++) {
            let consecutiveRowMarkCount = 0;
            let consecutiveColMarkCount = 0;

            for (let j = 0; j < size; j++) {
                if (grid[i * size + j] === mark) consecutiveRowMarkCount++;
                if (grid[j * size + i] === mark) consecutiveColMarkCount++;
                if (i === j && grid[i * size + j] === mark) leftDiagonalConsecutiveMarkCount++
                if (i === (size - 1) - j && grid[i * size + j] === mark) rightDiagonalConsecutiveMarkCount++;
            }

            if (consecutiveRowMarkCount === size
                || consecutiveColMarkCount === size
                || leftDiagonalConsecutiveMarkCount === size
                || rightDiagonalConsecutiveMarkCount === size) {

                // return winner
                winner = getPlayerFromMark(mark);
                updatePlayerStats(winner, 'win');
                currentGameState = gameState.FINISHED;
                return winner;
            }

        }

        // CHECK FOR TIE
        if (totalTurns === 9 && !winner) return null;

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

    // AI
    const aiMove = () => {

        display.updateTurnDisplay(turn);

        if (currentGameState === gameState.NOT_STARTED ||
            currentGameState === gameState.FINISHED) {
            return;
        }

        let randomMove = Math.round(Math.random() * 8)
        const gameboard = board.getGameboard();
        

        let emptyCellsForLookAhead = []
        gameboard.forEach((cell, index)=>{
            if (cell === "") emptyCellsForLookAhead.push(index);
        })

        console.log("empt cells", emptyCellsForLookAhead);

        while (gameboard[randomMove] !== '') {
            randomMove = Math.round(Math.random() * 8);

        }

        totalTurns++;

        board.setActiveCell(randomMove);

        board.updateGameboard(board.getActiveCell(), 'O');

        display.updateGameboardDisplay();

        result = checkWinner('O')

        turn = player1;

        return result;
    }
    // UTILITY
    const getPlayerFromMark = (mark) => mark === 'X' ? player1 : mark === 'O' ? player2 : null;
    const alertUser = (message) => alert(message);
    const validatePlayers = (p1, p2) => p1.name !== "" && p2.name !== ""

    // EVENT LISTENERS

    const listenForCellEvents = () => {

        // DETECT AND PROCESS CELL CLICKS
        Array.from(cells).forEach(cell => {
            cell.addEventListener('click', processCellClick, false)
        })
    }
    const listenForGameEvents = () => {


        // START GAME
        startGameButton.addEventListener('click', startGame);



        // OPPONENT SELECTION
        player2Option.addEventListener('change', () => {

            if (player2Option.value === "human") return player2label.style.display = "flex";

            player2label.style.display = "none"

        })

        // RESULT SCREEN ACTIONS
        resultPlayAgainButton.addEventListener('click', continueGameWithCurrentSettings)
        resultRestartButton.addEventListener('click', () => location.reload())

        display.player1Stats.addEventListener('mouseenter', ()=>{
            display.player1StatsContainer.style.display = "grid";
        })

        display.player1Stats.addEventListener('mouseleave', ()=>{
            display.player1StatsContainer.style.display = "none";
        })
        
        
        display.player2Stats.addEventListener('mouseenter', ()=>{
            display.player2StatsContainer.style.display = "grid";
        })

        display.player2Stats.addEventListener('mouseleave', ()=>{
            display.player2StatsContainer.style.display = "none";
        })



    }
    return { listenForCellEvents, listenForGameEvents };
}

const game = GameEngine(Gameboard, DisplayController);
game.listenForCellEvents();
game.listenForGameEvents();


