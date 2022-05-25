const MAXROW = 30;
const MINROW = 9;
const MAXCOL = 30;
const MINCOL = 9;
const MAXMINE = 80;
const MINMINE = 10;

let ROW = 16;
let COL = 16;
let MINES = 40;

let clickCnt = 0;
let state = 0;
let timerFunc;
let isSettingSectionOpened = 0;
let isRecordOpened = 0;

function toggleRecord(){
    let elem = document.getElementById("recordPanel");
    let elem2 = document.getElementById("recordPanelBackground");

    if(isRecordOpened == 0){
        isRecordOpened = 1;
        elem.style.top = '5%';
        elem2.style.display = 'block';
    } else {
        isRecordOpened = 0;
        elem.style.top = '-50%';
        elem2.style.display = 'none';
    }
}

function toggleSettingSection(){
    let elem = document.getElementById("controlPanel");

    if(isSettingSectionOpened == 0){
        isSettingSectionOpened = 1;
        elem.style.height = "70px";
    } else {
        isSettingSectionOpened = 0;
        elem.style.height = "0px";
    }
}

function refreshStatus(){
    if(document.getElementById("mapTable") != null && document.getElementById("mapTable") != undefined){
        document.getElementById("whitepanel").style.bottom = "0%";
        document.getElementById("mapTable").remove();
    }

    clickCnt = 0;
    state = 0;

    clearInterval(timerFunc);
    document.getElementById("timer").innerHTML = "00:00:00";
    showRecordTime();

    makeMap();
    
}

function makeMap(){
    let line, cell;

    document.body.appendChild(document.createElement('table'));
    document.querySelector("table:last-child").id = "mapTable";

    for(let i = 1; i <= ROW; i++){
        line = document.createElement('tr');
        line.id = 'line' + i;

        document.querySelector("body table:last-child").appendChild(line);

        for(let j = 1; j <= COL; j++){
            cell = document.createElement('td');
            cell.id = 'c' + i + "-" + j;

            document.querySelector("body table tr:last-child").appendChild(cell);
        }
    
    }

    setMine(MINES);
    document.getElementById("mineLeft").innerHTML = MINES;
    mouseListner();

    setTimeout(function(){
        document.getElementById("whitepanel").style.bottom = "100%";
    }, 500)
}

function mouseListner() {

    for(let i = 1; i <= ROW; i++){
        for(let j = 1; j <= COL; j++){
            document.getElementById("c" + i + "-" + j).addEventListener("auxclick", function(){
                setFlag(i, j);
            })

            document.getElementById("c" + i + "-" + j).addEventListener("click", function(){
                mouseClick(i, j);
            })
        }
    }
}

function setMapInfo(type, inc){
    //type = row, col, mine
    //inc = 1 / -1
    let elem, val;

    switch(type){
        case 'row':
            elem = document.getElementById("rowSize");
            if((ROW >= MAXROW && inc > 0) || (ROW <= MINROW && inc < 0)){
                pushPopup("Row value range is " + MINROW + " ~ " + MAXROW, 1000);
                return 0;
            }
            ROW += inc;
            break;
        case 'col':
            elem = document.getElementById("colSize");
            if((COL >= MAXCOL && inc > 0) || (COL <= MINCOL && inc < 0)){
                pushPopup("Col value range is " + MINCOL + " ~ " + MAXCOL, 1000);
                return 0;
            }
            COL += inc;
            break;
        case 'mine':
            elem = document.getElementById("mineAmt");
            if((MINES >= MAXMINE && inc > 0) || (MINES <= MINMINE && inc < 0)){
                pushPopup("Mine amount value range is " + MINMINE + " ~ " + MAXMINE, 1000);
                return 0;
            }
            MINES += inc;
            break;
        default:
            alert("Error Occured!");
            console.log("[DEBUG] setMap() type error : " + type);
            return 0;
    }

    val = parseInt(elem.innerHTML);
    val = val + inc;
    elem.innerHTML = val;
}


function setMine(mineAmount){
    let randRow = 0;
    let randCol = 0;

    let targetElem;

    for(let i = 0; i < mineAmount; i++){
        randRow = getRandomInt(1, ROW);
        randCol = getRandomInt(1, COL);

        targetElem = document.getElementById("c" + randRow + "-" + randCol);
        //console.log("[DEBUG] row : " + randRow + " // col : " + randCol + " // i : " + i);
        if(targetElem.classList.contains("mine")){
            i--;
            continue;
        } else {
            targetElem.classList.add("mine");
        }
    }
}

function mouseClick(row, col){
    let elem = document.getElementById("c" + row + "-" + col);
    
    if(state == 1){
        return 0;
    }

    if(clickCnt == 0){
        setTimer(0);
    }

    clickCnt++;

    if(elem.classList.contains("flag") || elem.classList.contains("open")){
        return 0;
    } else if(elem.classList.contains("mine")){
        if(clickCnt != 1){
            gameOver();
            return 0;
        } else {
            elem.classList.remove("mine");
            setMine(1);
            openBlanks(row, col);
        }
    } else {
        openBlanks(row, col)
    }
}

function openBlanks(row, col){
    let elem;
    let elemSeek;
    let mineCnt = 0;

    elem = document.getElementById("c" + row + "-" + col);

    for(let i = row - 1; i <= row + 1; i++){
        for(let j = col - 1; j <= col + 1; j++){
            if(i < 1 || j < 1 || i > ROW || j > COL){
                continue;
            }

            elemSeek = document.getElementById("c" + i + "-" + j);

            //console.log("[DEBUG] elemSeek : c" + i + "-" + j);

            if(elemSeek.classList.contains("mine")){
                mineCnt += 1;
                continue;
            } else if(elemSeek.classList.contains("flag") || elemSeek.classList.contains("open")) {
                continue;
            }
        }
    }
    if(mineCnt == 0){
        elem.classList.add("open");
        seekBlanks(row, col);
    } else {
        elem.classList.add("open");
        elem.classList.add("boundary");
        elem.innerHTML = mineCnt;

        checkClear();
    }
}

