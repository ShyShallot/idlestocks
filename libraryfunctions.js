const fs = require('fs'); // File System for JS
/**
 * Gets the digit length of any positive or negative number
 * @param {number} x Any Number 
 * @returns {number} Number of digits in a number, like 50000 would return 5
 */
function numDigits(x) { // taken from https://stackoverflow.com/a/28203456 god bless
    return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1; 
}
/**
 * Returns a random whole intiger from 0 to max number
 * @param {number} max Max Number to go to
 * @returns {number} Randomly Generated Number
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Writes JS Object data to a JSON File
 * @param {Object} rawdata An Array Object
 * @param {string} location Location of a file ex: ./poop.json
 * @returns {boolean}  True if successful and vice versa
 */
function WriteToJson(rawdata, location) {
    var final = JSON.stringify(rawdata);
    fs.writeFileSync(location, final, function(err){
        if(err){
          return console.log(err);
        }
        console.log("The File was saved");
        return true;
    });
}
/**
 * 
 * @param {number} num Number to commafy
 * @returns {String} returns a string of the commafied number
 */

function commafy( num ) { // taken from https://stackoverflow.com/a/6786040
    var str = num.toString().split('.');
    if (str[0].length >= 3) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 3) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return str.join('.');
}

/**
 * 
 * @param {number} ms 
 * @returns {Promise} Waits for set timeout in MS to be done
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 
 * @param {number} milliseconds 
 * @returns {number} day, hour, minute, or seconds
 */
function convertMS( milliseconds ) { // from: https://gist.github.com/Erichain/6d2c2bf16fe01edfcffa
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return {
        day: day,
        hour: hour,
        minute: minute,
        seconds: seconds
    };
}

function addHours(date, hours) {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

module.exports = {numDigits, getRandomInt, WriteToJson, sleep, commafy, convertMS, addHours};