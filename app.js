const gameTableHTML = document.getElementById("game-table");

const setupGame = () => {

    const currentMode = CONFIG.currentMode,
        gameMode = CONFIG.mode[currentMode];
        gameSize = gameMode.size;
    //BuildRows
    let i, row, col;
    for(i = 0; i < gameSize.rows; i++) {
        row = gameTableHTML.insertRow(i);

        for(j = 1; j <= gameSize.cols; j++) {
            col = row.insertCell(j-1);

            col.innerHTML = i * 10 + j;
        }
    }
};

(() =>{
    setupGame();
})()