function seekBlanks(row, col){
    let elemSeek;

    for(let i = row - 1; i <= row + 1; i++){
        for(let j = col - 1; j <= col + 1; j++){
            if(i < 1 || j < 1 || i > ROW || j > COL){
                continue;
            }

            elemSeek = document.getElementById("c" + i + "-" + j);

            if(!elemSeek.classList.contains("open") && !elemSeek.classList.contains("flag")){
                openBlanks(i, j);
            } else {
                continue;
            }
        }
    }
    checkClear();
}

function setFlag(row, col){
    let elem = document.getElementById("c" + row + "-" + col);
    let mineLeft = parseInt(document.getElementById("mineLeft").innerHTML);

    if(elem.classList.contains("open") || state == 1){
        return 0;
    }

    if(!elem.classList.contains("flag")){
        document.getElementById("mineLeft").innerHTML = --mineLeft;
        elem.classList.add('flag');
        elem.innerHTML = "<img src='media/flag.png'>";
    } else {
        document.getElementById("mineLeft").innerHTML = ++mineLeft;
        elem.classList.remove('flag');
        elem.innerHTML = "";
    }

}

function checkClear(){
    let openAmt = document.getElementsByClassName("open").length;
    let mapSize = ROW * COL;
    let mineAmt = MINES;

    if(openAmt == mapSize - mineAmt){
        clear();
    } else {
        return 0;
    }
}

function clear(){

    pushPopup("Game Clear!");
    state = 1;
    clearInterval(timerFunc);

    setRecordTime(ROW * COL, getTime());
}

function showRecordTime(){
    let size = ROW * COL;
    let arr = getRecordTime(size);
    let elem;

    document.getElementById("recordSize").innerHTML = size;

    if(arr == 0){
        document.getElementById("rec1").innerHTML = "Record not exist";
        return 0;
    }

    let h, m, s;

    for(let i = 0; i < arr.length; i++){
        elem = document.getElementById("rec" + (i + 1));
        h = parseInt(arr[i] / 3600);
        m = parseInt(arr[i] / 60);
        s = arr[i] % 60;

        if(h < 10) h = "0" + h;
        if(m < 10) m = "0" + m;
        if(s < 10) s = "0" + s;

        elem.innerHTML = "#" + (i + 1) + " - " + h + ":" + m + ":" + s;
    }
}


function setRecordTime(size, time){
    let arr = getRecordTime(size); //parsed JSON

    if(arr == 0){
        let newArr = [time];
        newArr = JSON.stringify(newArr);
        localStorage.setItem('recordTime' + size, newArr);
    } else {        
        let len = arr.length;
        for(let i = 0; i <= len; i++){
            if(i >= 10){ break; }

            if(time <= arr[i]){
                arr.splice(i, 0, time);
                break;
            } else {
                arr.push(time);
                break;
            }
        }

        while(arr[10] != undefined) {
            arr.pop();
        }

        arr = JSON.stringify(arr);
        localStorage.setItem('recordTime' + size, arr);
    }
}


function getRecordTime(size){
    let res;
    res = localStorage.getItem('recordTime' + size);
    res = JSON.parse(res);

    if(res != null){
        return res;
    } else {
        return 0;
    }
}

function gameOver(){
    let elem;

    state = 1;

    clearInterval(timerFunc);

    pushPopup("Game Over!");

    for(let i = 1; i <= ROW; i++){
        for(let j = 1; j <= COL; j++){
            elem = document.getElementById("c" + i + "-" + j);
            if(elem.classList.contains("open")){
                if(elem.classList.contains("boundary")){
                    elem.innerHTML = "";
                }
                continue;
            } else if(elem.classList.contains("mine")){
                if(elem.classList.contains("flag")){
                    elem.classList.remove("flag");
                }
                elem.classList.add("mineopen");
                elem.innerHTML = "<img src='media/mine.png'>";
            } else {
                elem.classList.add("open");
            }
        }
    }
}

window.onload = function(){
    makeMap();
    showRecordTime();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

function pushPopup(text, time = 3000){
    let elem = document.getElementById("popup");
    let elem_back = document.getElementById("popup-back");

    if(elem.style.opacity == 1){ return 0; }

    elem.style.opacity = 1;
    elem_back.style.opacity = 0.5;
    elem.innerHTML = "" + text + "";

    setTimeout(function(){
        elem.style.opacity = 0;
        elem_back.style.opacity = 0;
    }, time);
}

function setTimer(f){
    let sec = 0;
    let min = 0;
    let hour = 0;
    let timer = document.getElementById("timer");

    timerFunc = setInterval(function(){

        sec++;

        if(sec == 60){
            min++;
            sec = 0;
        }
        if(min == 60){
            hour++;
            min = 0;
        }

        timer.innerHTML = ((hour < 10) ? "0" + hour : hour) + ":" + ((min < 10) ? "0" + min : min) + ":" + ((sec < 10) ? "0" + sec : sec);

    }, 1000)

}

function getTime(){
    let elem = document.getElementById("timer").innerHTML;
    let hour = parseInt(elem.charAt(0) + elem.charAt(1));
    let min = parseInt(elem.charAt(3) + elem.charAt(4));
    let sec = parseInt(elem.charAt(6) + elem.charAt(7));
    let res;

    res = (hour * 60 * 60) + (min * 60) + sec;

    return res;
}