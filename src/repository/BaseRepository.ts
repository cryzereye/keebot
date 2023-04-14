import { FileImporter } from "../util/FileImporter.js";

export class BaseRepository extends FileImporter {
    constructor(file: string) {
        super(file);
    }
}