import { CommandsImporter } from "../importer/CommandsImporter.js";
import { ConstantsImporter } from "../importer/ConstantsImporter.js";
import { ProcessorInterface } from "./interface/ProcessorInterface.js";

export class BaseProcessor implements ProcessorInterface {
    commands: CommandsImporter;
    constants: ConstantsImporter;

    constructor() {
        this.commands = new CommandsImporter();
        this.constants = new ConstantsImporter();
    }

    process(): void {
        return;
    }
}