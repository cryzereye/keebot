import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { ServerConfig } from "../service/ServerConfig";

export class ServerConfigValidator implements BaseConfigValidator {
    validateConfig(data: ServerConfig): boolean {
        throw new Error("Method not implemented.");
    }
    validateID(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    validateName(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    validateNumber(number: number): boolean {
        throw new Error("Method not implemented.");
    }
}