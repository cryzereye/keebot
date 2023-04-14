import { FileImporter } from "../util/FileImporter.js";

export class ConfigImporter extends FileImporter {
    data: any;
    constructor() {
        super(`../../json/config.json`);
        this.data = this.load();
    }
}