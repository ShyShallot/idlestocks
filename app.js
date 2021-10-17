const {app, BrowserWindow, ipcMain, dialog } = require(`electron`);
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
        win.show();
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
    await Stocks();
    setTimeout(Econ, 5000);
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

ipcMain.on('synchronous-message', (event, args) => {
    // always have the first arg be the name of the stock and the second to buy or sell and the last being the amount
    console.log(args);
    amountTo = args[2];
    amountTo = parseInt(amountTo);
    if(isNaN(amountTo)){
        dialog.showMessageBoxSync({
            message: `You have provided an invalid number`,
            type: 'error',
            title: 'ERROR C#1'
        });
        return;
    }
    if(args[1] == 'buy'){
        BuyStock(args[0], amountTo);
    } else if(args[1] == 'sell'){
        SellStock(args[0], amountTo)
    } else {
        dialog.showMessageBoxSync({
            message: `This is a Developer Error, invalid/unrecognized command!`,
            type: 'error',
            title: 'ERROR C#4'
        });
        return;
    }
});

function BuyStock(name, amountToBuy){
    stockData = StockData();
    userData = UserData();
    for(i=0;i<stockData.length;i++){
        curStock = stockData[i];
        if(curStock.name == name){
            priceOfAll = curStock.price * amountToBuy;
            if(priceOfAll <= userData.points){
                stockData[i].owned += amountToBuy;
                userData.points -= priceOfAll;
                library.WriteToJson(stockData, './data/stocks.json');
                library.WriteToJson(userData, './data/userdata.json');
                console.log(`Done`);
            } else {
                dialog.showMessageBoxSync({
                    message: `You Do not have enough points for this request.`,
                    type: 'error',
                    title: 'ERROR C#2'
                });
                return;
            }
        }
    }
}

function SellStock(name, amountToSell){
    stockData = StockData();
    userData = UserData();
    for(i=0;i<stockData.length;i++){
        curStock = stockData[i];
        if(curStock.name == name){
            priceOfAll = curStock.price * amountToSell;
            if(curStock.owned >= amountToSell){
                stockData[i].owned -= amountToSell;
                userData.points += priceOfAll;
                library.WriteToJson(stockData, './data/stocks.json');
                library.WriteToJson(userData, './data/userdata.json');
                console.log(`Done`);
            } else {
                dialog.showMessageBoxSync({
                    message: `You Do not have enough stocks for this request.`,
                    type: 'error',
                    title: 'ERROR C#3'
                });
                return;
            }
        }
    }
}