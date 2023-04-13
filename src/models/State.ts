import fs from 'fs';
import { state } from '../../json/state.json';
const osFile = './json/state.json';

export function saveStateToFile(): void {
    const dataStr = { "state": state };
    try {
        fs.writeFile(osFile, JSON.stringify(dataStr), (err) => {
            if (err)
                return console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
}

export function next_backup_timedate(value: string): void {
    state.next_backup_timedate = value;
    saveStateToFile();
}
