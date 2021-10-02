const gameTableHTML = document.getElementById("game-table");
const modeSelect = document.getElementById("mode-setting");
const newCellClassName = "new-cell";
const cellIDName = "game-cell-id-";
const flagClassName = "cell-flag";

const setupGame = () => {

    CONFIG.currentMode = modeSelect.value;
    const gameMode = getCurrentGameMode(),
        gameModeBombs = gameMode.bombs,
        gameSize = gameMode.size, 
        gameSizeRows = gameSize.rows, 
        gameSizeCols = gameSize.cols;

    //Generate Bomb Locations
    const bombCells = [];
    let cellBombID, maxLoops = 10000;

    while(bombCells.length < gameModeBombs && maxLoops > 0) {
        cellBombID = Math.floor(Math.random() * (gameSizeRows * gameSizeCols)) + 1;
        if(bombCells.indexOf(cellBombID) == -1) bombCells.push(cellBombID);
        maxLoops--;
    }
    CONFIG.bombLocations = bombCells;

    //BuildRows
    gameTableHTML.innerHTML = "";
    let i, row, col, cellID, bombsAroundCell, cellSpan, cellContent;

    for(i = 0; i < gameSizeRows; i++) {
        row = gameTableHTML.insertRow(i);

        for(j = 1; j <= gameSizeCols; j++) {
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
    timerControl("start");
};

const getCellIDsAround = (row,col) => {

    //Loop Rows and Cols around
    const gameMode = getCurrentGameMode(), 
        gameModeRows = gameMode.size.rows,
        gameModeCols = gameMode.size.cols,
        maxRows = row + 2,
        maxCols = col + 2,
        aroundCellIDs = [];

    let i, j, newCellID;
    for(i = row - 1; i < maxRows; i++){
        for(j = col - 1; j < maxCols; j++){
            newCellID = makeCellID(i, j);
            if(1 >= 0 && i < gameModeRows && j > 0 && j <= gameModeCols && makeCellID(row, col) != newCellID) 
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
            cell.setAttribute("hasFlag", 1);
        }
        setBombsRemaining();
    } else {
        //Lose game
        if(hasBomb){
            timerControl(); //Stop timer
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
                cell.setAttribute("hasFlag", 0);
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
                if (cellToClick && cellToClick.matches("." + newCellClassName) && parseInt(cellToClick.getAttribute("hasFlag"), 0xa) != 1)
                newCellClicked(cellToClick);
            })
        }
    }

    // Win Game Check
    const bombLocations = CONFIG.bombLocations,
        currentMarkedBombsIDs = currentMarkedBombs();
        unclickCells = gameTableHTML.getElementsByClassName(newCellClassName).length - gameTableHTML.getElementsByClassName(flagClassName).length;
    
    if(unclickCells === 0 && bombLocations.length === currentMarkedBombsIDs.length){
        // Validate marked bombs
        let foundBombsCorrect = 0;
        currentMarkedBombsIDs.map(cellID => {
            if(bombLocations.indexOf(cellID) > -1) foundBombsCorrect++;
        })
        if(foundBombsCorrect === bombLocations.length){
            //Game Won
            alert ("GAME WON");
            timerControl(); // Stop timer
            CONFIG.gamePlayable = false;
        }
    }
  
}

const currentMarkedBombs = () => {
    const currentMarkedCells = gameTableHTML.getElementsByClassName(flagClassName),
        totalMarkedCells = currentMarkedCells.length;

    let i, cell, currentMarkedIds = [];
    for(i = 0; i < totalMarkedCells; i++) {
        cell = currentMarkedCells[i].parentNode;
        currentMarkedIds.push(
            makeCellID(
                parseInt(cell.getAttribute("row"), 0xa),
                parseInt(cell.getAttribute("col"), 0xa)
            )
        );
    }

    return currentMarkedIds;
}

const setBombsRemaining = () => {
    document.getElementById("game-bombs-remaining").innerHTML = CONFIG.bombLocations.length - currentMarkedBombs().length;
}

const timerHTML = document.getElementById("game-timer");
let timerInterval
const timerControl = action => {  
    clearInterval(timerInterval);
    timerTime = 0;
    if(action == "start"){
        //Start Timer 
        timerInterval = setInterval(() =>{
            timerTime++;
            timerHTML.innerHTML = timerTime;
        }, 1000)
    
    }

};

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