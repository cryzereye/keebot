import { FileImporter } from "../util/FileImporter.js";

export class ConstantsImporter extends FileImporter {
    data: any;
    constructor() {
        super('constants.json');
        this.data = this.load();
    }
}