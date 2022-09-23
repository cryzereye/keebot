import { Config } from "./Config";

export interface BaseConfigValidator {
    validateConfig(data: Config): boolean;
    validateID(id: string): boolean;
    validateName(name: string): boolean;
    validateNumber(number: number): boolean;
}