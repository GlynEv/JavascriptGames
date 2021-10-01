const gameTableHTML = document.getElementById("game-table");
const modeSelect = document.getElementById("mode-setting");
const newCellClassName = "new-cell";
const cellIDName = "game-cell-id-";
const flagClassName = "cell-flag";

const setupGame = () => {

    CONFIG.currentMode = modeSelect.value;
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
    gameTableHTML.innerHTML = "";
    let i, row, col, cellID, bombsAroundCell, cellSpan, cellContent;
    for(i = 0; i < gameSize.rows; i++) {
        row = gameTableHTML.insertRow(i);

        for(j = 1; j <= gameSize.cols; j++) {
            col = row.insertCell(j-1);
            col.classList.add(newCellClassName);
            col.setAttribute("row", i);
            col.setAttribute("col", j);

            cellID = makeCellID(i, j);
            col.id = cellIDName + cellID;

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
                col.setAttribute("bombsAroundCell", bombsAroundCell);
            }

            cellSpan = document.createElement("span");
            cellSpan.classList.add("cell-content");
            cellSpan.innerHTML = cellContent;

            col.appendChild(cellSpan);
        }
    }

    CONFIG.gamePlayable = true;
    setBombsRemaining();
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

const newCellClicked = (cell, isRightBtn) => {
    const row = parseInt(cell.getAttribute("row"), 0xa),
        col = parseInt(cell.getAttribute("col"), 0xa),
        hasBomb = parseInt(cell.getAttribute("hasBomb"), 0xa) == 1,
        bombsAroundCell = parseInt(cell.getAttribute("bombsAroundCell"), 0xa);
    
    //Right Click (mark as bomb - Flag)
    if(isRightBtn == true) {

        const markedAsBomb = parseInt(cell.getAttribute("markedAsBomb"), 0xa) == 1;
        
        cell.setAttribute("markedAsBomb", markedAsBomb ? 0 : 1)

        if(markedAsBomb){
            cell
            //Unmarked flag
            const removeFlagImage = cell.getElementsByClassName(flagClassName);
            cell.removeChild(removeFlagImage[0]); 
        } else {
            //Add flag
            const flagImage = document.createElement("img");
            flagImage.setAttribute("src", "images/flag.png");
            flagImage.setAttribute("width", "100%");
            flagImage.setAttribute("height", "100%");
            flagImage.setAttribute("alt", "flag");
            flagImage.classList.add(flagClassName);
            cell.appendChild(flagImage);
        }
        setBombsRemaining();
        

        return;
    }

    //Lose game
    if(hasBomb){
        alert("DEAD");


        //Show all bombs
        let cell,bombImage;
        CONFIG.bombLocations.map(cellID => {
            cell = document.getElementById(cellIDName + cellID);
            bombImage = document.createElement("img");
            bombImage.setAttribute("src", "images/bomb.png");
            bombImage.setAttribute("width", "100%");
            bombImage.setAttribute("height", "100%");
            bombImage.setAttribute("alt", "bomb");
            bombImage.classList.add(flagClassName);
            cell.innerHTML = "";
            cell.appendChild(bombImage);
        })
        CONFIG.gamePlayable = false;
        return;
    }

    //Show Content
    cell.classList.remove(newCellClassName);

    //If blank cell
    if(bombsAroundCell == 0){
        //Click around each square
        let cellToClick;

        getCellIDsAround(row, col).map(aroundCellID => {

            //Click on cell
            cellToClick = document.getElementById(cellIDName + aroundCellID);
            if (cellToClick && cellToClick.matches("." + newCellClassName)) 
            newCellClicked(cellToClick);
        })
    }



}

const setBombsRemaining = () => {
    const totalGameBombs = CONFIG.bombLocations.length,
    currentMarkedBombCount = document.getElementsByClassName(flagClassName).length,
    remaining = totalGameBombs - currentMarkedBombCount;

    document.getElementById("game-bombs-remaining").innerHTML = remaining;
}

(() =>{

    //Build Select Options
    let option;
    Object.keys(CONFIG.mode).forEach(modeKey => {
        option = document.createElement("option");
        option.value = modeKey;
        option.text = CONFIG.mode[modeKey].name;
        modeSelect.add(option);
    })

    setupGame();

    //Listen for clicks on game table
    gameTableHTML.onmousedown = e => {
        e = e || window.event;
 
        if(!CONFIG.gamePlayable) return;

        let target = e.target, 
            isRightBtn, 
            unmarkFlag;
        
        if("which" in e) {
            //Gecko (Firefox), Webkit (Safari/Chrome) & Opera
            isRightBtn = e.which == 3;
        } else if("button" in e) {
            //IE, Opera
            isRightBtn = e.button == 2;
        }

        //Right click on flag
        unmarkFlag = target.matches("." + flagClassName) && isRightBtn
        if(unmarkFlag) target = target.parentNode;

        //Clicked on cell
        if(target.matches("." + newCellClassName) || unmarkFlag) {
            //Process Clicked Cell
            newCellClicked(target, isRightBtn);
        }
    };

    //Right click for bomb mark
    gameTableHTML.oncontextmenu = () => {
        return false;
    }


})();