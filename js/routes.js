async function testData(stageID){
    await fetchStageJSON(stageID);
    loadmap(masterValues.mapID);
    loadtiles();
    loadroutes();
    loadrouteselect();
    showRoutes();
}

async function fetchStageJSON(stageID) {
    const layoutResponse = await fetch("../json/layout/layout_"+stageID.toString()+".json")
        .catch((error) => 
               console.error("Unable to fetch data:", error));
    const layoutData = await layoutResponse.json();
    const locationsResponse = await fetch("../json/locations/locations_"+stageID.toString()+".json")
        .catch((error) => 
               console.error("Unable to fetch data:", error));
    const locationsData = await locationsResponse.json();
    const entriesResponse = await fetch("../json/entries/entries_"+stageID.toString()+".json")
        .catch((error) => 
               console.error("Unable to fetch data:", error));
    const entriesData = await entriesResponse.json();
    const routesResponse = await fetch("../json/routes/routes_"+stageID.toString()+".json")
        .catch((error) => 
               console.error("Unable to fetch data:", error));
    const routesData = await routesResponse.json();
    masterValues.stageID = stageID;
    masterValues.mapID = layoutData["m_groundId"];
    masterValues.mapScale = layoutData["m_mapSize"] === 3 ? 1.875 : 1.25;
    masterValues.tileScale = layoutData["m_mapSize"] === 3 ? 2 : 1.3333333;
    masterValues.tileData = locationsData["m_summonPoints"];
    masterValues.coreData = locationsData["m_corePos"];
    masterValues.entryData = entriesData["m_entries"];
    masterValues.routeData = routesData["m_routes"];
    masterValues.routeView = [];
    console.log(masterValues);
}

async function fetchEnemyJSON(enemyID) {
    const enemyResponse = await fetch("../json/enemydata/"+enemyID.toString()+".json")
        .catch((error) => 
               console.error("Unable to fetch data:", error));
    const enemyData = await enemyResponse.json();
    //console.log(enemyData);
    return enemyData;
}

async function fetchMasterJSON() {
    const masterResponse = await fetch("../json/quest_data.json")
        .catch((error) => 
               console.error("Unable to fetch data:", error));
    const masterData = await masterResponse.json();
    //console.log(masterData);
    let questList = {};
    for (quest of masterData["table"]){
        questList[quest['id']] = {"name":quest['name']}
    }
    //console.log(questList);
    masterValues.masterQuestList = questList;
}

function loadmap(mapID){
    const mapImg = new Image();
    mapImg.addEventListener("load", () => {
        //https://jsfiddle.net/ufjm50p9/2/
        const mapCanvas = document.getElementById("map-img");
        mapCanvas.width = mapImg.width * window.devicePixelRatio;
        mapCanvas.height = mapImg.height * window.devicePixelRatio;
        const mapContext = mapCanvas.getContext('2d',{antialias: false});
        mapContext.mozImageSmoothingEnabled = false;
        mapContext.webkitImageSmoothingEnabled = false;
        mapContext.msImageSmoothingEnabled = false;
        mapContext.imageSmoothingEnabled = false;
        mapContext.drawImage(mapImg, 0, 0, mapImg.width*window.devicePixelRatio,mapImg.height*window.devicePixelRatio);
    });
    mapImg.src = "../img/maps/ground_"+mapID.toString()+".png";
}

function loadtiles(){
    const tileCanvas = document.getElementById("tile-img");
    const tileContext = tileCanvas.getContext('2d',{antialias: false});
    tileCanvas.width = 1024 * window.devicePixelRatio;
    tileCanvas.height = 576 * window.devicePixelRatio;
    const tileW = 102*window.devicePixelRatio/masterValues.tileScale;
    const tileH = 60*window.devicePixelRatio/masterValues.tileScale;
    const coreW = 141*window.devicePixelRatio/masterValues.tileScale;
    const coreH = 90*window.devicePixelRatio/masterValues.tileScale;
    for (let tile of masterValues.tileData){
        const tileImg = new Image();
        tileImg.addEventListener("load", () => {
            //https://jsfiddle.net/ufjm50p9/2/
            tileContext.mozImageSmoothingEnabled = false;
            tileContext.webkitImageSmoothingEnabled = false;
            tileContext.msImageSmoothingEnabled = false;
            tileContext.imageSmoothingEnabled = false;
            const dx = (tile['m_point']['m_pos']['x'])/masterValues.mapScale*window.devicePixelRatio - tileW/2;
            const dy = (tile['m_point']['m_pos']['y'])/masterValues.mapScale*window.devicePixelRatio - tileH/2;
            tileContext.drawImage(tileImg, dx, dy, tileW, tileH);
        });
        try {
            tileImg.src = "../img/tiles/tile_"+(tile['m_summonType'].toString())+(tile['m_atterIds'][0].toString())+".png";
        } catch (error) {
            tileImg.src = "../img/tiles/tile_"+(tile['m_summonType'].toString())+"1.png";
        }
    }
    for (let tile of masterValues.coreData){
        const tileImg = new Image();
        tileImg.addEventListener("load", () => {
            //https://jsfiddle.net/ufjm50p9/2/
            tileContext.mozImageSmoothingEnabled = false;
            tileContext.webkitImageSmoothingEnabled = false;
            tileContext.msImageSmoothingEnabled = false;
            tileContext.imageSmoothingEnabled = false;
            const dx = (tile['x'])/masterValues.mapScale*window.devicePixelRatio - coreW/2;
            const dy = (tile['y'])/masterValues.mapScale*window.devicePixelRatio - coreH/2;
            tileContext.drawImage(tileImg, dx, dy, coreW, coreH);
        });
        tileImg.src = "../img/tiles/tile_core.png";
    }
}

