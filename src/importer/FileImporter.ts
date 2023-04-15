import fs from 'fs';
import { FileImporterInterface } from '../util/interface/FileImporterInterface.js';

export class FileImporter implements FileImporterInterface {
    file: string;

    constructor(file: string) {
        this.file = file;
    }

    save(data: string): void {
        const jsonData = JSON.stringify(data);
        fs.writeFileSync(this.file, jsonData, 'utf-8');
    }

    load() {
        const jsonData = fs.readFileSync(this.file, 'utf-8');
        return JSON.parse(jsonData);
    }
}