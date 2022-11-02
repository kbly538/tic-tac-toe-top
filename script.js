const Gameboard = (function(){
    // CELL ARRAY
    let _gridRows = 3;
    let _gridCols = 3;
    let _grid = ['X', 'O', 'X', 'X', 'X', 'O', 'X', 'X', 'X'];

    const getGrid = ()=> _grid.slice();
    const setGrid = (grid)=> _grid = grid;
    const getRows = ()=> _gridRows;
    const getCols = ()=> _gridCols;
    const getGridInfo = function(){
        return {rows:_gridRows, cols:_gridCols, grid:_grid.slice()}
    };

    return {getGrid, setGrid, getRows, getCols, getGridInfo};
})();

const DisplayController = (function(doc){

    const updateGameboard = () => {

        let currentGrid = Gameboard.getGrid();
        let currentCell;

        if (!!doc && 'querySelector' in doc){
            for (let row = 0; row < Gameboard.getRows(); row++) {
                for (let col = 0; col < Gameboard.getCols(); col++) {
                    currentCell = doc.getElementById(`${row}${col}`)
                    currentCell.textContent = currentGrid[row * 3 + col];
                    
                }
                
            }
        }
    }

    return {updateGameboard}
})(document);






DisplayController.updateGameboard();






function PlayerFactory(name){
    let score = 0;
    return {name, score};
}