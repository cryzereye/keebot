const fs = require('fs');
const fileName = '../../json/state.json';
const osFile = './json/state.json';
let { state } = require(fileName);

export function saveStateToFile(): void {
    let dataStr = { "state": state };
    try {
        fs.writeFile(osFile, JSON.stringify(dataStr), function writeJSON(err: string) {
            if (err) return console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
}

export function updateState(name: string, value: string): void {
    state[name] = value;
    saveStateToFile();
}