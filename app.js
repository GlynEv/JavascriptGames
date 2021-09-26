const gameTableHTML = document.getElementById("game-table");

const setupGame = () => {

    const gameMode = getCurrentGameMode(),
        gameSize = gameMode.size;

    //Generate Bomb Locations
    const bombCells = [];
    let cellBombID;

    while(bombCells.length < gameMode.bombs) {
        cellBombID = Math.floor(Math.random() * (gameSize.rows * gameSize.cols)) + 1;
        if(bombCells.indexOf(cellBombID) == -1) bombCells.push(cellBombID);
    }

    CONFIG.bombLocations = bombCells;

    //BuildRows
    let i, row, col, cellID, bombsAroundCell;
    for(i = 0; i < gameSize.rows; i++) {
        row = gameTableHTML.insertRow(i);

        for(j = 1; j <= gameSize.cols; j++) {
            col = row.insertCell(j-1);

            cellID = makeCellID(i, j);

            if(bombCells.indexOf(cellID) > -1){
                col.innerHTML = "X";
            } else {
                bombsAroundCell = 0;
                getCellIDsAround(i, j).map(aroundCellID => {
                    if(bombCells.indexOf(aroundCellID) > -1) bombsAroundCell++;
                })

                if(bombsAroundCell) col.innerHTML = bombsAroundCell;

            }

        }
    }
};

const getCellIDsAround = (row,col) => {

    //Loop Rows and Cols around
    const gameMode = getCurrentGameMode(), 
    aroundCellIDs = [];

    let i, j, newCellID;
    for(i = row - 1; i < row + 2; i++){
        for(j = col - 1; j < col + 2; j++){
            newCellID = makeCellID(i, j);
            if(1 >= 0 && i < gameMode.size.rows && j > 0 && j <= gameMode.size.cols && makeCellID(row, col) != newCellID) 
                aroundCellIDs.push(newCellID);
        }
    }

    return aroundCellIDs;

}

const makeCellID = (row, col) => {
    gameMode = getCurrentGameMode();
    return row * gameMode.size.cols + col;
}

const getCurrentGameMode = () => {
    return CONFIG.mode[CONFIG.currentMode];
}

(() =>{
    setupGame();
})()