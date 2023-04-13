import { RepositoryInterface } from "./interface/RepositoryInterface.js";
import { Repository } from "./types/Repository.js";

import fs from 'fs';

export class BaseRepository implements RepositoryInterface, Repository {
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