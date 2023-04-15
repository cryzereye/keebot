import { FileImporter } from "./FileImporter.js";

export class ConstantsImporter extends FileImporter {
    data: any;
    constructor() {
        super('src/globals/constants.json');
        this.data = this.load();
    }
}