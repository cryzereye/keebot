import { FileImporter } from "../util/FileImporter.js";

export class CommandsImporter extends FileImporter {
    data: any;
    constructor() {
        super('commands.json');
        this.data = this.load();
    }
}