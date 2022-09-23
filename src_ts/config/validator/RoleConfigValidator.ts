import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { RoleConfig } from "../service/RoleConfig";

export class RoleConfigValidator implements BaseConfigValidator {
    validateConfig(data: RoleConfig): boolean {
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