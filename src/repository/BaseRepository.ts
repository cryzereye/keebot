import { FileImporter } from "../importer/FileImporter.js";

export class BaseRepository extends FileImporter {
    constructor(file: string) {
        super(file);
    }
}