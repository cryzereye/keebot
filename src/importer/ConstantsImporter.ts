import * as jsondata from '../globals/commands.json' assert { type: "json" };
import { FileImporter } from "./FileImporter.js";

export class ConstantsImporter extends FileImporter {
    data: any;
    constructor() {
        super('src/globals/constants.json');
        this.data = jsondata.default;
    }
}