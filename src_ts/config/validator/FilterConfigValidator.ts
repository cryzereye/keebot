import { BaseConfigValidator } from "../interface/BaseConfigValidator";
import { FilterConfig } from "../service/FilterConfig";

export class FilterConfigValidator implements BaseConfigValidator {
    validateConfig(data: FilterConfig): boolean {
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