function loadroutes(){
    let timeFrame = document.getElementById("time-input").value; // not needed?
    //clear all route canvases//
    const routeDiv = document.getElementById("route-img");
    while (routeDiv.hasChildNodes()) {
        routeDiv.removeChild(routeDiv.firstChild);
    }
    //start looping each route
    for (route of masterValues.routeData){
        const newCanvas = document.createElement("canvas");
        newCanvas.id = "route-" + route["m_routeId"].toString();
        newCanvas.className = "middle-panel-canvas route-canvas";
        newCanvas.width = 1024 * window.devicePixelRatio;
        newCanvas.height = 576 * window.devicePixelRatio;
        document.getElementById("route-img").appendChild(newCanvas);
        const data = {
            "datasets": [{
                "data":[],
                "backgroundColor": 'rgb(0,255,0,0)',
                "borderColor": 'rgb(0,255,0,1)',
                "showLine": true
            }],
        };
        for (each of route["m_points"]){
            data["datasets"][0]["data"].push(
                {
                    "x": each["m_pos"]["x"]* window.devicePixelRatio/masterValues.mapScale,
                    "y": -1 * each["m_pos"]["y"]* window.devicePixelRatio/masterValues.mapScale
                }
            );
        }
        const config = {
            type: 'scatter',
            data: data,
            options: {
                animation: {
                    duration: 1
                },
                plugins: {
                    legend:{
                        display: false
                    },
                },
                scales: {
                    x: {
                        display: false,
                        min: 0,
                        max: 1024 * window.devicePixelRatio
                    },
                    y: {
                        display: false,
                        max: 0,
                        min: -576 * window.devicePixelRatio
                    }
                }
            }
        };
        new Chart(newCanvas, config);
    }
}

async function loadrouteselect(){
    const enemySelectTable = document.getElementById("enemy-select-table");
    while (enemySelectTable.hasChildNodes()) {
        enemySelectTable.removeChild(enemySelectTable.firstChild);
    }
    for (entryIndex in masterValues.entryData){
        for (deployment of masterValues.entryData[entryIndex]["m_deploy"]["m_deployments"]){
            const newTR = document.createElement("tr");
            const newTDimg = document.createElement("td");
            newTDimg.className = "enemy-select-image";
            const newTDcheck = document.createElement("td");
            const enemydata = await fetchEnemyJSON(deployment["m_appId"]);
            const enemyImg = document.createElement("img");
            newTDimg.appendChild(enemyImg);
            enemyImg.src = "../img/enemy_icons/icon_"+enemydata['resource'].toString()+"_0_s.png";
            let enemyname = enemydata["charaName"];
            if (enemyname.includes("用")){
                continue;
            } else {
                newTDcheck.innerHTML = enemydata["charaName"];
            }
            newTDcheck.id = entryIndex.toString() + "-" + deployment['m_deployId'].toString() + "-" + deployment["m_appId"]+ "-" + deployment["m_routeId"];
            newTDcheck.className = "enemy-select-check"; //+ "route-"+ deployment['m_routeId'] +"-view";
            newTDcheck.addEventListener("click",selectEnemy);
            newTR.appendChild(newTDimg);
            newTR.appendChild(newTDcheck);
            enemySelectTable.appendChild(newTR);
        }
    }
}

function selectEnemy(){
    //let reference = this.className.split(" ")[1].split("-view")[0];
    let reference = this.id;
    let tdElem = document.getElementById(this.id);
    if (tdElem.classList.contains("selected")){
        tdElem.className = tdElem.className.replace(" selected","");
    } else {tdElem.className += " selected";}
    //alert(reference);
    if (masterValues.routeView.includes(reference)){
        masterValues.routeView = masterValues.routeView.filter(item => item !== reference);
    }
    else {
        masterValues.routeView.push(reference);
    }
    console.log(masterValues.routeView);
    showRoutes();
}

function showRoutes(){
    let routeCanvases = document.getElementById("route-img").childNodes;
    for (let i=0; i < routeCanvases.length; i++) {
        routeCanvases[i].style.display = "none";
    }
    for (route of masterValues.routeView){
        document.getElementById("route-"+route.split('-')[3]).style.display = "block";
    }
}

function hideAllRoutes(){
    let routeCanvases = document.getElementById("route-img").childNodes;
    for (let i=0; i < routeCanvases.length; i++) {
        routeCanvases[i].style.display = "none";
    }
    let enemyChecks = document.getElementsByClassName("enemy-select-check");
    for(let i = 0; i < enemyChecks.length; i++){
        try {
            if (enemyChecks[i].classList.contains("selected")){
                enemyChecks[i].className = enemyChecks[i].className.replace(" selected","");
            }
        } catch (error) {
            console.log(i);
        }
    }
    masterValues.routeView = [];
}
function showAllRoutes(){
    let routeCanvases = document.getElementById("route-img").childNodes;
    for (let i=0; i < routeCanvases.length; i++) {
        routeCanvases[i].style.display = "block";
    }
    let enemyChecks = document.getElementsByClassName("enemy-select-check");
    for(let i = 0; i < enemyChecks.length; i++){
        try {
            if (enemyChecks[i].classList.contains("selected")){
                enemyChecks[i].className = enemyChecks[i].className.replace(" selected","");
            }
        } catch (error) {
            console.log(i);
        }
    }
    masterValues.routeView = [];
}


function selectQuestType(selection){
    console.log(selection);
    
}