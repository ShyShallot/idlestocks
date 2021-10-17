const {app, BrowserWindow } = require(`electron`);
const ipc = require('electron').ipcMain;
const path = require('path'); 
const fs = require('fs');
const library = require("./libraryfunctions");
const EventEmitter = require(`events`);
const { localStorage, sessionStorage } = require('electron-browser-storage');

function CreateWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    win.webContents.openDevTools();
    win.loadFile('./index.html');
    win.webContents.on(`did-finish-load`, async function(){
        var stocks = StockData();
        for(i=0;i<stocks.length;i++){
            localStorage.removeItem(stocks[i].name);
        }
        localStorage.removeItem('points');
        await library.sleep(500);
        win.show();
        ConvertLocalStorageToJson();
        Econ(win);
    });
}

app.whenReady().then(() => {
    CreateWindow();
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length === 0){
            CreateWindow();
        }
    })
})

app.on('window-all-closed', async () => {
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

async function Econ(window){
    await ConvertLocalStorageToJson();
    //await Stocks();
    setTimeout(Econ, 5000);
}

async function ConvertLocalStorageToJson(){
    var stocks = StockData();
    for(i=0;i<stocks.length;i++){
        curStock = stocks[i];
        newStockOwned = await localStorage.getItem(curStock.name);
        newStockOwned = parseInt(newStockOwned);
        console.log(newStockOwned);
        if(!isNaN(newStockOwned)){
            stocks[i].owned = newStockOwned;
        } else {
            continue;
        }
    }
    library.WriteToJson(stocks, './data/stocks.json');
    userData = UserData();
    console.log(userData.points);
    localStoragePoints = await localStorage.getItem('points');
    console.log(localStoragePoints);
    userData.points = parseInt(localStoragePoints);
    if(!isNaN(userData.points)){
        library.WriteToJson(userData, './data/userdata.json');
    }
}

function UserData(){
    raw = fs.readFileSync('./data/userdata.json');
    return JSON.parse(raw);
}

function StockData(){
    raw = fs.readFileSync('./data/stocks.json');
    return JSON.parse(raw);
}

async function Stocks(){
    console.log(`Running Stock Main Function`);
    var stocks = StockData();
    for(i=0;i<stocks.length;i++){
        var stock = stocks[i];
        let stockPrice = stock.price;
        console.log(`Running Stock Information for ${stock.name}`);
        priceChanges = [100, 150, 200, 250, 300, 350, 450, 500, 1000, 1500];
        priceMultipliers = [0.5, 0.6, 0.65, 0.75, 0.8, 0.85, 1, 1.15, 1.25, 1.5, 1.75, 2]; 
        priceChange = priceChanges[library.getRandomInt(priceChanges.length)];
        console.log(`Base Amount to change by: ${priceChange}`);
        priceMultiplier = priceMultipliers[library.getRandomInt(priceMultipliers.length)];
        console.log(`Price Multiplier: ${priceMultiplier}`);
        amountOwned = stock.owned;
        console.log(`Stocks Owned: ${amountOwned}`);
        ownedFactor = amountOwned / 2;
        console.log(`Owned Factor ${ownedFactor}`);
        if(ownedFactor < 1){
            console.log(`Owned Factor Less than 1, Capping`);
            ownedFactor = 0.95;
        }
        chance = Math.random();
        console.log(`Positive or Negative Chance: ${chance}`);
        pon = 1;
        newStockPrice = (stockPrice + priceChange * priceMultiplier * ownedFactor) * pon;
        if(chance >= 0.65){
            console.log(`Chance was negative`);
            pon = -1;
            newStockPrice = (stockPrice + (priceChange / 2) * (priceMultiplier / 2) * ownedFactor) * pon;
            console.log(`Updated Price After Negative: ${newStockPrice}`);
        }
        console.log(`New Stock Price ${newStockPrice}`);
        if(newStockPrice >= 150000){
            console.log(`Stock Reached Max, capping`);
            newStockPrice = 150000;
        }
        stocks[i].price = newStockPrice;
        stocks[i].lastprice = stockPrice;
        if(newStockPrice <= 0){
            console.log(`Stock ${stock.name} Crashed`);
            stocks.splice(i, 1);
        }
    }
    chance = Math.random();
    console.log(`Chance for creating a new Stock ${chance}`);
    if(chance >= 0.7){
        console.log(`Creating a New Stock`);
        await CreateNewStock();
    }
    library.WriteToJson(stocks, `./data/stocks.json`);
    await library.sleep(5000);
}

async function CreateNewStock(){
    stocks = StockData();
    availChars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    stockName = "";
    for(i=0;i<3;i++){
        stockName += availChars[library.getRandomInt(availChars.length)];
    }
    stockPrices = [250, 500, 1000, 2000, 2500, 3000];
    stockPrice = stockPrices[library.getRandomInt(stockPrices.length)];
    chance = Math.random();
    if(chance <= 0.5){
        lastStockPrice = stockPrice / 2;
    } else {
        lastStockPrice = stockPrice * 2;
    }
    newStock = {"name": stockName, "price": stockPrice, "lastprice": lastStockPrice, "owned": 0};
    console.log(newStock);
    stocks.push(newStock);
    console.log(stocks);
    library.WriteToJson(stocks, './data/stocks.json');
    return true;
}