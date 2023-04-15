import * as jsondata from '../globals/commands.json' assert { type: "json" };
import { FileImporter } from "./FileImporter.js";

export class CommandsImporter extends FileImporter {
    data: any;
    constructor() {
        super('src/globals/commands.json');
        this.data = jsondata.default;
    }
}