const gameTableHTML = document.getElementById("game-table");
const newCellClassName = "new-cell";

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
    let i, row, col, cellID, bombsAroundCell, cellSpan, cellContent;
    for(i = 0; i < gameSize.rows; i++) {
        row = gameTableHTML.insertRow(i);

        for(j = 1; j <= gameSize.cols; j++) {
            col = row.insertCell(j-1);
            col.classList.add(newCellClassName);
            col.setAttribute("row", i);
            col.setAttribute("col", j);

            cellID = makeCellID(i, j);

            cellContent = "";
            if(bombCells.indexOf(cellID) > -1){
                cellContent = "X";
                col.setAttribute("hasBomb", 1);
            } else {
                bombsAroundCell = 0;
                getCellIDsAround(i, j).map(aroundCellID => {
                    if(bombCells.indexOf(aroundCellID) > -1) bombsAroundCell++;
                })

                if(bombsAroundCell) cellContent = bombsAroundCell;

            }

            cellSpan = document.createElement("span");
            cellSpan.classList.add("cell-content");
            cellSpan.innerHTML = cellContent;

            col.appendChild(cellSpan);
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

const newCellClicked = cell => {
    const row = parseInt(cell.getAttribute("row"), 0xa),
        col = parseInt(cell.getAttribute("col"), 0xa),
        hasBomb = parseInt(cell.getAttribute("hasBomb"), 0xa) == 1;
    
    if(hasBomb){
        alert("DEAD");
        return;
    }

    //Show Content
    cell.classList.remove(newCellClassName);

}

(() =>{
    setupGame();

    //Listen for clicks on game table
    gameTableHTML.onmousedown = e => {
        e = e || window.event;

        const target = e.target;
        
        //Clicked on cell
        if(target.matches("." + newCellClassName)) {
            //Process Clicked Cell
            newCellClicked(target);
        }
    }
})()