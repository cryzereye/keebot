const fs = require('fs');
const fileName = '../json/state.json';
const osFile = './src/json/state.json';
let { state } = require(fileName);

exports.saveStateToFile = () => {
    let dataStr = { "state": state };
    try {
        fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err) {
            if (err) return console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
}

exports.updateState = (name, value) => {
    state[name] = value;
    this.saveStateToFile();
}